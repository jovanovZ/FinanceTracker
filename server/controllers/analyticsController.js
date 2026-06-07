import TransactionData from '../models/Transaction.js';
const Transaction = TransactionData.transactionModel;
import mongoose from 'mongoose';

// Agregacije za dashboard (prihodki, odhodki, prihranek)
// GET /analytics/dashboard
export const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const stats = await Transaction.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] }
                    },
                    totalExpenses: {
                        $sum: { $cond: [{ $lt: ["$amount", 0] }, "$amount", 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalIncome: { $round: ["$totalIncome", 2] },
                    totalExpenses: { $round: [{ $abs: "$totalExpenses" }, 2] },
                    savings: { $round: [{ $add: ["$totalIncome", "$totalExpenses"] }, 2] }
                }
            }
        ]);

        const result = stats[0] || { totalIncome: 0, totalExpenses: 0, savings: 0 };

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Trendi po mesecih (prihodki in odhodki skozi čas)
// GET /analytics/trends
export const getMonthlyTrends = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const trends = await Transaction.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    income: {
                        $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] }
                    },
                    expenses: {
                        $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] }
                    }
                }
            },

            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    income: { $round: ["$income", 2] },
                    expenses: { $round: ["$expenses", 2] }
                }
            }
        ]);

        res.status(200).json(trends);
    } catch (error) {
        next(error);
    }
};

// Top 5 trgovcev glede na porabo
// GET /analytics/top-merchants
export const getTopMerchants = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const topMerchants = await Transaction.aggregate([
           
            { 
                $match: { 
                    user: userId, 
                    amount: { $lt: 0 } 
                } 
            },
            {
                $group: {
                    _id: "$merchant",
                    totalSpent: { $sum: { $abs: "$amount" } },
                    transactionCount: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    merchant: "$_id",
                    totalSpent: { $round: ["$totalSpent", 2] },
                    transactionCount: 1
                }
            }
        ]);

        res.status(200).json(topMerchants);
    } catch (error) {
        next(error);
    }
};

// Poraba po dnevih v tednu
// GET /analytics/daily-spending
export const getDailySpending = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const dailySpending = await Transaction.aggregate([
            { 
                $match: { 
                    user: userId, 
                    amount: { $lt: 0 } 
                } 
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$date" },
                    totalSpent: { $sum: { $abs: "$amount" } }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    dayOfWeek: "$_id", // 1=Ned, 2=Pon, 3=Tor, 4=Sre, 5=Čet, 6=Pet, 7=Sob
                    totalSpent: { $round: ["$totalSpent", 2] }
                }
            }
        ]);

        res.status(200).json(dailySpending);
    } catch (error) {
        next(error);
    }
};

// Insight izračuni (peak day, najbolj potratna kategorija, delež naročnin)
// GET /analytics/insights
export const getInsights = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userObjectId = userId;

        const [peakDayData, topCategoryData, subscriptionData] = await Promise.all([
            Transaction.aggregate([
                { $match: { user: userObjectId, amount: { $lt: 0 } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        totalSpent: { $sum: { $abs: "$amount" } }
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: 1 }
            ]),

            Transaction.aggregate([
                { $match: { user: userObjectId, amount: { $lt: 0 } } },
                {
                    $group: {
                        _id: "$cat",
                        totalSpent: { $sum: { $abs: "$amount" } }
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: 1 }
            ]),

            Transaction.aggregate([
                { $match: { user: userObjectId, amount: { $lt: 0 } } },
                {
                    $group: {
                        _id: null,
                        subExpenses: {
                            $sum: { $cond: ["$isSub", { $abs: "$amount" }, 0] }
                        },
                        totalExpenses: {
                            $sum: { $abs: "$amount" }
                        }
                    }
                }
            ])
        ]);

        const peakDay = peakDayData[0] 
            ? { date: peakDayData[0]._id, amount: Math.round(peakDayData[0].totalSpent * 100) / 100 }
            : null;

        const topCategory = topCategoryData[0]
            ? { category: topCategoryData[0]._id, amount: Math.round(topCategoryData[0].totalSpent * 100) / 100 }
            : null;

        const subStats = subscriptionData[0] || { subExpenses: 0, totalExpenses: 0 };
        const subPercentage = subStats.totalExpenses > 0 
            ? Math.round((subStats.subExpenses / subStats.totalExpenses) * 100 * 100) / 100 
            : 0;

        res.status(200).json({
            peakDay,
            topCategory,
            subscriptions: {
                totalSubSpent: Math.round(subStats.subExpenses * 100) / 100,
                percentageOfTotal: subPercentage
            }
        });
    } catch (error) {
        next(error);
    }
};