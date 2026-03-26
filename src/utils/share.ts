import LZString from 'lz-string';
import type { InputState } from '../types';
import {
  computeAllYears,
  computeBreakevenUtil,
  calcMonthlyLoanPMT,
  calcAnnualLoanPMT,
  calcLoanAmount,
} from './calculations';

// ── Payload ───────────────────────────────────────────────────────────────────

export interface SharePayload {
  inputs: InputState;
  projectName: string;
  projectLocation: string;
}

// ── URL encode / decode ───────────────────────────────────────────────────────

export function encodeStateToUrl(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(json);
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('s', compressed);
  return url.toString();
}

export function decodeStateFromUrl(): SharePayload | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get('s');
    if (!compressed) return null;
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const payload = JSON.parse(json) as SharePayload;
    // Basic integrity check
    if (!payload.inputs || !payload.inputs.daysPerMonth) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Formatters (standalone — no external deps) ────────────────────────────────

function fM(n: number, d = 2): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return sign + '₱' + (abs / 1_000_000).toFixed(d) + 'M';
}
function fK(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return sign + '₱' + (abs / 1_000).toFixed(0) + 'K';
}
function smart(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return fM(n, 2);
  if (abs >= 1_000)     return fK(n);
  return (n < 0 ? '-' : '') + '₱' + Math.abs(n).toFixed(0);
}
function pct(n: number, d = 1): string { return n.toFixed(d) + '%'; }
function fNum(n: number): string {
  return n.toLocaleString('en-PH', { maximumFractionDigits: 0 });
}

// ── Email body ────────────────────────────────────────────────────────────────

export function buildEmailBody(payload: SharePayload, shareUrl: string): string {
  const { inputs, projectName, projectLocation } = payload;
  const years      = computeAllYears(inputs);
  const yr1        = years[0];
  const yr5        = years[4];
  const yr10       = years[9];
  const breakevenU = computeBreakevenUtil(inputs);
  const monthlyPMT = calcMonthlyLoanPMT(inputs);
  const annualPMT  = calcAnnualLoanPMT(inputs);
  const loanAmt    = calcLoanAmount(inputs);
  const totalNoI10 = years.reduce((s, y) => s + y.noi, 0);

  const line = '─'.repeat(44);

  return [
    `Hi,`,
    ``,
    `Please find the GNMI Nortkem Investment Analysis summary below.`,
    ``,
    line,
    `📋  PROJECT SUMMARY`,
    line,
    `Project    :  ${projectName}`,
    `Location   :  ${projectLocation}`,
    ``,
    `  CAPEX         :  ${smart(inputs.totalCapex)}`,
    `  Loan Amount   :  ${smart(loanAmt)}`,
    `  Interest Rate :  ${pct(inputs.interestRate)} p.a.`,
    `  Loan Term     :  ${inputs.loanTermYears} years`,
    `  Monthly PMT   :  ₱${fNum(monthlyPMT)}`,
    `  Annual PMT    :  ₱${fNum(annualPMT)}`,
    ``,
    line,
    `📊  KEY PERFORMANCE INDICATORS`,
    line,
    `  Year 1  Revenue  :  ${smart(yr1.totalRevenue)}`,
    `  Year 1  NOI      :  ${smart(yr1.noi)}  (${pct(yr1.noiMargin * 100)} margin)`,
    `  Year 5  NOI      :  ${smart(yr5.noi)}  (${pct(yr5.noiMargin * 100)} margin)`,
    `  Year 10 NOI      :  ${smart(yr10.noi)}  (${pct(yr10.noiMargin * 100)} margin)`,
    `  Total 10-yr NOI  :  ${smart(totalNoI10)}`,
    `  Breakeven Util.  :  ${pct(breakevenU)}`,
    ``,
    line,
    `📈  10-YEAR NOI SNAPSHOT`,
    line,
    years.map(y => `  Yr ${y.year.toString().padStart(2)}  ${pct(y.utilization, 0)} util  →  ${smart(y.noi).padStart(10)}  (${pct(y.noiMargin * 100)} margin)`).join('\n'),
    ``,
    line,
    `🔗  INTERACTIVE MODEL (opens with these exact inputs)`,
    line,
    shareUrl,
    ``,
    line,
    `GNMI Financial Model v1.0  ·  Global Nortkem Marketing Inc.`,
    `This is a financial projection. Actual results may vary.`,
  ].join('\n');
}

// ── Clipboard summary text (WhatsApp / Viber / SMS) ──────────────────────────

export function buildSummaryText(payload: SharePayload, shareUrl: string): string {
  const { inputs, projectName, projectLocation } = payload;
  const years      = computeAllYears(inputs);
  const yr1        = years[0];
  const yr5        = years[4];
  const yr10       = years[9];
  const breakevenU = computeBreakevenUtil(inputs);
  const monthlyPMT = calcMonthlyLoanPMT(inputs);
  const loanAmt    = calcLoanAmount(inputs);
  const totalNOI   = years.reduce((s, y) => s + y.noi, 0);

  const div = '━'.repeat(32);

  // Build compact 10-yr NOI table — 2 per line
  const noiLines: string[] = [];
  for (let i = 0; i < 10; i += 2) {
    const a = years[i];
    const b = years[i + 1];
    const aStr = `Yr${a.year}: ${smart(a.noi)}`;
    const bStr = b ? `  Yr${b.year}: ${smart(b.noi)}` : '';
    noiLines.push(aStr + bStr);
  }

  return [
    `📊 *GNMI — Nortkem Investment Analysis*`,
    ``,
    `📋 *${projectName}*`,
    projectLocation ? `📍 ${projectLocation}` : '',
    ``,
    div,
    `💰 *CAPEX & FINANCING*`,
    `Total CAPEX  : ${smart(inputs.totalCapex)}`,
    `Loan Amount  : ${smart(loanAmt)}`,
    `Rate / Term  : ${pct(inputs.interestRate)} / ${inputs.loanTermYears} yrs`,
    `Monthly PMT  : ₱${fNum(monthlyPMT)}`,
    ``,
    div,
    `📈 *KEY RESULTS*`,
    `Yr 1  Rev  : ${smart(yr1.totalRevenue)}`,
    `Yr 1  NOI  : ${smart(yr1.noi)} (${pct(yr1.noiMargin * 100)})`,
    `Yr 5  NOI  : ${smart(yr5.noi)} (${pct(yr5.noiMargin * 100)})`,
    `Yr 10 NOI  : ${smart(yr10.noi)} (${pct(yr10.noiMargin * 100)})`,
    `10-yr Total: ${smart(totalNOI)}`,
    ``,
    `🎯 Breakeven : ${pct(breakevenU)} utilization`,
    ``,
    div,
    `📉 *10-YEAR NOI*`,
    ...noiLines,
    ``,
    div,
    `🔗 *Open interactive model:*`,
    shareUrl,
    ``,
    `_GNMI Financial Model v1.0 · Global Nortkem Marketing Inc._`,
  ].filter(l => l !== null).join('\n');
}
