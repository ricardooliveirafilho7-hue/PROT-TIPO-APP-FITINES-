import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// O protótipo é distribuído como um único arquivo HTML autocontido:
// não depende de CDN, fonte externa, backend ou rede.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    reportCompressedSize: false,
  },
});
