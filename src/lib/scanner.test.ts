import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scanAssembly, initScanner, isScannerReady, getScannerVersion, getSchemaVersion } from './scanner';
import type { ScanResult } from '@/types/mlvscan';
import * as fs from 'fs';
import * as path from 'path';

describe('scanner', () => {
  describe('initScanner', () => {
    it('should initialize scanner successfully', async () => {
      await initScanner();
      expect(isScannerReady()).toBe(true);
    });

    it('should only initialize once', async () => {
      await initScanner();
      const firstCall = isScannerReady();
      await initScanner();
      const secondCall = isScannerReady();
      expect(firstCall).toBe(secondCall);
    });
  });

  describe('getScannerVersion', () => {
    it('should return a version string', async () => {
      const version = await getScannerVersion();
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });
  });

  describe('getSchemaVersion', () => {
    it('should return a version string', async () => {
      const version = await getSchemaVersion();
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });
  });

  describe('scanAssembly', () => {
    it('should return a valid ScanResult when WASM is available', async () => {
      await initScanner();
      
      const mockDllBytes = new Uint8Array([
        0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00
      ]);
      
      const result = await scanAssembly(mockDllBytes, 'test.dll') as ScanResult;
      
      expect(result).toBeDefined();
      expect(result.schemaVersion).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.input).toBeDefined();
      expect(result.input.fileName).toBe('test.dll');
      expect(result.summary).toBeDefined();
      expect(Array.isArray(result.findings)).toBe(true);
    });

    it('should include metadata with scanner version', async () => {
      await initScanner();
      
      const mockDllBytes = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]);
      const result = await scanAssembly(mockDllBytes, 'metadata-test.dll') as ScanResult;
      
      expect(result.metadata).toBeDefined();
      expect(result.metadata.scannerVersion).toBeDefined();
      expect(result.metadata.platform).toBe('wasm');
    });

    it('should handle empty bytes gracefully', async () => {
      await initScanner();
      
      const emptyBytes = new Uint8Array(0);
      const result = await scanAssembly(emptyBytes, 'empty.dll') as ScanResult;
      
      expect(result).toBeDefined();
      expect(result.input.fileName).toBe('empty.dll');
    });

    it('should track findings count in summary', async () => {
      await initScanner();
      
      const mockDllBytes = new Uint8Array(1024);
      const result = await scanAssembly(mockDllBytes, 'summary-test.dll') as ScanResult;
      
      expect(result.summary).toBeDefined();
      expect(typeof result.summary.totalFindings).toBe('number');
      expect(result.summary.countBySeverity).toBeDefined();
      expect(Array.isArray(result.summary.triggeredRules)).toBe(true);
    });
  });

  describe('WASM Integration', () => {
    it('should have scanner exports available after init', async () => {
      await initScanner();
      expect(isScannerReady()).toBe(true);
    });

    it('should be able to get version after init', async () => {
      await initScanner();
      const version = await getScannerVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });
});

describe('scanner error handling', () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  it('should handle invalid file data gracefully', async () => {
    await initScanner();
    
    const invalidBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    const result = await scanAssembly(invalidBytes, 'invalid.dll') as ScanResult;
    
    expect(result).toBeDefined();
    expect(result.input.fileName).toBe('invalid.dll');
    expect(result.findings).toBeDefined();
  });
});

describe('WASM build file validation', () => {
  const frameworkPath = path.resolve(__dirname, '../../public/_framework');

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

  describe('required DLL files', () => {
    it('should have MLVScan.WASM.dll', () => {
      const dllPath = path.join(frameworkPath, 'MLVScan.WASM.dll');
      expect(fileExists(dllPath)).toBe(true);
    });

    it('should have MLVScan.Core.dll', () => {
      const dllPath = path.join(frameworkPath, 'MLVScan.Core.dll');
      expect(fileExists(dllPath)).toBe(true);
    });

    it('should have Mono.Cecil.dll', () => {
      const dllPath = path.join(frameworkPath, 'Mono.Cecil.dll');
      expect(fileExists(dllPath)).toBe(true);
    });

    it('should have MLVScan.WASM.deps.json', () => {
      const jsonPath = path.join(frameworkPath, 'MLVScan.WASM.deps.json');
      expect(fileExists(jsonPath)).toBe(true);
    });

    it('should have MLVScan.WASM.runtimeconfig.json', () => {
      const jsonPath = path.join(frameworkPath, 'MLVScan.WASM.runtimeconfig.json');
      expect(fileExists(jsonPath)).toBe(true);
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
