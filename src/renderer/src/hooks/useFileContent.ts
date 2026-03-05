import { useEffect, useState, useCallback } from 'react'
import { useProjectStore } from '../stores/projectStore'

interface UseFileContentReturn {
  content: string | null
  loading: boolean
  error: string | null
  setContent: (value: string) => void
  save: () => Promise<void>
}

export function useFileContent(filePath: string): UseFileContentReturn {
  const [content, setContent] = useState<string | null>(null)
  const [savedContent, setSavedContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const markDirty = useProjectStore((s) => s.markDirty)
  const markClean = useProjectStore((s) => s.markClean)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const buffer = useProjectStore.getState().buffers.get(filePath)

    window.api
      .readFile(filePath)
      .then((text) => {
        if (!cancelled) {
          setSavedContent(text)
          if (buffer !== undefined) {
            setContent(buffer)
            if (buffer !== text) {
              markDirty(filePath)
            } else {
              markClean(filePath)
            }
          } else {
            setContent(text)
            markClean(filePath)
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [filePath, markClean, markDirty])

  const handleSetContent = useCallback(
    (value: string) => {
      setContent(value)
      if (value !== savedContent) {
        markDirty(filePath)
        useProjectStore.getState().setBuffer(filePath, value)
      } else {
        markClean(filePath)
        useProjectStore.getState().clearBuffer(filePath)
      }
    },
    [filePath, savedContent, markDirty, markClean]
  )

  // Listen for external file changes
  useEffect(() => {
    const unsub = window.api.onFileChanged((changedPath) => {
      if (changedPath !== filePath) return
      const isDirty = content !== savedContent

      if (!isDirty) {
        window.api.readFile(filePath).then((text) => {
          setContent(text)
          setSavedContent(text)
        })
        return
      }

      const fileName = filePath.split('/').pop() ?? filePath
      window.api
        .showConfirmDialog(
          `"${fileName}" has been changed externally.`,
          'You have unsaved edits. Do you want to reload the file or keep your local version?'
        )
        .then((reload) => {
          if (!reload) return
          window.api.readFile(filePath).then((text) => {
            setContent(text)
            setSavedContent(text)
            markClean(filePath)
            useProjectStore.getState().clearBuffer(filePath)
          })
        })
    })
    return unsub
  }, [filePath, content, savedContent, markClean])

  const save = useCallback(async () => {
    if (content === null) return
    try {
      await window.api.writeFile(filePath, content)
      setSavedContent(content)
      markClean(filePath)
      useProjectStore.getState().clearBuffer(filePath)
    } catch (err) {
      setError(String(err))
    }
  }, [content, filePath, markClean])

  return { content, loading, error, setContent: handleSetContent, save }
}
