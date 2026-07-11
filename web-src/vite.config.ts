import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    outDir: '../web',
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/main.ts'),
      output: {
        format: 'iife',
        entryFileNames: 'popup.js',
        assetFileNames: (assetInfo) => {
          console.log("ASSET INFO:", assetInfo);
          if (assetInfo.name?.endsWith('.css') || assetInfo.names?.[0]?.endsWith('.css')) return 'popup.css';
          return '[name]-[hash][extname]';
        }
      }
    }
  }
})
