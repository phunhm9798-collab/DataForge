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
        // Sorting state
        sortColumn: null,
        sortDirection: 'asc', // 'asc' or 'desc'
        // Virtual scrolling state
        virtualScroll: {
            rowHeight: 40,
            visibleRows: 20,
            bufferRows: 5,
            scrollTop: 0
        },
        // Web Worker
        worker: null,
        isGenerating: false,
        // Statistics collapsed state
        statsCollapsed: false,
        // Advanced options state
        advancedOptions: {
            dataQuality: 'balanced',
            varianceLevel: 'medium',
            nullPercentage: 0,
            outlierFrequency: 'rare'
        }
    };

    // Initialize Web Worker if available
    function initWorker() {
        if (typeof Worker !== 'undefined') {
            try {
                state.worker = new Worker('js/worker.js');
                state.worker.onmessage = handleWorkerMessage;
                state.worker.onerror = handleWorkerError;
                console.log('Web Worker initialized successfully');
            } catch (e) {
                console.warn('Failed to initialize Web Worker:', e);
                state.worker = null;
            }
        }
    }

    // Handle messages from Web Worker
    function handleWorkerMessage(e) {
        const { type, payload } = e.data;

        switch (type) {
            case 'progress':
                updateProgress(payload.progress);
                break;
            case 'complete':
                handleGenerationComplete(payload.data);
                break;
            case 'error':
                handleGenerationError(payload.message);
                break;
        }
    }

    // Handle Web Worker errors
    function handleWorkerError(error) {
        console.error('Worker error:', error);
        handleGenerationError('Worker encountered an error');
    }

    // Handle generation complete
    function handleGenerationComplete(data) {
        state.generatedData = data;
        state.filteredData = [];
        state.searchQuery = '';
        state.currentPage = 1;
        state.isGenerating = false;
        state.sortColumn = null;
        state.sortDirection = 'asc';

        // Clear search
        if (elements.tableSearch) {
            elements.tableSearch.value = '';
        }

        // Hide progress
        hideProgress();

        // Update UI
        renderTable();
        updateStats();
        enableExport();
        updateSearchColumnDropdown();

        // Cache data for later retrieval
        cacheCurrentData();

        // Reset button
        elements.generateBtn.disabled = false;
        elements.generateBtn.innerHTML = '<span>⚡</span><span>Generate Data</span>';

        showToast(`Generated ${data.length.toLocaleString()} records successfully!`, 'success');
    }

    // Handle generation error
    function handleGenerationError(message) {
        state.isGenerating = false;
        hideProgress();

        elements.generateBtn.disabled = false;
        elements.generateBtn.innerHTML = '<span>⚡</span><span>Generate Data</span>';

        showToast(`Error: ${message}`, 'error');
    }

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
        initWorker();
        setupVirtualScroll();
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
            // Enhanced search elements
            searchColumn: document.getElementById('searchColumn'),
            searchClearBtn: document.getElementById('searchClearBtn'),
            searchResults: document.getElementById('searchResults'),
            searchResultsCount: document.getElementById('searchResultsCount'),
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

        // Search handlers
        elements.tableSearch.addEventListener('input', handleSearch);
        if (elements.searchColumn) {
            elements.searchColumn.addEventListener('change', handleSearch);
        }
        if (elements.searchClearBtn) {
            elements.searchClearBtn.addEventListener('click', clearSearch);
        }

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
        // Increased limit with Web Worker support
        if (value > 100000) value = 100000;
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

        // Prevent double generation
        if (state.isGenerating) {
            showToast('Generation already in progress', 'error');
            return;
        }

        // Apply advanced options before generation
        updateAdvancedOptions();

        // Show loading state
        state.isGenerating = true;
        elements.generateBtn.disabled = true;
        elements.generateBtn.innerHTML = '<span class="loading-spinner"></span><span>Generating...</span>';

        // Show progress bar for larger datasets
        if (rowCount > 500) {
            showProgress();
        }

        // Use Web Worker for large datasets, otherwise use sync generation
        if (state.worker && rowCount >= 1000) {
            generateWithWorker(rowCount, startDate, endDate);
        } else {
            generateSync(rowCount, startDate, endDate);
        }
    }

    /**
     * Generate data using Web Worker (non-blocking)
     */
    function generateWithWorker(rowCount, startDate, endDate) {
        state.worker.postMessage({
            type: 'generate',
            payload: {
                industry: state.selectedIndustry,
                rowCount: rowCount,
                startDate: startDate,
                endDate: endDate,
                advancedOptions: state.advancedOptions
            }
        });
    }

    /**
     * Generate data synchronously (blocking, used for small datasets or fallback)
     */
    function generateSync(rowCount, startDate, endDate) {
        setTimeout(() => {
            try {
                const generator = generators[state.selectedIndustry]();
                let data = generator.generate(rowCount, startDate, endDate);

                // Apply post-processing for nulls and outliers
                data = applyNullValues(data);
                data = applyOutliers(data);

                handleGenerationComplete(data);
            } catch (error) {
                console.error('Generation error:', error);
                handleGenerationError('Error generating data. Please try again.');
            }
        }, 50);
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

        // Render headers with sorting support and row number column
        elements.tableHead.innerHTML = `
      <tr>
        <th class="row-number" aria-label="Row number">#</th>
        ${headers.map(h => {
            const sortClass = state.sortColumn === h
                ? (state.sortDirection === 'asc' ? 'sortable sort-asc' : 'sortable sort-desc')
                : 'sortable';
            return `<th class="${sortClass}" data-column="${h}" role="columnheader" aria-sort="${state.sortColumn === h ? state.sortDirection + 'ending' : 'none'
                }">${formatHeader(h)}</th>`;
        }).join('')}
      </tr>
    `;

        // Add click handlers for sorting
        elements.tableHead.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                handleColumnSort(th.dataset.column);
            });
        });

        // Get page data
        const startIndex = (state.currentPage - 1) * state.rowsPerPage;
        const endIndex = startIndex + state.rowsPerPage;
        const pageData = displayData.slice(startIndex, endIndex);

        // Render rows with row numbers
        elements.tableBody.innerHTML = pageData.map((row, idx) => `
      <tr>
        <td class="row-number">${startIndex + idx + 1}</td>
        ${headers.map(h => `<td title="${escapeHtml(row[h])}">${formatCell(row[h])}</td>`).join('')}
      </tr>
    `).join('');

        // Update pagination
        updatePagination();

        // Update statistics
        updateStatistics();
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
        const searchInput = document.getElementById('tableSearch');
        const searchColumn = document.getElementById('searchColumn');
        const searchClearBtn = document.getElementById('searchClearBtn');
        const searchResults = document.getElementById('searchResults');
        const searchResultsCount = document.getElementById('searchResultsCount');

        if (!searchInput) return;

        state.searchQuery = searchInput.value.toLowerCase().trim();
        const selectedColumn = searchColumn ? searchColumn.value : 'all';
        state.currentPage = 1;

        // Show/hide clear button
        if (searchClearBtn) {
            searchClearBtn.classList.toggle('hidden', !state.searchQuery);
        }

        if (!state.searchQuery) {
            state.filteredData = [];
            if (searchResults) searchResults.classList.add('hidden');
            renderTable();
            return;
        }

        // Filter data by search query and selected column
        state.filteredData = state.generatedData.filter(row => {
            if (selectedColumn === 'all') {
                // Search in all columns
                return Object.values(row).some(value => {
                    if (value === null || value === undefined) return false;
                    return String(value).toLowerCase().includes(state.searchQuery);
                });
            } else {
                // Search in specific column
                const value = row[selectedColumn];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(state.searchQuery);
            }
        });

        // Show search results count
        if (searchResults && searchResultsCount) {
            searchResults.classList.remove('hidden');
            const count = state.filteredData.length;
            const columnLabel = selectedColumn === 'all' ? 'all columns' : selectedColumn.replace(/_/g, ' ');
            searchResultsCount.textContent = `${count} result${count !== 1 ? 's' : ''} in ${columnLabel}`;
        }

        renderTable();
        updateStats();
    }

    /**
     * Clear search input
     */
    function clearSearch() {
        const searchInput = document.getElementById('tableSearch');
        const searchClearBtn = document.getElementById('searchClearBtn');
        const searchResults = document.getElementById('searchResults');

        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        if (searchClearBtn) {
            searchClearBtn.classList.add('hidden');
        }
        if (searchResults) {
            searchResults.classList.add('hidden');
        }

        state.searchQuery = '';
        state.filteredData = [];
        state.currentPage = 1;
        renderTable();
    }

    /**
     * Populate search column dropdown with current schema columns
     */
    function updateSearchColumnDropdown() {
        const searchColumn = document.getElementById('searchColumn');
        if (!searchColumn || state.generatedData.length === 0) return;

        const columns = Object.keys(state.generatedData[0]);

        // Keep "All Columns" option and add column options
        searchColumn.innerHTML = '<option value="all">All Columns</option>';

        columns.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            searchColumn.appendChild(option);
        });
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

    // ============================================
    // VIRTUAL SCROLLING
    // ============================================

    /**
     * Setup virtual scrolling for large datasets
     */
    function setupVirtualScroll() {
        // Add scroll listener with debounce for performance
        let scrollTimeout;
        elements.tableContainer.addEventListener('scroll', function () {
            if (scrollTimeout) {
                cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = requestAnimationFrame(() => {
                state.virtualScroll.scrollTop = elements.tableContainer.scrollTop;
                if (state.generatedData.length > 1000) {
                    renderVirtualRows();
                }
            });
        });
    }

    /**
     * Render only visible rows for virtual scrolling (for very large datasets)
     */
    function renderVirtualRows() {
        const displayData = state.searchQuery ? state.filteredData : state.generatedData;
        if (displayData.length === 0) return;

        const { rowHeight, bufferRows, scrollTop } = state.virtualScroll;
        const containerHeight = elements.tableContainer.clientHeight;
        const visibleCount = Math.ceil(containerHeight / rowHeight) + bufferRows * 2;

        const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferRows);
        const endIndex = Math.min(displayData.length, startIndex + visibleCount);

        const headers = Object.keys(displayData[0]);
        const visibleData = displayData.slice(startIndex, endIndex);

        // Calculate padding for virtual scroll effect
        const paddingTop = startIndex * rowHeight;
        const paddingBottom = (displayData.length - endIndex) * rowHeight;

        // Render with virtual positioning
        elements.tableBody.innerHTML =
            `<tr style="height: ${paddingTop}px;"><td colspan="${headers.length}"></td></tr>` +
            visibleData.map(row => `
            <tr style="height: ${rowHeight}px;">
                ${headers.map(h => `<td title="${escapeHtml(row[h])}">${formatCell(row[h])}</td>`).join('')}
            </tr>
            `).join('') +
            `<tr style="height: ${paddingBottom}px;"><td colspan="${headers.length}"></td></tr>`;
    }

    /**
     * Debounce utility function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }


    // ============================================
    // THEME TOGGLE
    // ============================================

    const THEME_STORAGE_KEY = 'dataforge_theme';

    /**
     * Initialize theme from localStorage or system preference
     */
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    /**
     * Toggle between light and dark theme
     */
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);

        showToast(`Switched to ${newTheme} mode`, 'success');
    }

    /**
     * Setup theme toggle event
     */
    function setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================

    /**
     * Setup keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        const shortcutsModal = document.getElementById('shortcutsModal');
        const shortcutHelpBtn = document.getElementById('shortcutHelpBtn');

        // Toggle shortcuts modal
        function toggleShortcutsModal() {
            shortcutsModal.classList.toggle('active');
        }

        // Help button click
        if (shortcutHelpBtn) {
            shortcutHelpBtn.addEventListener('click', toggleShortcutsModal);
        }

        // Close modal on click outside or Escape
        if (shortcutsModal) {
            shortcutsModal.addEventListener('click', (e) => {
                if (e.target === shortcutsModal) {
                    shortcutsModal.classList.remove('active');
                }
            });
        }

        // Global keyboard listener
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // ? key - toggle shortcuts modal
            if (e.key === '?' && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                toggleShortcutsModal();
                return;
            }

            // Escape - close modal
            if (e.key === 'Escape' && shortcutsModal.classList.contains('active')) {
                shortcutsModal.classList.remove('active');
                return;
            }

            // Ctrl + G - Generate
            if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                handleGenerate();
                return;
            }

            // Ctrl + Shift + C - Export CSV
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                handleExportCSV();
                return;
            }

            // Ctrl + Shift + J - Export JSON
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') {
                e.preventDefault();
                handleExportJSON();
                return;
            }

            // Ctrl + Shift + S - Export SQL
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleExportSQL();
                return;
            }

            // Ctrl + Shift + X - Export XLSX
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') {
                e.preventDefault();
                handleExportXLSX();
                return;
            }

            // Ctrl + Shift + T - Toggle theme
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                toggleTheme();
                return;
            }
        });
    }

    // ============================================
    // GLOBAL ERROR HANDLING
    // ============================================

    /**
     * Setup global error handler
     */
    function setupErrorHandling() {
        window.onerror = function (message, source, lineno, colno, error) {
            console.error('Global error:', { message, source, lineno, colno, error });
            showToast('An unexpected error occurred. Please try again.', 'error');
            return true;
        };

        window.onunhandledrejection = function (event) {
            console.error('Unhandled promise rejection:', event.reason);
            showToast('An unexpected error occurred. Please try again.', 'error');
        };
    }

    // ============================================
    // COLUMN SORTING
    // ============================================

    /**
     * Handle column header click for sorting
     */
    function handleColumnSort(columnName) {
        if (state.sortColumn === columnName) {
            // Toggle direction
            state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            state.sortColumn = columnName;
            state.sortDirection = 'asc';
        }

        sortData();
        renderTable();
    }

    /**
     * Sort the data based on current sort state
     */
    function sortData() {
        if (!state.sortColumn) return;

        const data = state.searchQuery ? state.filteredData : state.generatedData;

        data.sort((a, b) => {
            let valA = a[state.sortColumn];
            let valB = b[state.sortColumn];

            // Handle null/undefined
            if (valA == null) return state.sortDirection === 'asc' ? 1 : -1;
            if (valB == null) return state.sortDirection === 'asc' ? -1 : 1;

            // Numeric comparison
            if (typeof valA === 'number' && typeof valB === 'number') {
                return state.sortDirection === 'asc' ? valA - valB : valB - valA;
            }

            // String comparison
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();

            if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // ============================================
    // COPY TO CLIPBOARD
    // ============================================

    /**
     * Copy text to clipboard
     */
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Copied to clipboard!', 'success');
        }
    }

    /**
     * Copy row data as JSON
     */
    function copyRowAsJson(rowIndex) {
        const data = state.searchQuery ? state.filteredData : state.generatedData;
        const row = data[rowIndex];
        if (row) {
            copyToClipboard(JSON.stringify(row, null, 2));
        }
    }

    /**
     * Copy cell value
     */
    function copyCellValue(value) {
        copyToClipboard(value == null ? '' : String(value));
    }

    // ============================================
    // STATISTICS PANEL
    // ============================================

    /**
     * Calculate and display statistics for numeric columns
     */
    function updateStatistics() {
        const data = state.generatedData;
        const statsGrid = document.getElementById('statsGrid');

        if (!data || data.length === 0 || !statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-item">
                    <div class="stat-item-header">No data</div>
                    <div class="stat-item-value">—</div>
                    <div class="stat-item-column">Generate data to see stats</div>
                </div>
            `;
            return;
        }

        const headers = Object.keys(data[0]);
        const numericColumns = headers.filter(h => {
            const firstNonNull = data.find(row => row[h] != null);
            return firstNonNull && typeof firstNonNull[h] === 'number';
        });

        if (numericColumns.length === 0) {
            statsGrid.innerHTML = `
                <div class="stat-item">
                    <div class="stat-item-header">No numeric columns</div>
                    <div class="stat-item-value">—</div>
                    <div class="stat-item-column">Statistics require numeric data</div>
                </div>
            `;
            return;
        }

        let html = '';

        // Calculate stats for first 4 numeric columns max
        numericColumns.slice(0, 4).forEach(col => {
            const values = data.map(row => row[col]).filter(v => v != null && typeof v === 'number');

            if (values.length === 0) return;

            const min = Math.min(...values);
            const max = Math.max(...values);
            const sum = values.reduce((a, b) => a + b, 0);
            const avg = sum / values.length;

            html += `
                <div class="stat-item">
                    <div class="stat-item-header">Min</div>
                    <div class="stat-item-value">${min.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div class="stat-item-column">${formatHeader(col)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-item-header">Max</div>
                    <div class="stat-item-value">${max.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div class="stat-item-column">${formatHeader(col)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-item-header">Average</div>
                    <div class="stat-item-value">${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div class="stat-item-column">${formatHeader(col)}</div>
                </div>
            `;
        });

        // Add total row count
        html += `
            <div class="stat-item">
                <div class="stat-item-header">Total Rows</div>
                <div class="stat-item-value">${data.length.toLocaleString()}</div>
                <div class="stat-item-column">Dataset size</div>
            </div>
        `;

        statsGrid.innerHTML = html;
    }

    /**
     * Setup statistics panel toggle
     */
    function setupStatsPanel() {
        const toggle = document.getElementById('statsPanelToggle');
        const panel = document.getElementById('statsPanel');

        if (toggle && panel) {
            toggle.addEventListener('click', () => {
                state.statsCollapsed = !state.statsCollapsed;
                panel.classList.toggle('collapsed', state.statsCollapsed);
                toggle.setAttribute('aria-expanded', !state.statsCollapsed);
            });

            // Keyboard support
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle.click();
                }
            });
        }
    }

    // ============================================
    // DATA CACHING
    // ============================================

    /**
     * Save current data to cache
     */
    async function cacheCurrentData() {
        if (state.generatedData.length === 0) return;

        try {
            await DataStorage.saveData(
                state.generatedData,
                state.selectedIndustry,
                state.generatedData.length
            );
            // Refresh history display
            loadHistoryList();
        } catch (err) {
            console.warn('Failed to cache data:', err);
        }
    }

    // ============================================
    // GENERATION HISTORY
    // ============================================

    const industryIcons = {
        healthcare: '🏥',
        finance: '💰',
        retail: '🛒',
        hr: '👥',
        manufacturing: '🏭',
        education: '🎓',
        realestate: '🏠',
        logistics: '📦'
    };

    /**
     * Load and display generation history
     */
    async function loadHistoryList() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        try {
            const entries = await DataStorage.listEntries();

            if (entries.length === 0) {
                historyList.innerHTML = '<div class="history-empty">No history yet. Generate some data!</div>';
                return;
            }

            historyList.innerHTML = entries.map(entry => `
                <div class="history-item" data-id="${entry.id}">
                    <div class="history-item-icon">${industryIcons[entry.industry] || '📊'}</div>
                    <div class="history-item-info">
                        <div class="history-item-title">${industryNames[entry.industry] || entry.industry} — ${entry.rowCount.toLocaleString()} rows</div>
                        <div class="history-item-meta">${DataStorage.formatTimestamp(entry.timestamp)}</div>
                    </div>
                    <div class="history-item-actions">
                        <button class="history-btn reload" data-id="${entry.id}" title="Load this data">↻</button>
                        <button class="history-btn delete" data-id="${entry.id}" title="Delete">×</button>
                    </div>
                </div>
            `).join('');

            // Add event listeners
            historyList.querySelectorAll('.history-btn.reload').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadHistoryEntry(parseInt(btn.dataset.id));
                });
            });

            historyList.querySelectorAll('.history-btn.delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteHistoryEntry(parseInt(btn.dataset.id));
                });
            });

        } catch (err) {
            console.warn('Failed to load history:', err);
            historyList.innerHTML = '<div class="history-empty">Error loading history</div>';
        }
    }

    /**
     * Load a history entry
     */
    async function loadHistoryEntry(id) {
        try {
            const entry = await DataStorage.loadData(id);
            if (entry && entry.data) {
                state.generatedData = entry.data;
                state.filteredData = [];
                state.searchQuery = '';
                state.currentPage = 1;
                state.sortColumn = null;
                state.sortDirection = 'asc';

                // Update industry selection
                if (entry.industry && entry.industry !== state.selectedIndustry) {
                    state.selectedIndustry = entry.industry;
                    document.querySelectorAll('.industry-option').forEach(opt => {
                        opt.classList.toggle('selected', opt.dataset.industry === entry.industry);
                    });
                    updateSchemaPreview();
                }

                // Clear search
                if (elements.tableSearch) {
                    elements.tableSearch.value = '';
                }

                // Update UI
                renderTable();
                updateStats();
                enableExport();

                showToast(`Loaded ${entry.data.length.toLocaleString()} rows from history`, 'success');
            }
        } catch (err) {
            console.error('Failed to load history entry:', err);
            showToast('Failed to load history entry', 'error');
        }
    }

    /**
     * Delete a history entry
     */
    async function deleteHistoryEntry(id) {
        try {
            await DataStorage.deleteEntry(id);
            loadHistoryList();
            showToast('History entry deleted', 'success');
        } catch (err) {
            console.error('Failed to delete history entry:', err);
            showToast('Failed to delete entry', 'error');
        }
    }

    /**
     * Setup history section toggle
     */
    function setupHistorySection() {
        const toggle = document.getElementById('historyToggle');
        const section = document.getElementById('historySection');

        if (toggle && section) {
            toggle.addEventListener('click', () => {
                section.classList.toggle('collapsed');
                toggle.setAttribute('aria-expanded', !section.classList.contains('collapsed'));
            });

            // Keyboard support
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle.click();
                }
            });
        }

        // Load initial history
        loadHistoryList();
    }

    // Initialize theme immediately (before DOM ready)
    initTheme();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            setupThemeToggle();
            setupKeyboardShortcuts();
            setupErrorHandling();
            setupStatsPanel();
            setupHistorySection();
        });
    } else {
        init();
        setupThemeToggle();
        setupKeyboardShortcuts();
        setupErrorHandling();
        setupStatsPanel();
        setupHistorySection();
    }
})();

