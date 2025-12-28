/**
 * Base Data Generation Utilities
 * Provides common functions for generating realistic synthetic data
 */

const DataGen = {
  // ============================================
  // RANDOM UTILITIES
  // ============================================
  
  /**
   * Get random integer between min and max (inclusive)
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Get random float between min and max
   */
  randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  },

  /**
   * Pick random element from array
   */
  randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Pick random element with weighted probability
   * @param {Array} items - Array of {value, weight} objects
   */
  weightedPick(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) return item.value;
    }
    return items[items.length - 1].value;
  },

  /**
   * Generate normally distributed random number (Bell curve)
   */
  normalRandom(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  },

  /**
   * Clamp value between min and max
   */
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  // ============================================
  // ID GENERATORS
  // ============================================

  /**
   * Generate unique ID with prefix
   */
  generateId(prefix, length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = prefix + '-';
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  },

  /**
   * Generate numeric ID with prefix
   */
  generateNumericId(prefix, length = 6) {
    let id = prefix + '-';
    for (let i = 0; i < length; i++) {
      id += Math.floor(Math.random() * 10);
    }
    return id;
  },

  /**
   * Generate UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // ============================================
  // NAME GENERATORS
  // ============================================

  firstNames: {
    male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Joseph', 'Charles', 'Thomas', 'Daniel', 
           'Matthew', 'Anthony', 'Mark', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
           'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas',
           'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond',
           'Alexander', 'Patrick', 'Frank', 'Gregory', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
             'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
             'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
             'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
             'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather']
  },

  lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
              'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
              'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
              'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
              'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'],

  generateFirstName(gender = null) {
    if (!gender) {
      gender = Math.random() > 0.5 ? 'male' : 'female';
    }
    return this.randomPick(this.firstNames[gender]);
  },

  generateLastName() {
    return this.randomPick(this.lastNames);
  },

  generateFullName(gender = null) {
    return `${this.generateFirstName(gender)} ${this.generateLastName()}`;
  },

  // ============================================
  // CONTACT GENERATORS
  // ============================================

  emailDomains: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'],
  corporateDomains: ['company.com', 'enterprise.io', 'corp.net', 'business.org', 'work.co'],

  generateEmail(firstName, lastName, corporate = false) {
    const first = firstName.toLowerCase();
    const last = lastName.toLowerCase();
    const formats = [
      `${first}.${last}`,
      `${first}${last}`,
      `${first[0]}${last}`,
      `${first}${last[0]}`,
      `${first}.${last}${this.randomInt(1, 99)}`
    ];
    const domain = corporate ? this.randomPick(this.corporateDomains) : this.randomPick(this.emailDomains);
    return `${this.randomPick(formats)}@${domain}`;
  },

  generatePhone() {
    const areaCode = this.randomInt(200, 999);
    const prefix = this.randomInt(200, 999);
    const line = this.randomInt(1000, 9999);
    return `(${areaCode}) ${prefix}-${line}`;
  },

  // ============================================
  // ADDRESS GENERATORS
  // ============================================

  streetTypes: ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct', 'Pl', 'Cir'],
  streetNames: ['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington', 'Lake', 'Hill', 'Park',
                'River', 'Forest', 'Spring', 'Valley', 'Sunset', 'Highland', 'Meadow', 'Garden', 'Church', 'Mill'],
  
  cities: [
    { city: 'New York', state: 'NY', zip: '10001' },
    { city: 'Los Angeles', state: 'CA', zip: '90001' },
    { city: 'Chicago', state: 'IL', zip: '60601' },
    { city: 'Houston', state: 'TX', zip: '77001' },
    { city: 'Phoenix', state: 'AZ', zip: '85001' },
    { city: 'Philadelphia', state: 'PA', zip: '19101' },
    { city: 'San Antonio', state: 'TX', zip: '78201' },
    { city: 'San Diego', state: 'CA', zip: '92101' },
    { city: 'Dallas', state: 'TX', zip: '75201' },
    { city: 'San Jose', state: 'CA', zip: '95101' },
    { city: 'Austin', state: 'TX', zip: '78701' },
    { city: 'Jacksonville', state: 'FL', zip: '32099' },
    { city: 'Fort Worth', state: 'TX', zip: '76101' },
    { city: 'Columbus', state: 'OH', zip: '43085' },
    { city: 'Charlotte', state: 'NC', zip: '28201' },
    { city: 'Seattle', state: 'WA', zip: '98101' },
    { city: 'Denver', state: 'CO', zip: '80201' },
    { city: 'Boston', state: 'MA', zip: '02101' },
    { city: 'Nashville', state: 'TN', zip: '37201' },
    { city: 'Portland', state: 'OR', zip: '97201' },
    { city: 'Miami', state: 'FL', zip: '33101' },
    { city: 'Atlanta', state: 'GA', zip: '30301' },
    { city: 'Las Vegas', state: 'NV', zip: '89101' },
    { city: 'Minneapolis', state: 'MN', zip: '55401' },
    { city: 'Detroit', state: 'MI', zip: '48201' }
  ],

  generateStreetAddress() {
    const number = this.randomInt(100, 9999);
    const street = this.randomPick(this.streetNames);
    const type = this.randomPick(this.streetTypes);
    return `${number} ${street} ${type}`;
  },

  generateCity() {
    return this.randomPick(this.cities);
  },

  generateFullAddress() {
    const street = this.generateStreetAddress();
    const location = this.generateCity();
    return `${street}, ${location.city}, ${location.state} ${location.zip}`;
  },

  // ============================================
  // DATE GENERATORS
  // ============================================

  /**
   * Generate random date between start and end
   */
  randomDate(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const randomTime = start + Math.random() * (end - start);
    return new Date(randomTime);
  },

  /**
   * Format date as YYYY-MM-DD
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  /**
   * Format date as YYYY-MM-DD HH:MM:SS
   */
  formatDateTime(date) {
    return date.toISOString().replace('T', ' ').substring(0, 19);
  },

  /**
   * Generate date of birth for realistic age distribution
   */
  generateDOB(minAge = 0, maxAge = 90) {
    const today = new Date();
    const age = this.randomInt(minAge, maxAge);
    const dob = new Date(
      today.getFullYear() - age,
      this.randomInt(0, 11),
      this.randomInt(1, 28)
    );
    return this.formatDate(dob);
  },

  /**
   * Add days to a date
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Get days between two dates
   */
  daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // ============================================
  // BUSINESS DATA
  // ============================================

  companies: ['Acme Corp', 'TechFlow Inc', 'Global Solutions', 'Innovate Labs', 'Summit Enterprises',
              'NextGen Systems', 'Prime Industries', 'Apex Holdings', 'United Dynamics', 'CoreTech',
              'BlueSky Ventures', 'Quantum Analytics', 'FuturePath', 'Stellar Group', 'Pioneer Tech'],

  generateCompanyName() {
    return this.randomPick(this.companies);
  },

  // ============================================
  // CURRENCY FORMATTING
  // ============================================

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  },

  // ============================================
  // SCHEMA DEFINITIONS
  // ============================================
  
  schemas: {
    healthcare: [
      { name: 'patient_id', type: 'ID' },
      { name: 'first_name', type: 'String' },
      { name: 'last_name', type: 'String' },
      { name: 'date_of_birth', type: 'Date' },
      { name: 'gender', type: 'String' },
      { name: 'blood_type', type: 'String' },
      { name: 'diagnosis_code', type: 'String' },
      { name: 'diagnosis_description', type: 'String' },
      { name: 'admission_date', type: 'Date' },
      { name: 'discharge_date', type: 'Date' },
      { name: 'doctor_id', type: 'ID' },
      { name: 'department', type: 'String' },
      { name: 'treatment_cost', type: 'Currency' },
      { name: 'insurance_provider', type: 'String' }
    ],
    finance: [
      { name: 'transaction_id', type: 'ID' },
      { name: 'account_number', type: 'String' },
      { name: 'account_holder', type: 'String' },
      { name: 'transaction_date', type: 'DateTime' },
      { name: 'transaction_type', type: 'String' },
      { name: 'amount', type: 'Currency' },
      { name: 'currency', type: 'String' },
      { name: 'merchant_category', type: 'String' },
      { name: 'merchant_name', type: 'String' },
      { name: 'balance_after', type: 'Currency' },
      { name: 'is_fraud', type: 'Boolean' },
      { name: 'fraud_score', type: 'Number' }
    ],
    retail: [
      { name: 'order_id', type: 'ID' },
      { name: 'customer_id', type: 'ID' },
      { name: 'customer_email', type: 'Email' },
      { name: 'order_date', type: 'DateTime' },
      { name: 'product_sku', type: 'String' },
      { name: 'product_name', type: 'String' },
      { name: 'category', type: 'String' },
      { name: 'quantity', type: 'Number' },
      { name: 'unit_price', type: 'Currency' },
      { name: 'discount_percent', type: 'Number' },
      { name: 'total_amount', type: 'Currency' },
      { name: 'payment_method', type: 'String' },
      { name: 'shipping_address', type: 'Address' },
      { name: 'order_status', type: 'String' }
    ],
    hr: [
      { name: 'employee_id', type: 'ID' },
      { name: 'first_name', type: 'String' },
      { name: 'last_name', type: 'String' },
      { name: 'email', type: 'Email' },
      { name: 'hire_date', type: 'Date' },
      { name: 'department', type: 'String' },
      { name: 'job_title', type: 'String' },
      { name: 'salary', type: 'Currency' },
      { name: 'employment_type', type: 'String' },
      { name: 'manager_id', type: 'ID' },
      { name: 'performance_rating', type: 'Number' },
      { name: 'years_experience', type: 'Number' },
      { name: 'education_level', type: 'String' },
      { name: 'office_location', type: 'String' }
    ],
    manufacturing: [
      { name: 'batch_id', type: 'ID' },
      { name: 'product_line', type: 'String' },
      { name: 'production_date', type: 'DateTime' },
      { name: 'machine_id', type: 'ID' },
      { name: 'operator_id', type: 'ID' },
      { name: 'units_produced', type: 'Number' },
      { name: 'defect_count', type: 'Number' },
      { name: 'quality_score', type: 'Number' },
      { name: 'cycle_time_seconds', type: 'Number' },
      { name: 'downtime_minutes', type: 'Number' },
      { name: 'raw_material_batch', type: 'ID' },
      { name: 'energy_consumption_kwh', type: 'Number' }
    ],
    education: [
      { name: 'student_id', type: 'ID' },
      { name: 'first_name', type: 'String' },
      { name: 'last_name', type: 'String' },
      { name: 'email', type: 'Email' },
      { name: 'enrollment_date', type: 'Date' },
      { name: 'program', type: 'String' },
      { name: 'course_id', type: 'String' },
      { name: 'course_name', type: 'String' },
      { name: 'credits', type: 'Number' },
      { name: 'grade', type: 'String' },
      { name: 'instructor_id', type: 'ID' },
      { name: 'semester', type: 'String' },
      { name: 'tuition_amount', type: 'Currency' },
      { name: 'scholarship_amount', type: 'Currency' }
    ],
    realestate: [
      { name: 'property_id', type: 'ID' },
      { name: 'address', type: 'String' },
      { name: 'city', type: 'String' },
      { name: 'state', type: 'String' },
      { name: 'zip_code', type: 'String' },
      { name: 'property_type', type: 'String' },
      { name: 'bedrooms', type: 'Number' },
      { name: 'bathrooms', type: 'Number' },
      { name: 'square_feet', type: 'Number' },
      { name: 'lot_size_acres', type: 'Number' },
      { name: 'year_built', type: 'Number' },
      { name: 'listing_price', type: 'Currency' },
      { name: 'listing_date', type: 'Date' },
      { name: 'days_on_market', type: 'Number' },
      { name: 'status', type: 'String' },
      { name: 'agent_id', type: 'ID' }
    ],
    logistics: [
      { name: 'shipment_id', type: 'ID' },
      { name: 'tracking_number', type: 'String' },
      { name: 'origin_city', type: 'String' },
      { name: 'origin_country', type: 'String' },
      { name: 'destination_city', type: 'String' },
      { name: 'destination_country', type: 'String' },
      { name: 'ship_date', type: 'DateTime' },
      { name: 'estimated_delivery', type: 'Date' },
      { name: 'actual_delivery', type: 'Date' },
      { name: 'carrier', type: 'String' },
      { name: 'service_type', type: 'String' },
      { name: 'weight_kg', type: 'Number' },
      { name: 'dimensions_cm', type: 'String' },
      { name: 'shipping_cost', type: 'Currency' },
      { name: 'status', type: 'String' },
      { name: 'customs_cleared', type: 'Boolean' }
    ]
  },

  getSchema(industry) {
    return this.schemas[industry] || [];
  }
};

// Make available globally
window.DataGen = DataGen;
