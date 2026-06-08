import { useState, useEffect } from 'react'
import categoryService from '../services/categoryService.js'

const COLOR_OPTIONS = [
  'oklch(0.65 0.14 155)',
  'oklch(0.70 0.15 50)',
  'oklch(0.60 0.14 220)',
  'oklch(0.55 0.16 300)',
  'oklch(0.55 0.18 265)',
  'oklch(0.62 0.15 340)',
  'oklch(0.62 0.14 165)',
  'oklch(0.70 0.12 85)',
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

function CategoryCard({ cat, onAddRule, onDelete }) {
  const color = cat.color || COLOR_OPTIONS[0]
  const rules = cat.keywords || []

  return (
    <div className="card" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: `color-mix(in oklch, ${color} 20%, transparent)`,
            display: 'grid', placeItems: 'center',
          }}>
            <span style={{
              background: color,
              width: 16, height: 16,
              borderRadius: 5,
              display: 'block',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>{cat.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {cat.transactions ?? 0} transactions this month
            </div>
          </div>
        </div>
        <button
          className="icon-btn"
          style={{ width: 28, height: 28, border: 'none' }}
          onClick={() => onDelete(cat._id)}
          title="Delete category"
        >
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
        {rules.map(rule => (
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
          onClick={() => onAddRule(cat._id, rules)}
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
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showNewModal, setShowNewModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[4])

  // Naloži kategorije iz backenda ob mountu
  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      setLoading(true)
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (err) {
      setError('Could not load categories.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRule(catId, currentRules) {
    const rule = window.prompt('Enter a keyword (e.g. merchant name):')
    if (!rule?.trim()) return
    const updatedKeywords = [...currentRules, rule.trim()]
    try {
      const updated = await categoryService.update(catId, { keywords: updatedKeywords })
      setCategories(prev => prev.map(c => c._id === catId ? updated : c))
    } catch (err) {
      console.error('Failed to add rule:', err)
    }
  }

  async function handleDelete(catId) {
    if (!window.confirm('Delete this category?')) return
    try {
      await categoryService.remove(catId)
      setCategories(prev => prev.filter(c => c._id !== catId))
    } catch (err) {
      console.error('Failed to delete category:', err)
    }
  }

  async function handleNewCategory() {
    if (!newName.trim()) return
    try {
      const created = await categoryService.create({ name: newName.trim(), color: newColor })
      setCategories(prev => [...prev, created])
      setNewName('')
      setNewColor(COLOR_OPTIONS[4])
      setShowNewModal(false)
    } catch (err) {
      console.error('Failed to create category:', err)
    }
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

      {/* States */}
      {loading && <p style={{ color: 'var(--text-3)' }}>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Grid */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {categories.map(cat => (
            <CategoryCard
              key={cat._id}
              cat={cat}
              onAddRule={handleAddRule}
              onDelete={handleDelete}
            />
          ))}
          {categories.length === 0 && (
            <p style={{ color: 'var(--text-3)', gridColumn: '1/-1' }}>No categories yet. Create one!</p>
          )}
        </div>
      )}

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
                onKeyDown={e => e.key === 'Enter' && handleNewCategory()}
              />
            </div>

            <div className="field" style={{ marginBottom: 4 }}>
              <label className="field-label">Colour</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLOR_OPTIONS.map(color => (
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