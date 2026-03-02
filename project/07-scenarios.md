# User Scenarios

## Scenario 1: Open a Project for the First Time

**Actor:** Developer / Project Manager

1. User launches Sequentia PM
2. Welcome screen displays with "Open Project Directory" button
3. User clicks the button — native OS directory picker opens
4. User selects a directory containing prefix-numbered files
5. Application scans directory for files matching `NN-name.(md|csv|dbml)`
6. Tab bar populates with tabs sorted by prefix number
7. First tab activates automatically, displaying the appropriate editor

**Expected result:** All matching files appear as tabs sorted by prefix. Files with supported extensions but missing or unreadable prefixes appear at the end of the tab bar. Files with unsupported extensions are shown as tabs but display an unsupported-format notice instead of an editor. Files that are both unsupported and without a numeric prefix appear at the very end.

---

## Scenario 2: Edit a Markdown Document

**Actor:** Developer

1. User clicks a `.md` tab (e.g. "01 charter")
2. Split pane opens: Monaco editor on the left, rendered HTML preview on the right
3. User types markdown in the editor
4. Preview updates in real-time (debounced 200ms)
5. User presses Ctrl+S
6. File is saved to disk — dirty indicator disappears from the tab

**Expected result:** The markdown file on disk matches exactly what was typed. Preview accurately renders GFM markdown.

---

## Scenario 3: Edit a CSV Spreadsheet

**Actor:** Project Manager

1. User clicks a `.csv` tab (e.g. "03 functional backlog")
2. Spreadsheet grid renders with column headers from the first CSV row
3. User clicks a cell and types a new value
4. Tab shows dirty indicator (*)
5. User presses Ctrl+S
6. CSV is serialized via papaparse and written to disk

**Expected result:** The CSV file preserves quoting for values containing commas. Cell edits round-trip without data loss.

---

## Scenario 4: Edit a DBML Diagram

**Actor:** Developer

1. User clicks a `.dbml` tab (e.g. "08 data models")
2. Split pane opens: Monaco editor with DBML syntax highlighting (left), SVG ERD diagram (right)
3. User modifies a table definition in the editor
4. After a short debounce (400ms), the SVG diagram re-renders
5. If the user introduces a syntax error, the last valid diagram is preserved and an error message appears
6. User zooms the diagram using +/- controls
7. User presses Ctrl+S to save

**Expected result:** DBML syntax is highlighted correctly. The ERD updates live. Parse errors do not blank the diagram.

---

## Scenario 5: External File Change Detection

**Actor:** Developer using Sequentia alongside a text editor or git

1. User has Sequentia open with a project loaded
2. User edits a project file externally (e.g. via VS Code or `git pull`)
3. Chokidar detects the file change
4. If the file's buffer in Sequentia is clean (no unsaved edits), content reloads automatically
5. If the buffer is dirty, a prompt appears asking the user whether to reload the external changes or keep the unsaved version

**Expected result:** Clean files stay in sync with disk. Dirty files prompt the user before any reload.

---

## Scenario 6: Navigate Between Tabs

**Actor:** Any user

1. User has a project open with multiple tabs
2. User clicks a different tab — editor switches to that file
3. User presses Ctrl+Tab — next tab activates
4. User presses Ctrl+Shift+Tab — previous tab activates
5. Tab navigation wraps around (last → first, first → last)

**Expected result:** Active tab is visually highlighted. Editor content matches the selected file. Previous editor state is preserved when switching back.
