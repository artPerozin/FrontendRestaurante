import * as XLSX from 'xlsx'

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return

  const headers = Object.keys(data[0] ?? {})
  let csv = headers.join(",") + "\n"

  data.forEach(row => {
    csv += headers.map(h => (row[h] ?? "")).join(",") + "\n"
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename + ".csv")
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToExcel(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return

  const safeData = data.map(item => item ?? {})

  const ws = XLSX.utils.json_to_sheet(safeData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
  XLSX.writeFile(wb, filename + ".xlsx")
}
