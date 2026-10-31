// @vitest-environment jsdom

import { act } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"

import Navbar from "@/components/layout/Navbar"

vi.mock("@/components/docs/DocsSearch", () => ({
  default: () => <div data-testid="docs-search">Docs search</div>,
}))

vi.mock("@/lib/partner-dashboard-routes", () => ({
  getPartnerDashboardPath: () => "/dashboard",
}))

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = []
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function renderNavbar(pathname = "/docs/ci-attestations") {
  const container = document.createElement("div")
  document.body.appendChild(container)

  const root = createRoot(container)
  mountedRoots.push({ container, root })

  act(() => {
    root.render(
      <MemoryRouter initialEntries={[pathname]}>
        <Navbar />
      </MemoryRouter>,
    )
  })

  return container.querySelector("nav")
}

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

describe("Navbar", () => {
  it("scrolls away with docs pages instead of stacking over the docs toolbar", () => {
    const nav = renderNavbar("/docs/ci-attestations")
    expect(nav?.className).toContain("absolute")
    expect(nav?.className).not.toContain("fixed")

    setScroll(140)
    expect(nav?.className).not.toContain("navbar-hidden")
  })

  it("hides outside docs after scrolling past the hide threshold", () => {
    const nav = renderNavbar("/scan")
    expect(nav?.className).toContain("fixed")
    expect(nav?.className).toContain("navbar-visible")

    setScroll(140)
    expect(nav?.className).toContain("navbar-hidden")
    expect(nav?.className).toContain("navbar-glass")

    setScroll(0)
    expect(nav?.className).toContain("navbar-visible")
  })

  it("leaves documentation search to the dedicated docs toolbar", () => {
    renderNavbar("/docs/ci-attestations")
    expect(document.querySelector('[data-testid="docs-search"]')).toBeNull()

    for (const { container, root } of mountedRoots.splice(0)) {
      act(() => {
        root.unmount()
      })
      container.remove()
    }

    renderNavbar("/scan")
    expect(document.querySelector('[data-testid="docs-search"]')).toBeNull()
  })

  it("shows the service status utility link", () => {
    renderNavbar("/scan")
    const statusLink = document.querySelector('a[href="/status"]')

    expect(statusLink).toBeTruthy()
    expect(statusLink?.textContent).toContain("Status")
  })
})
