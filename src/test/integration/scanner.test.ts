import { describe, it, expect, beforeAll } from 'vitest'
import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'
import { getInitError, getScannerStatus, getScannerVersion, initScanner, scanAssembly } from '@mlvscan/wasm-core'

const projectRoot = process.cwd()
const workspaceRoot = path.resolve(projectRoot, '..')
// Point to the installed package's dist folder
const wasmDistPath = path.resolve(projectRoot, 'node_modules/@mlvscan/wasm-core/dist')
// Convert to file URL for dotnet.js loading
const wasmBaseUrl = pathToFileURL(wasmDistPath).href + '/'

// DLL to scan - use env override or fallback to local path (CI has no access, test will skip)
const dllPath =
  process.env.MLVSCAN_TEST_DLL ??
  path.join(workspaceRoot, 'FALSE_POSITIVES', 'LethalLizard.ModManager.dll')

const falsePositiveCorpusRoot = path.join(workspaceRoot, 'FALSE_POSITIVES')
const falsePositiveCorpusFixtures = [
  'LethalLizard.ModManager.dll',
  'LabFusion.dll',
  'HUB.TheVeil.dll',
]
const scanTimeoutMs = 20_000

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  let handle: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    handle = setTimeout(() => {
      reject(new Error(`Timed out after ${timeoutMs}ms while scanning ${label}`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (handle) {
      clearTimeout(handle)
    }
  }
}

const getFalsePositiveCorpusDlls = (): string[] => {
  const envFixtures = process.env.MLVSCAN_FALSE_POSITIVE_DLLS
  const fixtureNames = envFixtures
    ? envFixtures.split(';').map((fixture) => fixture.trim()).filter(Boolean)
    : falsePositiveCorpusFixtures

  return fixtureNames.map((fixture) => path.join(falsePositiveCorpusRoot, fixture))
}

describe('WASM Scanner Integration', () => {
  beforeAll(async () => {
    console.log(`Initializing scanner with baseUrl: ${wasmBaseUrl}`)
    // Initialize scanner pointing to local file system
    // We explicitly set useMock to false to ensure we are testing the real WASM
    await initScanner({
      baseUrl: wasmBaseUrl,
      useMock: false
    })
  })

  it('should initialize the scanner without crashing', async () => {
    const version = await getScannerVersion()
    const status = getScannerStatus()
    console.log(`Scanner Version: ${version}`)

    expect(typeof version).toBe('string')
    expect(version.length).toBeGreaterThan(0)
    expect(status.ready).toBe(true)

    if (version.includes('mock')) {
      expect(status.isMock).toBe(true)
      expect(getInitError()).toBeTruthy()
    } else {
      expect(status.isMock).toBe(false)
      expect(version).toMatch(/\d+\.\d+\.\d+(-wasm)?/)
    }
  })

  it.skipIf(!fs.existsSync(dllPath))('should scan LethalLizard.ModManager.dll without hanging', async () => {
    // Read DLL bytes
    const dllBytes = fs.readFileSync(dllPath)
    console.log(`Read ${dllBytes.length} bytes from ${dllPath}`)
    
    // Scan
    const result = await withTimeout(
      scanAssembly(new Uint8Array(dllBytes), 'LethalLizard.ModManager.dll'),
      scanTimeoutMs,
      'LethalLizard.ModManager.dll',
    )
    
    // Log findings for debugging
    console.log(`Found ${result.findings.length} findings`)
    if (result.findings.length > 0) {
        console.log('First finding:', result.findings[0])
    }

    // Assertions
    expect(result.metadata.scannerVersion).not.toContain('mock')
    expect(result.findings).toBeDefined()
    expect(Array.isArray(result.findings)).toBe(true)
    
    // Verify specific finding if possible (optional, but good for "LethalLizard" check)
    // Assuming LethalLizard has some known findings like "Suspicious string" or similar
  }, scanTimeoutMs + 5_000) // Increase timeout for WASM loading/scanning

  it.skipIf(!fs.existsSync(falsePositiveCorpusRoot))('should scan representative FALSE_POSITIVES DLLs without timing out', async () => {
    const dllPaths = getFalsePositiveCorpusDlls()
    expect(dllPaths.length).toBeGreaterThan(0)

    for (const fixturePath of dllPaths) {
      expect(fs.existsSync(fixturePath), `${fixturePath} should exist`).toBe(true)

      const fileName = path.basename(fixturePath)
      const startedAt = performance.now()
      const dllBytes = fs.readFileSync(fixturePath)
      const result = await withTimeout(
        scanAssembly(new Uint8Array(dllBytes), fileName),
        scanTimeoutMs,
        path.relative(falsePositiveCorpusRoot, fixturePath),
      )
      const elapsedMs = Math.round(performance.now() - startedAt)

      console.log(`Scanned ${fileName} in ${elapsedMs}ms with ${result.findings.length} findings`)
      expect(result.metadata.scannerVersion).not.toContain('mock')
      expect(result.input.fileName).toBe(fileName)
      expect(Array.isArray(result.findings)).toBe(true)
    }
  }, (scanTimeoutMs + 5_000) * falsePositiveCorpusFixtures.length)
})
