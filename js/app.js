/**
 * DataForge - Main Application Controller
 * Synthetic Data Generator Application
 */

(function () {
    'use strict';

    // Application State
    const state = {
        selectedIndustry: 'healthcare',
        generatedData: [],
        currentPage: 1,
        rowsPerPage: 50,
        // Advanced options state
        advancedOptions: {
            dataQuality: 'balanced',
            varianceLevel: 'medium',
            nullPercentage: 0,
            outlierFrequency: 'rare'
        }
    };

    // Industry to Generator mapping
    const generators = {
        healthcare: () => window.HealthcareGenerator,
        finance: () => window.FinanceGenerator,
        retail: () => window.RetailGenerator,
        hr: () => window.HRGenerator,
        manufacturing: () => window.ManufacturingGenerator,
        education: () => window.EducationGenerator,
        realestate: () => window.RealEstateGenerator,
        logistics: () => window.LogisticsGenerator
    };

    // Industry display names
    const industryNames = {
        healthcare: 'Healthcare',
        finance: 'Finance',
        retail: 'Retail',
        hr: 'HR',
        manufacturing: 'Manufacturing',
        education: 'Education',
        realestate: 'Real Estate',
        logistics: 'Logistics'
    };

    // DOM Elements Cache
    let elements = {};

    /**
     * Initialize application
     */
    function init() {
        cacheElements();
        bindEvents();
        updateSchemaPreview();
        setDefaultDates();
    }

    /**
     * Cache DOM elements for performance
     */
    function cacheElements() {
        elements = {
            industryGrid: document.getElementById('industryGrid'),
            schemaColumns: document.getElementById('schemaColumns'),
            rowCount: document.getElementById('rowCount'),
            startDate: document.getElementById('startDate'),
            endDate: document.getElementById('endDate'),
            generateBtn: document.getElementById('generateBtn'),
            exportCsvBtn: document.getElementById('exportCsvBtn'),
            exportXlsxBtn: document.getElementById('exportXlsxBtn'),
            tableContainer: document.getElementById('tableContainer'),
            dataTable: document.getElementById('dataTable'),
            tableHead: document.getElementById('tableHead'),
            tableBody: document.getElementById('tableBody'),
            emptyState: document.getElementById('emptyState'),
            pagination: document.getElementById('pagination'),
            prevPage: document.getElementById('prevPage'),
            nextPage: document.getElementById('nextPage'),
            pageInfo: document.getElementById('pageInfo'),
            statRows: document.getElementById('statRows'),
            statColumns: document.getElementById('statColumns'),
            statIndustry: document.getElementById('statIndustry'),
            statSize: document.getElementById('statSize'),
            toastContainer: document.getElementById('toastContainer'),
            // Advanced options elements
            advancedToggleBtn: document.getElementById('advancedToggleBtn'),
            advancedPanel: document.getElementById('advancedPanel'),
            dataQuality: document.getElementById('dataQuality'),
            varianceLevel: document.getElementById('varianceLevel'),
            nullPercentage: document.getElementById('nullPercentage'),
            outlierFrequency: document.getElementById('outlierFrequency')
        };
    }

    /**
     * Set default dates (last 2 years)
     */
    function setDefaultDates() {
        const today = new Date();
        const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

        elements.startDate.value = formatDateInput(twoYearsAgo);
        elements.endDate.value = formatDateInput(today);
    }

    /**
     * Format date for input field
     */
    function formatDateInput(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Industry selection
        elements.industryGrid.addEventListener('click', handleIndustrySelect);

        // Generate button
        elements.generateBtn.addEventListener('click', handleGenerate);

        // Export buttons
        elements.exportCsvBtn.addEventListener('click', handleExportCSV);
        elements.exportXlsxBtn.addEventListener('click', handleExportXLSX);

        // Pagination
        elements.prevPage.addEventListener('click', () => changePage(-1));
        elements.nextPage.addEventListener('click', () => changePage(1));

        // Row count validation
        elements.rowCount.addEventListener('change', validateRowCount);

        // Advanced options toggle
        elements.advancedToggleBtn.addEventListener('click', toggleAdvancedOptions);

        // Advanced options change handlers
        elements.dataQuality.addEventListener('change', updateAdvancedOptions);
        elements.varianceLevel.addEventListener('change', updateAdvancedOptions);
        elements.nullPercentage.addEventListener('change', updateAdvancedOptions);
        elements.outlierFrequency.addEventListener('change', updateAdvancedOptions);
    }

    /**
     * Toggle advanced options panel
     */
    function toggleAdvancedOptions() {
        const isHidden = elements.advancedPanel.classList.contains('hidden');

        if (isHidden) {
            elements.advancedPanel.classList.remove('hidden');
            elements.advancedToggleBtn.classList.add('open');
        } else {
            elements.advancedPanel.classList.add('hidden');
            elements.advancedToggleBtn.classList.remove('open');
        }
    }

    /**
     * Update advanced options state
     */
    function updateAdvancedOptions() {
        state.advancedOptions = {
            dataQuality: elements.dataQuality.value,
            varianceLevel: elements.varianceLevel.value,
            nullPercentage: parseInt(elements.nullPercentage.value),
            outlierFrequency: elements.outlierFrequency.value
        };

        // Update DataGen global settings
        applyAdvancedOptionsToGenerator();
    }

    /**
     * Apply advanced options to the data generator
     */
    function applyAdvancedOptionsToGenerator() {
        const opts = state.advancedOptions;

        // Configure variance multiplier based on level
        const varianceMultipliers = {
            low: 0.5,
            medium: 1.0,
            high: 2.0
        };
        DataGen.varianceMultiplier = varianceMultipliers[opts.varianceLevel] || 1.0;

        // Configure quality settings
        const qualitySettings = {
            quick: { correlations: false, detailedPatterns: false },
            balanced: { correlations: true, detailedPatterns: false },
            high: { correlations: true, detailedPatterns: true }
        };
        DataGen.qualitySettings = qualitySettings[opts.dataQuality] || qualitySettings.balanced;

        // Configure null percentage
        DataGen.nullPercentage = opts.nullPercentage / 100;

        // Configure outlier frequency
        const outlierRates = {
            none: 0,
            rare: 0.01,
            occasional: 0.05,
            frequent: 0.10
        };
        DataGen.outlierRate = outlierRates[opts.outlierFrequency] || 0.01;
    }

    /**
     * Handle industry selection
     */
    function handleIndustrySelect(e) {
        const option = e.target.closest('.industry-option');
        if (!option) return;

        // Update selection
        const currentSelected = elements.industryGrid.querySelector('.selected');
        if (currentSelected) {
            currentSelected.classList.remove('selected');
        }
        option.classList.add('selected');

        state.selectedIndustry = option.dataset.industry;
        updateSchemaPreview();
    }

    /**
     * Update schema preview for selected industry
     */
    function updateSchemaPreview() {
        const schema = DataGen.getSchema(state.selectedIndustry);

        elements.schemaColumns.innerHTML = schema.map(col => `
      <span class="schema-column">
        <span>${col.name}</span>
        <span class="type">${col.type}</span>
      </span>
    `).join('');
    }

    /**
     * Validate row count input
     */
    function validateRowCount() {
        let value = parseInt(elements.rowCount.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 10000) value = 10000;
        elements.rowCount.value = value;
    }

    /**
     * Handle data generation
     */
    function handleGenerate() {
        const rowCount = parseInt(elements.rowCount.value);
        const startDate = elements.startDate.value;
        const endDate = elements.endDate.value;

        // Validate
        if (!startDate || !endDate) {
            showToast('Please select valid date range', 'error');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            showToast('Start date must be before end date', 'error');
            return;
        }

        // Apply advanced options before generation
        updateAdvancedOptions();

        // Show loading state
        elements.generateBtn.disabled = true;
        elements.generateBtn.innerHTML = '<span class="loading-spinner"></span><span>Generating...</span>';

        // Generate data (use setTimeout for UI responsiveness)
        setTimeout(() => {
            try {
                const generator = generators[state.selectedIndustry]();
                let data = generator.generate(rowCount, startDate, endDate);

                // Apply post-processing for nulls and outliers
                data = applyNullValues(data);
                data = applyOutliers(data);

                state.generatedData = data;
                state.currentPage = 1;

                // Update UI
                renderTable();
                updateStats();
                enableExport();

                showToast(`Generated ${rowCount.toLocaleString()} records successfully!`, 'success');
            } catch (error) {
                console.error('Generation error:', error);
                showToast('Error generating data. Please try again.', 'error');
            } finally {
                // Reset button
                elements.generateBtn.disabled = false;
                elements.generateBtn.innerHTML = '<span>⚡</span><span>Generate Data</span>';
            }
        }, 100);
    }

    /**
     * Apply null values based on configured percentage
     */
    function applyNullValues(data) {
        const nullPct = state.advancedOptions.nullPercentage / 100;
        if (nullPct === 0) return data;

        // Fields that should NEVER be null (core identity fields)
        const protectedFields = ['first_name', 'last_name', 'patient_id', 'employee_id',
            'student_id', 'order_id', 'transaction_id', 'batch_id', 'property_id',
            'shipment_id', 'account_holder', 'customer_id'];

        // Fields that are more likely to have missing data
        const nullableFields = ['email', 'phone', 'address', 'manager_id', 'discount_percent',
            'scholarship_amount', 'actual_delivery', 'customs_cleared', 'lot_size_acres'];

        return data.map(row => {
            const newRow = { ...row };
            for (const key of Object.keys(newRow)) {
                // Skip protected fields - never null
                if (protectedFields.includes(key)) continue;

                // Apply nulls to nullable fields or randomly to other fields
                if (Math.random() < nullPct && (nullableFields.includes(key) || Math.random() < 0.3)) {
                    newRow[key] = null;
                }
            }
            return newRow;
        });
    }

    /**
     * Apply outlier values based on configured frequency
     */
    function applyOutliers(data) {
        const outlierRates = {
            none: 0,
            rare: 0.01,
            occasional: 0.05,
            frequent: 0.10
        };
        const rate = outlierRates[state.advancedOptions.outlierFrequency] || 0;
        if (rate === 0) return data;

        const numericFields = ['amount', 'salary', 'treatment_cost', 'total_amount', 'unit_price',
            'listing_price', 'shipping_cost', 'weight_kg', 'square_feet', 'tuition_amount'];

        return data.map(row => {
            const newRow = { ...row };
            for (const key of Object.keys(newRow)) {
                if (numericFields.includes(key) && typeof newRow[key] === 'number' && Math.random() < rate) {
                    // Create outlier by multiplying by random factor
                    const multiplier = Math.random() < 0.5 ? 0.1 : Math.random() * 5 + 2;
                    newRow[key] = Math.round(newRow[key] * multiplier * 100) / 100;
                }
            }
            return newRow;
        });
    }

    /**
     * Render data table
     */
    function renderTable() {
        if (state.generatedData.length === 0) {
            elements.emptyState.classList.remove('hidden');
            elements.dataTable.classList.add('hidden');
            elements.pagination.classList.add('hidden');
            return;
        }

        elements.emptyState.classList.add('hidden');
        elements.dataTable.classList.remove('hidden');
        elements.pagination.classList.remove('hidden');

        const headers = Object.keys(state.generatedData[0]);

        // Render headers
        elements.tableHead.innerHTML = `
      <tr>
        ${headers.map(h => `<th>${formatHeader(h)}</th>`).join('')}
      </tr>
    `;

        // Get page data
        const startIndex = (state.currentPage - 1) * state.rowsPerPage;
        const endIndex = startIndex + state.rowsPerPage;
        const pageData = state.generatedData.slice(startIndex, endIndex);

        // Render rows
        elements.tableBody.innerHTML = pageData.map(row => `
      <tr>
        ${headers.map(h => `<td title="${escapeHtml(row[h])}">${formatCell(row[h])}</td>`).join('')}
      </tr>
    `).join('');

        // Update pagination
        updatePagination();
    }

    /**
     * Format header for display
     */
    function formatHeader(header) {
        return header
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    /**
     * Format cell value for display
     */
    function formatCell(value) {
        if (value === null || value === undefined) return '—';
        if (typeof value === 'boolean') return value ? '✓' : '✗';
        if (typeof value === 'number') {
            // Format currency
            if (value > 100 && value === Math.round(value)) {
                return value.toLocaleString();
            }
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        return escapeHtml(String(value));
    }

    /**
     * Escape HTML entities
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Update pagination controls
     */
    function updatePagination() {
        const totalPages = Math.ceil(state.generatedData.length / state.rowsPerPage);

        elements.pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
        elements.prevPage.disabled = state.currentPage === 1;
        elements.nextPage.disabled = state.currentPage === totalPages;
    }

    /**
     * Change page
     */
    function changePage(delta) {
        const totalPages = Math.ceil(state.generatedData.length / state.rowsPerPage);
        const newPage = state.currentPage + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            state.currentPage = newPage;
            renderTable();

            // Scroll to top of table
            elements.tableContainer.scrollTop = 0;
        }
    }

    /**
     * Update statistics display
     */
    function updateStats() {
        const data = state.generatedData;

        if (data.length === 0) {
            elements.statRows.textContent = '0';
            elements.statColumns.textContent = '0';
            elements.statIndustry.textContent = '—';
            elements.statSize.textContent = '0 KB';
            return;
        }

        elements.statRows.textContent = data.length.toLocaleString();
        elements.statColumns.textContent = Object.keys(data[0]).length;
        elements.statIndustry.textContent = industryNames[state.selectedIndustry];
        elements.statSize.textContent = `${Exporter.estimateSize(data)} KB`;
    }

    /**
     * Enable export buttons
     */
    function enableExport() {
        elements.exportCsvBtn.disabled = state.generatedData.length === 0;
        elements.exportXlsxBtn.disabled = state.generatedData.length === 0;
    }

    /**
     * Handle CSV export
     */
    function handleExportCSV() {
        if (state.generatedData.length === 0) return;

        const filename = `${state.selectedIndustry}_data_${getTimestamp()}`;
        Exporter.downloadCSV(state.generatedData, filename);
        showToast('CSV file downloaded successfully!', 'success');
    }

    /**
     * Handle XLSX export
     */
    function handleExportXLSX() {
        if (state.generatedData.length === 0) return;

        const filename = `${state.selectedIndustry}_data_${getTimestamp()}`;
        const success = Exporter.downloadXLSX(state.generatedData, filename);

        if (success) {
            showToast('Excel file downloaded successfully!', 'success');
        } else {
            showToast('Error creating Excel file. CSV export is still available.', 'error');
        }
    }

    /**
     * Get timestamp for filename
     */
    function getTimestamp() {
        const now = new Date();
        return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = type === 'success' ? '✓' : '✗';

        toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

        elements.toastContainer.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
