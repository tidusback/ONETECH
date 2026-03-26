import React from 'react';
import type { InputState, ShiftType } from '../types';
import { SectionCard } from '../components/SectionCard';
import { FieldRow } from '../components/FieldRow';
import { NumInput } from '../components/NumInput';

interface Props {
  inputs: InputState;
  onChange: (patch: Partial<InputState>) => void;
}

// Derived calculations shown inline
function calcLoanAmount(inputs: InputState) {
  return inputs.loanMode === 'pct'
    ? inputs.totalCapex * (inputs.loanPct / 100)
    : inputs.loanFixed;
}

function calcAnnualPayment(inputs: InputState) {
  const P = calcLoanAmount(inputs);
  const r = inputs.interestRate / 100 / 12;
  const n = inputs.loanTermYears * 12;
  if (r === 0) return P / n * 12;
  const payment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return payment * 12;
}

function calcDepreciation(inputs: InputState) {
  return inputs.totalCapex / inputs.depreciationYears;
}

function fmt(n: number, d = 0) {
  return n.toLocaleString('en-PH', { minimumFractionDigits: d, maximumFractionDigits: d });
}

function pct(n: number) { return n.toFixed(1) + '%'; }

export function InputsTab({ inputs, onChange }: Props) {
  const totalVarLaundry = inputs.varCostsLaundry.reduce((s, i) => s + i.value, 0);
  const loanAmount = calcLoanAmount(inputs);
  const annualPayment = calcAnnualPayment(inputs);
  const depreciation = calcDepreciation(inputs);
  const totalUniformVarCost = Object.values(inputs.uniformVarCost).reduce((s, v) => s + v, 0);

  const shiftHours = inputs.shiftType === 'single' ? 8 : inputs.shiftType === 'double' ? 16 : 24;
  const uniformCapacityDay = inputs.uniformPcsPerHr * shiftHours;

  function setVarLaundry(idx: number, value: number) {
    const updated = inputs.varCostsLaundry.map((item, i) =>
      i === idx ? { ...item, value } : item
    );
    onChange({ varCostsLaundry: updated });
  }

  function setUtilization(yearIdx: number, value: number) {
    const updated = inputs.utilizationRamp.map((u, i) =>
      i === yearIdx ? { ...u, utilization: value } : u
    );
    onChange({ utilizationRamp: updated });
  }

  const shiftBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 6,
    border: active ? '2px solid var(--dark-navy)' : '2px solid var(--gray-200)',
    background: active ? 'var(--dark-navy)' : 'var(--white)',
    color: active ? 'var(--white)' : 'var(--gray-600)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Operations ── */}
      <div className="grid-2col">
        <SectionCard title="Operations">
          <FieldRow label="Operating Days / Month">
            <NumInput value={inputs.daysPerMonth} onChange={v => onChange({ daysPerMonth: v })}
              min={1} max={31} step={1} decimals={0} suffix="days" />
          </FieldRow>
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--blue-pale)', borderRadius: 6, fontSize: 12, color: 'var(--dark-navy)' }}>
            <strong>Annual operating days:</strong> {fmt(inputs.daysPerMonth * 12)} &nbsp;|&nbsp;
            <strong>Shift hours:</strong> {shiftHours} hrs/day
          </div>
        </SectionCard>

        {/* ── Shift Configuration ── */}
        <SectionCard title="Shift Configuration">
          <FieldRow label="Shift Type">
            <div style={{ display: 'flex', gap: 6 }}>
              {(['single', 'double', '24hr'] as ShiftType[]).map(s => (
                <button key={s} style={shiftBtnStyle(inputs.shiftType === s)}
                  onClick={() => onChange({ shiftType: s })}>
                  {s === 'single' ? 'Single 8hr' : s === 'double' ? 'Double 16hr' : '24hr'}
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Staff per Shift — Min">
            <NumInput value={inputs.staffPerShiftMin} onChange={v => onChange({ staffPerShiftMin: v })}
              min={1} step={1} decimals={0} suffix="pax" />
          </FieldRow>
          <FieldRow label="Staff per Shift — Max">
            <NumInput value={inputs.staffPerShiftMax} onChange={v => onChange({ staffPerShiftMax: v })}
              min={1} step={1} decimals={0} suffix="pax" />
          </FieldRow>
          <FieldRow label="Daily Rate per Staff">
            <NumInput value={inputs.dailyRate} onChange={v => onChange({ dailyRate: v })}
              min={0} step={50} decimals={0} prefix="₱" />
          </FieldRow>
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--blue-pale)', borderRadius: 6, fontSize: 12, color: 'var(--dark-navy)' }}>
            <strong>Daily labor cost (min):</strong> ₱{fmt(inputs.staffPerShiftMin * inputs.dailyRate)} &nbsp;|&nbsp;
            <strong>Max:</strong> ₱{fmt(inputs.staffPerShiftMax * inputs.dailyRate)}
          </div>
        </SectionCard>
      </div>

      {/* ── Laundry Line + Uniform Line ── */}
      <div className="grid-2col">
        <SectionCard title="Laundry Line" badge="Revenue">
          <FieldRow label="Capacity" hint="Max throughput per day">
            <NumInput value={inputs.laundryCapacityKgDay}
              onChange={v => onChange({ laundryCapacityKgDay: v })}
              min={0} step={100} decimals={0} suffix="kg/day" />
          </FieldRow>
          <FieldRow label="Price per kg">
            <NumInput value={inputs.laundryPricePerKg}
              onChange={v => onChange({ laundryPricePerKg: v })}
              min={0} step={0.5} decimals={2} prefix="₱" suffix="/kg" />
          </FieldRow>
          <FieldRow label="Rewash Rate" hint="Cost incurred, zero extra revenue">
            <NumInput value={inputs.rewashRate}
              onChange={v => onChange({ rewashRate: v })}
              min={0} max={100} step={0.1} decimals={1} suffix="%" />
          </FieldRow>
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--blue-pale)', borderRadius: 6, fontSize: 12, color: 'var(--dark-navy)' }}>
            <strong>Billable kg/day:</strong> {fmt(inputs.laundryCapacityKgDay)} &nbsp;|&nbsp;
            <strong>Rewash kg/day:</strong> {fmt(inputs.laundryCapacityKgDay * inputs.rewashRate / 100, 1)}
            <br />
            <strong>Rev/day (100% util):</strong> ₱{fmt(inputs.laundryCapacityKgDay * inputs.laundryPricePerKg)}
          </div>
        </SectionCard>

        <SectionCard title="Uniform Line" badge="Revenue">
          <FieldRow label="Output Rate">
            <NumInput value={inputs.uniformPcsPerHr}
              onChange={v => onChange({ uniformPcsPerHr: v })}
              min={0} step={10} decimals={0} suffix="pcs/hr" />
          </FieldRow>
          <FieldRow label="Price per Piece">
            <NumInput value={inputs.uniformPricePerPc}
              onChange={v => onChange({ uniformPricePerPc: v })}
              min={0} step={0.5} decimals={2} prefix="₱" suffix="/pc" />
          </FieldRow>
          <div style={{ marginTop: 6, marginBottom: 4, fontSize: 12, fontWeight: 600, color: 'var(--dark-navy)', borderTop: '1px solid var(--gray-200)', paddingTop: 8 }}>
            Variable Cost Breakdown (₱/pc)
          </div>
          {(['electricity', 'water', 'chemicals', 'other'] as const).map(key => (
            <FieldRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
              <NumInput value={inputs.uniformVarCost[key]}
                onChange={v => onChange({ uniformVarCost: { ...inputs.uniformVarCost, [key]: v } })}
                min={0} step={0.1} decimals={2} prefix="₱" suffix="/pc" />
            </FieldRow>
          ))}
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--blue-pale)', borderRadius: 6, fontSize: 12, color: 'var(--dark-navy)' }}>
            <strong>Total var cost:</strong> ₱{totalUniformVarCost.toFixed(2)}/pc &nbsp;|&nbsp;
            <strong>Margin/pc:</strong> ₱{(inputs.uniformPricePerPc - totalUniformVarCost).toFixed(2)}
            <br />
            <strong>Capacity ({shiftHours}hr shift):</strong> {fmt(uniformCapacityDay)} pcs/day
          </div>
        </SectionCard>
      </div>

      {/* ── Variable Costs Laundry ── */}
      <SectionCard title="Variable Costs — Laundry" badge="₱/kg">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {inputs.varCostsLaundry.map((item, idx) => {
            const sharePct = totalVarLaundry > 0 ? (item.value / totalVarLaundry) * 100 : 0;
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--gray-100)', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--gray-700)', fontWeight: 500 }}>{item.label}</span>
                <NumInput value={item.value} onChange={v => setVarLaundry(idx, v)}
                  min={0} step={0.1} decimals={2} prefix="₱" suffix="/kg" />
                <div style={{ width: 80, textAlign: 'right' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: sharePct > 30 ? 'var(--red-500)' : sharePct > 20 ? '#d97706' : 'var(--green-600)',
                    background: sharePct > 30 ? '#fef2f2' : sharePct > 20 ? '#fffbeb' : '#f0fdf4',
                    padding: '2px 6px', borderRadius: 4,
                  }}>
                    {pct(sharePct)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--dark-navy)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--powder-blue)', fontSize: 12, fontWeight: 600 }}>Total Variable Cost (Laundry)</span>
          <span style={{ color: 'var(--white)', fontSize: 14, fontWeight: 700 }}>₱{totalVarLaundry.toFixed(2)}/kg</span>
        </div>
      </SectionCard>

      {/* ── Annual Escalations + Revenue Deductions ── */}
      <div className="grid-2col">
        <SectionCard title="Annual Escalations">
          <FieldRow label="Price Escalation" hint="Applied to all revenue lines">
            <NumInput value={inputs.priceEscalation} onChange={v => onChange({ priceEscalation: v })}
              min={0} max={100} step={0.1} decimals={1} suffix="% / yr" />
          </FieldRow>
          <FieldRow label="Variable Cost Escalation">
            <NumInput value={inputs.varCostEscalation} onChange={v => onChange({ varCostEscalation: v })}
              min={0} max={100} step={0.1} decimals={1} suffix="% / yr" />
          </FieldRow>
          <FieldRow label="Labor Escalation">
            <NumInput value={inputs.laborEscalation} onChange={v => onChange({ laborEscalation: v })}
              min={0} max={100} step={0.1} decimals={1} suffix="% / yr" />
          </FieldRow>
          <FieldRow label="Rent Escalation">
            <NumInput value={inputs.rentEscalation} onChange={v => onChange({ rentEscalation: v })}
              min={0} max={100} step={0.1} decimals={1} suffix="% / yr" />
          </FieldRow>
        </SectionCard>

        <SectionCard title="Revenue Deductions">
          <FieldRow label="Royalty Fee" hint="% of gross revenue">
            <NumInput value={inputs.royaltyPct} onChange={v => onChange({ royaltyPct: v })}
              min={0} max={100} step={0.1} decimals={1} suffix="%" />
          </FieldRow>
          <FieldRow label="Marketing Fee" hint="% of gross revenue">
            <NumInput value={inputs.marketingPct} onChange={v => onChange({ marketingPct: v })}
              min={0} max={100} step={0.1} decimals={1} suffix="%" />
          </FieldRow>
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--blue-pale)', borderRadius: 6, fontSize: 12, color: 'var(--dark-navy)' }}>
            <strong>Total deduction:</strong> {pct(inputs.royaltyPct + inputs.marketingPct)} of gross revenue
            <br />
            <strong>Net revenue factor:</strong> {pct(100 - inputs.royaltyPct - inputs.marketingPct)}
          </div>
        </SectionCard>
      </div>

      {/* ── CAPEX & Financing ── */}
      <SectionCard title="CAPEX & Financing">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          <div>
            <FieldRow label="Total CAPEX">
              <NumInput value={inputs.totalCapex} onChange={v => onChange({ totalCapex: v })}
                min={0} step={100000} decimals={0} prefix="₱" />
            </FieldRow>
            <FieldRow label="Loan Input Mode">
              <div style={{ display: 'flex', gap: 6 }}>
                {(['pct', 'fixed'] as const).map(mode => (
                  <button key={mode} style={shiftBtnStyle(inputs.loanMode === mode)}
                    onClick={() => onChange({ loanMode: mode })}>
                    {mode === 'pct' ? '% of CAPEX' : 'Fixed ₱'}
                  </button>
                ))}
              </div>
            </FieldRow>
            {inputs.loanMode === 'pct' ? (
              <FieldRow label="Loan % of CAPEX">
                <NumInput value={inputs.loanPct} onChange={v => onChange({ loanPct: v })}
                  min={0} max={100} step={1} decimals={1} suffix="%" />
              </FieldRow>
            ) : (
              <FieldRow label="Loan Amount (Fixed)">
                <NumInput value={inputs.loanFixed} onChange={v => onChange({ loanFixed: v })}
                  min={0} step={100000} decimals={0} prefix="₱" />
              </FieldRow>
            )}
            <FieldRow label="Interest Rate">
              <NumInput value={inputs.interestRate} onChange={v => onChange({ interestRate: v })}
                min={0} max={100} step={0.1} decimals={2} suffix="% p.a." />
            </FieldRow>
          </div>
          <div>
            <FieldRow label="Loan Term">
              <NumInput value={inputs.loanTermYears} onChange={v => onChange({ loanTermYears: v })}
                min={1} max={30} step={1} decimals={0} suffix="years" />
            </FieldRow>
            <FieldRow label="Depreciation Period">
              <NumInput value={inputs.depreciationYears} onChange={v => onChange({ depreciationYears: v })}
                min={1} max={30} step={1} decimals={0} suffix="years" />
            </FieldRow>
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--dark-navy)', borderRadius: 8, fontSize: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ color: 'var(--powder-blue)', marginBottom: 2 }}>Loan Amount</div>
                  <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: 14 }}>₱{fmt(loanAmount)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--powder-blue)', marginBottom: 2 }}>Equity (Down Payment)</div>
                  <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: 14 }}>₱{fmt(inputs.totalCapex - loanAmount)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--powder-blue)', marginBottom: 2 }}>Est. Annual Payment</div>
                  <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: 14 }}>₱{fmt(annualPayment)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--powder-blue)', marginBottom: 2 }}>Annual Depreciation</div>
                  <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: 14 }}>₱{fmt(depreciation)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Fixed Costs ── */}
      <SectionCard title="Fixed Costs">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          <div>
            <FieldRow label="Rent per Month">
              <NumInput value={inputs.rentPerMonth} onChange={v => onChange({ rentPerMonth: v })}
                min={0} step={1000} decimals={0} prefix="₱" suffix="/mo" />
            </FieldRow>
            <FieldRow label="Insurance per Year">
              <NumInput value={inputs.insurancePerYear} onChange={v => onChange({ insurancePerYear: v })}
                min={0} step={1000} decimals={0} prefix="₱" suffix="/yr" />
            </FieldRow>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ padding: '10px 12px', background: 'var(--blue-pale)', borderRadius: 8, fontSize: 12, color: 'var(--dark-navy)' }}>
              <div style={{ marginBottom: 4 }}>
                <strong>Annual Rent:</strong> ₱{fmt(inputs.rentPerMonth * 12)}
              </div>
              <div style={{ marginBottom: 4 }}>
                <strong>Annual Insurance:</strong> ₱{fmt(inputs.insurancePerYear)}
              </div>
              <div style={{ borderTop: '1px solid var(--blue-soft)', paddingTop: 6, fontWeight: 700 }}>
                <strong>Total Fixed (excl. loan):</strong> ₱{fmt(inputs.rentPerMonth * 12 + inputs.insurancePerYear)}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Utilization Ramp ── */}
      <SectionCard title="Utilization Ramp — 10-Year" badge="% of capacity">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                {inputs.utilizationRamp.map(u => (
                  <th key={u.year} style={{
                    padding: '6px 8px', textAlign: 'center', fontSize: 11, fontWeight: 600,
                    color: 'var(--dark-navy)', borderBottom: '2px solid var(--powder-blue)',
                    whiteSpace: 'nowrap',
                  }}>
                    Year {u.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {inputs.utilizationRamp.map((u, idx) => (
                  <td key={idx} style={{ padding: '8px 6px', textAlign: 'center', borderBottom: '1px solid var(--gray-100)' }}>
                    <NumInput
                      value={u.utilization}
                      onChange={v => setUtilization(idx, v)}
                      min={0} max={100} step={1} decimals={0} suffix="%"
                      style={{ display: 'flex', justifyContent: 'center' }}
                    />
                  </td>
                ))}
              </tr>
              <tr style={{ background: 'var(--gray-50)' }}>
                {inputs.utilizationRamp.map((u, idx) => {
                  const laundryRev = inputs.laundryCapacityKgDay * (u.utilization / 100)
                    * inputs.laundryPricePerKg * inputs.daysPerMonth * 12;
                  return (
                    <td key={idx} style={{ padding: '6px 6px', textAlign: 'center', fontSize: 11, color: 'var(--dark-navy)' }}>
                      <div style={{ fontSize: 10, color: 'var(--gray-400)', marginBottom: 2 }}>Laundry Rev/yr</div>
                      <strong>₱{(laundryRev / 1_000_000).toFixed(1)}M</strong>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {inputs.utilizationRamp.map((u, idx) => (
              <div key={idx} style={{ flex: '1 0 60px', minWidth: 60 }}>
                <div style={{
                  height: 80,
                  background: 'var(--gray-100)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}>
                  <div style={{
                    width: '100%',
                    height: `${u.utilization}%`,
                    background: `linear-gradient(180deg, var(--powder-blue) 0%, var(--dark-navy) 100%)`,
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.3s ease',
                  }} />
                </div>
                <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--gray-600)', marginTop: 2 }}>Yr {u.year}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

    </div>
  );
}
