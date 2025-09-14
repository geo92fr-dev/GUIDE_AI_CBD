/**
 * 📋 Table Widget Unified v1.0
 * Compatible avec le système unifié de widgets
 */
class TableWidgetUnified extends HTMLElement {
    static get observedAttributes() {
        return ['data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data') {
            try {
                const parsed = JSON.parse(newValue);
                this.updateData(parsed);
            } catch (e) {
                this.updateData([]);
            }
        }
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = { data: [] };
    }

    initializeWithEntity(entity) {
        this.entity = entity;
        this.renderTable();
    }

    updateData(data) {
        this.state.data = data;
        this.renderTable();
    }

    renderTable() {
        const data = this.state.data;
        let tableHtml = '';
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
            const columns = Object.keys(data[0]);
            tableHtml += `<table style="width:100%;border-collapse:collapse;background:#fff;color:#222;font-size:1em;">`;
            tableHtml += `<thead><tr>`;
            columns.forEach(col => {
                tableHtml += `<th style="border-bottom:2px solid #1B90FF;padding:8px;text-align:left;background:#F0F6FF;">${col}</th>`;
            });
            tableHtml += `</tr></thead><tbody>`;
            data.forEach(row => {
                tableHtml += `<tr>`;
                columns.forEach(col => {
                    tableHtml += `<td style="border-bottom:1px solid #eaeaea;padding:8px;">${row[col] !== undefined ? row[col] : ''}</td>`;
                });
                tableHtml += `</tr>`;
            });
            tableHtml += `</tbody></table>`;
        } else {
            tableHtml = `<div style="color:#e74c3c;">No data to display</div>`;
        }
        this.shadowRoot.innerHTML = `
            <div style="padding:16px; color:#6B7680;">
                <div style="font-size:1.5em;">📋 Table Widget</div>
                <div style="font-size:0.9em; margin-bottom:8px;">widget_table_v1.0.js</div>
                ${tableHtml}
            </div>
        `;
    }
    static get metadataSchema() {
        return {
            fields: [
                { key: '*', type: 'any', description: 'All columns from data source' }
            ],
            example: [
                { col1: 'A', col2: 10 },
                { col1: 'B', col2: 20 }
            ]
        };
    }
}
window.TableWidgetUnified = TableWidgetUnified;
customElements.define('table-widget-unified', TableWidgetUnified);
window.table_WIDGET_DEFINITION = {
    type: 'table',
    name: 'Table',
    class: TableWidgetUnified,
    metadataSchema: TableWidgetUnified.metadataSchema
};