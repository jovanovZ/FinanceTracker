import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../services/profileService.js'

// Privzete vrednosti — uporabljene dokler se profil ne naloži in za starejše
// uporabnike, ki še nimajo shranjenega preferences objekta.
const DEFAULT_PREFS = {
  defaultPeriod: 'Monthly',
  numberFormat: '1.234,56 €',
  budgetAlerts: true,
  budgetThreshold: 80,
  weeklySummary: true,
  importConfirm: true,
  anomalyDetection: true,
}

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
  // prefs = trenutno stanje v formi, saved = zadnje shranjeno (za dirty tracking)
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [saved, setSaved] = useState(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Naloži shranjene nastavitve iz zaledja (GET /user/profile -> user.preferences)
  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((user) => {
        if (cancelled) return
        const merged = { ...DEFAULT_PREFS, ...(user && user.preferences ? user.preferences : {}) }
        setPrefs(merged)
        setSaved(merged)
      })
      .catch(() => showToast('Could not load settings', 'bad'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function showToast(text, tone = 'good') {
    setToast({ text, tone })
    setTimeout(() => setToast(null), 3000)
  }

  function setField(name, value) {
    setPrefs((p) => ({ ...p, [name]: value }))
  }

  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved)

  // Shrani v zaledje (PUT /user/profile { preferences })
  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateProfile({ preferences: prefs })
      const merged = { ...DEFAULT_PREFS, ...(updated && updated.preferences ? updated.preferences : prefs) }
      setSaved(merged)
      setPrefs(merged)
      showToast('Settings saved')
    } catch {
      showToast('Could not save settings', 'bad')
    } finally {
      setSaving(false)
    }
  }

  // Export / delete account še nimata zaledja — ostaneta kozmetična (izven obsega naloge).
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

      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Customize how Financely works for you.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={loading || saving || !dirty}
          // width/height/marginBottom override the global .btn-primary leak from Auth.css
          style={{ width: 'auto', height: 'auto', marginBottom: 0 }}
        >
          {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
        </button>
      </div>

      {loading ? (
        <p className="page-sub">Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Appearance ── */}
          <SettingsCard title="Appearance">
            <SettingsRow
              label="Default period"
              description="How data is grouped by default across all views."
            >
              <select
                className="input"
                value={prefs.defaultPeriod}
                onChange={e => setField('defaultPeriod', e.target.value)}
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
                value={prefs.numberFormat}
                onChange={e => setField('numberFormat', e.target.value)}
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
              description={`Notify when approaching a category limit (currently at ${prefs.budgetThreshold}%).`}
            >
              <select
                className="input"
                value={String(prefs.budgetThreshold)}
                onChange={e => setField('budgetThreshold', Number(e.target.value))}
                style={{ width: 80 }}
                disabled={!prefs.budgetAlerts}
              >
                {['60', '70', '80', '90'].map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <Toggle checked={prefs.budgetAlerts} onChange={v => setField('budgetAlerts', v)} />
            </SettingsRow>

            <SettingsRow
              label="Weekly summary"
              description="A roundup of your spending every Sunday evening."
            >
              <Toggle checked={prefs.weeklySummary} onChange={v => setField('weeklySummary', v)} />
            </SettingsRow>

            <SettingsRow
              label="New import confirmations"
              description="Ask for confirmation after each CSV upload."
            >
              <Toggle checked={prefs.importConfirm} onChange={v => setField('importConfirm', v)} />
            </SettingsRow>

            <SettingsRow
              label="Anomaly detection"
              description="Flag unusually large or out-of-pattern transactions."
              isLast
            >
              <Toggle checked={prefs.anomalyDetection} onChange={v => setField('anomalyDetection', v)} />
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
      )}
    </div>
  )
}
