/**
 * Healthcare Data Generator
 * Generates realistic patient records, diagnoses, and medical data
 */

const HealthcareGenerator = {
    // Blood types with realistic distribution
    bloodTypes: [
        { value: 'O+', weight: 37 },
        { value: 'A+', weight: 36 },
        { value: 'B+', weight: 8 },
        { value: 'AB+', weight: 3 },
        { value: 'O-', weight: 7 },
        { value: 'A-', weight: 6 },
        { value: 'B-', weight: 2 },
        { value: 'AB-', weight: 1 }
    ],

    // ICD-10 diagnosis codes with descriptions
    diagnoses: [
        { code: 'J06.9', description: 'Acute upper respiratory infection' },
        { code: 'I10', description: 'Essential hypertension' },
        { code: 'E11.9', description: 'Type 2 diabetes mellitus' },
        { code: 'M54.5', description: 'Low back pain' },
        { code: 'J18.9', description: 'Pneumonia, unspecified' },
        { code: 'K21.0', description: 'Gastroesophageal reflux disease' },
        { code: 'F32.9', description: 'Major depressive disorder' },
        { code: 'J45.909', description: 'Asthma, unspecified' },
        { code: 'N39.0', description: 'Urinary tract infection' },
        { code: 'R51', description: 'Headache' },
        { code: 'I25.10', description: 'Coronary artery disease' },
        { code: 'G43.909', description: 'Migraine, unspecified' },
        { code: 'M17.9', description: 'Osteoarthritis of knee' },
        { code: 'J02.9', description: 'Acute pharyngitis' },
        { code: 'R10.9', description: 'Abdominal pain' },
        { code: 'E78.5', description: 'Hyperlipidemia' },
        { code: 'F41.1', description: 'Generalized anxiety disorder' },
        { code: 'K29.70', description: 'Gastritis' },
        { code: 'L30.9', description: 'Dermatitis' },
        { code: 'H10.9', description: 'Conjunctivitis' },
        { code: 'S62.509A', description: 'Fracture of hand' },
        { code: 'C50.911', description: 'Breast cancer' },
        { code: 'K80.20', description: 'Gallstones' },
        { code: 'N18.3', description: 'Chronic kidney disease, stage 3' },
        { code: 'I48.91', description: 'Atrial fibrillation' }
    ],

    departments: [
        'Emergency', 'Cardiology', 'Orthopedics', 'Neurology', 'Oncology',
        'Pediatrics', 'Internal Medicine', 'Surgery', 'Psychiatry', 'Radiology',
        'Gastroenterology', 'Pulmonology', 'Dermatology', 'Ophthalmology', 'ENT'
    ],

    insuranceProviders: [
        'Blue Cross Blue Shield', 'UnitedHealthcare', 'Aetna', 'Cigna', 'Humana',
        'Kaiser Permanente', 'Anthem', 'Medicare', 'Medicaid', 'TRICARE',
        'Molina Healthcare', 'Centene', 'WellCare', 'Oscar Health', 'Self Pay'
    ],

    genders: [
        { value: 'Male', weight: 49 },
        { value: 'Female', weight: 49 },
        { value: 'Other', weight: 2 }
    ],

    /**
     * Generate a single healthcare record
     */
    generateRecord(startDate, endDate) {
        const gender = DataGen.weightedPick(this.genders);
        const genderKey = gender === 'Male' ? 'male' : 'female';
        const firstName = DataGen.generateFirstName(genderKey);
        const lastName = DataGen.generateLastName();

        const diagnosis = DataGen.randomPick(this.diagnoses);
        const admissionDate = DataGen.randomDate(startDate, endDate);
        const stayDays = DataGen.randomInt(1, 14);
        const dischargeDate = DataGen.addDays(admissionDate, stayDays);

        // Treatment cost based on diagnosis severity and stay length
        const baseCost = DataGen.randomInt(500, 5000);
        const treatmentCost = baseCost + (stayDays * DataGen.randomInt(800, 2500));

        return {
            patient_id: DataGen.generateNumericId('PAT', 6),
            first_name: firstName,
            last_name: lastName,
            date_of_birth: DataGen.generateDOB(1, 95),
            gender: gender,
            blood_type: DataGen.weightedPick(this.bloodTypes),
            diagnosis_code: diagnosis.code,
            diagnosis_description: diagnosis.description,
            admission_date: DataGen.formatDate(admissionDate),
            discharge_date: DataGen.formatDate(dischargeDate),
            doctor_id: DataGen.generateNumericId('DR', 5),
            department: DataGen.randomPick(this.departments),
            treatment_cost: Math.round(treatmentCost),
            insurance_provider: DataGen.randomPick(this.insuranceProviders)
        };
    },

    /**
     * Generate multiple healthcare records
     */
    generate(count, startDate, endDate) {
        const records = [];
        for (let i = 0; i < count; i++) {
            records.push(this.generateRecord(startDate, endDate));
        }
        return records;
    }
};

(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : window)).HealthcareGenerator = HealthcareGenerator;
