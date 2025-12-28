/**
 * Real Estate Data Generator
 * Generates property listings with location-based pricing
 */

const RealEstateGenerator = {
    propertyTypes: [
        { type: 'Single Family', weight: 45, bedroomRange: [2, 6], sqftRange: [1200, 4500] },
        { type: 'Condo', weight: 25, bedroomRange: [1, 3], sqftRange: [600, 2000] },
        { type: 'Townhouse', weight: 15, bedroomRange: [2, 4], sqftRange: [1000, 2800] },
        { type: 'Multi-Family', weight: 8, bedroomRange: [4, 12], sqftRange: [2000, 6000] },
        { type: 'Land', weight: 4, bedroomRange: [0, 0], sqftRange: [0, 0] },
        { type: 'Commercial', weight: 3, bedroomRange: [0, 0], sqftRange: [1000, 20000] }
    ],

    // Markets with price multipliers
    markets: [
        { city: 'San Francisco', state: 'CA', zip: '94102', priceMultiplier: 2.5 },
        { city: 'New York', state: 'NY', zip: '10001', priceMultiplier: 2.3 },
        { city: 'Los Angeles', state: 'CA', zip: '90001', priceMultiplier: 2.0 },
        { city: 'Seattle', state: 'WA', zip: '98101', priceMultiplier: 1.8 },
        { city: 'Boston', state: 'MA', zip: '02101', priceMultiplier: 1.9 },
        { city: 'Denver', state: 'CO', zip: '80201', priceMultiplier: 1.4 },
        { city: 'Austin', state: 'TX', zip: '78701', priceMultiplier: 1.5 },
        { city: 'Portland', state: 'OR', zip: '97201', priceMultiplier: 1.4 },
        { city: 'Miami', state: 'FL', zip: '33101', priceMultiplier: 1.6 },
        { city: 'Chicago', state: 'IL', zip: '60601', priceMultiplier: 1.3 },
        { city: 'Atlanta', state: 'GA', zip: '30301', priceMultiplier: 1.1 },
        { city: 'Phoenix', state: 'AZ', zip: '85001', priceMultiplier: 1.0 },
        { city: 'Dallas', state: 'TX', zip: '75201', priceMultiplier: 1.1 },
        { city: 'Nashville', state: 'TN', zip: '37201', priceMultiplier: 1.2 },
        { city: 'Charlotte', state: 'NC', zip: '28201', priceMultiplier: 1.0 },
        { city: 'Las Vegas', state: 'NV', zip: '89101', priceMultiplier: 0.9 },
        { city: 'Orlando', state: 'FL', zip: '32801', priceMultiplier: 1.0 },
        { city: 'Minneapolis', state: 'MN', zip: '55401', priceMultiplier: 1.1 },
        { city: 'Detroit', state: 'MI', zip: '48201', priceMultiplier: 0.6 },
        { city: 'Cleveland', state: 'OH', zip: '44101', priceMultiplier: 0.7 }
    ],

    statuses: [
        { value: 'Active', weight: 50 },
        { value: 'Pending', weight: 20 },
        { value: 'Sold', weight: 25 },
        { value: 'Withdrawn', weight: 5 }
    ],

    /**
     * Calculate price based on property characteristics
     */
    calculatePrice(propertyType, bedrooms, sqft, market, yearBuilt) {
        const basePrice = 150; // Base price per sqft

        let pricePerSqft = basePrice * market.priceMultiplier;

        // Adjust for property type
        if (propertyType === 'Single Family') pricePerSqft *= 1.1;
        if (propertyType === 'Condo') pricePerSqft *= 0.95;
        if (propertyType === 'Multi-Family') pricePerSqft *= 0.85;
        if (propertyType === 'Commercial') pricePerSqft *= 1.3;

        // Adjust for age (newer = more expensive)
        const currentYear = new Date().getFullYear();
        const age = currentYear - yearBuilt;
        if (age < 5) pricePerSqft *= 1.15;
        else if (age < 15) pricePerSqft *= 1.05;
        else if (age > 50) pricePerSqft *= 0.85;

        // Add variance
        pricePerSqft *= DataGen.randomFloat(0.85, 1.15);

        let totalPrice;
        if (propertyType === 'Land') {
            // Land is priced by lot size
            totalPrice = DataGen.randomFloat(50000, 500000) * market.priceMultiplier;
        } else {
            totalPrice = sqft * pricePerSqft;
        }

        // Round to nearest $1000
        return Math.round(totalPrice / 1000) * 1000;
    },

    /**
     * Generate a single real estate record
     */
    generateRecord(startDate, endDate) {
        const propertyType = DataGen.weightedPick(this.propertyTypes.map(p => ({ value: p, weight: p.weight })));
        const market = DataGen.randomPick(this.markets);

        const bedrooms = DataGen.randomInt(propertyType.bedroomRange[0], propertyType.bedroomRange[1]);

        // Bathrooms correlate with bedrooms
        let bathrooms;
        if (bedrooms === 0) {
            bathrooms = propertyType.type === 'Commercial' ? DataGen.randomInt(1, 4) : 0;
        } else {
            bathrooms = Math.max(1, bedrooms - DataGen.randomInt(0, 1));
            bathrooms += Math.random() < 0.4 ? 0.5 : 0; // Half baths
        }

        let sqft = 0;
        if (propertyType.sqftRange[0] > 0) {
            // Square footage correlates with bedrooms
            const baseSqft = propertyType.sqftRange[0] + (bedrooms * 300);
            sqft = Math.round(DataGen.clamp(
                DataGen.normalRandom(baseSqft, baseSqft * 0.2),
                propertyType.sqftRange[0],
                propertyType.sqftRange[1]
            ));
        }

        const lotSize = propertyType.type === 'Single Family' || propertyType.type === 'Land'
            ? DataGen.randomFloat(0.1, 2.5)
            : DataGen.randomFloat(0.01, 0.1);

        const yearBuilt = propertyType.type === 'Land'
            ? null
            : DataGen.randomInt(1920, 2024);

        const listingDate = DataGen.randomDate(startDate, endDate);
        const daysOnMarket = DataGen.randomInt(1, 180);

        // Generate realistic zip code variation
        const zipBase = parseInt(market.zip);
        const zip = String(zipBase + DataGen.randomInt(0, 99)).padStart(5, '0');

        return {
            property_id: DataGen.generateId('PROP', 8),
            address: DataGen.generateStreetAddress(),
            city: market.city,
            state: market.state,
            zip_code: zip,
            property_type: propertyType.type,
            bedrooms: bedrooms,
            bathrooms: bathrooms,
            square_feet: sqft,
            lot_size_acres: Math.round(lotSize * 100) / 100,
            year_built: yearBuilt,
            listing_price: this.calculatePrice(propertyType.type, bedrooms, sqft, market, yearBuilt || 2000),
            listing_date: DataGen.formatDate(listingDate),
            days_on_market: daysOnMarket,
            status: DataGen.weightedPick(this.statuses),
            agent_id: DataGen.generateNumericId('AGT', 5)
        };
    },

    /**
     * Generate multiple real estate records
     */
    generate(count, startDate, endDate) {
        const records = [];
        for (let i = 0; i < count; i++) {
            records.push(this.generateRecord(startDate, endDate));
        }

        // Sort by listing date
        records.sort((a, b) => new Date(a.listing_date) - new Date(b.listing_date));

        return records;
    }
};

window.RealEstateGenerator = RealEstateGenerator;
