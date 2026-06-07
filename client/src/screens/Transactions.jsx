// Transactions.jsx

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  getTransactions,
  deleteTransaction,
  deleteTransactions,
  updateTransaction,
  CATEGORIES,
  ACCOUNTS,
} from '../services/transactionService.js'
import { useTransactionModal } from '../context/TransactionsModalContext.jsx'
import { AddTransactionModal } from '../components/AddTransactionModal.jsx'

const TRANSACTION_TYPES = [
  { value: '',          label: 'All types'  },
  { value: 'income',    label: 'Income'     },
  { value: 'expense',   label: 'Expenses'   },
  { value: 'recurring', label: 'Recurring'  },
]

function fmt(n) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
}

function fmtSigned(n) {
  const s = fmt(Math.abs(n))
  if (n > 0) return `+${s}`
  if (n < 0) return `- ${s}`
  return s
}

function currentMonthLabel() {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function Ic({ name, size = 16 }) {
  const s   = { width: size, height: size }
  const str = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'search':       return <svg style={s} viewBox="0 0 24 24" {...str}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    case 'calendar':     return <svg style={s} viewBox="0 0 24 24" {...str}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'download':     return <svg style={s} viewBox="0 0 24 24" {...str}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    case 'upload':       return <svg style={s} viewBox="0 0 24 24" {...str}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    case 'plus':         return <svg style={s} viewBox="0 0 24 24" {...str}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    case 'filter':       return <svg style={s} viewBox="0 0 24 24" {...str}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
    case 'chevron-down': return <svg style={s} viewBox="0 0 24 24" {...str}><polyline points="6 9 12 15 18 9"/></svg>
    case 'dots':         return <svg style={s} viewBox="0 0 24 24" {...str}><circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/></svg>
    case 'trash':        return <svg style={s} viewBox="0 0 24 24" {...str}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
    case 'edit':         return <svg style={s} viewBox="0 0 24 24" {...str}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    case 'repeat':       return <svg style={s} viewBox="0 0 24 24" {...str}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    case 'x':            return <svg style={s} viewBox="0 0 24 24" {...str}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    case 'sort':         return <svg style={s} viewBox="0 0 24 24" {...str}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
    default: return null
  }
}

function FilterPill({ label, value, options, onChange, icon }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const display = value ? (options.find(o => (o.value ?? o) === value)?.label ?? value) : label

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', fontSize: 13, fontWeight: 500,
          border: '1px solid var(--line-2)', borderRadius: 8,
          background: value ? 'var(--accent)' : 'var(--surface)',
          color: value ? '#fff' : 'var(--text-1)',
          cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
      >
        {icon && <Ic name={icon} size={13} />}
        {display}
        <Ic name="chevron-down" size={12} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: 160, padding: '4px 0', overflow: 'hidden',
        }}>
          {options.map(opt => {
            const v = opt.value ?? opt
            const l = opt.label ?? opt
            const active = v === value || (!value && v === '')
            return (
              <button
                key={v}
                type="button"
                onClick={() => { onChange(v); setOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 14px', fontSize: 13, border: 'none', cursor: 'pointer',
                  background: active ? 'var(--surface-2)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-1)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {l}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RowMenu({ tx, onDelete, onEdit }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '4px 6px', color: 'var(--text-3)', borderRadius: 6,
          display: 'grid', placeItems: 'center',
        }}
      >
        <Ic name="dots" size={16} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 200,
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: 140, padding: '4px 0',
        }}>
          <button
            type="button"
            onClick={() => { setOpen(false); onEdit(tx) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', fontSize: 13, border: 'none', background: 'transparent', color: 'var(--text-1)', cursor: 'pointer' }}
          >
            <Ic name="edit" size={14} /> Edit
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete(tx.id) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', fontSize: 13, border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
          >
            <Ic name="trash" size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
    </div>
  )
}

export default function Transactions() {
  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')
  const [account,    setAccount]    = useState('')
  const [type,       setType]       = useState('')
  const [amountSort, setAmountSort] = useState('')
  const [items,      setItems]      = useState([])
  const [total,      setTotal]      = useState(0)
  const [pages,      setPages]      = useState(1)
  const [summary,    setSummary]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(new Set())
  const [toast,      setToast]      = useState(null)
  // Edit modal state — null means closed, otherwise holds the tx being edited
  const [editingTx,  setEditingTx]  = useState(null)

  const { openAddTransaction, refreshKey } = useTransactionModal()
  const searchTimer = useRef(null)

  function showToast(text, tone = 'good') {
    setToast({ text, tone })
    setTimeout(() => setToast(null), 2500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getTransactions({ page, search, category, account, type, amountSort, refreshKey })
      setItems(res.items)
      setTotal(res.total)
      setPages(res.pages)
      setSummary(res.summary)
      setSelected(new Set())
    } finally {
      setLoading(false)
    }
  }, [page, search, category, account, type, amountSort, refreshKey])

  useEffect(() => { load() }, [load])

  function handleSearchInput(val) {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(val)
      setPage(1)
    }, 300)
  }

  function handleFilter(key, val) {
    if (key === 'category') setCategory(val)
    if (key === 'account')  setAccount(val)
    if (key === 'type')     setType(val)
    setPage(1)
  }

  const allChecked = items.length > 0 && items.every(tx => selected.has(tx.id))
  function toggleAll() {
    if (allChecked) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map(tx => tx.id)))
    }
  }
  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleDelete(id) {
    await deleteTransaction(id)
    showToast('Transaction deleted')
    load()
  }

  async function handleBulkDelete() {
    await deleteTransactions([...selected])
    showToast(`${selected.size} transaction${selected.size > 1 ? 's' : ''} deleted`)
    setSelected(new Set())
    load()
  }

  // Called by the edit modal on submit
  async function handleEditSave(formData) {
    try {
      await updateTransaction(editingTx.id, {
        category:  formData.category,
        desc:      formData.sub,
        merchant:  formData.merchant,
        amount:    formData.amount,
        date:      formData.date,
        account:   formData.account,
        recurring: formData.recurring,
      })
      setEditingTx(null)
      showToast('Transaction updated')
      load()
    } catch {
      showToast('Failed to update transaction', 'bad')
    }
  }

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...CATEGORIES.map(c => ({ value: c, label: c }))
  ]
  const accountOptions = [
    { value: '', label: 'All accounts' },
    ...ACCOUNTS.map(a => ({ value: a, label: a }))
  ]

  return (
    <div>
      {/* Edit modal — rendered here at the top level so it's never inside overflow:hidden */}
      {editingTx && (
        <AddTransactionModal
          initialData={editingTx}
          onClose={() => setEditingTx(null)}
          onSuccess={handleEditSave}
        />
      )}

      {/* Page head */}
      <div className="page-head" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-sub">
            {total} transaction{total !== 1 ? 's' : ''} · {currentMonthLabel()}
          </p>
        </div>
        <div style={{ height: '40px', display: 'inline-flex', gap: 20 }}>
          <button type="button" className="btn btn-ghost btn-sm">
            <Ic name="download" size={14} />
            <span style={{ marginLeft: 6 }}>Export CSV</span>
          </button>
          <button type="button" className="btn btn-ghost btn-sm">
            <Ic name="upload" size={14} />
            <span style={{ marginLeft: 6 }}>Import</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={openAddTransaction}>
            <Ic name="plus" size={14} />
            <span style={{ marginLeft: 6 }}>Add transaction</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          <SummaryCard
            label="Money in"
            value={`+${fmt(summary.moneyIn)}`}
            sub={`${summary.incomeCount} income transaction${summary.incomeCount !== 1 ? 's' : ''}`}
            color="#16a34a"
          />
          <SummaryCard
            label="Money out"
            value={fmtSigned(summary.moneyOut)}
            sub={`${summary.spendCount} spending transaction${summary.spendCount !== 1 ? 's' : ''}`}
            color="#ef4444"
          />
          <SummaryCard
            label="Net change"
            value={fmtSigned(summary.netChange)}
            sub={`From ${total} transaction${total !== 1 ? 's' : ''}`}
            color={summary.netChange >= 0 ? 'var(--accent)' : '#ef4444'}
          />
        </div>
      )}

      {/* Filter bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', flex: '1 1 220px', minWidth: 180,
            border: '1px solid var(--line-2)', borderRadius: 8,
            background: 'var(--surface-2)',
          }}>
            <Ic name="search" size={14} />
            <input
              placeholder="Search merchant or description…"
              onChange={e => handleSearchInput(e.target.value)}
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--text-1)', width: '100%',
              }}
            />
          </div>

          <button
            type="button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', fontSize: 13, fontWeight: 500,
              border: '1px solid var(--accent)', borderRadius: 8,
              background: 'color-mix(in oklch, var(--accent) 12%, transparent)',
              color: 'var(--accent)', cursor: 'pointer',
            }}
          >
            <Ic name="calendar" size={13} />
            {currentMonthLabel()}
          </button>

          <FilterPill
            label="All categories"
            value={category}
            options={categoryOptions}
            onChange={v => handleFilter('category', v)}
          />
          <FilterPill
            label="All accounts"
            value={account}
            options={accountOptions}
            onChange={v => handleFilter('account', v)}
          />
          <FilterPill
            label="All types"
            value={type}
            options={TRANSACTION_TYPES}
            onChange={v => handleFilter('type', v)}
          />
          <FilterPill
            label="Amount"
            value={amountSort}
            options={[
              { value: '',     label: 'Amount'     },
              { value: 'asc',  label: 'Low → High' },
              { value: 'desc', label: 'High → Low' },
            ]}
            onChange={v => { setAmountSort(v); setPage(1) }}
          />

          <div style={{ marginLeft: 'auto' }}>
            <button
              type="button"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', fontSize: 13, fontWeight: 500,
                border: '1px solid var(--line-2)', borderRadius: 8,
                background: 'transparent', color: 'var(--text-2)',
                cursor: 'pointer',
              }}
            >
              <Ic name="filter" size={13} />
              More filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px', marginBottom: 8,
          background: 'color-mix(in oklch, var(--accent) 8%, transparent)',
          border: '1px solid color-mix(in oklch, var(--accent) 30%, transparent)',
          borderRadius: 10, fontSize: 13,
        }}>
          <span style={{ fontWeight: 600 }}>{selected.size} selected</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleBulkDelete}
            style={{ color: '#ef4444', borderColor: '#ef4444' }}
          >
            <Ic name="trash" size={13} />
            <span style={{ marginLeft: 5 }}>Delete selected</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setSelected(new Set())}
            style={{ marginLeft: 'auto' }}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'visible' }}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            Loading transactions…
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            No transactions match your filters.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 0 12px 16px', width: 36 }}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                {[
                  ['MERCHANT & DESCRIPTION', 'left'],
                  ['CATEGORY',               'left'],
                  ['ACCOUNT',                'left'],
                  ['DATE',                   'left'],
                  ['TAGS',                   'left'],
                  ['AMOUNT',                 'right'],
                  ['',                       'right'],
                ].map(([h, align]) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 8px 12px 0',
                      textAlign: align,
                      fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                      letterSpacing: 0.5, textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(tx => (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  selected={selected.has(tx.id)}
                  onToggle={() => toggleOne(tx.id)}
                  onDelete={handleDelete}
                  onEdit={setEditingTx}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 12, padding: '0 4px',
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} transactions
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </button>
            {Array.from({ length: Math.min(pages, 8) }, (_, i) => i + 1).map(p => {
              if (p > 3 && p < pages - 1 && Math.abs(p - page) > 1) {
                if (p === 4) return <span key="ellipsis" style={{ fontSize: 13, color: 'var(--text-3)', padding: '0 4px' }}>…</span>
                return null
              }
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  style={{
                    width: 34, height: 34, display: 'grid', placeItems: 'center',
                    fontSize: 13, fontWeight: p === page ? 700 : 400,
                    border: '1px solid',
                    borderColor: p === page ? 'var(--accent)' : 'var(--line-2)',
                    borderRadius: 8,
                    background: p === page ? 'var(--accent)' : 'var(--surface)',
                    color: p === page ? '#fff' : 'var(--text-1)',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              )
            })}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.tone === 'bad' ? 'bad' : ''}`}>{toast.text}</div>
      )}
    </div>
  )
}

function TxRow({ tx, selected, onToggle, onDelete, onEdit }) {
  const isIncome = tx.amount > 0

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--line-2)',
        background: selected ? 'color-mix(in oklch, var(--accent) 5%, transparent)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      {/* Checkbox */}
      <td style={{ padding: '12px 0 12px 16px', width: 36 }}>
        <input type="checkbox" checked={selected} onChange={onToggle} style={{ cursor: 'pointer' }} />
      </td>

      {/* Merchant */}
      <td style={{ padding: '12px 8px 12px 0', minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'var(--surface-2)', border: '1px solid var(--line)',
            display: 'grid', placeItems: 'center',
            fontSize: 11, fontWeight: 700, color: 'var(--text-2)', letterSpacing: 0.5,
          }}>
            {tx.initials}
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{tx.merchant}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{tx.sub}</div>
          </div>
        </div>
      </td>

      {/* Category chip */}
      <td style={{ padding: '12px 8px 12px 0' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, padding: '3px 10px', borderRadius: 20,
          background: 'var(--surface-2)', border: '1px solid var(--line-2)',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tx.catColor, display: 'block', flexShrink: 0 }} />
          {tx.category}
        </span>
      </td>

      {/* Account */}
      <td style={{ padding: '12px 8px 12px 0', fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
        {tx.account}
      </td>

      {/* Date */}
      <td style={{ padding: '12px 8px 12px 0', fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
        {tx.date}
      </td>

      {/* Tags (recurring) */}
      <td style={{ padding: '12px 8px 12px 0' }}>
        {tx.recurring && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            background: 'color-mix(in oklch, var(--accent) 12%, transparent)',
            color: 'var(--accent)', border: '1px solid color-mix(in oklch, var(--accent) 25%, transparent)',
            whiteSpace: 'nowrap',
          }}>
            <Ic name="repeat" size={10} />
            Recurring
          </span>
        )}
      </td>

      {/* Amount */}
      <td style={{
        padding: '12px 8px 12px 0', textAlign: 'right',
        fontSize: 13.5, fontWeight: 700,
        color: isIncome ? '#16a34a' : 'inherit',
        whiteSpace: 'nowrap',
      }}>
        {isIncome ? '+' : ''}{fmt(Math.abs(tx.amount))}
      </td>

      {/* Row menu */}
      <td style={{ padding: '12px 12px 12px 0', textAlign: 'right' }}>
        <RowMenu tx={tx} onDelete={onDelete} onEdit={onEdit} />
      </td>
    </tr>
  )
}