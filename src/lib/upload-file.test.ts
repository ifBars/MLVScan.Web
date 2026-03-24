import { describe, expect, it } from "vitest"
import { strToU8, zipSync } from "fflate"

import { isSupportedAssemblyFileName, isZipArchiveFileName, resolveUploadFile } from "./upload-file"

const createFile = (bytes: Uint8Array, fileName: string): File => {
  return {
    name: fileName,
    size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  } as File
}

const createArchiveFile = (entries: Record<string, Uint8Array>, fileName = "archive.zip"): File => {
  return createFile(zipSync(entries), fileName)
}

describe("upload-file", () => {
  it("recognizes supported assembly extensions", () => {
    expect(isSupportedAssemblyFileName("Example.DLL")).toBe(true)
    expect(isSupportedAssemblyFileName("Example.netmodule")).toBe(true)
    expect(isSupportedAssemblyFileName("Example.zip")).toBe(false)
  })

  it("recognizes zip archives", () => {
    expect(isZipArchiveFileName("mods.zip")).toBe(true)
    expect(isZipArchiveFileName("mods.dll")).toBe(false)
  })

  it("returns raw bytes for direct assembly uploads", async () => {
    const file = createFile(new Uint8Array([1, 2, 3, 4]), "test.dll")

    const resolvedFile = await resolveUploadFile(file, 1024)

    expect(resolvedFile.fileName).toBe("test.dll")
    expect(resolvedFile.extractedFromArchive).toBe(false)
    expect(Array.from(resolvedFile.fileBytes)).toEqual([1, 2, 3, 4])
  })

  it("extracts the first supported assembly from a zip archive", async () => {
    const file = createArchiveFile({
      "docs/readme.txt": strToU8("hello"),
      "plugins/TestMod.dll": new Uint8Array([77, 90, 0, 1]),
    })

    const resolvedFile = await resolveUploadFile(file, 1024)

    expect(resolvedFile.fileName).toBe("TestMod.dll")
    expect(resolvedFile.extractedFromArchive).toBe(true)
    expect(Array.from(resolvedFile.fileBytes)).toEqual([77, 90, 0, 1])
  })

  it("prefers dll entries when the archive contains multiple assemblies", async () => {
    const file = createArchiveFile({
      "plugins/Launcher.exe": new Uint8Array([1]),
      "plugins/Main.dll": new Uint8Array([2]),
    })

    const resolvedFile = await resolveUploadFile(file, 1024)

    expect(resolvedFile.fileName).toBe("Main.dll")
    expect(Array.from(resolvedFile.fileBytes)).toEqual([2])
  })

  it("throws when a zip archive does not contain a supported assembly", async () => {
    const file = createArchiveFile({
      "docs/readme.txt": strToU8("hello"),
    })

    await expect(resolveUploadFile(file, 1024)).rejects.toThrow(
      "This .zip archive does not contain a supported .NET assembly",
    )
  })

  it("throws when the extracted assembly exceeds the max size", async () => {
    const file = createArchiveFile({
      "plugins/Large.dll": new Uint8Array(2048),
    })

    await expect(resolveUploadFile(file, 1024)).rejects.toThrow(
      "The extracted assembly exceeds the 100MB limit",
    )
  })

  it("throws for unsupported file types", async () => {
    const file = createFile(strToU8("hello"), "notes.txt")

    await expect(resolveUploadFile(file, 1024)).rejects.toThrow(
      "Please upload a .NET assembly (.dll, .exe, or .netmodule) or a .zip archive containing one",
    )
  })
})
