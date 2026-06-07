import apiClient from './api.js'

const CATEGORY_META = {
  'Groceries':       { color: '#16a34a' },
  'Subscriptions':   { color: '#2563eb' },
  'Transport':       { color: '#0891b2' },
  'Dining & Cafes':  { color: '#ea580c' },
  'Shopping':        { color: '#db2777' },
  'Housing & Bills': { color: '#7c3aed' },
  'Income':          { color: '#16a34a' },
  'Leisure':         { color: '#ca8a04' },
  'Health':          { color: '#dc2626' },
  'Other':           { color: '#6b7280' },
}

export const CATEGORIES = Object.keys(CATEGORY_META)
export const ACCOUNTS   = ['NLB Checking', 'Revolut', 'Main Account']


function toUIShape(tx) {
  const category = tx.cat || 'Other'
  const meta     = CATEGORY_META[category] || CATEGORY_META['Other']
  const merchant = tx.merchant || 'Unknown'
  const date = tx.date
    ? new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : ''
  const rawDate = tx.date
    ? new Date(tx.date).toISOString().split('T')[0]
    : ''

  return {
    id:        tx._id,
    merchant,
    sub:       tx.desc || '',
    category,
    account:   tx.account || 'Main Account',
    date,
    rawDate,          // ← add this line
    amount:    tx.amount,
    recurring: tx.isSub || false,
    catColor:  meta.color,
    initials:  merchant.slice(0, 2).toUpperCase(),
    currency:  tx.currency || 'EUR',
  }
}

function toAPIShape(formData) {
  // AddTransactionModal sends: merchant, sub, category, account, date, amount, type, recurring
  return {
    merchant: formData.merchant,
    desc:     formData.sub || '',
    amount:   formData.amount,                      // already signed by modal
    date:     formData.date ? new Date(formData.date) : new Date(),
    cat:      formData.category || 'Other',
    account:  formData.account  || 'Main Account',
    isSub:    formData.recurring || false,
    currency: formData.currency || 'EUR',
  }
}

function computeSummary(txs) {
  let moneyIn = 0, moneyOut = 0, incomeCount = 0, spendCount = 0
  for (const tx of txs) {
    if (tx.amount > 0) { moneyIn  += tx.amount; incomeCount++ }
    else               { moneyOut += tx.amount; spendCount++  }
  }
  return { moneyIn, moneyOut, netChange: moneyIn + moneyOut, incomeCount, spendCount }
}

const PAGE_SIZE = 20

export async function getTransactions({ page = 1, search = '', category = '', account = '', type = '', amountSort = '' } = {}) {
  // Build query params the backend understands
  const params = new URLSearchParams()
  if (search)   params.set('keyword',  search)
  if (category) params.set('category', category)   // backend maps this to cat filter
  if (type && type !== 'recurring') params.set('type', type)

  const qs   = params.toString()
  const raw  = await apiClient.get(`/transactions${qs ? `?${qs}` : ''}`)

  // raw is an array of DB documents
  let items = raw.map(toUIShape)

  // Client-side filters the backend doesn't handle yet
  if (account)             items = items.filter(tx => tx.account === account)
  if (type === 'recurring') items = items.filter(tx => tx.recurring)
  if (amountSort === 'desc')  items = [...items].sort((a, b) => a.amount - b.amount)
  if (amountSort === 'asc') items = [...items].sort((a, b) => b.amount - a.amount)

  const summary = computeSummary(items)
  const total   = items.length
  const pages   = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paged   = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return { items: paged, total, pages, summary }
}

export async function addTransaction(formData) {
  const body    = toAPIShape(formData)
  const created = await apiClient.post('/transactions', body)
  return toUIShape(created)
}

export async function deleteTransaction(id) {
  await apiClient.delete(`/transactions/${id}`)
  return { ok: true }
}

export async function deleteTransactions(ids) {
  await Promise.all(ids.map(id => apiClient.delete(`/transactions/${id}`)))
  return { ok: true }
}


export async function updateTransaction(id, { category, desc, merchant, amount, date, account, recurring }) {
  const body = {}
  if (category  !== undefined) body.cat      = category
  if (desc      !== undefined) body.desc     = desc
  if (merchant  !== undefined) body.merchant = merchant
  if (amount    !== undefined) body.amount   = amount
  if (date      !== undefined) body.date     = date ? new Date(date) : undefined
  if (account   !== undefined) body.account  = account
  if (recurring !== undefined) body.isSub    = recurring
  const updated = await apiClient.patch(`/transactions/${id}`, body)
  return toUIShape(updated)
}