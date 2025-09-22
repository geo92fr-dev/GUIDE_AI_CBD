
// ====================================================================
// � DATASET DE DÉMONSTRATION - Isolé du code
// ====================================================================

const BAR_CHART_DEMO_DATASET = {
    metadata: {
        name: 'Sales Performance Demo Dataset',
        description: 'Dataset de démonstration pour les ventes par région',
        source: 'internal-demo',
        lastUpdated: new Date().toISOString(),
        rowCount: 6
    },
    data: [
        { label: 'North', value: 45000, category: 'Region' },
        { label: 'South', value: 38000, category: 'Region' },
        { label: 'East', value: 52000, category: 'Region' },
        { label: 'West', value: 41000, category: 'Region' },
        { label: 'Central', value: 47000, category: 'Region' },
        { label: 'International', value: 29000, category: 'Region' }
    ]
};

// ====================================================================
// �📋 BAR CHART WIDGET - Métadonnées
// ====================================================================

const BAR_CHART_WIDGET_DEFINITION = {
    type: 'bar-chart',
    name: 'Bar Chart v1.0',
    title: 'Bar Chart Visualization',
    version: '1.0.0',
    metadata: {
        description: 'Bar chart for categorical data with demo dataset',
        author: 'Widgets Platform',
        tags: ['chart', 'visualization', 'bar', 'business', 'demo'],
        category: 'Charts',
        icon: '📊',
        preview: '',
        documentation: 'Bar chart widget for displaying categorical data with quantitative values'
    },
    
    // Dataset intégré mais séparé du code
    demoDataset: BAR_CHART_DEMO_DATASET,
    metadataSchema: [
        { name: 'label', type: 'string', semantic: 'dimension', description: 'Category label' },
        { name: 'value', type: 'number', semantic: 'measure', description: 'Value for the bar' }
    ],
    dataBinding: {
        requirements: {
            dimensions: { min: 1, max: 2, required: true },
            measures: { min: 1, max: 3, required: true },
            filters: { min: 0, max: 10, required: false }
        },
        defaultBinding: {
            dimensions: [],
            measures: [],
            filters: []
        }
    },
    layout: {
        size: { width: 6, height: 4 },
        minSize: { width: 3, height: 2 },
        maxSize: { width: 12, height: 8 },
        responsive: true
    },
    configuration: {
        orientation: { type: 'select', options: ['vertical', 'horizontal'], default: 'vertical' },
        showValues: { type: 'boolean', default: true },
        showGrid: { type: 'boolean', default: true },
        animation: { type: 'boolean', default: true },
        colorScheme: { type: 'select', options: ['business', 'rainbow', 'monochrome'], default: 'business' }
    },
    rendering: {
        engine: 'native-svg',
        dependencies: [],
        performance: {
            maxDataPoints: 1000,
            updateMode: 'incremental'
        }
    }
};

// ====================================================================
// 📊 RENDER FUNCTION - Fonction de rendu conforme à la signature requise
// ====================================================================

const barChartRender = (function(args) {
    // Return the fed data as a collection of Objects
    const data = args.json;
    const options = args.options || {};
    
    const container = document.createElement('div');
    container.className = 'bar-chart-widget';

    const style = document.createElement('style');
    style.textContent = `
        .bar-chart-widget {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: var(--surface-primary, var(--background-secondary,#1A2733));
            border-radius: var(--radius-md,8px);
            overflow: hidden;
            font-family: var(--font-family-base, 'Segoe UI', Roboto, sans-serif);
            position: relative;
            padding: var(--spacing-md,16px);
        }
        .bar-chart-widget:before {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0));
        }
        .chart-container {
            flex: 1;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .chart-svg {
            width: 100%;
            height: 100%;
            overflow: visible;
        }
        .bar {
            cursor: pointer;
            transition: opacity var(--transition-normal,0.2s) ease, transform var(--transition-normal,0.2s) ease;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));
            rx: 1;
        }
        .bar:hover {
            opacity: .85;
            transform: translateY(-0.5px);
        }
        .category-label {
            font-size: 10px;
            fill: var(--text-muted,#5B738B);
        }
        .value-label {
            font-size: 10px;
            fill: var(--text-primary,#EAECEE);
            font-weight: 600;
            paint-order: stroke;
            stroke: rgba(0,0,0,0.35);
            stroke-width: .6;
            stroke-linejoin: round;
        }
        .grid-line {
            stroke: rgba(255,255,255,0.08);
            stroke-width: 0.4;
        }
        .grid-label {
            font-size: 8px;
            fill: var(--text-secondary,#A9B4BE);
        }
        .chart-footer {
            position: absolute;
            top: 8px;
            left: 12px;
            font-size: 11px;
            letter-spacing: .5px;
            text-transform: uppercase;
            font-weight: 600;
            color: var(--text-secondary,#A9B4BE);
            pointer-events: none;
        }
        @media (max-width: 600px) {
            .bar-chart-widget { padding: var(--spacing-sm,8px); }
            .value-label { font-size: 9px; }
            .category-label { font-size: 9px; }
        }
    `;

    // Decorative inline label instead of bulky header
    const footerLabel = document.createElement('div');
    footerLabel.className = 'chart-footer';
    footerLabel.textContent = (options.title || 'Bar Chart').replace('📊 ','');

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.className = 'chart-svg';
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    const businessColors = ['#1B90FF', '#049F9A', '#36A41D', '#E76500', '#EE3939', '#7858FF', '#FA4F96', '#F31DED'];

    // Données de fallback si pas de données fournies
    const chartData = data && data.length > 0 ? data : [
        { label: 'Q1', value: 45000 },
        { label: 'Q2', value: 52000 },
        { label: 'Q3', value: 38000 },
        { label: 'Q4', value: 61000 },
        { label: 'Q5', value: 47000 }
    ];

    if (chartData.length > 0) {
        const maxValue = Math.max(...chartData.map(d => d.value));
        const barWidth = 80 / chartData.length;
        const barSpacing = 10 / (chartData.length + 1);

        chartData.forEach((item, index) => {
            const x = barSpacing + index * (barWidth + barSpacing);
            const height = (item.value / maxValue) * 70;
            const y = 80 - height;

            // Barre
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', height);
            rect.setAttribute('fill', businessColors[index % businessColors.length]);
            rect.className = 'bar';
            svg.appendChild(rect);

            // Label de catégorie
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + barWidth / 2);
            text.setAttribute('y', '95');
            text.setAttribute('text-anchor', 'middle');
            text.className = 'category-label';
            text.textContent = item.label;
            svg.appendChild(text);

            // Valeur au-dessus de la barre
            const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueText.setAttribute('x', x + barWidth / 2);
            valueText.setAttribute('y', y - 2);
            valueText.setAttribute('text-anchor', 'middle');
            valueText.className = 'value-label';
            valueText.textContent = Math.round(item.value);
            svg.appendChild(valueText);
        });

        // Grille
        for (let i = 0; i <= 5; i++) {
            const y = 80 - (i / 5) * 70;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '5');
            line.setAttribute('y1', y);
            line.setAttribute('x2', '95');
            line.setAttribute('y2', y);
            line.className = 'grid-line';
            svg.appendChild(line);

            const gridLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            gridLabel.setAttribute('x', '3');
            gridLabel.setAttribute('y', y + 1);
            gridLabel.setAttribute('text-anchor', 'end');
            gridLabel.className = 'grid-label';
            gridLabel.textContent = Math.round((i / 5) * maxValue);
            svg.appendChild(gridLabel);
        }
    }

    chartContainer.appendChild(svg);
    container.appendChild(style);
    container.appendChild(footerLabel);
    container.appendChild(chartContainer);

    // return the HTML DOM element to be rendered
    return container;
});

// ====================================================================
// 🔌 WIDGET CLASS WITH FEEDING INTERFACE
// ====================================================================

class BarChartWidgetUnified extends HTMLElement {
    static get metadataSchema() {
        return BAR_CHART_WIDGET_DEFINITION.metadataSchema;
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.widgetId = this.getAttribute('widget-id') || 'bar-chart-' + Date.now();
        this.isDemo = true; // Mode démo par défaut
        this.feedingData = null; // Données externes via feeding
        
        console.log('📊 BAR CHART: Widget instance created:', this.widgetId);
    }
    
    connectedCallback() {
        console.log('📊 BAR CHART: Widget connected to DOM');
        this.render();
    }

    // ================================================================
    // 🔄 INTERFACE DE FEEDING - Séparée du dataset démo
    // ================================================================
    
    setFeedingData(data) {
        console.log('📊 BAR CHART: Receiving feeding data:', data);
        this.feedingData = data;
        this.isDemo = false;
        this.render();
    }
    
    clearFeedingData() {
        console.log('📊 BAR CHART: Clearing feeding data, reverting to demo');
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
            console.log('📊 BAR CHART: Using feeding data');
            return this.feedingData;
        }
        
        console.log('📊 BAR CHART: Using demo dataset');
        return BAR_CHART_DEMO_DATASET.data;
    }

    // ================================================================
    // 🎨 RENDU VISUEL
    // ================================================================
    
    render() {
        const data = this.getDisplayData();
        const dataSource = this.isDemo ? 'Demo Dataset' : 'External Data';
        
        const renderedElement = barChartRender({
            json: data,
            title: `📊 Bar Chart (${dataSource})`
        });

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(renderedElement);
    }

    // ================================================================
    // 📋 PROPRIÉTÉS PUBLIQUES
    // ================================================================

    getWidgetInfo() {
        return {
            id: this.widgetId,
            type: 'bar-chart',
            version: '1.0.0',
            title: 'Bar Chart v1.0',
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
// 🔌 REGISTRATION & EXPORT
// ====================================================================

BAR_CHART_WIDGET_DEFINITION.class = BarChartWidgetUnified;
BAR_CHART_WIDGET_DEFINITION.render = barChartRender;

// Vérifier si le custom element n'est pas déjà défini
if (!customElements.get('bar-chart-widget-unified')) {
    customElements.define('bar-chart-widget-unified', BarChartWidgetUnified);
    console.log('✅ BAR CHART: Custom element registered');
} else {
    console.log('⚠️ BAR CHART: Custom element already registered, skipping');
}

if (typeof window !== 'undefined') {
    window.BAR_CHART_WIDGET_DEFINITION = BAR_CHART_WIDGET_DEFINITION;
    window.BarChartWidgetUnified = BarChartWidgetUnified;
    window.barChartRender = barChartRender;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BAR_CHART_WIDGET_DEFINITION,
        BarChartWidgetUnified,
        render: barChartRender
    };
}

console.log('📊 Bar Chart Widget loaded:', BAR_CHART_WIDGET_DEFINITION.name, BAR_CHART_WIDGET_DEFINITION.version);