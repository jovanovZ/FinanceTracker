import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import onboardingService from '../services/onboardingService';

function Ic({ name, size = 17 }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'student':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
    case 'briefcase':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
    case 'family':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'sparkles':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
    case 'plus':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'check':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'arrowRight':
      return <svg style={s} viewBox="0 0 24 24" {...stroke}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    default: return null;
  }
}

const PERSONAS = [
  { id: 'student',    icon: 'student',    title: 'Student',           desc: 'Tight monthly budget, mostly food & transport' },
  { id: 'employee',  icon: 'briefcase',  title: 'Young professional', desc: 'Single income, want savings + goals' },
  { id: 'family',    icon: 'family',     title: 'Family',             desc: 'Shared expenses across household' },
  { id: 'freelance', icon: 'sparkles',   title: 'Freelancer',         desc: 'Variable income, invoicing & taxes' },
];

const GOALS = [
  'Track spending', 'Stick to a budget', 'Grow savings',
  'Pay off debt', 'Plan a big purchase', 'Cut subscriptions',
];

const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
];

function StepWelcome() {
  return (
    <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
        display: 'grid', placeItems: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 8px 24px oklch(0.55 0.19 265 / 0.3)',
      }}>
        <span style={{ fontSize: 28 }}>👋</span>
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
        Welcome to Financely
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14.5, margin: '0 auto', lineHeight: 1.6, maxWidth: 420 }}>
        Let's take 2 minutes to personalise your experience. We'll set up your workspace so it feels like it was built just for you.
      </p>
      <div style={{
        display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28,
        flexWrap: 'wrap',
      }}>
        {['Smart defaults', 'Relevant categories', 'Tailored goals'].map(f => (
          <span key={f} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 999,
            background: 'var(--accent-soft)', color: 'var(--accent)',
            fontSize: 12.5, fontWeight: 600,
          }}>
            <Ic name="check" size={12} /> {f}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepPersona({ persona, setPersona, goals, setGoals }) {
  const toggleGoal = (g) => setGoals(prev =>
    prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
  );

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
        Who are you setting up Financely for?
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.55 }}>
        We'll pre-fill sensible defaults and suggest relevant categories based on your answer.
      </p>

      <div className="persona-grid">
        {PERSONAS.map(({ id, icon, title, desc }) => (
          <div
            key={id}
            className={`persona-opt ${persona === id ? 'selected' : ''}`}
            onClick={() => setPersona(id)}
          >
            <div className="persona-opt-icon"><Ic name={icon} size={18} /></div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.45 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          What would you like to achieve first?
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {GOALS.map(g => (
            <button
              key={g}
              type="button"
              className={`filter-pill ${goals.includes(g) ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => toggleGoal(g)}
            >
              {goals.includes(g)
                ? <Ic name="check" size={12} />
                : <Ic name="plus" size={12} />
              }
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSetup({ currency, setCurrency, monthlyBudget, setMonthlyBudget }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
        Set up your workspace
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.55 }}>
        Choose your currency and set a monthly budget to get started. You can always change these later in Settings.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="field">
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Currency
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {CURRENCIES.map(({ code, symbol, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 10,
                  border: `1.5px solid ${currency === code ? 'var(--accent)' : 'var(--line)'}`,
                  background: currency === code ? 'var(--accent-soft)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: currency === code ? 'var(--accent)' : 'var(--surface-2)',
                  color: currency === code ? '#fff' : 'var(--accent)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {symbol}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{code}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="monthly-budget" style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Monthly budget <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-3)', fontSize: 14, fontWeight: 600, pointerEvents: 'none',
            }}>
              {CURRENCIES.find(c => c.code === currency)?.symbol}
            </span>
            <input
              id="monthly-budget"
              type="number"
              className="input"
              placeholder="0"
              value={monthlyBudget}
              onChange={e => setMonthlyBudget(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
            We'll use this to track how much you've spent vs. your limit each month.
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDone({ persona }) {
  const personaLabel = PERSONAS.find(p => p.id === persona)?.title || 'your profile';
  return (
    <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'var(--good-soft)',
        display: 'grid', placeItems: 'center',
        margin: '0 auto 20px',
      }}>
        <span style={{ fontSize: 28 }}>✅</span>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
        You're all set!
      </h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14.5, margin: '0 auto', lineHeight: 1.6, maxWidth: 400 }}>
        We've configured Financely for <strong>{personaLabel}</strong>. Your dashboard is ready — let's start tracking.
      </p>
    </div>
  );
}


const STEPS = ['Welcome', 'Your profile', 'Setup', 'Done'];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState('employee');
  const [goals, setGoals] = useState([]);
  const [currency, setCurrency] = useState('EUR');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const isLast = step === STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      setSubmitting(true);
      setError('');
      try {
        const result = await onboardingService.complete({ persona, goals, currency, monthlyBudget });
        // Posodobi auth context, da je onboardingDone takoj nastavljen na true
        updateUser(result.user);
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const handleSkip = async () => {
    // Skip vseeno zaključi onboarding s poljubnimi privzetimi vrednostmi, tako da uporabnik ni preusmerjen nazaj sem ob vsaki prijavi
    setSubmitting(true);
    setError('');
    try {
      const result = await onboardingService.complete({ persona, goals, currency, monthlyBudget });
      updateUser(result.user);
      navigate('/dashboard');
    } catch {
      // Če API klic ob skip spodleti, vseeno izvedi navigacijo
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding-card">
        {/* Progress bar */}
        <div className="onboarding-steps">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-step ${i < step ? 'done' : i === step ? 'active' : ''}`}
            />
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600, marginBottom: 20 }}>
          Step {step + 1} of {STEPS.length}
        </div>

        {/* Content */}
        {step === 0 && <StepWelcome />}
        {step === 1 && (
          <StepPersona
            persona={persona} setPersona={setPersona}
            goals={goals} setGoals={setGoals}
          />
        )}
        {step === 2 && (
          <StepSetup
            currency={currency} setCurrency={setCurrency}
            monthlyBudget={monthlyBudget} setMonthlyBudget={setMonthlyBudget}
          />
        )}
        {step === 3 && <StepDone persona={persona} />}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 16, padding: '10px 14px',
            borderRadius: 8, background: 'var(--bad-soft)',
            color: 'var(--bad)', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || submitting}
            style={{
              height: 36, padding: '0 14px',
              borderRadius: 8, border: '1px solid var(--line)',
              background: 'var(--surface)', color: 'var(--text-2)',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              opacity: step === 0 ? 0.4 : 1,
            }}
          >
            ← Back
          </button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!isLast && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={submitting}
                style={{
                  height: 36, padding: '0 14px',
                  borderRadius: 8, border: '1px solid var(--line)',
                  background: 'var(--surface)', color: 'var(--text-2)',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              style={{
                height: 36, padding: '0 14px',
                borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting
                ? 'Saving…'
                : isLast
                  ? 'Go to Dashboard'
                  : <> Continue <Ic name="arrowRight" size={14} /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
