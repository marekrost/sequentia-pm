import type { ProjectFile } from '@shared/types/project'
import MarkdownEditor from './MarkdownEditor'
import CsvEditor from './CsvEditor'
import DbmlEditor from './DbmlEditor'

interface EditorRouterProps {
  file: ProjectFile
}

function EditorRouter({ file }: EditorRouterProps): React.JSX.Element {
  switch (file.extension) {
    case 'md':
      return <MarkdownEditor file={file} />
    case 'csv':
      return <CsvEditor file={file} />
    case 'dbml':
      return <DbmlEditor file={file} />
    default:
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-500">
          <span className="text-lg font-medium">Unsupported format</span>
          <span className="text-sm">
            No editor available for <code className="rounded bg-neutral-700 px-1.5 py-0.5 text-neutral-300">.{file.extension}</code> files
          </span>
        </div>
      )
  }
}

export default EditorRouter
