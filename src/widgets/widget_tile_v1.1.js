/**
 * 📊 TILE WIDGET v1.1 - Widget auto-contenu complet
 * 
 * Fichier unique contenant :
 * - Métadonnées WidgetEntity (template de création)
 * - Code de rendu complet (HTML/CSS/JS)
 * - Configuration et logique métier
 */

console.log('🚀 LOADING: widget_tile_v1.1.js is executing...');

try {
    console.log('📊 DEBUG: About to create TILE_V1_1_WIDGET_DEFINITION');

    // ====================================================================
    // 📋 WIDGET ENTITY METADATA - Template de création
    // ====================================================================

    const TILE_V1_1_WIDGET_DEFINITION = {
    type: 'tile-v1.1',
    name: 'Tile Widget v1.1',
    title: 'KPI Tile Visualization',
    version: '1.1.0',
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
    
    // ====================================================================
    // 🎯 DEMO DATASET - Données de démonstration intégrées
    // ====================================================================
    demoDataset: {
        data: [
            { label: 'Revenue', value: 145000, unit: '€', trend: '+12%', icon: '💰' },
            { label: 'Customers', value: 2847, unit: '', trend: '+8%', icon: '👥' },
            { label: 'Orders', value: 1653, unit: '', trend: '+15%', icon: '📦' },
            { label: 'Conversion', value: 3.2, unit: '%', trend: '+0.5%', icon: '📈' },
            { label: 'Satisfaction', value: 4.7, unit: '/5', trend: '+0.2', icon: '⭐' },
            { label: 'Active Users', value: 892, unit: '', trend: '+22%', icon: '🔥' }
        ],
        metadata: {
            name: 'Business KPI Dataset',
            description: 'Key performance indicators for business dashboard',
            source: 'Demo Data',
            lastUpdated: '2025-09-22',
            fields: [
                { name: 'label', type: 'string', description: 'KPI name' },
                { name: 'value', type: 'number', description: 'KPI value' },
                { name: 'unit', type: 'string', description: 'Unit of measurement' },
                { name: 'trend', type: 'string', description: 'Trend indicator' },
                { name: 'icon', type: 'string', description: 'Display icon' }
            ]
        }
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

const tileV11Render = (function(args) {
    const data = Array.isArray(args?.json) ? args.json : [];

    const container = document.createElement('div');
    container.className = 'tile-widget';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'KPI Tile v1.1');

    const style = document.createElement('style');
    style.textContent = `
        /* =============================
           KPI TILE v1.1 MODERN THEME
           ============================= */
        :host, .tile-widget { box-sizing: border-box; }
        .tile-widget {
            --tw-bg: #ffffff;
            --tw-border: var(--neutral-grey-light, #EAECEE);
            --tw-radius: 12px;
            --tw-shadow: 0 2px 4px rgba(26,39,51,0.06), 0 4px 16px -4px rgba(26,39,51,0.08);
            --tw-accent-1: #1B90FF;
            --tw-accent-2: #36A41D;
            --tw-accent-3: #FFC933;
            --tw-accent-4: #EE3939;
            --tw-text: #1A2733;
            --tw-text-soft: #5B738B;
            --tw-grid-gap: 14px;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: var(--tw-bg);
            border: 1px solid var(--tw-border);
            border-radius: var(--tw-radius);
            position: relative;
            padding: 0;
            overflow: hidden;
            font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,system-ui,sans-serif;
            transition: box-shadow .25s ease, transform .25s ease, border-color .25s ease;
        }
        .tile-widget::before {
            content: "";
            position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(27,144,255,0.08), rgba(120,88,255,0.06));
            pointer-events: none; opacity: .85;
        }
        .tile-widget:hover { box-shadow: 0 4px 10px rgba(26,39,51,0.12); transform: translateY(-2px); }
        .tile-widget:focus-within { outline: 2px solid var(--tw-accent-1); outline-offset: 2px; }
        .widget-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 18px 12px 18px;
            background: linear-gradient(90deg, #1B90FF, #7858FF);
            color: #fff; position: relative; z-index: 1;
        }
        .widget-title { margin: 0; font-size: 0.95rem; font-weight: 600; letter-spacing: .5px; display: flex; align-items: center; gap: 6px; }
        .widget-title .icon { font-size: 1.15rem; }
        .kpi-container { flex: 1; display: grid; width: 100%; padding: 16px 18px 18px; position: relative; z-index: 1; gap: var(--tw-grid-gap); }
        /* Grid auto layout: 1 to 4 items */
        .kpi-container.cols-1 { grid-template-columns: 1fr; }
        .kpi-container.cols-2 { grid-template-columns: repeat(2,1fr); }
        .kpi-container.cols-3 { grid-template-columns: repeat(3,1fr); }
        .kpi-container.cols-4 { grid-template-columns: repeat(2,1fr); }
        @media (min-width: 820px) { .kpi-container.cols-4 { grid-template-columns: repeat(4,1fr); } }
        .kpi-item { background: linear-gradient(155deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55)); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border: 1px solid rgba(168,180,190,0.35); border-radius: 10px; padding: 14px 12px 12px; position: relative; display: flex; flex-direction: column; gap: 6px; justify-content: center; min-height: 86px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4), 0 1px 2px rgba(26,39,51,0.08); transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .kpi-item::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(circle at 70% 30%, rgba(27,144,255,0.12), transparent 70%); opacity: 0; transition: opacity .4s ease; }
        .kpi-item:hover { transform: translateY(-3px); box-shadow: 0 6px 18px -4px rgba(26,39,51,0.25); }
        .kpi-item:hover::before { opacity: 1; }
        .kpi-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 5px; border-radius: 5px 0 0 5px; background: var(--tw-accent-1); opacity: .9; box-shadow: 0 0 0 1px rgba(255,255,255,0.5), 0 0 0 3px rgba(27,144,255,0.15); }
        .kpi-item:nth-child(2) .kpi-accent { background: var(--tw-accent-2); box-shadow: 0 0 0 1px rgba(255,255,255,0.5), 0 0 0 3px rgba(54,164,29,0.15); }
        .kpi-item:nth-child(3) .kpi-accent { background: var(--tw-accent-3); box-shadow: 0 0 0 1px rgba(255,255,255,0.5), 0 0 0 3px rgba(255,201,51,0.25); }
        .kpi-item:nth-child(4) .kpi-accent { background: var(--tw-accent-4); box-shadow: 0 0 0 1px rgba(255,255,255,0.5), 0 0 0 3px rgba(238,57,57,0.2); }
        .kpi-label { font-size: 0.66rem; font-weight: 600; text-transform: uppercase; letter-spacing: .9px; color: var(--tw-text-soft); line-height: 1.1; display: flex; gap: 4px; align-items: center; justify-content: center; }
        .kpi-label .kpi-icon { font-size: 0.95rem; }
        .kpi-value { margin: 0; font-weight: 700; font-size: 1.9rem; letter-spacing: -1px; line-height: 1; color: var(--tw-text); text-shadow: 0 1px 0 rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; gap: 6px; }
        .kpi-value.small { font-size: 1.4rem; }
        .kpi-value.bad { color: #EE3939; }
        .kpi-value.good { color: #36A41D; }
        .kpi-value.warn { color: #E76500; }
        .kpi-meta { font-size: 0.65rem; font-weight: 500; color: var(--tw-text-soft); opacity: .85; }
        .empty-state { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: var(--tw-text-soft); font-size: 0.8rem; padding: 28px 16px; }
        .empty-state .icon { font-size: 2rem; opacity: .6; }
        /* Compact mode when height is small */
        .compact .kpi-item { min-height: 64px; padding: 10px 10px 8px; }
        .compact .kpi-value { font-size: 1.4rem; }
        .compact .kpi-label { font-size: 0.58rem; letter-spacing: .6px; }
        /* Animations */
        .kpi-item { animation: fadeInUp .55s cubic-bezier(.16,.68,.36,1) both; }
        .kpi-item:nth-child(2){ animation-delay: .05s; }
        .kpi-item:nth-child(3){ animation-delay: .1s; }
        .kpi-item:nth-child(4){ animation-delay: .15s; }
        @keyframes fadeInUp { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform: translateY(0);} }
        @media (max-width: 680px){
            .kpi-container.cols-3 { grid-template-columns: repeat(2,1fr); }
            .kpi-value { font-size: 1.55rem; }
        }
        @media (max-width: 480px){
            .kpi-container { grid-template-columns: 1fr !important; }
        }
        @media (prefers-color-scheme: dark){
            .tile-widget { --tw-bg:#1A2733; --tw-border:#475E75; }
            .tile-widget::before { background: linear-gradient(135deg, rgba(27,144,255,0.18), rgba(120,88,255,0.15)); }
            .kpi-item { background: linear-gradient(155deg, rgba(26,39,51,0.85), rgba(26,39,51,0.65)); border: 1px solid rgba(90,115,139,0.45); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05); }
            .kpi-value { text-shadow: none; }
            .kpi-label { color: #A9B4BE; }
        }
    `;

    const header = document.createElement('div');
    header.className = 'widget-header';
    const title = document.createElement('h3');
    title.className = 'widget-title';
    title.innerHTML = `<span class="icon">📊</span><span>KPI Tiles v1.1</span>`;
    header.appendChild(title);

    const kpiContainer = document.createElement('div');
    kpiContainer.className = 'kpi-container';

    // Strict mode: aucune donnée => état vide
    if (!data.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `<div class="icon">📭</div><div>No data bound</div><div class="kpi-meta">Bind 1 dimension + 1 measure</div>`;
        container.appendChild(style);
        container.appendChild(header);
        container.appendChild(empty);
        return container;
    }

    const metrics = data.slice(0, 4); // Hard cap 4 visuels
    const colsClass = `cols-${metrics.length}`;
    kpiContainer.classList.add(colsClass);

    // Helper locale formatter
    const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

    const classifyValue = (v) => {
        if (typeof v !== 'number' || isNaN(v)) return 'na';
        if (v < 0) return 'bad';
        if (v === 0) return 'neutral';
        if (v > 0 && v < 1000) return 'good';
        if (v >= 1000 && v < 1000000) return 'good';
        if (v >= 1000000) return 'warn';
        return 'neutral';
    };

    const abbreviate = (v) => {
        if (typeof v !== 'number' || isNaN(v)) return 'N/A';
        const abs = Math.abs(v);
        if (abs >= 1_000_000_000) return (v/1_000_000_000).toFixed(1)+ 'B';
        if (abs >= 1_000_000) return (v/1_000_000).toFixed(1)+ 'M';
        if (abs >= 1_000) return (v/1_000).toFixed(1)+ 'K';
        return numberFormatter.format(v);
    };

    const iconMap = { Revenue:'💰', Profit:'📈', Customers:'👥', Orders:'📦', Sales:'💳', Growth:'📊', Traffic:'🚀', Conversion:'🎯' };

    metrics.forEach((d, idx) => {
        const item = document.createElement('div');
        item.className = 'kpi-item';
        item.setAttribute('role', 'group');
        const val = d?.value;
        const cls = classifyValue(val);
        const rawLabel = d?.label || `KPI ${idx+1}`;
        item.setAttribute('aria-label', `${rawLabel} ${typeof val==='number'?val:'N/A'}`);

        // Accent bar
        const accent = document.createElement('div');
        accent.className = 'kpi-accent';
        item.appendChild(accent);

        const label = document.createElement('div');
        label.className = 'kpi-label';
        label.innerHTML = `<span class="kpi-icon">${iconMap[rawLabel]||'📊'}</span><span>${rawLabel}</span>`;

        const valueEl = document.createElement('div');
        valueEl.className = `kpi-value ${cls}`;
        valueEl.title = typeof val === 'number' ? numberFormatter.format(val) : 'N/A';
        const abbreviated = abbreviate(val);
        valueEl.textContent = abbreviated;

        // Optional count-up animation for small sets
        if (typeof val === 'number' && metrics.length <=4 && val >=0 && val < 10_000_000) {
            try {
                const duration = 600;
                const startTs = performance.now();
                const startVal = 0;
                const target = val;
                const animate = (ts) => {
                    const p = Math.min(1, (ts - startTs)/duration);
                    const eased = 1 - Math.pow(1-p, 3);
                    const current = startVal + (target - startVal)*eased;
                    valueEl.textContent = abbreviate(current);
                    if (p < 1) requestAnimationFrame(animate); else valueEl.textContent = abbreviate(target);
                };
                requestAnimationFrame(animate);
            } catch {}
        }

        item.appendChild(label);
        item.appendChild(valueEl);
        kpiContainer.appendChild(item);
    });

    // Compact mode detection
    requestAnimationFrame(() => {
        try {
            if (container.getBoundingClientRect().height < 200) {
                container.classList.add('compact');
            }
        } catch {}
    });

    container.appendChild(style);
    container.appendChild(header);
    container.appendChild(kpiContainer);

    // Hook d'extension éventuel
    if (typeof window !== 'undefined' && window.TileWidgetUnified && typeof window.TileWidgetUnified.enhance === 'function') {
        try { window.TileWidgetUnified.enhance(container, { data: metrics }); } catch(e) { console.warn('[TileWidget] enhance hook error', e); }
    }

    return container;
});

/**
 * 📊 KPI Tile Widget Unified v1.1
 * Compatible avec le système unifié de widgets
 */
class TileWidgetUnified extends HTMLElement {
    static get metadataSchema() {
        return TILE_V1_1_WIDGET_DEFINITION.metadataSchema;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.widgetData = null;
        this.entity = null;
    }

    /**
     * Initialize widget with entity data
     */
    initializeWithEntity(entity) {
        this.entity = entity;
        console.log('🎯 TileWidget: Initialized with entity:', entity?.id);
    }

    /**
     * Update widget data and re-render
     */
    updateData(data) {
        console.log('📊 TileWidget: Updating data:', data);
        console.log('📊 TileWidget: Data type:', typeof data, 'Is Array:', Array.isArray(data));
        console.log('📊 TileWidget: Data length:', data?.length);
        if (data?.length > 0) {
            console.log('📊 TileWidget: First data item:', data[0]);
            console.log('📊 TileWidget: Data keys:', Object.keys(data[0]));
        }
        
        this.widgetData = data;
        this.render();
    }

    /**
     * Render the widget
     */
    render() {
        const data = this.widgetData || (this.getDataService ? this.getDataService().toJSON() : []);
        console.log('🎨 TileWidget: Rendering with data:', data);

        const renderedElement = tileV11Render({
            json: data
        });

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(renderedElement);
    }

    connectedCallback() {
        this.render();
    }
}

// ====================================================================
// 🔌 REGISTRATION & EXPORT
// ====================================================================

TILE_V1_1_WIDGET_DEFINITION.class = TileWidgetUnified;
TILE_V1_1_WIDGET_DEFINITION.render = tileV11Render;

// Vérifier si le custom element n'est pas déjà défini
if (!customElements.get('tile-widget-unified-v1-1')) {
    customElements.define('tile-widget-unified-v1-1', TileWidgetUnified);
    console.log('✅ TILE v1.1: Custom element registered');
} else {
    console.log('⚠️ TILE v1.1: Custom element already registered, skipping');
}

if (typeof window !== 'undefined') {
    console.log('📊 DEBUG: Exporting TILE_V1_1_WIDGET_DEFINITION to window');
    window.TILE_V1_1_WIDGET_DEFINITION = TILE_V1_1_WIDGET_DEFINITION;
    window.TileWidgetUnified = TileWidgetUnified;
    window.tileWidgetRender = tileV11Render;
    console.log('✅ TILE v1.1: Definition exported to window:', window.TILE_V1_1_WIDGET_DEFINITION?.type);
    console.log('📊 DEBUG: Window keys containing WIDGET_DEFINITION:', Object.keys(window).filter(k => k.includes('_WIDGET_DEFINITION')));
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TILE_V1_1_WIDGET_DEFINITION,
        TileWidgetUnified,
        render: tileV11Render
    };
}

console.log('📊 Tile Widget v1.1 loaded:', TILE_V1_1_WIDGET_DEFINITION.name, TILE_V1_1_WIDGET_DEFINITION.version);

} catch (error) {
    console.error('❌ ERROR loading widget_tile_v1.1.js:', error);
}