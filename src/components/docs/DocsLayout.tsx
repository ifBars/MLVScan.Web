import { Outlet } from "react-router-dom"
import DocsSidebar from "./DocsSidebar"
import { Menu, X } from "lucide-react"
import { useState } from "react"

const DocsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="pt-16">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Desktop: sidebar column */}
          <aside className="hidden lg:block border-r border-gray-800/80 bg-gray-900/40">
            <div className="sticky top-16 h-[calc(100vh-4rem)]">
              <DocsSidebar />
            </div>
          </aside>

          {/* Main column */}
          <div className="min-w-0">
            {/* Mobile header */}
            <div className="lg:hidden sticky top-16 z-30 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-4">
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
        className={`lg:hidden fixed left-0 top-16 bottom-0 z-50 transform transition-transform w-72 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DocsSidebar />
      </div>
    </div>
  )
}

export default DocsLayout
