// Pay frequency constants
export const PAY_FREQUENCIES = {
  WEEKLY: { label: 'Weekly', periodsPerYear: 52 },
  BI_WEEKLY: { label: 'Bi-Weekly', periodsPerYear: 26 },
  SEMI_MONTHLY: { label: 'Semi-Monthly', periodsPerYear: 24 },
  MONTHLY: { label: 'Monthly', periodsPerYear: 12 }
};

export const SALARY_FREQUENCIES = {
  ANNUAL: { label: 'per Year', periods: 1 },
  MONTHLY: { label: 'per Month', periods: 12 }
};

// Tax rates
export const TAX_RATES = {
  FEDERAL: 0.12,
  STATE: 0.05,
  SOCIAL_SECURITY: 0.062,
  MEDICARE: 0.0145
};

// Available deductions
export const PRE_TAX_DEDUCTIONS = [
  '401(k)',
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  'HSA'
];

export const POST_TAX_DEDUCTIONS = [
  'Roth 401(k)',
  'Garnishments'
];

/**
 * Calculate gross pay from hourly rate
 */
export function calculateGrossFromHourly(rate, hours) {
  return rate * hours;
}

/**
 * Calculate gross pay from target salary
 */
export function calculateGrossFromSalary(targetSalary, salaryFrequency, payPeriodFrequency) {
  const salaryPerYear = salaryFrequency === 'ANNUAL' ? targetSalary : targetSalary * 12;
  const periodsPerYear = PAY_FREQUENCIES[payPeriodFrequency].periodsPerYear;
  return salaryPerYear / periodsPerYear;
}

/**
 * Calculate all taxes based on gross pay
 */
export function calculateTaxes(grossPay) {
  return {
    federal: grossPay * TAX_RATES.FEDERAL,
    state: grossPay * TAX_RATES.STATE,
    socialSecurity: grossPay * TAX_RATES.SOCIAL_SECURITY,
    medicare: grossPay * TAX_RATES.MEDICARE
  };
}

/**
 * Calculate total deductions
 */
export function calculateTotalDeductions(deductions) {
  return deductions.reduce((total, deduction) => total + deduction.amount, 0);
}

/**
 * Calculate net pay
 */
export function calculateNetPay(grossPay, taxes, preTaxDeductions, postTaxDeductions) {
  const totalTaxes = Object.values(taxes).reduce((sum, tax) => sum + tax, 0);
  const totalPreTaxDeductions = calculateTotalDeductions(preTaxDeductions);
  const totalPostTaxDeductions = calculateTotalDeductions(postTaxDeductions);
  
  const taxableIncome = grossPay - totalPreTaxDeductions;
  const taxesOnTaxableIncome = taxableIncome * (TAX_RATES.FEDERAL + TAX_RATES.STATE + TAX_RATES.SOCIAL_SECURITY + TAX_RATES.MEDICARE);
  
  return grossPay - totalPreTaxDeductions - taxesOnTaxableIncome - totalPostTaxDeductions;
}

/**
 * Calculate YTD totals
 */
export function calculateYTDTotals(currentPeriod, previousYTD = {}) {
  return {
    grossPay: (previousYTD.grossPay || 0) + currentPeriod.grossPay,
    netPay: (previousYTD.netPay || 0) + currentPeriod.netPay,
    taxes: {
      federal: (previousYTD.taxes?.federal || 0) + currentPeriod.taxes.federal,
      state: (previousYTD.taxes?.state || 0) + currentPeriod.taxes.state,
      socialSecurity: (previousYTD.taxes?.socialSecurity || 0) + currentPeriod.taxes.socialSecurity,
      medicare: (previousYTD.taxes?.medicare || 0) + currentPeriod.taxes.medicare
    }
  };
}

/**
 * Calculate pay period dates based on pay date and frequency
 */
export function calculatePayPeriodDates(payDate, frequency) {
  const payDateObj = new Date(payDate);
  let startDate, endDate;

  switch (frequency) {
    case 'WEEKLY':
      endDate = new Date(payDateObj);
      startDate = new Date(payDateObj);
      startDate.setDate(startDate.getDate() - 6);
      break;
    case 'BI_WEEKLY':
      endDate = new Date(payDateObj);
      startDate = new Date(payDateObj);
      startDate.setDate(startDate.getDate() - 13);
      break;
    case 'SEMI_MONTHLY':
      if (payDateObj.getDate() <= 15) {
        startDate = new Date(payDateObj.getFullYear(), payDateObj.getMonth(), 1);
        endDate = new Date(payDateObj.getFullYear(), payDateObj.getMonth(), 15);
      } else {
        startDate = new Date(payDateObj.getFullYear(), payDateObj.getMonth(), 16);
        endDate = new Date(payDateObj.getFullYear(), payDateObj.getMonth() + 1, 0);
      }
      break;
    case 'MONTHLY':
      startDate = new Date(payDateObj.getFullYear(), payDateObj.getMonth(), 1);
      endDate = new Date(payDateObj.getFullYear(), payDateObj.getMonth() + 1, 0);
      break;
    default:
      startDate = endDate = payDateObj;
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
}