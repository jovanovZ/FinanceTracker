import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthSide from '../components/AuthSide';
import { GoogleIcon, AppleIcon, EyeIcon, EyeOffIcon } from '../assets/icons/AuthIcons';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('lara@example.com');
  const [password, setPassword] = useState('mypassword123');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Začasni fake token dokler backend ne bo nared
    localStorage.setItem('token', 'fake-jwt-token');
    navigate('/onboarding');
  };

  return (
    <div className="auth-root">
      <div className="auth-wrap">
        <AuthSide />

        <div className="auth-form-wrap">
          <div className="auth-form">
            <h1>Welcome back</h1>
            <p className="auth-form-sub">Log in to pick up where you left off.</p>

            <div className="auth-sso">
              <button className="sso-btn"><GoogleIcon /> Google</button>
              <button className="sso-btn"><AppleIcon /> Apple</button>
            </div>

            <div className="divider">or with email</div>

            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="input-affix">
                <input
                  id="login-password"
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  className="input-affix-right"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  type="button"
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                Remember me for 30 days
              </label>
              <button type="button" className="link-btn" onClick={() => navigate('/forgot-password')}>
                Forgot password?
              </button>
            </div>

            <button className="btn-primary" onClick={handleSubmit}>
              Log in →
            </button>

            <p className="auth-footer">
              New here?{' '}
              <a onClick={() => navigate('/signup')}>Create an account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;