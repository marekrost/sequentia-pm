# Sequentia PM — Technical profile

## Technology Stack

| Technology | Role | Choice |
|------------|------|--------|
| Platform | Desktop runtime | Electron 33 |
| Language | Application language | TypeScript 5 |
| UI framework | Component rendering | React 19 |
| Build system | Bundling and dev server | electron-vite (Vite) |
| Styling | CSS framework | Tailwind CSS 4 |
| Code editor | Text editing component | Monaco Editor |
| Spreadsheet grid | CSV editing component | react-data-grid |
| Formula engine | Spreadsheet formulas | HyperFormula |
| Markdown renderer | HTML preview generation | marked |
| ERD renderer | DBML to SVG conversion | @softwaretechnik/dbml-renderer |
| File watcher | External change detection | chokidar |
| State management | Application state | Zustand |
| Packaging | Distribution builds | electron-builder |

## Supported File Types

| Extension | Editor | Purpose |
|-----------|--------|---------|
| `.md` | Monaco Editor + live preview | Documentation, charters, scenarios |
| `.csv` | react-data-grid + HyperFormula | Backlogs, estimates, tasks, schedules |
| `.dbml` | Monaco Editor + SVG ERD renderer | Entity-relationship diagrams |

## Module / File Organization

```
sequentia-pm/
├── project/                 Project management files (this sequence)
├── resources/               Application icons and build assets
├── src/
│   ├── main/                Electron main process
│   │   ├── ipc/             IPC handlers, file ops, watcher service
│   │   └── utils/           Directory scanner, recent projects
│   ├── preload/             contextBridge secure IPC bridge
│   ├── renderer/src/        React renderer
│   │   ├── components/
│   │   │   ├── editors/     Markdown, CSV, DBML editor components
│   │   │   ├── layout/      Tab bar, welcome screen
│   │   │   └── shared/      Monaco wrapper, toolbar, status bar
│   │   ├── hooks/           File content, file watcher, debounce
│   │   ├── lib/             CSV, markdown, DBML parsers/renderers
│   │   └── stores/          Zustand project state
│   └── shared/types/        IPC API and domain type definitions
├── dist/                    Packaged application output
└── out/                     Compiled build output
```
