import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { type DocMeta } from '@/docs/registry'
import { DocChrome } from '@/components/docs/DocChrome'
import { DocHeader, DocResources } from '@/components/docs/mdx'
import { scrollToDocsAnchor } from '@/lib/docs-anchor'
import Seo from '@/components/seo/Seo'
import { getDocSeoPage } from '@/seo/routes'

const docModules = import.meta.glob<{ default: React.ComponentType }>('../content/docs/**/*.mdx')

interface DocsPageProps {
  doc: DocMeta
}

const DocsPage = ({ doc }: DocsPageProps) => {
  const [Content, setContent] = useState<React.ComponentType | null>(null)
  const [loadedDocId, setLoadedDocId] = useState<string | null>(null)
  const lastPathRef = useRef<string | null>(null)
  const location = useLocation()
  const loading = loadedDocId !== doc.id

  useEffect(() => {
    let cancelled = false

    const loadDoc = async () => {
      try {
        const importPath = `../content/docs/${doc.contentPath}`
        const loadComponent = docModules[importPath]
        if (loadComponent) {
          const module = await loadComponent()
          if (!cancelled) {
            setContent(() => module.default)
          }
        } else {
          console.error(`Doc module not found: ${importPath}`)
          if (!cancelled) {
            setContent(null)
          }
        }
      } catch (error) {
        console.error('Failed to load doc:', error)
        if (!cancelled) {
          setContent(null)
        }
      }

      if (!cancelled) {
        setLoadedDocId(doc.id)
      }
    }

    void loadDoc()

    return () => {
      cancelled = true
    }
  }, [doc])

  useEffect(() => {
    if (loading) {
      return
    }

    const isSameDocument = lastPathRef.current === location.pathname
    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        scrollToDocsAnchor(location.hash, isSameDocument ? 'smooth' : 'auto')
      } else if (lastPathRef.current !== location.pathname) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }

      lastPathRef.current = location.pathname
    })

    return () => window.cancelAnimationFrame(frame)
  }, [loading, location.hash, location.pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  const ContentComponent = Content

  return (
    <div className="space-y-8">
      <Seo page={getDocSeoPage(doc)} />
      <DocHeader meta={doc} />

      <DocChrome>
        <div className="border-l-4 border-teal-500 pl-6">
          {ContentComponent ? (
            <ContentComponent />
          ) : (
            <p className="text-gray-400">Content loading failed. Try refreshing the page.</p>
          )}

          {doc.links && (
            <>
              <h2 id="resources" className="text-2xl font-bold text-white mt-8 mb-4">Resources</h2>
              <DocResources links={doc.links} />
            </>
          )}
        </div>
      </DocChrome>
    </div>
  )
}

export default DocsPage
