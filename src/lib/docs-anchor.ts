export type DocsScrollBehavior = ScrollBehavior

export const getDocsAnchorId = (hash: string): string | null => {
  const encodedId = hash.startsWith("#") ? hash.slice(1) : hash
  if (!encodedId) {
    return null
  }

  try {
    return decodeURIComponent(encodedId)
  } catch {
    return encodedId
  }
}

export const scrollToDocsAnchor = (
  hash: string,
  behavior: DocsScrollBehavior = "auto",
): boolean => {
  const id = getDocsAnchorId(hash)
  if (!id) {
    return false
  }

  const target = document.getElementById(id)
  if (!target) {
    return false
  }

  target.scrollIntoView({ behavior, block: "start" })
  return true
}
