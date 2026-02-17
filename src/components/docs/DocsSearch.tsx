import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { allDocs } from "@/docs/registry"
import { searchDocs } from "@/docs/searchIndex"
import { useNavigate } from "react-router-dom"

interface DocsSearchProps {
  onSelect?: () => void
}

interface SearchResultItem {
  id: string
  title: string
  slug: string
  description?: string
  excerpt?: string
  matches?: string[]
  type: 'doc' | 'content'
}

const DocsSearch = ({ onSelect }: DocsSearchProps) => {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const results = useMemo(() => {
    if (!query.trim()) return []
    
    const lowerQuery = query.toLowerCase()
    const items: SearchResultItem[] = []
    
    // First, search through metadata (titles, descriptions, keywords)
      const metadataResults = allDocs.filter(doc => {
      const titleMatch = doc.title.toLowerCase().includes(lowerQuery)
      const descMatch = doc.description?.toLowerCase().includes(lowerQuery)
      const keywordMatch = doc.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
      return titleMatch || descMatch || keywordMatch
    })
    
    // Add metadata matches
    for (const doc of metadataResults) {
      items.push({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        type: 'doc',
      })
    }
    
    // Then, search through actual content
    const contentResults = searchDocs(query)
    
    for (const result of contentResults) {
      // Only add if not already in metadata results
      if (!items.some(item => item.id === result.docId)) {
        items.push({
          id: result.docId,
          title: result.title,
          slug: result.slug,
          excerpt: result.excerpt,
          matches: result.matches,
          type: 'content',
        })
      } else {
        // Update existing item with content matches
        const existingItem = items.find(item => item.id === result.docId)
        if (existingItem) {
          existingItem.excerpt = result.excerpt
          existingItem.matches = result.matches
          existingItem.type = 'content'
        }
      }
    }
    
    return items.slice(0, 8)
  }, [query])

  const handleSelect = (item: SearchResultItem) => {
    const path = item.slug ? `/docs/${item.slug}` : '/docs'
    navigate(path)
    setQuery("")
    setIsOpen(false)
    onSelect?.()
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const lowerQuery = query.toLowerCase()
    const lowerText = text.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)
    
    if (index === -1) return text
    
    const before = text.slice(0, index)
    const match = text.slice(index, index + query.length)
    const after = text.slice(index + query.length)
    
    return (
      <>
        {before}
        <span className="bg-teal-500/30 text-teal-200 font-medium">{match}</span>
        {after}
      </>
    )
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-teal-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && query && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
            >
              <div className="font-medium text-white">
                {highlightMatch(item.title, query)}
              </div>
              
              {/* Show description for metadata matches */}
              {item.type === 'doc' && item.description && !item.excerpt && (
                <div className="text-sm text-gray-400 mt-1">
                  {highlightMatch(item.description, query)}
                </div>
              )}
              
              {/* Show excerpt for content matches */}
              {item.excerpt && (
                <div className="text-sm text-gray-400 mt-1">
                  {highlightMatch(item.excerpt, query)}
                </div>
              )}
              
              {/* Show match count if there are multiple matches */}
              {item.matches && item.matches.length > 1 && (
                <div className="text-xs text-teal-400 mt-1">
                  {item.matches.length} matches
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 p-4 text-center text-gray-400">
          No results found
        </div>
      )}
    </div>
  )
}

export default DocsSearch
