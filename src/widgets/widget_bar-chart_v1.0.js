
// ====================================================================
// 📋 BAR CHART WIDGET - Strictement aligné sur Line Chart
// ====================================================================

const BAR_CHART_WIDGET_DEFINITION = {
    type: 'bar-chart',
    name: 'Bar Chart',
    title: 'Bar Chart Visualization',
    version: '1.0.0',
    metadata: {
        description: 'Bar chart for categorical data',
        author: 'Widgets Platform',
        tags: ['chart', 'visualization', 'bar', 'business'],
        category: 'Charts',
        icon: '📊',
        preview: '',
        documentation: 'Bar chart widget for displaying categorical data with quantitative values'
    },
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

class BarChartWidgetUnified extends HTMLElement {
    static get metadataSchema() {
        return BAR_CHART_WIDGET_DEFINITION.metadataSchema;
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.widgetEntity = null;
        this.chartData = [];
        this.isRendered = false;
        this.config = {
            orientation: 'vertical',
            showValues: true,
            showGrid: true,
            animation: true,
            colorScheme: 'business',
            margins: { top: 20, right: 30, bottom: 40, left: 60 }
        };
        this.colorSchemes = {
            business: [
                '#1B90FF', '#049F9A', '#36A41D', '#E76500', '#EE3939', '#7858FF', '#FA4F96', '#F31DED'
            ],
            rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
            monochrome: ['#1a1a1a', '#404040', '#666666', '#808080', '#999999', '#b3b3b3']
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
        this.renderChart();
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
            if (typeof value !== 'number' || isNaN(value)) value = undefined;
            return {
                label,
                value,
                color: this.getColor(idx)
            };
        }).filter(d => d.label !== undefined && d.value !== undefined);
    }
    generateSampleData() {
        const categories = ['A', 'B', 'C', 'D', 'E'];
        return categories.map((label, idx) => ({
            label,
            value: Math.floor(Math.random() * 100) + 10,
            color: this.getColor(idx)
        }));
    }
    getColor(index) {
        const colors = this.colorSchemes[this.config.colorScheme] || this.colorSchemes.business;
        return colors[index % colors.length];
    }
    render() {
        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <div class="bar-chart-widget">
                <div class="widget-header">
                    <h3 class="widget-title">${this.widgetEntity?.title || 'Bar Chart'}</h3>
                </div>
                <div class="chart-container" style="width:100%;height:100%;min-height:180px;min-width:320px;">
                    <svg class="chart-svg" id="barChart"></svg>
                </div>
                ${this.config.showValues ? '<div class="chart-legend"></div>' : ''}
            </div>
        `;
        setTimeout(() => {
            this.renderChart();
            this.isRendered = true;
        }, 0);
    }
    connectedCallback() {
        window.addEventListener('resize', () => this.render());
    }
    renderChart() {
        const svg = this.shadowRoot.querySelector('#barChart');
        if (!svg) return;
        const container = this.shadowRoot.querySelector('.chart-container');
        const rect = container.getBoundingClientRect();
        const width = rect.width - this.config.margins.left - this.config.margins.right;
        const height = rect.height - this.config.margins.top - this.config.margins.bottom;
        if (width <= 0 || height <= 0) {
            setTimeout(() => this.renderChart(), 100);
            return;
        }
        svg.innerHTML = '';
        svg.setAttribute('width', rect.width);
        svg.setAttribute('height', rect.height);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${this.config.margins.left}, ${this.config.margins.top})`);
        svg.appendChild(g);
        const validValues = this.chartData.map(d => d.value).filter(v => typeof v === 'number' && !isNaN(v));
        const maxValue = validValues.length ? Math.max(...validValues) : 0;
        const barWidth = width / this.chartData.length * 0.8;
        const barSpacing = width / this.chartData.length * 0.2;
        this.chartData.forEach((data, idx) => {
            const barHeight = (data.value / maxValue) * height;
            const x = idx * (barWidth + barSpacing) + barSpacing / 2;
            const y = height - barHeight;
            const rectBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectBar.setAttribute('x', x);
            rectBar.setAttribute('y', y);
            rectBar.setAttribute('width', barWidth);
            rectBar.setAttribute('height', barHeight);
            rectBar.setAttribute('fill', data.color);
            rectBar.setAttribute('class', 'bar');
            rectBar.setAttribute('data-value', data.value);
            rectBar.setAttribute('data-label', data.label);
            if (this.config.animation) rectBar.style.transition = 'all 0.3s ease';
            rectBar.addEventListener('mouseenter', (e) => this.handleBarHover(e, data));
            rectBar.addEventListener('mouseleave', (e) => this.handleBarLeave(e, data));
            g.appendChild(rectBar);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + barWidth / 2);
            text.setAttribute('y', height + 15);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', 'category-label');
            text.textContent = data.label;
            g.appendChild(text);
            if (this.config.showValues) {
                const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                valueText.setAttribute('x', x + barWidth / 2);
                valueText.setAttribute('y', y - 5);
                valueText.setAttribute('text-anchor', 'middle');
                valueText.setAttribute('class', 'value-label');
                valueText.textContent = Math.round(data.value);
                g.appendChild(valueText);
            }
        });
        if (this.config.showGrid) {
            this.renderGrid(g, width, height, maxValue);
        }
    }
    renderGrid(container, width, height, maxValue) {
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = height - (i / gridLines) * height;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('class', 'grid-line');
            container.appendChild(line);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', -10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('class', 'grid-label');
            text.textContent = Math.round((i / gridLines) * maxValue);
            container.appendChild(text);
        }
    }
    handleBarHover(event, data) {
        const bar = event.target;
        bar.style.opacity = '0.8';
        bar.style.stroke = '#1a2733';
        bar.style.strokeWidth = '2';
    }
    handleBarLeave(event, data) {
        const bar = event.target;
        bar.style.opacity = '1';
        bar.style.stroke = 'none';
    }
    getStyles() {
        return `
            <style>
                :host { display: block; width: 100%; height: 100%; font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif); }
                .bar-chart-widget { width: 100%; height: 100%; display: flex; flex-direction: column; background: var(--background-primary, #fff); border-radius: var(--radius-md, 8px); overflow: hidden; }
                .widget-header { padding: var(--spacing-md, 16px); background: var(--background-tertiary, #f8f9fa); border-bottom: 1px solid var(--border-light, #eaecee); flex-shrink: 0; }
                .widget-title { margin: 0; font-size: 1.1em; font-weight: 600; color: var(--text-primary, #1a2733); }
                .chart-container { flex: 1; padding: var(--spacing-md, 16px); overflow: hidden; }
                .chart-svg { width: 100%; height: 100%; overflow: visible; }
                .bar { cursor: pointer; transition: all 0.3s ease; }
                .bar:hover { filter: brightness(1.1); }
                .category-label { font-size: 12px; fill: var(--text-secondary, #5b738b); }
                .value-label { font-size: 11px; fill: var(--text-primary, #1a2733); font-weight: 600; }
                .grid-line { stroke: var(--border-light, #eaecee); stroke-width: 1; opacity: 0.5; }
                .grid-label { font-size: 10px; fill: var(--text-tertiary, #a9b4be); }
                .chart-legend { padding: var(--spacing-sm, 8px); background: var(--background-secondary, #f8f9fa); border-top: 1px solid var(--border-light, #eaecee); font-size: 0.85em; color: var(--text-secondary, #5b738b); text-align: center; flex-shrink: 0; }
                @media (max-width: 600px) { .widget-header { padding: var(--spacing-sm, 8px); } .chart-container { padding: var(--spacing-sm, 8px); } .category-label { font-size: 10px; } }
            </style>
        `;
    }
}

BAR_CHART_WIDGET_DEFINITION.class = BarChartWidgetUnified;
customElements.define('bar-chart-widget-unified', BarChartWidgetUnified);
if (typeof window !== 'undefined') {
    window.BAR_CHART_WIDGET_DEFINITION = BAR_CHART_WIDGET_DEFINITION;
    window.BarChartWidgetUnified = BarChartWidgetUnified;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BAR_CHART_WIDGET_DEFINITION,
        BarChartWidgetUnified
    };
}
console.log('📊 Bar Chart Widget loaded:', BAR_CHART_WIDGET_DEFINITION.name, BAR_CHART_WIDGET_DEFINITION.version);