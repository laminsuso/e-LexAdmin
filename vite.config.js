import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // ✅ Ensures `window` and `document` exist
    setupFiles: './src/testSetup.js', // ✅ Runs our setup before tests
  },
});
