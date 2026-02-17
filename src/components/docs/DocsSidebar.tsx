import { Link, useLocation } from "react-router-dom"
import { ChevronRight, BookOpen } from "lucide-react"
import { useState } from "react"
import { docsBySection, type DocSectionId, type DocsBySection } from "@/docs/registry"

type SidebarSectionProps = {
  section: DocsBySection
  isExpanded: boolean
  onToggle: () => void
}

const SidebarSection = ({ section, isExpanded, onToggle }: SidebarSectionProps) => {
  const location = useLocation()

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
      >
        <span>{section.title}</span>
        <ChevronRight
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>
      {isExpanded && (
        <div className="ml-2 space-y-3">
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
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? "bg-teal-500/20 text-teal-400 border-l-2 border-teal-500"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
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

const DocsSidebar = () => {
  const [expandedSections, setExpandedSections] = useState<Set<DocSectionId>>(
    new Set(["getting-started", "libraries", "resources"])
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
    <div className="w-full h-full bg-gray-900/50 border-r border-gray-800 flex flex-col">
      <div className="p-4 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 flex-shrink-0">
        <h2 className="text-lg font-bold text-white mb-1">Documentation</h2>
        <p className="text-xs text-gray-400">MLVScan Ecosystem</p>
      </div>
      <div className="p-4 space-y-2 overflow-y-auto flex-1">
        {docsBySection.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default DocsSidebar
