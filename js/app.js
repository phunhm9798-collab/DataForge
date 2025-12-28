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
        filteredData: [],
        currentPage: 1,
        rowsPerPage: 50,
        selectedColumns: [],
        searchQuery: '',
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
        loadTemplatesList();
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
            outlierFrequency: document.getElementById('outlierFrequency'),
            // New feature elements
            templateName: document.getElementById('templateName'),
            templateSelect: document.getElementById('templateSelect'),
            saveTemplateBtn: document.getElementById('saveTemplateBtn'),
            loadTemplateBtn: document.getElementById('loadTemplateBtn'),
            deleteTemplateBtn: document.getElementById('deleteTemplateBtn'),
            exportJsonBtn: document.getElementById('exportJsonBtn'),
            exportSqlBtn: document.getElementById('exportSqlBtn'),
            sqlTableName: document.getElementById('sqlTableName'),
            tableSearch: document.getElementById('tableSearch'),
            selectAllColumns: document.getElementById('selectAllColumns'),
            deselectAllColumns: document.getElementById('deselectAllColumns'),
            progressContainer: document.getElementById('progressContainer'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText')
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

        // Template event handlers
        elements.saveTemplateBtn.addEventListener('click', saveTemplate);
        elements.loadTemplateBtn.addEventListener('click', loadTemplate);
        elements.deleteTemplateBtn.addEventListener('click', deleteTemplate);
        elements.templateSelect.addEventListener('change', handleTemplateSelectChange);

        // New export handlers
        elements.exportJsonBtn.addEventListener('click', handleExportJSON);
        elements.exportSqlBtn.addEventListener('click', handleExportSQL);

        // Search handler
        elements.tableSearch.addEventListener('input', handleSearch);

        // Column selection handlers
        elements.selectAllColumns.addEventListener('click', selectAllColumns);
        elements.deselectAllColumns.addEventListener('click', deselectAllColumns);
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

        // Initialize all columns as selected
        state.selectedColumns = schema.map(col => col.name);

        elements.schemaColumns.innerHTML = schema.map(col => `
      <label class="schema-column selected" data-column="${col.name}">
        <input type="checkbox" checked data-column="${col.name}">
        <span class="column-name">${col.name}</span>
        <span class="type">${col.type}</span>
      </label>
    `).join('');

        // Bind column checkbox events
        elements.schemaColumns.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', handleColumnToggle);
        });
    }

    /**
     * Handle column checkbox toggle
     */
    function handleColumnToggle(e) {
        const column = e.target.dataset.column;
        const label = e.target.closest('.schema-column');

        if (e.target.checked) {
            if (!state.selectedColumns.includes(column)) {
                state.selectedColumns.push(column);
            }
            label.classList.add('selected');
        } else {
            state.selectedColumns = state.selectedColumns.filter(c => c !== column);
            label.classList.remove('selected');
        }
    }

    /**
     * Select all columns
     */
    function selectAllColumns() {
        const schema = DataGen.getSchema(state.selectedIndustry);
        state.selectedColumns = schema.map(col => col.name);

        elements.schemaColumns.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
            cb.closest('.schema-column').classList.add('selected');
        });
    }

    /**
     * Deselect all columns
     */
    function deselectAllColumns() {
        state.selectedColumns = [];

        elements.schemaColumns.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.closest('.schema-column').classList.remove('selected');
        });
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
        // Use filtered data if searching, otherwise use all data
        const displayData = state.searchQuery ? state.filteredData : state.generatedData;

        if (displayData.length === 0 && state.generatedData.length === 0) {
            elements.emptyState.classList.remove('hidden');
            elements.dataTable.classList.add('hidden');
            elements.pagination.classList.add('hidden');
            return;
        }

        elements.emptyState.classList.add('hidden');
        elements.dataTable.classList.remove('hidden');
        elements.pagination.classList.remove('hidden');

        // Handle empty search results
        if (displayData.length === 0 && state.searchQuery) {
            elements.tableBody.innerHTML = `<tr><td colspan="100" style="text-align: center; padding: 2rem; color: var(--text-muted);">No results found for "${state.searchQuery}"</td></tr>`;
            elements.tableHead.innerHTML = '';
            return;
        }

        const headers = Object.keys(displayData[0]);

        // Render headers
        elements.tableHead.innerHTML = `
      <tr>
        ${headers.map(h => `<th>${formatHeader(h)}</th>`).join('')}
      </tr>
    `;

        // Get page data
        const startIndex = (state.currentPage - 1) * state.rowsPerPage;
        const endIndex = startIndex + state.rowsPerPage;
        const pageData = displayData.slice(startIndex, endIndex);

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
        const displayData = state.searchQuery ? state.filteredData : state.generatedData;
        const totalPages = Math.max(1, Math.ceil(displayData.length / state.rowsPerPage));

        elements.pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
        elements.prevPage.disabled = state.currentPage === 1;
        elements.nextPage.disabled = state.currentPage === totalPages || totalPages === 0;
    }

    /**
     * Change page
     */
    function changePage(delta) {
        const displayData = state.searchQuery ? state.filteredData : state.generatedData;
        const totalPages = Math.max(1, Math.ceil(displayData.length / state.rowsPerPage));
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
        const hasData = state.generatedData.length > 0;
        elements.exportCsvBtn.disabled = !hasData;
        elements.exportXlsxBtn.disabled = !hasData;
        elements.exportJsonBtn.disabled = !hasData;
        elements.exportSqlBtn.disabled = !hasData;
    }

    /**
     * Get export data (filtered by selected columns)
     */
    function getExportData() {
        const data = state.searchQuery ? state.filteredData : state.generatedData;
        if (state.selectedColumns.length === 0 || state.selectedColumns.length === Object.keys(data[0] || {}).length) {
            return data;
        }
        return Exporter.filterColumns(data, state.selectedColumns);
    }

    /**
     * Handle CSV export
     */
    function handleExportCSV() {
        if (state.generatedData.length === 0) return;

        const filename = `${state.selectedIndustry}_data_${getTimestamp()}`;
        Exporter.downloadCSV(getExportData(), filename);
        showToast('CSV file downloaded successfully!', 'success');
    }

    /**
     * Handle XLSX export
     */
    function handleExportXLSX() {
        if (state.generatedData.length === 0) return;

        const filename = `${state.selectedIndustry}_data_${getTimestamp()}`;
        const success = Exporter.downloadXLSX(getExportData(), filename);

        if (success) {
            showToast('Excel file downloaded successfully!', 'success');
        } else {
            showToast('Error creating Excel file. CSV export is still available.', 'error');
        }
    }

    /**
     * Handle JSON export
     */
    function handleExportJSON() {
        if (state.generatedData.length === 0) return;

        const filename = `${state.selectedIndustry}_data_${getTimestamp()}`;
        Exporter.downloadJSON(getExportData(), filename);
        showToast('JSON file downloaded successfully!', 'success');
    }

    /**
     * Handle SQL export
     */
    function handleExportSQL() {
        if (state.generatedData.length === 0) return;

        const tableName = elements.sqlTableName.value || 'data_table';
        const filename = `${state.selectedIndustry}_data_${getTimestamp()}`;
        Exporter.downloadSQL(getExportData(), filename, tableName);
        showToast('SQL file downloaded successfully!', 'success');
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

    // ============================================
    // TEMPLATE MANAGEMENT
    // ============================================

    const TEMPLATE_STORAGE_KEY = 'dataforge_templates';

    /**
     * Get all saved templates
     */
    function getTemplates() {
        try {
            return JSON.parse(localStorage.getItem(TEMPLATE_STORAGE_KEY)) || {};
        } catch {
            return {};
        }
    }

    /**
     * Save template to localStorage
     */
    function saveTemplate() {
        const name = elements.templateName.value.trim();
        if (!name) {
            showToast('Please enter a template name', 'error');
            return;
        }

        const templates = getTemplates();
        templates[name] = {
            industry: state.selectedIndustry,
            rowCount: parseInt(elements.rowCount.value),
            startDate: elements.startDate.value,
            endDate: elements.endDate.value,
            advancedOptions: { ...state.advancedOptions },
            selectedColumns: [...state.selectedColumns]
        };

        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
        elements.templateName.value = '';
        loadTemplatesList();
        showToast(`Template "${name}" saved successfully!`, 'success');
    }

    /**
     * Load template list into dropdown
     */
    function loadTemplatesList() {
        const templates = getTemplates();
        const names = Object.keys(templates);

        elements.templateSelect.innerHTML = '<option value="">— Select a template —</option>' +
            names.map(name => `<option value="${name}">${name}</option>`).join('');
    }

    /**
     * Handle template dropdown change
     */
    function handleTemplateSelectChange() {
        const hasSelection = elements.templateSelect.value !== '';
        elements.loadTemplateBtn.disabled = !hasSelection;
        elements.deleteTemplateBtn.disabled = !hasSelection;
    }

    /**
     * Load selected template
     */
    function loadTemplate() {
        const name = elements.templateSelect.value;
        if (!name) return;

        const templates = getTemplates();
        const template = templates[name];
        if (!template) return;

        // Apply template settings
        state.selectedIndustry = template.industry;
        elements.rowCount.value = template.rowCount;
        elements.startDate.value = template.startDate;
        elements.endDate.value = template.endDate;

        // Update industry selection UI
        const currentSelected = elements.industryGrid.querySelector('.selected');
        if (currentSelected) currentSelected.classList.remove('selected');
        const newSelected = elements.industryGrid.querySelector(`[data-industry="${template.industry}"]`);
        if (newSelected) newSelected.classList.add('selected');

        // Apply advanced options
        if (template.advancedOptions) {
            state.advancedOptions = { ...template.advancedOptions };
            elements.dataQuality.value = template.advancedOptions.dataQuality;
            elements.varianceLevel.value = template.advancedOptions.varianceLevel;
            elements.nullPercentage.value = template.advancedOptions.nullPercentage;
            elements.outlierFrequency.value = template.advancedOptions.outlierFrequency;
        }

        // Update schema preview
        updateSchemaPreview();

        // Apply selected columns from template
        if (template.selectedColumns && template.selectedColumns.length > 0) {
            state.selectedColumns = template.selectedColumns;
            elements.schemaColumns.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                const isSelected = template.selectedColumns.includes(cb.dataset.column);
                cb.checked = isSelected;
                cb.closest('.schema-column').classList.toggle('selected', isSelected);
            });
        }

        showToast(`Template "${name}" loaded!`, 'success');
    }

    /**
     * Delete selected template
     */
    function deleteTemplate() {
        const name = elements.templateSelect.value;
        if (!name) return;

        const templates = getTemplates();
        delete templates[name];
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
        loadTemplatesList();
        elements.loadTemplateBtn.disabled = true;
        elements.deleteTemplateBtn.disabled = true;
        showToast(`Template "${name}" deleted`, 'success');
    }

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================

    /**
     * Handle search input
     */
    function handleSearch() {
        state.searchQuery = elements.tableSearch.value.toLowerCase().trim();
        state.currentPage = 1;

        if (!state.searchQuery) {
            state.filteredData = [];
            renderTable();
            return;
        }

        // Filter data by search query
        state.filteredData = state.generatedData.filter(row => {
            return Object.values(row).some(value => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(state.searchQuery);
            });
        });

        renderTable();
        updateStats();
    }

    // ============================================
    // PROGRESS BAR
    // ============================================

    /**
     * Show progress bar
     */
    function showProgress() {
        elements.progressContainer.classList.remove('hidden');
        updateProgress(0);
    }

    /**
     * Hide progress bar
     */
    function hideProgress() {
        elements.progressContainer.classList.add('hidden');
    }

    /**
     * Update progress bar
     */
    function updateProgress(percent) {
        elements.progressFill.style.width = `${percent}%`;
        elements.progressText.textContent = `Generating... ${Math.round(percent)}%`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
