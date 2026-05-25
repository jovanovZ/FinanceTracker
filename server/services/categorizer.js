// import CategoryController from "../controllers/categoryController";

async function categorize(transactions) {
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

    // prod
    // const categories = CategoryController.list();
    // test
    const categories = [
        {"name": "Transport", "keywords": ["Bencin", "dizel", "gorivo", "vlak", "Avtobus"], "companies": ["Petrol"]},
        {"name": "Salary", "keywords": ["plača"], "companies": []},
        {"name": "Groceries", "companies": ["Lidl", "Hofer", "Špar", "Mercator"], "keywords": []},
        {"name": "Subscription", "companies": ["Spotify", "Netflix"], "keywords": [], isSub: true}
    ];

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