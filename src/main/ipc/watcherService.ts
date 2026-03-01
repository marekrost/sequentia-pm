import { BrowserWindow } from 'electron'
import { watch, type FSWatcher } from 'chokidar'

export class WatcherService {
  private watcher: FSWatcher | null = null
  private mainWindow: BrowserWindow
  private writeLock = new Set<string>()

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  /** Temporarily ignore chokidar events for a file after the app writes to it */
  lockFile(filePath: string): void {
    this.writeLock.add(filePath)
    setTimeout(() => this.writeLock.delete(filePath), 1000)
  }

  watch(dirPath: string): void {
    this.close()

    this.watcher = watch(dirPath, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 }
    })

    const fileFilter = /\.(md|csv|dbml)$/

    this.watcher.on('change', (filePath) => {
      if (!fileFilter.test(filePath)) return
      if (this.writeLock.has(filePath)) return
      this.mainWindow.webContents.send('file:changed', filePath)
    })

    this.watcher.on('add', (filePath) => {
      if (!fileFilter.test(filePath)) return
      this.mainWindow.webContents.send('file:added', filePath)
    })

    this.watcher.on('unlink', (filePath) => {
      if (!fileFilter.test(filePath)) return
      this.mainWindow.webContents.send('file:removed', filePath)
    })
  }

  close(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
  }
}
