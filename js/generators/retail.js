/**
 * Retail/E-commerce Data Generator
 * Generates realistic order data with seasonal patterns
 */

const RetailGenerator = {
    categories: {
        'Electronics': {
            skuPrefix: 'ELEC',
            products: [
                { name: 'Wireless Bluetooth Headphones', priceRange: [29, 299] },
                { name: 'Smart Watch Series 5', priceRange: [199, 499] },
                { name: 'Portable Bluetooth Speaker', priceRange: [25, 199] },
                { name: '4K Ultra HD Smart TV 55"', priceRange: [399, 899] },
                { name: 'Wireless Charging Pad', priceRange: [15, 59] },
                { name: 'Noise Cancelling Earbuds', priceRange: [79, 249] },
                { name: 'Tablet 10.2" Display', priceRange: [329, 599] },
                { name: 'Gaming Mouse RGB', priceRange: [29, 129] },
                { name: 'Mechanical Keyboard', priceRange: [69, 199] },
                { name: 'USB-C Hub Adapter', priceRange: [25, 89] }
            ]
        },
        'Clothing': {
            skuPrefix: 'CLTH',
            products: [
                { name: 'Classic Cotton T-Shirt', priceRange: [15, 45] },
                { name: 'Slim Fit Denim Jeans', priceRange: [49, 129] },
                { name: 'Hooded Sweatshirt', priceRange: [39, 89] },
                { name: 'Athletic Performance Shorts', priceRange: [25, 65] },
                { name: 'Winter Puffer Jacket', priceRange: [89, 249] },
                { name: 'Casual Button-Down Shirt', priceRange: [35, 79] },
                { name: 'Summer Maxi Dress', priceRange: [45, 129] },
                { name: 'Running Sneakers', priceRange: [79, 179] },
                { name: 'Wool Blend Sweater', priceRange: [59, 149] },
                { name: 'Canvas Backpack', priceRange: [35, 89] }
            ]
        },
        'Home & Garden': {
            skuPrefix: 'HOME',
            products: [
                { name: 'Memory Foam Pillow Set', priceRange: [29, 79] },
                { name: 'Stainless Steel Cookware Set', priceRange: [99, 299] },
                { name: 'LED Desk Lamp', priceRange: [25, 69] },
                { name: 'Indoor Plant Pot Set', priceRange: [19, 49] },
                { name: 'Throw Blanket Fleece', priceRange: [25, 59] },
                { name: 'Kitchen Knife Set', priceRange: [49, 199] },
                { name: 'Robot Vacuum Cleaner', priceRange: [199, 599] },
                { name: 'Coffee Maker Programmable', priceRange: [49, 149] },
                { name: 'Air Purifier HEPA', priceRange: [99, 349] },
                { name: 'Bathroom Towel Set', priceRange: [29, 69] }
            ]
        },
        'Sports & Outdoors': {
            skuPrefix: 'SPRT',
            products: [
                { name: 'Yoga Mat Premium', priceRange: [25, 79] },
                { name: 'Resistance Bands Set', priceRange: [15, 45] },
                { name: 'Camping Tent 4-Person', priceRange: [89, 299] },
                { name: 'Hiking Backpack 40L', priceRange: [59, 149] },
                { name: 'Dumbbell Weight Set', priceRange: [49, 199] },
                { name: 'Cycling Helmet', priceRange: [35, 129] },
                { name: 'Insulated Water Bottle', priceRange: [19, 45] },
                { name: 'Fitness Tracker Band', priceRange: [49, 149] },
                { name: 'Foam Roller Muscle', priceRange: [19, 49] },
                { name: 'Jump Rope Speed', priceRange: [9, 29] }
            ]
        },
        'Beauty & Personal Care': {
            skuPrefix: 'BEAU',
            products: [
                { name: 'Moisturizing Face Cream', priceRange: [15, 89] },
                { name: 'Vitamin C Serum', priceRange: [19, 69] },
                { name: 'Hair Straightener Ceramic', priceRange: [29, 149] },
                { name: 'Electric Toothbrush', priceRange: [39, 199] },
                { name: 'Perfume Eau de Toilette', priceRange: [45, 149] },
                { name: 'Makeup Brush Set', priceRange: [19, 79] },
                { name: 'Sunscreen SPF 50', priceRange: [12, 35] },
                { name: 'Hair Dryer Professional', priceRange: [39, 179] },
                { name: 'Night Repair Cream', priceRange: [25, 99] },
                { name: 'Beard Trimmer Kit', priceRange: [29, 89] }
            ]
        },
        'Books & Media': {
            skuPrefix: 'BOOK',
            products: [
                { name: 'Bestseller Fiction Novel', priceRange: [12, 28] },
                { name: 'Self-Help Guide', priceRange: [14, 25] },
                { name: 'Cookbook Recipes', priceRange: [18, 35] },
                { name: 'Business Strategy Book', priceRange: [16, 30] },
                { name: 'Children\'s Picture Book', priceRange: [8, 18] },
                { name: 'Vinyl Record Album', priceRange: [19, 45] },
                { name: 'Audiobook Collection', priceRange: [15, 35] },
                { name: 'Magazine Subscription', priceRange: [12, 30] },
                { name: 'Art History Coffee Table Book', priceRange: [35, 75] },
                { name: 'Language Learning Kit', priceRange: [25, 59] }
            ]
        }
    },

    paymentMethods: [
        { value: 'Credit Card', weight: 45 },
        { value: 'Debit Card', weight: 25 },
        { value: 'PayPal', weight: 15 },
        { value: 'Apple Pay', weight: 8 },
        { value: 'Google Pay', weight: 5 },
        { value: 'Gift Card', weight: 2 }
    ],

    orderStatuses: [
        { value: 'Delivered', weight: 70 },
        { value: 'Shipped', weight: 15 },
        { value: 'Processing', weight: 8 },
        { value: 'Pending', weight: 4 },
        { value: 'Cancelled', weight: 2 },
        { value: 'Returned', weight: 1 }
    ],

    discounts: [
        { value: 0, weight: 50 },
        { value: 5, weight: 15 },
        { value: 10, weight: 15 },
        { value: 15, weight: 10 },
        { value: 20, weight: 7 },
        { value: 25, weight: 3 }
    ],

    /**
     * Generate SKU
     */
    generateSKU(prefix) {
        return `${prefix}-${DataGen.randomInt(1000, 9999)}`;
    },

    /**
     * Apply seasonal patterns to order dates
     */
    applySeasonalWeight(date) {
        const month = date.getMonth();
        // Higher weights for holiday seasons (Nov, Dec) and summer (Jun, Jul)
        const seasonalWeights = [0.8, 0.7, 0.8, 0.9, 0.9, 1.1, 1.1, 0.9, 0.9, 1.0, 1.3, 1.5];
        return seasonalWeights[month];
    },

    /**
     * Generate a single retail order record
     */
    generateRecord(startDate, endDate, customerId = null) {
        const categoryNames = Object.keys(this.categories);
        const categoryName = DataGen.randomPick(categoryNames);
        const category = this.categories[categoryName];
        const product = DataGen.randomPick(category.products);

        const firstName = DataGen.generateFirstName();
        const lastName = DataGen.generateLastName();
        const email = DataGen.generateEmail(firstName, lastName);

        // Generate order date with time (peak hours: 10am-9pm)
        const orderDate = DataGen.randomDate(startDate, endDate);
        const hour = DataGen.weightedPick([
            { value: DataGen.randomInt(10, 21), weight: 75 },
            { value: DataGen.randomInt(0, 9), weight: 10 },
            { value: DataGen.randomInt(22, 23), weight: 15 }
        ]);
        orderDate.setHours(hour, DataGen.randomInt(0, 59), DataGen.randomInt(0, 59));

        const quantity = DataGen.weightedPick([
            { value: 1, weight: 60 },
            { value: 2, weight: 25 },
            { value: 3, weight: 10 },
            { value: 4, weight: 3 },
            { value: 5, weight: 2 }
        ]);

        const unitPrice = DataGen.randomFloat(product.priceRange[0], product.priceRange[1]);
        const discountPercent = DataGen.weightedPick(this.discounts);
        const subtotal = unitPrice * quantity;
        const discount = subtotal * (discountPercent / 100);
        const totalAmount = subtotal - discount;

        return {
            order_id: DataGen.generateId('ORD', 8),
            customer_id: customerId || DataGen.generateId('CUST', 5),
            customer_email: email,
            order_date: DataGen.formatDateTime(orderDate),
            product_sku: this.generateSKU(category.skuPrefix),
            product_name: product.name,
            category: categoryName,
            quantity: quantity,
            unit_price: parseFloat(unitPrice.toFixed(2)),
            discount_percent: discountPercent,
            total_amount: parseFloat(totalAmount.toFixed(2)),
            payment_method: DataGen.weightedPick(this.paymentMethods),
            shipping_address: DataGen.generateFullAddress(),
            order_status: DataGen.weightedPick(this.orderStatuses)
        };
    },

    /**
     * Generate multiple retail order records
     */
    generate(count, startDate, endDate) {
        const records = [];

        // Generate customer pool (some repeat customers)
        const customerPool = [];
        const uniqueCustomers = Math.floor(count * 0.7); // 70% unique customers
        for (let i = 0; i < uniqueCustomers; i++) {
            customerPool.push(DataGen.generateId('CUST', 5));
        }

        for (let i = 0; i < count; i++) {
            const customerId = DataGen.randomPick(customerPool);
            records.push(this.generateRecord(startDate, endDate, customerId));
        }

        // Sort by date
        records.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));

        return records;
    }
};

window.RetailGenerator = RetailGenerator;
