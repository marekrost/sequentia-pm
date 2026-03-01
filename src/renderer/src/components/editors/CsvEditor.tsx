import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataGrid, renderTextEditor, type Column, type SortColumn } from 'react-data-grid'
import { HyperFormula } from 'hyperformula'
import type { ProjectFile } from '@shared/types/project'
import { useFileContent } from '../../hooks/useFileContent'
import { parseCsv, unparseCsv, type CsvData } from '../../lib/csvParser'
import StatusBar from '../shared/StatusBar'
import EditorToolbar from '../shared/EditorToolbar'
import ToolbarButton from '../shared/ToolbarButton'
import 'react-data-grid/lib/styles.css'

interface CsvEditorProps {
  file: ProjectFile
}

type Row = Record<string, string>

interface CellRange {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

function normalizeRange(r: CellRange): {
  minRow: number
  maxRow: number
  minCol: number
  maxCol: number
} {
  return {
    minRow: Math.min(r.startRow, r.endRow),
    maxRow: Math.max(r.startRow, r.endRow),
    minCol: Math.min(r.startCol, r.endCol),
    maxCol: Math.max(r.startCol, r.endCol)
  }
}

function colIndexToLetter(index: number): string {
  let result = ''
  let n = index
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result
    n = Math.floor(n / 26) - 1
  }
  return result
}

function EditableHeader({
  letter,
  name,
  onRename
}: {
  letter: string
  name: string
  onRename: (newName: string) => void
}): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = (): void => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== name) onRename(trimmed)
    else setDraft(name)
  }

  if (editing) {
    return (
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[10px] text-neutral-500">{letter}</span>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(name)
              setEditing(false)
            }
          }}
          className="w-full bg-neutral-700 px-0.5 text-xs text-neutral-200 outline-none"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start leading-tight" onDoubleClick={() => setEditing(true)}>
      <span className="text-[10px] text-neutral-500">{letter}</span>
      <span className="text-xs">{name}</span>
    </div>
  )
}

function colKeyToIndex(key: string): number | null {
  const m = key.match(/^col_(\d+)$/)
  return m ? Number(m[1]) : null
}

function CsvEditor({ file }: CsvEditorProps): React.JSX.Element {
  const { content, loading, error, setContent, save } = useFileContent(file.filePath)
  const [csvData, setCsvData] = useState<CsvData | null>(null)
  const hfRef = useRef<HyperFormula | null>(null)
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([])
  const [cellRange, setCellRange] = useState<CellRange | null>(null)
  const [shiftHeld, setShiftHeld] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const renameHeaderRef = useRef<(colIndex: number, newName: string) => void>(() => {})
  const isDragging = useRef(false)
  const dragAnchor = useRef<{ row: number; col: number } | null>(null)

  // Keep a ref to csvData for use in event handlers that shouldn't re-register
  const csvDataRef = useRef(csvData)
  csvDataRef.current = csvData

  // Parse CSV content into structured data
  useEffect(() => {
    if (content === null) return
    const data = parseCsv(content)
    setCsvData(data)

    if (hfRef.current) {
      hfRef.current.destroy()
    }
    hfRef.current = HyperFormula.buildFromArray(
      data.rows.map((row) =>
        row.map((cell) => {
          if (cell.startsWith('=')) return cell
          const num = Number(cell)
          return isNaN(num) ? cell : num
        })
      ),
      { licenseKey: 'gpl-v3' }
    )

    return () => {
      if (hfRef.current) {
        hfRef.current.destroy()
        hfRef.current = null
      }
    }
  }, [content])

  // --- Cell range selection (click + drag) ---

  const handleCellMouseDown = useCallback(
    (
      args: { column: { key: string }; rowIdx: number },
      event: React.MouseEvent
    ) => {
      event.preventDefault() // prevent text selection during drag
      const colIdx = colKeyToIndex(args.column.key)
      if (colIdx === null) return

      if (event.shiftKey && cellRange) {
        setCellRange({ ...cellRange, endRow: args.rowIdx, endCol: colIdx })
      } else {
        dragAnchor.current = { row: args.rowIdx, col: colIdx }
        isDragging.current = true
        setCellRange({
          startRow: args.rowIdx,
          startCol: colIdx,
          endRow: args.rowIdx,
          endCol: colIdx
        })
      }
    },
    [cellRange]
  )

  // Resolve cell under cursor from DOM aria attributes
  const cellFromPoint = useCallback((clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY)
    if (!el) return null
    const cell = el.closest<HTMLElement>('[aria-colindex]')
    const row = el.closest<HTMLElement>('[aria-rowindex]')
    if (!cell || !row) return null
    const colIdx = Number(cell.getAttribute('aria-colindex')) - 2 // offset for _rownum column
    const rowIdx = Number(row.getAttribute('aria-rowindex')) - 2 // offset for header row
    if (colIdx < 0 || rowIdx < 0) return null
    return { row: rowIdx, col: colIdx }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (!isDragging.current || !dragAnchor.current) return
      const pos = cellFromPoint(e.clientX, e.clientY)
      if (!pos) return
      setCellRange({
        startRow: dragAnchor.current.row,
        startCol: dragAnchor.current.col,
        endRow: pos.row,
        endCol: pos.col
      })
    }

    const handleMouseUp = (): void => {
      isDragging.current = false
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [cellFromPoint])

  const handleCellClick = useCallback(
    (
      args: { column: { key: string }; rowIdx: number },
      event: { shiftKey: boolean }
    ) => {
      const colIdx = colKeyToIndex(args.column.key)
      if (colIdx === null) return

      // If we just finished a drag, the range is already set — skip
      if (dragAnchor.current) {
        dragAnchor.current = null
        return
      }

      if (event.shiftKey && cellRange) {
        setCellRange({ ...cellRange, endRow: args.rowIdx, endCol: colIdx })
      } else {
        setCellRange({
          startRow: args.rowIdx,
          startCol: colIdx,
          endRow: args.rowIdx,
          endCol: colIdx
        })
      }
    },
    [cellRange]
  )

  // Build columns — depends on cellRange so cellClass re-evaluates on selection change
  const columns: Column<Row>[] = useMemo(() => {
    if (!csvData) return []

    const rowNumColumn: Column<Row> = {
      key: '_rownum',
      name: '',
      frozen: true,
      resizable: false,
      editable: false,
      width: 52,
      minWidth: 52,
      cellClass: 'rdg-rownum',
      headerCellClass: 'rdg-rownum',
      renderCell: ({ rowIdx }) => (
        <span className="block w-full pr-3 text-right text-xs leading-[35px] text-neutral-500 select-none">
          {rowIdx + 1}
        </span>
      ),
      renderHeaderCell: () => <span />
    }

    const norm = cellRange ? normalizeRange(cellRange) : null

    const dataColumns: Column<Row>[] = csvData.headers.map((header, i) => ({
      key: `col_${i}`,
      name: header,
      resizable: true,
      editable: true,
      sortable: true,
      renderHeaderCell: () => (
        <EditableHeader
          letter={colIndexToLetter(i)}
          name={header}
          onRename={(newName) => renameHeaderRef.current(i, newName)}
        />
      ),
      renderEditCell: renderTextEditor,
      renderCell: ({ row }: { row: Row }) => {
        const raw = row[`col_${i}`] ?? ''
        const hf = hfRef.current
        if (hf && raw.startsWith('=')) {
          const val = hf.getCellValue({ sheet: 0, row: Number(row._rowIdx), col: i })
          return <>{val != null ? String(val) : raw}</>
        }
        return <>{raw}</>
      },
      minWidth: 80,
      cellClass: norm && i >= norm.minCol && i <= norm.maxCol
        ? (row: Row): string | undefined => {
            const rowIdx = Number(row._rowIdx)
            return rowIdx >= norm.minRow && rowIdx <= norm.maxRow
              ? 'rdg-cell-selected'
              : undefined
          }
        : undefined
    }))

    return [rowNumColumn, ...dataColumns]
  }, [csvData?.headers, cellRange])

  // Build rows from data — store raw values so the editor shows formulas
  const baseRows: Row[] = useMemo(() => {
    if (!csvData) return []
    return csvData.rows.map((row, rowIdx) => {
      const obj: Row = { _rowIdx: String(rowIdx) }
      csvData.headers.forEach((_, colIdx) => {
        obj[`col_${colIdx}`] = row[colIdx] ?? ''
      })
      return obj
    })
  }, [csvData])

  // Sort rows — resolve formulas to computed values for comparison
  const rows = useMemo(() => {
    if (sortColumns.length === 0) return baseRows
    const hf = hfRef.current
    const resolve = (row: Row, colKey: string): string => {
      const raw = row[colKey] ?? ''
      if (hf && raw.startsWith('=')) {
        const colIdx = colKeyToIndex(colKey)
        if (colIdx !== null) {
          const val = hf.getCellValue({ sheet: 0, row: Number(row._rowIdx), col: colIdx })
          return val != null ? String(val) : raw
        }
      }
      return raw
    }
    const sorted = [...baseRows]
    sorted.sort((a, b) => {
      for (const { columnKey, direction } of sortColumns) {
        const aVal = resolve(a, columnKey)
        const bVal = resolve(b, columnKey)
        const aNum = Number(aVal)
        const bNum = Number(bVal)
        let cmp: number
        if (!isNaN(aNum) && !isNaN(bNum)) {
          cmp = aNum - bNum
        } else {
          cmp = aVal.localeCompare(bVal)
        }
        if (cmp !== 0) return direction === 'ASC' ? cmp : -cmp
      }
      return 0
    })
    return sorted
  }, [baseRows, sortColumns])

  const syncToContent = useCallback(
    (newData: CsvData) => {
      setCsvData(newData)

      if (hfRef.current) hfRef.current.destroy()
      hfRef.current = HyperFormula.buildFromArray(
        newData.rows.map((row) =>
          row.map((cell) => {
            if (cell.startsWith('=')) return cell
            const num = Number(cell)
            return isNaN(num) ? cell : num
          })
        ),
        { licenseKey: 'gpl-v3' }
      )

      setContent(unparseCsv(newData))
    },
    [setContent]
  )

  const handleRenameHeader = useCallback(
    (colIndex: number, newName: string) => {
      if (!csvData) return
      const newHeaders = csvData.headers.map((h, i) => (i === colIndex ? newName : h))
      syncToContent({ headers: newHeaders, rows: csvData.rows })
    },
    [csvData, syncToContent]
  )
  renameHeaderRef.current = handleRenameHeader

  const handleRowsChange = useCallback(
    (newRows: Row[], { indexes }: { indexes: number[] }) => {
      if (!csvData) return

      const updatedRows = [...csvData.rows]
      for (const idx of indexes) {
        const origIdx = Number(newRows[idx]._rowIdx)
        updatedRows[origIdx] = csvData.headers.map(
          (_, colIdx) => newRows[idx][`col_${colIdx}`] ?? ''
        )
      }

      const newData: CsvData = { headers: csvData.headers, rows: updatedRows }
      setCsvData(newData)

      const hf = hfRef.current
      if (hf) {
        for (const idx of indexes) {
          const origIdx = Number(newRows[idx]._rowIdx)
          for (let col = 0; col < csvData.headers.length; col++) {
            const raw = updatedRows[origIdx][col] ?? ''
            const val = raw.startsWith('=') ? raw : isNaN(Number(raw)) ? raw : Number(raw)
            hf.setCellContents({ sheet: 0, row: origIdx, col }, val)
          }
        }
      }

      setContent(unparseCsv(newData))
    },
    [csvData, setContent]
  )

  // --- Copy: write selected range as TSV to clipboard ---
  const handleCopy = useCallback(
    (args: { row: Row; column: { key: string } }, event: React.ClipboardEvent) => {
      const data = csvDataRef.current
      if (!data || !cellRange) return

      const { minRow, maxRow, minCol, maxCol } = normalizeRange(cellRange)
      const isMulti = maxRow > minRow || maxCol > minCol
      if (!isMulti) return // single cell — let react-data-grid handle it

      event.preventDefault()
      const lines: string[] = []
      for (let r = minRow; r <= maxRow; r++) {
        const cells: string[] = []
        for (let c = minCol; c <= maxCol; c++) {
          cells.push(data.rows[r]?.[c] ?? '')
        }
        lines.push(cells.join('\t'))
      }
      event.clipboardData.setData('text/plain', lines.join('\n'))
    },
    [cellRange]
  )

  // --- Paste: write TSV clipboard data into grid starting at range anchor ---
  const handlePaste = useCallback(
    (args: { row: Row; column: { key: string } }, event: React.ClipboardEvent): Row => {
      const data = csvDataRef.current
      if (!data) return args.row

      const text = event.clipboardData.getData('text/plain')
      const pasteRows = text.split('\n').map((line) => line.split('\t'))

      // Determine paste origin: top-left of range, or focused cell
      let startRow: number
      let startCol: number
      if (cellRange) {
        const norm = normalizeRange(cellRange)
        startRow = norm.minRow
        startCol = norm.minCol
      } else {
        const colIdx = colKeyToIndex(args.column.key)
        if (colIdx === null) return args.row
        startRow = Number(args.row._rowIdx)
        startCol = colIdx
      }

      // Single value with no range — let react-data-grid handle it normally
      if (pasteRows.length === 1 && pasteRows[0].length === 1 && !cellRange) {
        return args.row
      }

      event.preventDefault()

      const updatedRows = data.rows.map((row) => [...row])
      for (let r = 0; r < pasteRows.length; r++) {
        const targetRow = startRow + r
        if (targetRow >= updatedRows.length) break
        for (let c = 0; c < pasteRows[r].length; c++) {
          const targetCol = startCol + c
          if (targetCol >= data.headers.length) break
          updatedRows[targetRow][targetCol] = pasteRows[r][c]
        }
      }

      syncToContent({ headers: data.headers, rows: updatedRows })
      return args.row // syncToContent handles the full update
    },
    [cellRange, syncToContent]
  )

  // --- Row operations (F-028) ---
  const handleAddRow = useCallback(() => {
    if (!csvData) return
    const emptyRow = csvData.headers.map(() => '')
    const insertAfter = cellRange ? normalizeRange(cellRange).maxRow : csvData.rows.length - 1
    const newRows = [
      ...csvData.rows.slice(0, insertAfter + 1),
      emptyRow,
      ...csvData.rows.slice(insertAfter + 1)
    ]
    syncToContent({ headers: csvData.headers, rows: newRows })
  }, [csvData, cellRange, syncToContent])

  const handleDeleteRow = useCallback(() => {
    if (!csvData) return
    if (!cellRange) return
    const { minRow, maxRow } = normalizeRange(cellRange)
    const newRows = csvData.rows.filter((_, i) => i < minRow || i > maxRow)
    setCellRange(null)
    syncToContent({ headers: csvData.headers, rows: newRows })
  }, [csvData, cellRange, syncToContent])

  // --- Column operations (F-029) ---
  const handleAddColumn = useCallback(() => {
    if (!csvData) return
    const header = `Column ${csvData.headers.length + 1}`
    const insertAfter = cellRange ? normalizeRange(cellRange).maxCol : csvData.headers.length - 1
    const newHeaders = [
      ...csvData.headers.slice(0, insertAfter + 1),
      header,
      ...csvData.headers.slice(insertAfter + 1)
    ]
    const newRows = csvData.rows.map((row) => [
      ...row.slice(0, insertAfter + 1),
      '',
      ...row.slice(insertAfter + 1)
    ])
    syncToContent({ headers: newHeaders, rows: newRows })
  }, [csvData, cellRange, syncToContent])

  const handleDeleteColumn = useCallback(() => {
    if (!csvData) return
    if (!cellRange) return
    const { minCol, maxCol } = normalizeRange(cellRange)
    const keep = (_: unknown, i: number): boolean => i < minCol || i > maxCol
    setCellRange(null)
    syncToContent({
      headers: csvData.headers.filter(keep),
      rows: csvData.rows.map((row) => row.filter(keep))
    })
  }, [csvData, cellRange, syncToContent])

  // Selection info for toolbar
  const selectionInfo = useMemo(() => {
    if (!cellRange) return null
    const { minRow, maxRow, minCol, maxCol } = normalizeRange(cellRange)
    const rCount = maxRow - minRow + 1
    const cCount = maxCol - minCol + 1
    if (rCount === 1 && cCount === 1) return null
    return `${rCount}R \u00d7 ${cCount}C`
  }, [cellRange])

  // Track Shift key for contextual hints
  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if (e.key === 'Shift') setShiftHeld(true)
    }
    const up = (e: KeyboardEvent): void => {
      if (e.key === 'Shift') setShiftHeld(false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', () => setShiftHeld(false))
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Contextual status hint
  const statusHint = useMemo(() => {
    const isMulti = cellRange
      ? Math.abs(cellRange.endRow - cellRange.startRow) + Math.abs(cellRange.endCol - cellRange.startCol) > 0
      : false

    if (shiftHeld && cellRange) {
      return 'Click a cell to extend selection to a range'
    }
    if (isMulti) {
      return 'Ctrl+C to copy range \u00b7 Ctrl+V to paste \u00b7 Click to start new selection'
    }
    if (cellRange) {
      return 'Click to navigate \u00b7 Drag or Shift+click to select a range \u00b7 Double-click to edit'
    }
    return 'Click a cell to select \u00b7 Drag to select a range \u00b7 Click a column header to sort'
  }, [cellRange, shiftHeld])

  // Keyboard save handler
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [save])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-500">Loading...</div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-400">Error: {error}</div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar>
        <ToolbarButton onClick={handleAddRow} title="Insert row after selection (or at end)">
          + Row
        </ToolbarButton>
        <ToolbarButton onClick={handleDeleteRow} title="Delete rows spanned by selection">
          − Row
        </ToolbarButton>
        <span className="mx-1 text-neutral-600">|</span>
        <ToolbarButton onClick={handleAddColumn} title="Insert column after selection (or at end)">
          + Col
        </ToolbarButton>
        <ToolbarButton onClick={handleDeleteColumn} title="Delete columns spanned by selection">
          − Col
        </ToolbarButton>
        {sortColumns.length > 0 && (
          <>
            <span className="mx-1 text-neutral-600">|</span>
            <ToolbarButton onClick={() => setSortColumns([])} title="Clear sort">
              Clear Sort
            </ToolbarButton>
          </>
        )}
        {selectionInfo && (
          <>
            <span className="mx-1 text-neutral-600">|</span>
            <span className="text-sm text-neutral-400">{selectionInfo}</span>
          </>
        )}
      </EditorToolbar>

      {/* Grid */}
      <div
        ref={gridRef}
        className="min-h-0 flex-1 select-none [&_.rdg]:h-full [&_.rdg]:border-none [&_.rdg]:bg-neutral-900"
      >
        <DataGrid
          columns={columns}
          rows={rows}
          headerRowHeight={44}
          rowKeyGetter={(row) => row._rowIdx}
          onRowsChange={handleRowsChange}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          onCellMouseDown={handleCellMouseDown}
          onCellClick={handleCellClick}
          onCellCopy={handleCopy}
          onCellPaste={handlePaste}
          className="rdg-dark fill-grid"
          style={{ height: '100%' }}
        />
      </div>

      <StatusBar>
        <span>{statusHint}</span>
      </StatusBar>
    </div>
  )
}

export default CsvEditor
