import { useProjectStore } from '../../stores/projectStore'
import TabItem from './TabItem'

function TabBar(): React.JSX.Element {
  const files = useProjectStore((s) => s.files)
  const activeTabIndex = useProjectStore((s) => s.activeTabIndex)
  const dirtyFiles = useProjectStore((s) => s.dirtyFiles)
  const setActiveTab = useProjectStore((s) => s.setActiveTab)

  return (
    <div className="flex overflow-x-auto border-b border-neutral-700 bg-neutral-800">
      {files.map((file, index) => (
        <TabItem
          key={file.filePath}
          file={file}
          isActive={index === activeTabIndex}
          isDirty={dirtyFiles.has(file.filePath)}
          onClick={() => setActiveTab(index)}
        />
      ))}
    </div>
  )
}

export default TabBar
