/**
 * Calculate BMI
 * @param weight kg
 * @param height cm
 * @returns bmi rounded to 2 decimal places
 */
export function calculateBMI(weight: number, height: number): number {
  if (weight <= 0 || height <= 0) return 0
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  return Math.round(bmi * 100) / 100
}

export type BMICategory = '過輕' | '健康' | '過重' | '肥胖'

/**
 * Get BMI Category based on Asian standards
 * @param bmi
 */
export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return '過輕'
  if (bmi < 23.0) return '健康'
  if (bmi < 25.0) return '過重'
  return '肥胖'
}
