/**
 * 📊 TILE WIDGET v1.2 - Widget avec Dataset de Démonstration
 * 
 * Fichier unique contenant :
 * - Métadonnées WidgetEntity (template de création)
 * - Dataset de démonstration intégré
 * - Code de rendu complet (HTML/CSS/JS)
 * - Interface de feeding séparée
 */

console.log('🚀 LOADING: widget_tile_v1.2.js is executing...');

try {
    console.log('📊 DEBUG: About to create TILE_V1_2_WIDGET_DEFINITION');

    // ====================================================================
    // 📊 DATASET DE DÉMONSTRATION - Isolé du code
    // ====================================================================
    
    const TILE_DEMO_DATASET = {
        metadata: {
            name: 'KPI Business Demo Dataset',
            description: 'Dataset de démonstration pour les KPIs business',
            source: 'internal-demo',
            lastUpdated: new Date().toISOString(),
            rowCount: 6
        },
        data: [
            { label: 'Revenue', value: 1250000, trend: '+12%', status: 'positive' },
            { label: 'Customers', value: 8547, trend: '+5%', status: 'positive' },
            { label: 'Orders', value: 2341, trend: '-2%', status: 'negative' },
            { label: 'Conversion', value: 3.2, trend: '+8%', status: 'positive' },
            { label: 'Support Tickets', value: 127, trend: '-15%', status: 'positive' },
            { label: 'Team Members', value: 23, trend: '+2%', status: 'neutral' }
        ]
    };

    // ====================================================================
    // 📋 WIDGET ENTITY METADATA - Template de création
    // ====================================================================

    const TILE_V1_2_WIDGET_DEFINITION = {
        type: 'tile-v1.2',
        name: 'Tile Widget v1.2',
        title: 'KPI Tile with Demo Data',
        version: '1.2.0',
        metadata: {
            description: 'KPI tile widget with integrated demo dataset',
            author: 'Widgets Platform',
            tags: ['kpi', 'tile', 'metrics', 'business', 'demo'],
            category: 'Metrics',
            icon: '📊',
            preview: '',
            documentation: 'Tile widget with demo data for immediate visualization'
        },
        
        // Dataset intégré mais séparé du code
        demoDataset: TILE_DEMO_DATASET,
        
        metadataSchema: [
            { name: 'label', type: 'string', semantic: 'dimension', description: 'KPI label' },
            { name: 'value', type: 'number', semantic: 'measure', description: 'KPI value' },
            { name: 'trend', type: 'string', semantic: 'dimension', description: 'Trend indicator' },
            { name: 'status', type: 'string', semantic: 'dimension', description: 'Status indicator' }
        ],
        dataBinding: {
            requirements: {
                dimensions: { min: 1, max: 2, required: true },
                measures: { min: 1, max: 1, required: true },
                filters: { min: 0, max: 5, required: false }
            },
            defaultBinding: {
                dimensions: ['label'],
                measures: ['value'],
                filters: []
            }
        },
        layout: {
            size: { width: 4, height: 3 },
            resizable: true,
            position: { x: 0, y: 0 }
        },
        config: {
            defaultStyle: 'business',
            allowMultipleInstances: true,
            refreshInterval: 0
        }
    };

    // ====================================================================
    // 🎨 WIDGET CUSTOM ELEMENT - Logique de rendu
    // ====================================================================

    class TileWidgetV12 extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.widgetId = this.getAttribute('widget-id') || 'tile-' + Date.now();
            this.isDemo = true; // Mode démo par défaut
            this.feedingData = null; // Données externes via feeding
            
            console.log('📊 TILE v1.2: Widget instance created:', this.widgetId);
        }

        connectedCallback() {
            console.log('📊 TILE v1.2: Widget connected to DOM');
            this.render();
            this.bindEvents();
        }

        disconnectedCallback() {
            console.log('📊 TILE v1.2: Widget disconnected from DOM');
        }

        // ================================================================
        // 🔄 INTERFACE DE FEEDING - Séparée du dataset démo
        // ================================================================
        
        setFeedingData(data) {
            console.log('📊 TILE v1.2: Receiving feeding data:', data);
            this.feedingData = data;
            this.isDemo = false;
            this.render();
        }
        
        clearFeedingData() {
            console.log('📊 TILE v1.2: Clearing feeding data, reverting to demo');
            this.feedingData = null;
            this.isDemo = true;
            this.render();
        }
        
        getFeedingStatus() {
            return {
                hasData: this.feedingData !== null,
                isDemo: this.isDemo,
                dataSource: this.isDemo ? 'demo-dataset' : 'external-feeding'
            };
        }

        // ================================================================
        // 📊 LOGIQUE DE DONNÉES - Priorise feeding > demo
        // ================================================================
        
        getDisplayData() {
            if (this.feedingData && Array.isArray(this.feedingData)) {
                console.log('📊 TILE v1.2: Using feeding data');
                return this.feedingData;
            }
            
            console.log('📊 TILE v1.2: Using demo dataset');
            return TILE_DEMO_DATASET.data;
        }

        // ================================================================
        // 🎨 RENDU VISUEL
        // ================================================================

        render() {
            const data = this.getDisplayData();
            const dataSource = this.isDemo ? 'Demo Dataset' : 'External Data';
            
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        width: 100%;
                        height: 100%;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: var(--tile-background, #ffffff);
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }

                    .tile-container {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        padding: 16px;
                        box-sizing: border-box;
                    }

                    .tile-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid var(--border-color, #e1e5e9);
                    }

                    .tile-title {
                        font-size: 14px;
                        font-weight: 600;
                        color: var(--text-primary, #2c3e50);
                        margin: 0;
                    }

                    .data-source-indicator {
                        font-size: 10px;
                        padding: 2px 6px;
                        border-radius: 4px;
                        background: ${this.isDemo ? '#e3f2fd' : '#e8f5e8'};
                        color: ${this.isDemo ? '#1976d2' : '#2e7d32'};
                        border: 1px solid ${this.isDemo ? '#bbdefb' : '#c8e6c9'};
                    }

                    .tiles-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 12px;
                        flex: 1;
                    }

                    .kpi-tile {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #dee2e6;
                        border-radius: 6px;
                        padding: 12px;
                        text-align: center;
                        transition: all 0.2s ease;
                        position: relative;
                    }

                    .kpi-tile:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    }

                    .kpi-label {
                        font-size: 11px;
                        color: #6c757d;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 6px;
                        font-weight: 500;
                    }

                    .kpi-value {
                        font-size: 18px;
                        font-weight: 700;
                        color: #2c3e50;
                        margin-bottom: 4px;
                        line-height: 1.2;
                    }

                    .kpi-trend {
                        font-size: 10px;
                        font-weight: 600;
                        padding: 2px 4px;
                        border-radius: 3px;
                        display: inline-block;
                    }

                    .trend-positive {
                        background: #d4edda;
                        color: #155724;
                    }

                    .trend-negative {
                        background: #f8d7da;
                        color: #721c24;
                    }

                    .trend-neutral {
                        background: #e2e3e5;
                        color: #383d41;
                    }

                    .no-data {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        color: #6c757d;
                        font-style: italic;
                    }
                </style>

                <div class="tile-container">
                    <div class="tile-header">
                        <h3 class="tile-title">📊 KPI Dashboard</h3>
                        <span class="data-source-indicator">${dataSource}</span>
                    </div>
                    
                    ${data && data.length > 0 ? `
                        <div class="tiles-grid">
                            ${data.map(item => `
                                <div class="kpi-tile">
                                    <div class="kpi-label">${item.label || 'N/A'}</div>
                                    <div class="kpi-value">${this.formatValue(item.value)}</div>
                                    ${item.trend ? `
                                        <div class="kpi-trend trend-${item.status || 'neutral'}">
                                            ${item.trend}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="no-data">
                            No data available
                        </div>
                    `}
                </div>
            `;
        }

        formatValue(value) {
            if (typeof value !== 'number') return String(value);
            
            if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
            } else if (value % 1 !== 0) {
                return value.toFixed(1);
            }
            return value.toString();
        }

        bindEvents() {
            // Events pour interaction utilisateur si nécessaire
            this.addEventListener('click', (e) => {
                console.log('📊 TILE v1.2: Widget clicked', e.target);
            });
        }

        // ================================================================
        // 📋 PROPRIÉTÉS PUBLIQUES
        // ================================================================

        getWidgetInfo() {
            return {
                id: this.widgetId,
                type: 'tile-v1.2',
                version: '1.2.0',
                title: 'KPI Tile v1.2',
                dataSource: this.isDemo ? 'demo' : 'feeding',
                status: 'active'
            };
        }

        // API de données pour debugging
        getDataSummary() {
            const data = this.getDisplayData();
            return {
                source: this.isDemo ? 'demo-dataset' : 'external-feeding',
                rowCount: data ? data.length : 0,
                hasData: data && data.length > 0,
                sampleData: data ? data.slice(0, 2) : null
            };
        }
    }

    // ====================================================================
    // 🔧 REGISTRATION & EXPORT
    // ====================================================================

    // Enregistrer le custom element
    if (!customElements.get('tile-widget-v1-2')) {
        customElements.define('tile-widget-v1-2', TileWidgetV12);
        console.log('✅ TILE v1.2: Custom element registered');
    }

    // 🔗 ASSOCIER LA CLASSE À LA DÉFINITION
    TILE_V1_2_WIDGET_DEFINITION.class = TileWidgetV12;
    TILE_V1_2_WIDGET_DEFINITION.elementTag = 'tile-widget-v1-2';

    // Export vers window pour découverte globale
    console.log('📊 DEBUG: Exporting TILE_V1_2_WIDGET_DEFINITION to window');
    window.TILE_V1_2_WIDGET_DEFINITION = TILE_V1_2_WIDGET_DEFINITION;
    
    console.log('✅ TILE v1.2: Definition exported to window:', TILE_V1_2_WIDGET_DEFINITION.type);
    console.log('📊 DEBUG: Window keys containing WIDGET_DEFINITION:', 
        Object.keys(window).filter(key => key.includes('WIDGET_DEFINITION')));
    
    console.log('📊 Tile Widget v1.2 loaded: ' + TILE_V1_2_WIDGET_DEFINITION.name + ' ' + TILE_V1_2_WIDGET_DEFINITION.version);

} catch (error) {
    console.error('❌ TILE v1.2: Failed to load widget:', error);
}