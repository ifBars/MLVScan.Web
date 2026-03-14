import { defineConfig, normalizePath, type Plugin, type ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import path from 'path'
import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Resolve _framework from @mlvscan/wasm-core (npm package; same path in node_modules)
const wasmCoreDist = path.resolve(__dirname, 'node_modules/@mlvscan/wasm-core/dist')
const frameworkDir = path.join(wasmCoreDist, '_framework')
const coreSchemaFile = path.resolve(__dirname, '../MLVScan.Core/schema/mlvscan-result.schema.json')
const schemaAssetPath = getSchemaAssetPath(coreSchemaFile)
const schemaPublicPath = `/${schemaAssetPath}`

/** Serves /_framework from the npm package in dev so we don't need public/_framework */
function serveWasmFrameworkPlugin(): Plugin {
  return {
    name: 'serve-wasm-framework',
    configureServer(server: { middlewares: { use: (handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use((req: IncomingMessage & { url?: string; method?: string }, res: ServerResponse, next: () => void) => {
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

function serveCoreSchemaPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig | null = null

  return {
    name: 'serve-core-schema',
    configResolved(config) {
      resolvedConfig = config
    },
    configureServer(server: { middlewares: { use: (handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use((req: IncomingMessage & { url?: string; method?: string }, res: ServerResponse, next: () => void) => {
        const url = req.url ?? ''
        const pathname = url.replace(/\?.*$/, '')

        if ((req.method !== 'GET' && req.method !== 'HEAD') || pathname !== schemaPublicPath) {
          next()
          return
        }

        if (!fs.existsSync(coreSchemaFile)) {
          next()
          return
        }

        res.setHeader('Content-Type', 'application/schema+json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.writeHead(200)
        res.end(fs.readFileSync(coreSchemaFile))
      })
    },
    writeBundle() {
      if (resolvedConfig === null) {
        throw new Error('Vite config was not resolved before writing schema asset')
      }

      if (!fs.existsSync(coreSchemaFile)) {
        return
      }

      const outputPath = path.resolve(resolvedConfig.root, resolvedConfig.build.outDir, schemaAssetPath)
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.copyFileSync(coreSchemaFile, outputPath)
    },
  }
}

function getSchemaAssetPath(schemaFilePath: string): string {
  if (!fs.existsSync(schemaFilePath)) {
    return 'schema/mlvscan-result.schema.json'
  }

  const schema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8')) as { $id?: string }
  if (!schema.$id) {
    return 'schema/mlvscan-result.schema.json'
  }

  try {
    const schemaUrl = new URL(schema.$id)
    return schemaUrl.pathname.replace(/^\/+/, '')
  } catch {
    return 'schema/mlvscan-result.schema.json'
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
    serveCoreSchemaPlugin(),
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
