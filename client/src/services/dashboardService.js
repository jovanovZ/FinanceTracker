// dashboardService.js  –  mock data for the Dashboard page
// All functions return Promises so they're easy to replace with real API calls later.

const MOCK_STATS = {
  income: { amount: 2520.0, label: 'Income (April)', vs: '+15.6% vs. March', vsGood: true },
  expenses: { amount: 1345.13, label: 'Expenses (April)', vs: '-19.9% vs. March', vsGood: true },
  saved: { amount: 1174.87, label: 'Saved this month', vs: '46.6% savings rate', vsGood: true },
  forecast: { amount: 932.4, label: 'Forecast — end of month', vs: 'Based on recent trend', vsGood: null },
}

// Six months of cash-flow data (income + expenses)
const MOCK_CASHFLOW = [
  { month: 'Nov', income: 2180, expenses: 1560 },
  { month: 'Dec', income: 2340, expenses: 1780 },
  { month: 'Jan', income: 2200, expenses: 1640 },
  { month: 'Feb', income: 2260, expenses: 1590 },
  { month: 'Mar', income: 2150, expenses: 1480 },
  { month: 'Apr', income: 2520, expenses: 1345 },
]

// Sparkline data (7 points each)
const MOCK_SPARKLINES = {
  income:   [1900, 2050, 2180, 2100, 2300, 2420, 2520],
  expenses: [1700, 1620, 1580, 1490, 1560, 1400, 1345],
  saved:    [200, 430, 600, 610, 740, 1020, 1174],
  forecast: [1100, 1020, 980, 960, 940, 935, 932],
}

const MOCK_CATEGORIES = [
  { name: 'Housing & Bills', color: '#7c3aed', amount: 584 },
  { name: 'Groceries',       color: '#16a34a', amount: 247 },
  { name: 'Transport',       color: '#0891b2', amount: 168 },
  { name: 'Shopping',        color: '#db2777', amount: 102 },
  { name: 'Dining & Cafes',  color: '#ea580c', amount: 98  },
  { name: 'Other',           color: '#6b7280', amount: 86  },
]

const MOCK_BUDGETS = [
  { name: 'Groceries',      color: '#16a34a', spent: 247, total: 320 },
  { name: 'Dining & Cafes', color: '#ea580c', spent: 98,  total: 120 },
  { name: 'Transport',      color: '#0891b2', spent: 168, total: 150 },
  { name: 'Housing & Bills',color: '#7c3aed', spent: 584, total: 620 },
  { name: 'Subscriptions',  color: '#eab308', spent: 43,  total: 50  },
]

const MOCK_TRANSACTIONS = [
  { id: 1,  initials: 'LI', merchant: 'Lidl',           sub: 'Lidl · Ljubljana Center', category: 'Groceries',    catColor: '#16a34a', account: 'NLB Checking', date: 'Apr 18', amount: -42.18  },
  { id: 2,  initials: 'SP', merchant: 'Spotify',         sub: 'Spotify Premium',          category: 'Subscriptions',catColor: '#eab308', account: 'NLB Checking', date: 'Apr 18', amount: -5.99   },
  { id: 3,  initials: 'BO', merchant: 'Bolt',            sub: 'Bolt ride · 12 min',       category: 'Transport',    catColor: '#0891b2', account: 'Revolut',      date: 'Apr 17', amount: -6.40   },
  { id: 4,  initials: 'MO', merchant: 'Moji prijatelji', sub: 'Pizza delivery',           category: 'Dining & Cafes',catColor:'#ea580c', account: 'Revolut',      date: 'Apr 17', amount: -18.50  },
  { id: 5,  initials: 'ME', merchant: 'Mercator',        sub: 'Mercator · Bežigrad',      category: 'Groceries',    catColor: '#16a34a', account: 'NLB Checking', date: 'Apr 16', amount: -31.05  },
  { id: 6,  initials: 'EM', merchant: 'Employer Ltd',    sub: 'Salary — April',           category: 'Income',       catColor: '#2563eb', account: 'NLB Checking', date: 'Apr 15', amount: 2180.00 },
]

const MOCK_INSIGHTS = [
  {
    id: 1,
    icon: 'bolt',
    title: 'Transport is 12% over budget',
    body: "You've spent €168 of your €150 monthly limit. Fuel is the main driver.",
    time: '2h ago',
    tone: 'warn',
  },
  {
    id: 2,
    icon: 'sub',
    title: 'New subscription detected',
    body: 'We found a recurring charge from "T-Mobile" — added to Subscriptions.',
    time: 'Yesterday',
    tone: 'info',
  },
  {
    id: 3,
    icon: 'trend',
    title: 'Dining spend down 31%',
    body: "Nice work — you're saving €44 vs. March at this pace.",
    time: '2 days ago',
    tone: 'good',
  },
]

// ── Public API ──────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  await delay(120)
  return { stats: MOCK_STATS, sparklines: MOCK_SPARKLINES }
}

export async function getCashFlow() {
  await delay(80)
  return MOCK_CASHFLOW
}

export async function getSpendingByCategory() {
  await delay(80)
  return MOCK_CATEGORIES
}

export async function getBudgets() {
  await delay(80)
  return MOCK_BUDGETS
}

export async function getRecentTransactions() {
  await delay(100)
  return MOCK_TRANSACTIONS
}

export async function getInsights() {
  await delay(60)
  return MOCK_INSIGHTS
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}