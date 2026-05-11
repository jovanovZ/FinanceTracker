const { parseCSVBuffer } = require('../services/csvParser');

const importCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const { transactions, errors } = await parseCSVBuffer(req.file.buffer);

    return res.status(200).json({
      success: true,
      imported: transactions.length,
      errors,
      transactions,
    });
  } catch (err) {
    return res.status(422).json({ success: false, message: err.message });
  }
};

module.exports = { importCSV };
