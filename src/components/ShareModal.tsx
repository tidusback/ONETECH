import React from 'react';
import type { InputState } from '../types';
import {
  encodeStateToUrl,
  buildEmailBody,
  buildSummaryText,
  type SharePayload,
} from '../utils/share';

interface Props {
  inputs: InputState;
  projectName: string;
  projectLocation: string;
  onClose: () => void;
}

type CopyState = 'idle' | 'copied' | 'error';

// ── Sub-components ────────────────────────────────────────────────────────────

function OptionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--gray-50)',
      border: '1px solid var(--gray-200)',
      borderRadius: 10,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {children}
    </div>
  );
}

function OptionHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: 22, lineHeight: 1.1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-navy)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  );
}

function CopyButton({
  label, onClick, state, color = '#16a34a',
}: {
  label: string;
  onClick: () => void;
  state: CopyState;
  color?: string;
}) {
  const bg =
    state === 'copied' ? '#15803d' :
    state === 'error'  ? '#dc2626' :
    color;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: '9px 18px',
        background: bg,
        border: 'none',
        borderRadius: 7,
        cursor: state === 'copied' ? 'default' : 'pointer',
        fontSize: 12,
        fontWeight: 700,
        color: '#fff',
        boxShadow: state === 'idle' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
        transition: 'background 0.2s, transform 0.1s',
        transform: state === 'copied' ? 'scale(0.98)' : 'scale(1)',
        minWidth: 140,
      }}
    >
      {state === 'copied' ? '✅ Copied!' : state === 'error' ? '❌ Failed' : label}
    </button>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function ShareModal({ inputs, projectName, projectLocation, onClose }: Props) {
  const payload: SharePayload = { inputs, projectName, projectLocation };

  const [shareUrl, setShareUrl] = React.useState('');
  const [linkState,    setLinkState]    = React.useState<CopyState>('idle');
  const [summaryState, setSummaryState] = React.useState<CopyState>('idle');

  // Build share URL once on mount
  React.useEffect(() => {
    setShareUrl(encodeStateToUrl(payload));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyText(text: string, setter: (s: CopyState) => void) {
    try {
      await navigator.clipboard.writeText(text);
      setter('copied');
      setTimeout(() => setter('idle'), 2200);
    } catch {
      setter('error');
      setTimeout(() => setter('idle'), 2200);
    }
  }

  function handleCopyLink() {
    copyText(shareUrl, setLinkState);
  }

  function handleEmail() {
    const subject = encodeURIComponent(`GNMI Nortkem Investment Analysis — ${projectName}`);
    const body    = encodeURIComponent(buildEmailBody(payload, shareUrl));
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }

  function handleCopySummary() {
    const text = buildSummaryText(payload, shareUrl);
    copyText(text, setSummaryState);
  }

  // Trap focus + close on Escape
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Truncate URL for display
  const displayUrl = shareUrl.length > 72
    ? shareUrl.slice(0, 36) + '…' + shareUrl.slice(-18)
    : shareUrl;

  const summaryPreview = shareUrl ? buildSummaryText(payload, shareUrl) : '';

  return (
    <>
      {/* ── Overlay ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,45,0.72)',
          zIndex: 900,
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* ── Modal card ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share Report"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 901,
          background: 'var(--white)',
          borderRadius: 14,
          width: 'min(560px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(15,23,45,0.45)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--dark-navy) 0%, #2a4d9e 100%)',
          padding: '16px 20px',
          borderRadius: '14px 14px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ color: 'var(--white)', fontSize: 15, fontWeight: 700 }}>
              📤 Share Report
            </div>
            <div style={{ color: 'rgba(137,207,240,0.7)', fontSize: 11, marginTop: 2 }}>
              {projectName} · Current inputs snapshot
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: 16,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Option 1: Copy Link ── */}
          <OptionCard>
            <OptionHeader
              icon="🔗"
              title="Copy Link"
              sub="Shareable URL — opens this model with your exact inputs pre-loaded"
            />
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-200)',
              borderRadius: 7,
              padding: '8px 12px',
              fontSize: 11,
              fontFamily: 'monospace',
              color: 'var(--navy-mid)',
              wordBreak: 'break-all',
              userSelect: 'all',
            }}>
              {displayUrl || 'Generating…'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CopyButton
                label="📋 Copy Link"
                onClick={handleCopyLink}
                state={linkState}
                color="#1F3864"
              />
              <span style={{ fontSize: 11, color: 'var(--gray-400)', flex: 1 }}>
                {linkState === 'copied'
                  ? 'Link copied — paste it anywhere!'
                  : 'All inputs are encoded in the URL. Anyone with it sees your exact model.'}
              </span>
            </div>
          </OptionCard>

          {/* ── Option 2: Email ── */}
          <OptionCard>
            <OptionHeader
              icon="📧"
              title="Share via Email"
              sub="Opens your mail client with subject, KPI summary, and the shareable link pre-filled"
            />
            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-200)',
              borderRadius: 7,
              padding: '8px 12px',
              fontSize: 11,
              color: 'var(--gray-600)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '4px 10px',
              alignItems: 'baseline',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--dark-navy)' }}>Subject:</span>
              <span>GNMI Nortkem Investment Analysis — {projectName}</span>
              <span style={{ fontWeight: 600, color: 'var(--dark-navy)' }}>Body:</span>
              <span>KPI summary + 10-yr NOI table + shareable link</span>
            </div>
            <div>
              <button
                onClick={handleEmail}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: 'none', borderRadius: 7,
                  cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.35)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(37,99,235,0.35)'; e.currentTarget.style.transform = 'none'; }}
              >
                📧 Open Email Client
              </button>
            </div>
          </OptionCard>

          {/* ── Option 3: Copy Summary Text ── */}
          <OptionCard>
            <OptionHeader
              icon="💬"
              title="Copy Summary Text"
              sub="Ready-to-paste summary for WhatsApp, Viber, Messenger, or any chat app"
            />
            <textarea
              readOnly
              value={summaryPreview}
              style={{
                width: '100%',
                height: 160,
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: 10,
                lineHeight: 1.5,
                padding: '8px 10px',
                border: '1px solid var(--gray-200)',
                borderRadius: 7,
                background: 'var(--white)',
                color: 'var(--gray-700)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CopyButton
                label="💬 Copy Summary"
                onClick={handleCopySummary}
                state={summaryState}
                color="#7c3aed"
              />
              <span style={{ fontSize: 11, color: 'var(--gray-400)', flex: 1 }}>
                {summaryState === 'copied'
                  ? 'Copied — paste into WhatsApp, Viber, or any chat!'
                  : 'Includes KPIs, 10-yr NOI table, and the shareable link.'}
              </span>
            </div>
          </OptionCard>

          {/* ── Footer note ── */}
          <div style={{
            fontSize: 10,
            color: 'var(--gray-400)',
            textAlign: 'center',
            paddingTop: 4,
            borderTop: '1px solid var(--gray-100)',
          }}>
            All data is encoded client-side. Nothing is sent to any server.
            The link encodes your inputs using LZ compression — no account required.
          </div>
        </div>
      </div>
    </>
  );
}
