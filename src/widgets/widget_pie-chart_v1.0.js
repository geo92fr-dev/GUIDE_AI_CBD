// ====================================================================
// � DATASET DE DÉMONSTRATION - Isolé du code
// ====================================================================

const PIE_CHART_DEMO_DATASET = {
    metadata: {
        name: 'Market Share Demo Dataset',
        description: 'Dataset de démonstration pour les parts de marché',
        source: 'internal-demo',
        lastUpdated: new Date().toISOString(),
        rowCount: 5
    },
    data: [
        { label: 'Desktop', value: 35, category: 'Platform' },
        { label: 'Mobile', value: 45, category: 'Platform' },
        { label: 'Tablet', value: 15, category: 'Platform' },
        { label: 'Smart TV', value: 3, category: 'Platform' },
        { label: 'Other', value: 2, category: 'Platform' }
    ]
};

// ====================================================================
// �📋 PIE CHART WIDGET - Métadonnées
// ====================================================================

const PIE_CHART_WIDGET_DEFINITION = {
    type: 'pie-chart',
    name: 'Pie Chart v1.0',
    title: 'Pie Chart Visualization',
    version: '1.0.0',
    metadata: {
        description: 'Pie chart for proportional data visualization with demo dataset',
        author: 'Widgets Platform',
        tags: ['chart', 'visualization', 'pie', 'proportional', 'business', 'demo'],
        category: 'Charts',
        icon: '🥧',
        preview: '',
        documentation: 'Pie chart widget for displaying proportional data as circular segments'
    },
    
    // Dataset intégré mais séparé du code
    demoDataset: PIE_CHART_DEMO_DATASET,
    metadataSchema: [
        { name: 'label', type: 'string', semantic: 'dimension', description: 'Category label for pie slice' },
        { name: 'value', type: 'number', semantic: 'measure', description: 'Value for pie slice proportion' }
    ],
    dataBinding: {
        requirements: {
            dimensions: { min: 1, max: 1, required: true },
            measures: { min: 1, max: 1, required: true },
            filters: { min: 0, max: 10, required: false }
        },
        defaultBinding: {
            dimensions: [],
            measures: [],
            filters: []
        }
    },
    layout: {
        size: { width: 4, height: 4 },
        minSize: { width: 3, height: 3 },
        maxSize: { width: 8, height: 8 },
        responsive: true
    },
    configuration: {
        showLegend: { type: 'boolean', default: true },
        showPercentages: { type: 'boolean', default: true },
        showLabels: { type: 'boolean', default: true },
        colorScheme: { type: 'select', options: ['business', 'rainbow', 'monochrome'], default: 'business' }
    },
    rendering: {
        engine: 'native-svg',
        dependencies: [],
        performance: {
            maxDataPoints: 20,
            updateMode: 'full'
        }
    }
};

// ====================================================================
// 🥧 RENDER FUNCTION - Fonction de rendu conforme à la signature requise
// ====================================================================

const pieChartRender = (function(args) {
    // Return the fed data as a collection of Objects
    const data = args.json;
    
    const container = document.createElement('div');
    container.className = 'pie-chart-widget';

    const style = document.createElement('style');
    style.textContent = `
        .pie-chart-widget { width:100%; height:100%; display:flex; flex-direction:column; background: var(--surface-primary,var(--background-secondary,#1A2733)); border-radius: var(--radius-md,8px); overflow:hidden; font-family: var(--font-family-base,'Segoe UI', Roboto, sans-serif); position:relative; padding: var(--spacing-md,16px); }
        .pie-chart-widget:before { content:''; position:absolute; inset:0; background:linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,0)); pointer-events:none; }
        .chart-container { flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .chart-content {
            display: flex;
            align-items: center;
            gap: 20px;
            width: 100%;
            height: 100%;
        }
        .chart-svg {
            flex-shrink: 0;
        }
        .pie-slice {
            cursor: pointer;
            transition: transform .25s ease, filter .25s ease;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,.45));
        }
        .pie-slice:hover {
            transform: scale(1.05);
            filter: brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,.6));
        }
        .legend { flex:1; max-width:160px; display:flex; flex-direction:column; gap:6px; }
        .legend-item {
            display:flex;
            align-items:center;
            font-size: 11px;
            gap:6px;
        }
        .legend-color { width:14px; height:14px; border-radius:4px; flex-shrink:0; box-shadow:0 0 0 1px rgba(0,0,0,.4); }
        .legend-label { color: var(--text-primary,#EAECEE); font-weight:500; }
        .legend-value { color: var(--text-muted,#5B738B); margin-left:auto; font-size:10px; }
        .chart-footer { position:absolute; top:8px; left:12px; font-size:11px; letter-spacing:.5px; text-transform:uppercase; font-weight:600; color: var(--text-secondary,#A9B4BE); pointer-events:none; }
        @media (max-width: 600px) {
            .chart-content {
                flex-direction: column;
                gap: 10px;
            }
            .legend {
                max-width: none;
                width: 100%;
            }
        }
    `;

    const footerLabel = document.createElement('div');
    footerLabel.className = 'chart-footer';
    footerLabel.textContent = 'Pie Chart';

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    const chartContent = document.createElement('div');
    chartContent.className = 'chart-content';

    // Données de fallback si pas de données fournies
    const chartData = data && data.length > 0 ? data : [
        { label: 'Desktop', value: 45 },
        { label: 'Mobile', value: 35 },
        { label: 'Tablet', value: 20 }
    ];

    const businessColors = ['#1B90FF', '#049F9A', '#36A41D', '#E76500', '#EE3939', '#7858FF', '#FA4F96', '#F31DED'];
    
    if (chartData.length > 0) {
        const total = chartData.reduce((sum, item) => sum + item.value, 0);
        const size = 150;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 20;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.className = 'chart-svg';
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

        let currentAngle = -Math.PI / 2; // Commencer en haut

        chartData.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;

            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');

            const slice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            slice.setAttribute('d', pathData);
            slice.setAttribute('fill', businessColors[index % businessColors.length]);
            slice.setAttribute('stroke', '#ffffff');
            slice.setAttribute('stroke-width', '2');
            slice.className = 'pie-slice';
            svg.appendChild(slice);

            currentAngle = endAngle;
        });

        chartContent.appendChild(svg);

        // Légende
        const legend = document.createElement('div');
        legend.className = 'legend';

        chartData.forEach((item, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';

            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = businessColors[index % businessColors.length];

            const labelSpan = document.createElement('span');
            labelSpan.className = 'legend-label';
            labelSpan.textContent = item.label;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'legend-value';
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
            valueSpan.textContent = `${percentage}%`;

            legendItem.appendChild(colorBox);
            legendItem.appendChild(labelSpan);
            legendItem.appendChild(valueSpan);
            legend.appendChild(legendItem);
        });

        chartContent.appendChild(legend);
    }

    chartContainer.appendChild(chartContent);
    container.appendChild(style);
    container.appendChild(footerLabel);
    container.appendChild(chartContainer);

    // return the HTML DOM element to be rendered
    return container;
});

// ====================================================================
// 🔌 CLASS FOR COMPATIBILITY
// ====================================================================

class PieChartWidgetUnified extends HTMLElement {
    static get metadataSchema() {
        return PIE_CHART_WIDGET_DEFINITION.metadataSchema;
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        const data = this.getDataService ? this.getDataService().toJSON() : [];

        const renderedElement = pieChartRender({
            json: data
        });

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(renderedElement);
    }
}

// ====================================================================
// 🔌 REGISTRATION & EXPORT
// ====================================================================

PIE_CHART_WIDGET_DEFINITION.class = PieChartWidgetUnified;
PIE_CHART_WIDGET_DEFINITION.render = pieChartRender;

// Vérifier si le custom element n'est pas déjà défini
if (!customElements.get('pie-chart-widget-unified')) {
    customElements.define('pie-chart-widget-unified', PieChartWidgetUnified);
    console.log('✅ PIE CHART: Custom element registered');
} else {
    console.log('⚠️ PIE CHART: Custom element already registered, skipping');
}

if (typeof window !== 'undefined') {
    window.PIE_CHART_WIDGET_DEFINITION = PIE_CHART_WIDGET_DEFINITION;
    window.PieChartWidgetUnified = PieChartWidgetUnified;
    window.pieChartRender = pieChartRender;
    // Compatibility with old naming
    window.pie_chart_WIDGET_DEFINITION = PIE_CHART_WIDGET_DEFINITION;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PIE_CHART_WIDGET_DEFINITION,
        PieChartWidgetUnified,
        render: pieChartRender
    };
}

console.log('🥧 Pie Chart Widget loaded:', PIE_CHART_WIDGET_DEFINITION.name, PIE_CHART_WIDGET_DEFINITION.version);