import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    limit: {
      type: Number,
      default: 0,
      required: true,
    },

    month: {
      type: Date,
      required: true,
    },

    prevMonthBudget: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      required: false,
    },
  },
  { timestamps: true },
);

budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;