// @vitest-environment jsdom

import { act } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import DocsLayout from "@/components/docs/DocsLayout"

vi.mock("@/components/docs/DocsSidebar", () => ({
  default: ({ onCollapse }: { onCollapse?: () => void }) => (
    <div data-testid="docs-sidebar">
      Sidebar
      {onCollapse && (
        <button type="button" aria-label="Hide documentation sidebar" onClick={onCollapse}>
          Hide navigation
        </button>
      )}
    </div>
  ),
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
    const desktopAside = container.querySelector("aside")
    const mobileHeader = Array.from(container.querySelectorAll("div"))
      .find((element) => element.className.includes("lg:hidden sticky"))
    const mobileDrawer = Array.from(container.querySelectorAll("div"))
      .find((element) => element.className.includes("fixed left-0 bottom-0"))

    expect(desktopAside?.className).toContain("lg:-mt-16")
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

  it("opens a solid mobile navigation drawer with an accessible control", () => {
    const container = renderDocsLayout()
    const browseButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Browse documentation"]',
    )

    expect(browseButton).not.toBeNull()

    act(() => {
      browseButton?.click()
    })

    const drawer = container.querySelector("#mobile-docs-drawer")
    expect(drawer?.className).toContain("bg-slate-950")
    expect(drawer?.className).toContain("translate-x-0")
    expect(drawer?.getAttribute("aria-hidden")).toBe("false")
    expect(document.body.style.overflow).toBe("hidden")
  })

  it("closes the mobile navigation drawer with Escape", () => {
    const container = renderDocsLayout()
    const browseButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Browse documentation"]',
    )

    act(() => {
      browseButton?.click()
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    })

    const drawer = container.querySelector("#mobile-docs-drawer")
    expect(drawer?.className).toContain("-translate-x-full")
    expect(drawer?.getAttribute("aria-hidden")).toBe("true")
  })

  it("collapses and restores the desktop navigation for focused reading", () => {
    const container = renderDocsLayout()
    const grid = container.querySelector('[data-testid="docs-layout-grid"]')
    const hideButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Hide documentation sidebar"]',
    )

    expect(grid?.className).toContain("lg:grid-cols-[280px_minmax(0,1fr)]")

    act(() => {
      hideButton?.click()
    })

    expect(grid?.className).toContain("lg:grid-cols-[0_minmax(0,1fr)]")
    const desktopAside = container.querySelector("aside")
    expect(desktopAside?.getAttribute("aria-hidden")).toBe("true")

    const showButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show documentation sidebar"]',
    )
    expect(showButton).not.toBeNull()

    act(() => {
      showButton?.click()
    })

    expect(grid?.className).toContain("lg:grid-cols-[280px_minmax(0,1fr)]")
  })
})
