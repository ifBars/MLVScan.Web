import { useEffect, useState, useCallback } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface DocTableOfContentsProps {
  contentRef: React.RefObject<HTMLElement>
}

export const DocTableOfContents = ({ contentRef }: DocTableOfContentsProps) => {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Extract headings from DOM - memoized to prevent infinite loops
  const extractHeadings = useCallback((): TocItem[] => {
    if (!contentRef.current) return []
    
    const headingElements = contentRef.current.querySelectorAll('h2[id], h3[id]')
    const detectedHeadings: TocItem[] = []
    
    headingElements.forEach((heading) => {
      const id = heading.getAttribute('id') || ''
      const text = heading.textContent || ''
      const level = heading.tagName === 'H2' ? 2 : 3
      if (id && text) {
        detectedHeadings.push({ id, text, level })
      }
    })
    
    return detectedHeadings
  }, [contentRef])

  // Initial extraction and mutation observer
  useEffect(() => {
    if (!contentRef.current) return

    // Defer initial setState to avoid synchronous setState in effect (cascading renders)
    const initialHeadings = extractHeadings()
    queueMicrotask(() => setHeadings(initialHeadings))

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      const newHeadings = extractHeadings()
      setHeadings(prev => {
        // Only update if actually different to prevent loops
        if (prev.length !== newHeadings.length) return newHeadings
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id !== newHeadings[i]?.id) return newHeadings
        }
        return prev
      })
    })

    observer.observe(contentRef.current, { childList: true, subtree: true })
    
    return () => observer.disconnect()
  }, [contentRef, extractHeadings])

  // Scroll spy for active heading
  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      const headingElements = document.querySelectorAll('h2[id], h3[id]')
      let currentActiveId = ''

      headingElements.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 150) {
          currentActiveId = heading.getAttribute('id') || ''
        }
      })

      if (currentActiveId && currentActiveId !== activeId) {
        setActiveId(currentActiveId)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings, activeId])

  const handleClick = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }, [])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="hidden xl:block w-64 flex-shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          In this article
        </h3>
        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => handleClick(heading.id)}
              className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                heading.level === 3 ? 'ml-4' : ''
              } ${
                activeId === heading.id
                  ? 'text-teal-400 bg-teal-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
              title={heading.text}
            >
              <span className="block truncate">{heading.text}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
