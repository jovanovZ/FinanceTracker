import mongoose from "mongoose";
import transactionSchema from "../models/Transaction.js"


const Schema = mongoose.Schema;

const categorySchema = new Schema({
  id: Number,
  name: String,
  transactions: [transactionSchema.transactionSchema],
  keywords: [String],
  companies: [String],
  isSub: Boolean
});
categorySchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

const CategoryModel = mongoose.model("Category", categorySchema);
export default CategoryModel;