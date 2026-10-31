import { Outlet, useLocation } from "react-router-dom"
import DocsSidebar from "./DocsSidebar"
import DocsSearch from "./DocsSearch"
import { ChevronRight, Menu, PanelLeftOpen, Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { docSections, getDocBySlug } from "@/docs/registry"
import { getDocsSlugFromPath } from "./docs-path"

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

const DocsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [focusDrawerSearch, setFocusDrawerSearch] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const desktopSearchRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const showSidebarButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarToggledRef = useRef(false)
  const location = useLocation()
  const docSlug = getDocsSlugFromPath(location.pathname)
  const activeDoc = getDocBySlug(docSlug)
  const activeTitle = activeDoc?.title ?? "Overview"
  const activeSection = docSections.find((section) => section.id === activeDoc?.section)

  const setDesktopSidebar = (open: boolean) => {
    sidebarToggledRef.current = true
    setDesktopSidebarOpen(open)
  }

  // The toggle that was pressed disappears (or turns inert), so hand focus to its counterpart.
  useEffect(() => {
    if (!sidebarToggledRef.current) {
      return
    }
    sidebarToggledRef.current = false
    if (desktopSidebarOpen) {
      document
        .querySelector<HTMLButtonElement>('#desktop-docs-sidebar button[aria-label="Hide documentation sidebar"]')
        ?.focus()
    } else {
      showSidebarButtonRef.current?.focus()
    }
  }, [desktopSidebarOpen])

  const openDrawer = (withSearch = false) => {
    setFocusDrawerSearch(withSearch)
    setSidebarOpen(true)
  }

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

  useEffect(() => {
    if (!sidebarOpen || !focusDrawerSearch) {
      return
    }
    const frame = window.requestAnimationFrame(() => mobileSearchRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [sidebarOpen, focusDrawerSearch])

  // "/" jumps to search, matching the convention used by most documentation sites.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) {
        return
      }
      event.preventDefault()
      const desktopSearch = desktopSearchRef.current
      if (desktopSearch && desktopSearch.getClientRects().length > 0) {
        desktopSearch.focus()
      } else {
        setFocusDrawerSearch(true)
        setSidebarOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* The site navbar sits in this gap and scrolls away; docs chrome is the only sticky layer. */}
      <div className="pt-16">
        <div
          data-testid="docs-layout-grid"
          className={`grid min-h-screen border-t border-slate-800 transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none ${
            desktopSidebarOpen
              ? "lg:grid-cols-[280px_minmax(0,1fr)]"
              : "lg:grid-cols-[0_minmax(0,1fr)]"
          }`}
        >
          {/* Desktop: sidebar column */}
          <aside
            id="desktop-docs-sidebar"
            aria-hidden={!desktopSidebarOpen}
            inert={!desktopSidebarOpen}
            className={`hidden overflow-clip bg-slate-950 transition-opacity duration-200 lg:block ${
              desktopSidebarOpen ? "border-r border-slate-800 opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <DocsSidebar onCollapse={() => setDesktopSidebar(false)} />
          </aside>

          {/* Main column */}
          <div className="min-w-0">
            {/* Shares its height with the sidebar header so both read as one bar. */}
            <div
              data-docs-toolbar
              className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-slate-950/85 lg:px-8"
            >
              <button
                type="button"
                aria-label={sidebarOpen ? "Close documentation menu" : "Browse documentation"}
                aria-expanded={sidebarOpen}
                aria-controls="mobile-docs-drawer"
                onClick={() => (sidebarOpen ? closeSidebar() : openDrawer())}
                className="flex size-9 flex-shrink-0 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 lg:hidden"
              >
                {sidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
              {!desktopSidebarOpen && (
                <button
                  ref={showSidebarButtonRef}
                  type="button"
                  aria-label="Show documentation sidebar"
                  aria-controls="desktop-docs-sidebar"
                  title="Show navigation"
                  onClick={() => setDesktopSidebar(true)}
                  className="hidden size-9 flex-shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 lg:flex"
                >
                  <PanelLeftOpen className="size-4" />
                </button>
              )}
              <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                <ol className="flex min-w-0 items-center gap-1.5 text-sm">
                  {activeSection && (
                    <li className="hidden flex-shrink-0 items-center gap-1.5 text-slate-500 sm:flex">
                      <span>{activeSection.title}</span>
                      <ChevronRight className="size-3.5" aria-hidden="true" />
                    </li>
                  )}
                  <li aria-current="page" className="truncate font-medium text-white">
                    {activeTitle}
                  </li>
                </ol>
              </nav>
              <button
                type="button"
                aria-label="Search documentation"
                onClick={() => openDrawer(true)}
                className="flex size-9 flex-shrink-0 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 lg:hidden"
              >
                <Search className="size-4" />
              </button>
              <div className="hidden w-72 flex-shrink-0 lg:block xl:w-80">
                <DocsSearch inputRef={desktopSearchRef} shortcutHint="/" />
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
          tabIndex={-1}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
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
        className={`fixed left-0 top-0 bottom-0 right-0 z-[70] transform border-r border-slate-800 bg-slate-950 shadow-2xl shadow-black/60 transition-transform duration-300 motion-reduce:transition-none sm:right-auto sm:w-96 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col bg-slate-950">
          <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-800 px-4">
            <h2 className="text-sm font-semibold text-white">MLVScan Docs</h2>
            <button
              type="button"
              aria-label="Close documentation menu"
              onClick={closeSidebar}
              className="flex size-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="border-b border-slate-800 bg-slate-950 px-4 py-3">
            <DocsSearch inputRef={mobileSearchRef} onSelect={closeSidebar} />
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
