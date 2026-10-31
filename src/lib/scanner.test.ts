import { describe, it, expect } from 'vitest';
import { initScanner, scanAssembly, isPlaceholderScanResult, isScannerUnavailableError, ScannerUnavailableError } from './scanner';
import type { ScanResult } from '@/types/mlvscan';
import * as fs from 'fs';
import * as path from 'path';

// The .NET runtime cannot load under jsdom, which is exactly the "scanner unavailable" case.
// Real WASM scans are covered by src/test/integration/scanner.test.ts.
describe('scanner when the WASM runtime cannot load', () => {
  it('rejects initialization instead of falling back to a placeholder scanner', async () => {
    await expect(initScanner()).rejects.toBeInstanceOf(ScannerUnavailableError);
  });

  it('never returns a result for a file it could not scan', async () => {
    const bytes = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]);
    const outcome = await scanAssembly(bytes, 'test.dll').then(() => 'resolved', (error: unknown) => error);
    expect(outcome).not.toBe('resolved');
    expect(isScannerUnavailableError(outcome)).toBe(true);
  });

  it('tells the user the file was not scanned', () => {
    expect(new ScannerUnavailableError().message).toMatch(/not scanned/i);
  });
});

describe('placeholder result detection', () => {
  const real = { metadata: { scannerVersion: '1.9.2', coreVersion: '1.9.2' }, analysisCompleteness: { reasons: [] } } as unknown as ScanResult;

  it('accepts a real scanner result', () => {
    expect(isPlaceholderScanResult(real)).toBe(false);
  });

  it('flags mock versions and the MockScanner completeness reason', () => {
    expect(isPlaceholderScanResult({ ...real, metadata: { ...real.metadata, scannerVersion: '1.0.0-mock' } } as ScanResult)).toBe(true);
    expect(isPlaceholderScanResult({ ...real, metadata: { ...real.metadata, coreVersion: '1.0.0-mock' } } as ScanResult)).toBe(true);
    expect(isPlaceholderScanResult({ ...real, analysisCompleteness: { reasons: [{ reasonId: 'MockScanner' }] } } as unknown as ScanResult)).toBe(true);
    expect(isPlaceholderScanResult(null)).toBe(true);
  });
});

describe('WASM build file validation', () => {
  // _framework comes from @mlvscan/wasm-core npm package, not public/
  const frameworkPath = path.resolve(__dirname, '../../node_modules/@mlvscan/wasm-core/dist/_framework');

  function fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  describe('required WASM files', () => {
    it('should have MLVScan.WASM.wasm', () => {
      const wasmPath = path.join(frameworkPath, 'MLVScan.WASM.wasm');
      expect(fileExists(wasmPath)).toBe(true);
    });

    it('should have MLVScan.Core.wasm', () => {
      const wasmPath = path.join(frameworkPath, 'MLVScan.Core.wasm');
      expect(fileExists(wasmPath)).toBe(true);
    });

    it('should have Mono.Cecil.wasm', () => {
      const wasmPath = path.join(frameworkPath, 'Mono.Cecil.wasm');
      expect(fileExists(wasmPath)).toBe(true);
    });

    it('should have dotnet.runtime.js', () => {
      const jsPath = path.join(frameworkPath, 'dotnet.runtime.js');
      expect(fileExists(jsPath)).toBe(true);
    });

    it('should have dotnet.native.wasm', () => {
      const wasmPath = path.join(frameworkPath, 'dotnet.native.wasm');
      expect(fileExists(wasmPath)).toBe(true);
    });
  });

  describe('blazor.boot.json validation', () => {
    it('should exist and be valid JSON', () => {
      const bootJsonPath = path.join(frameworkPath, 'blazor.boot.json');
      expect(fileExists(bootJsonPath)).toBe(true);
      
      const content = fs.readFileSync(bootJsonPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have correct mainAssemblyName', () => {
      const bootJsonPath = path.join(frameworkPath, 'blazor.boot.json');
      const content = fs.readFileSync(bootJsonPath, 'utf-8');
      const bootConfig = JSON.parse(content);
      
      expect(bootConfig.mainAssemblyName).toBe('MLVScan.WASM.dll');
    });

    it('should include MLVScan.WASM.wasm in assemblies', () => {
      const bootJsonPath = path.join(frameworkPath, 'blazor.boot.json');
      const content = fs.readFileSync(bootJsonPath, 'utf-8');
      const bootConfig = JSON.parse(content);
      
      expect(bootConfig.resources.assembly['MLVScan.WASM.wasm']).toBeDefined();
    });

    it('should include MLVScan.Core.wasm in assemblies', () => {
      const bootJsonPath = path.join(frameworkPath, 'blazor.boot.json');
      const content = fs.readFileSync(bootJsonPath, 'utf-8');
      const bootConfig = JSON.parse(content);
      
      expect(bootConfig.resources.assembly['MLVScan.Core.wasm']).toBeDefined();
    });
  });
});
