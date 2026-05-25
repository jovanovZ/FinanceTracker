import TransactionModule from '../models/Transaction.js';
import Budget from '../models/Budget.js';

const Transaction = TransactionModule.transactionModel;

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseMonth(query) {
  if (query.month) {
    const [y, m] = query.month.split('-').map(Number);
    return { year: y, month: m - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

function monthBounds(year, month) {
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function pctChange(current, prev) {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 1000) / 10;
}

function sumIncome(txs) {
  return txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
}

function sumExpenses(txs) {
  return txs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
}

function buildCategoryMap(txs) {
  const map = {};
  txs.filter(t => t.amount < 0).forEach(t => {
    const cat = t.cat || 'Other';
    map[cat] = (map[cat] || 0) + Math.abs(t.amount);
  });
  return map;
}

function buildInsights({ budgets_summary, savingsRate, income, expenses, currentTxs }) {
  const insights = [];

  budgets_summary
    .filter(b => b.status === 'over_budget')
    .forEach(b => {
      insights.push({
        tone: 'warn',
        title: `${b.category} budget exceeded`,
        body: `Spent €${b.spent} — €${round2(b.spent - b.limit)} over your €${b.limit} limit.`,
      });
    });

  budgets_summary
    .filter(b => b.status === 'close_to_limit')
    .forEach(b => {
      insights.push({
        tone: 'warn',
        title: `${b.category} at ${b.percentage}% of budget`,
        body: `Only €${round2(b.limit - b.spent)} remaining of your €${b.limit} budget.`,
      });
    });

  if (savingsRate >= 30) {
    insights.push({
      tone: 'good',
      title: `Great savings rate: ${Math.round(savingsRate)}%`,
      body: `You saved €${round2(income - expenses)} this month — above the recommended 20%.`,
    });
  }

  const anomalies = currentTxs.filter(t => t.isAnomaly);
  if (anomalies.length > 0) {
    insights.push({
      tone: 'warn',
      title: `${anomalies.length} unusual transaction${anomalies.length > 1 ? 's' : ''} detected`,
      body: 'Check your recent transactions for flagged anomalies.',
    });
  }

  return insights;
}

// GET /analytics/dashboard
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = parseMonth(req.query);
    const { start, end } = monthBounds(year, month);

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const { start: prevStart, end: prevEnd } = monthBounds(prevYear, prevMonth);

    const sixMonthsStart = new Date(year, month - 5, 1);

    const [currentTxs, prevTxs, budgets, recentTxs, trendRaw] = await Promise.all([
      Transaction.find({ user: userId, date: { $gte: start, $lte: end } }),
      Transaction.find({ user: userId, date: { $gte: prevStart, $lte: prevEnd } }),
      Budget.find({ user: userId, month: { $gte: start, $lte: end } }),
      Transaction.find({ user: userId }).sort({ date: -1 }).limit(6),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsStart, $lte: end } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            income: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
            expenses: { $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const income = sumIncome(currentTxs);
    const expenses = sumExpenses(currentTxs);
    const saved = income - expenses;
    const savingsRate = income > 0 ? (saved / income) * 100 : 0;

    const prevIncome = sumIncome(prevTxs);
    const prevExpenses = sumExpenses(prevTxs);

    // Forecast: project current spend rate to end of month
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysElapsed = isCurrentMonth ? now.getDate() : daysInMonth;
    const daysRemaining = isCurrentMonth ? daysInMonth - daysElapsed : 0;
    const dailyExpenseRate = daysElapsed > 0 ? expenses / daysElapsed : 0;
    const forecast = saved - dailyExpenseRate * daysRemaining;

    const monthly_trend = trendRaw.map(m => ({
      month: MONTH_LABELS[m._id.month - 1],
      income: round2(m.income),
      expenses: round2(m.expenses),
    }));

    const sparklines = {
      income: trendRaw.map(m => round2(m.income)),
      expenses: trendRaw.map(m => round2(m.expenses)),
      saved: trendRaw.map(m => round2(m.income - m.expenses)),
    };

    const catMap = buildCategoryMap(currentTxs);
    const spending_by_category = Object.entries(catMap)
      .map(([cat, total]) => ({ cat, total: round2(total) }))
      .sort((a, b) => b.total - a.total);

    const budgets_summary = budgets.map(b => {
      const spent = currentTxs
        .filter(t => t.amount < 0 && t.cat === b.category)
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return {
        category: b.category,
        limit: b.limit,
        spent: round2(spent),
        percentage: Math.round(pct),
        status: pct >= 100 ? 'over_budget' : pct >= 85 ? 'close_to_limit' : 'on_track',
      };
    });

    const insights = buildInsights({ budgets_summary, savingsRate, income, expenses, currentTxs });

    res.json({
      kpi: {
        income: round2(income),
        income_change: pctChange(income, prevIncome),
        expenses: round2(expenses),
        expenses_change: pctChange(expenses, prevExpenses),
        saved: round2(saved),
        savings_rate: Math.round(savingsRate * 10) / 10,
        forecast: round2(forecast),
        sparklines,
      },
      monthly_trend,
      spending_by_category,
      budgets_summary,
      recent_transactions: recentTxs,
      insights,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /analytics/overview
export const getOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = parseMonth(req.query);
    const { start, end } = monthBounds(year, month);
    const sixMonthsStart = new Date(year, month - 5, 1);

    const [trendRaw, currentTxs] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsStart, $lte: end } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            income: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
            expenses: { $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Transaction.find({ user: userId, date: { $gte: start, $lte: end } }),
    ]);

    const monthly_trend = trendRaw.map(m => ({
      month: MONTH_LABELS[m._id.month - 1],
      income: round2(m.income),
      expenses: round2(m.expenses),
    }));

    const catMap = buildCategoryMap(currentTxs);
    const top_categories = Object.entries(catMap)
      .map(([name, value]) => ({ name, value: round2(value) }))
      .sort((a, b) => b.value - a.value);

    const expenseTxs = currentTxs.filter(t => t.amount < 0);

    // Weekend vs weekday average daily spend
    const weekendTxs = expenseTxs.filter(t => [0, 6].includes(new Date(t.date).getDay()));
    const weekdayTxs = expenseTxs.filter(t => ![0, 6].includes(new Date(t.date).getDay()));

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let weekendDays = 0;
    let weekdayDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month, d).getDay();
      if (day === 0 || day === 6) weekendDays++; else weekdayDays++;
    }

    const weekendTotal = weekendTxs.reduce((s, t) => s + Math.abs(t.amount), 0);
    const weekdayTotal = weekdayTxs.reduce((s, t) => s + Math.abs(t.amount), 0);
    const weekend_avg = weekendDays > 0 ? round2(weekendTotal / weekendDays) : 0;
    const weekday_avg = weekdayDays > 0 ? round2(weekdayTotal / weekdayDays) : 0;

    // Biggest single expense
    const biggest = expenseTxs.length > 0
      ? expenseTxs.reduce((min, t) => t.amount < min.amount ? t : min, expenseTxs[0])
      : null;

    // Top merchant by total spend
    const merchantMap = {};
    expenseTxs.forEach(t => {
      const name = t.merchant || 'Unknown';
      if (!merchantMap[name]) merchantMap[name] = { total: 0, visits: 0, cat: t.cat };
      merchantMap[name].total += Math.abs(t.amount);
      merchantMap[name].visits++;
    });
    const topEntry = Object.entries(merchantMap).sort((a, b) => b[1].total - a[1].total)[0];

    res.json({
      monthly_trend,
      top_categories,
      key_metrics: {
        weekend_avg,
        weekday_avg,
        biggest_expense: biggest
          ? { amount: round2(Math.abs(biggest.amount)), merchant: biggest.merchant, cat: biggest.cat, date: biggest.date }
          : null,
        top_merchant: topEntry
          ? { name: topEntry[0], total: round2(topEntry[1].total), visits: topEntry[1].visits, cat: topEntry[1].cat }
          : null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};