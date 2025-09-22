// ====================================================================
// 📊 DATASET DE DÉMONSTRATION - Isolé du code
// ====================================================================

const LINE_CHART_DEMO_DATASET = {
    metadata: {
        name: 'Sales Trend Demo Dataset',
        description: 'Dataset de démonstration pour les tendances de ventes',
        source: 'internal-demo',
        lastUpdated: new Date().toISOString(),
        rowCount: 12
    },
    data: [
        { label: 'Jan', value: 45000, period: 'Q1' },
        { label: 'Feb', value: 48000, period: 'Q1' },
        { label: 'Mar', value: 52000, period: 'Q1' },
        { label: 'Apr', value: 49000, period: 'Q2' },
        { label: 'May', value: 55000, period: 'Q2' },
        { label: 'Jun', value: 58000, period: 'Q2' },
        { label: 'Jul', value: 61000, period: 'Q3' },
        { label: 'Aug', value: 59000, period: 'Q3' },
        { label: 'Sep', value: 64000, period: 'Q3' },
        { label: 'Oct', value: 67000, period: 'Q4' },
        { label: 'Nov', value: 71000, period: 'Q4' },
        { label: 'Dec', value: 74000, period: 'Q4' }
    ]
};

// ====================================================================
// 📋 LINE CHART WIDGET - Métadonnées
// ====================================================================

const LINE_CHART_WIDGET_DEFINITION = {
    type: 'line-chart',
    name: 'Line Chart v1.0',
    title: 'Line Chart Visualization',
    version: '1.0.0',
    metadata: {
        description: 'Line chart for time series and trend data with demo dataset',
        author: 'Widgets Platform',
        tags: ['chart', 'visualization', 'line', 'trend', 'business', 'demo'],
        category: 'Charts',
        icon: '📈',
        preview: '',
        documentation: 'Line chart widget for displaying time series and trend data'
    },
    
    // Dataset intégré mais séparé du code
    demoDataset: LINE_CHART_DEMO_DATASET,
    
    metadataSchema: [
        { name: 'label', type: 'string', semantic: 'dimension', description: 'Time period or category label' },
        { name: 'value', type: 'number', semantic: 'measure', description: 'Value for the data point' }
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
        showPoints: { type: 'boolean', default: true },
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
// 📈 RENDER FUNCTION - Fonction de rendu conforme à la signature requise
// ====================================================================

const lineChartRender = (function(args) {
    // Return the fed data as a collection of Objects
    const data = args.json;
    
    const container = document.createElement('div');
    container.className = 'line-chart-widget';

    const style = document.createElement('style');
    style.textContent = `
        .line-chart-widget {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            font-family: 'Segoe UI', Roboto, sans-serif;
        }
        .widget-header {
            padding: 16px;
            background: #f8f9fa;
            border-bottom: 1px solid #eaecee;
            flex-shrink: 0;
        }
        .widget-title {
            margin: 0;
            font-size: 1.1em;
            font-weight: 600;
            color: #1a2733;
        }
        .chart-container {
            flex: 1;
            padding: 16px;
            overflow: hidden;
        }
        .chart-svg {
            width: 100%;
            height: 100%;
            overflow: visible;
        }
        .line-path {
            fill: none;
            stroke: #1B90FF;
            stroke-width: 3;
            stroke-linejoin: round;
            stroke-linecap: round;
        }
        .data-point {
            fill: #1B90FF;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .data-point:hover {
            fill: #0066CC;
            r: 5;
        }
        .category-label {
            font-size: 12px;
            fill: #5b738b;
        }
        .value-label {
            font-size: 11px;
            fill: #1a2733;
            font-weight: 600;
        }
        .grid-line {
            stroke: #eaecee;
            stroke-width: 1;
            opacity: 0.5;
        }
        .grid-label {
            font-size: 10px;
            fill: #a9b4be;
        }
        @media (max-width: 600px) {
            .widget-header {
                padding: 8px;
            }
            .chart-container {
                padding: 8px;
            }
            .category-label {
                font-size: 10px;
            }
        }
    `;

    const header = document.createElement('div');
    header.className = 'widget-header';
    const title = document.createElement('h3');
    title.className = 'widget-title';
    title.textContent = 'Line Chart';
    header.appendChild(title);

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.className = 'chart-svg';
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    // Données de fallback si pas de données fournies
    const chartData = data && data.length > 0 ? data : [
        { label: 'Jan', value: 120 },
        { label: 'Feb', value: 150 },
        { label: 'Mar', value: 80 },
        { label: 'Apr', value: 200 },
        { label: 'May', value: 170 },
        { label: 'Jun', value: 230 }
    ];

    if (chartData.length > 0) {
        const minValue = Math.min(...chartData.map(d => d.value));
        const maxValue = Math.max(...chartData.map(d => d.value));
        const valueRange = maxValue - minValue || 1;

        // Calculer les points de la ligne
        const points = chartData.map((item, index) => {
            const x = 10 + (index / (chartData.length - 1)) * 80;
            const y = 80 - ((item.value - minValue) / valueRange) * 60;
            return { x, y, label: item.label, value: item.value };
        });

        // Créer la ligne
        const pathData = points.map((point, index) => 
            `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.className = 'line-path';
        svg.appendChild(path);

        // Ajouter les points
        points.forEach((point, index) => {
            // Point de données
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', '3');
            circle.className = 'data-point';
            svg.appendChild(circle);

            // Label de catégorie
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', point.x);
            text.setAttribute('y', '95');
            text.setAttribute('text-anchor', 'middle');
            text.className = 'category-label';
            text.textContent = point.label;
            svg.appendChild(text);

            // Valeur au-dessus du point
            const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueText.setAttribute('x', point.x);
            valueText.setAttribute('y', point.y - 8);
            valueText.setAttribute('text-anchor', 'middle');
            valueText.className = 'value-label';
            valueText.textContent = Math.round(point.value);
            svg.appendChild(valueText);
        });

        // Grille horizontale
        for (let i = 0; i <= 5; i++) {
            const y = 80 - (i / 5) * 60;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '10');
            line.setAttribute('y1', y);
            line.setAttribute('x2', '90');
            line.setAttribute('y2', y);
            line.className = 'grid-line';
            svg.appendChild(line);

            const gridLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            gridLabel.setAttribute('x', '8');
            gridLabel.setAttribute('y', y + 1);
            gridLabel.setAttribute('text-anchor', 'end');
            gridLabel.className = 'grid-label';
            gridLabel.textContent = Math.round(minValue + (i / 5) * valueRange);
            svg.appendChild(gridLabel);
        }
    }

    chartContainer.appendChild(svg);
    container.appendChild(style);
    container.appendChild(header);
    container.appendChild(chartContainer);

    // return the HTML DOM element to be rendered
    return container;
});

// ====================================================================
// 🔌 CLASS FOR COMPATIBILITY
// ====================================================================

class LineChartWidgetUnified extends HTMLElement {
    static get metadataSchema() {
        return LINE_CHART_WIDGET_DEFINITION.metadataSchema;
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        const data = this.getDataService ? this.getDataService().toJSON() : [];

        const renderedElement = lineChartRender({
            json: data
        });

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(renderedElement);
    }
}

// ====================================================================
// 🔌 REGISTRATION & EXPORT
// ====================================================================

LINE_CHART_WIDGET_DEFINITION.class = LineChartWidgetUnified;
LINE_CHART_WIDGET_DEFINITION.render = lineChartRender;

// Vérifier si le custom element n'est pas déjà défini
if (!customElements.get('line-chart-widget-unified')) {
    customElements.define('line-chart-widget-unified', LineChartWidgetUnified);
    console.log('✅ LINE CHART: Custom element registered');
} else {
    console.log('⚠️ LINE CHART: Custom element already registered, skipping');
}

if (typeof window !== 'undefined') {
    window.LINE_CHART_WIDGET_DEFINITION = LINE_CHART_WIDGET_DEFINITION;
    window.LineChartWidgetUnified = LineChartWidgetUnified;
    window.lineChartRender = lineChartRender;
    // Compatibility with old naming
    window.line_chart_WIDGET_DEFINITION = LINE_CHART_WIDGET_DEFINITION;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LINE_CHART_WIDGET_DEFINITION,
        LineChartWidgetUnified,
        render: lineChartRender
    };
}

console.log('📈 Line Chart Widget loaded:', LINE_CHART_WIDGET_DEFINITION.name, LINE_CHART_WIDGET_DEFINITION.version);