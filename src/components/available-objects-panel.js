/**
 * 📚 Available Objects Panel - WebI Dictionary Style
 * 
 * RIGHT PANEL 2 - According to WIDGET_TECH_SPEC.md:
 * - WebI-compatible interface for data dictionary
 * - Drag & drop source for DIMENSIONS/MEASURES
 * - Search and filtering capabilities
 * - Metadata display with statistics
 * - Business theme integration
 */

class AvailableObjectsPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // State
        this.dataModel = window.dataModel;
        this.fields = [];
        this.filteredFields = [];
        this.searchTerm = '';
        this.expandedSections = new Set(['dimensions', 'measures']);
        this.selectedField = null;
        
        // Bind methods
        this.handleDataSourceChanged = this.handleDataSourceChanged.bind(this);
        this.handleFieldsUpdated = this.handleFieldsUpdated.bind(this);
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        
        // Subscribe to data model changes with retry mechanism
        this.setupDataModel();
    }

    setupDataModel() {
        // Try to get dataModel immediately
        if (window.dataModel) {
            this.dataModel = window.dataModel;
            this.dataModel.on('dataSourceChanged', this.handleDataSourceChanged);
            this.dataModel.on('fieldsUpdated', this.handleFieldsUpdated);
            this.handleFieldsUpdated(this.dataModel.getFields());
        } else {
            // Retry after a short delay if dataModel is not ready
            setTimeout(() => {
                if (window.dataModel && !this.dataModel) {
                    console.log('📚 Available Objects: DataModel found on retry');
                    this.setupDataModel();
                }
            }, 100);
        }
    }

    handleDataSourceChanged(dataSource) {
        console.log('📚 Available Objects: Data source changed', dataSource?.name);
        this.updateLoadingState(!dataSource);
    }

    handleFieldsUpdated(fields) {
        console.log('📚 Available Objects: Fields updated', fields.length);
        this.fields = fields || [];
        this.applyFilters();
        this.render();
    }

    // Public methods for external updates
    updateFields(fields) {
        console.log('📚 Available Objects Panel: updateFields called with', fields?.length, 'fields');
        console.log('📚 Available Objects Panel: Current fields before update:', this.fields?.length);
        this.fields = fields || [];
        console.log('📚 Available Objects Panel: Fields after assignment:', this.fields?.length);
        this.applyFilters();
        console.log('📚 Available Objects Panel: About to render...');
        this.render();
        console.log('📚 Available Objects Panel: Render completed');
    }

    updateDataSource(dataSource) {
        console.log('📚 Available Objects Panel: updateDataSource called with:', dataSource?.name || 'null');
        
        // Ensure we have the dataModel reference
        if (!this.dataModel && window.dataModel) {
            console.log('📚 Available Objects Panel: Setting dataModel reference');
            this.dataModel = window.dataModel;
        }
        
        console.log('📚 Available Objects Panel: DataModel available:', !!this.dataModel);
        this.handleDataSourceChanged(dataSource);
        // Force re-render to show metadata
        console.log('📚 Available Objects Panel: About to render after dataSource update...');
        this.render();
        console.log('📚 Available Objects Panel: Render after dataSource update completed');
    }

    applyFilters() {
        this.filteredFields = this.fields.filter(field => {
            if (this.searchTerm) {
                const searchLower = this.searchTerm.toLowerCase();
                return field.name.toLowerCase().includes(searchLower) ||
                       field.displayName.toLowerCase().includes(searchLower) ||
                       field.description.toLowerCase().includes(searchLower);
            }
            return true;
        });
    }

    render() {
        console.log('📚 Available Objects Panel: render() called');
        console.log('📚 Available Objects Panel: Current state - fields:', this.fields?.length, 'dataModel:', !!this.dataModel);
        
        const style = `
            <style>
                :host {
                    display: block;
                    height: 100%;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }
                
                .dictionary-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--background-primary, #12171C);
                    border-left: 1px solid var(--border-light, #1A2733);
                    overflow: hidden;
                    color: var(--text-primary, #EAECEE);
                }
                
                .data-source-info {
                    background: var(--background-secondary, #1A2733);
                    border: 1px solid var(--border-light, #1A2733);
                    border-radius: var(--radius-md, 8px);
                    margin: var(--spacing-md, 16px);
                    overflow: hidden;
                }
                
                .info-header {
                    background: var(--background-tertiary, #00144A);
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm, 8px);
                    border-bottom: 1px solid var(--border-light, #1A2733);
                }
                
                .info-icon {
                    font-size: 1.2em;
                }
                
                .info-title {
                    font-weight: 600;
                    color: var(--text-primary, #EAECEE);
                }
                
                .info-content {
                    padding: var(--spacing-md, 16px);
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-sm, 8px);
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-xs, 4px) 0;
                }
                
                .info-label {
                    font-size: 0.85em;
                    color: var(--text-secondary, #A9B4BE);
                }
                
                .info-value {
                    font-weight: 500;
                    color: var(--text-primary, #EAECEE);
                    font-size: 0.9em;
                }
                
                .search-container {
                    padding: var(--spacing-md, 16px);
                    border-bottom: 1px solid var(--border-light, #1A2733);
                    background: var(--background-secondary, #1A2733);
                }
                
                .search-box {
                    width: 100%;
                    padding: var(--spacing-sm, 8px);
                    border: 1px solid var(--border-medium, #a9b4be);
                    border-radius: var(--radius-sm, 4px);
                    font-size: 0.9em;
                    transition: border-color var(--transition-fast, 0.15s ease);
                }
                
                .search-box:focus {
                    outline: none;
                    border-color: var(--business-blue, #1B90FF);
                    box-shadow: 0 0 0 2px rgba(27, 144, 255, 0.1);
                }
                
                .categories-container {
                    flex: 1;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: var(--business-grey, #a9b4be) transparent;
                }
                
                .categories-container::-webkit-scrollbar {
                    width: 6px;
                }
                
                .categories-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .categories-container::-webkit-scrollbar-thumb {
                    background: var(--business-grey, #a9b4be);
                    border-radius: 3px;
                }
                
                .category-section {
                    border-bottom: 1px solid var(--border-light, #1A2733);
                }
                
                .category-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    background: var(--background-primary, #12171C);
                    cursor: pointer;
                    user-select: none;
                    transition: background-color var(--transition-fast, 0.15s ease);
                    border-bottom: 1px solid var(--border-light, #1A2733);
                    color: var(--text-primary, #EAECEE);
                }
                
                .category-header:hover {
                    background: var(--background-secondary, #1A2733);
                }
                
                .category-info {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm, 8px);
                }
                
                .category-icon {
                    font-size: 1.1em;
                }
                
                .category-name {
                    font-weight: 500;
                    color: var(--text-primary, #EAECEE);
                }
                
                .category-count {
                    background: var(--business-blue, #1B90FF);
                    color: white;
                    padding: 0.1rem 0.4rem;
                    border-radius: 10px;
                    font-size: 0.75em;
                    font-weight: 500;
                    min-width: 18px;
                    text-align: center;
                }
                
                .category-count.dimensions {
                    background: var(--business-teal, #049f9a);
                    color: white;
                }
                
                .category-count.measures {
                    background: var(--business-orange, #FF8C00);
                    color: white;
                }
                
                .category-count.calculated {
                    background: var(--business-grey, #5b738b);
                    color: white;
                }
                
                .expand-icon {
                    transition: transform var(--transition-normal, 0.2s ease);
                    color: var(--text-secondary, #5b738b);
                    font-size: 0.8em;
                }
                
                .expand-icon.expanded {
                    transform: rotate(180deg);
                }
                
                .field-list {
                    background: var(--background-primary, #12171C);
                    transition: max-height var(--transition-normal, 0.2s ease);
                    overflow: hidden;
                    padding: var(--spacing-xs, 4px);
                }
                
                .field-list.collapsed {
                    max-height: 0;
                }
                
                .field-list.expanded {
                    max-height: 1000px;
                }
                
                .field-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm, 8px);
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    cursor: grab;
                    border-bottom: 1px solid var(--border-light, #1A2733);
                    transition: all var(--transition-fast, 0.15s ease);
                    position: relative;
                    color: white;
                    border-radius: 4px;
                    margin: 2px 0;
                }
                
                .field-item.dimension {
                    background: #89D1FF;
                }
                
                .field-item.measure {
                    background: #FFC933;
                    color: #333;
                }
                
                .field-item:last-child {
                    border-bottom: none;
                }
                
                .field-item.dimension:hover {
                    background: #1B90FF;
                    border-left: 3px solid var(--business-teal, #049f9a);
                    padding-left: calc(var(--spacing-md, 16px) - 3px);
                    transform: translateX(2px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .field-item.measure:hover {
                    background: #E76500;
                    color: white;
                    border-left: 3px solid var(--business-teal, #049f9a);
                    padding-left: calc(var(--spacing-md, 16px) - 3px);
                    transform: translateX(2px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                
                .field-item:active {
                    cursor: grabbing;
                    transform: scale(0.98);
                }
                
                .field-item.dimension:active {
                    background: #0070F2;
                }
                
                .field-item.measure:active {
                    background: #C35500;
                    color: white;
                }
                
                .field-item.dragging {
                    opacity: 0.5;
                    transform: rotate(2deg);
                    z-index: 1000;
                }
                
                .field-icon {
                    flex-shrink: 0;
                    font-size: 1.1em;
                    width: 20px;
                    text-align: center;
                }
                
                .field-info {
                    flex: 1;
                    min-width: 0;
                }
                
                .field-name {
                    font-weight: 500;
                    color: var(--text-primary, #EAECEE);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 0.9em;
                    margin-bottom: 2px;
                }
                
                .field-details {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs, 4px);
                    flex-wrap: wrap;
                }
                
                .field-type {
                    font-size: 0.75em;
                    padding: 0.1rem 0.3rem;
                    border-radius: 3px;
                    font-weight: 500;
                }
                
                .field-item.dimension .field-type {
                    color: #0070F2;
                    background: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                .field-item.measure .field-type {
                    color: white;
                    background: #333;
                    border: 1px solid rgba(0, 0, 0, 0.3);
                }
                
                .field-cardinality {
                    font-size: 0.75em;
                    color: white;
                    padding: 0.1rem 0.3rem;
                    border-radius: 3px;
                }
                
                .field-item.dimension .field-cardinality {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                .field-item.measure .field-cardinality {
                    background: rgba(0, 0, 0, 0.2);
                    color: #333;
                    border: 1px solid rgba(0, 0, 0, 0.3);
                }
                
                .field-source {
                    font-size: 0.75em;
                    color: rgba(255, 255, 255, 0.8);
                    font-style: italic;
                }
                
                .no-results {
                    text-align: center;
                    padding: var(--spacing-lg, 24px);
                    color: var(--text-secondary, #5b738b);
                    font-style: italic;
                }
                
                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-xl, 32px);
                    color: var(--text-secondary, #5b738b);
                    height: 200px;
                }
                
                .loading-icon {
                    font-size: 2em;
                    margin-bottom: var(--spacing-md, 16px);
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                
                .drag-tooltip {
                    position: absolute;
                    background: var(--text-primary, #1a2733);
                    color: white;
                    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
                    border-radius: var(--radius-sm, 4px);
                    font-size: 0.8em;
                    white-space: nowrap;
                    z-index: 1000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity var(--transition-fast, 0.15s ease);
                    left: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    margin-left: var(--spacing-sm, 8px);
                }
                
                .field-item:hover .drag-tooltip {
                    opacity: 1;
                }
                
                .summary-info {
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    background: var(--background-secondary, #1A2733);
                    border-bottom: 1px solid var(--border-light, #1A2733);
                    font-size: 0.85em;
                    color: var(--text-primary, #EAECEE);
                    text-align: center;
                    font-weight: 500;
                    border-top: 2px solid var(--business-blue, #1B90FF);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--spacing-xs, 4px);
                }
                
                .summary-badge {
                    padding: 0.2rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.8em;
                    font-weight: 600;
                    color: white;
                }
                
                .summary-badge.dimensions {
                    background: var(--business-teal, #049f9a);
                }
                
                .summary-badge.measures {
                    background: var(--business-orange, #FF8C00);
                }
                
                .summary-separator {
                    color: var(--text-secondary, #5b738b);
                    font-weight: 300;
                    margin: 0 var(--spacing-xs, 4px);
                }
            </style>
        `;

        const template = `
            ${style}
            <div class="dictionary-container">
                ${this.renderContent()}
            </div>
        `;

        this.shadowRoot.innerHTML = template;
        this.bindEvents();
    }

    renderContent() {
        if (!this.dataModel || this.fields.length === 0) {
            return this.renderLoadingState();
        }

        const activeDataSource = this.dataModel.getActiveDataSource();

        return `
            ${this.renderDataSourceInfo(activeDataSource)}
            
            <div class="search-container">
                <input type="text" 
                       class="search-box" 
                       placeholder="Search fields..."
                       value="${this.searchTerm}">
            </div>
            
            ${this.renderSummary()}
            
            <div class="categories-container">
                ${this.renderDimensionsSection()}
                ${this.renderMeasuresSection()}
                ${this.renderCalculatedSection()}
            </div>
        `;
    }

    renderLoadingState() {
        return `
            <div class="loading-state">
                <div class="loading-icon">📊</div>
                <div>No data source selected</div>
                <div style="font-size: 0.8em; margin-top: 8px;">
                    Select a dataset from the dropdown above
                </div>
            </div>
        `;
    }

    renderDataSourceInfo(dataSource) {
        if (!dataSource) {
            return `
                <div class="data-source-info">
                    <div class="info-header">
                        <span class="info-icon">ℹ️</span>
                        <span class="info-title">No Data Source</span>
                    </div>
                    <div class="info-content">
                        <p>Select a dataset from the dropdown above to view metadata and available fields.</p>
                    </div>
                </div>
            `;
        }

        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const formatDate = (date) => {
            return new Date(date).toLocaleString();
        };

        return `
            <div class="data-source-info">
                <div class="info-header">
                    <span class="info-icon">📊</span>
                    <span class="info-title">${dataSource.name}</span>
                </div>
                <div class="info-content">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Records:</span>
                            <span class="info-value">${dataSource.recordCount.toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Columns:</span>
                            <span class="info-value">${dataSource.metadata?.columns || 0}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Dimensions:</span>
                            <span class="info-value">${dataSource.metadata?.dimensions || 0}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Measures:</span>
                            <span class="info-value">${dataSource.metadata?.measures || 0}</span>
                        </div>
                        ${dataSource.size ? `
                        <div class="info-item">
                            <span class="info-label">Size:</span>
                            <span class="info-value">${formatFileSize(dataSource.size)}</span>
                        </div>
                        ` : ''}
                        ${dataSource.loadedAt ? `
                        <div class="info-item">
                            <span class="info-label">Loaded:</span>
                            <span class="info-value">${formatDate(dataSource.loadedAt)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderSummary() {
        const dimensions = this.getFieldsByCategory('DIMENSION');
        const measures = this.getFieldsByCategory('MEASURE');
        
        return `
            <div class="summary-info">
                <span class="summary-badge dimensions">${dimensions.length} dimensions</span>
                <span class="summary-separator">•</span>
                <span class="summary-badge measures">${measures.length} measures</span>
            </div>
        `;
    }

    renderDimensionsSection() {
        const dimensions = this.getFieldsByCategory('DIMENSION');
        const isExpanded = this.expandedSections.has('dimensions');

        return `
            <div class="category-section">
                <div class="category-header" data-category="dimensions">
                    <div class="category-info">
                        <span class="category-icon">🏷️</span>
                        <span class="category-name">Dimensions</span>
                        <span class="category-count dimensions">${dimensions.length}</span>
                    </div>
                    <span class="expand-icon ${isExpanded ? 'expanded' : ''}">▲</span>
                </div>
                <div class="field-list ${isExpanded ? 'expanded' : 'collapsed'}">
                    ${this.renderFields(dimensions)}
                </div>
            </div>
        `;
    }

    renderMeasuresSection() {
        const measures = this.getFieldsByCategory('MEASURE');
        const isExpanded = this.expandedSections.has('measures');

        return `
            <div class="category-section">
                <div class="category-header" data-category="measures">
                    <div class="category-info">
                        <span class="category-icon">📊</span>
                        <span class="category-name">Measures</span>
                        <span class="category-count measures">${measures.length}</span>
                    </div>
                    <span class="expand-icon ${isExpanded ? 'expanded' : ''}">▲</span>
                </div>
                <div class="field-list ${isExpanded ? 'expanded' : 'collapsed'}">
                    ${this.renderFields(measures)}
                </div>
            </div>
        `;
    }

    renderCalculatedSection() {
        const isExpanded = this.expandedSections.has('calculated');

        return `
            <div class="category-section">
                <div class="category-header" data-category="calculated">
                    <div class="category-info">
                        <span class="category-icon">🧮</span>
                        <span class="category-name">Calculated Fields</span>
                        <span class="category-count calculated">0</span>
                    </div>
                    <span class="expand-icon ${isExpanded ? 'expanded' : ''}">▲</span>
                </div>
                <div class="field-list ${isExpanded ? 'expanded' : 'collapsed'}">
                    <div class="no-results">No calculated fields available</div>
                </div>
            </div>
        `;
    }

    renderFields(fields) {
        if (fields.length === 0) {
            return `<div class="no-results">No fields found</div>`;
        }

        return fields.map(field => `
            <div class="field-item ${field.category === 'DIMENSION' ? 'dimension' : 'measure'}" 
                 draggable="true"
                 data-field-id="${field.id}"
                 data-field-name="${field.name}"
                 data-field-display-name="${field.displayName}"
                 data-field-category="${field.category}"
                 data-field-type="${field.dataType}"
                 data-field-cardinality="${field.cardinality}"
                 data-field-source="${field.source}">
                <span class="field-icon">${field.category === 'DIMENSION' ? '🏷️' : '📊'}</span>
                <div class="field-info">
                    <div class="field-name" title="${field.displayName}">${field.displayName}</div>
                    <div class="field-details">
                        <span class="field-type">${field.dataType}</span>
                        <span class="field-cardinality">${field.cardinality} unique</span>
                        <span class="field-source">${field.source}</span>
                    </div>
                </div>
                <div class="drag-tooltip">Drag to Data Assignment</div>
            </div>
        `).join('');
    }

    getFieldsByCategory(category) {
        return this.filteredFields.filter(field => field.category === category);
    }

    bindEvents() {
        const container = this.shadowRoot.querySelector('.dictionary-container');
        if (!container) return;

        // Search functionality
        const searchBox = this.shadowRoot.querySelector('.search-box');
        if (searchBox) {
            searchBox.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.applyFilters();
                this.render();
            });
        }

        // Category expand/collapse
        container.addEventListener('click', (e) => {
            const header = e.target.closest('.category-header');
            if (header) {
                const category = header.dataset.category;
                this.toggleCategory(category);
            }
        });

        // Drag & drop functionality
        container.addEventListener('dragstart', this.handleDragStart.bind(this));
        container.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    toggleCategory(category) {
        if (this.expandedSections.has(category)) {
            this.expandedSections.delete(category);
        } else {
            this.expandedSections.add(category);
        }
        this.render();
    }

    handleDragStart(e) {
        const fieldItem = e.target.closest('.field-item');
        if (!fieldItem) return;

        const fieldData = {
            id: fieldItem.dataset.fieldId,
            name: fieldItem.dataset.fieldName,
            displayName: fieldItem.dataset.fieldDisplayName,
            category: fieldItem.dataset.fieldCategory,
            dataType: fieldItem.dataset.fieldType,
            cardinality: fieldItem.dataset.fieldCardinality,
            source: fieldItem.dataset.fieldSource,
            type: 'field'  // Ajout du type pour identification
        };

        e.dataTransfer.setData('application/json', JSON.stringify(fieldData));
        e.dataTransfer.effectAllowed = 'copy';

        // Visual feedback
        fieldItem.classList.add('dragging');

        // Dispatch custom event for cross-panel communication
        this.dispatchEvent(new CustomEvent('fieldDragStart', {
            detail: fieldData,
            bubbles: true,
            composed: true
        }));

        console.log('📚 Field drag started:', fieldData.displayName, 'Type:', fieldData.type);
    }

    handleDragEnd(e) {
        const fieldItem = e.target.closest('.field-item');
        if (fieldItem) {
            fieldItem.classList.remove('dragging');
        }

        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('fieldDragEnd', {
            bubbles: true,
            composed: true
        }));
    }

    updateLoadingState(isLoading) {
        if (isLoading) {
            this.fields = [];
            this.filteredFields = [];
        }
        this.render();
    }

    // Public API
    refresh() {
        if (this.dataModel) {
            this.handleFieldsUpdated(this.dataModel.getFields());
        }
    }

    getFieldById(fieldId) {
        return this.fields.find(field => field.id === fieldId);
    }

    getFieldByName(fieldName) {
        return this.fields.find(field => field.name === fieldName);
    }
}

// Register the custom element
customElements.define('available-objects-panel', AvailableObjectsPanel);

// Export for modules
window.AvailableObjectsPanel = AvailableObjectsPanel;