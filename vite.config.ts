import { defineConfig, loadEnv, normalizePath, type Plugin, type ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import path from 'path'
import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { buildRobotsTxt, buildSitemapXml, injectSeoIntoHtml } from './src/seo/site'
import { getStaticSeoPages } from './src/seo/routes'

const wasmCoreDist = path.resolve(__dirname, 'node_modules/@mlvscan/wasm-core/dist')
const frameworkDir = path.join(wasmCoreDist, '_framework')
const coreSchemaFile = path.resolve(__dirname, '../MLVScan.Core/schema/mlvscan-result.schema.json')
const schemaAssetPath = getSchemaAssetPath(coreSchemaFile)
const schemaPublicPath = `/${schemaAssetPath}`
const generatedReferenceDocs = [
  {
    name: 'core',
    mountPath: '/docs/reference/core',
    sourceDir: path.resolve(__dirname, '.generated/reference/core'),
  },
  {
    name: 'wasm',
    mountPath: '/docs/reference/wasm',
    sourceDir: path.resolve(__dirname, '.generated/reference/wasm'),
  },
]

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

        if (!pathname.startsWith('/_framework/') && pathname !== '/_framework') {
          next()
          return
        }

        const subpath = pathname.slice('/_framework'.length) || '/'
        const filePath = resolveStaticRequest(frameworkDir, subpath)
        if (filePath === null) {
          next()
          return
        }

        serveFile(filePath, res)
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
      if (resolvedConfig === null || !fs.existsSync(coreSchemaFile)) {
        return
      }

      const outputPath = path.resolve(resolvedConfig.root, resolvedConfig.build.outDir, schemaAssetPath)
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.copyFileSync(coreSchemaFile, outputPath)
    },
  }
}

function generatedReferenceDocsPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig | null = null

  return {
    name: 'generated-reference-docs',
    configResolved(config) {
      resolvedConfig = config
    },
    configureServer(server: { middlewares: { use: (handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use((req: IncomingMessage & { url?: string; method?: string }, res: ServerResponse, next: () => void) => {
        const url = req.url ?? ''
        const pathname = url.replace(/\?.*$/, '')

        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }

        for (const generatedDoc of generatedReferenceDocs) {
          if (!pathname.startsWith(`${generatedDoc.mountPath}/`) && pathname !== generatedDoc.mountPath) {
            continue
          }

          const subpath = pathname.slice(generatedDoc.mountPath.length) || '/'
          const filePath = resolveStaticRequest(generatedDoc.sourceDir, subpath)
          if (filePath === null) {
            continue
          }

          serveFile(filePath, res)
          return
        }

        next()
      })
    },
    writeBundle() {
      if (resolvedConfig === null) {
        return
      }

      for (const generatedDoc of generatedReferenceDocs) {
        if (!fs.existsSync(generatedDoc.sourceDir)) {
          continue
        }

        const outputPath = path.resolve(
          resolvedConfig.root,
          resolvedConfig.build.outDir,
          generatedDoc.mountPath.replace(/^\/+/, ''),
        )

        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
        fs.cpSync(generatedDoc.sourceDir, outputPath, { recursive: true, force: true })
      }
    },
  }
}

function staticSeoPagesPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig | null = null

  return {
    name: 'static-seo-pages',
    configResolved(config) {
      resolvedConfig = config
    },
    closeBundle() {
      if (resolvedConfig === null) {
        return
      }

      const outDir = path.resolve(resolvedConfig.root, resolvedConfig.build.outDir)
      const indexHtmlPath = path.join(outDir, 'index.html')

      if (!fs.existsSync(indexHtmlPath)) {
        return
      }

      const template = fs.readFileSync(indexHtmlPath, 'utf8')
      const pages = getStaticSeoPages()

      for (const page of pages) {
        const html = injectSeoIntoHtml(template, page)
        const outputPath =
          page.path === '/'
            ? indexHtmlPath
            : path.join(outDir, page.path.replace(/^\/+/, ''), 'index.html')

        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
        fs.writeFileSync(outputPath, html)
      }

      fs.writeFileSync(path.join(outDir, 'robots.txt'), buildRobotsTxt(), 'utf8')
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), buildSitemapXml(pages), 'utf8')
    },
  }
}

function resolveStaticRequest(rootDir: string, requestSubpath: string): string | null {
  if (!fs.existsSync(rootDir)) {
    return null
  }

  const relativePath = requestSubpath.replace(/^\/+/, '')
  let targetPath = path.resolve(rootDir, relativePath)

  if (!targetPath.startsWith(rootDir)) {
    return null
  }

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    targetPath = path.join(targetPath, 'index.html')
  } else if (!fs.existsSync(targetPath)) {
    const indexCandidate = path.join(rootDir, relativePath, 'index.html')
    if (indexCandidate.startsWith(rootDir) && fs.existsSync(indexCandidate)) {
      targetPath = indexCandidate
    }
  }

  if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
    return null
  }

  return targetPath
}

function serveFile(filePath: string, res: ServerResponse): void {
  res.setHeader('Content-Type', getMimeType(filePath))
  res.setHeader('Cache-Control', 'no-cache')
  res.writeHead(200)
  fs.createReadStream(filePath).pipe(res)
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath)
  const mime: Record<string, string> = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.wasm': 'application/wasm',
    '.bin': 'application/octet-stream',
    '.png': 'image/png',
    '.symbols': 'application/octet-stream',
  }

  return mime[ext] ?? 'application/octet-stream'
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

const frameworkGlob = normalizePath(path.join(wasmCoreDist, '_framework', '**', '*'))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const partnerApiProxyTarget = env.PARTNER_API_PROXY_TARGET || 'http://localhost:8787'

  return {
    plugins: [
      react(),
      tailwindcss(),
      mdx({
        remarkPlugins: [],
        rehypePlugins: [],
      }),
      serveWasmFrameworkPlugin(),
      serveCoreSchemaPlugin(),
      generatedReferenceDocsPlugin(),
      staticSeoPagesPlugin(),
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
    server: {
      proxy: {
        '/partner': {
          target: partnerApiProxyTarget,
          changeOrigin: true,
        },
        '/files': {
          target: partnerApiProxyTarget,
          changeOrigin: true,
        },
        '/reports': {
          target: partnerApiProxyTarget,
          changeOrigin: true,
        },
        '/public/attestations': {
          target: partnerApiProxyTarget,
          changeOrigin: true,
        },
        '^/attestations/[^/]+/badge\\.svg$': {
          target: partnerApiProxyTarget,
          changeOrigin: true,
          rewrite: (requestPath) =>
            requestPath.replace(
              /^\/attestations\/([^/]+)\/badge\.svg$/,
              "/public/attestations/$1/badge.svg",
            ),
        },
      },
    },
    base: '/',
  }
})
