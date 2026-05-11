import parseCSVBuffer from '../services/csvParser.js';
import categorize from '../services/categorizer.js';

const importCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    var { transactions, errors } = await parseCSVBuffer(req.file.buffer);
    console.log(transactions);
    transactions = await categorize(transactions);


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

export default importCSV;