import type { InputState } from './types';

export const defaultInputs: InputState = {
  daysPerMonth: 26,

  shiftType: 'single',
  staffPerShiftMin: 8,
  staffPerShiftMax: 12,
  dailyRate: 650,

  laundryCapacityKgDay: 2000,
  laundryPricePerKg: 45,
  rewashRate: 3,

  uniformPcsPerHr: 150,
  uniformPricePerPc: 35,
  uniformVarCost: {
    electricity: 2.5,
    water: 1.2,
    chemicals: 3.8,
    other: 1.0,
  },

  varCostsLaundry: [
    { label: 'Electricity', value: 4.5 },
    { label: 'Water', value: 2.0 },
    { label: 'LPG', value: 3.5 },
    { label: 'Chemicals', value: 5.0 },
    { label: 'Packaging', value: 1.5 },
    { label: 'Maintenance', value: 1.0 },
    { label: 'Other', value: 0.5 },
  ],

  priceEscalation: 5,
  varCostEscalation: 4,
  laborEscalation: 5,
  rentEscalation: 3,

  royaltyPct: 5,
  marketingPct: 2,

  totalCapex: 5000000,
  loanMode: 'pct',
  loanPct: 70,
  loanFixed: 3500000,
  interestRate: 7.5,
  loanTermYears: 5,
  depreciationYears: 10,

  rentPerMonth: 80000,
  insurancePerYear: 60000,

  utilizationRamp: Array.from({ length: 10 }, (_, i) => ({
    year: i + 1,
    utilization: Math.min(50 + i * 6, 95),
  })),
};
