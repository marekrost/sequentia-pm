import { useCallback, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import MonacoWrapper, { type MonacoHandle } from '../shared/MonacoWrapper'
import MarkdownPreview from './MarkdownPreview'
import { useFileContent } from '../../hooks/useFileContent'
import type { ProjectFile } from '../../types/project'

interface MarkdownEditorProps {
  file: ProjectFile
}

function MarkdownEditor({ file }: MarkdownEditorProps): React.JSX.Element {
  const { content, loading, error, setContent, save } = useFileContent(file.filePath)
  const monacoRef = useRef<MonacoHandle>(null)

  const wrapSelection = useCallback((before: string, after: string) => {
    const editor = monacoRef.current?.getEditor()
    if (!editor) return
    const selection = editor.getSelection()
    if (!selection) return
    const model = editor.getModel()
    if (!model) return
    const selected = model.getValueInRange(selection)
    editor.executeEdits('md-toolbar', [
      { range: selection, text: `${before}${selected}${after}` }
    ])
    editor.focus()
  }, [])

  const prefixLine = useCallback((prefix: string) => {
    const editor = monacoRef.current?.getEditor()
    if (!editor) return
    const selection = editor.getSelection()
    if (!selection) return
    const model = editor.getModel()
    if (!model) return
    const startLine = selection.startLineNumber
    const endLine = selection.endLineNumber
    const edits: { range: import('monaco-editor').IRange; text: string }[] = []
    for (let line = startLine; line <= endLine; line++) {
      const pos = { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 }
      edits.push({ range: pos, text: prefix })
    }
    editor.executeEdits('md-toolbar', edits)
    editor.focus()
  }, [])

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
      {/* Toolbar (F-031) */}
      <div className="flex shrink-0 items-center gap-1 border-b border-neutral-700 bg-neutral-800 px-2 py-1">
        <button
          onClick={() => wrapSelection('**', '**')}
          className="md-toolbar-btn font-bold"
          title="Bold (wrap selection with **)"
        >
          B
        </button>
        <button
          onClick={() => wrapSelection('*', '*')}
          className="md-toolbar-btn italic"
          title="Italic (wrap selection with *)"
        >
          I
        </button>
        <button
          onClick={() => prefixLine('# ')}
          className="md-toolbar-btn"
          title="Heading (prefix line with #)"
        >
          H
        </button>
        <button
          onClick={() => wrapSelection('[', '](url)')}
          className="md-toolbar-btn"
          title="Link (wrap selection as markdown link)"
        >
          Link
        </button>
        <button
          onClick={() => prefixLine('- ')}
          className="md-toolbar-btn"
          title="List (prefix line with -)"
        >
          List
        </button>
      </div>

      {/* Editor + Preview */}
      <div className="min-h-0 flex-1">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={30}>
            <MonacoWrapper
              ref={monacoRef}
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
      </div>
    </div>
  )
}

export default MarkdownEditor
