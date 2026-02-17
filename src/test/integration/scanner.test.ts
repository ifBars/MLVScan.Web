import { describe, it, expect, beforeAll } from 'vitest'
import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'
import { initScanner, scanAssembly, getScannerVersion } from '@mlvscan/wasm-core'

const projectRoot = process.cwd()
// Point to the installed package's dist folder
const wasmDistPath = path.resolve(projectRoot, 'node_modules/@mlvscan/wasm-core/dist')
// Convert to file URL for dotnet.js loading
const wasmBaseUrl = pathToFileURL(wasmDistPath).href + '/'

// DLL to scan
const dllPath = String.raw`C:\Users\ghost\Desktop\Coding\ScheduleOne\MLVScan.Core\FALSE_POSITIVES\LethalLizard.ModManager.dll`

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

  it('should verify scanner version is NOT mock', async () => {
    const version = await getScannerVersion()
    console.log(`Scanner Version: ${version}`)
    
    // Assert version is not mock and looks like a real version
    expect(version).not.toContain('mock')
    expect(version).toMatch(/\d+\.\d+\.\d+(-wasm)?/)
  })

  it('should scan LethalLizard.ModManager.dll and find issues', async () => {
    // Ensure DLL exists
    if (!fs.existsSync(dllPath)) {
      throw new Error(`Test DLL not found at: ${dllPath}`)
    }

    // Read DLL bytes
    const dllBytes = fs.readFileSync(dllPath)
    console.log(`Read ${dllBytes.length} bytes from ${dllPath}`)
    
    // Scan
    const result = await scanAssembly(new Uint8Array(dllBytes), 'LethalLizard.ModManager.dll')
    
    // Log findings for debugging
    console.log(`Found ${result.findings.length} findings`)
    if (result.findings.length > 0) {
        console.log('First finding:', result.findings[0])
    }

    // Assertions
    expect(result.metadata.scannerVersion).not.toContain('mock')
    
    // Verify we have findings
    expect(result.findings.length).toBeGreaterThan(0)
    
    // Verify we have at least one Low severity finding (as requested)
    const hasLow = result.findings.some(f => f.severity === 'Low')
    expect(hasLow).toBe(true)
    
    // Verify specific finding if possible (optional, but good for "LethalLizard" check)
    // Assuming LethalLizard has some known findings like "Suspicious string" or similar
  }, 30000) // Increase timeout for WASM loading/scanning
})
