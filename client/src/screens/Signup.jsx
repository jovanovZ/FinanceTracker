import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../hooks/useTheme'
import AuthSide from '../components/AuthSide'
import { GoogleIcon, AppleIcon, EyeIcon, EyeOffIcon } from '../assets/icons/AuthIcons'
import { MoonIcon, SunIcon } from '../assets/icons/ThemeIcons'
import '../styles/Auth.css'

const Signup = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [theme, toggleTheme] = useTheme()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const result = await register({ fullName: name, email, password })
      if (result.success) {
        navigate('/onboarding')  // nov user — vedno onboarding
      }
      if (!result.success) setError(result.error || 'Registration failed.')
    } catch {
      setError('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-wrap">
        <AuthSide />
        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h1>Create account</h1>
            <p className="auth-form-sub">Start tracking your finances in minutes.</p>

            {error && (
              <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee', color: '#c33', borderRadius: '8px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div className="auth-sso">
              <button type="button" className="sso-btn"><GoogleIcon /> Google</button>
              <button type="button" className="sso-btn"><AppleIcon /> Apple</button>
            </div>

            <div className="divider">or with email</div>

            <div className="field">
              <label htmlFor="signup-name">Full name</label>
              <input id="signup-name" className="input" type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required />
            </div>

            <div className="field">
              <label htmlFor="signup-email">Email</label>
              <input id="signup-email" className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>

            <div className="field">
              <label htmlFor="signup-password">Password</label>
              <div className="input-affix">
                <input id="signup-password" className="input" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
                <button className="input-affix-right" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Hide password' : 'Show password'} type="button">
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="signup-confirm">Confirm password</label>
              <div className="input-affix">
                <input id="signup-confirm" className="input" type={showConfirmPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                <button className="input-affix-right" onClick={() => setShowConfirmPass(v => !v)} aria-label={showConfirmPass ? 'Hide password' : 'Show password'} type="button">
                  {showConfirmPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>

            <p className="auth-footer">
              Already have an account?{' '}
              <a onClick={() => navigate('/login')}>Log in</a>
            </p>
          </form>

          <button type="button" className="auth-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup
