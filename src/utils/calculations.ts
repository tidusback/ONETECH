import type { InputState } from '../types';

export interface YearlyResult {
  year: number;
  utilization: number; // %

  // Volume
  billableKgPerYear: number;
  rewashKgPerYear: number;
  totalProcessedKg: number;    // billable + rewash (full variable cost applied to both)
  uniformPcsPerYear: number;
  shiftsPerDay: number;
  staffPerShift: number;       // scaled between min/max by utilization
  headcount: number;           // shiftsPerDay × staffPerShift

  // Revenue lines
  laundryRevenue: number;
  rewashCost: number;          // rewash kg × varCostPerKg × vF — cost only, zero extra revenue
  uniformRevenue: number;
  grossRevenue: number;        // laundryRevenue + uniformRevenue (base for royalty/marketing)
  totalRevenue: number;        // grossRevenue − rewashCost

  // P&L deductions
  variableCosts: number;       // totalProcessedKg × varCostPerKg × vF + uniformPcs × uniformVarCost × vF
  royalty: number;
  marketing: number;
  laborCost: number;           // shiftsPerDay × scaledStaff × dailyRate × daysPerYear × lF
  rentAnnual: number;
  insuranceAnnual: number;
  depreciation: number;
  loanPMT: number;

  // Subtotals
  ebitda: number;
  ebitdaMargin: number;
  noi: number;
  noiMargin: number;

  // Cost detail per laundry line item (₱ total for that year)
  varCostDetail: { label: string; totalAmt: number }[];
}

export interface AmortizationRow {
  year: number;
  openingBalance: number;
  annualPMT: number;
  monthlyPMT: number;
  interest: number;    // red — sum of 12 monthly interest charges
  principal: number;  // green — sum of 12 monthly principal repayments
  closingBalance: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function shiftsPerDayFor(shiftType: InputState['shiftType']): number {
  return shiftType === 'single' ? 1 : shiftType === 'double' ? 2 : 3;
}

export function shiftHoursFor(shiftType: InputState['shiftType']): number {
  return shiftType === 'single' ? 8 : shiftType === 'double' ? 16 : 24;
}

/** Linear interpolation of staff count between min and max, scaled by utilization 0–1.
 *  Rounds to nearest integer, clamped to [min, max]. */
export function scaledStaff(inputs: InputState, util: number): number {
  const raw = inputs.staffPerShiftMin + (inputs.staffPerShiftMax - inputs.staffPerShiftMin) * util;
  return Math.min(
    inputs.staffPerShiftMax,
    Math.max(inputs.staffPerShiftMin, Math.round(raw))
  );
}

export function calcLoanAmount(inputs: InputState): number {
  return inputs.loanMode === 'pct'
    ? inputs.totalCapex * (inputs.loanPct / 100)
    : inputs.loanFixed;
}

export function calcMonthlyLoanPMT(inputs: InputState): number {
  const P = calcLoanAmount(inputs);
  const r = inputs.interestRate / 100 / 12;
  const n = inputs.loanTermYears * 12;
  if (P === 0 || n === 0) return 0;
  if (r === 0) return P / n;
  return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calcAnnualLoanPMT(inputs: InputState): number {
  return calcMonthlyLoanPMT(inputs) * 12;
}

// ── Core year computation ─────────────────────────────────────────────────────

export function computeYear(inputs: InputState, yearIndex: number, overrideUtil?: number): YearlyResult {
  const year = yearIndex + 1;
  const utilPct = overrideUtil !== undefined
    ? overrideUtil
    : (inputs.utilizationRamp[yearIndex]?.utilization ?? 0);
  const util = utilPct / 100;

  // Escalation factors (compounding from Year 1 = factor 1, Year 2 = (1+r)^1, etc.)
  const pF = Math.pow(1 + inputs.priceEscalation    / 100, yearIndex); // price → revenue
  const vF = Math.pow(1 + inputs.varCostEscalation  / 100, yearIndex); // utility/variable costs
  const lF = Math.pow(1 + inputs.laborEscalation    / 100, yearIndex); // wages
  const rF = Math.pow(1 + inputs.rentEscalation     / 100, yearIndex); // lease / insurance

  const daysPerYear  = inputs.daysPerMonth * 12;
  const shiftHours   = shiftHoursFor(inputs.shiftType);
  const shiftsDay    = shiftsPerDayFor(inputs.shiftType);
  const staffPerShift = scaledStaff(inputs, util);

  // ── Volume ──────────────────────────────────────────────────────────────────
  const billableKgPerYear  = inputs.laundryCapacityKgDay * util * daysPerYear;
  const rewashKgPerYear    = billableKgPerYear * (inputs.rewashRate / 100);
  const totalProcessedKg   = billableKgPerYear + rewashKgPerYear; // rewash runs full variable cost
  const uniformPcsPerYear  = inputs.uniformPcsPerHr * shiftHours * daysPerYear * util;
  const headcount          = shiftsDay * staffPerShift;

  // ── Unit costs (Year-0 base, escalated by vF) ───────────────────────────────
  const totalVarCostPerKg         = inputs.varCostsLaundry.reduce((s, c) => s + c.value, 0);
  const totalUniformVarCostPerPc  = Object.values(inputs.uniformVarCost).reduce((s, v) => s + v, 0);

  // ── Revenue ──────────────────────────────────────────────────────────────────
  const laundryRevenue = billableKgPerYear * inputs.laundryPricePerKg * pF;
  const uniformRevenue = uniformPcsPerYear * inputs.uniformPricePerPc * pF;
  const grossRevenue   = laundryRevenue + uniformRevenue;

  // Rewash: full variable cost on rewash kg, zero extra revenue
  const rewashCost     = rewashKgPerYear * totalVarCostPerKg * vF;
  const totalRevenue   = grossRevenue - rewashCost;

  // ── Variable costs (totalProcessedKg includes rewash, so full cost applied) ─
  const variableCosts =
    totalProcessedKg   * totalVarCostPerKg        * vF +
    uniformPcsPerYear  * totalUniformVarCostPerPc * vF;

  // ── Revenue deductions (on gross, pre-rewash-deduction) ─────────────────────
  const royalty   = grossRevenue * (inputs.royaltyPct   / 100);
  const marketing = grossRevenue * (inputs.marketingPct / 100);

  // ── Operating costs ──────────────────────────────────────────────────────────
  // Labor: shifts × scaled staff (by utilization) × dailyRate × operating days × labor escalation
  const laborCost       = shiftsDay * staffPerShift * inputs.dailyRate * daysPerYear * lF;
  const rentAnnual      = inputs.rentPerMonth  * 12 * rF;
  const insuranceAnnual = inputs.insurancePerYear   * rF;

  // ── D&A and financing ────────────────────────────────────────────────────────
  const depreciation = year <= inputs.depreciationYears ? inputs.totalCapex / inputs.depreciationYears : 0;
  const loanPMT      = year <= inputs.loanTermYears     ? calcAnnualLoanPMT(inputs)                    : 0;

  // ── P&L ──────────────────────────────────────────────────────────────────────
  const ebitda      = totalRevenue - variableCosts - royalty - marketing - laborCost - rentAnnual - insuranceAnnual;
  const ebitdaMargin = totalRevenue !== 0 ? ebitda / totalRevenue : 0;
  const noi         = ebitda - depreciation - loanPMT;
  const noiMargin   = totalRevenue !== 0 ? noi / totalRevenue : 0;

  // ── Detailed cost breakdown ──────────────────────────────────────────────────
  const varCostDetail = inputs.varCostsLaundry.map(c => ({
    label: c.label,
    totalAmt: totalProcessedKg * c.value * vF,
  }));

  return {
    year, utilization: utilPct,
    billableKgPerYear, rewashKgPerYear, totalProcessedKg, uniformPcsPerYear,
    shiftsPerDay: shiftsDay, staffPerShift, headcount,
    laundryRevenue, rewashCost, uniformRevenue, grossRevenue, totalRevenue,
    variableCosts, royalty, marketing, laborCost, rentAnnual, insuranceAnnual,
    depreciation, loanPMT,
    ebitda, ebitdaMargin, noi, noiMargin,
    varCostDetail,
  };
}

export function computeAllYears(inputs: InputState): YearlyResult[] {
  return Array.from({ length: 10 }, (_, i) => computeYear(inputs, i));
}

/** Binary-search the utilization % at which Year-1 NOI = 0. Range 0–150%. */
export function computeBreakevenUtil(inputs: InputState): number {
  let lo = 0, hi = 150;
  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2;
    if (computeYear(inputs, 0, mid).noi < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Full amortization schedule — one row per loan year, monthly simulation rolled up to annual. */
export function computeAmortization(inputs: InputState): AmortizationRow[] {
  const P = calcLoanAmount(inputs);
  const r = inputs.interestRate / 100 / 12;
  const n = inputs.loanTermYears * 12;
  if (P === 0 || n === 0 || inputs.loanTermYears === 0) return [];

  const monthlyPMT = calcMonthlyLoanPMT(inputs);
  const annualPMT  = monthlyPMT * 12;

  const rows: AmortizationRow[] = [];
  let balance = P;

  for (let y = 1; y <= inputs.loanTermYears; y++) {
    const openingBalance = balance;
    let yearInterest  = 0;
    let yearPrincipal = 0;

    for (let m = 0; m < 12; m++) {
      const monthInterest  = balance * r;
      const monthPrincipal = monthlyPMT - monthInterest;
      yearInterest  += monthInterest;
      yearPrincipal += monthPrincipal;
      balance       -= monthPrincipal;
    }

    // Guard against floating-point drift on final year
    if (y === inputs.loanTermYears) balance = 0;

    rows.push({
      year: y,
      openingBalance,
      annualPMT,
      monthlyPMT,
      interest:  yearInterest,
      principal: yearPrincipal,
      closingBalance: Math.max(0, balance),
    });
  }

  return rows;
}
