import { useEffect, useState } from 'react'
import { type DocMeta } from '@/docs/registry'
import { DocChrome } from '@/components/docs/DocChrome'
import { DocHeader, DocResources } from '@/components/docs/mdx'

const docModules = import.meta.glob<{ default: React.ComponentType }>('../content/docs/**/*.mdx')

interface DocsPageProps {
  doc: DocMeta
}

const DocsPage = ({ doc }: DocsPageProps) => {
  const [Content, setContent] = useState<React.ComponentType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true)
      
      try {
        const importPath = `../content/docs/${doc.contentPath}`
        const loadComponent = docModules[importPath]
        if (loadComponent) {
          const module = await loadComponent()
          setContent(() => module.default)
        } else {
          console.error(`Doc module not found: ${importPath}`)
          setContent(null)
        }
      } catch (error) {
        console.error('Failed to load doc:', error)
        setContent(null)
      }
      
      setLoading(false)
    }

    loadDoc()
  }, [doc])

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
      <DocHeader meta={doc} />
      
      <DocChrome>
        <div className="border-l-4 border-teal-500 pl-6">
          {ContentComponent ? (
            <ContentComponent />
          ) : (
            <p className="text-gray-400">Content loading failed.</p>
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
