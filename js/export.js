/**
 * Export Module
 * Handles CSV and XLSX file generation and download
 */

const Exporter = {
    /**
     * Convert data array to CSV string
     */
    toCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const rows = [];

        // Add header row
        rows.push(headers.map(h => this.escapeCSVField(h)).join(','));

        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return this.escapeCSVField(value);
            });
            rows.push(values.join(','));
        }

        return rows.join('\n');
    },

    /**
     * Escape CSV field to handle special characters
     */
    escapeCSVField(value) {
        if (value === null || value === undefined) {
            return '';
        }

        const stringValue = String(value);

        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
    },

    /**
     * Download CSV file
     */
    downloadCSV(data, filename) {
        const csv = this.toCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        this.downloadBlob(blob, `${filename}.csv`);
    },

    /**
     * Download XLSX file using SheetJS
     */
    downloadXLSX(data, filename) {
        if (typeof XLSX === 'undefined') {
            console.error('SheetJS library not loaded');
            return false;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Create worksheet from data
        const ws = XLSX.utils.json_to_sheet(data);

        // Auto-size columns based on content
        const colWidths = this.calculateColumnWidths(data);
        ws['!cols'] = colWidths;

        // Style the header row
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!ws[cellAddress]) continue;

            ws[cellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: '4F46E5' } },
                alignment: { horizontal: 'center' }
            };
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Data');

        // Generate and download
        XLSX.writeFile(wb, `${filename}.xlsx`);
        return true;
    },

    /**
     * Calculate optimal column widths
     */
    calculateColumnWidths(data) {
        if (!data || data.length === 0) return [];

        const headers = Object.keys(data[0]);
        const widths = [];

        for (const header of headers) {
            let maxWidth = header.length;

            // Check first 100 rows for max width
            const sampleSize = Math.min(100, data.length);
            for (let i = 0; i < sampleSize; i++) {
                const value = String(data[i][header] || '');
                maxWidth = Math.max(maxWidth, value.length);
            }

            // Cap at reasonable width and add padding
            widths.push({ wch: Math.min(maxWidth + 2, 50) });
        }

        return widths;
    },

    /**
     * Helper to download blob as file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Estimate file size in KB
     */
    estimateSize(data) {
        if (!data || data.length === 0) return 0;

        const csv = this.toCSV(data);
        const bytes = new Blob([csv]).size;
        return Math.round(bytes / 1024);
    }
};

window.Exporter = Exporter;
