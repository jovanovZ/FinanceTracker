import mongoose from "mongoose";
import TransactionExports from "../models/Transaction.js";

const Transaction = TransactionExports.transactionModel;

// Helper — vrne začetek in konec datumskega obsega
const getDateRange = (year, month = null) => {
  if (month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { start, end };
  }
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return { start, end };
};

// GET /statements/monthly?year=2024&month=5
export const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const { start, end } = getDateRange(year, month);

    const matchStage = {
      user: userId,
      date: { $gte: start, $lt: end },
    };

    const [totals, byCategory, topMerchants] = await Promise.all([
      // Skupni income / expenses / savings
      Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            income: {
              $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] },
            },
            expenses: {
              $sum: {
                $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            income: { $round: ["$income", 2] },
            expenses: { $round: ["$expenses", 2] },
            savings: { $round: [{ $subtract: ["$income", "$expenses"] }, 2] },
          },
        },
      ]),

      // Breakdown po kategorijah (samo odhodki)
      Transaction.aggregate([
        { $match: { ...matchStage, amount: { $lt: 0 } } },
        {
          $group: {
            _id: "$cat_id",
            total: { $sum: { $abs: "$amount" } },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryDoc",
          },
        },
        { $sort: { total: -1 } },
        {
          $project: {
            _id: 0,
            category: { $ifNull: [{ $arrayElemAt: ["$categoryDoc.name", 0] }, "Other"] },
            total: { $round: ["$total", 2] },
            count: 1,
          },
        },
      ]),

      // Top 5 merchants po porabi
      Transaction.aggregate([
        { $match: { ...matchStage, amount: { $lt: 0 } } },
        {
          $group: {
            _id: "$merchant",
            total: { $sum: { $abs: "$amount" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            merchant: "$_id",
            total: { $round: ["$total", 2] },
            count: 1,
          },
        },
      ]),
    ]);

    res.status(200).json({
      period: { year, month },
      totals: totals[0] || { income: 0, expenses: 0, savings: 0 },
      byCategory,
      topMerchants,
    });
  } catch (error) {
    next(error);
  }
};

// GET /statements/annual?year=2024
export const getAnnualReport = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const { start, end } = getDateRange(year);

    const matchStage = {
      user: userId,
      date: { $gte: start, $lt: end },
    };

    const [totals, monthly, byCategory] = await Promise.all([
      // Letni totali
      Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            income: {
              $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] },
            },
            expenses: {
              $sum: {
                $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            income: { $round: ["$income", 2] },
            expenses: { $round: ["$expenses", 2] },
            savings: { $round: [{ $subtract: ["$income", "$expenses"] }, 2] },
          },
        },
      ]),

      // Mesečni breakdown
      Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $month: "$date" },
            income: {
              $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] },
            },
            expenses: {
              $sum: {
                $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: "$_id",
            income: { $round: ["$income", 2] },
            expenses: { $round: ["$expenses", 2] },
            savings: { $round: [{ $subtract: ["$income", "$expenses"] }, 2] },
          },
        },
      ]),

      // Letni breakdown po kategorijah
      Transaction.aggregate([
        { $match: { ...matchStage, amount: { $lt: 0 } } },
        {
          $group: {
            _id: "$cat_id",
            total: { $sum: { $abs: "$amount" } },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryDoc",
          },
        },
        { $sort: { total: -1 } },
        {
          $project: {
            _id: 0,
            category: { $ifNull: [{ $arrayElemAt: ["$categoryDoc.name", 0] }, "Other"] },
            total: { $round: ["$total", 2] },
            count: 1,
          },
        },
      ]),
    ]);

    res.status(200).json({
      period: { year },
      totals: totals[0] || { income: 0, expenses: 0, savings: 0 },
      monthly,
      byCategory,
    });
  } catch (error) {
    next(error);
  }
};

// GET /statements/export/csv?year=2024&month=5
export const exportCSV = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : null;
    const { start, end } = getDateRange(year, month);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: start, $lt: end },
    }).sort({ date: -1 });

    const headers = [
      "Date",
      "Merchant",
      "Description",
      "Category",
      "Amount",
      "Currency",
      "Account",
    ];

    const rows = transactions.map((tx) => [
      new Date(tx.date).toISOString().split("T")[0],
      tx.merchant || "",
      tx.desc || "",
      tx.cat || "",
      tx.amount,
      tx.currency || "EUR",
      tx.account || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const filename = month
      ? `report-${year}-${String(month).padStart(2, "0")}.csv`
      : `report-${year}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
