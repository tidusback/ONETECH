import React from 'react';

interface FieldRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function FieldRow({ label, hint, children }: FieldRowProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: '1px solid var(--gray-100)',
      gap: 8,
      minHeight: 34,
    }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, color: 'var(--gray-700)', fontWeight: 500 }}>{label}</span>
        {hint && <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>{hint}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}
