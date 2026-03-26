import React from 'react';
import type { InputState } from '../types';
import { computeYear, computeBreakevenUtil } from '../utils/calculations';

interface Props { inputs: InputState }

// ── Formatters ────────────────────────────────────────────────────────────────
function fM(n: number, d = 1) { return (n / 1_000_000).toFixed(d) + 'M'; }
function fK(n: number, d = 0) { return (n / 1_000).toFixed(d) + 'K'; }
function autoFmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n < 0 ? '(₱' : '₱') + fM(abs) + (n < 0 ? ')' : '');
  if (abs >= 1_000) return (n < 0 ? '(₱' : '₱') + fK(abs) + (n < 0 ? ')' : '');
  return (n < 0 ? '(₱' : '₱') + Math.abs(n).toFixed(0) + (n < 0 ? ')' : '');
}
function fPct(n: number, d = 1) { return n.toFixed(d) + '%'; }

// ── Scenario definition ───────────────────────────────────────────────────────
const SCENARIOS = [
  { label: 'Conservative', util: 30, color: '#dc2626', bgLight: '#fef2f2', tagColor: '#fee2e2' },
  { label: 'Base Case', util: 50, color: '#d97706', bgLight: '#fffbeb', tagColor: '#fef3c7' },
  { label: 'Target', util: 65, color: '#2563eb', bgLight: '#eff6ff', tagColor: '#dbeafe' },
  { label: 'Optimistic', util: 80, color: '#16a34a', bgLight: '#f0fdf4', tagColor: '#dcfce7' },
];

const MATRIX_YEARS = [1, 3, 5, 7, 10];

// ── NOI color helper ─────────────────────────────────────────────────────────
function noiStyle(noi: number): React.CSSProperties {
  if (noi > 0) return { color: 'var(--green-600)', background: '#f0fdf4', fontWeight: 700 };
  if (noi < 0) return { color: 'var(--red-500)', background: '#fef2f2', fontWeight: 700 };
  return { color: 'var(--gray-600)', fontWeight: 500 };
}

export function SensitivityTab({ inputs }: Props) {
  const breakevenUtil = computeBreakevenUtil(inputs);

  // ── Scenario card data ───────────────────────────────────────────────────
  const scenarioData = SCENARIOS.map(s => {
    const allYears = Array.from({ length: 10 }, (_, i) => computeYear(inputs, i, s.util));
    const yr1 = allYears[0];
    const yr5 = allYears[4];
    const yr10 = allYears[9];
    const firstProfitYear = allYears.findIndex(y => y.noi > 0);
    return { ...s, yr1, yr5, yr10, allYears, firstProfitYear };
  });

  // ── Breakeven bar chart (10% to 120%, step 5) ────────────────────────────
  const breakevenSteps = Array.from({ length: 23 }, (_, i) => {
    const util = 10 + i * 5;
    const r = computeYear(inputs, 0, util);
    return { util, noi: r.noi, rev: r.totalRevenue };
  });
  const maxAbsNOI = Math.max(...breakevenSteps.map(s => Math.abs(s.noi)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Scenario Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {scenarioData.map(s => (
          <div key={s.util} style={{
            borderRadius: 12,
            border: `2px solid ${s.color}33`,
            background: s.bgLight,
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{ background: s.color, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{s.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>{s.util}% Utilization</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 10px', color: 'white', fontSize: 18, fontWeight: 800 }}>
                {s.util}%
              </div>
            </div>
            {/* Metrics */}
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { lbl: 'Year 1 Revenue', val: autoFmt(s.yr1.totalRevenue) },
                { lbl: 'Year 1 NOI', val: autoFmt(s.yr1.noi), noi: s.yr1.noi },
                { lbl: 'Year 5 NOI', val: autoFmt(s.yr5.noi), noi: s.yr5.noi },
                { lbl: 'Year 10 NOI', val: autoFmt(s.yr10.noi), noi: s.yr10.noi },
              ].map(m => (
                <div key={m.lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#374151' }}>{m.lbl}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: m.noi !== undefined ? (m.noi >= 0 ? '#16a34a' : '#dc2626') : '#1F3864',
                  }}>{m.val}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${s.color}33`, paddingTop: 8, marginTop: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#374151' }}>First Profitable Year</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: s.firstProfitYear >= 0 ? '#16a34a' : '#dc2626',
                    background: s.firstProfitYear >= 0 ? '#dcfce7' : '#fee2e2',
                    padding: '2px 8px', borderRadius: 12,
                  }}>
                    {s.firstProfitYear >= 0 ? `Year ${s.firstProfitYear + 1}` : 'Outside 10yr'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── NOI Sensitivity Matrix ── */}
      <div style={{ background: 'var(--white)', borderRadius: 10, border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(31,56,100,0.06)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--dark-navy) 0%, var(--navy-mid) 100%)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--white)', fontSize: 13, fontWeight: 600 }}>NOI Sensitivity Matrix — Scenario × Year</h3>
          <span style={{ background: 'rgba(137,207,240,0.2)', color: 'var(--powder-blue)', fontSize: 11, padding: '2px 8px', borderRadius: 12 }}>Annual NOI</span>
        </div>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--dark-navy)', borderBottom: '2px solid var(--powder-blue)', width: 180 }}>
                  Scenario / Utilization
                </th>
                {MATRIX_YEARS.map(y => (
                  <th key={y} style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--dark-navy)', borderBottom: '2px solid var(--powder-blue)', minWidth: 120 }}>
                    Year {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map(s => (
                <tr key={s.util}>
                  <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-navy)' }}>{s.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{s.util}% util (flat)</div>
                      </div>
                    </div>
                  </td>
                  {MATRIX_YEARS.map(yr => {
                    const result = computeYear(inputs, yr - 1, s.util);
                    return (
                      <td key={yr} style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--gray-100)', ...noiStyle(result.noi) }}>
                        <div style={{ fontSize: 13 }}>{autoFmt(result.noi)}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 400, marginTop: 2 }}>
                          {fPct(result.noiMargin * 100)} margin
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Breakeven callout */}
        <div style={{ padding: '10px 16px', background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--dark-navy)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--dark-navy)' }}>
            <strong>Breakeven Utilization (Year 1):</strong> {fPct(breakevenUtil)} — above this level, NOI turns positive.
          </span>
        </div>
      </div>

      {/* ── Breakeven Bar Chart ── */}
      <div style={{ background: 'var(--white)', borderRadius: 10, border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(31,56,100,0.06)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--dark-navy) 0%, var(--navy-mid) 100%)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--white)', fontSize: 13, fontWeight: 600 }}>Breakeven Analysis — NOI by Utilization (Year 1)</h3>
          <span style={{ background: 'rgba(137,207,240,0.2)', color: 'var(--powder-blue)', fontSize: 11, padding: '2px 8px', borderRadius: 12 }}>10% → 120%</span>
        </div>

        <div style={{ padding: 16 }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 14, fontSize: 11 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#16a34a', display: 'inline-block' }} /> Profitable (NOI &gt; 0)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#dc2626', display: 'inline-block' }} /> Loss (NOI &lt; 0)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 2, height: 14, background: '#d97706', display: 'inline-block' }} /> Breakeven ({fPct(breakevenUtil)})
            </span>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 200, position: 'relative' }}>
            {/* Zero line */}
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: '50%', height: 1,
              background: '#9ca3af',
              zIndex: 0,
            }} />

            {breakevenSteps.map(step => {
              const isProfit = step.noi >= 0;
              const isBreakevenBar = Math.abs(step.util - breakevenUtil) < 2.5;
              const barProportion = maxAbsNOI > 0 ? Math.abs(step.noi) / maxAbsNOI : 0;
              const barHeightPx = barProportion * 90; // max 90px each direction from center
              const color = isBreakevenBar ? '#d97706' : isProfit ? '#16a34a' : '#dc2626';

              return (
                <div key={step.util} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative', zIndex: 1 }}>
                  {/* Profit bar (above center) */}
                  <div style={{ height: 90, display: 'flex', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                    {isProfit && (
                      <div style={{
                        width: '80%', height: barHeightPx,
                        background: color,
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s',
                        minHeight: 2,
                      }} />
                    )}
                  </div>
                  {/* Loss bar (below center) */}
                  <div style={{ height: 90, display: 'flex', alignItems: 'flex-start', width: '100%', justifyContent: 'center' }}>
                    {!isProfit && (
                      <div style={{
                        width: '80%', height: barHeightPx,
                        background: color,
                        borderRadius: '0 0 3px 3px',
                        transition: 'height 0.3s',
                        minHeight: 2,
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {breakevenSteps.map(step => (
              <div key={step.util} style={{
                flex: 1, textAlign: 'center', fontSize: 9,
                color: Math.abs(step.util - breakevenUtil) < 2.5 ? '#d97706' : step.noi >= 0 ? '#16a34a' : '#dc2626',
                fontWeight: Math.abs(step.util - breakevenUtil) < 2.5 ? 700 : 400,
              }}>
                {step.util}%
              </div>
            ))}
          </div>

          {/* Breakeven marker label */}
          <div style={{ marginTop: 14, textAlign: 'center', padding: '8px 16px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fde68a', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
              Breakeven Point: <strong>{fPct(breakevenUtil)}</strong> utilization &nbsp;|&nbsp;
              Below → loss &nbsp;|&nbsp; Above → profitable
            </span>
          </div>

          {/* Data table */}
          <div className="table-scroll" style={{ marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {breakevenSteps.map(s => (
                    <th key={s.util} style={{
                      padding: '4px 6px', textAlign: 'center', fontSize: 10,
                      color: Math.abs(s.util - breakevenUtil) < 2.5 ? '#d97706' : 'var(--gray-600)',
                      fontWeight: Math.abs(s.util - breakevenUtil) < 2.5 ? 800 : 600,
                      borderBottom: '1px solid var(--gray-200)',
                      whiteSpace: 'nowrap',
                    }}>
                      {s.util}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {breakevenSteps.map(s => {
                    const st = noiStyle(s.noi);
                    return (
                      <td key={s.util} style={{
                        padding: '4px 4px', textAlign: 'center', fontSize: 10,
                        ...st, whiteSpace: 'nowrap',
                      }}>
                        {autoFmt(s.noi)}
                      </td>
                    );
                  })}
                </tr>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {breakevenSteps.map(s => (
                    <td key={s.util} style={{ padding: '3px 4px', textAlign: 'center', fontSize: 9, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                      {s.noi >= 0 ? '✓' : '✗'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
