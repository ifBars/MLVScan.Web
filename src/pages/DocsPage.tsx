import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { type DocMeta } from '@/docs/registry'
import { DocChrome } from '@/components/docs/DocChrome'
import { DocHeader, DocResources } from '@/components/docs/mdx'
import { scrollToDocsAnchor } from '@/lib/docs-anchor'
import Seo from '@/components/seo/Seo'
import { getDocSeoPage } from '@/seo/routes'

const docModules = import.meta.glob<{ default: React.ComponentType }>('../content/docs/**/*.mdx', { eager: true })

interface DocsPageProps {
  doc: DocMeta
}

const DocsPage = ({ doc }: DocsPageProps) => {
  const lastPathRef = useRef<string | null>(null)
  const location = useLocation()
  const ContentComponent = docModules[`../content/docs/${doc.contentPath}`]?.default ?? null

  useEffect(() => {
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
  }, [doc.id, location.hash, location.pathname])

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
