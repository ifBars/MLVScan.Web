import { Outlet, useLocation } from "react-router-dom"
import DocsSidebar from "./DocsSidebar"
import DocsSearch from "./DocsSearch"
import { Menu, PanelLeftOpen, X } from "lucide-react"
import { useEffect, useState } from "react"
import { getDocBySlug } from "@/docs/registry"

const SCROLL_HIDE_THRESHOLD = 100
const SCROLL_SHOW_THRESHOLD = 30

const DocsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [navOffset, setNavOffset] = useState(true)
  const location = useLocation()
  const docSlug = location.pathname.replace(/^\/docs\/?/, "")
  const activeDoc = getDocBySlug(docSlug)
  const activeTitle = activeDoc?.title ?? "Documentation"

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setNavOffset((current) => {
        if (y <= SCROLL_SHOW_THRESHOLD) {
          return true
        }
        if (y > SCROLL_HIDE_THRESHOLD) {
          return false
        }
        return current
      })
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!sidebarOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false)
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [sidebarOpen])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="pt-16">
        <div
          data-testid="docs-layout-grid"
          className={`grid transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none ${
            desktopSidebarOpen
              ? "lg:grid-cols-[280px_minmax(0,1fr)]"
              : "lg:grid-cols-[0_minmax(0,1fr)]"
          }`}
        >
          {/* Desktop: sidebar column */}
          <aside
            aria-hidden={!desktopSidebarOpen}
            inert={!desktopSidebarOpen}
            className={`hidden overflow-clip bg-slate-950 transition-opacity duration-200 lg:-mt-16 lg:block ${
              desktopSidebarOpen ? "border-r border-slate-800 opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div
              className={`sticky transition-all duration-300 ${
                navOffset ? "top-16 h-[calc(100vh-4rem)]" : "top-0 h-screen"
              }`}
            >
              <DocsSidebar onCollapse={() => setDesktopSidebarOpen(false)} />
            </div>
          </aside>

          {/* Main column */}
          <div className="min-w-0">
            {!desktopSidebarOpen && (
              <div className="hidden px-4 pt-5 lg:block lg:px-8">
                <button
                  type="button"
                  aria-label="Show documentation sidebar"
                  onClick={() => setDesktopSidebarOpen(true)}
                  className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <PanelLeftOpen className="size-4" />
                  <span>Show navigation</span>
                </button>
              </div>
            )}

            {/* Mobile header */}
            <div
              className={`lg:hidden sticky z-30 border-b border-slate-800 bg-slate-950 px-4 py-3 transition-all duration-300 ${
                navOffset ? "top-16" : "top-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-400">Documentation</p>
                  <p className="truncate text-sm font-medium text-white">{activeTitle}</p>
                </div>
                <button
                  type="button"
                  aria-label={sidebarOpen ? "Close documentation menu" : "Browse documentation"}
                  aria-expanded={sidebarOpen}
                  aria-controls="mobile-docs-drawer"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  <span>{sidebarOpen ? "Close" : "Browse"}</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <main className="px-4 py-8 lg:px-8">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close documentation menu"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <div
        id="mobile-docs-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Browse documentation"
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
        className={`fixed left-0 bottom-0 right-0 z-50 transform border-r border-slate-800 bg-slate-950 shadow-2xl shadow-black/60 transition-all duration-300 sm:right-auto sm:w-96 lg:hidden ${
          navOffset ? "top-16" : "top-0"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-400">MLVScan docs</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Browse documentation</h2>
            </div>
            <button
              type="button"
              aria-label="Close documentation menu"
              onClick={closeSidebar}
              className="flex size-10 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="border-b border-slate-800 bg-slate-950 px-4 py-3">
            <DocsSearch onSelect={closeSidebar} />
          </div>
          <div className="min-h-0 flex-1">
            <DocsSidebar mobile showHeader={false} onNavigate={closeSidebar} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocsLayout
