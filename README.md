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

### Linux

This builds all configured Linux targets:

```bash
npx electron-builder --linux
```

To build a specific one:

```bash
npx electron-builder --linux AppImage
npx electron-builder --linux deb
npx electron-builder --linux flatpak
```

| Target | Notes |
|--------|-------|
| AppImage | Portable, no installation needed |
| deb | Debian/Ubuntu package |
| flatpak | Sandboxed — requires `flatpak-builder` and the Freedesktop runtime |

### Windows

```bash
npm run package:win
```

This builds all configured Windows targets (NSIS installer and portable executable). To build a specific one:

```bash
npx electron-builder --win nsis
npx electron-builder --win portable
```

| Target | Notes |
|--------|-------|
| nsis | Standard Windows installer |
| portable | Standalone `.exe`, no installation needed |

### Building flatpak

For flatpak, install the build dependencies first:

```bash
sudo apt install flatpak-builder
flatpak install org.freedesktop.Platform//24.08 org.freedesktop.Sdk//24.08 org.electronjs.Electron2.BaseApp//24.08
```

To build the flatpak file run:

```bash
npx electron-builder --linux flatpak
```

To install the finished package run:

```bash
flatpak install --user --bundle 'dist/Sequentia PM-0.1.0-x86_64.flatpak'
```
