// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"

import { getDocsAnchorId, scrollToDocsAnchor } from "@/lib/docs-anchor"

afterEach(() => {
  document.body.innerHTML = ""
})

describe("docs anchors", () => {
  it("decodes anchor ids from location hashes", () => {
    expect(getDocsAnchorId("#migration-guide")).toBe("migration-guide")
    expect(getDocsAnchorId("#api%20limits")).toBe("api limits")
    expect(getDocsAnchorId("#")).toBeNull()
  })

  it("scrolls to a heading after asynchronous docs content exists", () => {
    const heading = document.createElement("h2")
    heading.id = "migration-guide"
    heading.scrollIntoView = vi.fn()
    document.body.appendChild(heading)

    expect(scrollToDocsAnchor("#migration-guide", "auto")).toBe(true)
    expect(heading.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" })
  })

  it("returns false when the target has not rendered", () => {
    expect(scrollToDocsAnchor("#missing-section")).toBe(false)
  })
})
