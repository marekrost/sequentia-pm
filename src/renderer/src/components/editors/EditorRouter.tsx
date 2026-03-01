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
        <div className="flex h-full items-center justify-center text-neutral-500">
          Unsupported file type
        </div>
      )
  }
}

export default EditorRouter
