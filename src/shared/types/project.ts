export type SupportedExtension = 'md' | 'csv' | 'dbml'

export const SUPPORTED_EXTENSIONS: ReadonlySet<string> = new Set<SupportedExtension>([
  'md',
  'csv',
  'dbml'
])

export interface ProjectFile {
  prefix: number | null
  name: string
  fileName: string
  filePath: string
  extension: string
}
