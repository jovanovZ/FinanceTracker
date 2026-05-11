const mongoose = require("mongoose");

const importHistorySchema = new mongoose.Schema(
  {
    // User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Id
    importBatchId: {
      type: String,
      required: true,
      unique: true,
    },

    // Ime datoteke
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    // Tip importa
    source: {
      type: String,
      enum: ["csv", "excel", "bank_api", "manual", "other"],
      default: "csv",
    },

    // Ime banke
    bankName: {
      type: String,
      trim: true,
    },

    // račun
    account: {
      type: String,
      default: "Main Account",
    },

    // Valuta
    currency: {
      type: String,
      default: "EUR",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "mapping",
        "reviewing",
        "completed",
        "failed",
        "partial",
      ],
      default: "pending",
    },

    // Koliko transakcij je bilo uspešno uvoženih
    importedRecords: {
      type: Number,
      default: 0,
    },

    // Koliko duplikatov je bilo zaznanih
    duplicateRecords: {
      type: Number,
      default: 0,
    },

    // Koliko vrstic ni uspelo
    failedRecords: {
      type: Number,
      default: 0,
    },

    // Datumski range transakcij
    dateRange: {
      from: Date,
      to: Date,
    },

    // Napake
    errors: [
      {
        row: Number,
        message: String,
      },
    ],

    // Kdaj je user potrdil import
    confirmedAt: {
      type: Date,
    },

    // Kdaj je bil import zaključen
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


importHistorySchema.index({ user: 1, createdAt: -1 });
importHistorySchema.index(
  { user: 1, importBatchId: 1 },
  { unique: true }
);

module.exports = mongoose.model("ImportHistory", importHistorySchema);