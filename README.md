# Sequentia Project Manager

Local-first, air-gapped, file-driven project management interface.

## 1. Purpose & Vision
The goal of **Sequentia** is to provide a unified, "native" interface for software project documentation. Instead of using disparate SaaS tools, the project state is stored in a structured prefixed sequence of local files (prefixes eg. `00` to `07`). The application acts as a high-performance "viewer" and "editor" that routes each file to an appropriate embedded editor based on its extension.

The secondary goal of this system is to provide project management structure that can be easily tracked via version control systems and thus sit directly inside the project repository.

### Key Principles:
* **Privacy by Design:** Fully air-gapped; no data leaves the local machine.
* **Structure over Magic:** Relies on a standardized folder naming convention.
* **Tool Agnostic:** Uses CSV, MD, and DBML so files remain readable even without the app.
* **Extension-Driven Routing:** The editor is chosen by file type, not by prefix. Prefixes control tab ordering and labeling only.

---

## 2. Technology Stack

### Core Framework:
* **Runtime:** Electron (Node.js + Chromium)
* **Frontend:** React with TypeScript
* **Styling:** Tailwind CSS (for a clean, "IDE-like" dashboard look)

### Document Engines:
* **Markdown (.md):** `Monaco Editor` for a VS Code-like editing experience with syntax highlighting and preview.
* **Spreadsheets (.csv):** `HyperFormula` (MIT-licensed calculation engine) with a custom React grid — full in-browser editing with no external sidecar required.
* **Database Diagrams (.dbml):** `Monaco Editor` (DBML syntax) + `@softwaretechnik/dbml-renderer` (client-side SVG generation) in a split-pane view.

---

## 3. The Folder-to-Tab Mapping Logic
The application scans the target directory and generates tabs based on the numbered prefix of each file. The editor rendered inside each tab is determined solely by the file extension.

### File Extension to Editor Mapping:

| Extension | Editor Component |
| :--- | :--- |
| `.md` | Monaco Editor (Markdown mode with live preview) |
| `.csv` | HyperFormula grid (spreadsheet with read/write) |
| `.dbml` | Monaco Editor (code) + SVG ERD renderer (split-pane) |

### Example Project Layout:

| Prefix | Content Type | File Ext | Editor |
| :--- | :--- | :--- | :--- |
| **00** | Project Charter | `.md` | Monaco (Markdown) |
| **01** | Design Principles | `.md` | Monaco (Markdown) |
| **02** | Product Backlog | `.csv` | HyperFormula (Spreadsheet) |
| **03** | Effort Estimates | `.csv` | HyperFormula (Spreadsheet) |
| **04** | Scenarios | `.md` | Monaco (Markdown) |
| **05** | Data Models | `.dbml` | Monaco + SVG (Split-Pane) |
| **06** | Tasks | `.csv` | HyperFormula (Spreadsheet) |
| **07** | Schedule | `.csv` | HyperFormula (Spreadsheet) |

Prefixes determine tab order (left to right) and provide a human-readable label. The file name after the prefix (e.g. `02-product-backlog.csv`) becomes the tab title.

---

## 4. Implementation Details (Air-Gapped Strategy)
* **No Sidecar Required:** All editors run as JavaScript libraries inside the Electron renderer process. There is no external binary dependency (no LibreOffice, no Collabora).
* **Asset Bundling:** All JS libraries (HyperFormula, DBML renderer, Monaco) are bundled into the Electron app — no CDNs are used.
* **File Persistence:** Editors read from and write back to the original files on disk. CSV round-tripping is handled by `papaparse` for reliable parsing and serialization.

---

## 5. Development Roadmap
1. **Phase 1:** Electron shell with directory scanner and tab generation from prefixed files.
2. **Phase 2:** Monaco Editor integration for `.md` files (edit + preview).
3. **Phase 3:** HyperFormula integration for `.csv` files (grid editing with save-back).
4. **Phase 4:** DBML split-pane — Monaco editor (left) with live SVG ERD rendering (right) for `.dbml` files.
5. **Phase 5:** Polish — custom title bar, keyboard shortcuts, file watching via `chokidar` for external changes.
