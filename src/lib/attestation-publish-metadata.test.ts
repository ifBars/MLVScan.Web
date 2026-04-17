import { describe, expect, it } from "vitest"

import type { ScanResult } from "@/types/mlvscan"

import { buildAttestationPublishMetadata, toAttestationUploadMetadata } from "./attestation-publish-metadata"

type ScanResultWithAssembly = ScanResult & {
  assembly?: {
    name?: string | null
    assemblyVersion?: string | null
    fileVersion?: string | null
    informationalVersion?: string | null
    targetFramework?: string | null
    moduleRuntimeVersion?: string | null
    referencedAssemblies?: string[] | null
  } | null
}

function createScanResult(overrides: Partial<ScanResultWithAssembly> = {}): ScanResult {
  return {
    schemaVersion: "1.2.0",
    metadata: {
      scannerVersion: "1.2.3",
      coreVersion: "1.2.3",
      timestamp: "2026-04-16T00:00:00.000Z",
    },
    input: {
      fileName: "Sample.dll",
      sizeBytes: 123,
      sha256Hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    },
    summary: {
      totalFindings: 0,
      countBySeverity: {},
      triggeredRules: [],
    },
    findings: [],
    ...overrides,
  } as ScanResultWithAssembly
}

describe("attestation publish metadata", () => {
  it("detects IL2CPP assemblies from referenced assemblies and prefers informational version", () => {
    const metadata = buildAttestationPublishMetadata(createScanResult({
      assembly: {
        name: "Sample.Mod",
        assemblyVersion: "1.0.0.0",
        fileVersion: "1.0.0.4",
        informationalVersion: "1.0.0+build.4",
        targetFramework: ".NETStandard,Version=v2.1",
        moduleRuntimeVersion: "v4.0.30319",
        referencedAssemblies: ["BepInEx.Core", "Il2CppInterop.Runtime"],
      },
    }))

    expect(metadata.loaderType).toBe("detected-il2cpp")
    expect(metadata.artifactVersion).toBe("1.0.0+build.4")
    expect(toAttestationUploadMetadata(metadata)).toEqual({ loaderType: "detected-il2cpp" })
  })

  it("detects Mono assemblies from assembly references and falls back through version fields", () => {
    const metadata = buildAttestationPublishMetadata(createScanResult({
      assembly: {
        name: "Mono.Sample",
        assemblyVersion: "2.3.0.0",
        fileVersion: "2.3.0",
        informationalVersion: null,
        targetFramework: ".NETFramework,Version=v4.7.2",
        moduleRuntimeVersion: "v4.0.30319",
        referencedAssemblies: ["BepInEx.Core", "mscorlib"],
      },
    }))

    expect(metadata.loaderType).toBe("detected-mono")
    expect(metadata.artifactVersion).toBe("2.3.0")
  })

  it("returns null metadata when the assembly does not expose usable runtime hints", () => {
    const metadata = buildAttestationPublishMetadata(createScanResult())

    expect(metadata.loaderType).toBeNull()
    expect(metadata.artifactVersion).toBeNull()
    expect(toAttestationUploadMetadata(metadata)).toBeNull()
  })
})
