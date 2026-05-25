// Mock implementacija. Ko bodo backend endpointi pripravljeni, samo zamenjaš
// vsebino funkcij. Signature morajo ostati iste:
//   getProfile(): Promise<Profile>
//   updateProfile(patch: Partial<Profile>): Promise<Profile>
//   changePassword(currentPassword, newPassword): Promise<void>
//   getSessions(): Promise<Session[]>
//   terminateSession(id): Promise<Session[]>
//
// Pričakovani endpointi:
//   GET    /api/profile                  -> Profile
//   PATCH  /api/profile                  -> Profile (vrne posodobljen objekt)
//   POST   /api/auth/change-password     { currentPassword, newPassword }
//   GET    /api/auth/sessions            -> Session[]
//   DELETE /api/auth/sessions/:id        -> Session[]

const STORAGE_KEY = 'mockProfile'
const SESSIONS_KEY = 'mockSessions'
const FAKE_LATENCY_MS = 300

const DEFAULT_PROFILE = {
  fullName: 'Lara Kovač',
  email: 'lara@example.com',
  currency: 'EUR',
  language: 'English',
  timezone: 'Europe/Ljubljana',
  weekStart: 'Monday',
  memberSince: '2026-02-01',
  plan: 'Beta · Free',
  avatarColor: 'orange',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_PROFILE }
  } catch {
    return { ...DEFAULT_PROFILE }
  }
}

function writeStore(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export async function getProfile() {
  await sleep(FAKE_LATENCY_MS)
  return readStore()
}

export async function updateProfile(patch) {
  await sleep(FAKE_LATENCY_MS)
  const next = { ...readStore(), ...patch }
  writeStore(next)
  return next
}

const DEFAULT_SESSIONS = [
  { id: 'sess-1', device: 'Windows PC',     browser: 'Chrome 131',  location: 'Maribor, SI', lastActive: 'now',          current: true  },
  { id: 'sess-2', device: 'iPhone 15',      browser: 'Safari Mobile', location: 'Maribor, SI', lastActive: '2 hours ago',  current: false },
  { id: 'sess-3', device: 'MacBook Pro',    browser: 'Safari 18',   location: 'Ljubljana, SI', lastActive: 'yesterday',    current: false },
]

function readSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : [...DEFAULT_SESSIONS]
  } catch {
    return [...DEFAULT_SESSIONS]
  }
}

function writeSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export async function getSessions() {
  await sleep(FAKE_LATENCY_MS)
  return readSessions()
}

export async function terminateSession(id) {
  await sleep(FAKE_LATENCY_MS)
  const sessions = readSessions()
  const target = sessions.find((s) => s.id === id)
  if (!target) {
    const err = new Error('Session not found')
    err.code = 'NOT_FOUND'
    throw err
  }
  if (target.current) {
    const err = new Error('Cannot terminate the current session')
    err.code = 'IS_CURRENT'
    throw err
  }
  const next = sessions.filter((s) => s.id !== id)
  writeSessions(next)
  return next
}

export async function changePassword(currentPassword, newPassword) {
  await sleep(FAKE_LATENCY_MS)
  // Mock sprejme kateri koli neprazen current password. Pravo validacijo bo delal backend.
  if (!currentPassword) {
    const err = new Error('Current password is required')
    err.code = 'INVALID_CURRENT'
    throw err
  }
  if (!newPassword || newPassword.length < 8) {
    const err = new Error('New password must be at least 8 characters')
    err.code = 'WEAK_PASSWORD'
    throw err
  }
}
