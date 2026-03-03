import { contextBridge, ipcRenderer } from 'electron'
import type { ProjectFile } from '@shared/types/project'

const api = {
  openDirectoryDialog: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:openDirectory'),

  showConfirmDialog: (message: string, detail?: string): Promise<boolean> =>
    ipcRenderer.invoke('dialog:confirm', message, detail),

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
  },

  getRecentProjects: (): Promise<string[]> =>
    ipcRenderer.invoke('store:getRecentProjects'),

  addRecentProject: (projectPath: string): Promise<string[]> =>
    ipcRenderer.invoke('store:addRecentProject', projectPath),

  createProjectDir: (parentPath: string): Promise<string> =>
    ipcRenderer.invoke('project:create', parentPath),

  onMenuCreateProject: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on('menu:create-project', handler)
    return () => ipcRenderer.removeListener('menu:create-project', handler)
  },

  onMenuOpenProject: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on('menu:open-project', handler)
    return () => ipcRenderer.removeListener('menu:open-project', handler)
  },

  onMenuOpenRecent: (callback: (projectPath: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, projectPath: string): void =>
      callback(projectPath)
    ipcRenderer.on('menu:open-recent', handler)
    return () => ipcRenderer.removeListener('menu:open-recent', handler)
  },

  onMenuCloseProject: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on('menu:close-project', handler)
    return () => ipcRenderer.removeListener('menu:close-project', handler)
  }
}

contextBridge.exposeInMainWorld('api', api)
