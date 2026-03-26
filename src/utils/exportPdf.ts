import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InputState } from '../types';
import {
  computeAllYears,
  computeBreakevenUtil,
  computeAmortization,
  calcLoanAmount,
  calcMonthlyLoanPMT,
  calcAnnualLoanPMT,
  computeYear,
} from './calculations';

// ── Page dimensions — A4 landscape ───────────────────────────────────────────
const PW  = 297;          // page width  mm
const PH  = 210;          // page height mm
const M   = 15;           // margin all sides mm
const CW  = PW - M * 2;  // 267 mm usable content width
const HDR = 20;           // page header bar height
const CT  = M + HDR + 3; // content top ≈ 38 mm

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
  NAVY:   '#1F3864',
  BLUE:   '#89CFF0',
  GREEN:  '#16a34a',
  RED:    '#dc2626',
  DARK:   '#1e293b',
  ALT:    '#f8faff',
  DIV:    '#e2e8f0',
};

type RGB = [number, number, number];
function rgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

// ── Currency — jsPDF Helvetica does not embed ₱ glyph.
//    We use the ASCII-safe "PHP " prefix throughout every string in the PDF.
//    Parentheses for negatives; no minus sign; no ± ever. ─────────────────────
function peso(n: number): string {
  const abs = Math.abs(n);
  const s   = 'PHP ' + Math.round(abs).toLocaleString('en-US');   // en-US → commas
  return n < 0 ? `(${s})` : s;
}
function pesoK(n: number): string {        // compact K/M
  const abs = Math.abs(n);
  let s: string;
  if (abs >= 1_000_000) s = 'PHP ' + (abs / 1_000_000).toFixed(2) + 'M';
  else if (abs >= 1_000) s = 'PHP ' + (abs / 1_000).toFixed(0) + 'K';
  else s = 'PHP ' + Math.round(abs).toLocaleString('en-US');
  return n < 0 ? `(${s})` : s;
}
function pct(n: number, d = 1): string { return n.toFixed(d) + '%'; }
function qty(n: number): string { return Math.round(n).toLocaleString('en-US'); }

// ── Shared autoTable defaults ─────────────────────────────────────────────────
const HEAD_FILL = rgb(C.BLUE) as RGB;
const HEAD_TEXT = rgb(C.NAVY) as RGB;
const NAVY_RGB  = rgb(C.NAVY) as RGB;
const GREEN_RGB = rgb(C.GREEN) as RGB;
const RED_RGB   = rgb(C.RED)  as RGB;
const DARK_RGB  = rgb(C.DARK) as RGB;
const ALT_RGB   = rgb(C.ALT)  as RGB;
const WHITE_RGB: RGB = [255, 255, 255];

const headStyles = {
  fillColor:  HEAD_FILL,
  textColor:  HEAD_TEXT,
  fontStyle:  'bold'    as const,
  fontSize:   8,
  cellPadding: 3,
  halign:     'center'  as const,
};
const bodyStyles = {
  fontSize:    8,
  cellPadding: 2.5,
  textColor:   DARK_RGB,
  overflow:    'linebreak' as const,
  font:        'helvetica',
};
const altRow = { fillColor: ALT_RGB };

// ── Shared table options factory ──────────────────────────────────────────────
function tableOpts(startY: number, extra?: object) {
  return {
    startY,
    margin:     { left: M, right: M } as const,
    tableWidth: CW,
    showHead:   'everyPage' as const,
    ...extra,
  };
}

// ── Page chrome ───────────────────────────────────────────────────────────────
function drawHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...NAVY_RGB);
  doc.rect(0, 0, PW, HDR, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...WHITE_RGB);
  doc.text('GNMI', M, 13);

  doc.setFillColor(...HEAD_FILL);
  doc.rect(M + 18, 7, 0.5, 8, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...HEAD_FILL);
  doc.text(title, M + 23, 13);
}

function drawFooter(doc: jsPDF, pageLabel: string, reportTitle: string) {
  const y = PH - M + 2;
  doc.setDrawColor(...rgb(C.DIV));
  doc.setLineWidth(0.25);
  doc.line(M, y - 3, PW - M, y - 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(150, 160, 175);
  doc.text('Global Nortkem Marketing Inc.  |  Confidential', M, y);
  doc.text(reportTitle, PW / 2, y, { align: 'center' });
  doc.text(pageLabel, PW - M, y, { align: 'right' });
}

function sectionBar(doc: jsPDF, y: number, title: string): number {
  doc.setFillColor(...NAVY_RGB);
  doc.rect(M, y, CW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...WHITE_RGB);
  doc.text(title, M + 3, y + 5);
  return y + 10;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function lastY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

// ── COVER PAGE ────────────────────────────────────────────────────────────────
function addCover(doc: jsPDF, inputs: InputState, projectName: string, location: string) {
  const panelW = PW * 0.38;

  doc.setFillColor(...NAVY_RGB);
  doc.rect(0, 0, panelW, PH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(52);
  doc.setTextColor(...WHITE_RGB);
  doc.text('GNMI', panelW / 2, 62, { align: 'center' });

  doc.setFillColor(...HEAD_FILL);
  doc.rect(panelW / 2 - 18, 67, 36, 1.5, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...HEAD_FILL);
  doc.text('Global Nortkem Marketing Inc.', panelW / 2, 76, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(170, 195, 225);
  doc.text('Financial Model  v1.0', panelW / 2, 83, { align: 'center' });

  // Blue divider stripe
  doc.setFillColor(...HEAD_FILL);
  doc.rect(panelW, 0, 1.5, PH, 'F');

  const rx = panelW + 15;
  const rw = PW - rx - M;

  // Badge
  doc.setFillColor(...HEAD_FILL);
  doc.roundedRect(rx, 20, 70, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...NAVY_RGB);
  doc.text('INVESTMENT ANALYSIS REPORT', rx + 35, 25, { align: 'center' });

  // Project name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...NAVY_RGB);
  const nameLines = doc.splitTextToSize(projectName, rw) as string[];
  doc.text(nameLines, rx, 40);

  doc.setFillColor(...HEAD_FILL);
  const ruleY = 44 + (nameLines.length - 1) * 10;
  doc.rect(rx, ruleY, rw, 0.8, 'F');

  let iy = ruleY + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(70, 95, 130);
  doc.text(location || 'Location TBD', rx, iy);
  iy += 7;
  doc.setFontSize(8);
  doc.setTextColor(130, 145, 165);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generated: ${dateStr}`, rx, iy);
  iy += 12;

  // KPI 2x2 grid
  const years      = computeAllYears(inputs);
  const breakevenU = computeBreakevenUtil(inputs);
  const monthlyPMT = calcMonthlyLoanPMT(inputs);
  const kpis = [
    { lbl: 'Year 1 Revenue',   val: pesoK(years[0].totalRevenue), pos: true  },
    { lbl: 'Year 5 NOI',       val: pesoK(years[4].noi),          pos: years[4].noi >= 0 },
    { lbl: 'Breakeven Util.',  val: pct(breakevenU),               pos: null  },
    { lbl: 'Monthly Loan PMT', val: peso(monthlyPMT),              pos: null  },
  ];
  const kW = (rw - 6) / 2;
  const kH = 24;
  kpis.forEach((k, i) => {
    const kx = rx + (i % 2) * (kW + 6);
    const ky = iy + Math.floor(i / 2) * (kH + 5);
    doc.setFillColor(248, 251, 255);
    doc.setDrawColor(...HEAD_FILL);
    doc.setLineWidth(0.25);
    doc.roundedRect(kx, ky, kW, kH, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(110, 130, 165);
    doc.text(k.lbl.toUpperCase(), kx + 3, ky + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const vc: RGB = k.pos === null ? NAVY_RGB : k.pos ? GREEN_RGB : RED_RGB;
    doc.setTextColor(...vc);
    doc.text(k.val, kx + 3, ky + 19);
  });

  drawFooter(doc, 'Cover', 'Nortkem Loan & Investment Analysis');
}

// ── PAGE 1: ASSUMPTIONS (2-column) ───────────────────────────────────────────
function addAssumptions(doc: jsPDF, inputs: InputState) {
  doc.addPage();
  drawHeader(doc, 'Inputs & Assumptions');

  const colW  = (CW - 8) / 2;   // each column width
  const lX    = M;               // left column x
  const rX    = M + colW + 8;   // right column x

  const LBL   = 55;              // label column width
  const VAL   = colW - LBL;     // value column width

  const colHS = {
    fillColor: NAVY_RGB,
    textColor: WHITE_RGB,
    fontStyle: 'bold' as const,
    fontSize: 7.5,
    cellPadding: 2.5,
    halign: 'left' as const,
  };
  const colBS = { ...bodyStyles, fontSize: 7.5 };
  const colCS = {
    0: { cellWidth: LBL, halign: 'left' as const, fontStyle: 'bold' as const, textColor: NAVY_RGB },
    1: { cellWidth: VAL, halign: 'right' as const, textColor: DARK_RGB },
  };

  function mini(x: number, y: number, title: string, rows: [string, string][]): number {
    autoTable(doc, {
      ...tableOpts(y),
      margin:     { left: x, right: PW - x - colW },
      tableWidth: colW,
      head:  [[{ content: title, colSpan: 2 }]],
      body:  rows,
      headStyles:       colHS,
      styles:           colBS,
      columnStyles:     colCS,
      alternateRowStyles: altRow,
      theme: 'grid',
      showHead: 'everyPage',
    });
    return lastY(doc) + 5;
  }

  const loanAmt  = calcLoanAmount(inputs);
  const shiftLbl = inputs.shiftType === 'single' ? 'Single (8h)' :
                   inputs.shiftType === 'double' ? 'Double (16h)' : '24-Hour';

  let lY = CT;
  lY = mini(lX, lY, 'OPERATIONS & SHIFT', [
    ['Days / Month',       `${inputs.daysPerMonth} days`],
    ['Shift Type',         shiftLbl],
    ['Staff/Shift Min',    `${inputs.staffPerShiftMin} persons`],
    ['Staff/Shift Max',    `${inputs.staffPerShiftMax} persons`],
    ['Daily Wage Rate',    `${peso(inputs.dailyRate)}/person`],
  ]);
  lY = mini(lX, lY, 'LAUNDRY LINE', [
    ['Capacity',           `${qty(inputs.laundryCapacityKgDay)} kg/day`],
    ['Price per kg',       peso(inputs.laundryPricePerKg)],
    ['Rewash Rate',        `${inputs.rewashRate}%`],
  ]);
  lY = mini(lX, lY, 'UNIFORM LINE', [
    ['Throughput',         `${qty(inputs.uniformPcsPerHr)} pcs/hr`],
    ['Price per piece',    peso(inputs.uniformPricePerPc)],
    ['VC Electricity',     `${peso(inputs.uniformVarCost.electricity)}/pc`],
    ['VC Water',           `${peso(inputs.uniformVarCost.water)}/pc`],
    ['VC Chemicals',       `${peso(inputs.uniformVarCost.chemicals)}/pc`],
    ['VC Other',           `${peso(inputs.uniformVarCost.other)}/pc`],
  ]);
  lY = mini(lX, lY, 'ANNUAL ESCALATIONS', [
    ['Price / Revenue',    `${inputs.priceEscalation}% p.a.`],
    ['Variable Costs',     `${inputs.varCostEscalation}% p.a.`],
    ['Labor / Wages',      `${inputs.laborEscalation}% p.a.`],
    ['Rent / Insurance',   `${inputs.rentEscalation}% p.a.`],
  ]);

  let rY = CT;
  rY = mini(rX, rY, 'VARIABLE COSTS — LAUNDRY (PHP/kg)', [
    ...inputs.varCostsLaundry.map(c => [c.label, `${peso(c.value)}/kg`] as [string,string]),
    ['TOTAL', `${peso(inputs.varCostsLaundry.reduce((s,c)=>s+c.value,0))}/kg`],
  ]);
  rY = mini(rX, rY, 'CAPEX & FINANCING', [
    ['Total CAPEX',        peso(inputs.totalCapex)],
    ['Loan Mode',          inputs.loanMode === 'pct' ? `${inputs.loanPct}% of CAPEX` : 'Fixed'],
    ['Loan Amount',        peso(loanAmt)],
    ['Interest Rate',      `${inputs.interestRate}% p.a.`],
    ['Loan Term',          `${inputs.loanTermYears} years`],
    ['Depreciation',       `${inputs.depreciationYears} years`],
  ]);
  rY = mini(rX, rY, 'DEDUCTIONS & FIXED COSTS', [
    ['Royalty Fee',        `${inputs.royaltyPct}%`],
    ['Marketing Fee',      `${inputs.marketingPct}%`],
    ['Rent / Month',       peso(inputs.rentPerMonth)],
    ['Insurance / Year',   peso(inputs.insurancePerYear)],
  ]);

  // Utilization ramp — full width
  const utilY = Math.max(lY, rY) + 2;
  const uBarY = sectionBar(doc, utilY, 'UTILIZATION RAMP (Year 1–10)');
  const uW    = CW / 10;
  autoTable(doc, {
    ...tableOpts(uBarY),
    head: [inputs.utilizationRamp.map(r => `Yr ${r.year}`)],
    body: [inputs.utilizationRamp.map(r => `${r.utilization}%`)],
    headStyles: { ...headStyles },
    styles: { ...bodyStyles, halign: 'center' as const, fontSize: 8 },
    columnStyles: Object.fromEntries(
      Array.from({length:10}, (_,i) => [i, { cellWidth: uW, halign: 'center' as const }])
    ),
    theme: 'grid',
    showHead: 'everyPage',
  });

  drawFooter(doc, 'Page 1 of 6', 'Nortkem Loan & Investment Analysis');
}

// ── PAGE 2: EXECUTIVE SUMMARY ─────────────────────────────────────────────────
function addSummary(doc: jsPDF, inputs: InputState, projectName: string) {
  doc.addPage();
  drawHeader(doc, 'Executive Summary');

  const years      = computeAllYears(inputs);
  const yr1        = years[0];
  const yr5        = years[4];
  const yr10       = years[9];
  const breakevenU = computeBreakevenUtil(inputs);
  const monthlyPMT = calcMonthlyLoanPMT(inputs);
  const loanAmt    = calcLoanAmount(inputs);
  const totalNOI   = years.reduce((s,y) => s + y.noi, 0);

  // Project sub-bar
  doc.setFillColor(238, 244, 255);
  doc.rect(M, CT - 5, CW, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY_RGB);
  doc.text(projectName, M + 4, CT + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 120, 160);
  doc.text(
    `CAPEX: ${pesoK(inputs.totalCapex)}  |  Loan: ${pesoK(loanAmt)}  |  ${inputs.interestRate}% x ${inputs.loanTermYears} yrs`,
    PW - M, CT + 2, { align: 'right' },
  );

  // 10 KPI cards in 5×2 grid
  const kpis = [
    { lbl: 'Total CAPEX',       val: pesoK(inputs.totalCapex),    flag: null           },
    { lbl: 'Loan Amount',       val: pesoK(loanAmt),              flag: null           },
    { lbl: 'Monthly PMT',       val: peso(monthlyPMT),            flag: null           },
    { lbl: 'Breakeven Util.',   val: pct(breakevenU),             flag: null           },
    { lbl: 'Year 1 Revenue',    val: pesoK(yr1.totalRevenue),     flag: true           },
    { lbl: 'Year 1 NOI',        val: pesoK(yr1.noi),              flag: yr1.noi  >= 0  },
    { lbl: 'Year 5 NOI',        val: pesoK(yr5.noi),              flag: yr5.noi  >= 0  },
    { lbl: 'Year 10 NOI',       val: pesoK(yr10.noi),             flag: yr10.noi >= 0  },
    { lbl: 'Total 10-yr NOI',   val: pesoK(totalNOI),             flag: totalNOI >= 0  },
    { lbl: 'Year 1 Headcount',  val: `${yr1.headcount} persons`,  flag: null           },
  ];
  const COLS = 5;
  const GAP  = 4;
  const cW   = (CW - GAP * (COLS - 1)) / COLS;
  const cH   = 24;
  const base = CT + 8;

  kpis.forEach((k, i) => {
    const cx = M + (i % COLS) * (cW + GAP);
    const cy = base + Math.floor(i / COLS) * (cH + 5);
    const fill: RGB = k.flag === null ? [248,251,255] : k.flag ? [240,253,244] : [255,242,242];
    doc.setFillColor(...fill);
    doc.setDrawColor(...HEAD_FILL);
    doc.setLineWidth(0.2);
    doc.roundedRect(cx, cy, cW, cH, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(110, 130, 165);
    doc.text(k.lbl.toUpperCase(), cx + 3, cy + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const vc: RGB = k.flag === null ? NAVY_RGB : k.flag ? GREEN_RGB : RED_RGB;
    doc.setTextColor(...vc);
    doc.text(k.val, cx + 3, cy + 19);
  });

  const afterCards = base + 2 * (cH + 5) + 5;

  // Rewash callout
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.setLineWidth(0.25);
  doc.roundedRect(M, afterCards, CW, 9, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text(
    `Rewash Impact (Year 1): ${inputs.rewashRate}% rewash = ${pesoK(yr1.rewashCost)} added cost, ` +
    `${qty(yr1.rewashKgPerYear)} kg rewashed`,
    M + 4, afterCards + 6,
  );

  // 10-yr NOI snapshot table
  const snapY = afterCards + 14;
  const LBL_W = 30;
  const YR_W  = (CW - LBL_W) / 10;

  autoTable(doc, {
    ...tableOpts(snapY),
    head: [['', ...years.map(y => `Yr ${y.year}`)]],
    body: [
      ['Utilization', ...years.map(y => pct(y.utilization, 0))],
      ['Revenue',     ...years.map(y => pesoK(y.totalRevenue))],
      ['EBITDA',      ...years.map(y => pesoK(y.ebitda))],
      ['NOI',         ...years.map(y => pesoK(y.noi))],
      ['NOI Margin',  ...years.map(y => pct(y.noiMargin * 100))],
    ],
    headStyles,
    styles: { ...bodyStyles, halign: 'center' as const, fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: LBL_W, halign: 'left' as const, fontStyle: 'bold', textColor: NAVY_RGB },
      ...Object.fromEntries(Array.from({length:10},(_,i) => [i+1, { cellWidth: YR_W }])),
    },
    alternateRowStyles: altRow,
    theme: 'grid',
    showHead: 'everyPage',
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === 3 && data.column.index > 0) {
        const yr = years[data.column.index - 1];
        if (yr) {
          data.cell.styles.textColor  = (yr.noi >= 0 ? GREEN_RGB : RED_RGB) as RGB;
          data.cell.styles.fontStyle  = 'bold';
          data.cell.styles.fillColor  = (yr.noi >= 0 ? [240,253,244] : [255,242,242]) as RGB;
        }
      }
    },
  });

  drawFooter(doc, 'Page 2 of 6', 'Nortkem Loan & Investment Analysis');
}

// ── PAGE 3: 10-YEAR P&L ───────────────────────────────────────────────────────
function addPnL(doc: jsPDF, inputs: InputState) {
  doc.addPage();
  drawHeader(doc, '10-Year Profit & Loss');

  const years = computeAllYears(inputs);
  const LBL_W = 42;
  const YR_W  = (CW - LBL_W) / 10;

  type Cell = string | { content: string; styles: Record<string, unknown> };

  function navyRow(label: string): Cell[] {
    return [
      { content: label, styles: { fillColor: NAVY_RGB, textColor: WHITE_RGB, fontStyle: 'bold' } },
      ...Array.from({length:10}, () => ({ content: '', styles: { fillColor: NAVY_RGB } })),
    ];
  }
  function blueRow(label: string, vals: string[]): Cell[] {
    return [
      { content: label, styles: { fillColor: HEAD_FILL, textColor: NAVY_RGB, fontStyle: 'bold' } },
      ...vals.map(v => ({ content: v, styles: { fillColor: HEAD_FILL, fontStyle: 'bold', textColor: NAVY_RGB } })),
    ];
  }

  const noiCells: Cell[] = [
    { content: 'NET OPERATING INCOME', styles: { fillColor: NAVY_RGB, textColor: WHITE_RGB, fontStyle: 'bold' } },
    ...years.map(y => ({
      content: pesoK(y.noi),
      styles:  {
        fontStyle: 'bold',
        fillColor: y.noi >= 0 ? [240,253,244] : [255,242,242],
        textColor: y.noi >= 0 ? GREEN_RGB : RED_RGB,
      },
    })),
  ];

  const body: Cell[][] = [
    navyRow('REVENUE'),
    ['Laundry Revenue',    ...years.map(y => pesoK(y.laundryRevenue))],
    ['Uniform Revenue',    ...years.map(y => pesoK(y.uniformRevenue))],
    ['Gross Revenue',      ...years.map(y => pesoK(y.grossRevenue))],
    ['Less: Rewash Cost',  ...years.map(y => `(${pesoK(y.rewashCost)})`)],
    ['Total Revenue',      ...years.map(y => pesoK(y.totalRevenue))],
    navyRow('OPERATING COSTS'),
    ['Variable Costs',     ...years.map(y => pesoK(y.variableCosts))],
    ['Royalty',            ...years.map(y => pesoK(y.royalty))],
    ['Marketing',          ...years.map(y => pesoK(y.marketing))],
    ['Labor Cost',         ...years.map(y => pesoK(y.laborCost))],
    ['Rent',               ...years.map(y => pesoK(y.rentAnnual))],
    ['Insurance',          ...years.map(y => pesoK(y.insuranceAnnual))],
    blueRow('EBITDA', years.map(y => pesoK(y.ebitda))),
    ['EBITDA Margin',      ...years.map(y => pct(y.ebitdaMargin * 100))],
    navyRow('D&A & FINANCING'),
    ['Depreciation',       ...years.map(y => pesoK(y.depreciation))],
    ['Loan PMT',           ...years.map(y => pesoK(y.loanPMT))],
    noiCells,
    ['NOI Margin',         ...years.map(y => pct(y.noiMargin * 100))],
  ];

  autoTable(doc, {
    ...tableOpts(CT),
    head: [['', ...years.map(y => `Yr ${y.year}`)]],
    body: body as unknown as string[][],
    headStyles,
    styles: { ...bodyStyles, halign: 'center' as const, fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: LBL_W, halign: 'left' as const, fontStyle: 'bold', textColor: NAVY_RGB },
      ...Object.fromEntries(Array.from({length:10},(_,i) => [i+1, { cellWidth: YR_W }])),
    },
    alternateRowStyles: altRow,
    theme: 'grid',
    showHead: 'everyPage',
  });

  drawFooter(doc, 'Page 3 of 6', 'Nortkem Loan & Investment Analysis');
}

// ── PAGE 4: COST STRUCTURE + SCENARIOS ───────────────────────────────────────
function addCostAndScenarios(doc: jsPDF, inputs: InputState) {
  doc.addPage();
  drawHeader(doc, 'Cost Structure & Sensitivity Scenarios');

  const BASE    = 50;
  const yr      = computeYear(inputs, 0, BASE);
  const rev     = yr.totalRevenue;
  const leftW   = Math.floor(CW * 0.50);
  const rightW  = CW - leftW - 8;
  const rightX  = M + leftW + 8;

  // ── Left: cost breakdown table ────────────────────────────────────────────
  const lBarY = sectionBar(doc, CT, `COST STRUCTURE AT ${BASE}% UTILIZATION — YEAR 1`);
  const uniformVar = yr.uniformPcsPerYear *
    Object.values(inputs.uniformVarCost).reduce((s,v) => s+v, 0);

  const LBL_L  = Math.floor(leftW * 0.47);
  const AMT_L  = Math.floor(leftW * 0.34);
  const PCT_L  = leftW - LBL_L - AMT_L;

  const costRows: string[][] = [
    ...yr.varCostDetail.map(c => [
      c.label,
      peso(c.totalAmt),
      rev > 0 ? pct((c.totalAmt / rev) * 100) : '--',
    ]),
    ['Uniform Variable',   peso(uniformVar),           rev > 0 ? pct((uniformVar / rev) * 100) : '--'],
    ['Royalty',            peso(yr.royalty),            rev > 0 ? pct((yr.royalty / rev) * 100) : '--'],
    ['Marketing',          peso(yr.marketing),          rev > 0 ? pct((yr.marketing / rev) * 100) : '--'],
    ['Labor',              peso(yr.laborCost),          rev > 0 ? pct((yr.laborCost / rev) * 100) : '--'],
    ['Rent',               peso(yr.rentAnnual),         rev > 0 ? pct((yr.rentAnnual / rev) * 100) : '--'],
    ['Insurance',          peso(yr.insuranceAnnual),    rev > 0 ? pct((yr.insuranceAnnual / rev) * 100) : '--'],
    ['Depreciation',       peso(yr.depreciation),       rev > 0 ? pct((yr.depreciation / rev) * 100) : '--'],
    ['Loan PMT',           peso(yr.loanPMT),            rev > 0 ? pct((yr.loanPMT / rev) * 100) : '--'],
  ];
  const totalCosts = yr.variableCosts + yr.royalty + yr.marketing + yr.laborCost +
                     yr.rentAnnual + yr.insuranceAnnual + yr.depreciation + yr.loanPMT;
  costRows.push(['TOTAL COSTS', peso(totalCosts), rev > 0 ? pct((totalCosts / rev) * 100) : '--']);

  autoTable(doc, {
    ...tableOpts(lBarY),
    margin:     { left: M, right: PW - M - leftW },
    tableWidth: leftW,
    head: [['Cost Line', 'Annual (PHP)', '% Rev']],
    body: costRows,
    headStyles,
    styles: { ...bodyStyles, fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: LBL_L, halign: 'left'   as const, fontStyle: 'bold', textColor: NAVY_RGB },
      1: { cellWidth: AMT_L, halign: 'right'  as const },
      2: { cellWidth: PCT_L, halign: 'center' as const },
    },
    alternateRowStyles: altRow,
    theme: 'grid',
    showHead: 'everyPage',
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === costRows.length - 1) {
        data.cell.styles.fillColor = NAVY_RGB;
        data.cell.styles.textColor = WHITE_RGB;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const lEndY = lastY(doc) + 4;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(...GREEN_RGB);
  doc.setLineWidth(0.25);
  doc.roundedRect(M, lEndY, leftW, 10, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY_RGB);
  doc.text(
    `Rev: ${pesoK(rev)}  |  Costs: ${pesoK(totalCosts)}  |  NOI: ${pesoK(yr.noi)}  |  Margin: ${pct(yr.noiMargin*100)}`,
    M + 4, lEndY + 7,
  );

  // ── Right: scenario tables ────────────────────────────────────────────────
  const SCEN = [
    { label: 'Conservative', util: 30 },
    { label: 'Base Case',    util: 50 },
    { label: 'Target',       util: 65 },
    { label: 'Optimistic',   util: 80 },
  ];

  const rBarY = sectionBar(doc, CT, 'SCENARIO SUMMARY (Year 1 / Year 5 / Year 10)');

  const SLB  = Math.floor(rightW * 0.20);
  const SUT  = Math.floor(rightW * 0.08);
  const SCOL = Math.floor((rightW - SLB - SUT) / 5);

  autoTable(doc, {
    ...tableOpts(rBarY),
    margin:     { left: rightX, right: M },
    tableWidth: rightW,
    head: [['Scenario', 'Util', 'Yr1 Rev', 'Yr1 NOI', 'Yr5 NOI', 'Yr10 NOI', '1st Profit']],
    body: SCEN.map(s => {
      const yrs = Array.from({length:10},(_,i) => computeYear(inputs, i, s.util));
      const fp  = yrs.findIndex(y => y.noi > 0);
      return [s.label, `${s.util}%`,
        pesoK(yrs[0].totalRevenue),
        pesoK(yrs[0].noi),
        pesoK(yrs[4].noi),
        pesoK(yrs[9].noi),
        fp >= 0 ? `Yr ${fp+1}` : '>10yr'];
    }),
    headStyles,
    styles: { ...bodyStyles, halign: 'center' as const, fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: SLB,  halign: 'left'  as const, fontStyle: 'bold', textColor: NAVY_RGB },
      1: { cellWidth: SUT,  halign: 'center' as const },
      2: { cellWidth: SCOL, halign: 'right' as const },
      3: { cellWidth: SCOL, halign: 'right' as const },
      4: { cellWidth: SCOL, halign: 'right' as const },
      5: { cellWidth: SCOL, halign: 'right' as const },
      6: { cellWidth: rightW - SLB - SUT - SCOL * 4, halign: 'center' as const },
    },
    alternateRowStyles: altRow,
    theme: 'grid',
    showHead: 'everyPage',
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index >= 3 && data.column.index <= 5) {
        const scen = SCEN[data.row.index];
        if (scen) {
          const yrs = Array.from({length:10},(_,i) => computeYear(inputs, i, scen.util));
          const noi = data.column.index === 3 ? yrs[0].noi
                    : data.column.index === 4 ? yrs[4].noi
                    : yrs[9].noi;
          data.cell.styles.textColor = noi >= 0 ? GREEN_RGB : RED_RGB;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  const rEndY = lastY(doc) + 5;

  // Year 1 detail per scenario
  const allS = SCEN.map(s => computeYear(inputs, 0, s.util));
  const D_LBL = Math.floor(rightW * 0.23);
  const D_COL = (rightW - D_LBL) / 4;

  autoTable(doc, {
    ...tableOpts(rEndY),
    margin:     { left: rightX, right: M },
    tableWidth: rightW,
    head: [['Year 1 Detail', ...SCEN.map(s => `${s.label} (${s.util}%)`)]],
    body: [
      ['Revenue',         ...allS.map(y => pesoK(y.totalRevenue))],
      ['Variable Costs',  ...allS.map(y => pesoK(y.variableCosts))],
      ['Labor',           ...allS.map(y => pesoK(y.laborCost))],
      ['Fixed Costs',     ...allS.map(y => pesoK(y.rentAnnual + y.insuranceAnnual))],
      ['EBITDA',          ...allS.map(y => pesoK(y.ebitda))],
      ['Dep + Loan PMT',  ...allS.map(y => pesoK(y.depreciation + y.loanPMT))],
      ['NOI',             ...allS.map(y => pesoK(y.noi))],
      ['NOI Margin',      ...allS.map(y => pct(y.noiMargin * 100))],
    ],
    headStyles: { ...headStyles, fontSize: 7 },
    styles: { ...bodyStyles, halign: 'center' as const, fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: D_LBL, halign: 'left' as const, fontStyle: 'bold', textColor: NAVY_RGB },
      1: { cellWidth: D_COL, halign: 'right' as const },
      2: { cellWidth: D_COL, halign: 'right' as const },
      3: { cellWidth: D_COL, halign: 'right' as const },
      4: { cellWidth: D_COL, halign: 'right' as const },
    },
    alternateRowStyles: altRow,
    theme: 'grid',
    showHead: 'everyPage',
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === 6 && data.column.index > 0) {
        const noi = allS[data.column.index - 1]?.noi ?? 0;
        data.cell.styles.textColor = noi >= 0 ? GREEN_RGB : RED_RGB;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = noi >= 0 ? [240,253,244] : [255,242,242];
      }
    },
  });

  drawFooter(doc, 'Page 4 of 6', 'Nortkem Loan & Investment Analysis');
}

// ── PAGE 5: SENSITIVITY MATRIX + BREAKEVEN ───────────────────────────────────
function addSensitivity(doc: jsPDF, inputs: InputState) {
  doc.addPage();
  drawHeader(doc, 'Sensitivity Analysis');

  const breakevenU = computeBreakevenUtil(inputs);
  const SCEN = [
    { label: 'Conservative', util: 30 },
    { label: 'Base Case',    util: 50 },
    { label: 'Target',       util: 65 },
    { label: 'Optimistic',   util: 80 },
  ];
  const YRS  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  let y = CT;

  // NOI matrix
  y = sectionBar(doc, y, 'NOI SENSITIVITY MATRIX — 4 SCENARIOS x 10 YEARS');
  const MAT_LBL = 44;
  const MAT_YR  = (CW - MAT_LBL) / 10;

  autoTable(doc, {
    ...tableOpts(y),
    head: [['Scenario / Util', ...YRS.map(yr => `Year ${yr}`)]],
    body: SCEN.map(s => [
      `${s.label} (${s.util}%)`,
      ...YRS.map(yr => {
        const r = computeYear(inputs, yr - 1, s.util);
        return `${pesoK(r.noi)}\n${pct(r.noiMargin*100)}`;
      }),
    ]),
    headStyles,
    styles: { ...bodyStyles, halign: 'center' as const, fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: MAT_LBL, halign: 'left' as const, fontStyle: 'bold', textColor: NAVY_RGB },
      ...Object.fromEntries(YRS.map((_,i) => [i+1, { cellWidth: MAT_YR }])),
    },
    alternateRowStyles: altRow,
    theme: 'grid',
    showHead: 'everyPage',
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index > 0) {
        const scen = SCEN[data.row.index];
        const yr   = YRS[data.column.index - 1];
        if (scen && yr) {
          const r = computeYear(inputs, yr - 1, scen.util);
          data.cell.styles.textColor = r.noi >= 0 ? GREEN_RGB : RED_RGB;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = r.noi >= 0 ? [240,253,244] : [255,242,242];
        }
      }
    },
  });
  y = lastY(doc) + 5;

  // Breakeven callout
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.setLineWidth(0.25);
  doc.roundedRect(M, y, CW, 10, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text(
    `Breakeven Utilization (Year 1): ${pct(breakevenU)}  —  Above this level NOI is positive.`,
    PW / 2, y + 7, { align: 'center' },
  );
  y += 15;

  // Breakeven table — 20% to 105% step 5 (18 steps), split 9+9
  y = sectionBar(doc, y, 'BREAKEVEN TABLE — YEAR 1 NOI BY UTILIZATION (20% to 105%, step 5%)');
  const steps = Array.from({length:18}, (_,i) => {
    const util = 20 + i * 5;
    const r    = computeYear(inputs, 0, util);
    return { util, noi: r.noi, margin: r.noiMargin };
  });

  // Compact: label col + 18 value cols
  const BK_LBL = 16;
  const BK_COL = (CW - BK_LBL) / 18;

  autoTable(doc, {
    ...tableOpts(y),
    head: [['', ...steps.map(s => `${s.util}%`)]],
    body: [
      ['NOI',    ...steps.map(s => pesoK(s.noi))],
      ['Margin', ...steps.map(s => pct(s.margin * 100))],
    ],
    headStyles: { ...headStyles, fontSize: 7, cellPadding: 2 },
    styles: { ...bodyStyles, halign: 'center' as const, fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: BK_LBL, halign: 'left' as const, fontStyle: 'bold', textColor: NAVY_RGB },
      ...Object.fromEntries(steps.map((_,i) => [i+1, { cellWidth: BK_COL }])),
    },
    alternateRowStyles: altRow,
    theme: 'grid',
    showHead: 'everyPage',
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === 0 && data.column.index > 0) {
        const step = steps[data.column.index - 1];
        if (step) {
          data.cell.styles.textColor = step.noi >= 0 ? GREEN_RGB : RED_RGB;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = step.noi >= 0 ? [240,253,244] : [255,242,242];
        }
      }
    },
  });

  drawFooter(doc, 'Page 5 of 6', 'Nortkem Loan & Investment Analysis');
}

// ── PAGE 6: LOAN SCHEDULE ─────────────────────────────────────────────────────
function addLoan(doc: jsPDF, inputs: InputState) {
  doc.addPage();
  drawHeader(doc, 'Loan Schedule');

  const loanAmt    = calcLoanAmount(inputs);
  const monthlyPMT = calcMonthlyLoanPMT(inputs);
  const annualPMT  = calcAnnualLoanPMT(inputs);
  const amort      = computeAmortization(inputs);
  const totalInt   = amort.reduce((s,r) => s + r.interest,  0);
  const totalPrin  = amort.reduce((s,r) => s + r.principal, 0);

  let y = CT;

  // Summary cards 5×2
  const cards = [
    { lbl: 'Total CAPEX',         val: peso(inputs.totalCapex) },
    { lbl: 'Loan Amount',         val: peso(loanAmt) },
    { lbl: 'Equity / Down Pmt',   val: peso(inputs.totalCapex - loanAmt) },
    { lbl: 'LTV Ratio',           val: pct((loanAmt / Math.max(inputs.totalCapex,1))*100) },
    { lbl: 'Interest Rate',       val: `${inputs.interestRate}% p.a.` },
    { lbl: 'Loan Term',           val: `${inputs.loanTermYears} years` },
    { lbl: 'Monthly PMT',         val: peso(monthlyPMT) },
    { lbl: 'Annual PMT',          val: peso(annualPMT) },
    { lbl: 'Total Interest',      val: peso(totalInt) },
    { lbl: 'Total Repaid',        val: peso(totalPrin + totalInt) },
  ];
  const COLS = 5;
  const GAP  = 4;
  const cW   = (CW - GAP * (COLS - 1)) / COLS;
  const cH   = 20;

  cards.forEach((c, i) => {
    const cx = M + (i % COLS) * (cW + GAP);
    const cy = y + Math.floor(i / COLS) * (cH + 4);
    doc.setFillColor(248, 251, 255);
    doc.setDrawColor(...HEAD_FILL);
    doc.setLineWidth(0.2);
    doc.roundedRect(cx, cy, cW, cH, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(110, 130, 165);
    doc.text(c.lbl.toUpperCase(), cx + 3, cy + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY_RGB);
    doc.text(c.val, cx + 3, cy + 15);
  });

  y += 2 * (cH + 4) + 5;

  // Interest vs principal bar
  if (loanAmt > 0 && (totalInt + totalPrin) > 0) {
    const ip   = totalInt / (totalInt + totalPrin);
    doc.setFillColor(255, 220, 220);
    doc.rect(M, y, CW * ip, 8, 'F');
    doc.setFillColor(210, 245, 220);
    doc.rect(M + CW * ip, y, CW * (1 - ip), 8, 'F');
    doc.setDrawColor(200, 210, 225);
    doc.setLineWidth(0.25);
    doc.rect(M, y, CW, 8, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...RED_RGB);
    doc.text(`Interest: ${pct(ip*100)} (${peso(totalInt)})`, M + 3, y + 5.5);
    doc.setTextColor(...GREEN_RGB);
    doc.text(`Principal: ${pct((1-ip)*100)} (${peso(totalPrin)})`, M + CW * ip + 3, y + 5.5);
    y += 13;
  }

  // Amortization table
  y = sectionBar(doc, y, 'ANNUAL AMORTIZATION SCHEDULE');

  if (amort.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('No loan configured.', M, y + 8);
    drawFooter(doc, 'Page 6 of 6', 'Nortkem Loan & Investment Analysis');
    return;
  }

  const YR_W  = 18;
  const NUM_W = (CW - YR_W) / 5;

  autoTable(doc, {
    ...tableOpts(y),
    head: [['Year', 'Opening Balance', 'Annual PMT', 'Interest', 'Principal', 'Closing Balance']],
    body: [
      ...amort.map(r => [
        `Year ${r.year}`,
        peso(r.openingBalance),
        peso(r.annualPMT),
        peso(r.interest),
        peso(r.principal),
        peso(r.closingBalance),
      ]),
      ['TOTALS', '--', peso(annualPMT * inputs.loanTermYears), peso(totalInt), peso(totalPrin), '--'],
    ],
    headStyles,
    styles: { ...bodyStyles, halign: 'right' as const, fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: YR_W,  halign: 'left'  as const, fontStyle: 'bold', textColor: NAVY_RGB },
      1: { cellWidth: NUM_W },
      2: { cellWidth: NUM_W },
      3: { cellWidth: NUM_W, textColor: RED_RGB },
      4: { cellWidth: NUM_W, textColor: GREEN_RGB, fontStyle: 'bold' },
      5: { cellWidth: NUM_W },
    },
    alternateRowStyles: altRow,
    theme: 'grid',
    showHead: 'everyPage',
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === amort.length) {
        data.cell.styles.fillColor = NAVY_RGB;
        data.cell.styles.textColor = WHITE_RGB;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  drawFooter(doc, 'Page 6 of 6', 'Nortkem Loan & Investment Analysis');
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function downloadPdf(inputs: InputState, projectName: string, projectLocation: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  addCover(doc, inputs, projectName, projectLocation);
  addAssumptions(doc, inputs);
  addSummary(doc, inputs, projectName);
  addPnL(doc, inputs);
  addCostAndScenarios(doc, inputs);
  addSensitivity(doc, inputs);
  addLoan(doc, inputs);

  const safe = projectName.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_-]/g,'');
  doc.save(`GNMI_${safe}_Report.pdf`);
}
