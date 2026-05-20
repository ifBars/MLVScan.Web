export function getDisplayArtifactVersion(version: string | null | undefined): string | null {
  const trimmed = version?.trim()
  if (!trimmed) {
    return null
  }

  const buildMetadataIndex = trimmed.indexOf("+")
  if (buildMetadataIndex > 0) {
    return trimmed.slice(0, buildMetadataIndex)
  }

  if (trimmed.length > 28) {
    return `${trimmed.slice(0, 25)}...`
  }

  return trimmed
}

export function shouldShowFullArtifactVersionTitle(version: string | null | undefined): boolean {
  const trimmed = version?.trim()
  const displayVersion = getDisplayArtifactVersion(trimmed)

  return Boolean(trimmed && displayVersion && trimmed !== displayVersion)
}
