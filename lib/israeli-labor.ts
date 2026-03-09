// Israeli Labor Law Constants & Calculations (2025/2026)
// Based on Israeli tax authority regulations

// Minimum wage (per month, hourly)
export const MIN_WAGE_MONTHLY = 5880.02;
export const MIN_WAGE_HOURLY = 32.30;

// Standard work parameters
export const STANDARD_DAILY_HOURS = 8.6; // after 2018 reform (42h/week / ~4.88 working weeks)
export const STANDARD_MONTHLY_HOURS = 182;
export const STANDARD_WORK_DAYS = 21.67; // average

// Overtime rates per Israeli law
export const OVERTIME_RATE_125 = 1.25; // first 2 hours overtime
export const OVERTIME_RATE_150 = 1.50; // beyond 2 hours overtime
export const OVERTIME_DAILY_THRESHOLD = 8.6; // hours before overtime kicks in
export const OVERTIME_125_MAX_HOURS = 2; // first 2 overtime hours at 125%

// Convalescence pay (דמי הבראה) per day - 2025 value
export const CONVALESCENCE_PER_DAY = 418;

// Tax credit point value (נקודת זיכוי) - monthly
export const TAX_CREDIT_POINT_MONTHLY = 242; // 2025 approximate

// Income tax brackets (מס הכנסה) - 2025 monthly brackets
export const TAX_BRACKETS = [
  { upTo: 7010, rate: 0.10 },
  { upTo: 10060, rate: 0.14 },
  { upTo: 16150, rate: 0.20 },
  { upTo: 22440, rate: 0.31 },
  { upTo: 46690, rate: 0.35 },
  { upTo: 60130, rate: 0.47 },
  { upTo: Infinity, rate: 0.50 },
];

// Bituach Leumi (ביטוח לאומי) rates - employee portion
export const BITUACH_LEUMI = {
  reducedRate: 0.004, // up to 60% of average wage
  fullRate: 0.07,     // above 60% of average wage
  reducedThreshold: 7122, // 60% of average wage (monthly)
};

// Health insurance (ביטוח בריאות) rates - employee portion
export const HEALTH_INSURANCE = {
  reducedRate: 0.031, // up to 60% of average wage
  fullRate: 0.05,     // above 60% of average wage
  reducedThreshold: 7122,
};

// Calculate Israeli income tax
export function calculateIncomeTax(
  grossMonthly: number,
  creditPoints: number = 2.25
): number {
  let tax = 0;
  let remaining = grossMonthly;
  let prevLimit = 0;

  for (const bracket of TAX_BRACKETS) {
    const taxableInBracket = Math.min(remaining, bracket.upTo - prevLimit);
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    prevLimit = bracket.upTo;
  }

  const creditAmount = creditPoints * TAX_CREDIT_POINT_MONTHLY;
  return Math.max(0, Math.round((tax - creditAmount) * 100) / 100);
}

// Calculate Bituach Leumi (employee portion)
export function calculateBituachLeumi(grossMonthly: number): number {
  const threshold = BITUACH_LEUMI.reducedThreshold;
  if (grossMonthly <= threshold) {
    return Math.round(grossMonthly * BITUACH_LEUMI.reducedRate * 100) / 100;
  }
  const reduced = threshold * BITUACH_LEUMI.reducedRate;
  const full = (grossMonthly - threshold) * BITUACH_LEUMI.fullRate;
  return Math.round((reduced + full) * 100) / 100;
}

// Calculate Health Insurance (employee portion)
export function calculateHealthInsurance(grossMonthly: number): number {
  const threshold = HEALTH_INSURANCE.reducedThreshold;
  if (grossMonthly <= threshold) {
    return Math.round(grossMonthly * HEALTH_INSURANCE.reducedRate * 100) / 100;
  }
  const reduced = threshold * HEALTH_INSURANCE.reducedRate;
  const full = (grossMonthly - threshold) * HEALTH_INSURANCE.fullRate;
  return Math.round((reduced + full) * 100) / 100;
}

// Calculate overtime pay based on Israeli law
export function calculateOvertimeBreakdown(
  regularHoursWorked: number,
  totalHoursWorked: number,
  hourlyRate: number
): {
  hours125: number;
  hours150: number;
  pay125: number;
  pay150: number;
  totalOvertimePay: number;
} {
  const overtimeHours = Math.max(0, totalHoursWorked - regularHoursWorked);

  const hours125 = Math.min(overtimeHours, OVERTIME_125_MAX_HOURS);
  const hours150 = Math.max(0, overtimeHours - OVERTIME_125_MAX_HOURS);

  const pay125 = Math.round(hours125 * hourlyRate * OVERTIME_RATE_125 * 100) / 100;
  const pay150 = Math.round(hours150 * hourlyRate * OVERTIME_RATE_150 * 100) / 100;

  return {
    hours125,
    hours150,
    pay125,
    pay150,
    totalOvertimePay: Math.round((pay125 + pay150) * 100) / 100,
  };
}

// Full salary calculation
export function calculateFullSalary(params: {
  baseSalary: number;
  salaryType: string;
  totalHoursWorked: number;
  totalWorkDays: number;
  overtimeHoursDaily: { date: string; regular: number; overtime: number }[];
  taxCreditPoints: number;
  pensionRate: number;
  travelAllowance: number;
  convalescenceDays: number;
  bonuses: number;
  extraDeductions: number;
}) {
  const {
    baseSalary,
    salaryType,
    totalHoursWorked,
    totalWorkDays,
    overtimeHoursDaily,
    taxCreditPoints,
    pensionRate,
    travelAllowance,
    convalescenceDays,
    bonuses,
    extraDeductions,
  } = params;

  // Determine hourly rate
  let hourlyRate: number;
  if (salaryType === "HOURLY") {
    hourlyRate = baseSalary;
  } else if (salaryType === "DAILY") {
    hourlyRate = baseSalary / STANDARD_DAILY_HOURS;
  } else {
    hourlyRate = baseSalary / STANDARD_MONTHLY_HOURS;
  }

  // Calculate overtime per day then sum
  let totalHours125 = 0;
  let totalHours150 = 0;
  let totalOvertimePay = 0;

  for (const day of overtimeHoursDaily) {
    const dailyOvertime = Math.max(0, day.overtime);
    const h125 = Math.min(dailyOvertime, OVERTIME_125_MAX_HOURS);
    const h150 = Math.max(0, dailyOvertime - OVERTIME_125_MAX_HOURS);
    totalHours125 += h125;
    totalHours150 += h150;
    totalOvertimePay += h125 * hourlyRate * OVERTIME_RATE_125;
    totalOvertimePay += h150 * hourlyRate * OVERTIME_RATE_150;
  }
  totalOvertimePay = Math.round(totalOvertimePay * 100) / 100;

  // Convalescence
  const convalescencePay = convalescenceDays * CONVALESCENCE_PER_DAY;

  // Gross salary
  const grossSalary = Math.round(
    (baseSalary + totalOvertimePay + travelAllowance + convalescencePay + bonuses) * 100
  ) / 100;

  // Deductions
  const incomeTax = calculateIncomeTax(grossSalary, taxCreditPoints);
  const bituachLeumi = calculateBituachLeumi(grossSalary);
  const healthIns = calculateHealthInsurance(grossSalary);
  const pensionEmployee = Math.round(grossSalary * (pensionRate / 100) * 100) / 100;
  const pensionEmployerAmt = Math.round(grossSalary * (pensionRate / 100) * 100) / 100;

  const totalDeductions = Math.round(
    (incomeTax + bituachLeumi + healthIns + pensionEmployee + extraDeductions) * 100
  ) / 100;

  const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100;

  return {
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    overtimeHours125: Math.round(totalHours125 * 100) / 100,
    overtimeHours150: Math.round(totalHours150 * 100) / 100,
    overtimePay: totalOvertimePay,
    travelAllowance,
    convalescence: convalescencePay,
    grossSalary,
    incomeTax,
    bituachLeumi,
    healthInsurance: healthIns,
    pensionEmployee,
    pensionEmployer: pensionEmployerAmt,
    totalDeductions,
    netSalary,
    totalWorkDays,
    totalWorkHours: Math.round(totalHoursWorked * 100) / 100,
  };
}
