import { useEffect } from 'react'
import { useProjectStore } from './stores/projectStore'
import { useFileWatcher } from './hooks/useFileWatcher'
import WelcomeScreen from './components/layout/WelcomeScreen'
import TabBar from './components/layout/TabBar'
import EditorRouter from './components/editors/EditorRouter'

function App(): React.JSX.Element {
  const projectPath = useProjectStore((s) => s.projectPath)
  const files = useProjectStore((s) => s.files)
  const activeTabIndex = useProjectStore((s) => s.activeTabIndex)
  const setActiveTab = useProjectStore((s) => s.setActiveTab)

  const openProject = useProjectStore((s) => s.openProject)
  const closeProject = useProjectStore((s) => s.closeProject)

  useFileWatcher()

  // Menu event handlers
  useEffect(() => {
    const unsubCreate = window.api.onMenuCreateProject(async () => {
      const parentPath = await window.api.openDirectoryDialog()
      if (!parentPath) return
      const projectDir = await window.api.createProjectDir(parentPath)
      await openProject(projectDir)
    })
    const unsubOpen = window.api.onMenuOpenProject(async () => {
      const path = await window.api.openDirectoryDialog()
      if (path) await openProject(path)
    })
    const unsubRecent = window.api.onMenuOpenRecent(async (path) => {
      await openProject(path)
    })
    const unsubClose = window.api.onMenuCloseProject(() => {
      closeProject()
    })
    return () => {
      unsubCreate()
      unsubOpen()
      unsubRecent()
      unsubClose()
    }
  }, [openProject, closeProject])

  // Tab switching: Ctrl+Tab / Ctrl+Shift+Tab
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (!e.ctrlKey || e.key !== 'Tab') return
      e.preventDefault()
      const count = files.length
      if (count === 0) return

      if (e.shiftKey) {
        setActiveTab((activeTabIndex - 1 + count) % count)
      } else {
        setActiveTab((activeTabIndex + 1) % count)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [files.length, activeTabIndex, setActiveTab])

  if (!projectPath) {
    return <WelcomeScreen />
  }

  const activeFile = files[activeTabIndex]

  return (
    <div className="flex h-screen flex-col bg-neutral-900 text-neutral-100">
      <TabBar />
      <div className="flex-1 overflow-hidden">
        {activeFile ? (
          <EditorRouter file={activeFile} />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500">
            No files found in project directory
          </div>
        )}
      </div>
    </div>
  )
}

export default App
