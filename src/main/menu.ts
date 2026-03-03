import { Menu, BrowserWindow } from 'electron'
import { getRecentProjects } from './utils/recentProjects'

export function buildAppMenu(mainWindow: BrowserWindow): void {
  const recentProjects = getRecentProjects()

  const recentSubmenu: Electron.MenuItemConstructorOptions[] =
    recentProjects.length > 0
      ? recentProjects.map((projectPath) => ({
          label: projectPath.split('/').slice(-2).join('/') || projectPath,
          toolTip: projectPath,
          click: () => mainWindow.webContents.send('menu:open-recent', projectPath)
        }))
      : [{ label: 'No Recent Projects', enabled: false }]

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Project',
      submenu: [
        {
          label: 'Create...',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu:create-project')
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu:open-project')
        },
        {
          label: 'Open Recent',
          submenu: recentSubmenu
        },
        { type: 'separator' },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => mainWindow.webContents.send('menu:close-project')
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]

  // macOS app menu
  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Sequentia PM',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
