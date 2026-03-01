import { useEffect, useMemo } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import MonacoWrapper from '../shared/MonacoWrapper'
import DbmlPreview from './DbmlPreview'
import StatusBar from '../shared/StatusBar'
import EditorToolbar from '../shared/EditorToolbar'
import { useFileContent } from '../../hooks/useFileContent'
import { registerDbmlLanguage } from '../../lib/monacoLanguages'
import type { ProjectFile } from '@shared/types/project'

interface DbmlEditorProps {
  file: ProjectFile
}

function DbmlEditor({ file }: DbmlEditorProps): React.JSX.Element {
  const { content, loading, error, setContent, save } = useFileContent(file.filePath)

  useEffect(() => {
    registerDbmlLanguage()
  }, [])

  const stats = useMemo(() => {
    const text = content ?? ''
    const chars = text.length
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    return { chars, words }
  }, [content])

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
    <div className="flex h-full flex-col">
      <EditorToolbar />
      <div className="min-h-0 flex-1">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={30}>
            <MonacoWrapper
              value={content ?? ''}
              language="dbml"
              onChange={setContent}
              onSave={save}
            />
          </Panel>
          <PanelResizeHandle className="w-1 bg-neutral-700 transition-colors hover:bg-blue-500" />
          <Panel defaultSize={50} minSize={20}>
            <DbmlPreview source={content ?? ''} />
          </Panel>
        </PanelGroup>
      </div>

      <StatusBar>
        <span>{stats.chars.toLocaleString()} characters</span>
        <span>{stats.words.toLocaleString()} words</span>
      </StatusBar>
    </div>
  )
}

export default DbmlEditor
