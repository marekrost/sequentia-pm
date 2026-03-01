import { contextBridge, ipcRenderer } from 'electron'

interface ProjectFile {
  prefix: number
  name: string
  fileName: string
  filePath: string
  extension: 'md' | 'csv' | 'dbml'
}

const api = {
  openDirectoryDialog: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:openDirectory'),

  readFile: (filePath: string): Promise<string> =>
    ipcRenderer.invoke('file:read', filePath),

  writeFile: (filePath: string, content: string): Promise<void> =>
    ipcRenderer.invoke('file:write', filePath, content),

  scanDirectory: (dirPath: string): Promise<ProjectFile[]> =>
    ipcRenderer.invoke('dir:scan', dirPath),

  renderDbml: (source: string): Promise<{ svg: string | null; error: string | null }> =>
    ipcRenderer.invoke('dbml:render', source),

  startWatching: (dirPath: string): Promise<void> =>
    ipcRenderer.invoke('watcher:start', dirPath),

  stopWatching: (): Promise<void> =>
    ipcRenderer.invoke('watcher:stop'),

  onFileChanged: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, filePath: string): void =>
      callback(filePath)
    ipcRenderer.on('file:changed', handler)
    return () => ipcRenderer.removeListener('file:changed', handler)
  },

  onFileAdded: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, filePath: string): void =>
      callback(filePath)
    ipcRenderer.on('file:added', handler)
    return () => ipcRenderer.removeListener('file:added', handler)
  },

  onFileRemoved: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, filePath: string): void =>
      callback(filePath)
    ipcRenderer.on('file:removed', handler)
    return () => ipcRenderer.removeListener('file:removed', handler)
  }
}

contextBridge.exposeInMainWorld('api', api)
