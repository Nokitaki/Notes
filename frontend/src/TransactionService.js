// frontend/src/TransactionService.js
import { Blaze, Blockfrost, WebWallet, Core } from '@blaze-cardano/sdk';

// 1. Setup Provider (Blockfrost)
const provider = new Blockfrost({
    network: 'cardano-preview',
    projectId: import.meta.env.VITE_BLOCKFROST_ID,
});

// Helper: Chunk string into 64-byte pieces
// Source: Notes Final.pdf (Page 3-4)
const formatContent = (content) => {
    if (!content) return Core.Metadatum.newText("");
    
    if (content.length <= 64) {
        return Core.Metadatum.newText(content);
    }

    const chunks = content.match(/.{1,64}/g) || [];
    // FIX: Use 'new' constructor as per PDF [cite: 90]
    const list = new Core.MetadatumList(); 
    chunks.forEach(chunk => {
        list.add(Core.Metadatum.newText(chunk));
    });
    return Core.Metadatum.newList(list);
};

export const TransactionService = {
    submitNote: async (walletApi, noteData, action) => {
        console.log("🚀 Starting Transaction Build...");
        
        const wallet = new WebWallet(walletApi);
        const blaze = await Blaze.from(provider, wallet);

        // 2. Prepare Metadata
        // Source: Notes Final.pdf (Page 2-3)
        const label = 42819n;
        
        // FIX 1: Inner map must be Core.MetadatumMap, NOT a JS Map [cite: 36]
        const innerMap = new Core.MetadatumMap();
        
        // FIX 2: Use .insert() instead of .set() [cite: 40]
        innerMap.insert(
            Core.Metadatum.newText("action"),
            Core.Metadatum.newText(action)
        );

        const contentToSend = action === 'DELETE' ? "Deleted Note" : noteData.content;
        innerMap.insert(
            Core.Metadatum.newText("note"),
            formatContent(contentToSend)
        );

        innerMap.insert(
            Core.Metadatum.newText("title"),
            Core.Metadatum.newText(noteData.title.substring(0, 64))
        );

        innerMap.insert(
            Core.Metadatum.newText("updated_at"),
            Core.Metadatum.newText(new Date().toISOString())
        );

        if (noteData.id) {
            innerMap.insert(
                Core.Metadatum.newText("ref_id"),
                Core.Metadatum.newText(noteData.id.toString())
            );
        }

        // FIX 3: Outer map is a JS Map<BigInt, Metadatum> [cite: 30, 64]
        const metadataMap = new Map();
        metadataMap.set(label, Core.Metadatum.newMap(innerMap));
        
        const metadata = new Core.Metadata(metadataMap);

        // 3. Build Transaction
        const myAddress = await blaze.wallet.getChangeAddress();
        
        const tx = await blaze
            .newTransaction()
            .payLovelace(myAddress, 1500000n) // Send 1.5 ADA to self to carry metadata
            .setMetadata(metadata)
            .complete();

        // 4. Sign Transaction
        const signedTx = await blaze.signTransaction(tx);

        // 5. Submit to Chain
        const txHash = await blaze.provider.postTransactionToChain(signedTx);
        
        console.log("✅ Transaction Submitted: ", txHash);
        return txHash;
    }
};