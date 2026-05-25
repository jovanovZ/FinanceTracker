// Dashboard.jsx
// Mockup: stat cards w/ sparklines, cash-flow chart

//buttons must be connected to the correct pages - need to be done after other pages are created
//right now are only commented out

import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getDashboardStats,
  getCashFlow,
  getSpendingByCategory,
  getBudgets,
  getRecentTransactions,
  getInsights,
} from '../services/dashboardService.js'

function fmt(n) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
}

function hour() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function Sparkline({ data = [], color = 'var(--accent)', w = 120, h = 40 }) {
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 4) - 2,
  ])
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace(/[^a-z]/gi, '')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


function Donut({ categories, total, size = 160 }) {
  const r = 58, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  let offset = 0
  const slices = categories.map((cat) => {
    const pct = total ? cat.amount / total : 0
    const dash = pct * circ
    const slice = { ...cat, dash, offset, pct }
    offset += dash
    return slice
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
      {slices.map((s) => (
        <circle
          key={s.name}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="22"
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  )
}


function CashFlowChart({ data }) {
  const W = 760, H = 220, PAD = { t: 12, r: 16, b: 36, l: 56 }
  const iW = W - PAD.l - PAD.r
  const iH = H - PAD.t - PAD.b

  if (!data.length) return null

  const allVals = data.flatMap((d) => [d.income, d.expenses])
  const maxV = Math.max(...allVals)
  const yTicks = [0, Math.round(maxV * 0.5 / 100) * 100, Math.round(maxV / 100) * 100]

  const xOf = (i) => PAD.l + (i / (data.length - 1)) * iW
  const yOf = (v) => PAD.t + iH - (v / maxV) * iH

  const lineD = (key) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(d[key]).toFixed(1)}`).join(' ')

  const areaD = (key) =>
    `${lineD(key)} L${xOf(data.length - 1)},${(PAD.t + iH).toFixed(1)} L${PAD.l},${(PAD.t + iH).toFixed(1)} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="inc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="exp-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y-axis grid + labels */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.l} y1={yOf(v)} x2={W - PAD.r} y2={yOf(v)}
            stroke="var(--line)" strokeWidth="1" strokeDasharray="4 4"
          />
          <text x={PAD.l - 8} y={yOf(v) + 4} textAnchor="end" fontSize="11" fill="var(--text-3)">
            {v === 0 ? '€0' : `€${(v / 1000).toFixed(1)}k`}
          </text>
        </g>
      ))}

      {/* Areas */}
      <path d={areaD('income')} fill="url(#inc-fill)" />
      <path d={areaD('expenses')} fill="url(#exp-fill)" />

      {/* Lines */}
      <path d={lineD('income')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={lineD('expenses')} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3" />

      {/* Dots on income line */}
      {data.map((d, i) => (
        <circle key={i} cx={xOf(i)} cy={yOf(d.income)} r="4" fill="#fff" stroke="#3b82f6" strokeWidth="2" />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text key={d.month} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--text-3)">
          {d.month}
        </text>
      ))}
    </svg>
  )
}

function StatCard({ label, amount, vs, vsGood, sparkData, sparkColor }) {
  return (
    <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>{fmt(amount)}</div>
      {vs && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 600, padding: '2px 8px',
          borderRadius: 20,
          background: vsGood === null
            ? 'var(--surface-2)'
            : vsGood ? 'oklch(0.94 0.07 145)' : 'oklch(0.94 0.07 20)',
          color: vsGood === null
            ? 'var(--text-3)'
            : vsGood ? 'oklch(0.38 0.13 145)' : 'oklch(0.45 0.16 20)',
          width: 'fit-content',
        }}>
          {vs}
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </div>
  )
}

function BudgetBar({ name, color, spent, total }) {
  const pct = Math.min((spent / total) * 100, 100)
  const over = spent > total
  const barColor = over ? '#ef4444' : pct > 75 ? '#eab308' : color
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'block' }} />
          <span style={{ fontSize: 13 }}>{name}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: over ? '#ef4444' : 'inherit' }}>
          {fmt(spent)} <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>/ {fmt(total)}</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${pct}%`,
          background: barColor,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}


function InsightIcon({ type }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'warn') return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  )
  if (type === 'info') return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
  )
}

const INSIGHT_COLORS = {
  warn: { bg: 'oklch(0.97 0.06 55)', icon: 'oklch(0.6 0.16 55)' },
  info: { bg: 'oklch(0.96 0.04 230)', icon: 'oklch(0.5 0.14 230)' },
  good: { bg: 'oklch(0.95 0.07 145)', icon: 'oklch(0.45 0.14 145)' },
}

function InsightCard({ insight }) {
  const c = INSIGHT_COLORS[insight.tone] ?? INSIGHT_COLORS.info
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '14px 14px',
      border: '1px solid var(--line-2)', borderRadius: 12,
      background: 'var(--surface-2)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: c.bg, color: c.icon,
        display: 'grid', placeItems: 'center',
      }}>
        <InsightIcon type={insight.tone} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{insight.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{insight.body}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{insight.time}</div>
      </div>
    </div>
  )
}

function TxRow({ tx }) {
  const isIncome = tx.amount > 0
  return (
    <tr style={{ borderBottom: '1px solid var(--line-2)' }}>
      <td style={{ padding: '12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'var(--surface-2)', border: '1px solid var(--line)',
            display: 'grid', placeItems: 'center',
            fontSize: 11, fontWeight: 700, color: 'var(--text-2)',
          }}>
            {tx.initials}
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{tx.merchant}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{tx.sub}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 0' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, padding: '3px 10px', borderRadius: 20,
          background: 'var(--surface-2)', border: '1px solid var(--line-2)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tx.catColor, display: 'block' }} />
          {tx.category}
        </span>
      </td>
      <td style={{ padding: '12px 0', fontSize: 13, color: 'var(--text-3)' }}>{tx.account}</td>
      <td style={{ padding: '12px 0', fontSize: 13, color: 'var(--text-3)' }}>{tx.date}</td>
      <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 13.5, fontWeight: 700, color: isIncome ? '#16a34a' : 'inherit' }}>
        {isIncome ? '+' : ''}{fmt(Math.abs(tx.amount))}
      </td>
    </tr>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [sparklines, setSparklines] = useState(null)
  const [cashFlow, setCashFlow] = useState([])
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getDashboardStats(),
      getCashFlow(),
      getSpendingByCategory(),
      getBudgets(),
      getRecentTransactions(),
      getInsights(),
    ]).then(([dash, cf, cats, bud, txs, ins]) => {
      if (cancelled) return
      setStats(dash.stats)
      setSparklines(dash.sparklines)
      setCashFlow(cf)
      setCategories(cats)
      setBudgets(bud)
      setTransactions(txs)
      setInsights(ins)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)' }}>
        Loading dashboard…
      </div>
    )
  }

  const totalSpent = categories.reduce((s, c) => s + c.amount, 0)
  const topCategories = categories.slice(0, 5)
  const extraCount = categories.length - 5

  return (
    <div>
      {/* Page head */}
      <div className="page-head" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Good {hour()}, Lara</h1>
          <p className="page-sub">Here's how your money is moving this month.</p>
        </div>
        <div className="page-actions" style={{ height: '44px', display: 'inline-flex', gap: 20 }}>
          <button type="button" className="btn btn-ghost btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button type="button" className="btn btn-primary btn-sm" /*onClick={() => navigate('/transaction')}*/>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add transaction
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard label={stats.income.label} amount={stats.income.amount} vs={stats.income.vs} vsGood={stats.income.vsGood} sparkData={sparklines.income} sparkColor="#3b82f6" />
        <StatCard label={stats.expenses.label} amount={stats.expenses.amount} vs={stats.expenses.vs} vsGood={stats.expenses.vsGood} sparkData={sparklines.expenses} sparkColor="#f97316" />
        <StatCard label={stats.saved.label} amount={stats.saved.amount} vs={stats.saved.vs} vsGood={stats.saved.vsGood} sparkData={sparklines.saved} sparkColor="#16a34a" />
        <StatCard label={stats.forecast.label} amount={stats.forecast.amount} vs={stats.forecast.vs} vsGood={stats.forecast.vsGood} sparkData={sparklines.forecast} sparkColor="var(--text-3)" />
      </div>

      {/* Cash flow + Spending donut */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 300px', gap: 12, marginBottom: 16 }}>
        {/* Cash flow */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Cash flow — last 6 months</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Income vs. expenses, monthly</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 20, height: 2, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
                Income
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 20, height: 2, background: '#f97316', borderRadius: 2, display: 'inline-block', borderTop: '2px dashed #f97316', height: 0 }} />
                Expenses
              </span>
            </div>
          </div>
          <CashFlowChart data={cashFlow} />
        </div>

        {/* Spending donut */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Spending by category</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>This month</div>
          <div style={{ position: 'relative', width: 160, margin: '0 auto 20px' }}>
            <Donut categories={categories} total={totalSpent} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>SPENT</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{fmt(totalSpent)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {topCategories.map((cat) => (
              <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, display: 'block' }} />
                  {cat.name}
                </span>
                <span style={{ fontWeight: 600 }}>{fmt(cat.amount)}</span>
              </div>
            ))}
            {extraCount > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }} /*onClick={() => navigate('/categories')}*/>+ {extraCount} more categories</div>
            )}
          </div>
        </div>
      </div>

      {/* Budgets + Insights */}
      <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: 12, marginBottom: 16 }}>
        {/* Budgets */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Budgets</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {budgets.filter((b) => b.spent / b.total >= 0.5).length} of {budgets.length} categories are more than halfway
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" /*onClick={() => navigate('/budgets')}*/ >View all →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            {budgets.map((b) => <BudgetBar key={b.name} {...b} />)}
          </div>
        </div>

        {/* Insights */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Insights &amp; alerts</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>3 new signals this week</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins) => <InsightCard key={ins.id} insight={ins} />)}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Recent transactions</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Latest activity across your accounts</div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" /*onClick={() => navigate('/transactions')}*/>See all →</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {['MERCHANT', 'CATEGORY', 'ACCOUNT', 'DATE', 'AMOUNT'].map((h) => (
                <th key={h} style={{
                  padding: '0 0 10px', textAlign: h === 'AMOUNT' ? 'right' : 'left',
                  fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                  letterSpacing: 0.5, textTransform: 'uppercase',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}