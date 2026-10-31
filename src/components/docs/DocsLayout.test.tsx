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
  it("pins the sidebar header and toolbar together as the only sticky layer", () => {
    const container = renderDocsLayout()

    const docsToolbar = container.querySelector("[data-docs-toolbar]")
    const mobileDrawer = container.querySelector("#mobile-docs-drawer")

    expect(container.querySelector('aside [data-testid="docs-sidebar"]')).not.toBeNull()
    expect(docsToolbar?.className).toContain("top-0")
    expect(docsToolbar?.className).toContain("h-14")
    expect(mobileDrawer?.className).toContain("top-0")

    setScroll(140)
    expect(docsToolbar?.className).toContain("top-0")
  })

  it("names the current section and page once instead of repeating a docs label", () => {
    const container = renderDocsLayout()
    const breadcrumb = container.querySelector('nav[aria-label="Breadcrumb"]')

    expect(breadcrumb?.textContent).toContain("Mod Authors & Platforms")
    expect(breadcrumb?.textContent).toContain("Mod Attestations")
    expect(breadcrumb?.querySelector('[aria-current="page"]')).not.toBeNull()
    expect(container.querySelector("[data-docs-toolbar]")?.textContent).not.toContain("Documentation")
  })

  it("focuses the documentation search with the slash shortcut", () => {
    const container = renderDocsLayout()
    const desktopSearch = container.querySelector<HTMLInputElement>("[data-docs-toolbar] input")
    vi.spyOn(desktopSearch as HTMLInputElement, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList)

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }))
    })

    expect(document.activeElement).toBe(desktopSearch)
  })

  it("opens the drawer with search when the slash shortcut fires on small screens", () => {
    const container = renderDocsLayout()

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }))
    })

    expect(container.querySelector("#mobile-docs-drawer")?.getAttribute("aria-hidden")).toBe("false")
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
