import { useEffect, useRef, useState } from 'react'
import { CSV_TEMPLATE } from '../services/importService.js'

const PREVIEW_LIMIT = 6
const MAX_SIZE_MB = 5

// ... keep Ic, downloadTemplate, monthLabel as before ...
function Ic({ name, size = 16 }) {
  const s = { width: size, height: size }
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'cloud':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/></svg>
    case 'upload':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    case 'check':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><polyline points="20 6 9 17 4 12"/></svg>
    case 'sparkles':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/></svg>
    case 'file':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    case 'trash':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
    case 'shield':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    default:
      return null
  }
}
function monthLabel(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('sl-SI', { month: 'long', year: 'numeric' })
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'financetracker_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function Import() {
  const [parsed, setParsed] = useState(null) // now holds server response + meta
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [history, setHistory] = useState([])
  const [toast, setToast] = useState(null)
  const [historyKey, setHistoryKey] = useState(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const url = `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/import/history`
    const token = localStorage.getItem('authToken')
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.history) {
          setHistory(data.history.map((h) => ({
            id: h._id,
            batchId: h.importBatchId,
            fileName: h.fileName,
            rows: h.importedRecords,
            failed: h.failedRecords,
            status: h.status,
            date: h.createdAt ? new Date(h.createdAt).toLocaleDateString('sl-SI') : '',
          })))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [historyKey])

  function showToast(text, tone = 'good') {
    setToast({ text, tone })
    setTimeout(() => setToast(null), 2500)
  }

  // Build a summary object from server items
  function buildSummary(fileName, items) {
    const total = items.length
    const duplicates = items.filter((i) => i.duplicate).length // server may include duplicate flag
    const fresh = total - duplicates
    const dates = items.map((i) => i.date).filter(Boolean).map((d) => new Date(d))
    const dateFrom = dates.length ? new Date(Math.min(...dates)).toISOString().slice(0, 10) : ''
    const dateTo = dates.length ? new Date(Math.max(...dates)).toISOString().slice(0, 10) : ''
    return { total, duplicates, fresh, dateFrom, dateTo }
  }

  async function handleFile(file) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Samo CSV datoteke so podprte', 'bad')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`Datoteka je prevelika (max ${MAX_SIZE_MB} MB)`, 'bad')
      return
    }
    setParsing(true)
    try {
      const urlBase = import.meta.env.VITE_API_URL
      if (!urlBase) throw new Error('API URL not configured')
      const url = `${urlBase.replace(/\/$/, '')}/import/csv`

      const fd = new FormData()
      fd.append('file', file)

      const token = localStorage.getItem('authToken')
      const res = await fetch(url, {
        method: 'POST',
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!res.ok) {
        const text = await res.text().catch(() => null)
        throw new Error(text || `Server returned ${res.status}`)
      }

      const data = await res.json()
      const items = data.transactions ?? data

      // Normalize items: ensure each has id, date (ISO), desc, amount, category, isSub, type, duplicate flag
      const normalized = items.map((it, idx) => ({
        id: it.id ?? `${Date.now()}-${idx}`,
        date: it.date ?? '',
        desc: it.description ?? it.description === '' ? it.description : it.desc ?? '',
        amount: typeof it.amount === 'number' ? it.amount : Number(it.amount) || 0,
        amountRaw: it.amount,
        category: it.cat ?? it.category ?? '',
        type: it.type ?? '',
        isSub: !!it.isSub,
        duplicate: !!it.duplicate,
      }))

      const summary = buildSummary(file.name, normalized)

      setParsed({
        fileName: file.name,
        columns: { date: 'Datum', desc: 'Opis transakcije', amount: 'Znesek', currency: 'EUR (privzeto)' },
        items: normalized,
        summary,
      })
    } catch (err) {
      showToast(err.message || 'Napaka pri branju datoteke', 'bad')
    } finally {
      setParsing(false)
    }
  }

  function onInputChange(e) {
    handleFile(e.target.files?.[0])
    e.target.value = '' // allow reselect same file
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  function reset() {
    setParsed(null)
  }

  // Editable fields handlers
  function updateItem(id, patch) {
    setParsed((p) => {
      if (!p) return p
      const items = p.items.map((it) => (it.id === id ? { ...it, ...patch } : it))
      return { ...p, items, summary: buildSummary(p.fileName, items) }
    })
  }

  async function confirmImport() {
    if (!parsed) return
    setImporting(true)
    try {
      const url = `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/import/confirm`
      const token = localStorage.getItem('authToken')
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fileName: parsed.fileName,
          transactions: parsed.items,
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => null)
        throw new Error(text || `Server returned ${res.status}`)
      }
      showToast(`Uvoženih ${parsed.summary.fresh} transakcij`)
      setParsed(null)
      setHistoryKey((k) => k + 1)
    } catch {
      showToast('Uvoz ni uspel', 'bad')
    } finally {
      setImporting(false)
    }
  }

  async function deleteImport(batchId) {
    if (!window.confirm('Izbriši ta uvoz in vse transakcije iz njega?')) return
    try {
      const url = `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/import/${batchId}`
      const token = localStorage.getItem('authToken')
      const res = await fetch(url, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Delete failed')
      showToast('Uvoz izbrisan')
      setHistoryKey((k) => k + 1)
    } catch {
      showToast('Brisanje ni uspelo', 'bad')
    }
  }

  const hasFile = !!parsed
  const steps = [
    { n: 1, label: 'Upload file',          done: hasFile, active: !hasFile },
    { n: 2, label: 'Map columns',          done: hasFile, active: false },
    { n: 3, label: 'Review & categorize',  done: false,   active: hasFile },
    { n: 4, label: 'Confirm import',       done: false,   active: false },
  ]

  return (
    <div className="import-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Import bank statement</h1>
          <p className="page-sub">Upload a CSV from your bank. We'll categorize transactions automatically.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {steps.map((s) => (
          <span key={s.n} className={`step-pill ${s.done ? 'done' : ''} ${s.active ? '' : !s.done ? 'todo' : ''}`}>
            <span className="step-pill-num">{s.done ? <Ic name="check" size={11} /> : s.n}</span>
            {s.label}
          </span>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 360px', gap: 16 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div
              className={`dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="dropzone-icon"><Ic name="cloud" size={26} /></div>
              <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 4 }}>
                {parsing ? 'Parsing…' : 'Drag & drop your statement here'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 18 }}>
                Supports CSV files up to {MAX_SIZE_MB} MB · OFX coming soon
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button type="button" className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={parsing}>
                  <Ic name="upload" size={15} /> Browse files
                </button>
                <button type="button" className="btn btn-ghost" onClick={downloadTemplate}>
                  View CSV template
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={onInputChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {hasFile && (
            <>
              <div className="card">
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Map your columns</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-3)' }}>
                    Server-provided mapping from <span className="mono" style={{ color: 'var(--text-2)' }}>{parsed.fileName}</span>
                  </p>
                </div>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  {[
                    ['Date column', parsed.columns.date],
                    ['Description', parsed.columns.desc],
                    ['Amount', parsed.columns.amount],
                    ['Currency', parsed.columns.currency],
                  ].map(([label, src]) => (
                    <div key={label} style={{ padding: 12, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface-2)' }}>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{src || '—'}</span>
                        {src
                          ? <span className="chip good"><Ic name="check" size={11} /> Detected</span>
                          : <span className="chip warn">Missing</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '18px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                      Preview · first {Math.min(PREVIEW_LIMIT, parsed.items.length)} of {parsed.summary.total} rows
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-3)' }}>
                      Server-categorized · {parsed.summary.duplicates} duplicate{parsed.summary.duplicates === 1 ? '' : 's'} flagged
                    </p>
                  </div>
                </div>

                {/* Editable table */}
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Description</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th><th>Sub?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.items.slice(0, PREVIEW_LIMIT).map((r) => (
                      <tr key={r.id} style={r.duplicate ? { opacity: 0.5 } : undefined}>
                        <td className="mono" style={{ color: 'var(--text-3)', fontSize: 13 }}>
                          <input
                            type="date"
                            value={r.date ? r.date.slice(0, 10) : ''}
                            onChange={(e) => updateItem(r.id, { date: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                          />
                        </td>
                        <td style={{ fontSize: 12.5 }}>
                          <input
                            type="text"
                            value={r.desc || ''}
                            onChange={(e) => updateItem(r.id, { desc: e.target.value })}
                            style={{ width: '100%' }}
                          />
                          {r.duplicate && <span className="chip warn" style={{ marginLeft: 8 }}>duplicate</span>}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={r.category || ''}
                            onChange={(e) => updateItem(r.id, { category: e.target.value })}
                          />
                        </td>
                        <td className="col-amt" style={{ color: r.amount > 0 ? 'var(--good)' : 'var(--text)', textAlign: 'right' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={Number.isFinite(r.amount) ? r.amount : ''}
                            onChange={(e) => updateItem(r.id, { amount: parseFloat(e.target.value) || 0 })}
                            style={{ width: 100, textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={!!r.isSub}
                            onChange={(e) => updateItem(r.id, { isSub: e.target.checked })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                    {parsed.summary.fresh} new · {parsed.summary.duplicates} duplicate{parsed.summary.duplicates === 1 ? '' : 's'} will be skipped
                  </span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={reset} disabled={importing}>Cancel</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={confirmImport} disabled={importing}>
                      {importing ? 'Importing…' : `Import ${parsed.summary.fresh} transactions →`}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {hasFile && (
            <div className="card">
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Import summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  ['File', <span className="mono" key="f">{parsed.fileName}</span>],
                  ['Rows detected', String(parsed.summary.total)],
                  ['New transactions', <span key="n" style={{ color: 'var(--good)', fontWeight: 600 }}>{parsed.summary.fresh}</span>],
                  ['Duplicates', <span key="d" style={{ color: 'var(--warn)', fontWeight: 600 }}>{parsed.summary.duplicates}</span>],
                  ['Date range', `${parsed.summary.dateFrom} → ${parsed.summary.dateTo}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, gap: 12 }}>
                    <span style={{ color: 'var(--text-3)' }}>{k}</span>
                    <span style={{ fontWeight: 500, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Recent imports</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 8 }}>
                  <Ic name="file" size={28} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>No imports yet</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>Upload a CSV file to get started</div>
                </div>
              ) : (
                history.map((h) => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--line-2)', borderRadius: 9, background: 'var(--surface-2)' }}>
                    <Ic name="file" size={16} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.fileName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{h.date} · {h.rows} uvoženih{h.failed > 0 ? ` · ${h.failed} napak` : ''}</div>
                    </div>
                    <span className={`chip ${h.status === 'completed' ? 'good' : h.status === 'partial' ? 'warn' : 'good'}`}>
                      {h.status === 'completed' ? 'Done' : h.status === 'partial' ? 'Partial' : 'Done'}
                    </span>
                    {h.batchId && (
                      <button
                        type="button"
                        onClick={() => deleteImport(h.batchId)}
                        title="Izbriši uvoz"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--bad, #e55)'; e.currentTarget.style.background = 'var(--surface)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none' }}
                      >
                        <Ic name="trash" size={13} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card" style={{ background: 'var(--surface-2)', borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Ic name="shield" size={18} />
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Your data stays private</div>
                Statements are processed on-device where possible and encrypted at rest. Delete any time.
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.tone === 'bad' ? 'bad' : ''}`}>{toast.text}</div>}
    </div>
  )
}
