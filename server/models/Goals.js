import mongoose from "mongoose";

const goalsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Ime
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Končni znesek
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Trenutni znesek
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Do kdaj želi doseči cilj
    targetDate: {
      type: Date,
      required: true,
    },

    // Valuta
    currency: {
      type: String,
      default: "EUR",
    },

    // Status cilja
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, createdAt: -1 });

const GoalsModel = mongoose.model("Goals", goalsSchema);
export default GoalsModel;