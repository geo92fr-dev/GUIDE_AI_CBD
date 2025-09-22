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
        .tile-widget { width:100%; height:100%; display:flex; flex-direction:column; background: var(--surface-primary,var(--background-secondary,#1A2733)); border-radius: var(--radius-md,8px); overflow:hidden; font-family: var(--font-family-base,'Segoe UI', Roboto, sans-serif); position:relative; padding: var(--spacing-md,16px); gap: var(--spacing-md,16px);}        
        .tile-widget:before { content:''; position:absolute; inset:0; background:linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,0)); pointer-events:none; }
        .tile-label { position:absolute; top:8px; left:12px; font-size:11px; letter-spacing:.5px; text-transform:uppercase; font-weight:600; color: var(--text-secondary,#A9B4BE); }
        .kpi-container { display:grid; grid-template-columns:repeat(2,1fr); gap: var(--spacing-md,16px); flex:1; }
        .kpi-item { display:flex; flex-direction:column; justify-content:center; align-items:center; padding:12px; border-radius:8px; background: rgba(255,255,255,0.04); backdrop-filter: blur(4px); box-shadow: 0 2px 4px rgba(0,0,0,.25); transition: background .25s ease, transform .25s ease, box-shadow .25s;
            border:1px solid rgba(255,255,255,0.06); position:relative; overflow:hidden; text-align:center; }
        .kpi-item:after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.08),transparent 70%); opacity:0; transition:opacity .4s; }
        .kpi-item:hover { transform: translateY(-2px); background: rgba(255,255,255,0.07); box-shadow:0 4px 10px rgba(0,0,0,.35); }
        .kpi-item:hover:after { opacity:1; }
        .kpi-item:nth-child(1) { box-shadow: inset 0 0 0 2px rgba(27,144,255,.15);} 
        .kpi-item:nth-child(2) { box-shadow: inset 0 0 0 2px rgba(54,164,29,.15);} 
        .kpi-item:nth-child(3) { box-shadow: inset 0 0 0 2px rgba(255,201,51,.15);} 
        .kpi-item:nth-child(4) { box-shadow: inset 0 0 0 2px rgba(238,57,57,.15);} 
        .kpi-label { font-size:10px; color: var(--text-muted,#5B738B); margin-bottom:6px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
        .kpi-value { font-size:1.6em; font-weight:700; color: var(--text-primary,#EAECEE); margin:0; line-height:1; text-shadow:0 1px 2px rgba(0,0,0,.4);} 
        .kpi-value.success { color: var(--success,#36A41D);} 
        .kpi-value.warning { color: var(--warning,#E76500);} 
        .kpi-value.danger { color: var(--danger,#EE3939);} 
        @media (max-width: 600px){ .kpi-container { grid-template-columns:1fr; gap: var(--spacing-sm,8px);} .kpi-value { font-size:1.3em;} }
    `;

    const title = document.createElement('div');
    title.className = 'tile-label';
    title.textContent = 'KPI Tiles';

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
    container.appendChild(title);
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