import React from 'react';
import type { InputState } from './types';
import { defaultInputs } from './defaultInputs';
import { InputsTab } from './tabs/InputsTab';
import { downloadExcel } from './utils/exportExcel';
import { downloadPdf } from './utils/exportPdf';
import { decodeStateFromUrl } from './utils/share';
import { ShareModal } from './components/ShareModal';
import { InstallPrompt } from './components/InstallPrompt';

// Lazy-load heavy tabs so initial bundle is smaller
const ResultsTab     = React.lazy(() => import('./tabs/ResultsTab').then(m => ({ default: m.ResultsTab })));
const SensitivityTab = React.lazy(() => import('./tabs/SensitivityTab').then(m => ({ default: m.SensitivityTab })));
const LoanTab        = React.lazy(() => import('./tabs/LoanTab').then(m => ({ default: m.LoanTab })));

type Tab = 'inputs' | 'results' | 'sensitivity' | 'loan';

interface TabDef { id: Tab; label: string; icon: string }
const TABS: TabDef[] = [
  { id: 'inputs',      label: 'Inputs',      icon: '⚙️' },
  { id: 'results',     label: 'Results',     icon: '📊' },
  { id: 'sensitivity', label: 'Sensitivity', icon: '🎯' },
  { id: 'loan',        label: 'Loan',        icon: '🏦' },
];

// ── GNMI Logo ─────────────────────────────────────────────────────────────────
function GnmiLogo() {
  return (
    <div style={{
      background: 'white', borderRadius: 10, padding: '5px 10px',
      display: 'flex', alignItems: 'baseline', gap: 0,
      boxShadow: '0 2px 10px rgba(0,0,0,0.25)', userSelect: 'none', lineHeight: 1,
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 20, fontWeight: 900, color: '#1F3864', letterSpacing: '-1px', fontFamily: 'Georgia, serif' }}>G</span>
      <span style={{ fontSize: 20, fontWeight: 900, color: '#2563eb', letterSpacing: '-1px', fontFamily: 'Georgia, serif' }}>N</span>
      <span style={{ fontSize: 20, fontWeight: 900, color: '#1F3864', letterSpacing: '-1px', fontFamily: 'Georgia, serif' }}>M</span>
      <span style={{ fontSize: 20, fontWeight: 900, color: '#1F3864', letterSpacing: '-1px', fontFamily: 'Georgia, serif' }}>I</span>
    </div>
  );
}

// ── Editable inline field ─────────────────────────────────────────────────────
function EditableField({
  value, onChange, placeholder,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false); }}
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(137,207,240,0.5)',
          borderRadius: 4,
          color: 'white',
          fontSize: 13,
          padding: '4px 8px',
          outline: 'none',
          minWidth: 100,
          minHeight: 36,
          width: '100%',
          maxWidth: 200,
        }}
      />
    );
  }
  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{
        cursor: 'text', color: 'rgba(255,255,255,0.85)', fontSize: 12,
        padding: '4px 6px', borderRadius: 4,
        borderBottom: '1px dashed rgba(137,207,240,0.35)',
        display: 'inline-block', minHeight: 28,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.background = 'transparent'; }}
    >
      {value || <em style={{ opacity: 0.45 }}>{placeholder}</em>}
    </span>
  );
}

// ── Tab loading fallback ──────────────────────────────────────────────────────
function TabSpinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
      <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>Loading…</span>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab]               = React.useState<Tab>('inputs');
  const [inputs, setInputs]                     = React.useState<InputState>(defaultInputs);
  const [projectName, setProjectName]           = React.useState('GNMI Laundry Branch');
  const [projectLocation, setProjectLocation]   = React.useState('Location TBD');
  const [downloading, setDownloading]           = React.useState(false);
  const [pdfDownloading, setPdfDownloading]     = React.useState(false);
  const [shareOpen, setShareOpen]               = React.useState(false);
  const [urlLoaded, setUrlLoaded]               = React.useState(false);

  // Load shared state from URL
  React.useEffect(() => {
    const payload = decodeStateFromUrl();
    if (payload) {
      setInputs(payload.inputs);
      setProjectName(payload.projectName);
      setProjectLocation(payload.projectLocation);
      setUrlLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(patch: Partial<InputState>) {
    setInputs(prev => ({ ...prev, ...patch }));
  }

  function handleDownload() {
    setDownloading(true);
    setTimeout(() => {
      try { downloadExcel(inputs, projectName); }
      finally { setDownloading(false); }
    }, 10);
  }

  function handlePdfDownload() {
    setPdfDownloading(true);
    setTimeout(() => {
      try { downloadPdf(inputs, projectName, projectLocation); }
      finally { setPdfDownloading(false); }
    }, 10);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ════════════════════════════════════════════════════════════════
          STICKY HEADER
      ════════════════════════════════════════════════════════════════ */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 4px 20px rgba(31,56,100,0.4)' }}>

        {/* ── Top bar: logo + brand + status ── */}
        <div className="header-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <GnmiLogo />
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'var(--white)', fontSize: 15, fontWeight: 700, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Nortkem Loan &amp; Investment Analysis
              </div>
              <div style={{ color: 'rgba(137,207,240,0.75)', fontSize: 11 }}>
                Global Nortkem Marketing Inc. · v1.0
              </div>
            </div>
          </div>
          <div className="header-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(137,207,240,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Model Status</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#4ade80' }}>● Live</div>
          </div>
        </div>

        {/* ── Project info bar ── */}
        <div className="header-projectbar">
          <span style={{ fontSize: 10, color: 'rgba(137,207,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 6, flexShrink: 0 }}>Project</span>
          <div className="project-field-wrap">
            <EditableField value={projectName} onChange={setProjectName} placeholder="Project name" />
          </div>
          <span className="project-sep" style={{ color: 'rgba(137,207,240,0.25)', margin: '0 8px', fontSize: 14 }}>|</span>
          <span style={{ fontSize: 10, color: 'rgba(137,207,240,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 6, flexShrink: 0 }}>Location</span>
          <div className="project-field-wrap">
            <EditableField value={projectLocation} onChange={setProjectLocation} placeholder="Location" />
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(137,207,240,0.3)', flexShrink: 0 }}>✎ tap to edit</span>
        </div>

        {/* ── Tab nav + action buttons ── */}
        <nav className="header-nav">
          <div className="tabs-list">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn${active ? ' active' : ''}`}
                >
                  <span style={{ fontSize: 15 }}>{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="action-btns">
            {/* Share */}
            <button
              onClick={() => setShareOpen(true)}
              className="action-btn"
              title="Share this model"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', border: '1px solid #4c1d95', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }}
            >
              <span style={{ fontSize: 15 }}>📤</span>
              <span className="btn-label">Share</span>
            </button>

            {/* PDF */}
            <button
              onClick={handlePdfDownload}
              disabled={pdfDownloading}
              className="action-btn"
              title="Export PDF report"
              style={{ background: pdfDownloading ? '#1e3a6e' : 'linear-gradient(135deg, #1F3864 0%, #2a4d9e 100%)', border: '1px solid #0f2040', boxShadow: '0 2px 8px rgba(31,56,100,0.5)', opacity: pdfDownloading ? 0.75 : 1, cursor: pdfDownloading ? 'wait' : 'pointer' }}
            >
              <span style={{ fontSize: 15 }}>{pdfDownloading ? '⏳' : '📄'}</span>
              <span className="btn-label">{pdfDownloading ? 'Generating…' : 'PDF'}</span>
            </button>

            {/* Excel */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="action-btn"
              title="Export Excel"
              style={{ background: downloading ? '#15803d' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', border: '1px solid #14532d', boxShadow: downloading ? 'none' : '0 2px 8px rgba(22,163,74,0.4)', opacity: downloading ? 0.75 : 1, cursor: downloading ? 'wait' : 'pointer' }}
            >
              <span style={{ fontSize: 15 }}>{downloading ? '⏳' : '📥'}</span>
              <span className="btn-label">{downloading ? '…' : 'Excel'}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Shared URL banner ── */}
      {urlLoaded && (
        <div style={{ background: 'linear-gradient(90deg, #7c3aed22, #6d28d911)', borderBottom: '1px solid #7c3aed33', padding: '7px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#5b21b6' }}>
          <span><strong>✅ Shared model loaded</strong> — inputs restored from the shared link.</span>
          <button onClick={() => setUrlLoaded(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#7c3aed', padding: '0 4px', minHeight: 'unset' }}>✕</button>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="main-content" style={{ flex: 1, padding: '20px 24px', maxWidth: 1400, width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
        {activeTab === 'inputs' && (
          <InputsTab inputs={inputs} onChange={handleChange} />
        )}
        {activeTab !== 'inputs' && (
          <React.Suspense fallback={<TabSpinner />}>
            {activeTab === 'results'     && <ResultsTab     inputs={inputs} />}
            {activeTab === 'sensitivity' && <SensitivityTab inputs={inputs} />}
            {activeTab === 'loan'        && <LoanTab        inputs={inputs} />}
          </React.Suspense>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: '#172a55', borderTop: '1px solid rgba(137,207,240,0.1)', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        <span style={{ color: 'rgba(137,207,240,0.4)', fontSize: 11 }}>Global Nortkem Marketing Inc. · Confidential</span>
        <span style={{ color: 'rgba(137,207,240,0.3)', fontSize: 11 }}>{projectName} · {projectLocation}</span>
      </footer>

      {/* ── Modals / overlays ── */}
      {shareOpen && (
        <ShareModal inputs={inputs} projectName={projectName} projectLocation={projectLocation} onClose={() => setShareOpen(false)} />
      )}
      <InstallPrompt />
    </div>
  );
}
