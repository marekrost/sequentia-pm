import Papa from 'papaparse'

export interface CsvData {
  headers: string[]
  rows: string[][]
}

export function parseCsv(text: string): CsvData {
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: true
  })

  const allRows = result.data
  if (allRows.length === 0) {
    return { headers: [], rows: [] }
  }

  return {
    headers: allRows[0],
    rows: allRows.slice(1)
  }
}

export function unparseCsv(data: CsvData): string {
  return Papa.unparse([data.headers, ...data.rows])
}
