import { app, BrowserWindow, nativeTheme, shell } from 'electron'
import { join, resolve } from 'path'
import { registerIpcHandlers } from './ipc/handlers'
import { buildAppMenu } from './menu'

function parseArgs(argv: string[]): { project?: string; help?: boolean } {
  // In dev mode electron-vite passes extra args; skip everything up to '--'
  // In production, skip argv[0] (binary path)
  const args = argv.slice(app.isPackaged ? 1 : argv.indexOf('--') + 1)
  const result: { project?: string; help?: boolean } = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--help' || arg === '-h') {
      result.help = true
    } else if (arg === '--project' || arg === '-p') {
      const next = args[i + 1]
      if (next && !next.startsWith('-')) {
        result.project = resolve(next)
        i++
      }
    }
  }
  return result
}

const cliArgs = parseArgs(process.argv)

if (cliArgs.help) {
  process.stdout.write(
    `Sequentia PM — local-first project management

Usage:
  sequentia-pm [options]

Options:
  -p, --project <path>  Open the given directory as a project
  -h, --help            Show this help message and exit
`
  )
  process.exit(0)
}

// Force dark theme for native UI (menubar, dialogs) on Linux/Flatpak
if (process.platform === 'linux') {
  process.env['GTK_THEME'] = 'Adwaita:dark'
}
nativeTheme.themeSource = 'dark'

const isDev = !app.isPackaged
const iconPath = isDev
  ? join(__dirname, '../../resources/icon.png')
  : join(process.resourcesPath, 'icon.png')

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#171717',
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  registerIpcHandlers(mainWindow)
  buildAppMenu(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (cliArgs.project) {
      mainWindow.webContents.send('menu:open-recent', cliArgs.project)
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
