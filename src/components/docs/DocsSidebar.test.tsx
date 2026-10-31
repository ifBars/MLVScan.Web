// @vitest-environment jsdom

import { act } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"

import DocsSidebar from "@/components/docs/DocsSidebar"

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function renderSidebar(element: React.ReactElement, path = "/docs") {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  mountedRoots.push({ container, root })

  act(() => {
    root.render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>)
  })

  return container
}

afterEach(() => {
  for (const { container, root } of mountedRoots.splice(0)) {
    act(() => {
      root.unmount()
    })
    container.remove()
  }
})

describe("DocsSidebar", () => {
  it("highlights the active page on hosted trailing-slash URLs", () => {
    const container = renderSidebar(<DocsSidebar />, "/docs/privacy/")
    expect(container.querySelector('a[aria-current="page"]')?.textContent).toContain("Privacy")
  })
  it("pins a toolbar-height header above an independently scrolling page list on desktop", () => {
    const container = renderSidebar(<DocsSidebar onCollapse={() => {}} />)
    const header = container.querySelector("h2")?.closest(".sticky")
    const nav = container.querySelector('nav[aria-label="Documentation pages"]')

    expect(header?.parentElement?.className).toContain("h-full")
    expect(header?.className).toContain("top-0")
    expect(header?.className).toContain("h-14")
    expect(nav?.className).toContain("top-14")
    expect(nav?.className).toContain("h-[calc(100vh-3.5rem)]")
    expect(container.textContent).not.toContain("Documentation")
    expect(container.querySelector('button[aria-label="Hide documentation sidebar"]')).not.toBeNull()
  })

  it("lets the mobile drawer own the page list height", () => {
    const container = renderSidebar(<DocsSidebar mobile showHeader={false} />)
    const nav = container.querySelector('nav[aria-label="Documentation pages"]')

    expect(nav?.className).toContain("flex-1")
    expect(nav?.className).not.toContain("sticky")
  })
})
