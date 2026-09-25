// @vitest-environment jsdom

import { act } from "react"
import { fireEvent, screen } from "@testing-library/dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRoot } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"
import StatusPage from "@/pages/StatusPage"

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  document.body.innerHTML = ""
})

describe("StatusPage", () => {
  it("requests live status on visit and manual refresh", async () => {
    vi.stubEnv("VITE_PUBLIC_API_BASE_URL", "https://api.example.test")
    const timestamps = ["2026-09-25T10:00:00.000Z", "2026-09-25T10:01:00.000Z"]
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      status: "operational",
      timestamp: timestamps.shift(),
      components: [],
    }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)
    try {
      await act(async () => {
        root.render(<MemoryRouter><StatusPage /></MemoryRouter>)
      })
      expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/status?live=1", expect.objectContaining({ cache: "no-store" }))
      const firstMeasurement = screen.getByText(/Components measured/).textContent

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Refresh" }))
      })
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock).toHaveBeenLastCalledWith("https://api.example.test/status?live=1", expect.objectContaining({ cache: "no-store" }))
      expect(screen.getByText(/Components measured/).textContent).not.toBe(firstMeasurement)
    } finally {
      await act(async () => root.unmount())
      container.remove()
    }
  })
})
