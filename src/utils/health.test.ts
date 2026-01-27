import { describe, it, expect } from 'vitest'
import { calculateBMI, getBMIStatus } from './health'

describe('BMI Utils', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly', () => {
      // 70kg, 175cm => 70 / (1.75 * 1.75) = 22.86
      expect(calculateBMI(70, 175)).toBeCloseTo(22.86, 2)
    })

    it('should return 0 if weight or height is invalid', () => {
      expect(calculateBMI(0, 175)).toBe(0)
      expect(calculateBMI(70, 0)).toBe(0)
    })
  })

  describe('getBMIStatus', () => {
    it('should categorize correctly based on Taiwan MOHW standards', () => {
      expect(getBMIStatus(18.4).label).toBe('過輕')
      expect(getBMIStatus(18.5).label).toBe('健康')
      expect(getBMIStatus(23.9).label).toBe('健康')
      expect(getBMIStatus(24.0).label).toBe('過重')
      expect(getBMIStatus(26.9).label).toBe('過重')
      expect(getBMIStatus(27.0).label).toBe('肥胖')
    })
  })
})
