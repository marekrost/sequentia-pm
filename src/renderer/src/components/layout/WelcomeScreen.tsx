import { useProjectStore } from '../../stores/projectStore'

function WelcomeScreen(): React.JSX.Element {
  const openProject = useProjectStore((s) => s.openProject)

  const handleOpen = async (): Promise<void> => {
    const path = await window.api.openDirectoryDialog()
    if (path) {
      await openProject(path)
    }
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
      </div>
    </div>
  )
}

export default WelcomeScreen
