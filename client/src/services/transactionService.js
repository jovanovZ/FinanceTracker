// transactionService.js – mock data for the Transactions page
// All functions return Promises so they're easy to swap for real API calls.

const CATEGORY_META = {
  'Groceries':      { color: '#16a34a' },
  'Subscriptions':  { color: '#2563eb' },
  'Transport':      { color: '#0891b2' },
  'Dining & Cafes': { color: '#ea580c' },
  'Shopping':       { color: '#db2777' },
  'Housing & Bills':{ color: '#7c3aed' },
  'Income':         { color: '#16a34a' },
  'Leisure':        { color: '#ca8a04' },
  'Health':         { color: '#dc2626' },
  'Other':          { color: '#6b7280' },
}

export const CATEGORIES = Object.keys(CATEGORY_META)
export const ACCOUNTS   = ['NLB Checking', 'Revolut']

// 142 mock transactions for April 2026
const RAW = [
  // Apr 18
  { id: 1,  initials:'LI', merchant:'Lidl',            sub:'Lidl · Ljubljana Center',  category:'Groceries',      account:'NLB Checking', date:'Apr 18', amount:-42.18,   recurring:false },
  { id: 2,  initials:'SP', merchant:'Spotify',          sub:'Spotify Premium',           category:'Subscriptions',  account:'NLB Checking', date:'Apr 18', amount:-5.99,    recurring:true  },
  { id: 3,  initials:'BO', merchant:'Bolt',             sub:'Bolt ride · 12 min',        category:'Transport',      account:'Revolut',      date:'Apr 17', amount:-6.40,    recurring:false },
  { id: 4,  initials:'MO', merchant:'Moji prijatelji',  sub:'Pizza delivery',            category:'Dining & Cafes', account:'Revolut',      date:'Apr 17', amount:-18.50,   recurring:false },
  { id: 5,  initials:'ME', merchant:'Mercator',         sub:'Mercator · Bežigrad',       category:'Groceries',      account:'NLB Checking', date:'Apr 16', amount:-31.05,   recurring:false },
  { id: 6,  initials:'EM', merchant:'Employer Ltd',     sub:'Salary — April',            category:'Income',         account:'NLB Checking', date:'Apr 15', amount:2180.00,  recurring:false },
  { id: 7,  initials:'ZA', merchant:'Zara',             sub:'Zara Ljubljana',            category:'Shopping',       account:'NLB Checking', date:'Apr 12', amount:-79.90,   recurring:false },
  { id: 8,  initials:'ČO', merchant:'Čokl Kava',        sub:'Coffee & croissant',        category:'Dining & Cafes', account:'Revolut',      date:'Apr 12', amount:-4.80,    recurring:false },
  { id: 9,  initials:'KI', merchant:'Kinodvor',         sub:'Cinema ticket',             category:'Leisure',        account:'Revolut',      date:'Apr 11', amount:-7.50,    recurring:false },
  { id: 10, initials:'EL', merchant:'Elektro',          sub:'Electricity bill',          category:'Housing & Bills',account:'NLB Checking', date:'Apr 10', amount:-64.20,   recurring:false },
  { id: 11, initials:'HO', merchant:'Hofer',            sub:'Hofer supermarket',         category:'Groceries',      account:'NLB Checking', date:'Apr 09', amount:-27.40,   recurring:false },
  { id: 12, initials:'T-', merchant:'T-Mobile',         sub:'Mobile plan',               category:'Subscriptions',  account:'NLB Checking', date:'Apr 08', amount:-19.90,   recurring:true  },
  { id: 13, initials:'ST', merchant:'Starbucks',        sub:'Starbucks',                 category:'Dining & Cafes', account:'Revolut',      date:'Apr 07', amount:-6.20,    recurring:false },
  { id: 14, initials:'LA', merchant:'Landlord',         sub:'April rent',                category:'Housing & Bills',account:'NLB Checking', date:'Apr 05', amount:-520.00,  recurring:true  },
  { id: 15, initials:'DM', merchant:'DM',               sub:'DM drogerija',              category:'Shopping',       account:'NLB Checking', date:'Apr 04', amount:-22.15,   recurring:false },
  { id: 16, initials:'LP', merchant:'LPP',              sub:'City bus pass',             category:'Transport',      account:'NLB Checking', date:'Apr 03', amount:-37.00,   recurring:true  },
  { id: 17, initials:'FR', merchant:'Freelance · Acme', sub:'Side project invoice',      category:'Income',         account:'Revolut',      date:'Apr 02', amount:340.00,   recurring:false },
  { id: 18, initials:'SH', merchant:'Spar',             sub:'Spar BTC City',             category:'Groceries',      account:'Revolut',      date:'Apr 01', amount:-38.60,   recurring:false },
  // Page 2 (ids 19-38)
  { id: 19, initials:'NE', merchant:'Netflix',          sub:'Netflix Standard',          category:'Subscriptions',  account:'Revolut',      date:'Mar 31', amount:-15.99,   recurring:true  },
  { id: 20, initials:'AP', merchant:'Apoteka',          sub:'Pharmacy',                  category:'Health',         account:'NLB Checking', date:'Mar 31', amount:-12.40,   recurring:false },
  { id: 21, initials:'PE', merchant:'Petrol',           sub:'Petrol pump',               category:'Transport',      account:'NLB Checking', date:'Mar 30', amount:-55.00,   recurring:false },
  { id: 22, initials:'LI', merchant:'Lidl',             sub:'Lidl · Šiška',              category:'Groceries',      account:'NLB Checking', date:'Mar 29', amount:-44.30,   recurring:false },
  { id: 23, initials:'AM', merchant:'Amazon',           sub:'Amazon Prime',              category:'Subscriptions',  account:'Revolut',      date:'Mar 28', amount:-8.99,    recurring:true  },
  { id: 24, initials:'CA', merchant:'Caffè Centrale',   sub:'Lunch',                     category:'Dining & Cafes', account:'Revolut',      date:'Mar 28', amount:-14.60,   recurring:false },
  { id: 25, initials:'DE', merchant:'Decathlon',        sub:'Sports equipment',          category:'Shopping',       account:'NLB Checking', date:'Mar 27', amount:-89.00,   recurring:false },
  { id: 26, initials:'GY', merchant:'GymBeam',          sub:'Membership',                category:'Health',         account:'NLB Checking', date:'Mar 26', amount:-29.90,   recurring:true  },
  { id: 27, initials:'GL', merchant:'Glovo',            sub:'Food delivery',             category:'Dining & Cafes', account:'Revolut',      date:'Mar 25', amount:-22.10,   recurring:false },
  { id: 28, initials:'ME', merchant:'Mercator',         sub:'Mercator · Center',         category:'Groceries',      account:'NLB Checking', date:'Mar 24', amount:-51.80,   recurring:false },
  { id: 29, initials:'UR', merchant:'Urban Gym',        sub:'Monthly pass',              category:'Health',         account:'Revolut',      date:'Mar 22', amount:-35.00,   recurring:true  },
  { id: 30, initials:'BO', merchant:'Bolt',             sub:'Bolt ride · 8 min',         category:'Transport',      account:'Revolut',      date:'Mar 21', amount:-4.20,    recurring:false },
  { id: 31, initials:'MK', merchant:'Müller',           sub:'Cosmetics',                 category:'Shopping',       account:'NLB Checking', date:'Mar 20', amount:-18.75,   recurring:false },
  { id: 32, initials:'HU', merchant:'H&M',              sub:'Clothing',                  category:'Shopping',       account:'NLB Checking', date:'Mar 19', amount:-46.00,   recurring:false },
  { id: 33, initials:'EM', merchant:'Employer Ltd',     sub:'Bonus payout',              category:'Income',         account:'NLB Checking', date:'Mar 18', amount:200.00,   recurring:false },
  { id: 34, initials:'DO', merchant:'Domino\'s',        sub:'Pizza',                     category:'Dining & Cafes', account:'Revolut',      date:'Mar 17', amount:-12.90,   recurring:false },
  { id: 35, initials:'WO', merchant:'Wolt',             sub:'Food delivery',             category:'Dining & Cafes', account:'Revolut',      date:'Mar 16', amount:-19.30,   recurring:false },
  { id: 36, initials:'TI', merchant:'Tinkara Bistro',   sub:'Team lunch',                category:'Dining & Cafes', account:'Revolut',      date:'Mar 15', amount:-28.50,   recurring:false },
  { id: 37, initials:'PP', merchant:'Parking Plus',     sub:'Parking garage',            category:'Transport',      account:'NLB Checking', date:'Mar 14', amount:-3.60,    recurring:false },
  { id: 38, initials:'CO', merchant:'Coursera',         sub:'Online course',             category:'Subscriptions',  account:'Revolut',      date:'Mar 13', amount:-39.00,   recurring:false },
  // Page 3 (ids 39-58)
  { id: 39, initials:'SH', merchant:'Spar',             sub:'Spar Rudnik',               category:'Groceries',      account:'NLB Checking', date:'Mar 12', amount:-33.20,   recurring:false },
  { id: 40, initials:'EL', merchant:'Elektro',          sub:'Electricity bill',          category:'Housing & Bills',account:'NLB Checking', date:'Mar 11', amount:-61.40,   recurring:false },
  { id: 41, initials:'FI', merchant:'Fitpass',          sub:'Gym network',               category:'Health',         account:'Revolut',      date:'Mar 10', amount:-24.90,   recurring:true  },
  { id: 42, initials:'BO', merchant:'Bolt Food',        sub:'Food delivery',             category:'Dining & Cafes', account:'Revolut',      date:'Mar 09', amount:-16.70,   recurring:false },
  { id: 43, initials:'IN', merchant:'iNetis',           sub:'Home internet',             category:'Housing & Bills',account:'NLB Checking', date:'Mar 08', amount:-29.99,   recurring:true  },
  { id: 44, initials:'ZA', merchant:'Zavarovalnica',    sub:'Insurance premium',         category:'Housing & Bills',account:'NLB Checking', date:'Mar 07', amount:-44.50,   recurring:true  },
  { id: 45, initials:'GL', merchant:'Glassnode',        sub:'Data subscription',         category:'Subscriptions',  account:'Revolut',      date:'Mar 06', amount:-29.00,   recurring:true  },
  { id: 46, initials:'CA', merchant:'Caffe Bar Rex',    sub:'Drinks',                    category:'Dining & Cafes', account:'Revolut',      date:'Mar 05', amount:-9.40,    recurring:false },
  { id: 47, initials:'LE', merchant:'Lekarna',          sub:'Vitamins',                  category:'Health',         account:'NLB Checking', date:'Mar 04', amount:-18.60,   recurring:false },
  { id: 48, initials:'MO', merchant:'Modiana',          sub:'Clothing store',            category:'Shopping',       account:'NLB Checking', date:'Mar 03', amount:-37.90,   recurring:false },
  { id: 49, initials:'HO', merchant:'Hofer',            sub:'Weekly groceries',          category:'Groceries',      account:'NLB Checking', date:'Mar 02', amount:-29.10,   recurring:false },
  { id: 50, initials:'LA', merchant:'Landlord',         sub:'March rent',                category:'Housing & Bills',account:'NLB Checking', date:'Mar 01', amount:-520.00,  recurring:true  },
  { id: 51, initials:'EM', merchant:'Employer Ltd',     sub:'Salary — March',            category:'Income',         account:'NLB Checking', date:'Mar 01', amount:2150.00,  recurring:false },
  { id: 52, initials:'SP', merchant:'Spotify',          sub:'Spotify Premium',           category:'Subscriptions',  account:'NLB Checking', date:'Feb 28', amount:-5.99,    recurring:true  },
  { id: 53, initials:'PE', merchant:'Petrol',           sub:'Fuel',                      category:'Transport',      account:'NLB Checking', date:'Feb 27', amount:-60.00,   recurring:false },
  { id: 54, initials:'AP', merchant:'Apple',            sub:'iCloud storage',            category:'Subscriptions',  account:'Revolut',      date:'Feb 26', amount:-0.99,    recurring:true  },
  { id: 55, initials:'LI', merchant:'Lidl',             sub:'Lidl · Vič',                category:'Groceries',      account:'NLB Checking', date:'Feb 25', amount:-37.55,   recurring:false },
  { id: 56, initials:'KI', merchant:'Kinodvor',         sub:'Film festival tickets',     category:'Leisure',        account:'Revolut',      date:'Feb 24', amount:-22.00,   recurring:false },
  { id: 57, initials:'TM', merchant:'T-Mobile',         sub:'Mobile plan',               category:'Subscriptions',  account:'NLB Checking', date:'Feb 22', amount:-19.90,   recurring:true  },
  { id: 58, initials:'GL', merchant:'Glovo',            sub:'Grocery delivery',          category:'Dining & Cafes', account:'Revolut',      date:'Feb 21', amount:-24.80,   recurring:false },
]

// Generate remaining transactions (ids 59-142) automatically to fill 142
const MERCHANTS_POOL = [
  { initials:'LI', merchant:'Lidl',          sub:'Lidl',              category:'Groceries',      account:'NLB Checking', amount:-35, recurring:false },
  { initials:'HO', merchant:'Hofer',         sub:'Hofer',             category:'Groceries',      account:'NLB Checking', amount:-28, recurring:false },
  { initials:'ME', merchant:'Mercator',      sub:'Mercator',          category:'Groceries',      account:'NLB Checking', amount:-42, recurring:false },
  { initials:'BO', merchant:'Bolt',          sub:'Bolt ride',         category:'Transport',      account:'Revolut',      amount:-5,  recurring:false },
  { initials:'PE', merchant:'Petrol',        sub:'Fuel',              category:'Transport',      account:'NLB Checking', amount:-55, recurring:false },
  { initials:'CA', merchant:'Caffe Bar',     sub:'Coffee',            category:'Dining & Cafes', account:'Revolut',      amount:-4,  recurring:false },
  { initials:'WO', merchant:'Wolt',          sub:'Food delivery',     category:'Dining & Cafes', account:'Revolut',      amount:-18, recurring:false },
  { initials:'ZA', merchant:'Zara',          sub:'Clothing',          category:'Shopping',       account:'NLB Checking', amount:-65, recurring:false },
  { initials:'DM', merchant:'DM',            sub:'DM drogerija',      category:'Shopping',       account:'NLB Checking', amount:-20, recurring:false },
  { initials:'AP', merchant:'Apoteka',       sub:'Pharmacy',          category:'Health',         account:'NLB Checking', amount:-14, recurring:false },
  { initials:'NE', merchant:'Netflix',       sub:'Netflix',           category:'Subscriptions',  account:'Revolut',      amount:-15.99, recurring:true },
  { initials:'KI', merchant:'Kino',          sub:'Movie ticket',      category:'Leisure',        account:'Revolut',      amount:-8,  recurring:false },
]

const MONTHS = ['Jan','Feb','Mar','Apr']
function randMonth(i) { return MONTHS[Math.floor(i / 21) % 4] }
function randDay(i)   { return String(Math.max(1, 28 - (i % 28))).padStart(2, '0') }

for (let i = 59; i <= 142; i++) {
  const base = MERCHANTS_POOL[(i - 59) % MERCHANTS_POOL.length]
  const variance = (Math.random() * 0.4 - 0.2) * Math.abs(base.amount)
  RAW.push({
    id: i,
    ...base,
    sub: `${base.merchant} · ${['Ljubljana', 'Šiška', 'Bežigrad', 'Vič', 'Center'][i % 5]}`,
    date: `${randMonth(i)} ${randDay(i)}`,
    amount: parseFloat((base.amount + variance).toFixed(2)),
  })
}

function enrichTransaction(tx) {
  const meta = CATEGORY_META[tx.category] || CATEGORY_META['Other']
  return { ...tx, catColor: meta.color }
}

const ALL_TXS = RAW.map(enrichTransaction)


function computeSummary(txs) {
  let moneyIn = 0, moneyOut = 0, incomeCount = 0, spendCount = 0
  for (const tx of txs) {
    if (tx.amount > 0) { moneyIn += tx.amount; incomeCount++ }
    else               { moneyOut += tx.amount; spendCount++ }
  }
  return {
    moneyIn,
    moneyOut,
    netChange: moneyIn + moneyOut,
    incomeCount,
    spendCount,
  }
}


const PAGE_SIZE = 20

export async function getTransactions({ page = 1, search = '', category = '', account = '', type = '' } = {}) {
  await delay(100)

  let filtered = ALL_TXS.filter((tx) => {
    if (search && !tx.merchant.toLowerCase().includes(search.toLowerCase()) && !tx.sub.toLowerCase().includes(search.toLowerCase())) return false
    if (category && tx.category !== category) return false
    if (account  && tx.account  !== account)  return false
    if (type === 'income'  && tx.amount <= 0) return false
    if (type === 'expense' && tx.amount >= 0) return false
    if (type === 'recurring' && !tx.recurring) return false
    return true
  })

  const summary = computeSummary(filtered)
  const total   = filtered.length
  const pages   = Math.ceil(total / PAGE_SIZE)
  const items   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return { items, total, pages, summary }
}

export async function addTransaction(data) {
  await delay(80)
  const id   = ALL_TXS.length + 1
  const meta = CATEGORY_META[data.category] || CATEGORY_META['Other']
  const tx = enrichTransaction({
    id,
    initials: data.merchant.slice(0, 2).toUpperCase(),
    ...data,
    catColor: meta.color,
  })
  ALL_TXS.unshift(tx)
  return tx
}

export async function deleteTransaction(id) {
  await delay(60)
  const idx = ALL_TXS.findIndex((t) => t.id === id)
  if (idx !== -1) ALL_TXS.splice(idx, 1)
  return { ok: true }
}

export async function deleteTransactions(ids) {
  await delay(80)
  ids.forEach((id) => {
    const idx = ALL_TXS.findIndex((t) => t.id === id)
    if (idx !== -1) ALL_TXS.splice(idx, 1)
  })
  return { ok: true }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}