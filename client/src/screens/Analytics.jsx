import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getMonthlyTrends,
  getInsights,
  getTopCategories,
  getWeekendVsWeekday,
  getBiggestExpense,
  getTopMerchants,
} from '../services/analyticsService';

const makeFmt = (currency = 'EUR') => (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n ?? 0);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_COLORS = {
  'Housing & Bills': '#7C3AED',
  'Groceries': '#10B981',
  'Transport': '#06B6D4',
  'Shopping': '#EC4899',
  'Dining & Cafes': '#F97316',
  'Subscriptions': '#3B82F6',
  'Leisure': '#D97706',
  'Health': '#22C55E',
  'Other': '#94A3B8',
};
const categoryColor = (name) => CATEGORY_COLORS[name] ?? '#94A3B8';

function SkeletonBlock({ w = '100%', h = 20, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--line) 50%, var(--surface-2) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function IncomeExpensesChart({ trends, period, fmt }) {
  if (!trends?.length) return <SkeletonBlock h={200} />;

  const count = period === 'Quarter' ? 3 : period === 'Year' ? 12 : 6;
  const data = trends.slice(-Math.max(count, 6));
  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 200, paddingBottom: 28, position: 'relative' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <div key={f} style={{
          position: 'absolute', left: 0, right: 0,
          bottom: 28 + f * 172,
          borderTop: '1px dashed var(--line-2)', zIndex: 0,
        }} />
      ))}
      {data.map((d, i) => {
        const incH = Math.max((d.income / maxVal) * 172, 4);
        const expH = Math.max((d.expenses / maxVal) * 172, 4);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 172 }}>
              <div title={`Income: ${fmt(d.income)}`} style={{ width: 22, height: incH, borderRadius: '4px 4px 0 0', background: '#3B5BDB', transition: 'height 0.6s ease', cursor: 'default' }} />
              <div title={`Expenses: ${fmt(d.expenses)}`} style={{ width: 22, height: expH, borderRadius: '4px 4px 0 0', background: 'var(--text-3)', transition: 'height 0.6s ease', cursor: 'default' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
              {MONTH_NAMES[(d.month - 1 + 12) % 12]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TopCategoriesChart({ categories, fmt }) {
  if (!categories?.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[...Array(6)].map((_, i) => <SkeletonBlock key={i} h={14} />)}
    </div>
  );

  const max = Math.max(...categories.map((c) => c.totalSpent), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {categories.map((c) => (
        <div key={c.categoryName} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: categoryColor(c.categoryName), flexShrink: 0 }} />
          <span style={{ width: 120, fontSize: 13, color: 'var(--text)', flexShrink: 0 }}>{c.categoryName}</span>
          <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${(c.totalSpent / max) * 100}%`,
              height: '100%',
              background: categoryColor(c.categoryName),
              borderRadius: 4,
              transition: 'width 0.7s ease',
            }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', minWidth: 44, textAlign: 'right' }}>
            {fmt(c.totalSpent)}
          </span>
        </div>
      ))}
    </div>
  );
}

function InsightCard({ label, badge, children }) {
  return (
    <div style={{
      flex: 1, minWidth: 220,
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 14, padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
        {label}
      </span>
      {children}
      {badge && (
        <span style={{
          display: 'inline-block', alignSelf: 'flex-start', marginTop: 4,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const fmt = makeFmt(user?.currency || 'EUR');

  const [period, setPeriod]             = useState('Month');
  const [trends, setTrends]             = useState(null);
  const [insights, setInsights]         = useState(null);
  const [topCategories, setTopCategories] = useState(null);
  const [weekendData, setWeekendData]   = useState(null);
  const [biggestExpense, setBiggestExpense] = useState(null);
  const [topMerchant, setTopMerchant]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMonthlyTrends(),
      getInsights(),
      getTopCategories(),
      getWeekendVsWeekday(),
      getBiggestExpense(),
      getTopMerchants(),
    ])
      .then(([t, ins, tc, wk, be, tm]) => {
        setTrends(t);
        setInsights(ins);
        setTopCategories(tc);

        const wkObj = {};
        (wk ?? []).forEach((row) => { wkObj[row.period] = row; });
        setWeekendData(wkObj.weekend && wkObj.weekday ? {
          weekend: wkObj.weekend.avgPerTransaction,
          weekday: wkObj.weekday.avgPerTransaction,
          percentageDiff: wkObj.weekday.avgPerTransaction > 0
            ? Math.round(((wkObj.weekend.avgPerTransaction - wkObj.weekday.avgPerTransaction) / wkObj.weekday.avgPerTransaction) * 100)
            : 0,
        } : null);

        setBiggestExpense(be);
        setTopMerchant(tm?.[0] ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="analytics-page">
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>Analytics</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-3)' }}>
            Trends, patterns, and insights across your finances.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#DC2626', fontSize: 14 }}>
          Failed to load analytics: {error}
        </div>
      )}

      {/* Top row: Income vs Expenses chart only (Top Categories commented out until backend is ready) */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Income vs Expenses */}
        <div style={{ flex: '2 1 420px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '24px 28px' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Income vs. expenses</span>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Last 6 months</span>
          <div style={{ display: 'flex', gap: 20, margin: '12px 0 8px' }}>
            {[['#3B5BDB', 'Income'], ['var(--text-3)', 'Expenses']].map(([color, label]) => (
              <span key={label} style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
          {loading ? <SkeletonBlock h={200} /> : <IncomeExpensesChart trends={trends} period={period} fmt={fmt} />}
        </div>

        {/* Top Categories */}
        <div style={{ flex: '1 1 300px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '24px 28px' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Top spend categories</span>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)', marginTop: 2, marginBottom: 18 }}>This month</span>
          {loading
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[...Array(6)].map((_, i) => <SkeletonBlock key={i} h={14} />)}</div>
            : <TopCategoriesChart categories={topCategories} fmt={fmt} />
          }
        </div>
      </div>

      {/* Row 2: Insight cards */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

        {/* Weekend vs Weekday */}
        <InsightCard
          label="Weekend vs. Weekday"
          badge={loading || !weekendData ? null
            : weekendData.percentageDiff > 0
              ? `Weekends ${weekendData.percentageDiff}% higher`
              : weekendData.percentageDiff < 0
                ? `Weekdays ${Math.abs(weekendData.percentageDiff)}% higher`
                : 'About equal'
          }
        >
          {loading ? <SkeletonBlock h={40} w={120} /> : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)' }}>
                {weekendData?.weekend != null ? fmt(weekendData.weekend) : '—'}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-3)' }}>
                {weekendData?.weekday != null ? fmt(weekendData.weekday) : '—'}
              </span>
            </div>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>avg per transaction</span>
        </InsightCard>

        {/* Biggest Single Expense */}
        <InsightCard
          label="Biggest Single Expense"
          badge={loading || !biggestExpense ? null : biggestExpense.cat ?? biggestExpense.category ?? null}
        >
          {loading ? <SkeletonBlock h={40} w={140} /> : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)' }}>
                {biggestExpense?.amount != null ? fmt(Math.abs(biggestExpense.amount)) : '—'}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-3)' }}>
                {biggestExpense?.desc ?? biggestExpense?.merchant ?? ''}
              </span>
            </div>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {biggestExpense?.merchant ?? ''}
          </span>
        </InsightCard>

        {/* Top Merchant */}
        <InsightCard
          label="Top Merchant"
          badge={loading || !topMerchant ? null : `${topMerchant.transactionCount} visits`}
        >
          {loading ? <SkeletonBlock h={40} w={100} /> : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)' }}>
                {topMerchant?.merchant ?? '—'}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-3)' }}>
                {topMerchant?.totalSpent != null ? fmt(topMerchant.totalSpent) : ''}
              </span>
            </div>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>most visited merchant</span>
        </InsightCard>

      </div>
    </div>
  );
}