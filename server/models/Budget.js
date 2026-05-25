import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //Ime user tabele
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

    // spent: {
    //   type: Number,
    //   default: 0,
    //   required: true,
    // },

    prevMonthBudget: {
     type: mongoose.Schema.Types.ObjectId,
      default: "Budget",
      required: false,
    },
  },
  { timestamps: true },
);

budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
