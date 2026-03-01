import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'
import Editor from '@monaco-editor/react'

// Use local monaco instance — no CDN fetch (air-gapped safe)
loader.config({ monaco })

export interface MonacoHandle {
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null
}

interface MonacoWrapperProps {
  value: string
  language: string
  onChange?: (value: string) => void
  onSave?: () => void
  readOnly?: boolean
}

const MonacoWrapper = forwardRef<MonacoHandle, MonacoWrapperProps>(function MonacoWrapper(
  { value, language, onChange, onSave, readOnly = false },
  ref
) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useImperativeHandle(ref, () => ({
    getEditor: () => editorRef.current
  }))

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || !onSave) return

    const action = editor.addAction({
      id: 'sequentia-save',
      label: 'Save',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => onSave()
    })

    return () => action.dispose()
  }, [onSave])

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme="vs-dark"
      onChange={(v) => onChange?.(v ?? '')}
      onMount={(editor) => {
        editorRef.current = editor
      }}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        padding: { top: 12 }
      }}
    />
  )
})

export default MonacoWrapper
