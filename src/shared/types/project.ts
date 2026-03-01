export type FileExtension = 'md' | 'csv' | 'dbml'

export interface ProjectFile {
  prefix: number
  name: string
  fileName: string
  filePath: string
  extension: FileExtension
}
