import React from 'react';
import type { InputState } from '../types';
import {
  calcLoanAmount,
  calcMonthlyLoanPMT,
  calcAnnualLoanPMT,
  computeAmortization,
} from '../utils/calculations';

interface Props { inputs: InputState }

// ── Formatters ────────────────────────────────────────────────────────────────
function fPeso(n: number, d = 2) {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fM(n: number) { return '₱' + (n / 1_000_000).toFixed(3) + 'M'; }
function fPct(n: number) { return n.toFixed(2) + '%'; }

function autoFmt(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return sign + '₱' + (abs / 1_000_000).toFixed(3) + 'M';
  if (abs >= 1_000)     return sign + '₱' + (abs / 1_000).toFixed(2) + 'K';
  return sign + '₱' + abs.toFixed(2);
}

// ── Summary grid item ─────────────────────────────────────────────────────────
function SummaryItem({
  label, value, sub, accent, highlight,
}: {
  label: string; value: string; sub?: string;
  accent?: boolean; highlight?: 'blue' | 'green' | 'red';
}) {
  const bg = accent
    ? 'linear-gradient(135deg, var(--dark-navy) 0%, #2a4d9e 100%)'
    : 'var(--white)';
  const valColor = accent
    ? 'var(--powder-blue)'
    : highlight === 'green' ? 'var(--green-600)'
    : highlight === 'red'   ? 'var(--red-500)'
    : 'var(--dark-navy)';

  return (
    <div style={{
      background: bg,
      border: accent ? 'none' : '1px solid var(--gray-200)',
      borderRadius: 10,
      padding: '14px 16px',
      boxShadow: accent ? '0 4px 16px rgba(31,56,100,0.2)' : '0 1px 3px rgba(31,56,100,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: accent ? 'rgba(137,207,240,0.65)' : 'var(--gray-400)',
      }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: valColor, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: accent ? 'rgba(137,207,240,0.5)' : 'var(--gray-400)' }}>{sub}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function LoanTab({ inputs }: Props) {
  const loanAmount  = calcLoanAmount(inputs);
  const equity      = inputs.totalCapex - loanAmount;
  const monthlyPMT  = calcMonthlyLoanPMT(inputs);
  const annualPMT   = calcAnnualLoanPMT(inputs);
  const schedule    = computeAmortization(inputs);
  const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);
  const totalPaid     = schedule.reduce((s, r) => s + r.annualPMT, 0);
  const ltvPct        = inputs.totalCapex > 0 ? (loanAmount / inputs.totalCapex) * 100 : 0;

  // Progress data for visualising principal vs interest
  const interestPct = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0;
  const principalPct = 100 - interestPct;

  // Column header style
  const thS: React.CSSProperties = {
    padding: '8px 12px',
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--dark-navy)',
    borderBottom: '2px solid var(--powder-blue)',
    background: 'var(--gray-50)',
    whiteSpace: 'nowrap',
  };
  const thL: React.CSSProperties = { ...thS, textAlign: 'left' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Summary Grid ── */}
      <div className="grid-3col" style={{ gap: 12 }}>
        <SummaryItem label="Total CAPEX" value={fM(inputs.totalCapex)}
          sub={`Equity: ${fM(equity)}`} />
        <SummaryItem label="Loan Amount" value={fM(loanAmount)}
          sub={`LTV: ${fPct(ltvPct)}`} accent />
        <SummaryItem label="Equity (Down Payment)" value={fM(equity)}
          sub={`${(100 - ltvPct).toFixed(1)}% of CAPEX`} highlight="green" />
        <SummaryItem label="Interest Rate" value={fPct(inputs.interestRate)}
          sub="Per annum" />
        <SummaryItem label="Loan Term" value={`${inputs.loanTermYears} years`}
          sub={`${inputs.loanTermYears * 12} monthly payments`} />
        <SummaryItem label="Monthly PMT" value={fPeso(monthlyPMT)}
          sub="Fixed monthly payment" highlight="blue" />
        <SummaryItem label="Annual PMT" value={fPeso(annualPMT, 0)}
          sub="12 × monthly PMT" />
        <SummaryItem label="Total Interest Paid" value={fM(totalInterest)}
          sub={`${fPct(interestPct)} of total paid`} highlight="red" />
        <SummaryItem label="Total Amount Paid" value={fM(totalPaid)}
          sub={`Principal ${fM(loanAmount)} + Interest ${fM(totalInterest)}`} />
      </div>

      {/* ── Principal vs Interest split bar ── */}
      <div style={{
        background: 'var(--white)', borderRadius: 10, border: '1px solid var(--gray-200)',
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(31,56,100,0.06)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--dark-navy) 0%, var(--navy-mid) 100%)',
          padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ color: 'var(--white)', fontSize: 13, fontWeight: 600 }}>
            Total Payment Composition
          </h3>
          <span style={{ color: 'var(--powder-blue)', fontSize: 12, fontWeight: 600 }}>
            {fM(totalPaid)} over {inputs.loanTermYears} years
          </span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {/* Stacked bar */}
          <div style={{ height: 36, borderRadius: 8, overflow: 'hidden', display: 'flex', marginBottom: 10 }}>
            <div style={{
              width: `${principalPct}%`,
              background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white',
              transition: 'width 0.4s',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}>
              {principalPct > 15 && `Principal ${fPct(principalPct)}`}
            </div>
            <div style={{
              width: `${interestPct}%`,
              background: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white',
              transition: 'width 0.4s',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}>
              {interestPct > 10 && `Interest ${fPct(interestPct)}`}
            </div>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 24, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#16a34a' }} />
              <span style={{ color: 'var(--gray-700)' }}>
                Principal: <strong>{fM(loanAmount)}</strong> ({fPct(principalPct)})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#ef4444' }} />
              <span style={{ color: 'var(--gray-700)' }}>
                Interest: <strong style={{ color: '#dc2626' }}>{fM(totalInterest)}</strong> ({fPct(interestPct)})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--dark-navy)' }} />
              <span style={{ color: 'var(--gray-700)' }}>
                Total Paid: <strong>{fM(totalPaid)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Amortization Schedule ── */}
      <div style={{
        background: 'var(--white)', borderRadius: 10, border: '1px solid var(--gray-200)',
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(31,56,100,0.06)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--dark-navy) 0%, var(--navy-mid) 100%)',
          padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ color: 'var(--white)', fontSize: 13, fontWeight: 600 }}>
            Loan Amortization Schedule
          </h3>
          <span style={{
            background: 'rgba(137,207,240,0.2)', color: 'var(--powder-blue)',
            fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 500,
          }}>Standard Amortization — Monthly Payments, Annual Rollup</span>
        </div>

        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 750 }}>
            <thead>
              <tr>
                <th style={{ ...thL, width: 70 }}>Year</th>
                <th style={thS}>Opening Balance</th>
                <th style={thS}>Annual PMT</th>
                <th style={thS}>Monthly PMT</th>
                <th style={{ ...thS, color: '#dc2626' }}>Interest ▼</th>
                <th style={{ ...thS, color: '#16a34a' }}>Principal ▲</th>
                <th style={thS}>Closing Balance</th>
                <th style={{ ...thS, width: 120 }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => {
                const principalShare = row.annualPMT > 0 ? row.principal / row.annualPMT : 0;
                const isLast = i === schedule.length - 1;
                return (
                  <tr key={row.year} style={{
                    background: i % 2 === 0 ? 'var(--white)' : 'var(--gray-50)',
                  }}>
                    {/* Year */}
                    <td style={{
                      padding: '8px 12px', fontSize: 12, fontWeight: 700,
                      color: 'var(--dark-navy)', borderBottom: '1px solid var(--gray-100)',
                    }}>
                      Year {row.year}
                    </td>

                    {/* Opening Balance */}
                    <td style={{
                      padding: '8px 12px', textAlign: 'right', fontSize: 12,
                      color: 'var(--gray-700)', borderBottom: '1px solid var(--gray-100)',
                      fontWeight: 500,
                    }}>
                      {autoFmt(row.openingBalance)}
                    </td>

                    {/* Annual PMT */}
                    <td style={{
                      padding: '8px 12px', textAlign: 'right', fontSize: 12,
                      color: 'var(--dark-navy)', fontWeight: 600,
                      borderBottom: '1px solid var(--gray-100)',
                    }}>
                      {autoFmt(row.annualPMT)}
                    </td>

                    {/* Monthly PMT */}
                    <td style={{
                      padding: '8px 12px', textAlign: 'right', fontSize: 11,
                      color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-100)',
                    }}>
                      {autoFmt(row.monthlyPMT)}
                    </td>

                    {/* Interest — red */}
                    <td style={{
                      padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600,
                      color: '#dc2626', background: '#fff8f8',
                      borderBottom: '1px solid var(--gray-100)',
                    }}>
                      {autoFmt(row.interest)}
                    </td>

                    {/* Principal — green */}
                    <td style={{
                      padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600,
                      color: '#16a34a', background: '#f8fff8',
                      borderBottom: '1px solid var(--gray-100)',
                    }}>
                      {autoFmt(row.principal)}
                    </td>

                    {/* Closing Balance */}
                    <td style={{
                      padding: '8px 12px', textAlign: 'right', fontSize: 12,
                      color: isLast ? '#16a34a' : 'var(--gray-700)',
                      fontWeight: isLast ? 700 : 500,
                      borderBottom: '1px solid var(--gray-100)',
                    }}>
                      {isLast ? '—' : autoFmt(row.closingBalance)}
                    </td>

                    {/* Principal/Interest progress bar */}
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--gray-100)' }}>
                      <div style={{ height: 10, background: '#fecaca', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{
                          width: `${principalShare * 100}%`,
                          height: '100%',
                          background: '#16a34a',
                          borderRadius: 5,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--gray-400)', marginTop: 2, textAlign: 'center' }}>
                        {fPct(principalShare * 100)} principal
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totals row */}
            <tfoot>
              <tr style={{ background: 'var(--dark-navy)' }}>
                <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: 'var(--powder-blue)' }}>
                  TOTAL
                </td>
                <td style={{ padding: '10px 12px' }} />
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: 'var(--white)' }}>
                  {autoFmt(totalPaid)}
                </td>
                <td style={{ padding: '10px 12px' }} />
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#f87171' }}>
                  {autoFmt(totalInterest)}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#4ade80' }}>
                  {autoFmt(loanAmount)}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: '#4ade80', fontWeight: 700 }}>
                  Fully paid
                </td>
                <td style={{ padding: '10px 12px' }} />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Formula note */}
        <div style={{
          padding: '10px 16px', background: 'var(--blue-pale)',
          fontSize: 11, color: 'var(--dark-navy)',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 14 }}>ℹ</span>
          <span>
            <strong>Amortization formula:</strong> Monthly PMT = P × [r(1+r)ⁿ] / [(1+r)ⁿ−1] &nbsp;
            where P = loan principal, r = monthly rate ({fPct(inputs.interestRate / 12)}/mo), n = {inputs.loanTermYears * 12} months.
            Interest column (red) decreases each year as the outstanding balance falls;
            principal column (green) increases correspondingly.
          </span>
        </div>
      </div>

    </div>
  );
}
