import { useEffect } from 'react'
import { useProjectStore } from '../stores/projectStore'

export function useFileWatcher(): void {
  const projectPath = useProjectStore((s) => s.projectPath)
  const openProject = useProjectStore((s) => s.openProject)

  useEffect(() => {
    if (!projectPath) return

    window.api.startWatching(projectPath)

    const unsubAdded = window.api.onFileAdded(() => {
      openProject(projectPath)
    })

    const unsubRemoved = window.api.onFileRemoved(() => {
      openProject(projectPath)
    })

    return () => {
      window.api.stopWatching()
      unsubAdded()
      unsubRemoved()
    }
  }, [projectPath, openProject])
}
