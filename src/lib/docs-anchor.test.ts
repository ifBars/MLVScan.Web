// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"

import { getDocsAnchorId, scrollToDocsAnchor } from "@/lib/docs-anchor"

afterEach(() => {
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

describe("docs anchors", () => {
  it("decodes anchor ids from location hashes", () => {
    expect(getDocsAnchorId("#migration-guide")).toBe("migration-guide")
    expect(getDocsAnchorId("#api%20limits")).toBe("api limits")
    expect(getDocsAnchorId("#")).toBeNull()
  })

  it.each([
    [56, "0px"],
    [56, "64px"],
    [112, "0px"],
  ])("keeps headings clear of a %i px toolbar pinned at %s", (height, stickyTop) => {
    const heading = document.createElement("h2")
    heading.id = "migration-guide"
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({ top: 1000 } as DOMRect)
    const toolbar = document.createElement('div')
    toolbar.setAttribute('data-docs-toolbar', '')
    toolbar.style.top = stickyTop
    vi.spyOn(toolbar, 'getBoundingClientRect').mockReturnValue({ height } as DOMRect)
    document.body.appendChild(toolbar)
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    document.body.appendChild(heading)

    expect(scrollToDocsAnchor("#migration-guide", "auto")).toBe(true)
    expect(scroll).toHaveBeenCalledWith({ behavior: "auto", top: window.scrollY + 1000 - height - Number.parseFloat(stickyTop) - 24, left: 0 })
  })

  it("falls back to a small gap when no documentation toolbar is mounted", () => {
    const heading = document.createElement("h2")
    heading.id = "standalone"
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({ top: 400 } as DOMRect)
    document.body.appendChild(heading)
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    expect(scrollToDocsAnchor("#standalone", "smooth")).toBe(true)
    expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", top: window.scrollY + 400 - 24, left: 0 })
  })

  it("returns false when the target has not rendered", () => {
    expect(scrollToDocsAnchor("#missing-section")).toBe(false)
  })
})
