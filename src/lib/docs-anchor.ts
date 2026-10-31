export type DocsScrollBehavior = ScrollBehavior

const DOCS_ANCHOR_GAP = 24

/** Bottom edge of the chrome that stays pinned over docs content once the page scrolls. */
export const getDocsStickyChromeBottom = (): number => {
  const toolbar = document.querySelector<HTMLElement>("[data-docs-toolbar]")
  if (!toolbar) {
    return 0
  }

  const stickyTop = Number.parseFloat(window.getComputedStyle(toolbar).top)
  return (Number.isFinite(stickyTop) ? stickyTop : 0) + toolbar.getBoundingClientRect().height
}

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

  const offset = getDocsStickyChromeBottom() + DOCS_ANCHOR_GAP
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset)
  window.scrollTo({ top, left: 0, behavior })
  return true
}
