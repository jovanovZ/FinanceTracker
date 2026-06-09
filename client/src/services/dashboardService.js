import apiClient from './api.js'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// GET /analytics/dashboard
// Returns: { stats, sparklines }
export async function getDashboardStats() {
  const now = new Date()
  const thisMonth = now.getMonth()   // 0-indexed
  const thisYear  = now.getFullYear()

  // Current month totals
  const current = await apiClient.get('/analytics/dashboard')

  // Previous month totals — we get monthly trends and find prev month
  const trends = await apiClient.get('/analytics/trends')

  // Find previous month entry in trends
  const prevMonth = thisMonth === 0 ? 12 : thisMonth;
  const prevYear  = thisMonth === 0 ? thisYear - 1 : thisYear
  const prev = trends.find(t => t.month === prevMonth && t.year === prevYear)
    ?? { income: 0, expenses: 0 }

  // Build sparkline from last 7 monthly trend entries
  const last7 = trends.slice(-7)
  const sparklines = {
    income:   last7.map(t => t.income),
    expenses: last7.map(t => t.expenses),
    saved:    last7.map(t => t.income - t.expenses),
    forecast: last7.map(t => t.income - t.expenses),
  }

  // vs. previous month helper
  const vsChange = (curr, prev) => {
    if (!prev || prev === 0) return null
    const pct = ((curr - prev) / prev * 100).toFixed(1)
    return pct > 0 ? `+${pct}% vs. last month` : `${pct}% vs. last month`
  }

  const income   = current.totalIncome   ?? 0
  const expenses = current.totalExpenses ?? 0
  const saved    = current.savings       ?? 0

  const prevIncome   = prev.income   ?? 0
  const prevExpenses = prev.expenses ?? 0
  const prevSaved    = prevIncome - prevExpenses

  const stats = {
    income: {
      label:  `Income (${MONTH_NAMES[thisMonth]})`,
      amount: income,
      vs:     vsChange(income, prevIncome),
      vsGood: income >= prevIncome,
    },
    expenses: {
      label:  `Expenses (${MONTH_NAMES[thisMonth]})`,
      amount: expenses,
      vs:     vsChange(expenses, prevExpenses),
      vsGood: expenses <= prevExpenses,
    },
    saved: {
      label:  'Saved this month',
      amount: saved,
      vs:     income > 0 ? `${(saved / income * 100).toFixed(1)}% savings rate` : null,
      vsGood: saved >= prevSaved,
    },
    forecast: {
      label:  'Forecast — end of month',
      amount: saved,
      vs:     'Based on recent trend',
      vsGood: null,
    },
  }

  return { stats, sparklines }
}

// GET /analytics/trends
// Returns cash flow array shaped for CashFlowChart: { month, income, expenses }[]
export async function getCashFlow() {
  const trends = await apiClient.get('/analytics/trends')

  // Take last 6 months
  return trends.slice(-6).map(t => ({
    month:    MONTH_NAMES[t.month - 1],  // t.month is 1-indexed
    income:   t.income,
    expenses: t.expenses,
  }))
}

// GET /statements/monthly  (current month)
// Returns spending by category array: { name, color, amount }[]
const CATEGORY_COLORS = [
  '#7c3aed','#16a34a','#0891b2','#db2777',
  '#ea580c','#eab308','#6b7280','#2563eb',
  '#dc2626','#059669',
]

export async function getSpendingByCategory() {
  const now = new Date()
  const data = await apiClient.get(
    `/statements/monthly?year=${now.getFullYear()}&month=${now.getMonth() + 1}`
  )

  return (data.byCategory ?? []).map((cat, i) => ({
    name:   cat.category ?? 'Other',
    color:  CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    amount: cat.total,
  }))
}

// GET /budgets/report  (current month)
// Returns budget array: { name, color, spent, total }[]
export async function getBudgets() {
  const data = await apiClient.get('/budgets/report')

  return (data.report ?? []).map((b, i) => ({
    name:  b.cat_id.name || "Other",
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    spent: b.spent,
    total: b.limit,
  }))
}

// GET /transaction  (last 10, most recent)
// Returns transaction array shaped for TxRow
export async function getRecentTransactions() {
  const txs = await apiClient.get('/transactions?limit=10')
  return (Array.isArray(txs) ? txs : []).slice(0, 10).map(tx => {
    const merchant = tx.merchant || tx.desc || 'Unknown'
    console.log(tx)

    if(tx.cat_id == null) tx.cat_id = {name: "Other", color: "oklch(0.55 0.18 265)"}

    return {
      id:       tx._id,
      initials: merchant.slice(0, 2).toUpperCase(),
      merchant: merchant,
      sub:      tx.desc || merchant,
      category: tx.cat_id.name  || 'Other',
      color: tx.cat_id.color,
      account:  tx.account  || '—',
      date:     formatDate(tx.date),
      amount:   tx.amount,
    }
  })
}

// GET /analytics/insights
// Returns insight array shaped for InsightCard
export async function getInsights() {
  const data = await apiClient.get('/analytics/insights')
  const insights = []

  if (data.peakDay) {
    insights.push({
      id:    'peak-day',
      title: `Highest spending day: ${data.peakDay.date}`,
      body:  `You spent €${data.peakDay.amount.toFixed(2)} in a single day.`,
      time:  'All time',
      tone:  'warn',
    })
  }

  if (data.topCategory) {
    insights.push({
      id:    'top-cat',
      title: `Top spending category: ${data.topCategory.category}`,
      body:  `Total spent: €${data.topCategory.amount.toFixed(2)}.`,
      time:  'All time',
      tone:  'info',
    })
  }

  if (data.subscriptions?.percentageOfTotal > 0) {
    insights.push({
      id:    'subscriptions',
      title: `Subscriptions are ${data.subscriptions.percentageOfTotal}% of expenses`,
      body:  `Total subscription spend: €${data.subscriptions.totalSubSpent.toFixed(2)}.`,
      time:  'All time',
      tone:  data.subscriptions.percentageOfTotal > 20 ? 'warn' : 'good',
    })
  }

  return insights
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

function hashStr(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}