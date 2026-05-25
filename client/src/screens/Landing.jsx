import { Link } from 'react-router-dom'
import './Landing.css'

const features = [
  {
    title: 'Import statements',
    text: 'Upload CSV or OFX files and turn messy bank exports into clean transaction history.',
  },
  {
    title: 'Track budgets',
    text: 'Set monthly limits, see remaining money, and catch overspending before it surprises you.',
  },
  {
    title: 'Understand trends',
    text: 'See where your money goes with category insights, forecasts, and simple monthly summaries.',
  },
]

const stats = [
  { label: 'Income', value: 'EUR2,321', tone: 'good' },
  { label: 'Expenses', value: 'EUR1,232', tone: 'neutral' },
  { label: 'Saved', value: 'EUR1,089', tone: 'good' },
]

export default function Landing() {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link to="/" className="landing-brand">
          <span>F</span>
          Financely
        </Link>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#security">Security</a>
        </div>

        <div className="landing-actions">
          <Link to="/login" className="landing-link-btn">Log in</Link>
          <Link to="/signup" className="landing-primary-btn">Get started</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-kicker">Personal finance, without spreadsheets</span>
          <h1>Understand your money before the month runs away from you.</h1>
          <p>
            Financely helps you import transactions, organize spending, build budgets,
            and see a clear picture of your money in one calm workspace.
          </p>

          <div className="landing-hero-actions">
            <Link to="/signup" className="landing-primary-btn landing-large-btn">Create free account</Link>
            <Link to="/login" className="landing-secondary-btn landing-large-btn">I already have one</Link>
          </div>
        </div>

        <div className="landing-preview" aria-label="Finance dashboard preview">
          <div className="landing-preview-top">
            <span />
            <span />
            <span />
          </div>

          <div className="landing-preview-grid">
            {stats.map((stat) => (
              <div className="landing-stat" key={stat.label}>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
                <span className={stat.tone}>This month</span>
              </div>
            ))}
          </div>

          <div className="landing-chart">
            <span style={{ height: '42%' }} />
            <span style={{ height: '64%' }} />
            <span style={{ height: '50%' }} />
            <span style={{ height: '78%' }} />
            <span style={{ height: '58%' }} />
            <span style={{ height: '86%' }} />
            <span style={{ height: '70%' }} />
          </div>

          <div className="landing-budget-strip">
            <div>
              <strong>Groceries</strong>
              <span>EUR247 of EUR320</span>
            </div>
            <div className="landing-progress">
              <span />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-section-head">
          <span>Features</span>
          <h2>Everything you need for a monthly money routine.</h2>
        </div>

        <div className="landing-feature-grid">
          {features.map((feature) => (
            <article className="landing-feature-card" key={feature.title}>
              <div className="landing-feature-icon" />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-steps" id="how-it-works">
        <div>
          <span>01</span>
          <h3>Import your bank export</h3>
          <p>Start with the files your bank already gives you.</p>
        </div>
        <div>
          <span>02</span>
          <h3>Review categories</h3>
          <p>Clean up transactions and keep spending grouped correctly.</p>
        </div>
        <div>
          <span>03</span>
          <h3>Set budgets</h3>
          <p>Follow progress through the month and adjust with confidence.</p>
        </div>
      </section>

      <section className="landing-security" id="security">
        <div>
          <span>Security</span>
          <h2>Your financial data stays private and organized.</h2>
          <p>
            Financely is designed around clear account access, protected routes,
            and a workspace that keeps sensitive financial activity easy to review.
          </p>
        </div>
        <Link to="/signup" className="landing-primary-btn landing-large-btn">Start now</Link>
      </section>
    </main>
  )
}
