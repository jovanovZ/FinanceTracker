import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './screens/Profile.jsx'
import Login from './screens/Login'

// AppShell je za zdaj mock za FIN-15. Deluje samo Profile, ostalo je vizualni
// placeholder. Ko bo task za pravi shell in routing pripravljen, se to celo
// datoteko zamenja.

const NAV_MAIN = [
  { id: 'dashboard',    label: 'Dashboard',    icon: 'dashboard' },
  { id: 'transactions', label: 'Transactions', icon: 'list', count: 142 },
  { id: 'import',       label: 'Import',       icon: 'upload' },
  { id: 'budgets',      label: 'Budgets',      icon: 'target' },
  { id: 'analytics',    label: 'Analytics',    icon: 'chart' },
  { id: 'categories',   label: 'Categories',   icon: 'tag' },
]
const NAV_BOTTOM = [
  { id: 'profile',  label: 'Profile',  icon: 'user' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function Ic({ name, size = 17 }) {
  const s = { width: size, height: size }
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'dashboard':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
    case 'list':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
    case 'upload':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    case 'target':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    case 'chart':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    case 'tag':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
    case 'user':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'settings':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    case 'search':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    case 'calendar':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'bell':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    case 'sun':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg>
    case 'moon':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    default:
      return null
  }
}

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

function Sidebar({ active }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">F</div>
        <div className="sidebar-brand-name">Financely</div>
      </div>

      <div className="sidebar-section-label">Workspace</div>
      <div className="sidebar-nav">
        {NAV_MAIN.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`sidebar-item ${active === n.id ? 'active' : ''}`}
            disabled
            title="Coming soon"
          >
            <Ic name={n.icon} />
            <span>{n.label}</span>
            {n.count && <span className="count">{n.count}</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-section-label">Account</div>
      <div className="sidebar-nav">
        {NAV_BOTTOM.map((n) => {
          const enabled = n.id === 'profile'
          return (
            <button
              key={n.id}
              type="button"
              className={`sidebar-item ${active === n.id ? 'active' : ''}`}
              disabled={!enabled}
              title={enabled ? '' : 'Coming soon'}
            >
              <Ic name={n.icon} />
              <span>{n.label}</span>
            </button>
          )
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-upgrade">
          <div className="sidebar-upgrade-title">Connect your bank</div>
          <div className="sidebar-upgrade-desc">Auto-sync transactions daily instead of CSV uploads.</div>
          <button type="button" className="sidebar-upgrade-btn" disabled>Learn more</button>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">LK</div>
        <div style={{ lineHeight: 1.25 }}>
          <div className="sidebar-user-name">Lara Kovač</div>
          <div className="sidebar-user-email">lara@example.com</div>
        </div>
      </div>
    </aside>
  )
}

function Topbar({ theme, toggleTheme }) {
  const [period, setPeriod] = useState('Month')
  return (
    <header className="topbar">
      <div className="search">
        <Ic name="search" size={16} />
        <input placeholder="Search transactions, merchants, rules…" disabled />
        <span className="kbd">⌘K</span>
      </div>
      <div className="topbar-actions">
        <div className="period-pill">
          {['Week', 'Month', 'Quarter', 'Year'].map((p) => (
            <button
              key={p}
              type="button"
              className={period === p ? 'active' : ''}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          <Ic name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>
        <button type="button" className="icon-btn" title="Coming soon"><Ic name="calendar" size={16} /></button>
        <button type="button" className="icon-btn" title="Coming soon">
          <Ic name="bell" size={16} />
          <span className="dot" />
        </button>
      </div>
    </header>
  )
}

function App() {
  const [theme, toggleTheme] = useTheme()

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={
            <>
              <Login />
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <Ic name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
              </button>
            </>
          }
        />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="app">
                <Sidebar active="profile" />
                <div className="main">
                  <Topbar theme={theme} toggleTheme={toggleTheme} />
                  <div className="content">
                    <Profile />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App