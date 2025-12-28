/**
 * DataForge Storage Module
 * IndexedDB-based caching for generated data
 */

const DataStorage = (function () {
    'use strict';

    const DB_NAME = 'dataforge_cache';
    const DB_VERSION = 1;
    const STORE_NAME = 'generated_data';
    const MAX_ENTRIES = 5;

    let db = null;

    /**
     * Initialize IndexedDB
     */
    async function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    const store = database.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('industry', 'industry', { unique: false });
                }
            };
        });
    }

    /**
     * Save generated data to cache
     */
    async function saveData(data, industry, rowCount) {
        if (!db) await init();

        const entry = {
            data: data,
            industry: industry,
            rowCount: rowCount,
            timestamp: Date.now(),
            label: `${industry} - ${rowCount.toLocaleString()} rows`
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.add(entry);
            request.onsuccess = () => {
                // Clean up old entries if we exceed max
                cleanupOldEntries().then(() => resolve(request.result));
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Load data from cache by ID
     */
    async function loadData(id) {
        if (!db) await init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * List all cached data entries (metadata only)
     */
    async function listEntries() {
        if (!db) await init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('timestamp');

            const entries = [];
            const request = index.openCursor(null, 'prev'); // Newest first

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    entries.push({
                        id: cursor.value.id,
                        label: cursor.value.label,
                        industry: cursor.value.industry,
                        rowCount: cursor.value.rowCount,
                        timestamp: cursor.value.timestamp
                    });
                    cursor.continue();
                } else {
                    resolve(entries);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete a cached entry
     */
    async function deleteEntry(id) {
        if (!db) await init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clean up old entries to maintain MAX_ENTRIES limit
     */
    async function cleanupOldEntries() {
        const entries = await listEntries();

        if (entries.length > MAX_ENTRIES) {
            const toDelete = entries.slice(MAX_ENTRIES);
            for (const entry of toDelete) {
                await deleteEntry(entry.id);
            }
        }
    }

    /**
     * Clear all cached data
     */
    async function clearAll() {
        if (!db) await init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Format timestamp for display
     */
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Public API
    return {
        init,
        saveData,
        loadData,
        listEntries,
        deleteEntry,
        clearAll,
        formatTimestamp
    };
})();

// Initialize on load
if (typeof window !== 'undefined') {
    DataStorage.init().catch(console.error);
}
