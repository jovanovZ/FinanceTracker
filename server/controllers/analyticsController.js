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

function buildCategoryMap(txs) {
  const map = {};
  txs.filter(t => t.amount < 0).forEach(t => {
    const cat = t.cat || 'Other';
    map[cat] = (map[cat] || 0) + Math.abs(t.amount);
  });
  return map;
}

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