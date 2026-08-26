import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // Drive icon color from CSS `color`: the exported tab icons hardcode a
    // stroke (#B4B4BD), so map it to currentColor for active/inactive states.
    svgr({ svgrOptions: { replaceAttrValues: { '#B4B4BD': 'currentColor' } } }),
  ],
  resolve: {
    alias: {
      // Resolve the shared workspace to its TS source so Vite transpiles it
      // (a bundled workspace pkg would otherwise be skipped inside node_modules).
      '@nudge/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url)),
    },
  },
})
