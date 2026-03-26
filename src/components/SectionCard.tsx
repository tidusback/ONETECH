import React from 'react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  badge?: string;
}

export function SectionCard({ title, children, badge }: SectionCardProps) {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 10,
      border: '1px solid var(--gray-200)',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(31,56,100,0.06)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--dark-navy) 0%, var(--navy-mid) 100%)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h3 style={{ color: 'var(--white)', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>
          {title}
        </h3>
        {badge && (
          <span style={{
            background: 'rgba(137,207,240,0.25)',
            color: 'var(--powder-blue)',
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 12,
            fontWeight: 500,
          }}>{badge}</span>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        {children}
      </div>
    </div>
  );
}
