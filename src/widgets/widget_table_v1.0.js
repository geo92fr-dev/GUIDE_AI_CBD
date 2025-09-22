// ====================================================================
// 📋 TABLE WIDGET - Métadonnées
// ====================================================================

const TABLE_WIDGET_DEFINITION = {
    type: 'table',
    name: 'Table v1.0',
    title: 'Data Table Visualization',
    version: '1.0.0',
    metadata: {
        description: 'Data table for structured data display',
        author: 'Widgets Platform',
        tags: ['table', 'data', 'grid', 'structured', 'business'],
        category: 'Data',
        icon: '📋',
        preview: '',
        documentation: 'Table widget for displaying structured data in rows and columns'
    },
    metadataSchema: [
        { name: '*', type: 'any', semantic: 'dimension', description: 'All columns from data source' }
    ],
    dataBinding: {
        requirements: {
            dimensions: { min: 1, max: 10, required: true },
            measures: { min: 0, max: 10, required: false },
            filters: { min: 0, max: 10, required: false }
        },
        defaultBinding: {
            dimensions: [],
            measures: [],
            filters: []
        }
    },
    layout: {
        size: { width: 8, height: 6 },
        minSize: { width: 4, height: 3 },
        maxSize: { width: 12, height: 10 },
        responsive: true
    },
    configuration: {
        showHeader: { type: 'boolean', default: true },
        striped: { type: 'boolean', default: true },
        sortable: { type: 'boolean', default: false },
        pagination: { type: 'boolean', default: false },
        rowsPerPage: { type: 'number', default: 10 }
    },
    rendering: {
        engine: 'native-html',
        dependencies: [],
        performance: {
            maxDataPoints: 1000,
            updateMode: 'full'
        }
    }
};

// ====================================================================
// 📋 RENDER FUNCTION - Fonction de rendu conforme à la signature requise
// ====================================================================

const tableRender = (function(args) {
    // Return the fed data as a collection of Objects
    const data = args.json;
    
    const container = document.createElement('div');
    container.className = 'table-widget';

    const style = document.createElement('style');
    style.textContent = `
        .table-widget { width:100%; height:100%; display:flex; flex-direction:column; background: var(--surface-primary,var(--background-secondary,#1A2733)); border-radius: var(--radius-md,8px); overflow:hidden; font-family: var(--font-family-base,'Segoe UI', Roboto, sans-serif); position:relative; }
        .table-widget:before { content:''; position:absolute; inset:0; background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0)); pointer-events:none; }
        .table-container { flex:1; overflow:auto; padding: var(--spacing-md,16px); }
        .data-table { width:100%; border-collapse: collapse; font-size: 0.8rem; }
        .data-table th { background: linear-gradient(90deg, var(--primary,#1B90FF), var(--primary-dark,#0070F2)); color:#fff; padding:10px 8px; text-align:left; font-weight:600; position:sticky; top:0; z-index:2; font-size:.75rem; letter-spacing:.5px; }
        .data-table td { padding:8px 8px; border-bottom:1px solid rgba(255,255,255,0.08); color: var(--text-primary,#EAECEE); font-size:.75rem; }
        .data-table tr:nth-child(even) { background: rgba(255,255,255,0.03); }
        .data-table tr:hover { background: rgba(255,255,255,0.06); }
        .data-table tr:last-child td { border-bottom:none; }
        .no-data { text-align:center; padding:40px; color: var(--text-muted,#5B738B); }
        .no-data-icon { font-size:2.5rem; margin-bottom:10px; }
        .table-footer-label { position:absolute; top:8px; left:12px; font-size:11px; letter-spacing:.5px; text-transform:uppercase; font-weight:600; color: var(--text-secondary,#A9B4BE); pointer-events:none; }
        .table-container::-webkit-scrollbar { width:10px; height:10px; }
        .table-container::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .table-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius:6px; }
        .table-container::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
        @media (max-width: 600px) { .table-container { padding: var(--spacing-sm,8px);} .data-table { font-size:.7rem;} .data-table th,.data-table td { padding:6px 4px;} }
    `;

    const footerLabel = document.createElement('div');
    footerLabel.className = 'table-footer-label';
    footerLabel.textContent = 'Data Table';

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';

    // Données de fallback si pas de données fournies
    const tableData = data && data.length > 0 ? data : [
        { product: 'Product A', sales: 1250, region: 'North', status: 'Active' },
        { product: 'Product B', sales: 890, region: 'South', status: 'Active' },
        { product: 'Product C', sales: 1540, region: 'East', status: 'Pending' },
        { product: 'Product D', sales: 720, region: 'West', status: 'Active' },
        { product: 'Product E', sales: 980, region: 'Central', status: 'Inactive' }
    ];

    if (tableData.length > 0 && typeof tableData[0] === 'object') {
        const columns = Object.keys(tableData[0]);
        
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // En-tête du tableau
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.charAt(0).toUpperCase() + column.slice(1);
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Corps du tableau
        const tbody = document.createElement('tbody');
        
        tableData.forEach(row => {
            const tr = document.createElement('tr');
            
            columns.forEach(column => {
                const td = document.createElement('td');
                const value = row[column];
                
                if (value !== undefined && value !== null) {
                    if (typeof value === 'number') {
                        td.textContent = value.toLocaleString();
                    } else {
                        td.textContent = value.toString();
                    }
                } else {
                    td.textContent = '-';
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        
    } else {
        const noData = document.createElement('div');
        noData.className = 'no-data';
        
        const icon = document.createElement('div');
        icon.className = 'no-data-icon';
        icon.textContent = '📋';
        
        const message = document.createElement('div');
        message.textContent = 'No data available to display';
        
        noData.appendChild(icon);
        noData.appendChild(message);
        tableContainer.appendChild(noData);
    }

    container.appendChild(style);
    container.appendChild(footerLabel);
    container.appendChild(tableContainer);

    // return the HTML DOM element to be rendered
    return container;
});

// ====================================================================
// 🔌 CLASS FOR COMPATIBILITY
// ====================================================================

class TableWidgetUnified extends HTMLElement {
    static get observedAttributes() {
        return ['data'];
    }

    static get metadataSchema() {
        return TABLE_WIDGET_DEFINITION.metadataSchema;
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
    }
    
    connectedCallback() {
        const data = this.getDataService ? this.getDataService().toJSON() : [];

        const renderedElement = tableRender({
            json: data
        });

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(renderedElement);
    }
}

// ====================================================================
// 🔌 REGISTRATION & EXPORT
// ====================================================================

TABLE_WIDGET_DEFINITION.class = TableWidgetUnified;
TABLE_WIDGET_DEFINITION.render = tableRender;

// Vérifier si le custom element n'est pas déjà défini
if (!customElements.get('table-widget-unified')) {
    customElements.define('table-widget-unified', TableWidgetUnified);
    console.log('✅ TABLE: Custom element registered');
} else {
    console.log('⚠️ TABLE: Custom element already registered, skipping');
}

if (typeof window !== 'undefined') {
    window.TABLE_WIDGET_DEFINITION = TABLE_WIDGET_DEFINITION;
    window.TableWidgetUnified = TableWidgetUnified;
    window.tableRender = tableRender;
    // Compatibility with old naming
    window.table_WIDGET_DEFINITION = TABLE_WIDGET_DEFINITION;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TABLE_WIDGET_DEFINITION,
        TableWidgetUnified,
        render: tableRender
    };
}

console.log('📋 Table Widget loaded:', TABLE_WIDGET_DEFINITION.name, TABLE_WIDGET_DEFINITION.version);