import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../hooks/useTheme'
import AuthSide from '../components/AuthSide'
import { GoogleIcon, AppleIcon, EyeIcon, EyeOffIcon } from '../assets/icons/AuthIcons'
import { MoonIcon, SunIcon } from '../assets/icons/ThemeIcons'
import '../styles/Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [theme, toggleTheme] = useTheme()

  const [email, setEmail] = useState('lara@example.com')
  const [password, setPassword] = useState('mypassword123')
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        navigate(result.user.onboardingDone ? '/dashboard' : '/onboarding')
      } else {
        setError(result.error || 'Login failed. Please try again.')
      }
    } catch {
      setError('An error occurred. Please try again.')
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
            <h1>Welcome back</h1>
            <p className="auth-form-sub">Log up to pick up where you left off.</p>

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
              <label htmlFor="login-email">Email</label>
              <input id="login-email" className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="input-affix">
                <input id="login-password" className="input" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
                <button className="input-affix-right" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Hide password' : 'Show password'} type="button">
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="checkbox-row">
              <label className="checkbox-label">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                Remember me for 30 days
              </label>
              <button type="button" className="link-btn" onClick={() => navigate('/forgot-password')}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in →'}
            </button>

            <p className="auth-footer">
              New here?{' '}
              <a onClick={() => navigate('/signup')}>Create an account</a>
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

export default Login