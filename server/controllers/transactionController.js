import TransactionData from '../models/Transaction.js';
const Transaction = TransactionData.transactionModel;

// Vrne vse transakcije glede na filtre
// GET /transactions
export const getTransactions = async (req, res, next) => {
    try {
        const { startDate, endDate, category, type, keyword } = req.query;
        const query = { user: req.user._id };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        if (category) {
            query.cat = category;
        }

        if (type === 'income') {
            query.amount = { $gt: 0 };
        } else if (type === 'expense') {
            query.amount = { $lt: 0 };
        }

        if (keyword) {
            query.$or = [
                { merchant: { $regex: keyword, $options: 'i' } }, 
                { desc: { $regex: keyword, $options: 'i' } }
            ];
        }

        const transactions = await Transaction.find(query).sort({ date: -1 });

        return res.status(200).json(transactions);
    } catch (error) {
        return next(error); 
    }
};

// Ustvari novi transaction
// POST /transactions
export const createTransaction = async (req, res, next) => {
    try {
        
        const userId = req.user._id; 

        const { merchant, desc, amount, date, cat, account, isSub, currency, bankTransactionId, importBatchId } = req.body;

        const newTransaction = new Transaction({
            user: userId,
            merchant,
            desc,
            amount,
            date,
            cat,
            account,
            isSub,
            currency,
            bankTransactionId,
            importBatchId
        });

        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        error.statusCode = 400; 
        next(error);
    }
};

// Posodobi obstoječo transakcijo
// PATCH /transactions/:id
export const updateTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const userId = req.user._id; 

        const { cat, desc, merchant, amount, date, account, isSub, currency } = req.body;

        const updateFields = {};
        if (cat      !== undefined) updateFields.cat      = cat;
        if (desc     !== undefined) updateFields.desc     = desc;
        if (merchant !== undefined) updateFields.merchant = merchant;
        if (amount   !== undefined) updateFields.amount   = amount;
        if (date     !== undefined) updateFields.date     = date;
        if (account  !== undefined) updateFields.account  = account;
        if (isSub    !== undefined) updateFields.isSub    = isSub;
        if (currency !== undefined) updateFields.currency = currency;

        // Ker se išče glede na userId en uporabnik ne more spreminjati drugemu
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: id, user: userId }, 
            { $set: updateFields },
            { new: true, runValidators: true } 
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transakcija ne obstaja ali pa nimate pravic za urejanje.' });
        }

        res.status(200).json(updatedTransaction);
    } catch (error) {
        error.statusCode = 400;
        next(error);
    }
};

// Brisanje transakcije
// DELETE /transactions/:id
export const deleteTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const userId = req.user._id; 

        const deletedTransaction = await Transaction.findOneAndDelete({ 
            _id: id, 
            user: userId 
        });

        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transakcija ne obstaja ali pa nimate pravic za brisanje.' });
        }

        res.status(200).json({ message: 'Transakcija uspešno izbrisana.', id: deletedTransaction._id });
    } catch (error) {
        next(error);
    }
};