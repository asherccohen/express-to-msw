import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node20', // or any other version you're targeting, e.g., 'node16', 'node18'
    outDir: 'dist',
    lib: {
      entry: 'src/main.ts',
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: ['commander'], // Add any other external dependencies
    },
  },
});
