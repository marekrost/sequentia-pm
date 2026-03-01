import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import MonacoWrapper from '../shared/MonacoWrapper'
import MarkdownPreview from './MarkdownPreview'
import { useFileContent } from '../../hooks/useFileContent'
import type { ProjectFile } from '../../types/project'

interface MarkdownEditorProps {
  file: ProjectFile
}

function MarkdownEditor({ file }: MarkdownEditorProps): React.JSX.Element {
  const { content, loading, error, setContent, save } = useFileContent(file.filePath)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-500">Loading...</div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-400">Error: {error}</div>
    )
  }

  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={50} minSize={30}>
        <MonacoWrapper
          value={content ?? ''}
          language="markdown"
          onChange={setContent}
          onSave={save}
        />
      </Panel>
      <PanelResizeHandle className="w-1 bg-neutral-700 transition-colors hover:bg-blue-500" />
      <Panel defaultSize={50} minSize={20}>
        <MarkdownPreview source={content ?? ''} />
      </Panel>
    </PanelGroup>
  )
}

export default MarkdownEditor
