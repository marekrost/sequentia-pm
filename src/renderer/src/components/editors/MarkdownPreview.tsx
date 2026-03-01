import { useMemo } from 'react'
import { renderMarkdown } from '../../lib/markdownRenderer'
import { useDebounce } from '../../hooks/useDebounce'

interface MarkdownPreviewProps {
  source: string
}

function MarkdownPreview({ source }: MarkdownPreviewProps): React.JSX.Element {
  const debounced = useDebounce(source, 200)
  const html = useMemo(() => renderMarkdown(debounced), [debounced])

  return (
    <div className="h-full overflow-auto bg-neutral-850 p-6">
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export default MarkdownPreview
