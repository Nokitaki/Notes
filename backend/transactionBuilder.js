// backend/transactionBuilder.js (FULLY FIXED VERSION)
// Build and submit REAL Cardano blockchain transactions

require("dotenv").config();
const { BlockFrostAPI } = require("@blockfrost/blockfrost-js");
const CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
const walletManager = require("./walletUtils");

class TransactionBuilder {
  constructor() {
    this.API = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY,
      network: "preprod",
    });

    this.walletAddress = process.env.PROJECT_WALLET_ADDRESS;

    console.log("Transaction Builder initialized");
  }

  async getWalletUtxos() {
    try {
      const utxos = await this.API.addressesUtxos(this.walletAddress);

      if (utxos.length === 0) {
        throw new Error("No UTXOs found! Wallet might be empty.");
      }

      console.log(`Found ${utxos.length} UTXOs`);
      return utxos;
    } catch (error) {
      console.error("Error fetching UTXOs:", error.message);
      throw error;
    }
  }

  async getProtocolParameters() {
    try {
      const latest = await this.API.epochsLatestParameters();
      return latest;
    } catch (error) {
      console.error("Error fetching protocol parameters:", error.message);
      throw error;
    }
  }

  createLinearFee(protocolParams) {
    return CardanoWasm.LinearFee.new(
      CardanoWasm.BigNum.from_str(protocolParams.min_fee_a.toString()),
      CardanoWasm.BigNum.from_str(protocolParams.min_fee_b.toString())
    );
  }

  createTxBuilderConfig(protocolParams) {
    return CardanoWasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(this.createLinearFee(protocolParams))
      .pool_deposit(CardanoWasm.BigNum.from_str(protocolParams.pool_deposit))
      .key_deposit(CardanoWasm.BigNum.from_str(protocolParams.key_deposit))
      .max_value_size(parseInt(protocolParams.max_val_size))
      .max_tx_size(protocolParams.max_tx_size)
      .coins_per_utxo_byte(
        CardanoWasm.BigNum.from_str(protocolParams.coins_per_utxo_size)
      )
      .build();
  }

  /**
   * Create auxiliary data with metadata
   */
  createMetadata(metadata) {
    try {
      const generalMetadata = CardanoWasm.GeneralTransactionMetadata.new();

      // Create metadata JSON
      const metadataJson = {
        operation: metadata.operation,
        noteId: metadata.noteId,
        title: metadata.title.substring(0, 64),
        contentHash: metadata.contentHash || "",
        userId: metadata.userId,
        timestamp: Date.now(),
        app: "NotesApp",
      };

      // Encode to metadatum
      const metadatum = CardanoWasm.encode_json_str_to_metadatum(
        JSON.stringify(metadataJson),
        CardanoWasm.MetadataJsonSchema.BasicConversions
      );

      // Add to metadata (label 721)
      generalMetadata.insert(CardanoWasm.BigNum.from_str("721"), metadatum);

      // Create auxiliary data
      const auxData = CardanoWasm.AuxiliaryData.new();
      auxData.set_metadata(generalMetadata);

      return auxData;
    } catch (error) {
      console.error("âŒ Error creating metadata:", error.message);
      throw error;
    }
  }

  /**
   * Build transaction with metadata (FIXED VERSION)
   */
  async buildTransaction(metadata) {
    try {
      console.log("\Building transaction...");

      // 1. Get UTXOs and protocol params
      const utxos = await this.getWalletUtxos();
      const protocolParams = await this.getProtocolParameters();

      // 2. Create auxiliary data FIRST
      const auxData = this.createMetadata(metadata);
      const auxDataHash = CardanoWasm.hash_auxiliary_data(auxData);

      console.log(
        "   Metadata hash:",
        Buffer.from(auxDataHash.to_bytes()).toString("hex").substring(0, 20) +
          "..."
      );

      // 3. Create transaction builder config
      const txBuilderConfig = this.createTxBuilderConfig(protocolParams);
      const txBuilder = CardanoWasm.TransactionBuilder.new(txBuilderConfig);

      // 4. Get wallet address
      const shelleyAddress = CardanoWasm.Address.from_bech32(
        this.walletAddress
      );

      // 5. Add the first UTXO as input
      const utxo = utxos[0];
      const lovelaceAmount = utxo.amount.find(
        (a) => a.unit === "lovelace"
      ).quantity;

      const txHash = CardanoWasm.TransactionHash.from_bytes(
        Buffer.from(utxo.tx_hash, "hex")
      );
      const txInput = CardanoWasm.TransactionInput.new(txHash, utxo.tx_index);
      const inputValue = CardanoWasm.Value.new(
        CardanoWasm.BigNum.from_str(lovelaceAmount)
      );

      const txUnspentOutput = CardanoWasm.TransactionUnspentOutput.new(
        txInput,
        CardanoWasm.TransactionOutput.new(shelleyAddress, inputValue)
      );

      const unspentOutputs = CardanoWasm.TransactionUnspentOutputs.new();
      unspentOutputs.add(txUnspentOutput);

      console.log("   Input amount:", lovelaceAmount, "lovelace");

      // 6. Get current slot for TTL
      const currentSlot = await this.getCurrentSlot();
      const ttl = currentSlot + 3600; // 1 hour

      console.log("   Current slot:", currentSlot);
      console.log("   TTL slot:", ttl);

      // 7. Add inputs
      txBuilder.add_inputs_from(
        unspentOutputs,
        CardanoWasm.CoinSelectionStrategyCIP2.LargestFirstMultiAsset
      );

      // 8. Set TTL using bignum methods
      txBuilder.set_ttl_bignum(CardanoWasm.BigNum.from_str(ttl.toString()));

      // 9. Set auxiliary data
      txBuilder.set_auxiliary_data(auxData);

      // 10. Add change output
      txBuilder.add_change_if_needed(shelleyAddress);

      // 11. Build transaction body
      const txBody = txBuilder.build();

      const fee = txBody.fee();
      const actualTTL = txBody.ttl();

      console.log("Transaction built successfully");
      console.log("   Inputs:", txBody.inputs().len());
      console.log("   Outputs:", txBody.outputs().len());
      console.log(
        "   Fee:",
        fee.to_str(),
        "lovelace (~" + (parseInt(fee.to_str()) / 1000000).toFixed(3) + " ADA)"
      );
      console.log("   TTL:", actualTTL && typeof actualTTL.to_str === "function" ? actualTTL.to_str() : (actualTTL || "NOT SET"));
      console.log(
        "   Aux data hash:",
        txBody.auxiliary_data_hash() ? "SET" : "NOT SET"
      );

      return {
        txBody,
        auxData,
      };
    } catch (error) {
      console.error("Error building transaction:", error.message);
      console.error("Stack:", error.stack);
      throw error;
    }
  }

  async getCurrentSlot() {
    try {
      const latestBlock = await this.API.blocksLatest();
      return latestBlock.slot;
    } catch (error) {
      console.error("Error getting current slot:", error.message);
      throw error;
    }
  }

  async signAndSubmit(txBody, auxData) {
    try {
      console.log("\Signing transaction...");

      // 1. Sign transaction (returns witness set)
      const witnessSet = walletManager.signTransaction(txBody);

      // 2. Create final transaction with auxiliary data
      const transaction = CardanoWasm.Transaction.new(
        txBody,
        witnessSet,
        auxData
      );

      // 3. Get transaction bytes
      const txBytes = transaction.to_bytes();

      console.log("   Transaction size:", txBytes.length, "bytes");
      console.log("Submitting to blockchain...");

      // 4. Submit to blockchain
      const txHash = await this.API.txSubmit(txBytes);

      console.log("Transaction submitted!");
      console.log("   TX Hash:", txHash);

      return txHash;
    } catch (error) {
      console.error("Error submitting transaction:", error.message);

      if (error.message.includes("OutsideValidityIntervalUTxO")) {
        console.error("TTL expired. Try again immediately.");
      } else if (error.message.includes("BadInputsUTxO")) {
        console.error("UTXOs already spent. Wait a moment and retry.");
      } else if (error.message.includes("ValueNotConservedUTxO")) {
        console.error("Fee calculation error.");
      }

      throw error;
    }
  }

  async createNoteTransaction(operation, noteData, userId) {
    try {
      console.log(
        `\n— Creating ${operation} transaction for note "${noteData.title}"`
      );

      // 1. Generate content hash
      const crypto = require("crypto");
      const contentHash = noteData.content
        ? crypto.createHash("sha256").update(noteData.content).digest("hex")
        : null;

      // 2. Prepare metadata
      const metadata = {
        operation: operation,
        noteId: noteData.id,
        title: noteData.title.substring(0, 64),
        contentHash: contentHash,
        userId: userId,
      };

      // 3. Build transaction
      const { txBody, auxData } = await this.buildTransaction(metadata);

      // 4. Sign and submit
      const txHash = await this.signAndSubmit(txBody, auxData);

      // 5. Return result
      return {
        success: true,
        txHash: txHash,
        contentHash: contentHash,
        metadata: metadata,
        timestamp: Date.now(),
        explorer: `https://preprod.cardanoscan.io/transaction/${txHash}`,
      };
    } catch (error) {
      console.error("Transaction failed:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async checkTransaction(txHash) {
    try {
      const tx = await this.API.txs(txHash);
      return {
        found: true,
        confirmations: tx.block_height ? "Confirmed" : "Pending",
        blockHeight: tx.block_height,
        slot: tx.slot,
        fees: tx.fees,
      };
    } catch (error) {
      if (error.status_code === 404) {
        return {
          found: false,
          message: "Transaction not found yet (may still be processing)",
        };
      }
      throw error;
    }
  }
}

module.exports = new TransactionBuilder();