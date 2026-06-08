import { useState, useEffect } from 'react';

import { useAuth } from '../hooks/useAuth';

import {
  getMonthlyTrends,
  getInsights,
  // getWeekendVsWeekday, 
  // getBiggestExpense,
  // getTopMerchant, 
  // getTopCategories, 
} from '../services/analyticsService';

const makeFmt = (currency = 'EUR') => (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n ?? 0);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_COLORS = {
  'Housing & Bills': '#7C3AED',
  Groceries: '#10B981',
  Transport: '#06B6D4',
  Shopping: '#EC4899',
  'Dining & Cafes': '#F97316',
  Subscriptions: '#3B82F6',
  Leisure: '#D97706',
  Health: '#22C55E',
  Other: '#94A3B8',
};

const categoryColor = (cat) => CATEGORY_COLORS[cat] ?? '#94A3B8';


function SkeletonBlock({ w = '100%', h = 20, r = 6 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }}
    />
  );
}

function IncomeExpensesChart({ trends, period, fmt }) {
  if (!trends?.length) return <SkeletonBlock h={200} />;


  const count = period === 'Week' ? 1 : period === 'Month' ? 1 : period === 'Quarter' ? 3 : period === 'Year' ? 12 : 6;
  const data = trends.slice(-Math.max(count, 6));

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 200, paddingBottom: 28, position: 'relative' }}>
      {/* Y-axis ghost lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <div
          key={f}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 28 + f * 172,
            borderTop: '1px dashed #e2e8f0',
            zIndex: 0,
          }}
        />
      ))}

      {data.map((d, i) => {
        const incH = Math.max((d.income / maxVal) * 172, 4);
        const expH = Math.max((d.expenses / maxVal) * 172, 4);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 172 }}>
              {/* Income bar */}
              <div
                title={`Income: ${fmt(d.income)}`}
                style={{
                  width: 22,
                  height: incH,
                  borderRadius: '4px 4px 0 0',
                  background: '#3B5BDB',
                  transition: 'height 0.6s ease',
                  cursor: 'default',
                }}
              />
              {/* Expense bar */}
              <div
                title={`Expenses: ${fmt(d.expenses)}`}
                style={{
                  width: 22,
                  height: expH,
                  borderRadius: '4px 4px 0 0',
                  background: '#CBD5E1',
                  transition: 'height 0.6s ease',
                  cursor: 'default',
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
              {MONTH_NAMES[(d.month - 1 + 12) % 12]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

//  GET /analytics/top-categories
/*
function TopCategoriesChart({ categories, fmt }) {
  if (!categories?.length) return <SkeletonBlock h={200} />;
  
  const max = Math.max(...categories.map((c) => c.amount), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {categories.map((c) => (
        <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: categoryColor(c.name),
              flexShrink: 0,
            }}
          />
          <span style={{ width: 120, fontSize: 13, color: '#334155', flexShrink: 0 }}>{c.name}</span>
          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(c.amount / max) * 100}%`,
                height: '100%',
                background: categoryColor(c.name),
                borderRadius: 4,
                transition: 'width 0.7s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', minWidth: 40, textAlign: 'right' }}>
            {fmt(c.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
*/

function InsightCard({ label, children, badge }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 220,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#94A3B8', textTransform: 'uppercase' }}>
        {label}
      </span>
      {children}
      {badge && (
        <span
          style={{
            display: 'inline-block',
            alignSelf: 'flex-start',
            marginTop: 4,
            background: '#EFF6FF',
            color: '#2563EB',
            fontSize: 12,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 20,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const fmt = makeFmt(user?.currency || 'EUR');
  const [period, setPeriod] = useState('Month');
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState(null);
  // const [topCategories, setTopCategories] = useState(null); 
  // const [weekendData, setWeekendData] = useState(null); 
  // const [biggestExpense, setBiggestExpense] = useState(null); 
  // const [topMerchant, setTopMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMonthlyTrends(),
      getInsights(),
      // getTopCategories(),   
      // getWeekendVsWeekday(),  
      // getBiggestExpense(),    
      // getTopMerchant(), 
    ])
      .then(([t, ins]) => {
        setTrends(t);
        setInsights(ins);
        // setTopCategories(tc);   
        // setWeekendData(wk);    
        // setBiggestExpense(be);  
        // setTopMerchant(tm);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="analytics-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0f172a' }}>Analytics</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            Trends, patterns, and insights across your finances.
          </p>
        </div>

        {/* Period switcher */}
        <div
          style={{
            display: 'flex',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}
        >
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: '#DC2626', fontSize: 14 }}>
          Failed to load analytics: {error}
        </div>
      )}

      {/* Top row: Income vs Expenses chart only (Top Categories commented out until backend is ready) */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Income vs Expenses chart */}
        <div
          style={{
            flex: '1 1 100%',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '24px 28px',
          }}
        >
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Income vs. expenses</span>
          </div>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Last 6 months</span>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, margin: '12px 0 8px' }}>
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#3B5BDB', display: 'inline-block' }} />
              Income
            </span>
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#CBD5E1', display: 'inline-block' }} />
              Expenses
            </span>
          </div>

          {loading ? <SkeletonBlock h={200} /> : <IncomeExpensesChart trends={trends} period={period} fmt={fmt} />}
        </div>

        {/* TODO: GET /analytics/top-categories*/}
        {/* 
        <div
          style={{
            flex: '1 1 300px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '24px 28px',
          }}
        >
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Top spend categories</span>
          </div>
          <span style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 18 }}>This month</span>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(6)].map((_, i) => <SkeletonBlock key={i} h={14} />)}
            </div>
          ) : (
            <TopCategoriesChart categories={topCategories} fmt={fmt} />
          )}
        </div>
        */}
      </div>

      {/* TODO: Bottom row insight cards */}
      {/* 
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <InsightCard
          label="Weekend vs. Weekday"
          badge={loading ? null : weekendData?.label ?? null}
        >
          {loading ? (
            <SkeletonBlock h={40} w={120} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#0f172a' }}>
                {weekendData?.weekend != null ? fmt(weekendData.weekend) : '—'}
              </span>
              <span style={{ fontSize: 14, color: '#94A3B8' }}>
                {weekendData?.weekday != null ? fmt(weekendData.weekday) : '—'}
              </span>
            </div>
          )}
          <span style={{ fontSize: 12, color: '#64748b' }}>avg per day</span>
        </InsightCard>

        <InsightCard
          label="Biggest Single Expense"
          badge={loading ? null : biggestExpense ? `${biggestExpense.percentageOfTotal}% of total` : null}
        >
          {loading ? (
            <SkeletonBlock h={40} w={140} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#0f172a' }}>
                {biggestExpense?.amount != null ? fmt(biggestExpense.amount) : '—'}
              </span>
              <span style={{ fontSize: 14, color: '#94A3B8' }}>{biggestExpense?.desc ?? ''}</span>
            </div>
          )}
          <span style={{ fontSize: 12, color: '#64748b' }}>{biggestExpense?.category ?? ''}</span>
        </InsightCard>

        <InsightCard
          label="Top Merchant"
          badge={loading ? null : topMerchant?.category ?? null}
        >
          {loading ? (
            <SkeletonBlock h={40} w={100} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#0f172a' }}>
                {topMerchant?.merchant ?? '—'}
              </span>
              <span style={{ fontSize: 14, color: '#94A3B8' }}>
                {topMerchant?.totalSpent != null ? fmt(topMerchant.totalSpent) : ''}
              </span>
            </div>
          )}
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {topMerchant?.visits ? `${topMerchant.visits} visits` : ''}
          </span>
        </InsightCard>
      </div>
      */}
    </div>
  );
}