/**
 * 🥧 Pie Chart Widget Unified v1.0
 * Compatible avec le système unifié de widgets
 */
class PieChartWidgetUnified extends HTMLElement {
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
        let size = 200;
        if (this.parentElement) {
            const rect = this.parentElement.getBoundingClientRect();
            size = Math.max(160, Math.min(rect.width, rect.height) - 32);
        }
        const total = data.reduce((sum, d) => sum + (typeof d.value === 'number' ? d.value : 0), 0);
        const colors = ["#FF9500", "#1B90FF", "#30C330", "#FF3B30", "#A9B4BE", "#6B7680", "#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845"];
        let angle = 0;
        let svgSlices = '';
        let legend = '';
        data.forEach((d, i) => {
            const value = typeof d.value === 'number' ? d.value : 0;
            const percent = total ? value / total : 0;
            const startAngle = angle;
            const endAngle = angle + percent * 2 * Math.PI;
            const x1 = size/2 + (size/2-20) * Math.cos(startAngle);
            const y1 = size/2 + (size/2-20) * Math.sin(startAngle);
            const x2 = size/2 + (size/2-20) * Math.cos(endAngle);
            const y2 = size/2 + (size/2-20) * Math.sin(endAngle);
            const largeArc = percent > 0.5 ? 1 : 0;
            svgSlices += `<path d="M${size/2},${size/2} L${x1},${y1} A${size/2-20},${size/2-20} 0 ${largeArc},1 ${x2},${y2} Z" fill="${colors[i % colors.length]}" stroke="#fff" stroke-width="2" />`;
            legend += `<div style="display:flex;align-items:center;margin-bottom:2px;"><span style="display:inline-block;width:14px;height:14px;background:${colors[i % colors.length]};border-radius:3px;margin-right:6px;"></span>${d.label} (${value})</div>`;
            angle = endAngle;
        });
        this.shadowRoot.innerHTML = `
            <div style="padding:16px; color:#FF9500;">
                <div style="font-size:1.5em;">🥧 Pie Chart Widget</div>
                <div style="font-size:0.9em; margin-bottom:8px;">widget_pie-chart_v1.0.js</div>
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;margin:auto;">
                    ${svgSlices}
                    <circle cx="${size/2}" cy="${size/2}" r="${size/2-20}" fill="none" stroke="#eee" stroke-width="1" />
                </svg>
                <div style="margin-top:12px;">${legend}</div>
            </div>
        `;
    }
    connectedCallback() {
        window.addEventListener('resize', () => this.renderChart());
    }
    static get metadataSchema() {
        return {
            fields: [
                { key: 'label', type: 'string', description: 'Label for slice/category' },
                { key: 'value', type: 'number', description: 'Value for slice (numeric)' }
            ],
            example: [
                { label: 'A', value: 30 },
                { label: 'B', value: 70 }
            ]
        };
    }
}
window.PieChartWidgetUnified = PieChartWidgetUnified;
customElements.define('pie-chart-widget-unified', PieChartWidgetUnified);
window.pie_chart_WIDGET_DEFINITION = {
    type: 'pie-chart',
    name: 'Pie Chart',
    class: PieChartWidgetUnified,
    metadataSchema: PieChartWidgetUnified.metadataSchema
};