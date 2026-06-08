import { randomUUID } from 'crypto';
import parseCSVBuffer from '../services/csvParser.js';
import categorize from '../services/categorizer.js';
import TransactionExports from '../models/Transaction.js';
import ImportHistory from '../models/ImportHistory.js';

const { transactionModel: Transaction } = TransactionExports;

export const getImportHistory = async (req, res) => {
  try {
    const records = await ImportHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('fileName importedRecords failedRecords status dateRange createdAt importBatchId');

    return res.status(200).json({ success: true, history: records });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const parseCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    let { transactions, errors } = await parseCSVBuffer(req.file.buffer);
    transactions = await categorize(transactions, user_id);

    return res.status(200).json({
      success: true,
      parseErrors: errors,
      transactions,
    });
  } catch (err) {
    return res.status(422).json({ success: false, message: err.message });
  }
};

export const deleteImportBatch = async (req, res) => {
  const { batchId } = req.params;
  const userId = req.user._id;

  try {
    const record = await ImportHistory.findOne({ importBatchId: batchId, user: userId });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Import batch not found' });
    }

    const { deletedCount } = await Transaction.deleteMany({ importBatchId: batchId, user: userId });
    await ImportHistory.deleteOne({ importBatchId: batchId, user: userId });

    return res.status(200).json({ success: true, deletedTransactions: deletedCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const confirmImport = async (req, res) => {
  const { transactions, fileName } = req.body;

  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ success: false, message: 'No transactions to save' });
  }

  try {
    const importBatchId = randomUUID();
    const userId = req.user._id;

    const toSave = transactions.map(({ type, duplicate, id, amountRaw, category, ...t }) => ({
      ...t,
      cat: category ?? t.cat ?? '',
      user: userId,
      importBatchId,
    }));

    let savedCount = 0;
    let failedCount = 0;
    let writeErrors = [];

    try {
      const result = await Transaction.insertMany(toSave, { ordered: false });
      savedCount = result.length;
    } catch (bulkErr) {
      if (bulkErr.name === 'MongoBulkWriteError') {
        savedCount = bulkErr.result.insertedCount;
        failedCount = bulkErr.writeErrors.length;
        writeErrors = bulkErr.writeErrors.map(e => ({ row: e.index, message: e.errmsg }));
      } else {
        throw bulkErr;
      }
    }

    const dates = toSave.map(t => new Date(t.date)).filter(d => !isNaN(d));
    const dateRange = dates.length ? {
      from: new Date(Math.min(...dates)),
      to: new Date(Math.max(...dates)),
    } : {};

    await ImportHistory.create({
      user: userId,
      importBatchId,
      fileName: fileName ?? 'unknown.csv',
      source: 'csv',
      status: failedCount > 0 ? 'partial' : 'completed',
      importedRecords: savedCount,
      failedRecords: failedCount,
      errors: writeErrors,
      dateRange,
      completedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      importBatchId,
      imported: savedCount,
      failed: failedCount,
    });
  } catch (err) {
    return res.status(422).json({ success: false, message: err.message });
  }
};
