# Sequentia PM — PM properties and principles

## Key properties

| Property | Value |
|----------|-------|
| Name | Sequentia Project Manager |
| Business owner (customer) | Marek Rost |
| Business language | English |
| Developer | Marek Rost |
| Developer team size | 1 |
| Development language | English |
| Platform | Electron (cross-platform desktop) |
| License | GPL-3.0 |
| Repository | sequentia-pm |

## Principles

### P-001: Privacy by design
All data stays on the local machine. The application is fully air-gapped — no telemetry, no CDN fetches, no network calls of any kind. All JS libraries are bundled into the Electron app at build time.

### P-002: Structure over magic
The application relies on a standardized folder naming convention with numbered prefixes. There is no hidden database, no proprietary format, no configuration file. The directory IS the project.

### P-003: Tool agnostic
Files use open formats (CSV, Markdown, DBML) so they remain readable and editable even without Sequentia. A user can open any file in a text editor, spreadsheet, or other tool and the data is fully accessible.

### P-004: Extension-driven routing
The editor component is chosen by file extension, not by prefix number. Prefixes control only tab ordering and labeling. This means adding a new `.csv` file at any prefix automatically gets the spreadsheet editor.

### P-005: Unknown file zero state
Files with supported file type but with unreadable or missing numeric prefix are shown at the end of the document tab pane. Files with unsupported content type are shown but switching to them will display the fact instead of editor. Files that are both unsupported and without numeric prefix will be shown at the very end of document tabs.

### P-006: File system is the source of truth
All editors read from and write back to the original files on disk. There is no intermediate cache, no import/export step, no sync. The file on disk is always the canonical version.

### P-007: Minimal footprint
The application does not create configuration files, lock files, metadata directories, or any other artifacts in the project directory. It reads and writes only the files that the user explicitly created.

### P-008: Graceful external changes
External edits to project files (e.g. via `git pull`, text editor, or CI) are detected via file watching and reflected in the UI. Clean buffers reload automatically; dirty buffers prompt the user.

### P-009: Single-window simplicity
One project directory, one window, one tab bar. No multi-window management, no workspace concept, no project-within-project nesting. The complexity ceiling is deliberately low.
