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

export const BMI_IDEAL_RANGE = '18.5 - 24'

export interface BMIStatus {
  label: BMICategory
  color: string
  bg: string
}

/**
 * Get BMI Status based on Taiwan MOHW standards
 * @param bmi
 */
export function getBMIStatus(bmi: number): BMIStatus {
  if (bmi < 18.5) return { label: '過輕', color: 'text-blue-500', bg: 'bg-blue-100' }
  if (bmi < 24) return { label: '健康', color: 'text-emerald-500', bg: 'bg-emerald-100' }
  if (bmi < 27) return { label: '過重', color: 'text-orange-500', bg: 'bg-orange-100' }
  return { label: '肥胖', color: 'text-rose-500', bg: 'bg-rose-100' }
}
