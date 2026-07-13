import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Explicitly tells Vercel where the compiled files go
    emptyOutDir: true, // Cleans up old files before building
  }
})