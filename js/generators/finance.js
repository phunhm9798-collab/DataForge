/**
 * Finance Data Generator
 * Generates realistic financial transactions with fraud detection patterns
 */

const FinanceGenerator = {
    transactionTypes: [
        { value: 'Purchase', weight: 50 },
        { value: 'Deposit', weight: 15 },
        { value: 'Withdrawal', weight: 15 },
        { value: 'Transfer', weight: 15 },
        { value: 'Payment', weight: 5 }
    ],

    merchantCategories: [
        { code: '5411', name: 'Grocery Stores', minAmount: 20, maxAmount: 300 },
        { code: '5812', name: 'Restaurants', minAmount: 10, maxAmount: 150 },
        { code: '5541', name: 'Gas Stations', minAmount: 25, maxAmount: 100 },
        { code: '5311', name: 'Department Stores', minAmount: 50, maxAmount: 500 },
        { code: '5912', name: 'Pharmacies', minAmount: 10, maxAmount: 200 },
        { code: '4829', name: 'Wire Transfers', minAmount: 100, maxAmount: 10000 },
        { code: '5732', name: 'Electronics Stores', minAmount: 100, maxAmount: 2000 },
        { code: '5651', name: 'Clothing Stores', minAmount: 30, maxAmount: 400 },
        { code: '7011', name: 'Hotels', minAmount: 80, maxAmount: 500 },
        { code: '4111', name: 'Transportation', minAmount: 5, maxAmount: 100 },
        { code: '5462', name: 'Bakeries', minAmount: 5, maxAmount: 50 },
        { code: '5942', name: 'Book Stores', minAmount: 10, maxAmount: 100 },
        { code: '7832', name: 'Movie Theaters', minAmount: 10, maxAmount: 60 },
        { code: '7997', name: 'Gyms & Fitness', minAmount: 20, maxAmount: 150 },
        { code: '5814', name: 'Fast Food', minAmount: 5, maxAmount: 40 }
    ],

    merchants: {
        '5411': ['Whole Foods', 'Trader Joe\'s', 'Kroger', 'Safeway', 'Walmart', 'Costco', 'Target'],
        '5812': ['Olive Garden', 'Chipotle', 'Applebee\'s', 'Chili\'s', 'Panera Bread', 'Red Lobster'],
        '5541': ['Shell', 'Chevron', 'BP', 'Exxon', 'Mobil', 'Circle K', '76'],
        '5311': ['Macy\'s', 'Nordstrom', 'JCPenney', 'Kohl\'s', 'Bloomingdale\'s'],
        '5912': ['CVS', 'Walgreens', 'Rite Aid', 'Walmart Pharmacy'],
        '4829': ['Wire Transfer', 'Bank Transfer', 'International Wire'],
        '5732': ['Best Buy', 'Apple Store', 'Microsoft Store', 'B&H Photo'],
        '5651': ['Gap', 'H&M', 'Zara', 'Forever 21', 'Old Navy', 'Uniqlo'],
        '7011': ['Marriott', 'Hilton', 'Hyatt', 'Holiday Inn', 'Best Western'],
        '4111': ['Uber', 'Lyft', 'Metro Transit', 'Amtrak', 'Delta Airlines'],
        '5462': ['Starbucks', 'Panera', 'Local Bakery', 'Dunkin\''],
        '5942': ['Barnes & Noble', 'Amazon Books', 'Half Price Books'],
        '7832': ['AMC Theatres', 'Regal Cinemas', 'Cinemark'],
        '7997': ['Planet Fitness', 'LA Fitness', '24 Hour Fitness', 'Equinox'],
        '5814': ['McDonald\'s', 'Burger King', 'Wendy\'s', 'Taco Bell', 'KFC']
    },

    currencies: [
        { value: 'USD', weight: 85 },
        { value: 'EUR', weight: 5 },
        { value: 'GBP', weight: 5 },
        { value: 'CAD', weight: 3 },
        { value: 'JPY', weight: 2 }
    ],

    /**
     * Generate account number
     */
    generateAccountNumber() {
        const prefix = DataGen.randomInt(1000, 9999);
        const middle = DataGen.randomInt(1000, 9999);
        const suffix = DataGen.randomInt(1000, 9999);
        return `${prefix}-${middle}-${suffix}`;
    },

    /**
     * Generate a single financial transaction
     */
    generateRecord(startDate, endDate, runningBalance = null) {
        const accountHolder = DataGen.generateFullName();
        const transactionType = DataGen.weightedPick(this.transactionTypes);
        const transactionDate = DataGen.randomDate(startDate, endDate);

        // Add realistic time (business hours more common)
        const hour = DataGen.weightedPick([
            { value: DataGen.randomInt(9, 17), weight: 70 },
            { value: DataGen.randomInt(0, 8), weight: 15 },
            { value: DataGen.randomInt(18, 23), weight: 15 }
        ]);
        transactionDate.setHours(hour, DataGen.randomInt(0, 59), DataGen.randomInt(0, 59));

        const category = DataGen.randomPick(this.merchantCategories);
        const merchantName = DataGen.randomPick(this.merchants[category.code] || ['Unknown Merchant']);

        let amount;
        if (transactionType === 'Purchase' || transactionType === 'Payment') {
            amount = DataGen.randomFloat(category.minAmount, category.maxAmount);
        } else if (transactionType === 'Deposit') {
            amount = DataGen.randomFloat(100, 5000);
        } else if (transactionType === 'Withdrawal') {
            amount = DataGen.weightedPick([
                { value: 20, weight: 20 },
                { value: 40, weight: 25 },
                { value: 60, weight: 20 },
                { value: 80, weight: 15 },
                { value: 100, weight: 10 },
                { value: 200, weight: 7 },
                { value: 500, weight: 3 }
            ]);
        } else { // Transfer
            amount = DataGen.randomFloat(50, 5000);
        }

        // Calculate balance
        if (runningBalance === null) {
            runningBalance = DataGen.randomFloat(1000, 50000);
        }

        const isDebit = ['Purchase', 'Withdrawal', 'Payment'].includes(transactionType);
        const balanceAfter = isDebit ? runningBalance - amount : runningBalance + amount;

        // Fraud detection - ~0.1% fraud rate
        const isFraud = Math.random() < 0.001;
        let fraudScore;

        if (isFraud) {
            fraudScore = DataGen.randomInt(75, 100);
        } else {
            // Normal transactions have low fraud scores
            fraudScore = Math.round(DataGen.normalRandom(15, 10));
            fraudScore = DataGen.clamp(fraudScore, 0, 50);
        }

        return {
            transaction_id: DataGen.generateId('TXN', 10),
            account_number: this.generateAccountNumber(),
            account_holder: accountHolder,
            transaction_date: DataGen.formatDateTime(transactionDate),
            transaction_type: transactionType,
            amount: parseFloat(amount.toFixed(2)),
            currency: DataGen.weightedPick(this.currencies),
            merchant_category: `${category.code} - ${category.name}`,
            merchant_name: merchantName,
            balance_after: parseFloat(Math.max(0, balanceAfter).toFixed(2)),
            is_fraud: isFraud,
            fraud_score: fraudScore
        };
    },

    /**
     * Generate multiple financial transactions
     */
    generate(count, startDate, endDate) {
        const records = [];
        let balance = DataGen.randomFloat(5000, 50000);

        for (let i = 0; i < count; i++) {
            const record = this.generateRecord(startDate, endDate, balance);
            records.push(record);
            balance = record.balance_after;
        }

        // Sort by date
        records.sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

        return records;
    }
};

window.FinanceGenerator = FinanceGenerator;
