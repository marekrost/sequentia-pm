import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataGrid, SelectColumn, renderTextEditor, type Column, type SortColumn } from 'react-data-grid'
import { HyperFormula } from 'hyperformula'
import type { ProjectFile } from '../../types/project'
import { useFileContent } from '../../hooks/useFileContent'
import { parseCsv, unparseCsv, type CsvData } from '../../lib/csvParser'
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

function normalizeRange(r: CellRange): { minRow: number; maxRow: number; minCol: number; maxCol: number } {
  return {
    minRow: Math.min(r.startRow, r.endRow),
    maxRow: Math.max(r.startRow, r.endRow),
    minCol: Math.min(r.startCol, r.endCol),
    maxCol: Math.max(r.startCol, r.endCol)
  }
}

function CsvEditor({ file }: CsvEditorProps): React.JSX.Element {
  const { content, loading, error, setContent, save } = useFileContent(file.filePath)
  const [csvData, setCsvData] = useState<CsvData | null>(null)
  const hfRef = useRef<HyperFormula | null>(null)
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(() => new Set())
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([])
  const [cellRange, setCellRange] = useState<CellRange | null>(null)

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

  // Cell range selection: extract column index from column key (col_N -> N)
  const colKeyToIndex = useCallback((key: string): number | null => {
    const m = key.match(/^col_(\d+)$/)
    return m ? Number(m[1]) : null
  }, [])

  // Handle cell click for range selection
  const handleCellClick = useCallback(
    (
      args: { column: { key: string }; rowIdx: number },
      event: { shiftKey: boolean }
    ) => {
      const colIdx = colKeyToIndex(args.column.key)
      if (colIdx === null) return // ignore clicks on gutter / select column

      if (event.shiftKey && cellRange) {
        // Extend range from anchor
        setCellRange({ ...cellRange, endRow: args.rowIdx, endCol: colIdx })
      } else {
        // New anchor
        setCellRange({
          startRow: args.rowIdx,
          startCol: colIdx,
          endRow: args.rowIdx,
          endCol: colIdx
        })
      }
    },
    [cellRange, colKeyToIndex]
  )

  // Build cell class function for a given column index
  const cellRangeRef = useRef(cellRange)
  cellRangeRef.current = cellRange

  const makeCellClass = useCallback(
    (colIdx: number) => {
      return (_row: Row, rowIdx: number): string | undefined => {
        const range = cellRangeRef.current
        if (!range) return undefined
        const { minRow, maxRow, minCol, maxCol } = normalizeRange(range)
        if (rowIdx >= minRow && rowIdx <= maxRow && colIdx >= minCol && colIdx <= maxCol) {
          return 'rdg-cell-selected'
        }
        return undefined
      }
    },
    [] // stable — reads from ref
  )

  // Build columns from headers, with a frozen row-number gutter
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

    const dataColumns: Column<Row>[] = csvData.headers.map((header, i) => ({
      key: `col_${i}`,
      name: header,
      resizable: true,
      editable: true,
      sortable: true,
      renderEditCell: renderTextEditor,
      minWidth: 80,
      cellClass: makeCellClass(i)
    }))

    return [SelectColumn as Column<Row>, rowNumColumn, ...dataColumns]
  }, [csvData?.headers, makeCellClass])

  // Build rows from data, using HyperFormula for computed values
  const baseRows: Row[] = useMemo(() => {
    if (!csvData) return []
    const hf = hfRef.current
    return csvData.rows.map((row, rowIdx) => {
      const obj: Row = { _rowIdx: String(rowIdx) }
      csvData.headers.forEach((_, colIdx) => {
        const raw = row[colIdx] ?? ''
        if (hf && raw.startsWith('=')) {
          const val = hf.getCellValue({ sheet: 0, row: rowIdx, col: colIdx })
          obj[`col_${colIdx}`] = val != null ? String(val) : raw
        } else {
          obj[`col_${colIdx}`] = raw
        }
      })
      return obj
    })
  }, [csvData])

  // Sort rows
  const rows = useMemo(() => {
    if (sortColumns.length === 0) return baseRows
    const sorted = [...baseRows]
    sorted.sort((a, b) => {
      for (const { columnKey, direction } of sortColumns) {
        const aVal = a[columnKey] ?? ''
        const bVal = b[columnKey] ?? ''
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

  // --- Row operations (F-028) ---
  const handleAddRow = useCallback(() => {
    if (!csvData) return
    const emptyRow = csvData.headers.map(() => '')
    const newData: CsvData = { headers: csvData.headers, rows: [...csvData.rows, emptyRow] }
    syncToContent(newData)
  }, [csvData, syncToContent])

  const handleDeleteRow = useCallback(() => {
    if (!csvData || selectedRows.size === 0) return
    const toDelete = new Set([...selectedRows].map(Number))
    const newRows = csvData.rows.filter((_, i) => !toDelete.has(i))
    const newData: CsvData = { headers: csvData.headers, rows: newRows }
    setSelectedRows(new Set())
    syncToContent(newData)
  }, [csvData, selectedRows, syncToContent])

  // --- Column operations (F-029) ---
  const handleAddColumn = useCallback(() => {
    if (!csvData) return
    const name = prompt('Column name:')
    if (name === null) return
    const header = name.trim() || `Column ${csvData.headers.length + 1}`
    const newHeaders = [...csvData.headers, header]
    const newRows = csvData.rows.map((row) => [...row, ''])
    syncToContent({ headers: newHeaders, rows: newRows })
  }, [csvData, syncToContent])

  const handleDeleteColumn = useCallback(() => {
    if (!csvData || csvData.headers.length === 0) return
    const name = prompt(`Delete column (enter name):\n${csvData.headers.join(', ')}`)
    if (name === null) return
    const idx = csvData.headers.indexOf(name.trim())
    if (idx === -1) return
    const newHeaders = csvData.headers.filter((_, i) => i !== idx)
    const newRows = csvData.rows.map((row) => row.filter((_, i) => i !== idx))
    syncToContent({ headers: newHeaders, rows: newRows })
  }, [csvData, syncToContent])

  // Selection info for toolbar
  const selectionInfo = useMemo(() => {
    if (!cellRange) return null
    const { minRow, maxRow, minCol, maxCol } = normalizeRange(cellRange)
    const rows = maxRow - minRow + 1
    const cols = maxCol - minCol + 1
    if (rows === 1 && cols === 1) return null
    return `${rows}R × ${cols}C`
  }, [cellRange])

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
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-neutral-700 bg-neutral-800 px-2 py-1">
        <button onClick={handleAddRow} className="csv-toolbar-btn" title="Add row">
          + Row
        </button>
        <button
          onClick={handleDeleteRow}
          className="csv-toolbar-btn"
          title="Delete selected row(s)"
          disabled={selectedRows.size === 0}
        >
          − Row
        </button>
        <span className="mx-1 text-neutral-600">|</span>
        <button onClick={handleAddColumn} className="csv-toolbar-btn" title="Add column">
          + Col
        </button>
        <button onClick={handleDeleteColumn} className="csv-toolbar-btn" title="Delete column">
          − Col
        </button>
        {sortColumns.length > 0 && (
          <>
            <span className="mx-1 text-neutral-600">|</span>
            <button
              onClick={() => setSortColumns([])}
              className="csv-toolbar-btn"
              title="Clear sort"
            >
              Clear Sort
            </button>
          </>
        )}
        {selectionInfo && (
          <>
            <span className="mx-1 text-neutral-600">|</span>
            <span className="text-xs text-neutral-400">{selectionInfo}</span>
          </>
        )}
      </div>

      {/* Grid */}
      <div className="min-h-0 flex-1 [&_.rdg]:h-full [&_.rdg]:border-none [&_.rdg]:bg-neutral-900">
        <DataGrid
          columns={columns}
          rows={rows}
          rowKeyGetter={(row) => row._rowIdx}
          onRowsChange={handleRowsChange}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          onCellClick={handleCellClick}
          className="rdg-dark fill-grid"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}

export default CsvEditor
