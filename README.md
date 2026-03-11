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

Compile the app, then package for your platform:

```bash
npm run build                        # compile to out/
npm run package:win                  # Windows
npm run package:mac                  # macOS
npm run package:linux                # Linux
```

To build a single target, pass it explicitly: `npx electron-builder --linux AppImage`.

Distributables are output to `dist/`.

### Build targets

| Platform | Target | Command | Output |
|----------|--------|---------|--------|
| Windows | `nsis` | `npx electron-builder --win nsis` | Standard installer |
| Windows | `portable` | `npx electron-builder --win portable` | Standalone `.exe`, no installation needed |
| macOS | `dmg` | `npx electron-builder --mac dmg` | Disk image for drag-to-install |
| macOS | `zip` | `npx electron-builder --mac zip` | ZIP archive, suitable for auto-update |
| Linux | `AppImage` | `npx electron-builder --linux AppImage` | Portable, no installation needed |
| Linux | `deb` | `npx electron-builder --linux deb` | Debian/Ubuntu package |
| Linux | `flatpak` | `npx electron-builder --linux flatpak` | Sandboxed package (see below) |

### Platform notes

**macOS** — The `.app` can be dragged directly to `Applications`. For distribution to other users, code signing and notarization are recommended.

**Flatpak** — Requires additional build dependencies:

```bash
sudo apt install flatpak-builder
flatpak install org.freedesktop.Platform//24.08 org.freedesktop.Sdk//24.08 org.electronjs.Electron2.BaseApp//24.08
```

Install the built package with:

```bash
flatpak install --user --bundle 'dist/Sequentia PM-0.1.0-x86_64.flatpak'
```
