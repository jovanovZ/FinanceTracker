import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../services/api.js'

const palette = [
  { color: '#2fb673', soft: '#ddf8ea' },
  { color: '#f28a42', soft: '#ffeadc' },
  { color: '#1aa9c8', soft: '#d9f3f8' },
  { color: '#8b5dc7', soft: '#ede4fb' },
  { color: '#c35ca7', soft: '#f6e2f1' },
]

const categoryColorMap = {}
function colorForCategory(category) {
  if (!categoryColorMap[category]) {
    const index = Object.keys(categoryColorMap).length % palette.length
    categoryColorMap[category] = palette[index]
  }
  return categoryColorMap[category]
}

function makeFmt(currency = 'EUR') {
  return (amount) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
}

function icon(name) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (name === 'sparkle') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
        <path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3z" />
        <path d="M19 15l.8 2.4L22 18l-2.2.6L19 21l-.8-2.4L16 18l2.2-.6L19 15z" />
      </svg>
    )
  }

  if (name === 'trash') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </svg>
    )
  }

  return (
    <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function budgetTone(percent) {
  if (percent > 100) return { label: 'Over budget', className: 'danger', bar: '#e34b4b' }
  if (percent >= 85) return { label: 'Close to limit', className: 'warning', bar: '#e5a500' }
  return { label: 'On track', className: 'success', bar: '#27a96b' }
}

function BudgetCard({ budget, onDelete, fmt }) {
  const percent = Math.round((budget.spent / budget.limit) * 100)
  const remaining = budget.limit - budget.spent
  const tone = budgetTone(percent)
  const { color, soft } = colorForCategory(budget.category)

  return (
    <article className="budget-card">
      <div className="budget-card-head">
        <div className="budget-name-row">
          <span className="budget-category-icon" style={{ background: soft, color }}>
            <span style={{ background: color }} />
          </span>
          <div>
            <h3>{budget.category}</h3>
            <p>{budget.month ? new Date(budget.month).toLocaleString('default', { month: 'long', year: 'numeric' }) : new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`budget-status ${tone.className}`}>{tone.label}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px', color: '#999' }}
            onClick={() => onDelete(budget.id)}
            aria-label={`Delete ${budget.category} budget`}
          >
            {icon('trash')}
          </button>
        </div>
      </div>

      <div className="budget-amount-row">
        <div>
          <strong>{fmt(budget.spent)}</strong>
          <span>/ {fmt(budget.limit)}</span>
        </div>
        <b className={percent > 100 ? 'danger-text' : ''}>{percent}%</b>
      </div>

      <div className="budget-progress" aria-label={`${budget.category} budget progress`}>
        <span style={{ width: `${Math.min(percent, 100)}%`, background: tone.bar }} />
      </div>

      <div className="budget-meta-row">
        <span className={remaining < 0 ? 'danger-text' : ''}>
          {remaining < 0 ? `${fmt(Math.abs(remaining))} over` : `${fmt(remaining)} remaining`}
        </span>
        <span>Rolls over monthly</span>
      </div>
    </article>
  )
}

export default function Budgets() {
  const { user } = useAuth()
  const fmt = makeFmt(user?.currency ?? 'EUR')
  const [report, setReport] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set())
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set())

  const [form, setForm] = useState({ name: '', limit: '', spent: '', paletteIndex: 0 })

  function dismissSuggestion(categoryName) {
    setDismissedSuggestions((prev) => new Set([...prev, categoryName]))
  }

  const currentMonthParam = new Date().toISOString().slice(0, 7)

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.get(`/budgets/report?month=${currentMonthParam}`)
      setReport(data.report ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentMonthParam])

  const fetchSuggestions = useCallback(async () => {
    try {
      const data = await apiClient.get('/budgets/suggestions')
      setSuggestions(data ?? [])
    } catch {
    }
  }, [])

  useEffect(() => {
    fetchReport()
    fetchSuggestions()
  }, [fetchReport, fetchSuggestions])

  const totalSpent = report.reduce((sum, b) => sum + b.spent, 0)
  const totalLimit = report.reduce((sum, b) => sum + b.limit, 0)
  const overallPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0

  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = daysInMonth - now.getDate()
  const remaining = totalLimit - totalSpent
  const dailyAllowance = daysLeft > 0 ? Math.round(remaining / daysLeft) : 0

  const daysPassed = now.getDate()
  const projected = daysPassed > 0 ? Math.round((totalSpent / daysPassed) * daysInMonth) : totalSpent
  const projectedDiff = totalLimit - projected

  async function applySuggestion(suggestion) {
    const existing = report.find(
      (b) => b.category === suggestion.category,
    )
    const suggestedLimit = Math.round(suggestion.averagePerMonth * 1.15)
    try {
      if (existing) {
        await apiClient.put(`/budgets/${existing.id}`, { limit: suggestedLimit })
      } else {
        await apiClient.post('/budgets', {
          category: suggestion.category,
          limit: suggestedLimit,
          month: currentMonthParam,
        })
      }
      setAppliedSuggestions((prev) => new Set([...prev, suggestion.category]))
      fetchReport()
    } catch (err) {
      alert(`Could not apply suggestion: ${err.message}`)
    }
  }

  async function deleteBudget(id) {
    if (!window.confirm('Delete this budget?')) return
    try {
      await apiClient.delete(`/budgets/${id}`)
      setReport((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      alert(`Could not delete budget: ${err.message}`)
    }
  }

  function openNewBudget() {
    setForm({ name: '', limit: '', spent: '', paletteIndex: 0 })
    setModalOpen(true)
  }

  async function addBudget(event) {
    event.preventDefault()
    const category = form.name.trim()
    const limit = Number(form.limit)
    if (!category || !Number.isFinite(limit) || limit <= 0) return

    try {
      await apiClient.post('/budgets', {
        category,
        limit,
        month: currentMonthParam,
      })
      setModalOpen(false)
      fetchReport()
    } catch (err) {
      alert(`Could not create budget: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="budgets-page">
        <p style={{ padding: '2rem', color: '#888' }}>Loading budgets…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="budgets-page">
        <p style={{ padding: '2rem', color: '#e34b4b' }}>Error: {error}</p>
        <button className="btn btn-primary btn-sm" onClick={fetchReport}>Retry</button>
      </div>
    )
  }

  return (
    <div className="budgets-page">
      <div className="page-head budget-page-head">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-sub">Set monthly limits and track how you're tracking against them.</p>
        </div>
        <div className="page-actions" style={{ height: '44px', display: 'inline-flex', gap: 20 }}>
          <button type="button" className="btn btn-ghost btn-sm" style={{ height: '36px', display:'inline-flex' }} onClick={() => setDismissedSuggestions(new Set())}>
            {icon('sparkle')}
            <span>Suggest limits</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" style={{ height: '36px', display: 'inline-flex'}} onClick={openNewBudget}>
            {icon('plus')}
            <span>New budget</span>
          </button>
        </div>
      </div>

      <section className="budget-overview card">
        <div className="budget-overview-main">
          <p>Overall — {now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          <div className="budget-overview-amount">
            <strong>{fmt(totalSpent)}</strong>
            <span>of {fmt(totalLimit)} planned</span>
          </div>
          <div className="budget-overview-progress">
            <span style={{ width: `${Math.min(overallPercent, 100)}%` }} />
          </div>
          <div className="budget-overview-foot">
            <span>{overallPercent}% of monthly plan</span>
            <span>{daysLeft} days left in month</span>
          </div>
        </div>

        <div className="budget-summary">
          <p>Remaining</p>
          <strong className={remaining >= 0 ? 'positive' : 'danger-text'}>{fmt(remaining)}</strong>
          <span>~{fmt(dailyAllowance)}/day</span>
        </div>

        <div className="budget-summary">
          <p>Projected end-of-month</p>
          <strong>{fmt(projected)}</strong>
          <span className={`budget-pill ${projectedDiff >= 0 ? 'success' : 'danger'}`}>
            {projectedDiff >= 0 ? `Under plan by ${fmt(projectedDiff)}` : `Over plan by ${fmt(Math.abs(projectedDiff))}`}
          </span>
        </div>
      </section>

      {report.length === 0 ? (
        <p style={{ padding: '1rem', color: '#888' }}>No budgets for this month yet. Create one above.</p>
      ) : (
        <section className="budget-grid">
          {report.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onDelete={deleteBudget} fmt={fmt} />
          ))}
        </section>
      )}

      {suggestions.filter((s) => !dismissedSuggestions.has(s.category || s._id)).slice(0, 3).map((s) => {
        const categoryName = s.category || s._id
        const avg = s.averagePerMonth
        const suggested = Math.round(avg * 1.15)
        const applied = appliedSuggestions.has(categoryName)
        return (
          <section className="budget-suggestion" key={categoryName}>
            <div className="budget-suggestion-icon">{icon('sparkle')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3>Suggested: set a {categoryName} budget of {fmt(suggested)}</h3>
              <p>Your 3-month average is {fmt(avg)}. A {fmt(suggested)} limit gives breathing room without overspending.</p>
            </div>
              <div className="page-actions" style={{ height: '44px', display: 'inline-flex', gap: 20 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => applySuggestion({ ...s, category: categoryName })}
                disabled={applied}
              >
                {applied ? 'Applied' : 'Apply suggestion'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => dismissSuggestion(categoryName)}>
                Dismiss
              </button>
            </div>
          </section>
        )
      })}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form className="modal budget-modal" onSubmit={addBudget} onClick={(e) => e.stopPropagation()}>
            <h3>New budget</h3>
            <p className="modal-sub">Create a monthly limit for a category.</p>

            <label className="field">
              <span className="field-label">Category name</span>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                placeholder="Coffee, Pets, Travel…"
                autoFocus
              />
            </label>

            <label className="field">
              <span className="field-label">Monthly limit (€)</span>
              <input
                className="input"
                type="number"
                min="1"
                value={form.limit}
                onChange={(e) => setForm((c) => ({ ...c, limit: e.target.value }))}
                placeholder="200"
              />
            </label>

            <div className="field">
              <span className="field-label">Color</span>
              <div className="budget-color-picker">
                {palette.map((item, index) => (
                  <button
                    key={item.color}
                    type="button"
                    className={Number(form.paletteIndex) === index ? 'active' : ''}
                    style={{ background: item.color }}
                    aria-label={`Use color ${index + 1}`}
                    onClick={() => setForm((c) => ({ ...c, paletteIndex: index }))}
                  />
                ))}
              </div>
            </div>

            <div className="page-actions" style={{ height: '44px', display: 'inline-flex', gap: 20 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Create budget
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}