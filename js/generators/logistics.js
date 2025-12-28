/**
 * Logistics Data Generator
 * Generates shipping and delivery data with carrier patterns
 */

const LogisticsGenerator = {
    carriers: [
        { name: 'FedEx', trackingPrefix: '7', transitDays: { domestic: [1, 5], international: [3, 10] } },
        { name: 'UPS', trackingPrefix: '1Z', transitDays: { domestic: [1, 5], international: [3, 12] } },
        { name: 'DHL', trackingPrefix: 'JD', transitDays: { domestic: [2, 5], international: [2, 8] } },
        { name: 'USPS', trackingPrefix: '94', transitDays: { domestic: [3, 7], international: [7, 21] } },
        { name: 'Amazon Logistics', trackingPrefix: 'TBA', transitDays: { domestic: [1, 3], international: [5, 14] } }
    ],

    serviceTypes: [
        { value: 'Ground', weight: 40, speedMultiplier: 1 },
        { value: 'Express', weight: 25, speedMultiplier: 0.6 },
        { value: 'Overnight', weight: 10, speedMultiplier: 0.2 },
        { value: 'Economy', weight: 15, speedMultiplier: 1.5 },
        { value: 'Freight', weight: 10, speedMultiplier: 1.3 }
    ],

    statuses: [
        { value: 'Delivered', weight: 65 },
        { value: 'In Transit', weight: 20 },
        { value: 'Out for Delivery', weight: 5 },
        { value: 'Processing', weight: 5 },
        { value: 'Exception', weight: 3 },
        { value: 'Returned', weight: 2 }
    ],

    // Hub cities for origin
    hubCities: [
        { city: 'Los Angeles', country: 'USA' },
        { city: 'Chicago', country: 'USA' },
        { city: 'Memphis', country: 'USA' },
        { city: 'Louisville', country: 'USA' },
        { city: 'Dallas', country: 'USA' },
        { city: 'Atlanta', country: 'USA' },
        { city: 'Shanghai', country: 'CHN' },
        { city: 'Hong Kong', country: 'HKG' },
        { city: 'Shenzhen', country: 'CHN' },
        { city: 'Frankfurt', country: 'DEU' },
        { city: 'London', country: 'GBR' },
        { city: 'Tokyo', country: 'JPN' }
    ],

    // Destination cities
    destinationCities: [
        { city: 'New York', country: 'USA' },
        { city: 'Los Angeles', country: 'USA' },
        { city: 'Chicago', country: 'USA' },
        { city: 'Houston', country: 'USA' },
        { city: 'Phoenix', country: 'USA' },
        { city: 'Philadelphia', country: 'USA' },
        { city: 'San Antonio', country: 'USA' },
        { city: 'San Diego', country: 'USA' },
        { city: 'Dallas', country: 'USA' },
        { city: 'Seattle', country: 'USA' },
        { city: 'Denver', country: 'USA' },
        { city: 'Boston', country: 'USA' },
        { city: 'Miami', country: 'USA' },
        { city: 'Atlanta', country: 'USA' },
        { city: 'Portland', country: 'USA' },
        { city: 'Toronto', country: 'CAN' },
        { city: 'Vancouver', country: 'CAN' },
        { city: 'London', country: 'GBR' },
        { city: 'Paris', country: 'FRA' },
        { city: 'Berlin', country: 'DEU' },
        { city: 'Sydney', country: 'AUS' },
        { city: 'Melbourne', country: 'AUS' },
        { city: 'Tokyo', country: 'JPN' },
        { city: 'Singapore', country: 'SGP' }
    ],

    /**
     * Generate tracking number
     */
    generateTrackingNumber(carrier) {
        const prefix = carrier.trackingPrefix;
        const digits = '0123456789';
        let tracking = prefix;

        for (let i = 0; i < 15; i++) {
            tracking += digits.charAt(Math.floor(Math.random() * 10));
        }

        return tracking;
    },

    /**
     * Generate package dimensions
     */
    generateDimensions() {
        const length = DataGen.randomInt(5, 80);
        const width = DataGen.randomInt(5, 60);
        const height = DataGen.randomInt(2, 50);
        return `${length}x${width}x${height}`;
    },

    /**
     * Calculate shipping cost based on weight, distance, and service
     */
    calculateShippingCost(weight, isInternational, serviceType) {
        let baseCost = weight * 0.5; // Base cost per kg

        if (isInternational) {
            baseCost *= 3; // International multiplier
        }

        // Service type adjustments
        switch (serviceType) {
            case 'Overnight': baseCost *= 4; break;
            case 'Express': baseCost *= 2.5; break;
            case 'Economy': baseCost *= 0.7; break;
            case 'Freight': baseCost *= 0.5; break;
        }

        // Add handling fee
        baseCost += DataGen.randomFloat(5, 15);

        // Add variance
        baseCost *= DataGen.randomFloat(0.9, 1.1);

        return Math.round(baseCost * 100) / 100;
    },

    /**
     * Generate a single logistics record
     */
    generateRecord(startDate, endDate) {
        const carrier = DataGen.randomPick(this.carriers);
        const origin = DataGen.randomPick(this.hubCities);
        const destination = DataGen.randomPick(this.destinationCities);
        const isInternational = origin.country !== destination.country;

        const serviceType = DataGen.weightedPick(this.serviceTypes.map(s => ({ value: s, weight: s.weight })));
        const status = DataGen.weightedPick(this.statuses);

        // Generate ship date (business days weighted higher)
        const shipDate = DataGen.randomDate(startDate, endDate);
        const dayOfWeek = shipDate.getDay();
        if (dayOfWeek === 0) shipDate.setDate(shipDate.getDate() + 1);
        if (dayOfWeek === 6) shipDate.setDate(shipDate.getDate() + 2);

        // Add time (business hours)
        shipDate.setHours(DataGen.randomInt(8, 18), DataGen.randomInt(0, 59), 0);

        // Calculate transit time based on carrier and service
        const transitType = isInternational ? 'international' : 'domestic';
        const baseTransit = carrier.transitDays[transitType];
        const transitDays = Math.round(
            DataGen.randomInt(baseTransit[0], baseTransit[1]) * serviceType.speedMultiplier
        );

        const estimatedDelivery = DataGen.addDays(shipDate, transitDays);

        // Actual delivery based on status
        let actualDelivery = null;
        if (status.value === 'Delivered') {
            // 95% on time or early
            const onTime = Math.random() < 0.95;
            const deliveryOffset = onTime ? DataGen.randomInt(-1, 0) : DataGen.randomInt(1, 3);
            actualDelivery = DataGen.addDays(estimatedDelivery, deliveryOffset);
        }

        // Weight with realistic distribution
        const weight = DataGen.weightedPick([
            { value: DataGen.randomFloat(0.1, 1), weight: 30 },    // Small packages
            { value: DataGen.randomFloat(1, 5), weight: 35 },      // Medium packages
            { value: DataGen.randomFloat(5, 20), weight: 25 },     // Large packages
            { value: DataGen.randomFloat(20, 100), weight: 10 }    // Heavy freight
        ]);

        return {
            shipment_id: DataGen.generateId('SHIP', 10),
            tracking_number: this.generateTrackingNumber(carrier),
            origin_city: origin.city,
            origin_country: origin.country,
            destination_city: destination.city,
            destination_country: destination.country,
            ship_date: DataGen.formatDateTime(shipDate),
            estimated_delivery: DataGen.formatDate(estimatedDelivery),
            actual_delivery: actualDelivery ? DataGen.formatDate(actualDelivery) : null,
            carrier: carrier.name,
            service_type: serviceType.value,
            weight_kg: Math.round(weight * 100) / 100,
            dimensions_cm: this.generateDimensions(),
            shipping_cost: this.calculateShippingCost(weight, isInternational, serviceType.value),
            status: status.value,
            customs_cleared: isInternational ? (status.value === 'Delivered' || Math.random() < 0.8) : null
        };
    },

    /**
     * Generate multiple logistics records
     */
    generate(count, startDate, endDate) {
        const records = [];
        for (let i = 0; i < count; i++) {
            records.push(this.generateRecord(startDate, endDate));
        }

        // Sort by ship date
        records.sort((a, b) => new Date(a.ship_date) - new Date(b.ship_date));

        return records;
    }
};

window.LogisticsGenerator = LogisticsGenerator;
