import { unzipSync } from "fflate"

const supportedAssemblyExtensions = [".dll", ".exe", ".di", ".netmodule"] as const
const invalidUploadMessage = "Please upload a .NET assembly (.dll, .exe, or .netmodule) or a .zip archive containing one"
const missingAssemblyMessage = "This .zip archive does not contain a supported .NET assembly"
const extractedSizeMessage = "The extracted assembly exceeds the 100MB limit"
const invalidZipMessage = "Failed to read the .zip archive. Make sure it is valid and contains a supported .NET assembly"

const archivePriority = new Map<string, number>([
  [".dll", 0],
  [".exe", 1],
  [".di", 2],
  [".netmodule", 3],
])

export type ResolvedUpload = {
  fileBytes: Uint8Array
  fileName: string
  extractedFromArchive: boolean
}

const readBlobBytes = async (file: Blob): Promise<Uint8Array> => {
  if (typeof file.arrayBuffer === "function") {
    return new Uint8Array(await file.arrayBuffer())
  }

  return new Uint8Array(await new Response(file).arrayBuffer())
}

const getLowerCaseExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".")
  return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : ""
}

const getArchiveEntryName = (entryPath: string): string => {
  const normalizedPath = entryPath.replaceAll("\\", "/")
  const fileName = normalizedPath.split("/").pop()
  return fileName && fileName.length > 0 ? fileName : normalizedPath
}

export const isSupportedAssemblyFileName = (fileName: string): boolean => {
  return supportedAssemblyExtensions.includes(getLowerCaseExtension(fileName) as (typeof supportedAssemblyExtensions)[number])
}

export const isZipArchiveFileName = (fileName: string): boolean => {
  return getLowerCaseExtension(fileName) === ".zip"
}

const compareArchiveEntries = (leftPath: string, rightPath: string): number => {
  const leftExtension = getLowerCaseExtension(leftPath)
  const rightExtension = getLowerCaseExtension(rightPath)
  const leftPriority = archivePriority.get(leftExtension) ?? Number.MAX_SAFE_INTEGER
  const rightPriority = archivePriority.get(rightExtension) ?? Number.MAX_SAFE_INTEGER

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority
  }

  return leftPath.localeCompare(rightPath)
}

export const resolveUploadFile = async (file: File, maxFileSize: number): Promise<ResolvedUpload> => {
  if (isSupportedAssemblyFileName(file.name)) {
    return {
      fileBytes: await readBlobBytes(file),
      fileName: file.name,
      extractedFromArchive: false,
    }
  }

  if (!isZipArchiveFileName(file.name)) {
    throw new Error(invalidUploadMessage)
  }

  try {
    const archiveBytes = await readBlobBytes(file)
    const archiveEntries = unzipSync(archiveBytes)
    const assemblyEntries = Object.entries(archiveEntries)
      .filter(([entryPath]) => isSupportedAssemblyFileName(getArchiveEntryName(entryPath)))
      .sort(([leftPath], [rightPath]) => compareArchiveEntries(leftPath, rightPath))

    const selectedEntry = assemblyEntries[0]

    if (!selectedEntry) {
      throw new Error(missingAssemblyMessage)
    }

    const [entryPath, entryBytes] = selectedEntry
    const extractedFileName = getArchiveEntryName(entryPath)

    if (entryBytes.byteLength > maxFileSize) {
      throw new Error(extractedSizeMessage)
    }

    return {
      fileBytes: entryBytes,
      fileName: extractedFileName,
      extractedFromArchive: true,
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === missingAssemblyMessage || error.message === extractedSizeMessage) {
        throw error
      }

      throw new Error(invalidZipMessage)
    }

    throw error
  }
}
