const csvParser = require('csv-parser');
const { Readable } = require('stream');

const REQUIRED_HEADERS = ['Datum', 'Opis transakcije', 'Znesek'];

function parseAmount(raw) {
  const num = parseFloat(String(raw).replace(',', '.'));
  return isNaN(num) ? null : num;
}

function parseDate(raw) {
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];

    const stream = Readable.from(buffer.toString('utf8'));

    stream
      .pipe(csvParser())
      .on('headers', (headers) => {
        const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
        if (missing.length > 0) {
          reject(new Error(`CSV manjka obvezne stolpce: ${missing.join(', ')}`));
        }
      })
      .on('data', (row, index) => {
        const datum = parseDate(row['Datum']);
        const znesek = parseAmount(row['Znesek']);

        if (!datum) {
          errors.push(`Neveljavni datum v vrstici: ${JSON.stringify(row)}`);
          return;
        }
        if (znesek === null) {
          errors.push(`Neveljaven znesek v vrstici: ${JSON.stringify(row)}`);
          return;
        }

        results.push({
          date: datum,
          description: (row['Opis transakcije'] || '').trim(),
          amount: znesek,
          type: znesek >= 0 ? 'income' : 'expense',
        });
      })
      .on('end', () => resolve({ transactions: results, errors }))
      .on('error', (err) => reject(err));
  });
}

module.exports = { parseCSVBuffer };
