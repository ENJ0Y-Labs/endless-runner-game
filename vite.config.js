import { defineConfig } from 'vite'
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Start.ng serves dist/ as a plain static site with no SPA fallback, so /backyard
// needs a real file. Emit dist/backyard/index.html (same app, <base href="/"> so the
// relative ./assets/... URLs still resolve from the site root) plus the admin page
// that the in-app nav links to at /backyard/admin/.
function backyardRoute() {
  let outDir = 'dist'
  return {
    name: 'backyard-route',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const html = readFileSync(join(outDir, 'index.html'), 'utf8')
      const withBase = html.replace(/<head>/i, '<head>\n    <base href="/" />')
      const dir = join(outDir, 'backyard')
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'index.html'), withBase)
      cpSync(join(outDir, 'admin'), join(dir, 'admin'), { recursive: true })
      cpSync(join(outDir, 'admin-config.js'), join(dir, 'admin-config.js'))
    },
  }
}

// Relative base keeps the committed dist/ working from any static host path (Start.ng included).
export default defineConfig({
  base: './',
  plugins: [backyardRoute()],
  build: { chunkSizeWarningLimit: 700 },
})
