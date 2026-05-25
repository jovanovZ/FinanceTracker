import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        // Transakcija mora biti povezana do uporabnika
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Odvisno kaj je ime same mongodb tabele
            required: true,
        },

        // Ime prodajalca npr. Lidl
        merchant: {
            type: String,
        },

        desc: {
            type: String, 
        },

        // Uporaba minus za negativno
        amount: {
            type: Number, 
            required: true, 
        },

        date: {
            type: Date, 
            required: true,
        },

        // Kategorija naprimer "Transport"
        cat: {
            type: String,
            default: '',
        },

        // Iz katerega računa se je bil uvoz
        account: {
            type: String, 
            default: 'Main Account', 
        },

        // Ali je transakcija naročnina
        isSub: {
            type: Boolean, 
            default: false, 
        },

        // Valuta transakcije
        currency: {
            type: String,
            default: 'EUR', 
        },

        // Ali transakcija iztopa na testu
        isAnomaly: {
            type: Boolean,
            default: false,
        },

        // Id transakcije na banki, da se prepreči dvojne uvoze
        bankTransactionId: {
            type: String, 
        },

        // Iz katere datoteke je bilo uvoženo
        importBatchId: {
            type: String, 
        }
    },
    {
        timestamps: true,
    }
);

// Index nastavi s kombinacijo uporabnika ter bankTransactionId-ja in s tem prepreči podvojitve
transactionSchema.index(
  { user: 1, bankTransactionId: 1 }, 
  { unique: true, partialFilterExpression: { bankTransactionId: { $exists: true, $type: 'string' } } }
);
let transactionModel = mongoose.model('Transaction', transactionSchema)

export default {transactionModel,transactionSchema};