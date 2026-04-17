import { Outlet } from "react-router-dom"
import DocsSidebar from "./DocsSidebar"
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

const SCROLL_HIDE_THRESHOLD = 100
const SCROLL_SHOW_THRESHOLD = 30

const DocsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [navOffset, setNavOffset] = useState(true)

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

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="pt-16">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Desktop: sidebar column */}
          <aside className="hidden lg:block border-r border-gray-800/80 bg-gray-900/40">
            <div
              className={`sticky transition-all duration-300 ${
                navOffset ? "top-16 h-[calc(100vh-4rem)]" : "top-0 h-screen"
              }`}
            >
              <DocsSidebar />
            </div>
          </aside>

          {/* Main column */}
          <div className="min-w-0">
            {/* Mobile header */}
            <div
              className={`lg:hidden sticky z-30 border-b border-gray-800 bg-gray-900/95 px-4 py-4 backdrop-blur-md transition-all duration-300 ${
                navOffset ? "top-16" : "top-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Documentation</h2>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-400 hover:text-white"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed left-0 bottom-0 z-50 w-72 transform transition-all duration-300 ${
          navOffset ? "top-16" : "top-0"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DocsSidebar />
      </div>
    </div>
  )
}

export default DocsLayout
