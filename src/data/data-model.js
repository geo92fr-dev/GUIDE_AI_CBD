/**
 * 📊 Data Model Manager
 * 
 * Central data management according to WIDGET_TECH_SPEC.md:
 * - Manage multiple data sources
 * - Provide unified access to DIMENSIONS/MEASURES
 * - Handle data transformations for widgets
 * - WebI-compatible data operations
 */

class DataModel {
    constructor() {
        this.dataSources = new Map();
        this.activeDataSource = null;
        this.fields = [];
        this.data = [];
        
        // Event listeners for data changes
        this.listeners = {
            'dataSourceChanged': [],
            'fieldsUpdated': [],
            'dataLoaded': []
        };
    }

    /**
     * Add a new data source
     * @param {Object} dataSource - Data source metadata
     * @param {Array} fields - Field definitions
     * @param {Array} data - Actual data
     */
    addDataSource(dataSource, fields, data) {
        console.log('📊 Adding data source:', dataSource.name);
        
        this.dataSources.set(dataSource.id, {
            source: dataSource,
            fields: fields,
            data: data
        });
        
        // Set as active if first source
        if (!this.activeDataSource) {
            this.setActiveDataSource(dataSource.id);
        }
        
        this.emit('dataLoaded', { dataSource, fields, data });
    }

    /**
     * Set active data source
     * @param {string|Object} dataSourceIdOrObject - Data source ID or complete data source object
     */
    setActiveDataSource(dataSourceIdOrObject) {
        let dataSourceId, activeSource;
        
        if (typeof dataSourceIdOrObject === 'string') {
            // Traditional ID-based lookup
            dataSourceId = dataSourceIdOrObject;
            if (!this.dataSources.has(dataSourceId)) {
                throw new Error(`Data source ${dataSourceId} not found`);
            }
            activeSource = this.dataSources.get(dataSourceId);
        } else {
            // Direct data source object (new approach for predefined datasets)
            const dataSource = dataSourceIdOrObject;
            dataSourceId = dataSource.name || dataSource.filePath || 'unknown';
            
                // Store enhanced data source with metadata
                activeSource = {
                    source: {
                        id: dataSourceId,
                        name: dataSource.name,
                        recordCount: dataSource.recordCount || 0,
                        size: dataSource.size || 0,
                        filePath: dataSource.filePath,
                        loadedAt: new Date(),
                        metadata: {
                            columns: dataSource.fields ? dataSource.fields.length : 0,
                            dimensions: dataSource.fields ? dataSource.fields.filter(f => f.category === 'DIMENSION').length : 0,
                            measures: dataSource.fields ? dataSource.fields.filter(f => f.category === 'MEASURE').length : 0
                        }
                    },
                    fields: dataSource.fields || [],
                    data: dataSource.data || []
                };            this.dataSources.set(dataSourceId, activeSource);
        }
        
        this.activeDataSource = dataSourceId;
        this.fields = activeSource.fields;
        this.data = activeSource.data;
        
        console.log('✅ Active data source changed to:', activeSource.source.name);
        console.log('📊 Metadata:', activeSource.source.metadata);
        this.emit('dataSourceChanged', activeSource.source);
        this.emit('fieldsUpdated', this.fields);
    }

    /**
     * Get all available fields
     * @returns {Array} All fields
     */
    getFields() {
        return this.fields;
    }

    /**
     * Get fields by category (DIMENSION or MEASURE)
     * @param {string} category - Field category
     * @returns {Array} Filtered fields
     */
    getFieldsByCategory(category) {
        return this.fields.filter(field => field.category === category);
    }

    /**
     * Get DIMENSIONS (for WebI compatibility)
     * @returns {Array} Dimension fields
     */
    getDimensions() {
        return this.getFieldsByCategory('DIMENSION');
    }

    /**
     * Get MEASURES (for WebI compatibility)
     * @returns {Array} Measure fields
     */
    getMeasures() {
        return this.getFieldsByCategory('MEASURE');
    }

    /**
     * Get field by ID or name
     * @param {string} identifier - Field ID or name
     * @returns {Object|null} Field metadata
     */
    getField(identifier) {
        return this.fields.find(field => 
            field.id === identifier || field.name === identifier
        );
    }

    /**
     * Get active data source metadata
     * @returns {Object|null} Active data source info
     */
    getActiveDataSource() {
        if (!this.activeDataSource) return null;
        
        const activeSource = this.dataSources.get(this.activeDataSource);
        return activeSource ? activeSource.source : null;
    }

    /**
     * Get all available data sources
     * @returns {Array} List of all data sources
     */
    getAllDataSources() {
        return Array.from(this.dataSources.values()).map(ds => ds.source);
    }

    /**
     * Get all data
     * @returns {Array} Data array
     */
    getData() {
        return this.data;
    }

    /**
     * Get data filtered by field values
     * @param {Object} filters - Filter conditions
     * @returns {Array} Filtered data
     */
    getFilteredData(filters = {}) {
        if (Object.keys(filters).length === 0) {
            return this.data;
        }
        
        return this.data.filter(row => {
            return Object.entries(filters).every(([fieldName, filterValue]) => {
                const value = row[fieldName];
                
                if (Array.isArray(filterValue)) {
                    return filterValue.includes(value);
                } else {
                    return value === filterValue;
                }
            });
        });
    }

    /**
     * Get unique values for a field (for filter dropdowns)
     * @param {string} fieldName - Field name
     * @returns {Array} Unique values
     */
    getUniqueValues(fieldName) {
        const values = this.data.map(row => row[fieldName])
            .filter(value => value !== null && value !== undefined);
        
        return [...new Set(values)].sort();
    }

    /**
     * Aggregate data by dimensions and measures
     * @param {Array} dimensions - Dimension field names
     * @param {Array} measures - Measure field names with aggregation functions
     * @returns {Array} Aggregated data
     */
    aggregateData(dimensions = [], measures = []) {
        if (dimensions.length === 0 && measures.length === 0) {
            return this.data;
        }
        
        const grouped = new Map();
        
        // Group by dimensions
        this.data.forEach(row => {
            const key = dimensions.map(dim => row[dim]).join('|');
            
            if (!grouped.has(key)) {
                const group = {};
                
                // Add dimension values
                dimensions.forEach(dim => {
                    group[dim] = row[dim];
                });
                
                // Initialize measure arrays
                measures.forEach(measure => {
                    group[`${measure.field}_values`] = [];
                });
                
                grouped.set(key, group);
            }
            
            // Collect measure values
            measures.forEach(measure => {
                const value = row[measure.field];
                if (value !== null && value !== undefined && !isNaN(value)) {
                    grouped.get(key)[`${measure.field}_values`].push(parseFloat(value));
                }
            });
        });
        
        // Calculate aggregations
        const result = [];
        grouped.forEach(group => {
            measures.forEach(measure => {
                const values = group[`${measure.field}_values`];
                delete group[`${measure.field}_values`];
                
                if (values.length > 0) {
                    switch (measure.aggregation || 'SUM') {
                        case 'SUM':
                            group[measure.field] = values.reduce((a, b) => a + b, 0);
                            break;
                        case 'AVG':
                            group[measure.field] = values.reduce((a, b) => a + b, 0) / values.length;
                            break;
                        case 'COUNT':
                            group[measure.field] = values.length;
                            break;
                        case 'MIN':
                            group[measure.field] = Math.min(...values);
                            break;
                        case 'MAX':
                            group[measure.field] = Math.max(...values);
                            break;
                        default:
                            group[measure.field] = values.reduce((a, b) => a + b, 0);
                    }
                } else {
                    group[measure.field] = 0;
                }
            });
            
            result.push(group);
        });
        
        return result;
    }

    /**
     * Get data for widget binding
     * @param {Object} binding - Widget binding configuration
     * @returns {Array} Data prepared for widget
     */
    getDataForBinding(binding) {
        console.log('🔍 DataModel.getDataForBinding called with:', binding);
        
        if (!binding || (!binding.dimensions && !binding.measures)) {
            console.log('⚠️ DataModel: No binding or empty dimensions/measures');
            return [];
        }
        
        const dimensions = binding.dimensions || [];
        const measures = binding.measures || [];
        
        console.log('🔍 DataModel: Extracted dimensions:', dimensions);
        console.log('🔍 DataModel: Extracted measures:', measures);
        
        // Prepare measure configurations with aggregation
        const measureConfigs = measures.map(measure => {
            console.log('🔍 Processing measure:', measure);
            const config = {
                field: typeof measure === 'string' ? measure : (measure.field || measure.fieldId || measure.name),
                aggregation: typeof measure === 'object' ? measure.aggregation : 'SUM'
            };
            console.log('🔍 Measure config:', config);
            return config;
        });
        
        // Also prepare dimension field names properly
        const dimensionFields = dimensions.map(dim => {
            console.log('🔍 Processing dimension:', dim);
            const field = typeof dim === 'string' ? dim : (dim.field || dim.fieldId || dim.name);
            console.log('🔍 Dimension field:', field);
            return field;
        });
        
        console.log('🔍 DataModel: Final dimension fields:', dimensionFields);
        console.log('🔍 DataModel: Final measure configs:', measureConfigs);
        console.log('🔍 DataModel: Available data sample:', this.data.slice(0, 2));
        
        const result = this.aggregateData(dimensionFields, measureConfigs);
        console.log('🔍 DataModel: Aggregation result:', result);
        
        return result;
    }

    /**
     * Get active data source info
     * @returns {Object|null} Active data source
     */
    getActiveDataSource() {
        if (!this.activeDataSource) return null;
        return this.dataSources.get(this.activeDataSource).source;
    }

    /**
     * Get all data sources
     * @returns {Array} List of data sources
     */
    getDataSources() {
        return Array.from(this.dataSources.values()).map(ds => ds.source);
    }

    /**
     * Remove data source
     * @param {string} dataSourceId - Data source ID
     */
    removeDataSource(dataSourceId) {
        if (this.dataSources.has(dataSourceId)) {
            this.dataSources.delete(dataSourceId);
            
            // If removed source was active, switch to another
            if (this.activeDataSource === dataSourceId) {
                const remainingSources = Array.from(this.dataSources.keys());
                if (remainingSources.length > 0) {
                    this.setActiveDataSource(remainingSources[0]);
                } else {
                    this.activeDataSource = null;
                    this.fields = [];
                    this.data = [];
                    this.emit('dataSourceChanged', null);
                    this.emit('fieldsUpdated', []);
                }
            }
        }
    }

    /**
     * Clear all data sources
     */
    clearDataSources() {
        this.dataSources.clear();
        this.activeDataSource = null;
        this.fields = [];
        this.data = [];
        
        this.emit('dataSourceChanged', null);
        this.emit('fieldsUpdated', []);
    }

    // Event System

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    // Utility Methods

    /**
     * Get field statistics
     * @param {string} fieldName - Field name
     * @returns {Object} Field statistics
     */
    getFieldStatistics(fieldName) {
        const field = this.getField(fieldName);
        if (!field) return null;
        
        return field.statistics;
    }

    /**
     * Export data as CSV
     * @param {Array} data - Data to export (optional, uses current data if not provided)
     * @returns {string} CSV content
     */
    exportAsCSV(data = null) {
        const exportData = data || this.data;
        if (exportData.length === 0) return '';
        
        const headers = Object.keys(exportData[0]);
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => 
                headers.map(header => {
                    const value = row[header];
                    // Escape quotes and wrap in quotes if contains comma
                    const stringValue = String(value || '');
                    return stringValue.includes(',') || stringValue.includes('"') 
                        ? `"${stringValue.replace(/"/g, '""')}"` 
                        : stringValue;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }
}

// Global instance
window.dataModel = new DataModel();

// Export for modules
window.DataModel = DataModel;