import type { ProjectFile } from './project'

export interface ElectronAPI {
  openDirectoryDialog: () => Promise<string | null>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<void>
  scanDirectory: (dirPath: string) => Promise<ProjectFile[]>
  startWatching: (dirPath: string) => Promise<void>
  stopWatching: () => Promise<void>
  onFileChanged: (callback: (filePath: string) => void) => () => void
  onFileAdded: (callback: (filePath: string) => void) => () => void
  onFileRemoved: (callback: (filePath: string) => void) => () => void
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
