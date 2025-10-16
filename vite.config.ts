import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/saas-revenue-projection-calculator/',
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    copyPublicDir: true
  }})
