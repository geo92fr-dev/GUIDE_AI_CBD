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

const TILE_V1_0_WIDGET_DEFINITION = {
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

// ====================================================================
// 📊 RENDER FUNCTION - Fonction de rendu conforme à la signature requise
// ====================================================================

const tileRender = (function(args) {
    // Return the fed data as a collection of Objects
    const data = args.json;
    
    const container = document.createElement('div');
    container.className = 'tile-widget';

    const style = document.createElement('style');
    style.textContent = `
        .tile-widget {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease;
            font-family: 'Segoe UI', Roboto, sans-serif;
        }
        .tile-widget:hover {
            transform: translateY(-2px);
        }
        .widget-header {
            padding: 16px;
            background: linear-gradient(90deg, #1B90FF, #4a6bff);
            color: white;
            border-bottom: none;
            flex-shrink: 0;
        }
        .widget-title {
            margin: 0;
            font-size: 1.2em;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .widget-title::before {
            content: "📊";
            font-size: 1.2em;
        }
        .kpi-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            padding: 1rem;
            flex: 1;
        }
        .kpi-item {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 1rem;
            border-radius: 8px;
            background: #EAECEE;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: all 0.2s ease;
            border-left: 4px solid transparent;
            text-align: center;
        }
        .kpi-item:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .kpi-item:nth-child(1) { border-left-color: #1B90FF; }
        .kpi-item:nth-child(2) { border-left-color: #36A41D; }
        .kpi-item:nth-child(3) { border-left-color: #FFC933; }
        .kpi-item:nth-child(4) { border-left-color: #EE3939; }
        .kpi-label {
            font-size: 0.9em;
            color: #5B738B;
            margin-bottom: 0.5rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .kpi-value {
            font-size: 1.8em;
            font-weight: 700;
            color: #1A2733;
            margin: 0;
            line-height: 1;
        }
        .kpi-value.success { color: #36A41D; }
        .kpi-value.warning { color: #FFC933; }
        .kpi-value.danger { color: #EE3939; }
        @media (max-width: 600px) {
            .kpi-container {
                grid-template-columns: 1fr;
                gap: 0.75rem;
            }
            .kpi-value {
                font-size: 1.4em;
            }
        }
    `;

    const header = document.createElement('div');
    header.className = 'widget-header';
    const title = document.createElement('h3');
    title.className = 'widget-title';
    title.textContent = 'KPI Tiles';
    header.appendChild(title);

    const kpiContainer = document.createElement('div');
    kpiContainer.className = 'kpi-container';

    // Données de fallback si pas de données fournies
    const tileData = data && data.length > 0 ? data : [
        { label: 'Revenue', value: 1250000 },
        { label: 'Profit', value: 250000 },
        { label: 'Customers', value: 850 },
        { label: 'Orders', value: 1542 }
    ];

    tileData.slice(0, 4).forEach(d => {
        const item = document.createElement('div');
        item.className = 'kpi-item';

        const label = document.createElement('div');
        label.className = 'kpi-label';
        const icon = getIconForLabel(d.label);
        label.textContent = `${icon} ${d.label || 'N/A'}`;

        const value = document.createElement('div');
        value.className = `kpi-value ${getValueClass(d.value)}`;
        value.textContent = formatValue(d.value);

        item.appendChild(label);
        item.appendChild(value);
        kpiContainer.appendChild(item);
    });

    container.appendChild(style);
    container.appendChild(header);
    container.appendChild(kpiContainer);

    function formatValue(value) {
        if (typeof value !== 'number') return 'N/A';
        if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toFixed(0);
    }

    function getIconForLabel(label) {
        const icons = { 'Revenue': '💰', 'Profit': '📈', 'Customers': '👥', 'Orders': '📦', 'Sales': '💳', 'Growth': '📊', 'Traffic': '🚀', 'Conversion': '🎯' };
        return icons[label] || '📊';
    }

    function getValueClass(value) {
        if (typeof value !== 'number') return '';
        if (value > 0) return 'success';
        if (value < 0) return 'danger';
        return '';
    }

    // return the HTML DOM element to be rendered
    return container;
});

/**
 * 📊 KPI Tile Widget Unified v1.0
 * Compatible avec le système unifié de widgets
 */
class TileWidgetUnified extends HTMLElement {
    static get metadataSchema() {
        return TILE_V1_0_WIDGET_DEFINITION.metadataSchema;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const data = this.getDataService ? this.getDataService().toJSON() : [];

        const renderedElement = tileRender({
            json: data
        });

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(renderedElement);
    }
}

// ====================================================================
// 🔌 REGISTRATION & EXPORT
// ====================================================================

TILE_V1_0_WIDGET_DEFINITION.class = TileWidgetUnified;
TILE_V1_0_WIDGET_DEFINITION.render = tileRender;

// Vérifier si le custom element n'est pas déjà défini
if (!customElements.get('tile-widget-unified')) {
    customElements.define('tile-widget-unified', TileWidgetUnified);
    console.log('✅ TILE v1.0: Custom element registered');
} else {
    console.log('⚠️ TILE v1.0: Custom element already registered, skipping');
}

if (typeof window !== 'undefined') {
    window.TILE_V1_0_WIDGET_DEFINITION = TILE_V1_0_WIDGET_DEFINITION;
    window.TileWidgetUnified = TileWidgetUnified;
    window.tileRender = tileRender;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TILE_V1_0_WIDGET_DEFINITION,
        TileWidgetUnified,
        render: tileRender
    };
}

console.log('📊 Tile Widget v1.0 loaded:', TILE_V1_0_WIDGET_DEFINITION.name, TILE_V1_0_WIDGET_DEFINITION.version);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TILE_V1_0_WIDGET_DEFINITION,
        TileWidgetUnified
    };
}

console.log('📊 Tile Widget loaded:', TILE_V1_0_WIDGET_DEFINITION.name, TILE_V1_0_WIDGET_DEFINITION.version);