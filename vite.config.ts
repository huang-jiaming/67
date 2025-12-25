import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/67/',  // GitHub Pages subpath for repo name
  server: {
    port: 3000
  }
})

