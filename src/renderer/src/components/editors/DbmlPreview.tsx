import { useEffect, useState } from 'react'
import { renderDbml, type DbmlRenderResult } from '../../lib/dbmlRenderer'
import { useDebounce } from '../../hooks/useDebounce'

interface DbmlPreviewProps {
  source: string
}

function DbmlPreview({ source }: DbmlPreviewProps): React.JSX.Element {
  const debounced = useDebounce(source, 400)
  const [zoom, setZoom] = useState(1)
  const [result, setResult] = useState<DbmlRenderResult>({ svg: null, error: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    renderDbml(debounced).then((r) => {
      if (!cancelled) {
        setResult((prev) => (r.svg ? r : { svg: prev.svg, error: r.error }))
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [debounced])

  const { svg, error } = result

  return (
    <div className="flex h-full flex-col bg-neutral-850">
      <div className="flex items-center gap-2 border-b border-neutral-700 px-3 py-1.5">
        <span className="text-xs text-neutral-500">ERD Preview</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            className="rounded px-2 py-0.5 text-xs text-neutral-400 hover:bg-neutral-700"
          >
            -
          </button>
          <span className="w-12 text-center text-xs text-neutral-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="rounded px-2 py-0.5 text-xs text-neutral-400 hover:bg-neutral-700"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="rounded px-2 py-0.5 text-xs text-neutral-400 hover:bg-neutral-700"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="mb-2 rounded bg-red-900/40 px-3 py-2 text-xs text-red-300">{error}</div>
        )}
        {svg ? (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          !error && (
            <div className="text-sm text-neutral-500">
              {loading ? 'Rendering...' : 'Enter DBML to see the diagram'}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default DbmlPreview
