import * as XLSX from 'xlsx';
import type { InputState } from '../types';
import {
  computeAllYears,
  computeAmortization,
  computeBreakevenUtil,
  computeYear,
  calcLoanAmount,
  calcMonthlyLoanPMT,
  calcAnnualLoanPMT,
  shiftsPerDayFor,
  shiftHoursFor,
} from './calculations';

// ── Colour palette ─────────────────────────────────────────────────────────────
const C = {
  NAVY:       '1F3864',
  NAVY_MID:   '2D4F8E',
  NAVY_LIGHT: '3A6ABF',
  POWDER:     '89CFF0',
  BLUE_PALE:  'D4ECFA',
  BLUE_SOFT:  'B8DCF5',
  WHITE:      'FFFFFF',
  GRAY50:     'F8FAFC',
  GRAY100:    'F1F5F9',
  GRAY200:    'E2E8F0',
  GRAY600:    '475569',
  GREEN:      '16A34A',
  GREEN_PALE: 'DCFCE7',
  RED:        'DC2626',
  RED_PALE:   'FEF2F2',
  AMBER:      'D97706',
  AMBER_PALE: 'FFFBEB',
} as const;

// ── Style helpers ─────────────────────────────────────────────────────────────
type XlFill = { patternType: 'solid'; fgColor: { rgb: string } };
type XlFont = { bold?: boolean; italic?: boolean; sz?: number; color?: { rgb: string }; name?: string };
type XlAlign = { horizontal?: 'left'|'center'|'right'; vertical?: 'top'|'center'|'bottom'; wrapText?: boolean; indent?: number };
type XlBorder = { style: 'thin'|'medium'|'thick'; color?: { rgb: string } };
type XlStyle = {
  font?:      XlFont;
  fill?:      XlFill;
  alignment?: XlAlign;
  border?:    { top?: XlBorder; bottom?: XlBorder; left?: XlBorder; right?: XlBorder };
  numFmt?:    string;
};

function fill(rgb: string): XlFill { return { patternType: 'solid', fgColor: { rgb } }; }
function fc(rgb: string) { return { rgb }; }
function border(style: 'thin'|'medium' = 'thin', rgb: string = C.GRAY200): XlBorder { return { style, color: { rgb } }; }
function allBorders(style: 'thin'|'medium' = 'thin', rgb: string = C.GRAY200) {
  const b = border(style, rgb);
  return { top: b, bottom: b, left: b, right: b };
}

// Pre-built style objects
const S: Record<string, XlStyle> = {
  // Titles / section headers
  sheetTitle: {
    font:      { bold: true, sz: 13, color: fc(C.WHITE), name: 'Calibri' },
    fill:      fill(C.NAVY),
    alignment: { horizontal: 'left', vertical: 'center' },
  },
  colHeader: {
    font:      { bold: true, sz: 10, color: fc(C.WHITE) },
    fill:      fill(C.NAVY_MID),
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border:    allBorders('thin', C.NAVY),
  },
  colHeaderL: {
    font:      { bold: true, sz: 10, color: fc(C.WHITE) },
    fill:      fill(C.NAVY_MID),
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border:    allBorders('thin', C.NAVY),
  },
  sectionBanner: {
    font:      { bold: true, sz: 9, color: fc(C.WHITE) },
    fill:      fill(C.NAVY),
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    allBorders('thin', C.NAVY),
  },
  sectionBannerRight: {
    font:      { bold: true, sz: 9, color: fc(C.WHITE) },
    fill:      fill(C.NAVY),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', C.NAVY),
  },
  subSection: {
    font:      { bold: true, sz: 10, color: fc(C.NAVY) },
    fill:      fill(C.BLUE_PALE),
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    allBorders('thin', C.BLUE_SOFT),
  },
  subSectionRight: {
    font:      { bold: true, sz: 10, color: fc(C.NAVY) },
    fill:      fill(C.BLUE_PALE),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', C.BLUE_SOFT),
  },

  // Data cells
  label: {
    font:      { sz: 10, color: fc(C.GRAY600) },
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    allBorders(),
  },
  labelBold: {
    font:      { bold: true, sz: 10, color: fc(C.NAVY) },
    fill:      fill(C.BLUE_PALE),
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    allBorders('thin', C.BLUE_SOFT),
  },
  labelIndent: {
    font:      { sz: 10, color: fc(C.GRAY600), italic: true },
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
    border:    allBorders(),
  },
  unit: {
    font:      { sz: 9, color: fc(C.GRAY600), italic: true },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    allBorders(),
  },

  // Numbers — normal
  num: {
    font:      { sz: 10 },
    numFmt:    '"₱"#,##0',
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders(),
  },
  numDec: {
    font:      { sz: 10 },
    numFmt:    '"₱"#,##0.00',
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders(),
  },
  numPlain: {
    font:      { sz: 10 },
    numFmt:    '#,##0.00',
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders(),
  },
  pct: {
    font:      { sz: 10 },
    numFmt:    '0.00%',
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders(),
  },
  textRight: {
    font:      { sz: 10 },
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders(),
  },
  textCenter: {
    font:      { sz: 10 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border:    allBorders(),
  },

  // Numbers — totals / bold rows
  numBold: {
    font:      { bold: true, sz: 10, color: fc(C.NAVY) },
    numFmt:    '"₱"#,##0',
    fill:      fill(C.BLUE_PALE),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', C.BLUE_SOFT),
  },
  pctBold: {
    font:      { bold: true, sz: 10, color: fc(C.NAVY) },
    numFmt:    '0.00%',
    fill:      fill(C.BLUE_PALE),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', C.BLUE_SOFT),
  },

  // Numbers — P&L special
  positive: {
    font:      { bold: true, sz: 10, color: fc(C.GREEN) },
    numFmt:    '"₱"#,##0',
    fill:      fill(C.GREEN_PALE),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', 'BBFFD4'),
  },
  negative: {
    font:      { bold: true, sz: 10, color: fc(C.RED) },
    numFmt:    '"₱"#,##0',
    fill:      fill(C.RED_PALE),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', 'FFBBBB'),
  },
  pctPositive: {
    font:      { bold: true, sz: 10, color: fc(C.GREEN) },
    numFmt:    '0.00%',
    fill:      fill(C.GREEN_PALE),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', 'BBFFD4'),
  },
  pctNegative: {
    font:      { bold: true, sz: 10, color: fc(C.RED) },
    numFmt:    '0.00%',
    fill:      fill(C.RED_PALE),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', 'FFBBBB'),
  },
  deduction: {
    font:      { sz: 10, color: fc(C.AMBER), italic: true },
    numFmt:    '"₱"(#,##0)',
    fill:      fill(C.AMBER_PALE),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders(),
  },

  // Amortization schedule
  interest: {
    font:      { bold: true, sz: 10, color: fc(C.RED) },
    numFmt:    '"₱"#,##0.00',
    fill:      fill('FFF8F8'),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', 'FFD0D0'),
  },
  principal: {
    font:      { bold: true, sz: 10, color: fc(C.GREEN) },
    numFmt:    '"₱"#,##0.00',
    fill:      fill('F8FFF8'),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('thin', 'D0FFD0'),
  },
  totalFooter: {
    font:      { bold: true, sz: 11, color: fc(C.WHITE) },
    numFmt:    '"₱"#,##0.00',
    fill:      fill(C.NAVY),
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    allBorders('medium', C.NAVY),
  },
  totalFooterL: {
    font:      { bold: true, sz: 11, color: fc(C.POWDER) },
    fill:      fill(C.NAVY),
    alignment: { horizontal: 'left', vertical: 'center' },
    border:    allBorders('medium', C.NAVY),
  },

  // Sensitivity
  scenGreen:  { font: { bold: true, sz: 10, color: fc(C.WHITE) }, fill: fill('16A34A'), alignment: { horizontal: 'center' }, border: allBorders() },
  scenBlue:   { font: { bold: true, sz: 10, color: fc(C.WHITE) }, fill: fill('2563EB'), alignment: { horizontal: 'center' }, border: allBorders() },
  scenAmber:  { font: { bold: true, sz: 10, color: fc(C.WHITE) }, fill: fill(C.AMBER),  alignment: { horizontal: 'center' }, border: allBorders() },
  scenRed:    { font: { bold: true, sz: 10, color: fc(C.WHITE) }, fill: fill(C.RED),    alignment: { horizontal: 'center' }, border: allBorders() },
};

// ── Cell factories ─────────────────────────────────────────────────────────────
type Row = XLSX.CellObject[];
function cs(v: string, s: XlStyle = S.label): XLSX.CellObject { return { v, t: 's', s } as XLSX.CellObject; }
function cn(v: number, s: XlStyle = S.num):   XLSX.CellObject { return { v, t: 'n', s } as XLSX.CellObject; }
function cp(v: number, s: XlStyle = S.pct):   XLSX.CellObject { return { v, t: 'n', s } as XLSX.CellObject; }  // percent (store as decimal)
function bl(s: XlStyle = {}):                  XLSX.CellObject { return { v: '', t: 's', s } as XLSX.CellObject; }

// Shorthand
const hdr  = (v: string) => cs(v, S.colHeader);
const hdrL = (v: string) => cs(v, S.colHeaderL);
const lbl  = (v: string) => cs(v, S.label);
const lblB = (v: string) => cs(v, S.labelBold);
const lblI = (v: string) => cs(v, S.labelIndent);
const sec  = (v: string) => cs(v, S.sectionBanner);

function noiFmt(v: number): XLSX.CellObject {
  return cn(v, v >= 0 ? S.positive : S.negative);
}
function noiPctFmt(v: number): XLSX.CellObject {
  return cp(v, v >= 0 ? S.pctPositive : S.pctNegative);
}
function deductFmt(v: number): XLSX.CellObject {
  return cn(v, S.deduction);
}

// ── Sheet width helper ─────────────────────────────────────────────────────────
function wch(chars: number) { return { wch: chars }; }

// ── Apply a sheet title row spanning all columns ───────────────────────────────
function titleRow(text: string, ncols: number): Row {
  const row: Row = [cs(text, S.sheetTitle)];
  for (let i = 1; i < ncols; i++) row.push(bl(S.sheetTitle));
  return row;
}

// ── Build a worksheet from a 2D cell array ────────────────────────────────────
function makeSheet(rows: Row[], colWidths: { wch: number }[], merges?: XLSX.Range[]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = colWidths;
  if (merges) ws['!merges'] = merges;
  return ws;
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHEET 1 — ASSUMPTIONS
// ══════════════════════════════════════════════════════════════════════════════
function buildAssumptions(inputs: InputState): XLSX.WorkSheet {
  const rows: Row[] = [];
  const merges: XLSX.Range[] = [];
  let r = 0;

  function addTitle(text: string) {
    rows.push(titleRow(text, 3));
    merges.push({ s: { r, c: 0 }, e: { r, c: 2 } });
    r++;
  }
  function addColHeaders() {
    rows.push([hdrL('Parameter'), hdr('Value'), hdr('Unit')]);
    r++;
  }
  function addSection(name: string) {
    rows.push([sec(name), cs('', S.sectionBanner), cs('', S.sectionBanner)]);
    merges.push({ s: { r, c: 0 }, e: { r, c: 2 } });
    r++;
  }
  function addRow(param: string, value: string | number, unit: string, bold = false) {
    const numV = typeof value === 'number';
    rows.push([
      bold ? lblB(param) : lbl(param),
      numV ? cn(value as number, bold ? S.numBold : S.numPlain) : cs(value as string, bold ? S.labelBold : S.textRight),
      cs(unit, S.unit),
    ]);
    r++;
  }

  addTitle('GNMI — Nortkem Loan & Investment Analysis — Assumptions');
  r++; rows.push([bl(), bl(), bl()]); // blank row after title
  addColHeaders();

  // Operations
  addSection('OPERATIONS');
  addRow('Operating Days / Month', inputs.daysPerMonth, 'days/mo');
  addRow('Annual Operating Days', inputs.daysPerMonth * 12, 'days/yr', true);

  // Shift Configuration
  addSection('SHIFT CONFIGURATION');
  addRow('Shift Type', inputs.shiftType === 'single' ? 'Single (8 hr)' : inputs.shiftType === 'double' ? 'Double (16 hr)' : '24-Hour', '');
  addRow('Shift Hours / Day', shiftHoursFor(inputs.shiftType), 'hrs/day');
  addRow('Shifts / Day', shiftsPerDayFor(inputs.shiftType), 'shifts');
  addRow('Staff per Shift — Minimum', inputs.staffPerShiftMin, 'pax');
  addRow('Staff per Shift — Maximum', inputs.staffPerShiftMax, 'pax');
  addRow('Daily Rate per Staff', inputs.dailyRate, '₱/day');

  // Laundry Line
  addSection('LAUNDRY LINE');
  addRow('Laundry Capacity', inputs.laundryCapacityKgDay, 'kg/day');
  addRow('Price per kg', inputs.laundryPricePerKg, '₱/kg');
  addRow('Rewash Rate', inputs.rewashRate / 100, '%  (zero extra revenue)');

  // Uniform Line
  addSection('UNIFORM LINE');
  addRow('Output Rate', inputs.uniformPcsPerHr, 'pcs/hr');
  addRow('Price per Piece', inputs.uniformPricePerPc, '₱/pc');
  addRow('  Var Cost — Electricity', inputs.uniformVarCost.electricity, '₱/pc');
  addRow('  Var Cost — Water',       inputs.uniformVarCost.water,       '₱/pc');
  addRow('  Var Cost — Chemicals',   inputs.uniformVarCost.chemicals,   '₱/pc');
  addRow('  Var Cost — Other',       inputs.uniformVarCost.other,       '₱/pc');
  const totalUniVar = Object.values(inputs.uniformVarCost).reduce((s, v) => s + v, 0);
  addRow('  Total Variable Cost', totalUniVar, '₱/pc', true);

  // Variable Costs Laundry
  addSection('VARIABLE COSTS — LAUNDRY (₱/kg)');
  const totalLaundryVar = inputs.varCostsLaundry.reduce((s, c) => s + c.value, 0);
  inputs.varCostsLaundry.forEach(c => addRow(`  ${c.label}`, c.value, '₱/kg'));
  addRow('  Total Variable Cost / kg', totalLaundryVar, '₱/kg', true);

  // Annual Escalations
  addSection('ANNUAL ESCALATIONS');
  addRow('Price Escalation (Revenue)', inputs.priceEscalation / 100, '% p.a.');
  addRow('Variable Cost Escalation',   inputs.varCostEscalation / 100, '% p.a.');
  addRow('Labor / Wage Escalation',    inputs.laborEscalation / 100, '% p.a.');
  addRow('Rent / Lease Escalation',    inputs.rentEscalation / 100, '% p.a.');

  // Revenue Deductions
  addSection('REVENUE DEDUCTIONS');
  addRow('Royalty Fee',    inputs.royaltyPct   / 100, '% of gross revenue');
  addRow('Marketing Fee',  inputs.marketingPct / 100, '% of gross revenue');
  addRow('Total Deduction', (inputs.royaltyPct + inputs.marketingPct) / 100, '% of gross revenue', true);

  // CAPEX & Financing
  addSection('CAPEX & FINANCING');
  const loanAmt = calcLoanAmount(inputs);
  addRow('Total CAPEX',          inputs.totalCapex, '₱');
  addRow('Loan Input Mode',      inputs.loanMode === 'pct' ? '% of CAPEX' : 'Fixed ₱', '');
  if (inputs.loanMode === 'pct') {
    addRow('Loan %',             inputs.loanPct / 100, '%');
  } else {
    addRow('Loan Amount (Fixed)', inputs.loanFixed, '₱');
  }
  addRow('Loan Amount',          loanAmt, '₱', true);
  addRow('Equity (Down Payment)', inputs.totalCapex - loanAmt, '₱', true);
  addRow('Interest Rate',        inputs.interestRate / 100, '% p.a.');
  addRow('Loan Term',            inputs.loanTermYears, 'years');
  addRow('Monthly PMT',          calcMonthlyLoanPMT(inputs), '₱/mo');
  addRow('Annual PMT',           calcAnnualLoanPMT(inputs), '₱/yr', true);
  addRow('Depreciation Period',  inputs.depreciationYears, 'years');
  addRow('Annual Depreciation',  inputs.totalCapex / inputs.depreciationYears, '₱/yr');

  // Fixed Costs
  addSection('FIXED COSTS');
  addRow('Rent per Month',     inputs.rentPerMonth, '₱/mo');
  addRow('Annual Rent',        inputs.rentPerMonth * 12, '₱/yr', true);
  addRow('Insurance per Year', inputs.insurancePerYear, '₱/yr');

  // Utilization Ramp
  addSection('UTILIZATION RAMP (10 YEARS)');
  inputs.utilizationRamp.forEach(u => {
    addRow(`Year ${u.year}`, u.utilization / 100, '%');
  });

  return makeSheet(rows, [wch(38), wch(18), wch(28)], merges);
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHEET 2 — 10-YEAR P&L
// ══════════════════════════════════════════════════════════════════════════════
function buildPnL(inputs: InputState): XLSX.WorkSheet {
  const years = computeAllYears(inputs);
  const rows: Row[] = [];
  const merges: XLSX.Range[] = [];
  let r = 0;
  const NCOLS = 12; // label + 10 years + utilization header is in label row

  // ── Title ──
  rows.push(titleRow('GNMI — 10-Year Profit & Loss Statement (PHP)', NCOLS));
  merges.push({ s: { r, c: 0 }, e: { r, c: NCOLS - 1 } }); r++;
  rows.push([bl()]); r++; // spacer

  // ── Column headers ──
  rows.push([
    hdrL('Line Item'),
    ...years.map(y => hdr(`Year ${y.year}\n${y.utilization.toFixed(0)}% util`)),
    hdr('10-Yr Total'),
  ]); r++;

  // Shorthand row builders
  function dataRow(
    label: string,
    getter: (y: typeof years[0]) => number,
    opts: { bold?: boolean; deduct?: boolean; isNOI?: boolean; pct?: boolean } = {}
  ) {
    const vals = years.map(y => getter(y));
    const total = vals.reduce((s, v) => s + v, 0);
    let rowCells: Row;

    if (opts.pct) {
      rowCells = [
        opts.bold ? lblB(label) : lblI(label),
        ...vals.map(v => noiPctFmt(v)),
        cp(total / years.length, S.pct),
      ];
    } else if (opts.isNOI) {
      rowCells = [
        lblB(label),
        ...vals.map(v => noiFmt(v)),
        noiFmt(total),
      ];
    } else if (opts.deduct) {
      rowCells = [
        lblI(label),
        ...vals.map(v => deductFmt(v)),
        deductFmt(total),
      ];
    } else if (opts.bold) {
      rowCells = [
        lblB(label),
        ...vals.map(v => cn(v, S.numBold)),
        cn(total, S.numBold),
      ];
    } else {
      rowCells = [
        lbl(label),
        ...vals.map(v => cn(v, S.num)),
        cn(total, S.num),
      ];
    }
    rows.push(rowCells); r++;
  }

  function sectionRow(label: string) {
    const cells: Row = [sec(label)];
    for (let i = 1; i < NCOLS; i++) cells.push(cs('', S.sectionBanner));
    rows.push(cells);
    merges.push({ s: { r, c: 0 }, e: { r, c: NCOLS - 1 } });
    r++;
  }

  function spacerRow() {
    rows.push([bl()]); r++;
  }

  // ── REVENUE ──
  sectionRow('REVENUE');
  dataRow('Laundry Revenue',                y => y.laundryRevenue);
  dataRow('  Less: Rewash Cost',            y => -y.rewashCost,    { deduct: true });
  dataRow('Uniform Revenue',                y => y.uniformRevenue);
  dataRow('Total Revenue (net of rewash)',  y => y.totalRevenue,   { bold: true });

  spacerRow();
  sectionRow('VARIABLE COSTS');
  dataRow('  Total Variable Costs',         y => y.variableCosts,  { bold: true });
  // Laundry breakdown
  inputs.varCostsLaundry.forEach(item => {
    dataRow(`    └ Laundry — ${item.label}`, y => {
      const vF = Math.pow(1 + inputs.varCostEscalation / 100, y.year - 1);
      return y.totalProcessedKg * item.value * vF;
    });
  });
  // Uniform breakdown
  (Object.entries(inputs.uniformVarCost) as [keyof typeof inputs.uniformVarCost, number][])
    .forEach(([key, baseRate]) => {
      dataRow(`    └ Uniform — ${key.charAt(0).toUpperCase() + key.slice(1)}`, y => {
        const vF = Math.pow(1 + inputs.varCostEscalation / 100, y.year - 1);
        return y.uniformPcsPerYear * baseRate * vF;
      });
    });

  spacerRow();
  sectionRow('REVENUE DEDUCTIONS & FIXED COSTS');
  dataRow('  Royalty',                      y => y.royalty,        { deduct: true });
  dataRow('  Marketing',                    y => y.marketing,      { deduct: true });
  dataRow('  Labor',                        y => y.laborCost,      { deduct: true });
  dataRow('  Rent',                         y => y.rentAnnual,     { deduct: true });
  dataRow('  Insurance',                    y => y.insuranceAnnual,{ deduct: true });

  spacerRow();
  sectionRow('EARNINGS');
  dataRow('EBITDA',                         y => y.ebitda,         { bold: true });
  dataRow('  EBITDA Margin',               y => y.ebitdaMargin,   { pct: true });

  spacerRow();
  sectionRow('BELOW THE LINE');
  dataRow('  Depreciation',                y => y.depreciation,   { deduct: true });
  dataRow('  Loan Payment (PMT)',           y => y.loanPMT,        { deduct: true });

  spacerRow();
  dataRow('NET OPERATING INCOME (NOI)',     y => y.noi,            { isNOI: true });
  dataRow('  NOI Margin',                  y => y.noiMargin,      { pct: true });

  const ws = makeSheet(rows,
    [wch(32), ...Array(10).fill(wch(14)), wch(14)],
    merges
  );
  ws['!freeze'] = { xSplit: 1, ySplit: 3 } as unknown as XLSX.CellAddress;
  return ws;
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHEET 3 — SENSITIVITY
// ══════════════════════════════════════════════════════════════════════════════
function buildSensitivity(inputs: InputState): XLSX.WorkSheet {
  const rows: Row[] = [];
  const merges: XLSX.Range[] = [];
  let r = 0;

  const SCENARIOS = [
    { label: 'Conservative', util: 30, style: S.scenRed },
    { label: 'Base Case',    util: 50, style: S.scenAmber },
    { label: 'Target',       util: 65, style: S.scenBlue },
    { label: 'Optimistic',   util: 80, style: S.scenGreen },
  ];
  const MATRIX_YEARS = [1, 3, 5, 7, 10];
  const BE_STEPS = Array.from({ length: 23 }, (_, i) => 10 + i * 5);
  const breakevenUtil = computeBreakevenUtil(inputs);

  // ── Title ──
  rows.push(titleRow('GNMI — Sensitivity Analysis', 8));
  merges.push({ s: { r, c: 0 }, e: { r, c: 7 } }); r++;
  rows.push([bl()]); r++;

  // ── Scenario Cards block ──
  rows.push([
    hdrL('Scenario'),
    hdr('Utilization'),
    hdr('Year 1 Revenue'),
    hdr('Year 1 NOI'),
    hdr('Year 3 NOI'),
    hdr('Year 5 NOI'),
    hdr('Year 10 NOI'),
    hdr('1st Profit Year'),
  ]); r++;

  SCENARIOS.forEach(s => {
    const allYrs = Array.from({ length: 10 }, (_, i) => computeYear(inputs, i, s.util));
    const firstProfit = allYrs.findIndex(y => y.noi > 0);
    rows.push([
      cs(s.label, s.style),
      cp(s.util / 100, { ...s.style, numFmt: '0%' }),
      cn(allYrs[0].totalRevenue, { ...s.style, numFmt: '"₱"#,##0' }),
      noiFmt(allYrs[0].noi),
      noiFmt(allYrs[2].noi),
      noiFmt(allYrs[4].noi),
      noiFmt(allYrs[9].noi),
      cs(firstProfit >= 0 ? `Year ${firstProfit + 1}` : 'Outside 10yr',
        firstProfit >= 0 ? { ...S.textCenter, font: { bold: true, color: fc(C.GREEN), sz: 10 } }
                        : { ...S.textCenter, font: { bold: true, color: fc(C.RED),   sz: 10 } }),
    ]); r++;
  });

  rows.push([bl()]); r++;

  // ── NOI Sensitivity Matrix ──
  rows.push(titleRow('NOI Sensitivity Matrix — Scenario × Year', 7));
  merges.push({ s: { r, c: 0 }, e: { r, c: 6 } }); r++;

  rows.push([
    hdrL('Scenario'),
    hdr('Util %'),
    ...MATRIX_YEARS.map(y => hdr(`Year ${y}`)),
  ]); r++;

  SCENARIOS.forEach(s => {
    rows.push([
      cs(`${s.label} (${s.util}%)`, s.style),
      cp(s.util / 100, { ...s.style, numFmt: '0%' }),
      ...MATRIX_YEARS.map(y => noiFmt(computeYear(inputs, y - 1, s.util).noi)),
    ]); r++;
  });

  rows.push([bl()]); r++;

  // ── Breakeven callout ──
  rows.push([
    cs(`Breakeven Utilization (Year 1): ${breakevenUtil.toFixed(1)}%  →  Above this, NOI turns positive`, {
      font: { bold: true, sz: 10, color: fc(C.AMBER) },
      fill: fill(C.AMBER_PALE),
      alignment: { horizontal: 'left' },
      border: allBorders('thin', C.AMBER),
    }),
    ...Array(6).fill(bl({ fill: fill(C.AMBER_PALE), border: allBorders('thin', C.AMBER) })),
  ]);
  merges.push({ s: { r, c: 0 }, e: { r, c: 6 } }); r++;

  rows.push([bl()]); r++;

  // ── Breakeven Table 10–120% ──
  rows.push(titleRow('Breakeven Analysis — NOI by Utilization Level (Year 1)', 4));
  merges.push({ s: { r, c: 0 }, e: { r, c: 3 } }); r++;

  rows.push([
    hdrL('Utilization %'),
    hdr('Year 1 NOI'),
    hdr('Year 1 Revenue'),
    hdr('Status'),
  ]); r++;

  BE_STEPS.forEach(util => {
    const res = computeYear(inputs, 0, util);
    const isProfit = res.noi >= 0;
    const isBE = Math.abs(util - breakevenUtil) < 2.6;
    rows.push([
      cp(util / 100, {
        font: { bold: isBE, sz: 10, color: isBE ? fc(C.AMBER) : fc(isProfit ? C.GREEN : C.RED) },
        fill: isBE ? fill(C.AMBER_PALE) : fill(isProfit ? C.GREEN_PALE : C.RED_PALE),
        numFmt: '0%',
        alignment: { horizontal: 'center' },
        border: allBorders(),
      }),
      noiFmt(res.noi),
      cn(res.totalRevenue, S.num),
      cs(isProfit ? '✓ Profitable' : '✗ Loss', {
        font: { bold: true, sz: 10, color: isProfit ? fc(C.GREEN) : fc(C.RED) },
        fill: fill(isProfit ? C.GREEN_PALE : C.RED_PALE),
        alignment: { horizontal: 'center' },
        border: allBorders(),
      }),
    ]); r++;
  });

  return makeSheet(rows,
    [wch(30), wch(15), wch(18), wch(16)],
    merges
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHEET 4 — LOAN SCHEDULE
// ══════════════════════════════════════════════════════════════════════════════
function buildLoanSchedule(inputs: InputState): XLSX.WorkSheet {
  const rows: Row[] = [];
  const merges: XLSX.Range[] = [];
  let r = 0;

  const loanAmt     = calcLoanAmount(inputs);
  const equity      = inputs.totalCapex - loanAmt;
  const monthlyPMT  = calcMonthlyLoanPMT(inputs);
  const annualPMT   = calcAnnualLoanPMT(inputs);
  const schedule    = computeAmortization(inputs);
  const totalInt    = schedule.reduce((s, x) => s + x.interest,  0);
  const totalPaid   = schedule.reduce((s, x) => s + x.annualPMT, 0);
  const ltvPct      = inputs.totalCapex > 0 ? loanAmt / inputs.totalCapex : 0;
  const NCOLS = 7;

  // ── Title ──
  rows.push(titleRow('GNMI — Loan Amortization Schedule', NCOLS));
  merges.push({ s: { r, c: 0 }, e: { r, c: NCOLS - 1 } }); r++;
  rows.push([bl()]); r++;

  // ── Loan Summary ──
  rows.push([
    cs('LOAN SUMMARY', S.sectionBanner),
    ...Array(NCOLS - 1).fill(cs('', S.sectionBanner)),
  ]);
  merges.push({ s: { r, c: 0 }, e: { r, c: NCOLS - 1 } }); r++;

  const sumRows: [string, number, string, XlStyle][] = [
    ['Total CAPEX',         inputs.totalCapex,   '₱',       S.numBold],
    ['Loan Amount',         loanAmt,              '₱',       S.numBold],
    ['Equity (Down Pay.)',  equity,               '₱',       S.numBold],
    ['LTV Ratio',           ltvPct,               '%',       S.pctBold],
    ['Interest Rate',       inputs.interestRate / 100, '% p.a.', S.pct],
    ['Loan Term',           inputs.loanTermYears, 'years',   S.numPlain],
    ['Monthly PMT',         monthlyPMT,           '₱/mo',   S.numDec],
    ['Annual PMT',          annualPMT,            '₱/yr',   S.numBold],
    ['Total Interest Paid', totalInt,             '₱',       S.interest],
    ['Total Amount Paid',   totalPaid,            '₱',       S.numBold],
  ];

  sumRows.forEach(([label, val, unit, style]) => {
    rows.push([
      lbl(label),
      style === S.pct || style === S.pctBold ? cp(val, style) : cn(val, style),
      cs(unit, S.unit),
      ...Array(NCOLS - 3).fill(bl()),
    ]); r++;
  });

  rows.push([bl()]); r++;

  // ── Amortization Table ──
  rows.push([
    cs('AMORTIZATION SCHEDULE — Standard Monthly PMT, Annual Rollup', S.sectionBanner),
    ...Array(NCOLS - 1).fill(cs('', S.sectionBanner)),
  ]);
  merges.push({ s: { r, c: 0 }, e: { r, c: NCOLS - 1 } }); r++;

  rows.push([
    hdrL('Year'),
    hdr('Opening Balance'),
    hdr('Annual PMT'),
    hdr('Monthly PMT'),
    cs('Interest ▼', { ...S.colHeader, font: { bold: true, sz: 10, color: fc('FFB3B3') } }),
    cs('Principal ▲', { ...S.colHeader, font: { bold: true, sz: 10, color: fc('B3FFB3') } }),
    hdr('Closing Balance'),
  ]); r++;

  schedule.forEach((row, i) => {
    const isLast = i === schedule.length - 1;
    rows.push([
      cs(`Year ${row.year}`, S.label),
      cn(row.openingBalance,  S.numDec),
      cn(row.annualPMT,       S.numDec),
      cn(row.monthlyPMT,      { ...S.numDec, font: { sz: 10, color: fc(C.GRAY600), italic: true } }),
      cn(row.interest,        S.interest),
      cn(row.principal,       S.principal),
      isLast ? cs('Fully paid', { ...S.textCenter, font: { bold: true, sz: 10, color: fc(C.GREEN) }, fill: fill(C.GREEN_PALE) })
             : cn(row.closingBalance, S.numDec),
    ]); r++;
  });

  // Totals footer
  rows.push([
    cs('TOTAL', S.totalFooterL),
    cs('', S.totalFooter),
    cn(totalPaid,  S.totalFooter),
    cs('', S.totalFooter),
    cn(totalInt,   { ...S.totalFooter, font: { bold: true, sz: 11, color: fc('FFB3B3') } }),
    cn(loanAmt,    { ...S.totalFooter, font: { bold: true, sz: 11, color: fc('B3FFB3') } }),
    cs('', S.totalFooter),
  ]); r++;

  rows.push([bl()]); r++;

  // ── Formula note ──
  const noteText =
    `Formula: Monthly PMT = P × [r(1+r)ⁿ] / [(1+r)ⁿ−1]   |   ` +
    `P = ₱${loanAmt.toLocaleString('en-PH', { maximumFractionDigits: 0 })}   |   ` +
    `r = ${(inputs.interestRate / 12).toFixed(4)}%/mo   |   ` +
    `n = ${inputs.loanTermYears * 12} months   |   ` +
    `Interest (red) decreases each year as balance falls; Principal (green) increases.`;
  rows.push([
    cs(noteText, { font: { sz: 9, italic: true, color: fc(C.GRAY600) }, alignment: { horizontal: 'left', wrapText: true } }),
    ...Array(NCOLS - 1).fill(bl()),
  ]);
  merges.push({ s: { r, c: 0 }, e: { r, c: NCOLS - 1 } }); r++;

  const ws = makeSheet(rows,
    [wch(10), wch(18), wch(16), wch(14), wch(16), wch(16), wch(18)],
    merges
  );
  ws['!rows'] = [{ hpt: 28 }, {}, { hpt: 4 }]; // title row taller
  return ws;
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export function downloadExcel(inputs: InputState, projectName: string): void {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildAssumptions(inputs),   'Assumptions');
  XLSX.utils.book_append_sheet(wb, buildPnL(inputs),           '10-Year P&L');
  XLSX.utils.book_append_sheet(wb, buildSensitivity(inputs),   'Sensitivity');
  XLSX.utils.book_append_sheet(wb, buildLoanSchedule(inputs),  'Loan Schedule');

  const safeName = projectName.trim().replace(/[^a-zA-Z0-9\-_\s]/g, '').replace(/\s+/g, '_') || 'Project';
  const fileName = `GNMI_${safeName}_Financial_Model.xlsx`;

  XLSX.writeFile(wb, fileName, { bookType: 'xlsx', cellStyles: true });
}
