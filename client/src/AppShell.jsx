import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { TransactionModalProvider } from './context/TransactionsModalContext.jsx'
import { addTransaction } from './services/transactionService.js'
import apiClient from './services/api.js'

const NAV_BOTTOM = [
  { id: 'profile',  label: 'Profile',  icon: 'user'     },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function Ic({ name, size = 17 }) {
  const s = { width: size, height: size }
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'dashboard':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
    case 'list':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
    case 'upload':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
    case 'target':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
    case 'chart':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
    case 'tag':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
    case 'user':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    case 'settings':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    case 'search':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    case 'calendar':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    case 'bell':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
    case 'sun':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" /></svg>
    case 'moon':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
    default:
      return null
  }
}

function Sidebar({ active, txCount, onTxCountChange }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const NAV_MAIN = [
    { id: 'dashboard',    label: 'Dashboard',    icon: 'dashboard' },
    { id: 'transactions', label: 'Transactions', icon: 'list',   count: txCount },
    { id: 'import',       label: 'Import',       icon: 'upload'   },
    { id: 'budgets',      label: 'Budgets',      icon: 'target'   },
    { id: 'analytics',    label: 'Analytics',    icon: 'chart'    },
    { id: 'categories',   label: 'Categories',   icon: 'tag'      },
  ]

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
            onClick={() => navigate(`/${n.id}`)}
          >
            <Ic name={n.icon} />
            <span>{n.label}</span>
            {n.count != null && n.count > 0 && (
              <span className="count">{n.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="sidebar-section-label">Account</div>
      <div className="sidebar-nav">
        {NAV_BOTTOM.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`sidebar-item ${active === n.id ? 'active' : ''}`}
            onClick={() => navigate(`/${n.id}`)}
          >
            <Ic name={n.icon} />
            <span>{n.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
        <div style={{ lineHeight: 1.25, flex: 1 }}>
          <div className="sidebar-user-name">{user?.name || ''}</div>
          <div className="sidebar-user-email">{user?.email || ''}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 8px', fontSize: '12px',
            color: 'var(--text-secondary)', opacity: 0.7,
          }}
          title="Logout"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

function SearchResults({ results, onClose, onSelect }) {
  if (!results.length) return null

  return (
    <div className="search-results">
      {results.map((result) => (
        <button
          key={result.id}
          className="search-result-item"
          onClick={() => {
            onSelect(result)
            onClose()
          }}
        >
          <div className="search-result-icon">
            {result.type === 'transaction' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ) : result.type === 'merchant' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            )}
          </div>
          <div className="search-result-content">
            <div className="search-result-title">{result.title}</div>
            <div className="search-result-subtitle">{result.subtitle}</div>
          </div>
          <div className="search-result-type">{result.type}</div>
        </button>
      ))}
    </div>
  )
}

function Topbar({ theme, toggleTheme, onGlobalSearch }) {
  const [period, setPeriod] = useState('Month')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)
  const debounceTimer = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const performSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const [transactions, merchants] = await Promise.all([
        apiClient.get(`/transactions?keyword=${encodeURIComponent(query)}`).catch(() => []),
        apiClient.get(`/analytics/top-merchants`).catch(() => [])
      ])

      const results = []

      if (Array.isArray(transactions)) {
        const txResults = transactions.slice(0, 5).map(tx => ({
          id: tx._id,
          type: 'transaction',
          title: tx.merchant || 'Unknown',
          subtitle: `${tx.desc || ''} • ${new Date(tx.date).toLocaleDateString()}`,
          amount: tx.amount,
          category: tx.cat,
          action: () => navigate('/transactions')
        }))
        results.push(...txResults)
      }

      if (Array.isArray(merchants)) {
        const matchingMerchants = merchants
          .filter(m => m.name?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(m => ({
            id: `merchant-${m.name}`,
            type: 'merchant',
            title: m.name,
            subtitle: `${m.totalSpent} spent • ${m.visits} visits`,
            action: () => navigate(`/transactions?merchant=${encodeURIComponent(m.name)}`)
          }))
        results.push(...matchingMerchants)
      }

      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [navigate])

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchQuery, performSearch])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector('.search-input')?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setShowResults(true)
  }

  const handleResultSelect = (result) => {
    if (result.action) {
      result.action()
    }
    setSearchQuery('')
    setShowResults(false)
  }

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    window.dispatchEvent(new CustomEvent('periodChange', { detail: { period: newPeriod } }))
  }

  return (
    <header className="topbar">
      <div className="search" ref={searchRef}>
        <Ic name="search" size={16} />
        <input
          className="search-input"
          placeholder="Search transactions, merchants…"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setShowResults(true)}
        />
        <span className="kbd">⌘K</span>
        
        {showResults && (searchResults.length > 0 || isSearching) && (
          <div className="search-results-container">
            {isSearching ? (
              <div className="search-loading">Searching...</div>
            ) : (
              <SearchResults 
                results={searchResults} 
                onClose={() => setShowResults(false)}
                onSelect={handleResultSelect}
              />
            )}
          </div>
        )}
      </div>
      
      <div className="topbar-actions">
        <div className="period-pill">
          {['Week', 'Month', 'Quarter', 'Year'].map((p) => (
            <button
              key={p}
              type="button"
              className={period === p ? 'active' : ''}
              onClick={() => handlePeriodChange(p)}
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
        
        <button 
          type="button" 
          className="icon-btn" 
          title="Select date range"
        >
          <Ic name="calendar" size={16} />
        </button>
        
        <button 
          type="button" 
          className="icon-btn" 
          title="Notifications"
        >
          <Ic name="bell" size={16} />
          <span className="dot" />
        </button>
      </div>
    </header>
  )
}

export default function AppShell() {
  const [theme, toggleTheme] = useTheme()
  const { pathname } = useLocation()
  const active = pathname.slice(1)

  // Live transaction count for the sidebar badge
  const [txCount, setTxCount] = useState(null)

  useEffect(() => {
    apiClient.get('/transactions')
      .then(data => setTxCount(Array.isArray(data) ? data.length : null))
      .catch(() => setTxCount(null))
  }, [])

  // Called by the modal after a successful add or delete so the badge stays in sync
  function adjustTxCount(delta) {
    setTxCount(prev => prev == null ? null : prev + delta)
  }

  async function handleAddTransaction(data) {
    const result = await addTransaction(data)
    adjustTxCount(+1)
    return result
  }

  return (
    <TransactionModalProvider onSuccess={handleAddTransaction}>
      <div className="app">
        <Sidebar active={active} txCount={txCount} />
        <div className="main">
          <Topbar theme={theme} toggleTheme={toggleTheme} />
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </TransactionModalProvider>
  )
}