import './Landing.css';

export default function Landing() {
  const features = [
    {
      title: 'Import CSV & OFX',
      desc: 'Drop in a statement from any bank. We clean it and organize transactions automatically.',
    },
    {
      title: 'Smart categorization',
      desc: 'Transactions are categorized automatically and improve over time.',
    },
    {
      title: 'Budgets that fit you',
      desc: 'Create monthly budgets and get alerts before overspending.',
    },
    {
      title: 'Insights & forecasts',
      desc: 'Track your spending and see where you will land by month-end.',
    },
    {
      title: 'Recurring tracker',
      desc: 'Find subscriptions and recurring payments instantly.',
    },
    {
      title: 'Private by default',
      desc: 'Your financial data stays encrypted and secure.',
    },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <div className="logo-box">F</div>
          <span>Financely</span>
        </div>

        <div className="nav-links">
          <a href="#">Product</a>
          <a href="#">How it works</a>
          <a href="#">Security</a>
          <a href="#">Pricing</a>
          <a href="#">FAQ</a>
        </div>

        <div className="nav-actions">
          <button className="btn-ghost">Log in</button>
          <button className="btn-primary">Get started</button>
        </div>
      </nav>

      <section className="hero">
        <div className="badge">Now in private beta · Invite a friend</div>

        <h1>
          Understand your money in <span>minutes</span>, not spreadsheets.
        </h1>

        <p>
          Upload a bank statement and watch Financely categorize every
          transaction, surface your budgets, and forecast where you'll land this
          month.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary large">
            Start free — no card required 
          </button>

          <button className="btn-outline large">Watch demo</button>
        </div>

        <div className="dashboard">
          <div className="dashboard-top">
            <div className="dot red"></div>
            <div className="dot yellow"></div>
            <div className="dot green"></div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>Income</span>
              <h3>€2,321</h3>
              <small className="green">+14.7%</small>
            </div>

            <div className="stat-card">
              <span>Expenses</span>
              <h3>€1,232</h3>
              <small className="green">−16.9%</small>
            </div>

            <div className="stat-card">
              <span>Saved</span>
              <h3>€1,089</h3>
              <small className="blue">41.6%</small>
            </div>

            <div className="stat-card">
              <span>Forecast</span>
              <h3>€994</h3>
              <small>end of month</small>
            </div>
          </div>

          <div className="chart-box">
            <div className="chart-placeholder">
              Dashboard preview
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <span>WHAT YOU GET</span>
          <h2>Every feature you need to take control.</h2>
          <p>
            No more spreadsheets. Financely handles the tedious work so you can
            focus on decisions.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon"></div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="steps-section">
        <div className="section-header">
          <span>HOW IT WORKS</span>
          <h2>From CSV to clarity in three steps.</h2>
        </div>

        <div className="steps-grid">
          <div>
            <small>STEP 01</small>
            <h3>Import your statement</h3>
            <p>Upload a CSV or OFX file from your bank.</p>
          </div>

          <div>
            <small>STEP 02</small>
            <h3>Review categorization</h3>
            <p>Financely automatically suggests categories.</p>
          </div>

          <div>
            <small>STEP 03</small>
            <h3>Set budgets & watch</h3>
            <p>Create limits and monitor your monthly progress.</p>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="section-header">
          <span>FAQ</span>
          <h2>Questions, answered.</h2>
        </div>

        <div className="faq-list">
          <div className="faq-item">
            <h4>Which banks does Financely support?</h4>
            <p>Any bank that exports CSV or OFX statements.</p>
          </div>

          <div className="faq-item">
            <h4>Is my data safe?</h4>
            <p>Your data is encrypted and never shared.</p>
          </div>

          <div className="faq-item">
            <h4>How much does it cost?</h4>
            <p>The beta version is currently free.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Start making better money decisions today.</h2>
        <p>
          Free during private beta. Takes less than 2 minutes to upload your
          first statement.
        </p>

        <button className="btn-primary large">
          Create your free account
        </button>
      </section>

      <footer className="footer">
        <p>© 2026 Financely. Made for peace of mind.</p>

        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Security</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}