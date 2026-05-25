import { useState } from 'react'
import { CATEGORIES, ACCOUNTS } from '../services/transactionService.js'

export function AddTransactionModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    merchant: '', sub: '', category: 'Groceries',
    account: 'NLB Checking', date: 'Apr 18', amount: '',
    type: 'expense', recurring: false,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.merchant.trim()) e.merchant = 'Required'
    if (!form.amount || isNaN(parseFloat(form.amount))) e.amount = 'Enter a valid number'
    if (!form.date.trim()) e.date = 'Required'
    return e
  }

  async function submit(e) {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) { setErrors(v); return }
    setSaving(true)
    try {
      const rawAmount = parseFloat(form.amount)
      const amount = form.type === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount)
      await onSuccess({ ...form, amount })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal wide" onClick={e => e.stopPropagation()} onSubmit={submit} noValidate>
        <h3>Add transaction</h3>
        <p className="modal-sub">Manually record a transaction to your account.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Type toggle */}
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <span className="field-label">Type</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['expense','Expense'],['income','Income']].map(([v,l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setField('type', v)}
                  style={{
                    flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600,
                    border: '1px solid var(--line-2)', borderRadius: 8, cursor: 'pointer',
                    background: form.type === v ? (v === 'income' ? '#16a34a' : 'var(--accent)') : 'var(--surface-2)',
                    color: form.type === v ? '#fff' : 'var(--text-2)',
                    transition: 'all 0.15s',
                  }}
                >{l}</button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field-label">Merchant / Description</span>
            <input className="input" value={form.merchant} onChange={e => setField('merchant', e.target.value)} aria-invalid={!!errors.merchant} />
            {errors.merchant && <span className="field-error">{errors.merchant}</span>}
          </label>

          <label className="field">
            <span className="field-label">Sub-description</span>
            <input className="input" value={form.sub} onChange={e => setField('sub', e.target.value)} placeholder="Optional" />
          </label>

          <label className="field">
            <span className="field-label">Amount (€)</span>
            <input
              className="input" type="number" step="0.01" min="0"
              value={form.amount} onChange={e => setField('amount', e.target.value)}
              aria-invalid={!!errors.amount} placeholder="0.00"
            />
            {errors.amount && <span className="field-error">{errors.amount}</span>}
          </label>

          <label className="field">
            <span className="field-label">Date</span>
            <input className="input" value={form.date} onChange={e => setField('date', e.target.value)} aria-invalid={!!errors.date} placeholder="Apr 18" />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </label>

          <label className="field">
            <span className="field-label">Category</span>
            <select className="input" value={form.category} onChange={e => setField('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Account</span>
            <select className="input" value={form.account} onChange={e => setField('account', e.target.value)}>
              {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>

          {/* Recurring toggle */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="switch"
              role="switch"
              aria-checked={form.recurring}
              aria-label="Recurring"
              onClick={() => setField('recurring', !form.recurring)}
            />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Recurring transaction</span>
          </div>
        </div>

        <div className="modal-actions" style={{ height: '44px', display: 'inline-flex', gap: 20 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Adding…' : 'Add transaction'}
          </button>
        </div>
      </form>
    </div>
  )
}