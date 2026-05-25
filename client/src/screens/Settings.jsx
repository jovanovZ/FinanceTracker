import { useState } from 'react'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: checked ? 'var(--accent)' : 'var(--line)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: checked ? 21 : 3,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

function SettingsRow({ label, description, children, isLast }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--line-2)',
      gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{description}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {children}
      </div>
    </div>
  )
}

function SettingsCard({ title, children }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>{title}</h3>
      <div>{children}</div>
    </div>
  )
}

export default function Settings() {
  // Appearance
  const [defaultPeriod, setDefaultPeriod] = useState('Monthly')
  const [numberFormat, setNumberFormat] = useState('1.234,56 €')

  // Notifications
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [budgetThreshold, setBudgetThreshold] = useState('80')
  const [weeklySummary, setWeeklySummary] = useState(true)
  const [importConfirm, setImportConfirm] = useState(true)
  const [anomalyDetection, setAnomalyDetection] = useState(true)

  // Toast for feedback
  const [toast, setToast] = useState(null)

  function showToast(text, tone = 'good') {
    setToast({ text, tone })
    setTimeout(() => setToast(null), 3000)
  }

  function handleExport() {
    showToast("Export requested — you'll receive an email shortly.")
  }

  function handleDeleteAccount() {
    if (window.confirm('Are you sure? This will permanently delete all your data and cannot be undone.')) {
      showToast('Account deletion requested. You will be logged out shortly.', 'bad')
    }
  }

  return (
    <div className="content-inner">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          background: toast.tone === 'bad' ? 'var(--bad)' : 'var(--good)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 10,
          fontSize: 13.5,
          fontWeight: 500,
          boxShadow: 'var(--shadow-lg)',
        }}>
          {toast.text}
        </div>
      )}

      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Customize how Financely works for you.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Appearance ── */}
        <SettingsCard title="Appearance">
          <SettingsRow
            label="Default period"
            description="How data is grouped by default across all views."
          >
            <select
              className="input"
              value={defaultPeriod}
              onChange={e => setDefaultPeriod(e.target.value)}
              style={{ width: 130 }}
            >
              {['Weekly', 'Monthly', 'Quarterly', 'Yearly'].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </SettingsRow>

          <SettingsRow
            label="Number format"
            description="Decimals and thousand separators used throughout the app."
            isLast
          >
            <select
              className="input"
              value={numberFormat}
              onChange={e => setNumberFormat(e.target.value)}
              style={{ width: 150 }}
            >
              {['1.234,56 €', '1,234.56 €', '€1,234.56', '1 234,56 €'].map(f => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </SettingsRow>
        </SettingsCard>

        {/* ── Notifications ── */}
        <SettingsCard title="Notifications">
          <SettingsRow
            label="Budget alerts"
            description={`Notify when approaching a category limit (currently at ${budgetThreshold}%).`}
          >
            <select
              className="input"
              value={budgetThreshold}
              onChange={e => setBudgetThreshold(e.target.value)}
              style={{ width: 80 }}
              disabled={!budgetAlerts}
            >
              {['60', '70', '80', '90'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <Toggle checked={budgetAlerts} onChange={setBudgetAlerts} />
          </SettingsRow>

          <SettingsRow
            label="Weekly summary"
            description="A roundup of your spending every Sunday evening."
          >
            <Toggle checked={weeklySummary} onChange={setWeeklySummary} />
          </SettingsRow>

          <SettingsRow
            label="New import confirmations"
            description="Ask for confirmation after each CSV upload."
          >
            <Toggle checked={importConfirm} onChange={setImportConfirm} />
          </SettingsRow>

          <SettingsRow
            label="Anomaly detection"
            description="Flag unusually large or out-of-pattern transactions."
            isLast
          >
            <Toggle checked={anomalyDetection} onChange={setAnomalyDetection} />
          </SettingsRow>
        </SettingsCard>

        {/* ── Data & privacy ── */}
        <SettingsCard title="Data & privacy">
          <SettingsRow
            label="Export all data"
            description="Download a ZIP file with all your transactions, budgets, and settings."
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleExport}
            >
              Request export
            </button>
          </SettingsRow>

          <SettingsRow
            label="Delete account"
            description="Permanently remove all your data. This cannot be undone."
            isLast
          >
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleDeleteAccount}
              style={{
                background: 'var(--bad-soft)',
                color: 'var(--bad)',
                border: '1px solid transparent',
              }}
            >
              Delete…
            </button>
          </SettingsRow>
        </SettingsCard>

      </div>
    </div>
  )
}