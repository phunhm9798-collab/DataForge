/**
 * Manufacturing Data Generator
 * Generates production batch data with quality metrics and shift patterns
 */

const ManufacturingGenerator = {
    productLines: [
        { name: 'Automotive Components', baseOutput: 500, cycleTime: 45 },
        { name: 'Electronics Assembly', baseOutput: 800, cycleTime: 30 },
        { name: 'Consumer Goods', baseOutput: 1200, cycleTime: 20 },
        { name: 'Medical Devices', baseOutput: 200, cycleTime: 90 },
        { name: 'Industrial Equipment', baseOutput: 100, cycleTime: 180 },
        { name: 'Food Processing', baseOutput: 2000, cycleTime: 15 },
        { name: 'Pharmaceutical', baseOutput: 5000, cycleTime: 8 },
        { name: 'Aerospace Parts', baseOutput: 50, cycleTime: 300 },
        { name: 'Textile Products', baseOutput: 1500, cycleTime: 12 },
        { name: 'Packaging Materials', baseOutput: 3000, cycleTime: 5 }
    ],

    machines: [
        { id: 'MACH-001', name: 'CNC Mill A', efficiency: 0.95 },
        { id: 'MACH-002', name: 'CNC Mill B', efficiency: 0.92 },
        { id: 'MACH-003', name: 'Assembly Line 1', efficiency: 0.98 },
        { id: 'MACH-004', name: 'Assembly Line 2', efficiency: 0.96 },
        { id: 'MACH-005', name: 'Injection Mold A', efficiency: 0.94 },
        { id: 'MACH-006', name: 'Injection Mold B', efficiency: 0.91 },
        { id: 'MACH-007', name: 'Packaging Unit 1', efficiency: 0.99 },
        { id: 'MACH-008', name: 'Packaging Unit 2', efficiency: 0.97 },
        { id: 'MACH-009', name: 'Quality Scanner', efficiency: 0.99 },
        { id: 'MACH-010', name: 'Robotic Arm A', efficiency: 0.93 }
    ],

    shifts: [
        { name: 'Morning', startHour: 6, endHour: 14, weight: 35 },
        { name: 'Afternoon', startHour: 14, endHour: 22, weight: 35 },
        { name: 'Night', startHour: 22, endHour: 6, weight: 30 }
    ],

    /**
     * Generate production date with shift patterns
     */
    generateProductionDateTime(startDate, endDate) {
        const date = DataGen.randomDate(startDate, endDate);
        const shift = DataGen.weightedPick(this.shifts.map(s => ({ value: s, weight: s.weight })));

        const hour = shift.startHour < shift.endHour
            ? DataGen.randomInt(shift.startHour, shift.endHour - 1)
            : DataGen.randomInt(shift.startHour, 23);

        date.setHours(hour, DataGen.randomInt(0, 59), DataGen.randomInt(0, 59));
        return date;
    },

    /**
     * Generate quality score with realistic distribution
     */
    generateQualityScore() {
        // Most products should be high quality (85-100)
        const score = DataGen.normalRandom(94, 4);
        return Math.round(DataGen.clamp(score, 75, 100) * 10) / 10;
    },

    /**
     * Generate defect count based on units produced
     */
    generateDefectCount(unitsProduced) {
        // Typical defect rate is 1-3%
        const defectRate = DataGen.randomFloat(0.01, 0.03);
        const baseDefects = Math.floor(unitsProduced * defectRate);

        // Sometimes there are defect spikes
        if (Math.random() < 0.05) { // 5% chance of spike
            return baseDefects + DataGen.randomInt(5, 20);
        }

        return baseDefects;
    },

    /**
     * Generate downtime with exponential distribution
     */
    generateDowntime() {
        // Most runs have no or minimal downtime
        if (Math.random() < 0.7) {
            return 0;
        }

        // Exponential distribution for downtime
        const lambda = 0.1;
        const downtime = -Math.log(1 - Math.random()) / lambda;
        return Math.round(Math.min(downtime, 120)); // Cap at 2 hours
    },

    /**
     * Generate energy consumption based on units and cycle time
     */
    generateEnergyConsumption(unitsProduced, cycleTimeSeconds) {
        const baseConsumption = (unitsProduced * cycleTimeSeconds) / 3600; // Convert to hours
        const variance = DataGen.randomFloat(0.9, 1.1);
        return Math.round(baseConsumption * variance * 10) / 10;
    },

    /**
     * Generate a single manufacturing record
     */
    generateRecord(startDate, endDate) {
        const productLine = DataGen.randomPick(this.productLines);
        const machine = DataGen.randomPick(this.machines);
        const productionDate = this.generateProductionDateTime(startDate, endDate);

        // Units produced varies by machine efficiency and random factors
        const efficiencyFactor = DataGen.randomFloat(0.85, 1.05);
        const unitsProduced = Math.round(productLine.baseOutput * machine.efficiency * efficiencyFactor);

        // Cycle time varies slightly
        const cycleTimeVariance = DataGen.normalRandom(productLine.cycleTime, productLine.cycleTime * 0.1);
        const cycleTime = Math.round(DataGen.clamp(cycleTimeVariance, productLine.cycleTime * 0.8, productLine.cycleTime * 1.2));

        return {
            batch_id: DataGen.generateId('BATCH', 8),
            product_line: productLine.name,
            production_date: DataGen.formatDateTime(productionDate),
            machine_id: machine.id,
            operator_id: DataGen.generateNumericId('OP', 5),
            units_produced: unitsProduced,
            defect_count: this.generateDefectCount(unitsProduced),
            quality_score: this.generateQualityScore(),
            cycle_time_seconds: cycleTime,
            downtime_minutes: this.generateDowntime(),
            raw_material_batch: DataGen.generateId('RAW', 6),
            energy_consumption_kwh: this.generateEnergyConsumption(unitsProduced, cycleTime)
        };
    },

    /**
     * Generate multiple manufacturing records
     */
    generate(count, startDate, endDate) {
        const records = [];
        for (let i = 0; i < count; i++) {
            records.push(this.generateRecord(startDate, endDate));
        }

        // Sort by date
        records.sort((a, b) => new Date(a.production_date) - new Date(b.production_date));

        return records;
    }
};

window.ManufacturingGenerator = ManufacturingGenerator;
