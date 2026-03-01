import { useCallback, useMemo, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import MonacoWrapper, { type MonacoHandle } from '../shared/MonacoWrapper'
import MarkdownPreview from './MarkdownPreview'
import StatusBar from '../shared/StatusBar'
import EditorToolbar from '../shared/EditorToolbar'
import ToolbarButton from '../shared/ToolbarButton'
import { useFileContent } from '../../hooks/useFileContent'
import type { ProjectFile } from '@shared/types/project'

interface MarkdownEditorProps {
  file: ProjectFile
}

function MarkdownEditor({ file }: MarkdownEditorProps): React.JSX.Element {
  const { content, loading, error, setContent, save } = useFileContent(file.filePath)
  const monacoRef = useRef<MonacoHandle>(null)

  const stats = useMemo(() => {
    const text = content ?? ''
    const chars = text.length
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    return { chars, words }
  }, [content])

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
      <EditorToolbar>
        <ToolbarButton onClick={() => wrapSelection('**', '**')} title="Bold (wrap selection with **)" className="font-bold">
          B
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection('*', '*')} title="Italic (wrap selection with *)" className="italic">
          I
        </ToolbarButton>
        <ToolbarButton onClick={() => prefixLine('# ')} title="Heading (prefix line with #)">
          H
        </ToolbarButton>
        <ToolbarButton onClick={() => wrapSelection('[', '](url)')} title="Link (wrap selection as markdown link)">
          Link
        </ToolbarButton>
        <ToolbarButton onClick={() => prefixLine('- ')} title="List (prefix line with -)">
          List
        </ToolbarButton>
      </EditorToolbar>

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

      <StatusBar>
        <span>{stats.chars.toLocaleString()} characters</span>
        <span>{stats.words.toLocaleString()} words</span>
      </StatusBar>
    </div>
  )
}

export default MarkdownEditor
