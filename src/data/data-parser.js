/**
 * 📊 CSV Data Parser with Auto-Detection DIMENSIONS/MEASURES
 * 
 * According to WIDGET_TECH_SPEC.md specifications:
 * - Auto-detect field types (string, number, date, boolean)
 * - Classify as DIMENSION (categorical) or MEASURE (numeric/aggregatable)
 * - Generate metadata (cardinality, sample values, statistics)
 * - Support WebI-compatible data model
 */

class DataParser {
    constructor() {
        this.dataSource = null;
        this.fields = [];
        this.rawData = [];
        this.processedData = [];
        
        // Classification thresholds
        this.DIMENSION_CARDINALITY_THRESHOLD = 50; // If unique values > 50% of total, likely DIMENSION
        this.MEASURE_NUMERIC_THRESHOLD = 0.8; // If 80%+ numeric values, likely MEASURE
    }

    /**
     * Parse CSV content and classify fields
     * @param {string} csvContent - Raw CSV content
     * @param {string} fileName - Source file name
     * @returns {Promise<Object>} Parsed data with field classifications
     */
    async parseCSV(csvContent, fileName = 'unknown.csv') {
        try {
            console.log('📊 Parsing CSV:', fileName);
            
            // Parse CSV to array of objects
            this.rawData = this.csvToArray(csvContent);
            
            if (this.rawData.length === 0) {
                throw new Error('No data found in CSV file');
            }
            
            // Analyze field types and classify
            this.fields = this.analyzeFields(this.rawData);
            
            // Generate processed data with type conversion
            this.processedData = this.convertDataTypes(this.rawData, this.fields);
            
            // Create data source metadata
            this.dataSource = {
                id: `ds_${Date.now()}`,
                name: fileName.replace('.csv', ''),
                type: 'CSV',
                fileName: fileName,
                recordCount: this.rawData.length,
                fieldCount: this.fields.length,
                lastModified: new Date().toISOString(),
                fields: this.fields,
                sampleData: this.rawData.slice(0, 5) // First 5 rows for preview
            };
            
            console.log('✅ CSV parsing completed:', {
                records: this.rawData.length,
                fields: this.fields.length,
                dimensions: this.fields.filter(f => f.category === 'DIMENSION').length,
                measures: this.fields.filter(f => f.category === 'MEASURE').length
            });
            
            return {
                dataSource: this.dataSource,
                fields: this.fields,
                data: this.processedData
            };
            
        } catch (error) {
            console.error('🚨 CSV parsing error:', error);
            throw error;
        }
    }

    /**
     * Convert CSV string to array of objects
     * @param {string} csvContent - Raw CSV content
     * @returns {Array<Object>} Array of row objects
     */
    csvToArray(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) return [];
        
        // Parse header
        const headers = this.parseCSVLine(lines[0]);
        const data = [];
        
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index].trim();
                });
                data.push(row);
            }
        }
        
        return data;
    }

    /**
     * Parse a single CSV line handling quoted values
     * @param {string} line - CSV line
     * @returns {Array<string>} Array of field values
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && !inQuotes) {
                inQuotes = true;
            } else if (char === '"' && inQuotes) {
                inQuotes = false;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    /**
     * Analyze fields and classify as DIMENSION or MEASURE
     * @param {Array<Object>} data - Raw data array
     * @returns {Array<Object>} Field metadata with classifications
     */
    analyzeFields(data) {
        if (!data || data.length === 0) return [];
        
        const fieldNames = Object.keys(data[0]);
        const fields = [];
        
        fieldNames.forEach(fieldName => {
            const fieldAnalysis = this.analyzeField(fieldName, data);
            fields.push(fieldAnalysis);
        });
        
        return fields;
    }

    /**
     * Analyze individual field characteristics
     * @param {string} fieldName - Field name
     * @param {Array<Object>} data - Data array
     * @returns {Object} Field metadata
     */
    analyzeField(fieldName, data) {
        const values = data.map(row => row[fieldName]).filter(v => v !== null && v !== undefined && v !== '');
        const totalCount = data.length;
        const validCount = values.length;
        const uniqueValues = [...new Set(values)];
        const cardinality = uniqueValues.length;
        const cardinalityRatio = cardinality / validCount;
        
        // Data type detection
        const typeAnalysis = this.detectDataType(values);
        
        // DIMENSION vs MEASURE classification
        const category = this.classifyField(typeAnalysis, cardinalityRatio, cardinality);
        
        // Generate statistics
        const statistics = this.generateStatistics(values, typeAnalysis.detectedType);
        
        return {
            id: this.generateFieldId(fieldName),
            name: fieldName,
            displayName: this.formatDisplayName(fieldName),
            category: category, // 'DIMENSION' or 'MEASURE'
            dataType: typeAnalysis.detectedType,
            isNullable: validCount < totalCount,
            cardinality: cardinality,
            cardinalityRatio: cardinalityRatio,
            sampleValues: uniqueValues.slice(0, 10),
            statistics: statistics,
            confidence: typeAnalysis.confidence,
            source: 'CSV',
            description: this.generateFieldDescription(fieldName, category, typeAnalysis.detectedType)
        };
    }

    /**
     * Detect data type of field values
     * @param {Array} values - Field values
     * @returns {Object} Type analysis result
     */
    detectDataType(values) {
        if (values.length === 0) {
            return { detectedType: 'STRING', confidence: 0 };
        }
        
        let numericCount = 0;
        let dateCount = 0;
        let booleanCount = 0;
        const totalCount = values.length;
        
        values.forEach(value => {
            const strValue = String(value).toLowerCase();
            
            // Check if numeric
            if (this.isNumeric(value)) {
                numericCount++;
            }
            
            // Check if date
            if (this.isDate(value)) {
                dateCount++;
            }
            
            // Check if boolean
            if (['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'].includes(strValue)) {
                booleanCount++;
            }
        });
        
        const numericRatio = numericCount / totalCount;
        const dateRatio = dateCount / totalCount;
        const booleanRatio = booleanCount / totalCount;
        
        // Determine type based on highest ratio
        if (numericRatio >= this.MEASURE_NUMERIC_THRESHOLD) {
            return { detectedType: 'NUMBER', confidence: numericRatio };
        } else if (dateRatio >= 0.7) {
            return { detectedType: 'DATE', confidence: dateRatio };
        } else if (booleanRatio >= 0.7) {
            return { detectedType: 'BOOLEAN', confidence: booleanRatio };
        } else {
            return { detectedType: 'STRING', confidence: 1 - Math.max(numericRatio, dateRatio, booleanRatio) };
        }
    }

    /**
     * Classify field as DIMENSION or MEASURE
     * @param {Object} typeAnalysis - Type analysis result
     * @param {number} cardinalityRatio - Cardinality ratio
     * @param {number} cardinality - Unique value count
     * @returns {string} 'DIMENSION' or 'MEASURE'
     */
    classifyField(typeAnalysis, cardinalityRatio, cardinality) {
        const { detectedType, confidence } = typeAnalysis;
        
        // Business Intelligence classification rules
        
        // 1. Numeric fields with high confidence are typically MEASURES
        if (detectedType === 'NUMBER' && confidence >= this.MEASURE_NUMERIC_THRESHOLD) {
            // Exception: If cardinality is very low, might be a categorical dimension
            if (cardinality <= 10 && cardinalityRatio >= 0.8) {
                return 'DIMENSION'; // e.g., Rating (1-5), Priority (1-3)
            }
            return 'MEASURE';
        }
        
        // 2. Date fields are typically DIMENSIONS (for time-based grouping)
        if (detectedType === 'DATE') {
            return 'DIMENSION';
        }
        
        // 3. Boolean fields are typically DIMENSIONS
        if (detectedType === 'BOOLEAN') {
            return 'DIMENSION';
        }
        
        // 4. String fields are typically DIMENSIONS
        if (detectedType === 'STRING') {
            return 'DIMENSION';
        }
        
        // 5. Fields with very low cardinality are likely DIMENSIONS
        if (cardinality <= 20) {
            return 'DIMENSION';
        }
        
        // 6. Fields with high cardinality ratio are likely DIMENSIONS
        if (cardinalityRatio >= 0.5) {
            return 'DIMENSION';
        }
        
        // Default: If unsure, classify as DIMENSION (safer for BI)
        return 'DIMENSION';
    }

    /**
     * Generate field statistics
     * @param {Array} values - Field values
     * @param {string} dataType - Detected data type
     * @returns {Object} Field statistics
     */
    generateStatistics(values, dataType) {
        const stats = {
            count: values.length,
            nullCount: 0,
            uniqueCount: new Set(values).size
        };
        
        if (dataType === 'NUMBER') {
            const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
            if (numericValues.length > 0) {
                stats.min = Math.min(...numericValues);
                stats.max = Math.max(...numericValues);
                stats.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
                stats.sum = numericValues.reduce((a, b) => a + b, 0);
                
                // Calculate median
                const sorted = numericValues.sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                stats.median = sorted.length % 2 === 0 
                    ? (sorted[mid - 1] + sorted[mid]) / 2 
                    : sorted[mid];
            }
        }
        
        if (dataType === 'STRING') {
            const lengths = values.map(v => String(v).length);
            stats.minLength = Math.min(...lengths);
            stats.maxLength = Math.max(...lengths);
            stats.avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        }
        
        return stats;
    }

    /**
     * Convert data types based on field analysis
     * @param {Array<Object>} data - Raw data
     * @param {Array<Object>} fields - Field metadata
     * @returns {Array<Object>} Processed data with converted types
     */
    convertDataTypes(data, fields) {
        return data.map(row => {
            const convertedRow = {};
            
            fields.forEach(field => {
                const value = row[field.name];
                convertedRow[field.name] = this.convertValue(value, field.dataType);
            });
            
            return convertedRow;
        });
    }

    /**
     * Convert individual value to target type
     * @param {any} value - Original value
     * @param {string} targetType - Target data type
     * @returns {any} Converted value
     */
    convertValue(value, targetType) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        
        switch (targetType) {
            case 'NUMBER':
                const num = parseFloat(value);
                return isNaN(num) ? null : num;
                
            case 'DATE':
                const date = new Date(value);
                return isNaN(date.getTime()) ? null : date;
                
            case 'BOOLEAN':
                const strValue = String(value).toLowerCase();
                if (['true', '1', 'yes', 'y'].includes(strValue)) return true;
                if (['false', '0', 'no', 'n'].includes(strValue)) return false;
                return null;
                
            default:
                return String(value);
        }
    }

    // Utility Methods
    
    isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    isDate(value) {
        const date = new Date(value);
        return !isNaN(date.getTime()) && String(value).length > 4;
    }

    generateFieldId(fieldName) {
        return `field_${fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }

    formatDisplayName(fieldName) {
        return fieldName
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    generateFieldDescription(fieldName, category, dataType) {
        const categoryDesc = category === 'DIMENSION' ? 'Categorical field for grouping and filtering' : 'Numeric field for calculations and aggregations';
        return `${categoryDesc} (${dataType})`;
    }

    // Public API Methods
    
    getDataSource() {
        return this.dataSource;
    }

    getFields() {
        return this.fields;
    }

    getFieldsByCategory(category) {
        return this.fields.filter(field => field.category === category);
    }

    getData() {
        return this.processedData;
    }

    getDimensions() {
        return this.getFieldsByCategory('DIMENSION');
    }

    getMeasures() {
        return this.getFieldsByCategory('MEASURE');
    }
}

// Export for use in other modules
window.DataParser = DataParser;