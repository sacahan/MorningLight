import type { WeightRecord } from '../hooks/useWeights'

const FORMULA_PREFIX = /^[=+\-@]/

function escapeCsvValue(value: string): string {
  const safeValue = FORMULA_PREFIX.test(value) ? `'${value}` : value
  if (safeValue.includes('"') || safeValue.includes(',') || safeValue.includes('\n')) {
    return `"${safeValue.replace(/"/g, '""')}"`
  }
  return safeValue
}

export function weightsToCsv(records: WeightRecord[]): string {
  const header = ['date', 'weight', 'body_fat']
  const rows = records.map((record) => [
    escapeCsvValue(record.date),
    escapeCsvValue(String(record.weight)),
    escapeCsvValue(record.body_fat !== undefined ? String(record.body_fat) : ''),
  ])

  const lines = [header, ...rows].map((row) => row.join(','))
  return lines.join('\n')
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.setAttribute('download', filename)
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
