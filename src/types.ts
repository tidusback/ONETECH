export type ShiftType = 'single' | 'double' | '24hr';

export interface VariableCostItem {
  label: string;
  value: number; // ₱/kg
}

export interface UniformVarCost {
  electricity: number;
  water: number;
  chemicals: number;
  other: number;
}

export interface UtilizationYear {
  year: number;
  utilization: number; // %
}

export interface InputState {
  // Operations
  daysPerMonth: number;

  // Shift Configuration
  shiftType: ShiftType;
  staffPerShiftMin: number;
  staffPerShiftMax: number;
  dailyRate: number; // ₱/day

  // Laundry Line
  laundryCapacityKgDay: number;
  laundryPricePerKg: number;
  rewashRate: number; // %

  // Uniform Line
  uniformPcsPerHr: number;
  uniformPricePerPc: number;
  uniformVarCost: UniformVarCost;

  // Variable Costs Laundry (₱/kg)
  varCostsLaundry: VariableCostItem[];

  // Annual Escalations
  priceEscalation: number; // %
  varCostEscalation: number; // %
  laborEscalation: number; // %
  rentEscalation: number; // %

  // Revenue Deductions
  royaltyPct: number; // %
  marketingPct: number; // %

  // CAPEX & Financing
  totalCapex: number;
  loanMode: 'pct' | 'fixed'; // % of CAPEX or fixed amount
  loanPct: number; // %
  loanFixed: number; // ₱
  interestRate: number; // %
  loanTermYears: number;
  depreciationYears: number;

  // Fixed Costs
  rentPerMonth: number;
  insurancePerYear: number;

  // Utilization Ramp (10 years)
  utilizationRamp: UtilizationYear[];
}
