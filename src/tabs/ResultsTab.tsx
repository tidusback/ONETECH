import React from 'react';
import type { InputState } from '../types';
import {
  computeAllYears,
  computeBreakevenUtil,
  calcAnnualLoanPMT,
  computeYear,
  type YearlyResult,
} from '../utils/calculations';

interface Props { inputs: InputState }

// ── Formatters ────────────────────────────────────────────────────────────────
function fM(n: number, d = 1) { return '₱' + (n / 1_000_000).toFixed(d) + 'M'; }
function fK(n: number, d = 0) { return '₱' + (n / 1_000).toFixed(d) + 'K'; }
function fNum(n: number, d = 0) { return n.toLocaleString('en-PH', { minimumFractionDigits: d, maximumFractionDigits: d }); }
function fPct(n: number, d = 1) { return n.toFixed(d) + '%'; }

function autoFmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return fM(n, 1);
  if (abs >= 1_000) return fK(n, 0);
  return '₱' + fNum(n, 0);
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
  accent?: boolean;
}

function KpiCard({ label, value, sub, positive, negative, accent }: KpiCardProps) {
  const bg = accent
    ? 'linear-gradient(135deg, var(--dark-navy) 0%, #2a4d9e 100%)'
    : 'var(--white)';
  const valColor = accent
    ? 'var(--powder-blue)'
    : positive
    ? 'var(--green-600)'
    : negative
    ? 'var(--red-500)'
    : 'var(--dark-navy)';

  return (
    <div style={{
      background: bg,
      borderRadius: 10,
      border: accent ? 'none' : '1px solid var(--gray-200)',
      padding: '14px 16px',
      boxShadow: accent ? '0 4px 16px rgba(31,56,100,0.25)' : '0 1px 4px rgba(31,56,100,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: accent ? 'rgba(137,207,240,0.7)' : 'var(--gray-400)',
      }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: valColor, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: accent ? 'rgba(137,207,240,0.6)' : 'var(--gray-400)' }}>{sub}</div>}
    </div>
  );
}

// ── P&L Table row types ───────────────────────────────────────────────────────
type RowDef =
  | { kind: 'data'; label: string; key: keyof YearlyResult; negate?: boolean; bold?: boolean; indent?: boolean }
  | { kind: 'pct'; label: string; key: keyof YearlyResult; bold?: boolean }
  | { kind: 'spacer' }
  | { kind: 'header'; label: string };

const PNL_ROWS: RowDef[] = [
  { kind: 'header', label: 'Revenue' },
  { kind: 'data', label: 'Laundry Revenue', key: 'laundryRevenue' },
  { kind: 'data', label: 'Rewash Cost', key: 'rewashCost', negate: true, indent: true },
  { kind: 'data', label: 'Uniform Revenue', key: 'uniformRevenue' },
  { kind: 'data', label: 'Total Revenue', key: 'totalRevenue', bold: true },
  { kind: 'spacer' },
  { kind: 'header', label: 'Operating Expenses' },
  { kind: 'data', label: 'Variable Costs', key: 'variableCosts', negate: true },
  { kind: 'data', label: 'Royalty', key: 'royalty', negate: true, indent: true },
  { kind: 'data', label: 'Marketing', key: 'marketing', negate: true, indent: true },
  { kind: 'data', label: 'Labor', key: 'laborCost', negate: true },
  { kind: 'data', label: 'Rent', key: 'rentAnnual', negate: true },
  { kind: 'data', label: 'Insurance', key: 'insuranceAnnual', negate: true },
  { kind: 'spacer' },
  { kind: 'data', label: 'EBITDA', key: 'ebitda', bold: true },
  { kind: 'pct', label: 'EBITDA Margin', key: 'ebitdaMargin', bold: false },
  { kind: 'spacer' },
  { kind: 'data', label: 'Depreciation', key: 'depreciation', negate: true, indent: true },
  { kind: 'data', label: 'Loan Payment', key: 'loanPMT', negate: true, indent: true },
  { kind: 'spacer' },
  { kind: 'data', label: 'NOI', key: 'noi', bold: true },
  { kind: 'pct', label: 'NOI Margin', key: 'noiMargin', bold: false },
];

// ── Main component ────────────────────────────────────────────────────────────
export function ResultsTab({ inputs }: Props) {
  const years = computeAllYears(inputs);
  const breakevenUtil = computeBreakevenUtil(inputs);
  const annualLoanPMT = calcAnnualLoanPMT(inputs);

  const yr1 = years[0];
  const yr5 = years[4];
  const yr10 = years[9];

  const rewashImpact10yr = years.reduce((s, y) => s + y.rewashCost, 0);

  // Cost structure at 50% util (Year 1 escalation baseline)
  const costAt50 = computeYear(inputs, 0, 50);

  // ── Section header ───────────────────────────────────────────────────────
  function SectionHeader({ title, badge }: { title: string; badge?: string }) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, var(--dark-navy) 0%, var(--navy-mid) 100%)',
        borderRadius: '10px 10px 0 0',
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ color: 'var(--white)', fontSize: 13, fontWeight: 600 }}>{title}</h3>
        {badge && <span style={{ background: 'rgba(137,207,240,0.2)', color: 'var(--powder-blue)', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>{badge}</span>}
      </div>
    );
  }

  function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
      <div style={{ background: 'var(--white)', borderRadius: 10, border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(31,56,100,0.06)', ...style }}>
        {children}
      </div>
    );
  }

  // ── P&L cell renderer ────────────────────────────────────────────────────
  function renderCell(row: RowDef, yr: YearlyResult, colIdx: number) {
    if (row.kind === 'spacer' || row.kind === 'header') return <td key={colIdx} />;

    const raw = yr[row.key] as number;
    const isNoi = row.key === 'noi';
    const isEbitda = row.key === 'ebitda';

    if (row.kind === 'pct') {
      const pctVal = raw * 100;
      return (
        <td key={colIdx} style={{
          padding: '4px 10px',
          textAlign: 'right',
          fontSize: 11,
          color: pctVal >= 0 ? 'var(--green-600)' : 'var(--red-500)',
          fontStyle: 'italic',
        }}>
          {fPct(pctVal)}
        </td>
      );
    }

    const display = row.negate ? -Math.abs(raw) : raw;
    const formatted = autoFmt(Math.abs(raw));
    const isNeg = display < 0;
    const isPos = display > 0;

    let bg = 'transparent';
    let color = 'var(--gray-700)';
    let fontWeight: React.CSSProperties['fontWeight'] = row.bold ? 700 : 400;

    if (isNoi) {
      bg = raw >= 0 ? '#f0fdf4' : '#fef2f2';
      color = raw >= 0 ? 'var(--green-600)' : 'var(--red-500)';
      fontWeight = 700;
    } else if (isEbitda) {
      bg = raw >= 0 ? '#f0fdf4' : '#fef2f2';
      color = raw >= 0 ? '#166534' : 'var(--red-500)';
      fontWeight = 700;
    } else if (row.bold) {
      color = 'var(--dark-navy)';
    } else if (isNeg) {
      color = '#b45309';
    }

    return (
      <td key={colIdx} style={{
        padding: '4px 10px',
        textAlign: 'right',
        fontSize: 12,
        fontWeight,
        color,
        background: bg,
        whiteSpace: 'nowrap',
      }}>
        {isNeg ? `(${formatted})` : isPos ? formatted : '—'}
      </td>
    );
  }

  // ── Volume & Revenue table ───────────────────────────────────────────────
  const VOL_ROWS: { label: string; fn: (y: YearlyResult) => string; bold?: boolean }[] = [
    { label: 'Net kg / year', fn: y => fNum(y.billableKgPerYear) },
    { label: 'Rewash kg / year', fn: y => fNum(y.rewashKgPerYear) },
    { label: 'Rewash Cost', fn: y => autoFmt(y.rewashCost) },
    { label: 'Laundry Revenue', fn: y => autoFmt(y.laundryRevenue) },
    { label: 'Uniform pcs / year', fn: y => fNum(y.uniformPcsPerYear) },
    { label: 'Uniform Revenue', fn: y => autoFmt(y.uniformRevenue) },
    { label: 'Total Revenue', fn: y => autoFmt(y.totalRevenue), bold: true },
    { label: 'Headcount (shifts × staff)', fn: y => `${y.shiftsPerDay} × ${inputs.staffPerShiftMin} = ${y.headcount} pax` },
    { label: 'NOI', fn: y => autoFmt(y.noi), bold: true },
  ];

  const thStyle: React.CSSProperties = {
    padding: '7px 10px',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--dark-navy)',
    borderBottom: '2px solid var(--powder-blue)',
    background: 'var(--gray-50)',
    whiteSpace: 'nowrap',
  };

  const tdLbl: React.CSSProperties = {
    padding: '5px 10px',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--gray-700)',
    borderBottom: '1px solid var(--gray-100)',
    whiteSpace: 'nowrap',
    background: 'var(--gray-50)',
  };

  const tdVal = (bold?: boolean, _noi?: boolean, row?: typeof VOL_ROWS[number], y?: YearlyResult): React.CSSProperties => {
    const noiBg = (row?.label === 'NOI' && y) ? (y.noi >= 0 ? '#f0fdf4' : '#fef2f2') : 'transparent';
    const noiFg = (row?.label === 'NOI' && y) ? (y.noi >= 0 ? 'var(--green-600)' : 'var(--red-500)') : 'var(--gray-800)';
    return {
      padding: '5px 10px',
      textAlign: 'right',
      fontSize: 12,
      fontWeight: bold ? 700 : 400,
      color: noiFg,
      background: noiBg,
      borderBottom: '1px solid var(--gray-100)',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid">
        <KpiCard label="Year 1 Revenue" value={fM(yr1.totalRevenue)} sub={`Util: ${fPct(yr1.utilization)}`} />
        <KpiCard label="Year 5 Revenue" value={fM(yr5.totalRevenue)} sub={`Util: ${fPct(yr5.utilization)}`} />
        <KpiCard label="Year 10 Revenue" value={fM(yr10.totalRevenue)} sub={`Util: ${fPct(yr10.utilization)}`} />
        <KpiCard label="Breakeven Util" value={fPct(breakevenUtil)} sub="NOI = 0 at Year 1" accent />
        <KpiCard label="Annual Loan PMT" value={autoFmt(annualLoanPMT)} sub={`${inputs.loanTermYears}-yr term`} />
        <KpiCard label="Year 1 NOI" value={autoFmt(yr1.noi)} sub={`Margin: ${fPct(yr1.noiMargin * 100)}`}
          positive={yr1.noi >= 0} negative={yr1.noi < 0} />
        <KpiCard label="Year 5 NOI" value={autoFmt(yr5.noi)} sub={`Margin: ${fPct(yr5.noiMargin * 100)}`}
          positive={yr5.noi >= 0} negative={yr5.noi < 0} />
        <KpiCard label="Year 10 NOI" value={autoFmt(yr10.noi)} sub={`Margin: ${fPct(yr10.noiMargin * 100)}`}
          positive={yr10.noi >= 0} negative={yr10.noi < 0} />
        <KpiCard label="Rewash Impact" value={fM(rewashImpact10yr)} sub="10-yr total cost" negative />
        <KpiCard label="Yr 1 Headcount" value={`${yr1.headcount} pax`}
          sub={`${yr1.shiftsPerDay} shift${yr1.shiftsPerDay > 1 ? 's' : ''} × ${inputs.staffPerShiftMin} staff`} />
      </div>

      {/* ── Volume & Revenue Table ── */}
      <Card>
        <SectionHeader title="Volume & Revenue — 10-Year Overview" />
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', width: 200 }}>Metric</th>
                {years.map(y => <th key={y.year} style={thStyle}>Year {y.year}<br /><span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>{fPct(y.utilization)}</span></th>)}
              </tr>
            </thead>
            <tbody>
              {VOL_ROWS.map(row => (
                <tr key={row.label} style={{ background: row.bold ? 'var(--blue-pale)' : 'transparent' }}>
                  <td style={{ ...tdLbl, fontWeight: row.bold ? 700 : 500, color: row.bold ? 'var(--dark-navy)' : 'var(--gray-700)' }}>{row.label}</td>
                  {years.map(y => (
                    <td key={y.year} style={tdVal(row.bold, row.label === 'NOI', row, y)}>{row.fn(y)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 10-Year P&L Table ── */}
      <Card>
        <SectionHeader title="10-Year Profit & Loss Statement" badge="Annual" />
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', width: 200, position: 'sticky', left: 0, zIndex: 1 }}>Line Item</th>
                {years.map(y => (
                  <th key={y.year} style={thStyle}>
                    Yr {y.year}<br />
                    <span style={{ fontWeight: 400, fontSize: 10, color: 'var(--gray-400)' }}>{fPct(y.utilization)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PNL_ROWS.map((row, ri) => {
                if (row.kind === 'spacer') {
                  return <tr key={`sp-${ri}`}><td colSpan={12} style={{ height: 6, background: 'var(--gray-50)' }} /></tr>;
                }
                if (row.kind === 'header') {
                  return (
                    <tr key={`hdr-${ri}`} style={{ background: 'var(--dark-navy)' }}>
                      <td colSpan={12} style={{ padding: '4px 10px', fontSize: 10, fontWeight: 700, color: 'var(--powder-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {row.label}
                      </td>
                    </tr>
                  );
                }
                const isNoi = row.key === 'noi';
                const isEbitda = row.key === 'ebitda';
                const rowBg = isNoi || isEbitda ? undefined : row.bold ? 'var(--blue-pale)' : undefined;
                return (
                  <tr key={row.label} style={{ background: rowBg }}>
                    <td style={{
                      ...tdLbl,
                      paddingLeft: row.kind === 'data' && row.indent ? 22 : 10,
                      fontWeight: row.bold ? 700 : 400,
                      color: isNoi || isEbitda ? 'var(--dark-navy)' : row.bold ? 'var(--dark-navy)' : 'var(--gray-600)',
                      fontSize: row.kind === 'pct' ? 11 : 12,
                      fontStyle: row.kind === 'pct' ? 'italic' : 'normal',
                    }}>
                      {row.label}
                    </td>
                    {years.map((yr, ci) => renderCell(row, yr, ci))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Cost Structure at 50% Util ── */}
      <Card>
        <SectionHeader title="Cost Structure Breakdown — 50% Utilization (Year 1)" badge="Variable Detail" />
        <div style={{ padding: 16 }}>
          <div className="grid-2col" style={{ gap: 24 }}>
            {/* Laundry var costs */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-navy)', marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid var(--powder-blue)' }}>
                Laundry Variable Costs
              </div>
              {costAt50.varCostDetail.map((item, i) => {
                const total = costAt50.varCostDetail.reduce((s, c) => s + c.totalAmt, 0);
                const pct = total > 0 ? (item.totalAmt / total) * 100 : 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--gray-700)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-navy)', minWidth: 80, textAlign: 'right' }}>{autoFmt(item.totalAmt)}</span>
                    <div style={{ width: 80, height: 8, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--powder-blue), var(--dark-navy))', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--gray-500)', minWidth: 36, textAlign: 'right' }}>{fPct(pct)}</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 4px', borderTop: '2px solid var(--dark-navy)', marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-navy)' }}>Total Laundry Var Cost</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--dark-navy)' }}>{autoFmt(costAt50.varCostDetail.reduce((s, c) => s + c.totalAmt, 0))}</span>
              </div>
            </div>

            {/* Uniform var costs */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-navy)', marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid var(--powder-blue)' }}>
                Uniform Variable Costs
              </div>
              {(Object.entries(inputs.uniformVarCost) as [keyof typeof inputs.uniformVarCost, number][]).map(([key, rate]) => {
                const amt = costAt50.uniformPcsPerYear * rate;
                const totalU = costAt50.uniformPcsPerYear * Object.values(inputs.uniformVarCost).reduce((s, v) => s + v, 0);
                const pct = totalU > 0 ? (amt / totalU) * 100 : 0;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--gray-700)', textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-navy)', minWidth: 80, textAlign: 'right' }}>{autoFmt(amt)}</span>
                    <div style={{ width: 80, height: 8, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #89CFF0, #1F3864)', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--gray-500)', minWidth: 36, textAlign: 'right' }}>{fPct(pct)}</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 4px', borderTop: '2px solid var(--dark-navy)', marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-navy)' }}>Total Uniform Var Cost</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--dark-navy)' }}>
                  {autoFmt(costAt50.uniformPcsPerYear * Object.values(inputs.uniformVarCost).reduce((s, v) => s + v, 0))}
                </span>
              </div>

              {/* Grand total box */}
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--dark-navy)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--powder-blue)', fontSize: 11, marginBottom: 2 }}>Total Variable Costs @ 50% Util</div>
                    <div style={{ color: 'rgba(137,207,240,0.6)', fontSize: 10 }}>Laundry + Uniform (excl. rewash)</div>
                  </div>
                  <div style={{ color: 'var(--white)', fontSize: 18, fontWeight: 800 }}>{autoFmt(costAt50.variableCosts)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
