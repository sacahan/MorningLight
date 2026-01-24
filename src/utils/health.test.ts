import { describe, it, expect } from 'vitest'
import { calculateBMI, getBMICategory } from './health'

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

  describe('getBMICategory', () => {
    it('should categorize correctly based on Asian standards', () => {
      expect(getBMICategory(18.4)).toBe('過輕')
      expect(getBMICategory(18.5)).toBe('健康')
      expect(getBMICategory(22.9)).toBe('健康')
      expect(getBMICategory(23.0)).toBe('過重')
      expect(getBMICategory(24.9)).toBe('過重')
      expect(getBMICategory(25.0)).toBe('肥胖')
    })
  })
})
