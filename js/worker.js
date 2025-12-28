/**
 * DataForge Web Worker
 * Handles data generation in a background thread to prevent UI freezing
 */

// Import generator scripts
importScripts(
    'generators/base.js',
    'generators/healthcare.js',
    'generators/finance.js',
    'generators/retail.js',
    'generators/hr.js',
    'generators/manufacturing.js',
    'generators/education.js',
    'generators/realestate.js',
    'generators/logistics.js'
);

// Generator mapping
const generators = {
    healthcare: () => self.HealthcareGenerator,
    finance: () => self.FinanceGenerator,
    retail: () => self.RetailGenerator,
    hr: () => self.HRGenerator,
    manufacturing: () => self.ManufacturingGenerator,
    education: () => self.EducationGenerator,
    realestate: () => self.RealEstateGenerator,
    logistics: () => self.LogisticsGenerator
};

/**
 * Handle messages from main thread
 */
self.onmessage = function (e) {
    const { type, payload } = e.data;

    switch (type) {
        case 'generate':
            handleGenerate(payload);
            break;
        case 'cancel':
            // Future: implement cancellation
            break;
        default:
            console.warn('Unknown message type:', type);
    }
};

/**
 * Generate data in the worker
 */
function handleGenerate(config) {
    const {
        industry,
        rowCount,
        startDate,
        endDate,
        advancedOptions
    } = config;

    try {
        // Apply advanced options to DataGen
        applyAdvancedOptions(advancedOptions);

        const generator = generators[industry]();
        if (!generator) {
            throw new Error(`Unknown industry: ${industry}`);
        }

        const records = [];
        const batchSize = 1000; // Generate in batches for progress updates
        const totalBatches = Math.ceil(rowCount / batchSize);

        for (let batch = 0; batch < totalBatches; batch++) {
            const start = batch * batchSize;
            const end = Math.min(start + batchSize, rowCount);

            for (let i = start; i < end; i++) {
                records.push(generator.generateRecord(startDate, endDate));
            }

            // Report progress
            const progress = Math.round(((batch + 1) / totalBatches) * 100);
            self.postMessage({
                type: 'progress',
                payload: {
                    progress,
                    generated: records.length,
                    total: rowCount
                }
            });
        }

        // Apply post-processing
        let data = records;
        if (advancedOptions.nullPercentage > 0) {
            data = applyNullValues(data, advancedOptions.nullPercentage);
        }
        if (advancedOptions.outlierFrequency !== 'none') {
            data = applyOutliers(data, advancedOptions.outlierFrequency);
        }

        // Send completed data back
        self.postMessage({
            type: 'complete',
            payload: { data }
        });

    } catch (error) {
        self.postMessage({
            type: 'error',
            payload: { message: error.message }
        });
    }
}

/**
 * Apply advanced options to DataGen
 */
function applyAdvancedOptions(opts) {
    if (!opts) return;

    const varianceMultipliers = {
        low: 0.5,
        medium: 1.0,
        high: 2.0
    };
    DataGen.varianceMultiplier = varianceMultipliers[opts.varianceLevel] || 1.0;

    const qualitySettings = {
        quick: { correlations: false, detailedPatterns: false },
        balanced: { correlations: true, detailedPatterns: false },
        high: { correlations: true, detailedPatterns: true }
    };
    DataGen.qualitySettings = qualitySettings[opts.dataQuality] || qualitySettings.balanced;
}

/**
 * Apply null values to data
 */
function applyNullValues(data, percentage) {
    const nullPct = percentage / 100;
    if (nullPct === 0) return data;

    const protectedFields = ['first_name', 'last_name', 'patient_id', 'employee_id',
        'student_id', 'order_id', 'transaction_id', 'batch_id', 'property_id',
        'shipment_id', 'account_holder', 'customer_id'];

    const nullableFields = ['email', 'phone', 'address', 'manager_id', 'discount_percent',
        'scholarship_amount', 'actual_delivery', 'customs_cleared', 'lot_size_acres'];

    return data.map(row => {
        const newRow = { ...row };
        for (const key of Object.keys(newRow)) {
            if (protectedFields.includes(key)) continue;
            if (Math.random() < nullPct && (nullableFields.includes(key) || Math.random() < 0.3)) {
                newRow[key] = null;
            }
        }
        return newRow;
    });
}

/**
 * Apply outliers to data
 */
function applyOutliers(data, frequency) {
    const outlierRates = {
        none: 0,
        rare: 0.01,
        occasional: 0.05,
        frequent: 0.10
    };
    const rate = outlierRates[frequency] || 0;
    if (rate === 0) return data;

    const numericFields = ['amount', 'salary', 'treatment_cost', 'total_amount', 'unit_price',
        'listing_price', 'shipping_cost', 'weight_kg', 'square_feet', 'tuition_amount'];

    return data.map(row => {
        const newRow = { ...row };
        for (const key of Object.keys(newRow)) {
            if (numericFields.includes(key) && typeof newRow[key] === 'number' && Math.random() < rate) {
                const multiplier = Math.random() < 0.5 ? 0.1 : Math.random() * 5 + 2;
                newRow[key] = Math.round(newRow[key] * multiplier * 100) / 100;
            }
        }
        return newRow;
    });
}
