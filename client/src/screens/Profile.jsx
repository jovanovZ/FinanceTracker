// Profile stran (FIN-15). Prikaže osnovne podatke uporabnika, omogoča urejanje,
// menjavo gesla in upravljanje aktivnih sej. Podatki gredo skozi profileService,
// ki je za zdaj mock z localStorage.

import { useEffect, useState } from 'react'
import { getProfile, updateProfile, changePassword, terminateSession } from '../services/profileService.js'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']
const LANGUAGES = ['English', 'Slovenščina']
const TIMEZONES = ['Europe/Ljubljana', 'Europe/Berlin', 'Europe/London', 'UTC']
const WEEK_STARTS = ['Monday', 'Sunday']

const AVATAR_COLORS = {
  orange: 'linear-gradient(135deg, oklch(0.75 0.14 55), oklch(0.6 0.16 30))',
  purple: 'linear-gradient(135deg, oklch(0.72 0.17 290), oklch(0.55 0.19 265))',
  green:  'linear-gradient(135deg, oklch(0.75 0.15 155), oklch(0.6 0.16 165))',
  pink:   'linear-gradient(135deg, oklch(0.78 0.14 350), oklch(0.6 0.18 340))',
}
const AVATAR_COLOR_KEYS = Object.keys(AVATAR_COLORS)
const avatarGradient = (key) => AVATAR_COLORS[key] ?? AVATAR_COLORS.orange

function initialsOf(name) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function formatMemberSince(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

function validate(form) {
  const errors = {}
  if (!form.fullName?.trim()) errors.fullName = 'Required'
  if (!form.email?.trim()) errors.email = 'Required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email'
  return errors
}

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null) // { text, tone: 'good'|'bad' }
  const [pwModalOpen, setPwModalOpen] = useState(false)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false)
  // const [sessions, setSessions] = useState([])

  // useEffect(() => {
  //   let cancelled = false
  //   getSessions().then((s) => !cancelled && setSessions(s))
  //   return () => { cancelled = true }
  // }, [])

  async function handleTerminate(id) {
    try {
      const updatedSessions = await terminateSession(id)
      setProfile((p) => ({ ...p, sessions: updatedSessions }))
      showToast('Session terminated')
    } catch (err) {
      showToast(err.message || 'Could not terminate session', 'bad')
    }
  }

  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((p) => {
        if (cancelled) return
        setProfile(p)
        // setSessions(p.sessions)
        setForm(p)
      })
      .catch(() => showToast('Could not load profile', 'bad'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  function showToast(text, tone = 'good') {
    setToast({ text, tone })
    setTimeout(() => setToast(null), 2500)
  }

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const dirty =
    profile && form && Object.keys(form).some((k) => form[k] !== profile[k])

  async function handleSave(e) {
    e.preventDefault()
    const v = validate(form)
    if (Object.keys(v).length) {
      setErrors(v)
      return
    }
    setSaving(true)
    try {
      const updated = await updateProfile(form)
      setProfile(updated)
      setForm(updated)
      showToast('Profile saved')
    } catch {
      showToast('Save failed', 'bad')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setForm(profile)
    setErrors({})
  }

  async function handlePickAvatarColor(color) {
    if (color === profile.avatarColor) {
      setAvatarPickerOpen(false)
      return
    }
    try {
      const updated = await updateProfile({ avatarColor: color })
      setProfile(updated)
      setForm((f) => ({ ...f, avatarColor: color }))
      setAvatarPickerOpen(false)
      showToast('Avatar updated')
    } catch {
      showToast('Could not update avatar', 'bad')
    }
  }

  if (loading || !form) {
    return (
      <div>
        <div className="page-head">
          <div>
            <h1 className="page-title">Profile</h1>
            <p className="page-sub">Loading…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-sub">Your personal information and account details.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <aside className="card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div
              style={{
                width: 88, height: 88, borderRadius: '50%',
                background: avatarGradient(profile.avatarColor),
                display: 'grid', placeItems: 'center',
                color: '#fff', fontWeight: 700, fontSize: 28, marginBottom: 14,
                transition: 'background 0.2s',
              }}
            >
              {initialsOf(profile.fullName)}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{profile.fullName}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>{profile.email}</div>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-block"
              onClick={() => setAvatarPickerOpen((o) => !o)}
              aria-expanded={avatarPickerOpen}
            >
              {avatarPickerOpen ? 'Close' : 'Change avatar'}
            </button>
            {avatarPickerOpen && (
              <div
                style={{
                  display: 'flex', justifyContent: 'center', gap: 12,
                  marginTop: 14, padding: '12px 8px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line-2)',
                  borderRadius: 10, width: '100%',
                }}
              >
                {AVATAR_COLOR_KEYS.map((key) => {
                  const selected = profile.avatarColor === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePickAvatarColor(key)}
                      aria-label={`Use ${key} avatar`}
                      aria-pressed={selected}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: avatarGradient(key),
                        border: selected ? '2px solid var(--accent)' : '2px solid transparent',
                        boxShadow: selected ? '0 0 0 2px var(--surface)' : 'none',
                        cursor: 'pointer', padding: 0,
                        transition: 'transform 0.1s',
                      }}
                    />
                  )
                })}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Member since</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{formatMemberSince(profile.memberSince)}</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Plan</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{profile.plan}</div>
              </div>
            </div>
          </div>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <form className="card" onSubmit={handleSave} noValidate>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Personal info</h3>
            <div className="grid grid-2">
              <label className="field">
                <span className="field-label">Full name</span>
                <input
                  className="input"
                  value={form.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  aria-invalid={!!errors.fullName}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </label>

              <label className="field">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </label>

              <label className="field">
                <span className="field-label">Currency</span>
                <select
                  className="input"
                  value={form.currency}
                  onChange={(e) => setField('currency', e.target.value)}
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              <label className="field">
                <span className="field-label">Language</span>
                <select
                  className="input"
                  value={form.language}
                  onChange={(e) => setField('language', e.target.value)}
                >
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>

              <label className="field">
                <span className="field-label">Timezone</span>
                <select
                  className="input"
                  value={form.timezone}
                  onChange={(e) => setField('timezone', e.target.value)}
                >
                  {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>

              <label className="field">
                <span className="field-label">Week starts on</span>
                <select
                  className="input"
                  value={form.weekStart}
                  onChange={(e) => setField('weekStart', e.target.value)}
                >
                  {WEEK_STARTS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!dirty || saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancel} disabled={!dirty || saving}>
                Cancel
              </button>
            </div>
          </form>

          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Security</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SecurityRow
                title="Password"
                sub="Keep your account secure with a strong password"
                cta="Change"
                onClick={() => setPwModalOpen(true)}
              />
              <SecurityToggleRow
                title="Two-factor authentication"
                sub={twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                checked={twoFactorEnabled}
                onChange={() => setTwoFactorEnabled((v) => !v)}
              />
              <SecurityRow
                title="Active sessions"
                sub={`${(profile.sessions || []).length} ${(profile.sessions || []).length === 1 ? 'device' : 'devices'} signed in`}
                cta="Manage"
                onClick={() => setSessionsModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {pwModalOpen && (
        <ChangePasswordModal
          onClose={() => setPwModalOpen(false)}
          onSuccess={() => {
            setPwModalOpen(false)
            showToast('Password changed')
          }}
          onError={(msg) => showToast(msg, 'bad')}
        />
      )}

      {sessionsModalOpen && (
        <SessionsModal
          sessions={profile.sessions}
          onClose={() => setSessionsModalOpen(false)}
          onTerminate={handleTerminate}
        />
      )}

      {toast && <div className={`toast ${toast.tone === 'bad' ? 'bad' : ''}`}>{toast.text}</div>}
    </div>
  )
}

function SecurityToggleRow({ title, sub, checked, onChange }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 12px', border: '1px solid var(--line-2)',
        borderRadius: 10, background: 'var(--surface-2)',
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>
      </div>
      <button
        type="button"
        className="switch"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
      />
    </div>
  )
}

function SecurityRow({ title, sub, cta, onClick, disabled }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 12px', border: '1px solid var(--line-2)',
        borderRadius: 10, background: 'var(--surface-2)',
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onClick} disabled={disabled}>
        {cta}
      </button>
    </div>
  )
}

function deviceIcon(device) {
  const d = (device || '').toLowerCase()
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (d.includes('iphone') || d.includes('phone') || d.includes('android')) {
    return <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
  }
  if (d.includes('mac') || d.includes('laptop') || d.includes('macbook')) {
    return <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}><rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
}

function SessionsModal({ sessions, onClose, onTerminate }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h3>Active sessions</h3>
        <p className="modal-sub">Devices currently signed in to your account. Terminate any that look unfamiliar.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.length === 0 && (
            <div style={{ padding: 18, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              No active sessions.
            </div>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px',
                border: '1px solid var(--line-2)',
                borderRadius: 10,
                background: 'var(--surface-2)',
              }}
            >
              <div
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  display: 'grid', placeItems: 'center',
                  color: 'var(--text-2)', flexShrink: 0,
                }}
              >
                {deviceIcon(s.device)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{s.device}</span>
                  {s.current && <span className="chip good">This device</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                  {s.browser} · {s.location} · {s.lastActive}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onTerminate(s.id)}
                disabled={s.current}
                title={s.current ? "Can't terminate the current session" : 'Sign this device out'}
              >
                Terminate
              </button>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function ChangePasswordModal({ onClose, onSuccess, onError }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validateLocal() {
    const e = {}
    if (!current) e.current = 'Required'
    if (!next) e.next = 'Required'
    else if (next.length < 8) e.next = 'At least 8 characters'
    if (next !== confirm) e.confirm = 'Does not match'
    return e
  }

  async function submit(e) {
    e.preventDefault()
    const v = validateLocal()
    if (Object.keys(v).length) {
      setErrors(v)
      return
    }
    setSubmitting(true)
    try {
      await changePassword(current, next)
      onSuccess()
    } catch (err) {
      onError(err.message || 'Could not change password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <h3>Change password</h3>
        <p className="modal-sub">Enter your current password and choose a new one.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label className="field">
            <span className="field-label">Current password</span>
            <input
              type="password"
              className="input"
              value={current}
              onChange={(e) => { setCurrent(e.target.value); setErrors((x) => ({ ...x, current: undefined })) }}
              aria-invalid={!!errors.current}
              autoFocus
            />
            {errors.current && <span className="field-error">{errors.current}</span>}
          </label>

          <label className="field">
            <span className="field-label">New password</span>
            <input
              type="password"
              className="input"
              value={next}
              onChange={(e) => { setNext(e.target.value); setErrors((x) => ({ ...x, next: undefined })) }}
              aria-invalid={!!errors.next}
            />
            {errors.next && <span className="field-error">{errors.next}</span>}
          </label>

          <label className="field">
            <span className="field-label">Confirm new password</span>
            <input
              type="password"
              className="input"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((x) => ({ ...x, confirm: undefined })) }}
              aria-invalid={!!errors.confirm}
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </form>
    </div>
  )
}
