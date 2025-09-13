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
        
        // Subscribe to data model changes
        if (this.dataModel) {
            this.dataModel.on('dataSourceChanged', this.handleDataSourceChanged);
            this.dataModel.on('fieldsUpdated', this.handleFieldsUpdated);
            this.handleFieldsUpdated(this.dataModel.getFields());
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
                    background: var(--background-secondary, #1A2733);
                    cursor: pointer;
                    user-select: none;
                    transition: background-color var(--transition-fast, 0.15s ease);
                    border-bottom: 1px solid var(--border-light, #1A2733);
                    color: var(--text-primary, #EAECEE);
                }
                
                .category-header:hover {
                    background: var(--background-tertiary, #00144A);
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
                
                .expand-icon {
                    transition: transform var(--transition-normal, 0.2s ease);
                    color: var(--text-secondary, #5b738b);
                    font-size: 0.8em;
                }
                
                .expand-icon.expanded {
                    transform: rotate(180deg);
                }
                
                .field-list {
                    background: white;
                    transition: max-height var(--transition-normal, 0.2s ease);
                    overflow: hidden;
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
                    border-bottom: 1px solid var(--border-ultra-light, #f0f1f2);
                    transition: all var(--transition-fast, 0.15s ease);
                    position: relative;
                    background: white;
                }
                
                .field-item:last-child {
                    border-bottom: none;
                }
                
                .field-item:hover {
                    background: var(--business-teal-ultra-light, #e6f4f4);
                    border-left: 3px solid var(--business-teal, #049f9a);
                    padding-left: calc(var(--spacing-md, 16px) - 3px);
                    transform: translateX(2px);
                }
                
                .field-item:active {
                    cursor: grabbing;
                    transform: scale(0.98);
                    background: var(--background-tertiary, #00144A);
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
                    color: var(--text-primary, #EAECEE);
                    background: var(--background-secondary, #1A2733);
                    padding: 0.1rem 0.3rem;
                    border-radius: 3px;
                    border: 1px solid var(--border-light, #1A2733);
                }
                
                .field-cardinality {
                    font-size: 0.75em;
                    color: var(--business-indigo, #7858ff);
                    background: var(--business-indigo-light, #ddd5ff);
                    padding: 0.1rem 0.3rem;
                    border-radius: 3px;
                }
                
                .field-source {
                    font-size: 0.75em;
                    color: var(--business-teal, #049f9a);
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
                    background: var(--business-blue-ultra-light, #f0f8ff);
                    border-bottom: 1px solid var(--border-light, #eaecee);
                    font-size: 0.8em;
                    color: var(--text-secondary, #5b738b);
                    text-align: center;
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

        return `
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
                <div>No data source loaded</div>
                <div style="font-size: 0.8em; margin-top: 8px;">
                    Use the 📤 button to load CSV data
                </div>
            </div>
        `;
    }

    renderSummary() {
        const dimensions = this.getFieldsByCategory('DIMENSION');
        const measures = this.getFieldsByCategory('MEASURE');
        
        return `
            <div class="summary-info">
                ${dimensions.length} dimensions • ${measures.length} measures
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
                        <span class="category-count">${dimensions.length}</span>
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
                        <span class="category-count">${measures.length}</span>
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
                        <span class="category-count">0</span>
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
            <div class="field-item" 
                 draggable="true"
                 data-field-id="${field.id}"
                 data-field-name="${field.name}"
                 data-field-category="${field.category}"
                 data-field-type="${field.dataType}">
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
            category: fieldItem.dataset.fieldCategory,
            dataType: fieldItem.dataset.fieldType,
            source: 'Available Objects'
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

        console.log('📚 Drag started:', fieldData.name);
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