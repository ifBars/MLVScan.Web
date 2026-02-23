import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import path from 'path'
import fs from 'node:fs'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Resolve _framework from @mlvscan/wasm-core (npm package; same path in node_modules)
const wasmCoreDist = path.resolve(__dirname, 'node_modules/@mlvscan/wasm-core/dist')
const frameworkDir = path.join(wasmCoreDist, '_framework')

/** Serves /_framework from the npm package in dev so we don't need public/_framework */
function serveWasmFrameworkPlugin() {
  return {
    name: 'serve-wasm-framework',
    configureServer(server: { middlewares: { use: (handler: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req: { url?: string; method?: string }, res: any, next: () => void) => {
        const url = req.url ?? ''
        const pathname = url.replace(/\?.*$/, '')
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }
        const normalized = pathname
        if (!normalized.startsWith('/_framework/') && normalized !== '/_framework') {
          next()
          return
        }
        const subpath = normalized.slice('/_framework'.length) || '/'
        const filePath = path.join(frameworkDir, subpath)
        if (!filePath.startsWith(frameworkDir) || !fs.existsSync(filePath)) {
          next()
          return
        }
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          next()
          return
        }
        const ext = path.extname(filePath)
        const mime: Record<string, string> = {
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.wasm': 'application/wasm',
          '.bin': 'application/octet-stream',
          '.symbols': 'application/octet-stream',
        }
        res.setHeader('Content-Type', mime[ext] ?? 'application/octet-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.writeHead(200)
        fs.createReadStream(filePath).pipe(res)
      })
    },
  }
}

// Normalized for tinyglobby (Windows backslash)
const frameworkGlob = normalizePath(path.join(wasmCoreDist, '_framework', '**', '*'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mdx({
      remarkPlugins: [],
      rehypePlugins: [],
    }),
    serveWasmFrameworkPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: frameworkGlob,
          dest: '_framework',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/', // Root for mlvscan.com (Cloudflare Pages)
})
