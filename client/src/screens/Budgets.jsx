import { useState } from 'react'

const budgets = [
  {
    name: 'Groceries',
    spent: 247,
    limit: 320,
    change: '-EUR54 vs. last month',
    color: '#2fb673',
    soft: '#ddf8ea',
  },
  {
    name: 'Dining & Cafes',
    spent: 98,
    limit: 120,
    change: '-EUR44 vs. last month',
    color: '#f28a42',
    soft: '#ffeadc',
  },
  {
    name: 'Transport',
    spent: 168,
    limit: 150,
    change: '+EUR50 vs. last month',
    color: '#1aa9c8',
    soft: '#d9f3f8',
  },
  {
    name: 'Housing & Bills',
    spent: 584,
    limit: 620,
    change: '-EUR20 vs. last month',
    color: '#8b5dc7',
    soft: '#ede4fb',
  },
  {
    name: 'Subscriptions',
    spent: 43,
    limit: 50,
    change: '+EUR5 vs. last month',
    color: '#4f6ef7',
    soft: '#e3e9ff',
  },
  {
    name: 'Shopping',
    spent: 102,
    limit: 120,
    change: '-EUR78 vs. last month',
    color: '#c35ca7',
    soft: '#f6e2f1',
  },
  {
    name: 'Health',
    spent: 15,
    limit: 60,
    change: '-EUR25 vs. last month',
    color: '#18b987',
    soft: '#ddf8ef',
  },
  {
    name: 'Leisure',
    spent: 28,
    limit: 80,
    change: '-EUR44 vs. last month',
    color: '#c7a13c',
    soft: '#f7edcf',
  },
]

const palette = [
  { color: '#2fb673', soft: '#ddf8ea' },
  { color: '#f28a42', soft: '#ffeadc' },
  { color: '#1aa9c8', soft: '#d9f3f8' },
  { color: '#8b5dc7', soft: '#ede4fb' },
  { color: '#c35ca7', soft: '#f6e2f1' },
]

function fmt(amount) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
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

  return (
    <svg width="15" height="15" viewBox="0 0 24 24" {...stroke}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function budgetTone(percent) {
  if (percent > 100) {
    return {
      label: 'Over budget',
      className: 'danger',
      bar: '#e34b4b',
    }
  }

  if (percent >= 85) {
    return {
      label: 'Close to limit',
      className: 'warning',
      bar: '#e5a500',
    }
  }

  return {
    label: 'On track',
    className: 'success',
    bar: '#27a96b',
  }
}

function BudgetCard({ budget }) {
  const percent = Math.round((budget.spent / budget.limit) * 100)
  const remaining = budget.limit - budget.spent
  const tone = budgetTone(percent)

  return (
    <article className="budget-card">
      <div className="budget-card-head">
        <div className="budget-name-row">
          <span className="budget-category-icon" style={{ background: budget.soft, color: budget.color }}>
            <span style={{ background: budget.color }} />
          </span>
          <div>
            <h3>{budget.name}</h3>
            <p>{budget.change}</p>
          </div>
        </div>
        <span className={`budget-status ${tone.className}`}>{tone.label}</span>
      </div>

      <div className="budget-amount-row">
        <div>
          <strong>{fmt(budget.spent)}</strong>
          <span>/ {fmt(budget.limit)}</span>
        </div>
        <b className={percent > 100 ? 'danger-text' : ''}>{percent}%</b>
      </div>

      <div className="budget-progress" aria-label={`${budget.name} budget progress`}>
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
  const [budgetItems, setBudgetItems] = useState(budgets)
  const [modalOpen, setModalOpen] = useState(false)
  const [suggestionVisible, setSuggestionVisible] = useState(true)
  const [suggestionApplied, setSuggestionApplied] = useState(false)
  const [form, setForm] = useState({
    name: '',
    limit: '',
    spent: '',
    paletteIndex: 0,
  })

  const totalSpent = budgetItems.reduce((sum, budget) => sum + budget.spent, 0)
  const totalLimit = budgetItems.reduce((sum, budget) => sum + budget.limit, 0)
  const overallPercent = Math.round((totalSpent / totalLimit) * 100)

  function openNewBudget() {
    setForm({
      name: '',
      limit: '',
      spent: '',
      paletteIndex: 0,
    })
    setModalOpen(true)
  }

  function applySuggestion() {
    setBudgetItems((items) =>
      items.map((item) =>
        item.name === 'Transport'
          ? { ...item, limit: 165, change: 'Suggested limit applied' }
          : item,
      ),
    )
    setSuggestionApplied(true)
  }

  function addBudget(event) {
    event.preventDefault()
    const name = form.name.trim()
    const limit = Number(form.limit)
    const spent = Number(form.spent || 0)

    if (!name || !Number.isFinite(limit) || limit <= 0 || spent < 0) return

    const selected = palette[Number(form.paletteIndex)] ?? palette[0]
    setBudgetItems((items) => [
      {
        name,
        spent,
        limit,
        change: 'New this month',
        ...selected,
      },
      ...items,
    ])
    setModalOpen(false)
  }

  return (
    <div className="budgets-page">
      <div className="page-head budget-page-head">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-sub">Set monthly limits and track how you're tracking against them.</p>
        </div>
        <div className="budget-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSuggestionVisible(true)}>
            {icon('sparkle')}
            Suggest limits
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={openNewBudget}>
            {icon('plus')}
            New budget
          </button>
        </div>
      </div>

      <section className="budget-overview card">
        <div className="budget-overview-main">
          <p>Overall - April 2026</p>
          <div className="budget-overview-amount">
            <strong>{fmt(totalSpent)}</strong>
            <span>of {fmt(totalLimit)} planned</span>
          </div>
          <div className="budget-overview-progress">
            <span style={{ width: `${overallPercent}%` }} />
          </div>
          <div className="budget-overview-foot">
            <span>{overallPercent}% of monthly plan</span>
            <span>12 days left in month</span>
          </div>
        </div>

        <div className="budget-summary">
          <p>Remaining</p>
          <strong className="positive">{fmt(totalLimit - totalSpent)}</strong>
          <span>~EUR20/day</span>
        </div>

        <div className="budget-summary">
          <p>Projected end-of-month</p>
          <strong>{fmt(1516)}</strong>
          <span className="budget-pill success">Under plan by EUR4</span>
        </div>
      </section>

      <section className="budget-grid">
        {budgetItems.map((budget) => (
          <BudgetCard key={budget.name} budget={budget} />
        ))}
      </section>

      {suggestionVisible && (
        <section className="budget-suggestion">
          <div className="budget-suggestion-icon">{icon('sparkle')}</div>
          <div>
            <h3>
              {suggestionApplied
                ? 'Suggestion applied: Transport budget is now EUR165'
                : `Suggested: set a Transport budget of ${fmt(165)}`}
            </h3>
            <p>Your 3-month average is {fmt(142)}. A {fmt(165)} limit gives breathing room without overspending.</p>
          </div>
          <div className="budget-suggestion-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={applySuggestion} disabled={suggestionApplied}>
              {suggestionApplied ? 'Applied' : 'Apply suggestion'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSuggestionVisible(false)}>
              Dismiss
            </button>
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form className="modal budget-modal" onSubmit={addBudget} onClick={(event) => event.stopPropagation()}>
            <h3>New budget</h3>
            <p className="modal-sub">Create a monthly limit for a category.</p>

            <label className="field">
              <span className="field-label">Category name</span>
              <input
                className="input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Coffee, Pets, Travel..."
                autoFocus
              />
            </label>

            <div className="grid grid-2">
              <label className="field">
                <span className="field-label">Monthly limit</span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={form.limit}
                  onChange={(event) => setForm((current) => ({ ...current, limit: event.target.value }))}
                  placeholder="200"
                />
              </label>

              <label className="field">
                <span className="field-label">Spent so far</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.spent}
                  onChange={(event) => setForm((current) => ({ ...current, spent: event.target.value }))}
                  placeholder="0"
                />
              </label>
            </div>

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
                    onClick={() => setForm((current) => ({ ...current, paletteIndex: index }))}
                  />
                ))}
              </div>
            </div>

            <div className="modal-actions">
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
