// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MeshProvider } from '@meshsdk/react'; // Import MeshProvider
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MeshProvider>
      <App />
    </MeshProvider>
  </StrictMode>,
);