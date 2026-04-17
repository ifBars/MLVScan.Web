// @vitest-environment jsdom

import { act } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import DocsLayout from "@/components/docs/DocsLayout"

vi.mock("@/components/docs/DocsSidebar", () => ({
  default: () => <div data-testid="docs-sidebar">Sidebar</div>,
}))

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function setScroll(y: number) {
  Object.defineProperty(window, "scrollY", {
    value: y,
    configurable: true,
    writable: true,
  })

  act(() => {
    window.dispatchEvent(new Event("scroll"))
  })
}

function renderDocsLayout() {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  act(() => {
    root.render(
      <MemoryRouter initialEntries={["/docs/ci-attestations"]}>
        <Routes>
          <Route path="/docs" element={<DocsLayout />}>
            <Route path="ci-attestations" element={<div>Doc content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
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

  document.body.innerHTML = ""
  setScroll(0)
})

describe("DocsLayout", () => {
  it("keeps docs chrome offset below the navbar near the top of the page", () => {
    const container = renderDocsLayout()

    const desktopSticky = container.querySelector("aside .sticky")
    const mobileHeader = Array.from(container.querySelectorAll("div"))
      .find((element) => element.className.includes("lg:hidden sticky"))
    const mobileDrawer = Array.from(container.querySelectorAll("div"))
      .find((element) => element.className.includes("fixed left-0 bottom-0"))

    expect(desktopSticky?.className).toContain("top-16")
    expect(desktopSticky?.className).toContain("h-[calc(100vh-4rem)]")
    expect(mobileHeader?.className).toContain("top-16")
    expect(mobileDrawer?.className).toContain("top-16")
  })

  it("slides docs chrome up when the navbar hides", () => {
    const container = renderDocsLayout()
    setScroll(140)

    const desktopSticky = container.querySelector("aside .sticky")
    const mobileHeader = Array.from(container.querySelectorAll("div"))
      .find((element) => element.className.includes("lg:hidden sticky"))
    const mobileDrawer = Array.from(container.querySelectorAll("div"))
      .find((element) => element.className.includes("fixed left-0 bottom-0"))

    expect(desktopSticky?.className).toContain("top-0")
    expect(desktopSticky?.className).toContain("h-screen")
    expect(mobileHeader?.className).toContain("top-0")
    expect(mobileDrawer?.className).toContain("top-0")
  })
})
