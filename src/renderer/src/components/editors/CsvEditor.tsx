import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DataGrid, renderTextEditor, type Column } from 'react-data-grid'
import { HyperFormula } from 'hyperformula'
import type { ProjectFile } from '../../types/project'
import { useFileContent } from '../../hooks/useFileContent'
import { parseCsv, unparseCsv, type CsvData } from '../../lib/csvParser'
import 'react-data-grid/lib/styles.css'

interface CsvEditorProps {
  file: ProjectFile
}

type Row = Record<string, string>

function CsvEditor({ file }: CsvEditorProps): React.JSX.Element {
  const { content, loading, error, setContent, save } = useFileContent(file.filePath)
  const [csvData, setCsvData] = useState<CsvData | null>(null)
  const hfRef = useRef<HyperFormula | null>(null)

  // Parse CSV content into structured data
  useEffect(() => {
    if (content === null) return
    const data = parseCsv(content)
    setCsvData(data)

    // Initialize HyperFormula with the data
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
      renderEditCell: renderTextEditor,
      minWidth: 80
    }))

    return [rowNumColumn, ...dataColumns]
  }, [csvData?.headers])

  // Build rows from data, using HyperFormula for computed values
  const rows: Row[] = useMemo(() => {
    if (!csvData) return []
    const hf = hfRef.current
    return csvData.rows.map((row, rowIdx) => {
      const obj: Row = {}
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

  const handleRowsChange = useCallback(
    (newRows: Row[], { indexes }: { indexes: number[] }) => {
      if (!csvData) return

      const updatedRows = [...csvData.rows]
      for (const idx of indexes) {
        updatedRows[idx] = csvData.headers.map((_, colIdx) => newRows[idx][`col_${colIdx}`] ?? '')
      }

      const newData: CsvData = { headers: csvData.headers, rows: updatedRows }
      setCsvData(newData)

      // Update HyperFormula
      const hf = hfRef.current
      if (hf) {
        for (const idx of indexes) {
          for (let col = 0; col < csvData.headers.length; col++) {
            const raw = updatedRows[idx][col] ?? ''
            const val = raw.startsWith('=') ? raw : isNaN(Number(raw)) ? raw : Number(raw)
            hf.setCellContents({ sheet: 0, row: idx, col }, val)
          }
        }
      }

      setContent(unparseCsv(newData))
    },
    [csvData, setContent]
  )

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
    <div className="h-full [&_.rdg]:h-full [&_.rdg]:border-none [&_.rdg]:bg-neutral-900">
      <DataGrid
        columns={columns}
        rows={rows}
        onRowsChange={handleRowsChange}
        className="rdg-dark fill-grid"
        style={{ height: '100%' }}
      />
    </div>
  )
}

export default CsvEditor
