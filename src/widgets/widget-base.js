/**
 * 🧱 Widget Base - Foundation Class
 * 
 * Base class for all widgets according to WIDGET_TECH_SPEC.md:
 * - Common widget interface and lifecycle
 * - Data binding and rendering patterns
 * - Event handling and state management
 */

class WidgetBase extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Widget configuration
        this.config = {
            id: null,
            type: 'base',
            title: 'Base Widget',
            dimensions: [],
            measures: [],
            filters: [],
            options: {}
        };
        
        // Widget state
        this.state = {
            loading: false,
            error: null,
            data: null,
            rendered: false
        };
        
        // Data model reference
        this.dataModel = window.dataModel;
        
        // Bind methods
        this.handleDataUpdate = this.handleDataUpdate.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    // Lifecycle methods
    connectedCallback() {
        this.initialize();
    }

    disconnectedCallback() {
        this.cleanup();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.handleAttributeChange(name, oldValue, newValue);
        }
    }

    static get observedAttributes() {
        return ['config', 'data', 'loading', 'error'];
    }

    // Initialization
    async initialize() {
        try {
            console.log(`🧱 Initializing ${this.config.type} widget:`, this.config.id);
            
            this.setupEventListeners();
            this.render();
            
            if (this.config.dimensions.length > 0 || this.config.measures.length > 0) {
                await this.loadData();
            }
            
            this.state.rendered = true;
            this.dispatchEvent(new CustomEvent('widgetInitialized', {
                detail: { widget: this, config: this.config },
                bubbles: true
            }));
            
        } catch (error) {
            this.handleError('Initialization failed', error);
        }
    }

    setupEventListeners() {
        // Data model events
        if (this.dataModel) {
            this.dataModel.on('dataSourceChanged', this.handleDataUpdate);
            this.dataModel.on('fieldsUpdated', this.handleDataUpdate);
        }
        
        // Resize observer for responsive rendering
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(this.handleResize);
            this.resizeObserver.observe(this);
        }
        
        // Window resize fallback
        window.addEventListener('resize', this.handleResize);
    }

    cleanup() {
        // Remove event listeners
        if (this.dataModel) {
            this.dataModel.off('dataSourceChanged', this.handleDataUpdate);
            this.dataModel.off('fieldsUpdated', this.handleDataUpdate);
        }
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        console.log(`🧱 Cleaned up ${this.config.type} widget:`, this.config.id);
    }

    // Configuration
    setConfig(config) {
        this.config = { ...this.config, ...config };
        
        if (this.state.rendered) {
            this.refresh();
        }
        
        console.log(`🧱 Config updated for ${this.config.type} widget:`, this.config.id);
    }

    getConfig() {
        return { ...this.config };
    }

    // Data handling
    async loadData() {
        if (!this.dataModel || (!this.config.dimensions.length && !this.config.measures.length)) {
            return;
        }

        try {
            this.setState({ loading: true, error: null });
            
            // Get data from data model
            const rawData = this.dataModel.getData();
            if (!rawData || rawData.length === 0) {
                throw new Error('No data available');
            }
            
            // Process data for this widget
            const processedData = await this.processData(rawData);
            
            this.setState({ 
                data: processedData, 
                loading: false 
            });
            
            // Trigger re-render with new data
            this.renderWidget();
            
        } catch (error) {
            this.handleError('Data loading failed', error);
        }
    }

    async processData(rawData) {
        // Default data processing - to be overridden by specific widgets
        console.log(`🧱 Processing data for ${this.config.type} widget`);
        
        const dimensions = this.config.dimensions.map(d => d.name);
        const measures = this.config.measures.map(m => m.name);
        
        // Basic aggregation for measures
        const grouped = this.groupBy(rawData, dimensions);
        const aggregated = this.aggregateData(grouped, measures);
        
        return aggregated;
    }

    groupBy(data, dimensions) {
        if (dimensions.length === 0) return { 'All': data };
        
        const groups = {};
        
        data.forEach(row => {
            const key = dimensions.map(dim => row[dim] || 'Unknown').join(' | ');
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(row);
        });
        
        return groups;
    }

    aggregateData(grouped, measures) {
        const result = [];
        
        Object.entries(grouped).forEach(([key, rows]) => {
            const aggregated = { group: key };
            
            measures.forEach(measure => {
                const values = rows.map(row => parseFloat(row[measure]) || 0);
                aggregated[measure] = {
                    sum: values.reduce((a, b) => a + b, 0),
                    avg: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    count: values.length
                };
            });
            
            result.push(aggregated);
        });
        
        return result;
    }

    // State management
    setState(newState) {
        this.state = { ...this.state, ...newState };
        
        this.dispatchEvent(new CustomEvent('stateChanged', {
            detail: { state: this.state, config: this.config },
            bubbles: true
        }));
    }

    getState() {
        return { ...this.state };
    }

    // Event handlers
    handleDataUpdate() {
        console.log(`🧱 Data update triggered for ${this.config.type} widget`);
        this.loadData();
    }

    handleResize() {
        if (this.state.rendered) {
            // Debounced resize handling
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.renderWidget();
            }, 150);
        }
    }

    handleAttributeChange(name, oldValue, newValue) {
        switch (name) {
            case 'config':
                try {
                    const config = JSON.parse(newValue);
                    this.setConfig(config);
                } catch (error) {
                    console.warn('Invalid config JSON:', error);
                }
                break;
            case 'loading':
                this.setState({ loading: newValue === 'true' });
                break;
            case 'error':
                this.setState({ error: newValue });
                break;
        }
    }

    handleError(message, error) {
        const errorMessage = error?.message || error || message;
        
        this.setState({ 
            loading: false, 
            error: errorMessage 
        });
        
        console.error(`🧱 Widget error (${this.config.type}):`, errorMessage, error);
        
        this.dispatchEvent(new CustomEvent('widgetError', {
            detail: { message: errorMessage, error, widget: this },
            bubbles: true
        }));
        
        this.renderError();
    }

    // Rendering methods
    render() {
        const style = this.getBaseStyles();
        const template = `
            ${style}
            <div class="widget-container">
                ${this.renderHeader()}
                ${this.renderContent()}
            </div>
        `;
        
        this.shadowRoot.innerHTML = template;
        this.bindEvents();
    }

    getBaseStyles() {
        return `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }
                
                .widget-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: white;
                    border-radius: var(--radius-md, 8px);
                    overflow: hidden;
                }
                
                .widget-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    background: var(--business-grey-ultra-light, #f5f6f7);
                    border-bottom: 1px solid var(--border-light, #eaecee);
                    min-height: 40px;
                }
                
                .widget-title {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs, 4px);
                    font-weight: 500;
                    color: var(--text-primary, #1a2733);
                    font-size: 0.9em;
                }
                
                .widget-content {
                    flex: 1;
                    padding: var(--spacing-md, 16px);
                    overflow: hidden;
                    position: relative;
                }
                
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--text-secondary, #5b738b);
                    animation: pulse 2s infinite;
                }
                
                .loading-icon {
                    font-size: 2em;
                    margin-bottom: var(--spacing-sm, 8px);
                }
                
                .error-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--business-red, #e74c3c);
                    text-align: center;
                    padding: var(--spacing-md, 16px);
                }
                
                .error-icon {
                    font-size: 2em;
                    margin-bottom: var(--spacing-sm, 8px);
                }
                
                .error-message {
                    font-size: 0.9em;
                    line-height: 1.4;
                }
                
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--text-secondary, #5b738b);
                    text-align: center;
                }
                
                .empty-icon {
                    font-size: 2em;
                    margin-bottom: var(--spacing-sm, 8px);
                    opacity: 0.5;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            </style>
        `;
    }

    renderHeader() {
        return `
            <div class="widget-header">
                <div class="widget-title">
                    <span>${this.getWidgetIcon()}</span>
                    <span>${this.config.title}</span>
                </div>
            </div>
        `;
    }

    renderContent() {
        if (this.state.loading) {
            return this.renderLoading();
        }
        
        if (this.state.error) {
            return this.renderError();
        }
        
        if (!this.state.data) {
            return this.renderEmpty();
        }
        
        return `
            <div class="widget-content">
                ${this.renderWidget()}
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="widget-content">
                <div class="loading-state">
                    <div class="loading-icon">⏳</div>
                    <div>Loading data...</div>
                </div>
            </div>
        `;
    }

    renderError() {
        return `
            <div class="widget-content">
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">${this.state.error}</div>
                </div>
            </div>
        `;
    }

    renderEmpty() {
        return `
            <div class="widget-content">
                <div class="empty-state">
                    <div class="empty-icon">${this.getWidgetIcon()}</div>
                    <div>No data configured</div>
                </div>
            </div>
        `;
    }

    renderWidget() {
        // To be overridden by specific widget implementations
        return `
            <div class="empty-state">
                <div class="empty-icon">${this.getWidgetIcon()}</div>
                <div>${this.config.type} Widget</div>
                <div style="font-size: 0.8em; margin-top: 8px;">
                    Override renderWidget() method
                </div>
            </div>
        `;
    }

    getWidgetIcon() {
        const icons = {
            'base': '🧱',
            'bar-chart': '📊',
            'line-chart': '📈',
            'pie-chart': '🥧',
            'table': '📋'
        };
        return icons[this.config.type] || '📊';
    }

    bindEvents() {
        // To be overridden by specific widget implementations
    }

    // Public API
    refresh() {
        this.loadData();
    }

    resize() {
        this.handleResize();
    }

    export() {
        return {
            config: this.getConfig(),
            state: this.getState(),
            data: this.state.data
        };
    }

    // Utility methods
    formatNumber(value, decimals = 2) {
        if (typeof value !== 'number') return value;
        return value.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    formatCurrency(value, currency = 'USD') {
        if (typeof value !== 'number') return value;
        return value.toLocaleString(undefined, {
            style: 'currency',
            currency: currency
        });
    }

    formatPercentage(value, decimals = 1) {
        if (typeof value !== 'number') return value;
        return (value * 100).toFixed(decimals) + '%';
    }

    getUniqueId() {
        return 'widget_' + Math.random().toString(36).substr(2, 9);
    }
}

// Register the custom element
customElements.define('widget-base', WidgetBase);

// Export for modules
window.WidgetBase = WidgetBase;