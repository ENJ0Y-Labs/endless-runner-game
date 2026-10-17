import { defineConfig } from 'vite'

// Relative base keeps the committed dist/ working from any static host path (Start.ng included).
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 700 },
})
