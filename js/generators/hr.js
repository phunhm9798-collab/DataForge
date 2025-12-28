/**
 * Human Resources Data Generator
 * Generates realistic employee records with salary distributions and org hierarchy
 */

const HRGenerator = {
    departments: {
        'Engineering': {
            titles: ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Principal Engineer', 'Engineering Manager', 'VP of Engineering'],
            salaryRanges: { junior: [70000, 100000], mid: [100000, 150000], senior: [150000, 220000], executive: [200000, 350000] }
        },
        'Product': {
            titles: ['Product Manager', 'Senior Product Manager', 'Director of Product', 'VP of Product', 'Chief Product Officer'],
            salaryRanges: { junior: [80000, 110000], mid: [110000, 160000], senior: [160000, 230000], executive: [220000, 380000] }
        },
        'Design': {
            titles: ['UX Designer', 'Senior UX Designer', 'Product Designer', 'Design Lead', 'Head of Design'],
            salaryRanges: { junior: [60000, 85000], mid: [85000, 130000], senior: [130000, 180000], executive: [170000, 280000] }
        },
        'Marketing': {
            titles: ['Marketing Coordinator', 'Marketing Manager', 'Senior Marketing Manager', 'Director of Marketing', 'CMO'],
            salaryRanges: { junior: [45000, 65000], mid: [65000, 100000], senior: [100000, 160000], executive: [150000, 300000] }
        },
        'Sales': {
            titles: ['Sales Representative', 'Account Executive', 'Senior Account Executive', 'Sales Manager', 'VP of Sales'],
            salaryRanges: { junior: [45000, 70000], mid: [70000, 120000], senior: [120000, 180000], executive: [170000, 320000] }
        },
        'Finance': {
            titles: ['Financial Analyst', 'Senior Financial Analyst', 'Finance Manager', 'Controller', 'CFO'],
            salaryRanges: { junior: [55000, 80000], mid: [80000, 120000], senior: [120000, 180000], executive: [180000, 350000] }
        },
        'Human Resources': {
            titles: ['HR Coordinator', 'HR Specialist', 'HR Manager', 'Director of HR', 'Chief People Officer'],
            salaryRanges: { junior: [40000, 60000], mid: [60000, 90000], senior: [90000, 140000], executive: [140000, 250000] }
        },
        'Operations': {
            titles: ['Operations Coordinator', 'Operations Manager', 'Senior Operations Manager', 'Director of Operations', 'COO'],
            salaryRanges: { junior: [45000, 65000], mid: [65000, 100000], senior: [100000, 150000], executive: [150000, 300000] }
        },
        'Customer Success': {
            titles: ['Customer Success Rep', 'Customer Success Manager', 'Senior CSM', 'Director of Customer Success', 'VP of Customer Success'],
            salaryRanges: { junior: [40000, 60000], mid: [60000, 95000], senior: [95000, 140000], executive: [140000, 220000] }
        },
        'Legal': {
            titles: ['Paralegal', 'Legal Counsel', 'Senior Legal Counsel', 'General Counsel', 'Chief Legal Officer'],
            salaryRanges: { junior: [50000, 75000], mid: [90000, 150000], senior: [150000, 220000], executive: [220000, 400000] }
        }
    },

    employmentTypes: [
        { value: 'Full-time', weight: 80 },
        { value: 'Part-time', weight: 10 },
        { value: 'Contract', weight: 7 },
        { value: 'Intern', weight: 3 }
    ],

    educationLevels: [
        { value: 'High School', weight: 15 },
        { value: 'Associate Degree', weight: 15 },
        { value: 'Bachelor\'s Degree', weight: 45 },
        { value: 'Master\'s Degree', weight: 20 },
        { value: 'PhD', weight: 5 }
    ],

    officeLocations: [
        'New York, NY', 'San Francisco, CA', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
        'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Remote'
    ],

    performanceRatings: [
        { value: 1, weight: 3 },
        { value: 2, weight: 12 },
        { value: 3, weight: 40 },
        { value: 4, weight: 35 },
        { value: 5, weight: 10 }
    ],

    /**
     * Generate salary based on title level with bell curve distribution
     */
    generateSalary(department, titleIndex, totalTitles) {
        const dept = this.departments[department];
        let level;
        const ratio = titleIndex / (totalTitles - 1);

        if (ratio < 0.25) level = 'junior';
        else if (ratio < 0.5) level = 'mid';
        else if (ratio < 0.75) level = 'senior';
        else level = 'executive';

        const range = dept.salaryRanges[level];
        const mean = (range[0] + range[1]) / 2;
        const stdDev = (range[1] - range[0]) / 4;

        let salary = DataGen.normalRandom(mean, stdDev);
        salary = DataGen.clamp(salary, range[0], range[1]);

        return Math.round(salary / 1000) * 1000; // Round to nearest thousand
    },

    /**
     * Generate a single HR record
     */
    generateRecord(startDate, endDate, managers = []) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = DataGen.generateFirstName(gender);
        const lastName = DataGen.generateLastName();

        const departmentNames = Object.keys(this.departments);
        const departmentName = DataGen.randomPick(departmentNames);
        const department = this.departments[departmentName];

        const titleIndex = DataGen.randomInt(0, department.titles.length - 1);
        const jobTitle = department.titles[titleIndex];

        const hireDate = DataGen.randomDate(startDate, endDate);
        const today = new Date();
        const yearsEmployed = DataGen.daysBetween(hireDate, today) / 365;
        const yearsExperience = Math.round(yearsEmployed + DataGen.randomInt(0, 15));

        const employeeId = DataGen.generateNumericId('EMP', 6);
        const managerId = managers.length > 0 && titleIndex < department.titles.length - 1
            ? DataGen.randomPick(managers)
            : null;

        return {
            employee_id: employeeId,
            first_name: firstName,
            last_name: lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
            hire_date: DataGen.formatDate(hireDate),
            department: departmentName,
            job_title: jobTitle,
            salary: this.generateSalary(departmentName, titleIndex, department.titles.length),
            employment_type: DataGen.weightedPick(this.employmentTypes),
            manager_id: managerId,
            performance_rating: DataGen.weightedPick(this.performanceRatings),
            years_experience: yearsExperience,
            education_level: DataGen.weightedPick(this.educationLevels),
            office_location: DataGen.randomPick(this.officeLocations)
        };
    },

    /**
     * Generate multiple HR records with hierarchical relationships
     */
    generate(count, startDate, endDate) {
        const records = [];
        const managerPool = [];

        // First pass: Generate all records
        for (let i = 0; i < count; i++) {
            const record = this.generateRecord(startDate, endDate, managerPool);
            records.push(record);

            // Add senior employees to manager pool
            if (record.job_title.includes('Manager') ||
                record.job_title.includes('Director') ||
                record.job_title.includes('VP') ||
                record.job_title.includes('Chief') ||
                record.job_title.includes('Lead') ||
                record.job_title.includes('Senior')) {
                managerPool.push(record.employee_id);
            }
        }

        // Second pass: Assign managers to those without
        for (const record of records) {
            if (!record.manager_id && managerPool.length > 0) {
                // Don't assign self as manager
                const validManagers = managerPool.filter(id => id !== record.employee_id);
                if (validManagers.length > 0) {
                    record.manager_id = DataGen.randomPick(validManagers);
                }
            }
        }

        return records;
    }
};

(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : window)).HRGenerator = HRGenerator;
