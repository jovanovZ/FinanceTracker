import { useState } from 'react'

const CATEGORIES = [
  { id: 'groceries', name: 'Groceries',        color: 'oklch(0.65 0.14 155)',
    rules: ['Lidl', 'Mercator', 'Hofer'],        transactions: 14 },
  { id: 'dining',    name: 'Dining & Cafes',    color: 'oklch(0.70 0.15 50)',
    rules: ['Čokl', 'Starbucks', 'Pizza'],       transactions: 9 },
  { id: 'transport', name: 'Transport',         color: 'oklch(0.60 0.14 220)',
    rules: ['Bolt', 'OMV', 'LPP'],              transactions: 6 },
  { id: 'housing',   name: 'Housing & Bills',   color: 'oklch(0.55 0.16 300)',
    rules: ['Elektro', 'Landlord', 'ARSO'],      transactions: 4 },
  { id: 'subs',      name: 'Subscriptions',     color: 'oklch(0.55 0.18 265)',
    rules: ['Spotify', 'Netflix', 'T-Mobile'],   transactions: 11 },
  { id: 'shopping',  name: 'Shopping',          color: 'oklch(0.62 0.15 340)',
    rules: ['Zara', 'DM', 'IKEA'],              transactions: 7 },
  { id: 'health',    name: 'Health',            color: 'oklch(0.62 0.14 165)',
    rules: ['Apotheke', 'Clinic'],               transactions: 3 },
  { id: 'leisure',   name: 'Leisure',           color: 'oklch(0.70 0.12 85)',
    rules: ['Kinodvor', 'Steam'],                transactions: 5 },
]

function DotsIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
  )
}

function PlusIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CategoryCard({ cat, onAddRule }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: `color-mix(in oklch, ${cat.color} 20%, transparent)`,
            display: 'grid', placeItems: 'center',
          }}>
            <span style={{
              background: cat.color,
              width: 16, height: 16,
              borderRadius: 5,
              display: 'block',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>{cat.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{cat.transactions} transactions this month</div>
          </div>
        </div>
        <button className="icon-btn" style={{ width: 28, height: 28, border: 'none' }}>
          <DotsIcon />
        </button>
      </div>

      {/* Auto rules */}
      <div style={{
        fontSize: 12, color: 'var(--text-3)', marginBottom: 8,
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        Auto rules
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {cat.rules.map(rule => (
          <span key={rule} style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 9px', borderRadius: 999,
            fontSize: 11, fontWeight: 600,
            background: 'var(--surface-2)', color: 'var(--text-2)',
            border: '1px solid var(--line)',
            fontFamily: 'var(--font-mono)',
          }}>
            contains &quot;{rule}&quot;
          </span>
        ))}
        <button
          type="button"
          onClick={() => onAddRule(cat.id)}
          style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 9px', borderRadius: 999,
            fontSize: 11, fontWeight: 600,
            background: 'transparent', color: 'var(--text-3)',
            border: '1px dashed var(--line)',
            cursor: 'pointer',
          }}
        >
          + add rule
        </button>
      </div>
    </div>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState(CATEGORIES)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('oklch(0.55 0.19 265)')

  function handleAddRule(catId) {
    const rule = window.prompt('Enter a keyword (e.g. merchant name):')
    if (!rule?.trim()) return
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, rules: [...c.rules, rule.trim()] } : c
    ))
  }

  function handleNewCategory() {
    if (!newName.trim()) return
    const id = newName.toLowerCase().replace(/\s+/g, '-')
    setCategories(prev => [...prev, {
      id,
      name: newName.trim(),
      color: newColor,
      rules: [],
      transactions: 0,
    }])
    setNewName('')
    setShowNewModal(false)
  }

  return (
    <div className="content-inner">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-sub">Organize how transactions get grouped. Add rules for auto-categorization.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowNewModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <PlusIcon size={13} /> New category
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {categories.map(cat => (
          <CategoryCard key={cat.id} cat={cat} onAddRule={handleAddRule} />
        ))}
      </div>

      {/* New category modal */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New category</h3>
            <p className="modal-sub">Give it a name and a colour.</p>

            <div className="field" style={{ marginBottom: 14 }}>
              <label className="field-label">Name</label>
              <input
                className="input"
                placeholder="e.g. Gym & Fitness"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="field" style={{ marginBottom: 4 }}>
              <label className="field-label">Colour</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  'oklch(0.65 0.14 155)',
                  'oklch(0.70 0.15 50)',
                  'oklch(0.60 0.14 220)',
                  'oklch(0.55 0.16 300)',
                  'oklch(0.55 0.18 265)',
                  'oklch(0.62 0.15 340)',
                  'oklch(0.62 0.14 165)',
                  'oklch(0.70 0.12 85)',
                ].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: color, border: 'none', cursor: 'pointer',
                      outline: newColor === color ? `3px solid ${color}` : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowNewModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleNewCategory}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}