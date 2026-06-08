import mongoose from "mongoose";
import transactionSchema from "../models/Transaction.js"

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  id: Number,
  name: String,
  user_id: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  keywords: [String],
  companies: [String],
  isSub: Boolean
});
categorySchema.index({ name: 1, user_id : 1 }, { unique: true });

const CategoryModel = mongoose.model("Category", categorySchema);
export default CategoryModel;