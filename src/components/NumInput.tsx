import React from 'react';

interface NumInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: React.CSSProperties;
}

export function NumInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  decimals = 2,
  style,
}: NumInputProps) {
  const [raw, setRaw] = React.useState(String(value));
  const [focused, setFocused] = React.useState(false);

  // keep raw in sync when value changes externally
  React.useEffect(() => {
    if (!focused) setRaw(formatNum(value, decimals));
  }, [value, focused, decimals]);

  function formatNum(n: number, d: number) {
    return Number.isInteger(n) && d === 0 ? String(n) : n.toFixed(d);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const s = e.target.value;
    setRaw(s);
    const n = parseFloat(s);
    if (!isNaN(n)) {
      const clamped = min !== undefined && n < min ? min : max !== undefined && n > max ? max : n;
      onChange(clamped);
    }
  }

  function handleBlur() {
    setFocused(false);
    const n = parseFloat(raw);
    if (isNaN(n)) {
      setRaw(formatNum(value, decimals));
    } else {
      const clamped = min !== undefined && n < min ? min : max !== undefined && n > max ? max : n;
      onChange(clamped);
      setRaw(formatNum(clamped, decimals));
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, ...style }}>
      {prefix && <span style={{ color: 'var(--gray-600)', fontSize: 12 }}>{prefix}</span>}
      <input
        type="number"
        value={focused ? raw : formatNum(value, decimals)}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        onFocus={() => { setFocused(true); setRaw(formatNum(value, decimals)); }}
        onBlur={handleBlur}
        style={{
          width: 90,
          padding: '4px 6px',
          border: '1px solid var(--gray-300)',
          borderRadius: 4,
          fontSize: 13,
          textAlign: 'right',
          background: 'var(--white)',
          color: 'var(--gray-800)',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => ((e.target as HTMLInputElement).style.borderColor = 'var(--powder-blue)')}
        onMouseLeave={e => { if (!focused) (e.target as HTMLInputElement).style.borderColor = 'var(--gray-300)'; }}
      />
      {suffix && <span style={{ color: 'var(--gray-600)', fontSize: 12 }}>{suffix}</span>}
    </span>
  );
}
