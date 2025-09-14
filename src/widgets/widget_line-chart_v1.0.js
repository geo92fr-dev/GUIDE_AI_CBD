/**
 * 📈 Line Chart Widget Unified v1.0
 * Compatible avec le système unifié de widgets
 */
class LineChartWidgetUnified extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = { data: [] };
    }

    initializeWithEntity(entity) {
        this.entity = entity;
        this.renderChart();
    }

    updateData(data) {
        this.state.data = data;
        this.renderChart();
    }

    renderChart() {
        const data = Array.isArray(this.state.data) ? this.state.data : [];
        // Responsive: get container size
        let width = 400, height = 180;
        if (this.parentElement) {
            const rect = this.parentElement.getBoundingClientRect();
            width = Math.max(320, Math.floor(rect.width) - 32);
            height = Math.max(120, Math.floor(rect.height) - 64);
        }
        const margin = 30;
        const points = data.map((d, i) => {
            const x = margin + i * ((width - 2 * margin) / Math.max(1, data.length - 1));
            const y = height - margin - ((typeof d.value === 'number' ? d.value : 0) - Math.min(...data.map(e => e.value))) /
                (Math.max(...data.map(e => e.value)) - Math.min(...data.map(e => e.value)) || 1) * (height - 2 * margin);
            return { x, y, label: d.label, value: d.value };
        });
        let polyline = points.length ? `<polyline fill="none" stroke="#1B90FF" stroke-width="3" points="${points.map(p => `${p.x},${p.y}`).join(' ')}" />` : '';
        let circles = points.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#1B90FF" />`).join('');
        let labels = points.map((p, i) => `<text x="${p.x}" y="${p.y - 8}" font-size="11" text-anchor="middle" fill="#1B90FF">${p.value}</text>`).join('');
        let xLabels = points.map((p, i) => `<text x="${p.x}" y="${height - 8}" font-size="11" text-anchor="middle" fill="#6B7680">${p.label}</text>`).join('');
        this.shadowRoot.innerHTML = `
            <div style="padding:16px; color:#1B90FF;">
                <div style="font-size:1.5em;">📈 Line Chart Widget</div>
                <div style="font-size:0.9em; margin-bottom:8px;">widget_line-chart_v1.0.js</div>
                <svg width="${width}" height="${height}" style="background:#fff;border-radius:8px;box-shadow:0 2px 8px #0001;">
                    <g>${polyline}${circles}${labels}</g>
                    <g>${xLabels}</g>
                </svg>
            </div>
        `;
    }
    connectedCallback() {
        window.addEventListener('resize', () => this.renderChart());
    }
    static get metadataSchema() {
        return {
            fields: [
                { key: 'label', type: 'string', description: 'Label for X axis (category or time)' },
                { key: 'value', type: 'number', description: 'Value for Y axis (numeric)' }
            ],
            example: [
                { label: 'Jan', value: 120 },
                { label: 'Feb', value: 150 }
            ]
        };
    }
}
window.LineChartWidgetUnified = LineChartWidgetUnified;
customElements.define('line-chart-widget-unified', LineChartWidgetUnified);
window.line_chart_WIDGET_DEFINITION = {
    type: 'line-chart',
    name: 'Line Chart',
    class: LineChartWidgetUnified,
    metadataSchema: LineChartWidgetUnified.metadataSchema
};