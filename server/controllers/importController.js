import { randomUUID } from 'crypto';
import parseCSVBuffer from '../services/csvParser.js';
import categorize from '../services/categorizer.js';
import TransactionExports from '../models/Transaction.js';
import ImportHistory from '../models/ImportHistory.js';

const { transactionModel: Transaction } = TransactionExports;

const importCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    var { transactions, errors } = await parseCSVBuffer(req.file.buffer);
    transactions = await categorize(transactions);

    const importBatchId = randomUUID();
    const userId = req.user._id;

    const toSave = transactions.map(({ type, ...t }) => ({
      ...t,
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

    const dates = toSave.map(t => t.date);
    const dateRange = {
      from: new Date(Math.min(...dates)),
      to: new Date(Math.max(...dates)),
    };

    await ImportHistory.create({
      user: userId,
      importBatchId,
      fileName: req.file.originalname,
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
      parseErrors: errors,
      transactions,
    });
  } catch (err) {
    return res.status(422).json({ success: false, message: err.message });
  }
};

export default importCSV;
