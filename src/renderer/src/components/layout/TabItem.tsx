import type { ProjectFile } from '@shared/types/project'

interface TabItemProps {
  file: ProjectFile
  isActive: boolean
  isDirty: boolean
  onClick: () => void
}

const extensionBg: Record<string, string> = {
  md: 'rgba(16, 185, 129, 0.10)',
  csv: 'rgba(245, 158, 11, 0.10)',
  dbml: 'rgba(139, 92, 246, 0.10)'
}

const extensionBgActive: Record<string, string> = {
  md: 'rgba(16, 185, 129, 0.18)',
  csv: 'rgba(245, 158, 11, 0.18)',
  dbml: 'rgba(139, 92, 246, 0.18)'
}

function TabItem({ file, isActive, isDirty, onClick }: TabItemProps): React.JSX.Element {
  const bg = isActive
    ? extensionBgActive[file.extension]
    : extensionBg[file.extension]

  return (
    <button
      onClick={onClick}
      style={bg ? { backgroundColor: bg } : undefined}
      className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'border-blue-500 text-white'
          : 'border-transparent text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
      }`}
    >
      {file.prefix !== null && (
        <span className="text-xs text-neutral-500">{String(file.prefix).padStart(2, '0')}</span>
      )}
      <span className="capitalize">{file.name}</span>
      <span className="text-xs text-neutral-500">.{file.extension}</span>
      {isDirty && <span className="ml-1 text-xs text-amber-400">*</span>}
    </button>
  )
}

export default TabItem
