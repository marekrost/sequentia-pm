import { useEffect, useState } from 'react'
import { useProjectStore } from '../../stores/projectStore'

function WelcomeScreen(): React.JSX.Element {
  const openProject = useProjectStore((s) => s.openProject)
  const [recentProjects, setRecentProjects] = useState<string[]>([])

  useEffect(() => {
    window.api.getRecentProjects().then(setRecentProjects)
  }, [])

  const handleOpen = async (): Promise<void> => {
    const path = await window.api.openDirectoryDialog()
    if (path) {
      await openProject(path)
    }
  }

  const handleOpenRecent = async (path: string): Promise<void> => {
    await openProject(path)
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Sequentia PM</h1>
        <p className="mt-2 text-neutral-400">Local-first project management</p>
        <button
          onClick={handleOpen}
          className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          Open Project Directory
        </button>

        {recentProjects.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-medium text-neutral-400">Recent Projects</h2>
            <ul className="mt-3 space-y-1">
              {recentProjects.map((path) => (
                <li key={path}>
                  <button
                    onClick={() => handleOpenRecent(path)}
                    className="w-full rounded px-4 py-2 text-left text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
                    title={path}
                  >
                    {path.split('/').slice(-2).join('/') || path}
                    <span className="ml-2 text-xs text-neutral-500">{path}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default WelcomeScreen
