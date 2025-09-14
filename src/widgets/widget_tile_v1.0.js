/**
 * 📊 TILE WIDGET - Widget auto-contenu complet
 * 
 * Fichier unique contenant :
 * - Métadonnées WidgetEntity (template de création)
 * - Code de rendu complet (HTML/CSS/JS)
 * - Configuration et logique métier
 */

// ====================================================================
// 📋 WIDGET ENTITY METADATA - Template de création
// ====================================================================

const TILE_WIDGET_DEFINITION = {
    type: 'tile',
    name: 'Tile Widget v1.0',
    title: 'KPI Tile Visualization',
    version: '1.0.0',
    metadata: {
        description: 'KPI tile widget for displaying key performance indicators',
        author: 'Widgets Platform',
        tags: ['kpi', 'tile', 'metrics', 'business'],
        category: 'Metrics',
        icon: '📊',
        preview: '',
        documentation: 'Tile widget for displaying key performance indicators in a grid format'
    },
    metadataSchema: [
        { name: 'label', type: 'string', semantic: 'dimension', description: 'KPI label' },
        { name: 'value', type: 'number', semantic: 'measure', description: 'KPI value' }
    ],
    dataBinding: {
        requirements: {
            dimensions: { min: 1, max: 1, required: true },
            measures: { min: 1, max: 1, required: true },
            filters: { min: 0, max: 5, required: false }
        },
        defaultBinding: {
            dimensions: [],
            measures: [],
            filters: []
        }
    },
    layout: {
        size: { width: 4, height: 3 },
        minSize: { width: 2, height: 2 },
        maxSize: { width: 8, height: 6 },
        responsive: true
    },
    configuration: {
        gridLayout: { type: 'select', options: ['2x2', '1x4', '4x1'], default: '2x2' },
        showIcons: { type: 'boolean', default: true },
        colorScheme: { type: 'select', options: ['business', 'rainbow', 'monochrome'], default: 'business' }
    },
    rendering: {
        engine: 'native-html',
        dependencies: [],
        performance: {
            maxDataPoints: 10,
            updateMode: 'full'
        }
    }
};

/**
 * 📊 KPI Tile Widget Unified v1.0
 * Compatible avec le système unifié de widgets
 */
class TileWidgetUnified extends HTMLElement {
    static get metadataSchema() {
        return TILE_WIDGET_DEFINITION.metadataSchema;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.widgetEntity = null;
        this.chartData = [];
        this.isRendered = false;
        this.config = {
            gridLayout: '2x2',
            showIcons: true,
            colorScheme: 'business'
        };
    }

    initializeWithEntity(widgetEntity) {
        this.widgetEntity = widgetEntity;
        if (widgetEntity.configuration) {
            Object.assign(this.config, widgetEntity.configuration);
        }
        this.loadDataFromEntity();
        this.render();
    }

    updateData(newData) {
        this.chartData = this.processRawData(newData);
        this.render();
    }

    updateConfiguration(newConfig) {
        Object.assign(this.config, newConfig);
        this.render();
    }

    loadDataFromEntity() {
        if (!this.widgetEntity || !this.widgetEntity.dataBinding) {
            this.chartData = this.generateSampleData();
            return;
        }
        const { dimensions, measures } = this.widgetEntity.dataBinding;
        if (!dimensions || !measures || dimensions.length === 0 || measures.length === 0) {
            this.chartData = this.generateSampleData();
            return;
        }
        this.chartData = this.generateSampleData();
    }

    processRawData(rawData) {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) return [];
        return rawData.map((item, idx) => {
            let label = item.label;
            let value = Number(item.value);
            if (typeof value !== 'number' || isNaN(value)) value = 0;
            return {
                label,
                value
            };
        }).filter(d => d.label !== undefined).slice(0, 4); // Max 4 KPIs
    }

    generateSampleData() {
        const kpis = [
            { label: 'Revenue', value: 1250000 },
            { label: 'Profit', value: 250000 },
            { label: 'Customers', value: 850 },
            { label: 'Orders', value: 1542 }
        ];
        return kpis;
    }

    render() {
        const data = this.chartData.length > 0 ? this.chartData : this.generateSampleData();
        const kpiContent = data.map(d => `
            <div class="kpi-item">
                <div class="kpi-label">${d.label || 'N/A'}</div>
                <div class="kpi-value">${this.formatValue(d.value)}</div>
            </div>
        `).join('');

        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <div class="tile-widget">
                <div class="widget-header">
                    <h3 class="widget-title">${this.widgetEntity?.title || 'KPI Tiles'}</h3>
                </div>
                <div class="kpi-container">
                    ${kpiContent}
                </div>
            </div>
        `;
        this.isRendered = true;
    }

    formatValue(value) {
        if (typeof value !== 'number') return 'N/A';
        if (Math.abs(value) >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        }
        if (Math.abs(value) >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value.toFixed(0);
    }

    connectedCallback() {
        window.addEventListener('resize', () => this.render());
    }

    getStyles() {
        return `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }
                .tile-widget {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: var(--background-primary, #ffffff);
                    border-radius: var(--radius-md, 8px);
                    overflow: hidden;
                }
                .widget-header {
                    padding: var(--spacing-md, 16px);
                    background: var(--background-tertiary, #f8f9fa);
                    border-bottom: 1px solid var(--border-light, #eaecee);
                    flex-shrink: 0;
                }
                .widget-title {
                    margin: 0;
                    font-size: 1.1em;
                    font-weight: 600;
                    color: var(--text-primary, #1a2733);
                }
                .kpi-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    grid-template-rows: repeat(2, 1fr);
                    gap: 1rem;
                    padding: 1rem;
                    flex: 1;
                    color: var(--text-primary, #1a2733);
                }
                .kpi-item {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 0.5rem;
                    border: 1px solid var(--border-light, #eaecee);
                    border-radius: var(--radius-md, 8px);
                    background: var(--background-secondary, #f8f9fa);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    text-align: center;
                }
                .kpi-label {
                    font-size: 0.8em;
                    color: var(--text-secondary, #5b738b);
                    margin-bottom: 0.25rem;
                    font-weight: 500;
                }
                .kpi-value {
                    font-size: 1.5em;
                    font-weight: 700;
                    color: var(--primary-blue, #1B90FF);
                    margin-top: 0.25rem;
                    line-height: 1.2;
                }
                @media (max-width: 600px) {
                    .kpi-container {
                        padding: 0.5rem;
                        gap: 0.5rem;
                    }
                    .kpi-value {
                        font-size: 1.2em;
                    }
                }
            </style>
        `;
    }
}

// ====================================================================
// 🔌 REGISTRATION & EXPORT
// ====================================================================

TILE_WIDGET_DEFINITION.class = TileWidgetUnified;

customElements.define('tile-widget-unified', TileWidgetUnified);

if (typeof window !== 'undefined') {
    window.TILE_WIDGET_DEFINITION = TILE_WIDGET_DEFINITION;
    window.TileWidgetUnified = TileWidgetUnified;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TILE_WIDGET_DEFINITION,
        TileWidgetUnified
    };
}

console.log('📊 Tile Widget loaded:', TILE_WIDGET_DEFINITION.name, TILE_WIDGET_DEFINITION.version);