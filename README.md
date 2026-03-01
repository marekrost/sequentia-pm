# Sequentia PM

Local-first, air-gapped, file-driven project management interface. Sequentia scans a directory for prefix-numbered files (`00-charter.md`, `02-backlog.csv`, `05-models.dbml`) and presents them as tabs with purpose-built editors for each file type.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Electron 33 |
| Frontend | React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Markdown editing | Monaco Editor with live preview |
| CSV editing | react-data-grid + HyperFormula |
| DBML diagrams | Monaco Editor + @softwaretechnik/dbml-renderer (SVG) |
| CSV parsing | papaparse |
| File watching | chokidar 4 |
| State management | Zustand 5 |
| Build tooling | electron-vite 3 (Vite 6) |

## Prerequisites

- Node.js >= 20
- npm >= 10

## Development

```bash
npm install
npm run dev
```

This launches the Electron app with hot-reload for the renderer process.

## Build

```bash
npm run build
```

Compiles the app to the `out/` directory. To package a distributable:

```bash
npx electron-builder
```

The packaged app is fully air-gapped — all assets are bundled with no CDN dependencies.

## License

GPL-3.0 — see [LICENSE](LICENSE) for details.
