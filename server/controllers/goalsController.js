import Goal from "../models/Goals.js";

const withStats = (goal) => {
  const goalObject = goal.toObject();
  const stats = calculateGoalStats(goalObject);

  return {
    ...goalObject,
    ...stats,
  };
};

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(goals.map(withStats));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(withStats(goal));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({
      user: req.user._id,
      name: req.body.name,
      targetAmount: req.body.targetAmount,
      currentAmount: req.body.currentAmount || 0,
      targetDate: req.body.targetDate,
      currency: req.body.currency || "EUR",
      status: req.body.status || "active",
    });

    res.status(201).json(withStats(goal));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (req.body.name !== undefined) goal.name = req.body.name;
    if (req.body.targetAmount !== undefined)
      goal.targetAmount = req.body.targetAmount;
    if (req.body.currentAmount !== undefined)
      goal.currentAmount = req.body.currentAmount;
    if (req.body.targetDate !== undefined) goal.targetDate = req.body.targetDate;
    if (req.body.currency !== undefined) goal.currency = req.body.currency;
    if (req.body.status !== undefined) goal.status = req.body.status;

    const updatedGoal = await goal.save();

    res.json(withStats(updatedGoal));
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await goal.deleteOne();

    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const calculateGoalStats = (goal) => {
  const targetAmount = goal.targetAmount || 0;
  const currentAmount = goal.currentAmount || 0;

  const remainingAmount = Math.max(targetAmount - currentAmount, 0);

  const progress =
    targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

  const now = new Date();
  const targetDate = new Date(goal.targetDate);

  const monthsLeft =
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    (targetDate.getMonth() - now.getMonth());

  const safeMonthsLeft = Math.max(monthsLeft, 1);

  return {
    progress: Math.round(progress),
    remainingAmount,
    monthlyContribution: Math.ceil(remainingAmount / safeMonthsLeft),
  };
};
