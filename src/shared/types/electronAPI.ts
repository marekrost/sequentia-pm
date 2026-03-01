import type { ProjectFile } from './project'

export interface ElectronAPI {
  openDirectoryDialog: () => Promise<string | null>
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<void>
  scanDirectory: (dirPath: string) => Promise<ProjectFile[]>
  renderDbml: (source: string) => Promise<{ svg: string | null; error: string | null }>
  startWatching: (dirPath: string) => Promise<void>
  stopWatching: () => Promise<void>
  onFileChanged: (callback: (filePath: string) => void) => () => void
  onFileAdded: (callback: (filePath: string) => void) => () => void
  onFileRemoved: (callback: (filePath: string) => void) => () => void
  getRecentProjects: () => Promise<string[]>
  addRecentProject: (projectPath: string) => Promise<string[]>
  onMenuOpenProject: (callback: () => void) => () => void
  onMenuOpenRecent: (callback: (projectPath: string) => void) => () => void
  onMenuCloseProject: (callback: () => void) => () => void
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}

export {}
