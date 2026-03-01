import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFile, writeFile } from './fileOperations'
import { scanDirectory } from '../utils/directoryScanner'
import { WatcherService } from './watcherService'
import { run as renderDbml } from '@softwaretechnik/dbml-renderer'

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  const watcher = new WatcherService(mainWindow)

  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('file:read', async (_e, filePath: string) => {
    return readFile(filePath)
  })

  ipcMain.handle('file:write', async (_e, filePath: string, content: string) => {
    watcher.lockFile(filePath)
    return writeFile(filePath, content)
  })

  ipcMain.handle('dir:scan', async (_e, dirPath: string) => {
    return scanDirectory(dirPath)
  })

  ipcMain.handle('dbml:render', async (_e, source: string) => {
    try {
      const svg = renderDbml(source, 'svg')
      return { svg, error: null }
    } catch (err) {
      return { svg: null, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('watcher:start', async (_e, dirPath: string) => {
    watcher.watch(dirPath)
  })

  ipcMain.handle('watcher:stop', async () => {
    watcher.close()
  })
}
