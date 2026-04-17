import type { ScanResult } from "@/types/mlvscan"

interface AssemblyMetadataLike {
  assemblyVersion?: string | null
  fileVersion?: string | null
  informationalVersion?: string | null
  targetFramework?: string | null
  referencedAssemblies?: string[] | null
}

type ScanResultWithAssembly = ScanResult & {
  assembly?: AssemblyMetadataLike | null
}

export interface AttestationUploadMetadata {
  loaderType?: string
}

export interface AttestationPublishMetadata {
  loaderType: string | null
  artifactVersion: string | null
}

const IL2CPP_REFERENCE_MARKERS = [
  "il2cpp",
  "unhollower",
  "il2cppinterop",
  "il2cppmscorlib",
  "il2cppsystem",
]

const MONO_REFERENCE_MARKERS = [
  "bepinex",
  "melonloader",
  "mscorlib",
]

function normalizeMetadataLabel(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function inferAssemblyRuntime(assembly: AssemblyMetadataLike | null | undefined): "mono" | "il2cpp" | null {
  if (!assembly) {
    return null
  }

  const references = Array.isArray(assembly.referencedAssemblies)
    ? assembly.referencedAssemblies
      .filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value: string) => value.trim().toLowerCase())
    : []

  if (references.some((reference: string) => IL2CPP_REFERENCE_MARKERS.some((marker) => reference.includes(marker)))) {
    return "il2cpp"
  }

  if (references.some((reference: string) => MONO_REFERENCE_MARKERS.some((marker) => reference.includes(marker)))) {
    return "mono"
  }

  const targetFramework = normalizeMetadataLabel(assembly.targetFramework)?.toLowerCase() ?? null
  if (targetFramework?.includes(".netframework") || targetFramework?.includes("netframework")) {
    return "mono"
  }

  return null
}

export function buildAttestationPublishMetadata(result: ScanResult): AttestationPublishMetadata {
  const assembly = (result as ScanResultWithAssembly).assembly
  const runtime = inferAssemblyRuntime(assembly)

  return {
    loaderType:
      runtime === "il2cpp"
        ? "detected-il2cpp"
        : runtime === "mono"
          ? "detected-mono"
          : null,
    artifactVersion:
      normalizeMetadataLabel(assembly?.informationalVersion)
      ?? normalizeMetadataLabel(assembly?.fileVersion)
      ?? normalizeMetadataLabel(assembly?.assemblyVersion),
  }
}

export function toAttestationUploadMetadata(
  metadata: AttestationPublishMetadata,
): AttestationUploadMetadata | null {
  return metadata.loaderType ? { loaderType: metadata.loaderType } : null
}
