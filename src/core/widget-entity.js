/**
 * WidgetEntity - Core entity model for robust widget management
 * 
 * Represents a complete widget with all metadata, configuration,
 * data binding, layout, and rendering information needed for
 * autonomy, persistence, and portability.
 */

/**
 * Main WidgetEntity class
 * Encapsulates all widget information in a serializable structure
 */
class WidgetEntity {
    constructor(config = {}) {
        // === IDENTITÉ ===
        this.id = config.id || this.generateUniqueId();
        this.type = config.type || 'unknown';
        this.name = config.name || `${this.type} Widget`;
        this.title = config.title || this.name;
        this.version = config.version || '1.0.0';
        
        // === MÉTADONNÉES ===
        this.metadata = {
            created: config.metadata?.created || new Date().toISOString(),
            updated: config.metadata?.updated || new Date().toISOString(),
            author: config.metadata?.author || null,
            description: config.metadata?.description || null,
            tags: config.metadata?.tags || []
        };
        
        // === CONFIGURATION FEEDING ===
        this.dataBinding = {
            dimensions: config.dataBinding?.dimensions || [],
            measures: config.dataBinding?.measures || [],
            filters: config.dataBinding?.filters || [],
            dataSource: config.dataBinding?.dataSource || null,
            lastApplied: config.dataBinding?.lastApplied || null
        };
        
        // === LAYOUT & STYLE ===
        this.layout = {
            position: config.layout?.position || { x: 0, y: 0 },
            size: config.layout?.size || { width: 4, height: 3 },
            zIndex: config.layout?.zIndex || 1,
            responsive: config.layout?.responsive || null
        };
        
        // === RENDU & CODE ===
        this.rendering = {
            sourceCode: config.rendering?.sourceCode || this.getDefaultSourceCode(),
            renderingEngine: config.rendering?.renderingEngine || 'native',
            template: config.rendering?.template || null,
            customCSS: config.rendering?.customCSS || null,
            interactivity: config.rendering?.interactivity || {}
        };
        
        // === ÉTAT RUNTIME ===
        this.state = {
            isLoading: config.state?.isLoading || false,
            hasError: config.state?.hasError || false,
            errorMessage: config.state?.errorMessage || null,
            isVisible: config.state?.isVisible !== false, // Default true
            isDirty: config.state?.isDirty || false
        };
        
        // === PERFORMANCE ===
        this.performance = {
            lastRenderTime: config.performance?.lastRenderTime || null,
            dataSize: config.performance?.dataSize || null,
            cacheKey: config.performance?.cacheKey || null
        };
    }
    
    /**
     * Generate unique widget ID
     */
    generateUniqueId() {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9);
        return `widget_${timestamp}_${randomStr}`;
    }
    
    /**
     * Get default source code template based on widget type
     */
    getDefaultSourceCode() {
        const templates = {
            'bar-chart': `
                <div class="widget-container bar-chart-widget" data-widget-id="{{id}}">
                    <div class="widget-header">
                        <h3 class="widget-title">{{title}}</h3>
                    </div>
                    <div class="widget-content">
                        <div class="chart-placeholder">
                            <div class="chart-icon">📊</div>
                            <div class="chart-message">Bar Chart</div>
                        </div>
                    </div>
                </div>
            `,
            'pie-chart': `
                <div class="widget-container pie-chart-widget" data-widget-id="{{id}}">
                    <div class="widget-header">
                        <h3 class="widget-title">{{title}}</h3>
                    </div>
                    <div class="widget-content">
                        <div class="chart-placeholder">
                            <div class="chart-icon">🥧</div>
                            <div class="chart-message">Pie Chart</div>
                        </div>
                    </div>
                </div>
            `,
            'table': `
                <div class="widget-container table-widget" data-widget-id="{{id}}">
                    <div class="widget-header">
                        <h3 class="widget-title">{{title}}</h3>
                    </div>
                    <div class="widget-content">
                        <div class="table-placeholder">
                            <div class="table-icon">📋</div>
                            <div class="table-message">Data Table</div>
                        </div>
                    </div>
                </div>
            `
        };
        
        return templates[this.type] || templates['bar-chart'];
    }
    
    /**
     * Update widget metadata timestamp
     */
    touch() {
        this.metadata.updated = new Date().toISOString();
        this.state.isDirty = true;
        return this;
    }
    
    /**
     * Add field binding to dimensions
     */
    addDimension(fieldBinding) {
        if (!this.isValidFieldBinding(fieldBinding, 'dimension')) {
            throw new Error('Invalid dimension field binding');
        }
        
        this.dataBinding.dimensions.push(fieldBinding);
        return this.touch();
    }
    
    /**
     * Add field binding to measures
     */
    addMeasure(fieldBinding) {
        if (!this.isValidFieldBinding(fieldBinding, 'measure')) {
            throw new Error('Invalid measure field binding');
        }
        
        this.dataBinding.measures.push(fieldBinding);
        return this.touch();
    }
    
    /**
     * Add filter binding
     */
    addFilter(filterBinding) {
        if (!this.isValidFilterBinding(filterBinding)) {
            throw new Error('Invalid filter binding');
        }
        
        this.dataBinding.filters.push(filterBinding);
        return this.touch();
    }
    
    /**
     * Validate field binding structure
     */
    isValidFieldBinding(binding, expectedType) {
        return binding &&
               typeof binding.fieldId === 'string' &&
               typeof binding.fieldName === 'string' &&
               binding.fieldType === expectedType &&
               typeof binding.dataType === 'string';
    }
    
    /**
     * Validate filter binding structure
     */
    isValidFilterBinding(binding) {
        const validOperators = ['equals', 'contains', 'greater', 'less', 'between'];
        return binding &&
               typeof binding.fieldId === 'string' &&
               validOperators.includes(binding.operator) &&
               binding.value !== undefined &&
               typeof binding.isActive === 'boolean';
    }
    
    /**
     * Remove field from dimensions
     */
    removeDimension(fieldId) {
        this.dataBinding.dimensions = this.dataBinding.dimensions.filter(
            d => d.fieldId !== fieldId
        );
        return this.touch();
    }
    
    /**
     * Remove field from measures
     */
    removeMeasure(fieldId) {
        this.dataBinding.measures = this.dataBinding.measures.filter(
            m => m.fieldId !== fieldId
        );
        return this.touch();
    }
    
    /**
     * Remove filter
     */
    removeFilter(fieldId) {
        this.dataBinding.filters = this.dataBinding.filters.filter(
            f => f.fieldId !== fieldId
        );
        return this.touch();
    }
    
    /**
     * Clear all data bindings
     */
    clearDataBinding() {
        this.dataBinding.dimensions = [];
        this.dataBinding.measures = [];
        this.dataBinding.filters = [];
        this.dataBinding.lastApplied = null;
        return this.touch();
    }
    
    /**
     * Apply data binding configuration
     */
    applyDataBinding() {
        this.dataBinding.lastApplied = new Date().toISOString();
        this.state.isLoading = false;
        this.state.hasError = false;
        this.state.errorMessage = null;
        return this.touch();
    }
    
    /**
     * Update widget position
     */
    setPosition(position) {
        this.layout.position = { ...this.layout.position, ...position };
        return this.touch();
    }
    
    /**
     * Update widget size
     */
    setSize(size) {
        this.layout.size = { ...this.layout.size, ...size };
        return this.touch();
    }
    
    /**
     * Update source code and mark as dirty
     */
    setSourceCode(sourceCode) {
        this.rendering.sourceCode = sourceCode;
        return this.touch();
    }
    
    /**
     * Set error state
     */
    setError(errorMessage) {
        this.state.hasError = true;
        this.state.errorMessage = errorMessage;
        this.state.isLoading = false;
        return this.touch();
    }
    
    /**
     * Clear error state
     */
    clearError() {
        this.state.hasError = false;
        this.state.errorMessage = null;
        return this.touch();
    }
    
    /**
     * Set loading state
     */
    setLoading(isLoading = true) {
        this.state.isLoading = isLoading;
        if (isLoading) {
            this.state.hasError = false;
            this.state.errorMessage = null;
        }
        return this.touch();
    }
    
    /**
     * Track rendering performance
     */
    trackRenderTime(renderTime) {
        this.performance.lastRenderTime = renderTime;
        return this.touch();
    }
    
    /**
     * Get rendered source code with variable substitution
     */
    getRenderedSourceCode() {
        let code = this.rendering.sourceCode;
        
        // Replace template variables
        code = code.replace(/\{\{id\}\}/g, this.id);
        code = code.replace(/\{\{title\}\}/g, this.title);
        code = code.replace(/\{\{name\}\}/g, this.name);
        code = code.replace(/\{\{type\}\}/g, this.type);
        
        return code;
    }
    
    /**
     * Serialize entity to JSON
     */
    serialize() {
        return JSON.stringify(this, null, 2);
    }
    
    /**
     * Create entity from serialized JSON
     */
    static deserialize(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            return new WidgetEntity(data);
        } catch (error) {
            throw new Error(`Failed to deserialize WidgetEntity: ${error.message}`);
        }
    }
    
    /**
     * Clone entity
     */
    clone() {
        const cloned = new WidgetEntity(JSON.parse(this.serialize()));
        cloned.id = this.generateUniqueId(); // New unique ID
        cloned.metadata.created = new Date().toISOString();
        return cloned;
    }
    
    /**
     * Validate entity integrity
     */
    validate() {
        const errors = [];
        
        if (!this.id) errors.push('Missing widget ID');
        if (!this.type) errors.push('Missing widget type');
        if (!this.name) errors.push('Missing widget name');
        
        // Validate data bindings
        this.dataBinding.dimensions.forEach((dim, index) => {
            if (!this.isValidFieldBinding(dim, 'dimension')) {
                errors.push(`Invalid dimension at index ${index}`);
            }
        });
        
        this.dataBinding.measures.forEach((measure, index) => {
            if (!this.isValidFieldBinding(measure, 'measure')) {
                errors.push(`Invalid measure at index ${index}`);
            }
        });
        
        this.dataBinding.filters.forEach((filter, index) => {
            if (!this.isValidFilterBinding(filter)) {
                errors.push(`Invalid filter at index ${index}`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Get entity summary for debugging
     */
    getSummary() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            dimensions: this.dataBinding.dimensions.length,
            measures: this.dataBinding.measures.length,
            filters: this.dataBinding.filters.length,
            position: this.layout.position,
            size: this.layout.size,
            isLoading: this.state.isLoading,
            hasError: this.state.hasError,
            isDirty: this.state.isDirty,
            lastUpdated: this.metadata.updated
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WidgetEntity;
} else if (typeof window !== 'undefined') {
    window.WidgetEntity = WidgetEntity;
}