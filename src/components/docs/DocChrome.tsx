import { DocTableOfContents } from './DocTableOfContents'
import { useRef } from 'react'

interface DocChromeProps {
  children: React.ReactNode
}

export const DocChrome = ({ children }: DocChromeProps) => {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0" ref={contentRef}>
        <div className="space-y-8">
          {children}
        </div>
      </div>
      <DocTableOfContents contentRef={contentRef as React.RefObject<HTMLElement>} />
    </div>
  )
}
