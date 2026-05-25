// Mock implementacija za FIN-11. CSV se parsa in kategorizira na clientu,
// zgodovina uvozov se hrani v localStorage. Ko bo backend pripravljen, se
// parsanje in kategorizacija preselita na server (multer + csvParser.js +
// categorizer.js že obstajata), tukaj pa ostanejo iste signature:
//   parseCsvFile(file): Promise<{ fileName, headers, rows }>
//   analyze(rows, headers): { columns, items, summary }
//   getHistory(): Promise<ImportRecord[]>
//   saveImport(record): Promise<ImportRecord[]>
//
// Pričakovani backend endpointi:
//   POST   /import            (multipart/form-data, vrne parsane + kategorizirane vrstice)
//   GET    /import/history    -> ImportRecord[]

const HISTORY_KEY = 'mockImportHistory'
const FAKE_LATENCY_MS = 250

const DEFAULT_HISTORY = [
  { id: 'imp-1', fileName: 'mar_nlb.csv',     label: 'Mar 2026', rows: 78,  date: '2026-03-31' },
  { id: 'imp-2', fileName: 'feb_revolut.csv', label: 'Feb 2026', rows: 112, date: '2026-02-28' },
  { id: 'imp-3', fileName: 'feb_nlb.csv',     label: 'Feb 2026', rows: 81,  date: '2026-02-15' },
  { id: 'imp-4', fileName: 'jan_nlb.csv',     label: 'Jan 2026', rows: 74,  date: '2026-01-31' },
]

// Pravila za auto-kategorizacijo. Ključ je kategorija, vrednost so iskane besede.
const CATEGORY_RULES = {
  Groceries:        ['lidl', 'mercator', 'hofer', 'spar', 'tus', 'aldi', 'kaufland'],
  Subscriptions:    ['spotify', 'netflix', 'youtube', 'icloud', 'hbo', 'disney'],
  Transport:        ['bolt', 'uber', 'omv', 'petrol', 'lpp', 'train', 'bus'],
  'Dining & Cafes': ['starbucks', 'mcdonald', 'kfc', 'pizza', 'restaurant', 'cafe', 'kavarna', 'bar'],
  Income:           ['salary', 'sal', 'employer', 'payroll', 'placa', 'plača'],
  Shopping:         ['zara', 'h&m', 'ikea', 'amazon', 'dm ', 'muller'],
  Utilities:        ['elektro', 'telekom', 't-mobile', 'a1', 'internet', 'voda'],
  Health:           ['apoteka', 'apotheke', 'clinic', 'pharmacy', 'lekarna'],
  Entertainment:    ['kino', 'steam', 'cinema', 'theatre'],
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function categorize(description) {
  const d = (description || '').toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some((kw) => d.includes(kw))) return category
  }
  return 'Other'
}

// Razbije eno CSV vrstico na celice, upošteva narekovaje.
function splitCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Datoteke ni bilo mogoče prebrati'))
    reader.onload = () => {
      const text = String(reader.result || '')
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
      if (lines.length < 2) {
        reject(new Error('CSV je prazen ali nima podatkov'))
        return
      }
      const headers = splitCsvLine(lines[0])
      const rows = lines.slice(1).map((line) => {
        const cells = splitCsvLine(line)
        const obj = {}
        headers.forEach((h, i) => { obj[h] = cells[i] ?? '' })
        return obj
      })
      resolve({ fileName: file.name, headers, rows })
    }
    reader.readAsText(file)
  })
}

// Najde, kateri stolpec je datum / opis / znesek / valuta glede na ime headerja.
function detectColumns(headers) {
  const find = (re) => headers.find((h) => re.test(h)) || null
  return {
    date:     find(/date|datum/i),
    desc:     find(/desc|opis|merchant|payee|narrative|naziv/i),
    amount:   find(/amount|znesek|amt|value|sum/i),
    currency: find(/currency|valuta/i),
  }
}

// Iz surovih vrstic naredi normaliziran seznam + povzetek. Duplikati se
// označijo znotraj iste datoteke (enak datum + opis + znesek).
export function analyze(rows, headers) {
  const columns = detectColumns(headers)
  const seen = new Set()
  const items = rows.map((r, i) => {
    const date = columns.date ? r[columns.date] : ''
    const desc = columns.desc ? r[columns.desc] : ''
    const amountRaw = columns.amount ? r[columns.amount] : ''
    const amount = parseFloat(String(amountRaw).replace(',', '.'))
    const key = `${date}|${desc}|${amountRaw}`
    const duplicate = seen.has(key)
    seen.add(key)
    return {
      id: i,
      date,
      desc,
      amount: Number.isNaN(amount) ? 0 : amount,
      amountRaw,
      category: categorize(desc),
      duplicate,
    }
  })

  const dates = items.map((it) => it.date).filter(Boolean).sort()
  const duplicates = items.filter((it) => it.duplicate).length
  const summary = {
    total: items.length,
    duplicates,
    fresh: items.length - duplicates,
    dateFrom: dates[0] || '—',
    dateTo: dates[dates.length - 1] || '—',
  }
  return { columns, items, summary }
}

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : [...DEFAULT_HISTORY]
  } catch {
    return [...DEFAULT_HISTORY]
  }
}

export async function getHistory() {
  await sleep(FAKE_LATENCY_MS)
  return readHistory()
}

export async function saveImport(record) {
  await sleep(FAKE_LATENCY_MS)
  const entry = {
    id: `imp-${Date.now()}`,
    fileName: record.fileName,
    label: record.label,
    rows: record.rows,
    date: new Date().toISOString().slice(0, 10),
  }
  const next = [entry, ...readHistory()].slice(0, 8)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  return next
}

// Vsebina za "View CSV template" gumb.
export const CSV_TEMPLATE =
  'Transaction_Date,Description,Amount_EUR,Currency\n' +
  '2026-04-18,LIDL LJUBLJANA,-42.18,EUR\n' +
  '2026-04-17,BOLT.EU/RIDE,-6.40,EUR\n' +
  '2026-04-15,EMPLOYER LTD SALARY,2180.00,EUR\n'
