import Budget from "../models/Budget.js";
import catchAsync from "../utils/catchErrorAsync";
import TransactionPkg from "../models/Transaction.js";
import mongoose from "mongoose";

const Transaction = TransactionPkg.transactionModel;

const BudgetController = {
  //Get all budgets
  getAllBudgets: catchAsync(async (req, res, next) => {
    const budgets = await Budget.find({ user: req.user.id }).sort({
      month: -1,
    });
    res.status(200).json(budgets);
  }),

  //Get budgets for current month
  getCurrentMonthBudgets: catchAsync(async (req, res, next) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const budgets = await Budget.find({
      user: req.user.id,
      month: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    });

    res.status(200).json(budgets);
  }),

  //Insert new
  insertNewBudget: catchAsync(async (req, res, next) => {
    const { category, limit, month, prevMonthBudget } = req.body;

    const budgetDate = new Date(month);
    budgetDate.setDate(1);
    budgetDate.setHours(0, 0, 0, 0);

    const newBudget = await Budget.create({
      user: req.user.id,
      category,
      limit,
      month: budgetDate,
      prevMonthBudget,
    });

    res.status(201).json(newBudget);
  }),

  //UPdate budget
  updateBudget: catchAsync(async (req, res, next) => {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!budget) {
      const error = new Error("Budget not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(budget);
  }),

  //Delete budget
  deleteBudget: catchAsync(async (req, res, next) => {
    const deletedBudget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deletedBudget) {
      const error = new Error("Budget not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ message: "Budget deleted" });
  }),

  //Get budget report by category
  getBudgetReport: catchAsync(async (req, res, next) => {
    const { month } = req.query;

    let targetYear, targetMonth;

    if (month) {
      const parsedDate = new Date(month);
      if (isNaN(parsedDate.getTime())) {
        const error = new Error(
          "Invalid date format use 'YYYY-MM'.",
        );
        error.statusCode = 400;
        return next(error);
      }
      targetYear = parsedDate.getFullYear();
      targetMonth = parsedDate.getMonth();
    } else {
      const now = new Date();
      targetYear = now.getFullYear();
      targetMonth = now.getMonth();
    }

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 1);

    const budgets = await Budget.find({
      user: req.user.id,
      month: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const spentStats = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$cat",
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const report = budgets.map((b) => {
      const spentInfo = spentStats.find((s) => s._id === b.category);
      const actualSpent = spentInfo ? Math.abs(spentInfo.totalSpent) : 0;

      return {
        id: b._id,
        category: b.category,
        limit: b.limit,
        spent: actualSpent,
        remaining: b.limit - actualSpent,
        overBudget: actualSpent > b.limit,
      };
    });

    res.status(200).json({
      reportMonth: startOfMonth.toISOString().slice(0, 7),
      report,
    });
  }),

  //Suggestions for next budget
  getBudgetSuggestions: catchAsync(async (req, res, next) => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setDate(1);
    threeMonthsAgo.setHours(0, 0, 0, 0);

    const suggestions = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: threeMonthsAgo },
          amount: { $lt: 0 },
        },
      },
      {
        $group: {
          _id: "$cat",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id",
          averagePerMonth: {
            $abs: { $divide: ["$totalAmount", 3] },
          },
        },
      },
      { $sort: { averagePerMonth: -1 } },
    ]);

    res.status(200).json(suggestions);
  }),
};

export default BudgetController;
