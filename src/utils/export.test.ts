import { describe, it, expect } from 'vitest'
import { weightsToCsv } from './export'

describe('weightsToCsv', () => {
  it('should include header and data rows', () => {
    const csv = weightsToCsv([
      { id: '1', weight: 70.2, date: '2026-01-24', created_at: '2026-01-24T00:00:00Z' },
    ])

    expect(csv).toBe('date,weight,body_fat\n2026-01-24,70.2,')
  })

  it('should handle empty dataset', () => {
    expect(weightsToCsv([])).toBe('date,weight,body_fat')
  })

  it('should include body fat when present', () => {
    const csv = weightsToCsv([
      { id: '1', weight: 71, body_fat: 18.5, date: '2026-01-25', created_at: '2026-01-25T00:00:00Z' },
    ])

    expect(csv).toBe('date,weight,body_fat\n2026-01-25,71,18.5')
  })

  it('should escape commas and quotes', () => {
    const csv = weightsToCsv([
      { id: '1', weight: 70.5, body_fat: 20, date: '2026-01-2,6', created_at: '2026-01-24T00:00:00Z' },
    ])

    expect(csv).toBe('date,weight,body_fat\n"2026-01-2,6",70.5,20')
  })

  it('should guard against formula injection', () => {
    const csv = weightsToCsv([
      { id: '1', weight: 70.5, body_fat: 20, date: '=SUM(1,1)', created_at: '2026-01-24T00:00:00Z' },
    ])

    expect(csv).toBe("date,weight,body_fat\n\"'=SUM(1,1)\",70.5,20")
  })
})
