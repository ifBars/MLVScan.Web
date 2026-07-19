import { Link, useLocation } from "react-router-dom"
import { ChevronRight, BookOpen, PanelLeftClose } from "lucide-react"
import { useState } from "react"
import { docsBySection, type DocSectionId, type DocsBySection } from "@/docs/registry"

type SidebarSectionProps = {
  section: DocsBySection
  isExpanded: boolean
  onToggle: () => void
  onNavigate?: () => void
  mobile: boolean
}

const SidebarSection = ({ section, isExpanded, onToggle, onNavigate, mobile }: SidebarSectionProps) => {
  const location = useLocation()

  return (
    <div className={mobile ? "mb-2" : "mb-4"}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={`flex w-full items-center justify-between rounded-md px-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-slate-900 hover:text-white ${
          mobile ? "min-h-11 py-2.5" : "py-2"
        }`}
      >
        <span>{section.title}</span>
        <ChevronRight
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>
      {isExpanded && (
        <div className={mobile ? "space-y-3 pb-3 pl-2" : "ml-2 space-y-3"}>
          {section.groups.map((group) => (
            <div key={group.id} className="space-y-1">
              {section.id === 'libraries' && (
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {group.title}
                </p>
              )}
              {group.docs.map((doc) => {
                const docPath = doc.slug ? `/docs/${doc.slug}` : '/docs'
                const isActive = location.pathname === docPath
                return (
                  <Link
                    key={doc.id}
                    to={docPath}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-md px-3 text-sm transition-colors ${mobile ? "py-2.5" : "py-2"} ${
                      isActive
                        ? "border-l-2 border-teal-400 bg-teal-400/10 text-teal-300"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3 h-3" />
                      <span>{doc.title}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type DocsSidebarProps = {
  mobile?: boolean
  onNavigate?: () => void
  onCollapse?: () => void
  showHeader?: boolean
}

const DocsSidebar = ({ mobile = false, onNavigate, onCollapse, showHeader = true }: DocsSidebarProps) => {
  const location = useLocation()
  const activeSectionId = docsBySection.find((section) =>
    section.groups.some((group) =>
      group.docs.some((doc) => (doc.slug ? `/docs/${doc.slug}` : "/docs") === location.pathname),
    ),
  )?.id
  const [expandedSections, setExpandedSections] = useState<Set<DocSectionId>>(
    mobile
      ? new Set()
      : new Set(["getting-started", "libraries", "for-developers", "resources"]),
  )

  const toggleSection = (sectionId: DocSectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  return (
    <div className="flex h-full w-full flex-col bg-slate-950">
      {showHeader && (
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 p-4">
          <div className="min-w-0">
            <h2 className="mb-1 text-lg font-bold text-white">Documentation</h2>
            <p className="text-xs text-slate-400">MLVScan Ecosystem</p>
          </div>
          {onCollapse && (
            <button
              type="button"
              aria-label="Hide documentation sidebar"
              title="Hide navigation"
              onClick={onCollapse}
              className="flex size-9 flex-shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>
      )}
      <nav aria-label="Documentation pages" className="flex-1 space-y-2 overflow-y-auto p-4">
        {docsBySection.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            isExpanded={expandedSections.has(section.id) || activeSectionId === section.id}
            onToggle={() => toggleSection(section.id)}
            onNavigate={onNavigate}
            mobile={mobile}
          />
        ))}
      </nav>
    </div>
  )
}

export default DocsSidebar
