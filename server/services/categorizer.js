// import CategoryController from "../controllers/categoryController";

import CategoryModel from "../models/Category";

async function categorize(transactions, user_id) {
    // iz parserja dobi polje naslednjih "struktur"
    //
    // transaction:
    // {
    //     date: Date || null,
    //     description: String,
    //     amount: Number,
    //     type: 'income' || 'expense',
    // }
    // 
    // in jo posodobi z naslednjo lastnostjo
    //      cat: id,

    const categories = CategoryModel.find({user_id: user_id});

    for (var transaction in transactions) {
        var categoryType = "";
        var merchant = "";

        for (const category in categories) {
            if (categoryType != "") {
                break;
            }
            for (const company in categories[category].companies) {
                if (transactions[transaction].desc.toUpperCase().includes(categories[category].companies[company].toUpperCase())) {
                    categoryType = categories[category];
                    merchant = categoryType.name;
                    break;
                }
            };
            for (const keyword in categories[category].keywords) {
                if (transactions[transaction].desc.toUpperCase().includes(categories[category].keywords[keyword].toUpperCase())) {
                    categoryType = categories[category];
                    break;
                }
            };
        };
        transactions[transaction]["cat"] = categoryType.name;
        transactions[transaction]["isSub"] = categoryType.isSub ? true : false;
    };
    return transactions;
}

export default categorize;