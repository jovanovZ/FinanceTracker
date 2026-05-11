import { useState } from 'react'
import '../styles/ForgotPassword.css'

function validateEmail(email) {
    if (!email.trim()) return 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email'
    return ''
}

export default function ForgotPassword({ nav }) {
    const [email, setEmail] = useState('lara@example.com')
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)

    function handleSubmit(e) {
        e.preventDefault()

        const validationError = validateEmail(email)
        if (validationError) {
            setError(validationError)
            setSent(false)
            return
        }

        setError('')
        setSent(true)
    }

    return (
        <div className="forgot-auth-page">
            <section className="forgot-auth-left">
                <div className="forgot-brand">
                    <div className="forgot-brand-mark">F</div>
                    <div className="forgot-brand-name">Financely</div>
                </div>

                <div className="forgot-testimonial">
                    <h1>
                        "Upload a statement on Sunday, have a clear picture of your month by
                        Monday coffee. Financely replaced three spreadsheets I used to maintain."
                    </h1>

                    <div className="forgot-person">
                        <div className="forgot-avatar">NP</div>
                        <div>
                            <div className="forgot-person-name">Nika Petrovič</div>
                            <div className="forgot-person-role">
                                Product Designer · Ljubljana
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="forgot-auth-right">
                <form className="forgot-form" onSubmit={handleSubmit} noValidate>
                    <h1>Forgot your password?</h1>

                    <p>
                        No worries. Enter your email and we’ll send you a link to reset it.
                    </p>

                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        placeholder="lara@example.com"
                        onChange={(e) => {
                            setEmail(e.target.value)
                            setError('')
                            setSent(false)
                        }}
                        aria-invalid={!!error}
                    />

                    {error && <span className="forgot-error">{error}</span>}

                    {sent && (
                        <div className="forgot-success">
                            If an account exists for this email, a reset link has been sent.
                        </div>
                    )}

                    <button type="submit">Send reset link →</button>

                    <div className="forgot-bottom">
                        Remembered your password?{' '}
                        <span onClick={() => nav('login')}>
                            Log in
                        </span>
                    </div>
                </form>

                <button type="button" className="forgot-theme-btn">
                    ☾
                </button>
            </section>
        </div>
    )
}