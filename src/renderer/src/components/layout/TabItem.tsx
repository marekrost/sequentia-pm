import type { ProjectFile } from '../../types/project'

interface TabItemProps {
  file: ProjectFile
  isActive: boolean
  isDirty: boolean
  onClick: () => void
}

const extensionColors: Record<string, string> = {
  md: 'bg-emerald-500',
  csv: 'bg-amber-500',
  dbml: 'bg-violet-500'
}

function TabItem({ file, isActive, isDirty, onClick }: TabItemProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'border-blue-500 text-white'
          : 'border-transparent text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
      }`}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${extensionColors[file.extension] ?? 'bg-neutral-500'}`}
      />
      <span className="capitalize">{file.name}</span>
      <span className="text-xs text-neutral-500">.{file.extension}</span>
      {isDirty && <span className="ml-1 text-xs text-amber-400">*</span>}
    </button>
  )
}

export default TabItem
