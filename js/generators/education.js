/**
 * Education Data Generator
 * Generates student records with enrollment patterns and grade distributions
 */

const EducationGenerator = {
    programs: [
        { name: 'Computer Science', code: 'CS', tuition: 45000 },
        { name: 'Business Administration', code: 'BA', tuition: 42000 },
        { name: 'Engineering', code: 'ENG', tuition: 48000 },
        { name: 'Psychology', code: 'PSY', tuition: 38000 },
        { name: 'Biology', code: 'BIO', tuition: 40000 },
        { name: 'Economics', code: 'ECO', tuition: 41000 },
        { name: 'Communications', code: 'COM', tuition: 36000 },
        { name: 'Political Science', code: 'POL', tuition: 37000 },
        { name: 'Chemistry', code: 'CHM', tuition: 43000 },
        { name: 'Mathematics', code: 'MTH', tuition: 39000 },
        { name: 'English Literature', code: 'ENG-L', tuition: 35000 },
        { name: 'Art & Design', code: 'ART', tuition: 44000 }
    ],

    coursesByProgram: {
        'CS': [
            { id: 'CS-101', name: 'Introduction to Programming', credits: 4 },
            { id: 'CS-201', name: 'Data Structures', credits: 4 },
            { id: 'CS-301', name: 'Algorithms', credits: 3 },
            { id: 'CS-310', name: 'Database Systems', credits: 3 },
            { id: 'CS-401', name: 'Machine Learning', credits: 4 },
            { id: 'CS-450', name: 'Software Engineering', credits: 3 }
        ],
        'BA': [
            { id: 'BA-101', name: 'Principles of Management', credits: 3 },
            { id: 'BA-201', name: 'Financial Accounting', credits: 4 },
            { id: 'BA-301', name: 'Marketing Strategy', credits: 3 },
            { id: 'BA-310', name: 'Operations Management', credits: 3 },
            { id: 'BA-401', name: 'Business Analytics', credits: 4 },
            { id: 'BA-450', name: 'Strategic Management', credits: 3 }
        ],
        'ENG': [
            { id: 'ENG-101', name: 'Engineering Fundamentals', credits: 4 },
            { id: 'ENG-201', name: 'Thermodynamics', credits: 4 },
            { id: 'ENG-301', name: 'Mechanics of Materials', credits: 3 },
            { id: 'ENG-310', name: 'Fluid Dynamics', credits: 3 },
            { id: 'ENG-401', name: 'Control Systems', credits: 4 },
            { id: 'ENG-450', name: 'Capstone Design', credits: 4 }
        ],
        'default': [
            { id: 'GEN-101', name: 'Introduction to Subject', credits: 3 },
            { id: 'GEN-201', name: 'Intermediate Studies', credits: 3 },
            { id: 'GEN-301', name: 'Advanced Topics', credits: 4 },
            { id: 'GEN-401', name: 'Research Methods', credits: 3 },
            { id: 'GEN-450', name: 'Senior Capstone', credits: 4 }
        ]
    },

    // Grade distribution based on typical university curves
    grades: [
        { value: 'A', gpa: 4.0, weight: 15 },
        { value: 'A-', gpa: 3.7, weight: 12 },
        { value: 'B+', gpa: 3.3, weight: 15 },
        { value: 'B', gpa: 3.0, weight: 20 },
        { value: 'B-', gpa: 2.7, weight: 12 },
        { value: 'C+', gpa: 2.3, weight: 10 },
        { value: 'C', gpa: 2.0, weight: 8 },
        { value: 'C-', gpa: 1.7, weight: 4 },
        { value: 'D', gpa: 1.0, weight: 2 },
        { value: 'F', gpa: 0.0, weight: 2 }
    ],

    /**
     * Generate semester string
     */
    generateSemester(date) {
        const month = date.getMonth();
        const year = date.getFullYear();

        if (month >= 0 && month <= 4) {
            return `Spring ${year}`;
        } else if (month >= 5 && month <= 7) {
            return `Summer ${year}`;
        } else {
            return `Fall ${year}`;
        }
    },

    /**
     * Generate enrollment date with semester patterns
     */
    generateEnrollmentDate(startDate, endDate) {
        const date = DataGen.randomDate(startDate, endDate);
        const month = date.getMonth();

        // Adjust to semester start months (January, June, September)
        if (month >= 0 && month <= 4) {
            date.setMonth(0); // January
        } else if (month >= 5 && month <= 7) {
            date.setMonth(5); // June
        } else {
            date.setMonth(8); // September
        }

        date.setDate(DataGen.randomInt(1, 15));
        return date;
    },

    /**
     * Generate scholarship based on grades and tuition
     */
    generateScholarship(tuition) {
        const hasScholarship = Math.random() < 0.35; // 35% get some scholarship

        if (!hasScholarship) return 0;

        const scholarshipLevels = [
            { value: Math.round(tuition * 0.1), weight: 40 },  // 10%
            { value: Math.round(tuition * 0.25), weight: 30 }, // 25%
            { value: Math.round(tuition * 0.5), weight: 20 },  // 50%
            { value: Math.round(tuition * 0.75), weight: 7 },  // 75%
            { value: tuition, weight: 3 }                       // Full
        ];

        return DataGen.weightedPick(scholarshipLevels);
    },

    /**
     * Generate a single education record
     */
    generateRecord(startDate, endDate) {
        const gender = Math.random() > 0.48 ? 'female' : 'male'; // Slightly more female students
        const firstName = DataGen.generateFirstName(gender);
        const lastName = DataGen.generateLastName();

        const program = DataGen.randomPick(this.programs);
        const courses = this.coursesByProgram[program.code] || this.coursesByProgram['default'];
        const course = DataGen.randomPick(courses);

        const enrollmentDate = this.generateEnrollmentDate(startDate, endDate);
        const semester = this.generateSemester(enrollmentDate);

        return {
            student_id: DataGen.generateNumericId('STU', 7),
            first_name: firstName,
            last_name: lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`,
            enrollment_date: DataGen.formatDate(enrollmentDate),
            program: program.name,
            course_id: course.id,
            course_name: course.name,
            credits: course.credits,
            grade: DataGen.weightedPick(this.grades).value,
            instructor_id: DataGen.generateNumericId('INST', 4),
            semester: semester,
            tuition_amount: program.tuition,
            scholarship_amount: this.generateScholarship(program.tuition)
        };
    },

    /**
     * Generate multiple education records
     */
    generate(count, startDate, endDate) {
        const records = [];

        // Generate student pool (students take multiple courses)
        const studentPool = [];
        const uniqueStudents = Math.floor(count * 0.5); // Each student takes ~2 courses

        for (let i = 0; i < uniqueStudents; i++) {
            const gender = Math.random() > 0.48 ? 'female' : 'male';
            const firstName = DataGen.generateFirstName(gender);
            const lastName = DataGen.generateLastName();
            studentPool.push({
                id: DataGen.generateNumericId('STU', 7),
                firstName,
                lastName,
                program: DataGen.randomPick(this.programs)
            });
        }

        for (let i = 0; i < count; i++) {
            const student = DataGen.randomPick(studentPool);
            const courses = this.coursesByProgram[student.program.code] || this.coursesByProgram['default'];
            const course = DataGen.randomPick(courses);
            const enrollmentDate = this.generateEnrollmentDate(startDate, endDate);

            records.push({
                student_id: student.id,
                first_name: student.firstName,
                last_name: student.lastName,
                email: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@university.edu`,
                enrollment_date: DataGen.formatDate(enrollmentDate),
                program: student.program.name,
                course_id: course.id,
                course_name: course.name,
                credits: course.credits,
                grade: DataGen.weightedPick(this.grades).value,
                instructor_id: DataGen.generateNumericId('INST', 4),
                semester: this.generateSemester(enrollmentDate),
                tuition_amount: student.program.tuition,
                scholarship_amount: this.generateScholarship(student.program.tuition)
            });
        }

        return records;
    }
};

(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : window)).EducationGenerator = EducationGenerator;
