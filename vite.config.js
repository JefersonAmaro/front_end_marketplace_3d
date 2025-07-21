// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // Libera acesso externo via IP
    port: 5173,           // (opcional) porta padrão
    strictPort: true,     // (opcional) impede mudança de porta automática
  },
})
