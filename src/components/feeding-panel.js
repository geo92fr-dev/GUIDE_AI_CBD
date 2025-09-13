/**
 * ⚙️ Feeding Panel - WebI Data Assignment Interface
 * 
 * RIGHT PANEL 1 - According to WIDGET_TECH_SPEC.md:
 * - WebI-compatible interface for widget configuration
 * - Drop zones for DIMENSIONS/MEASURES
 * - Widget property configuration
 * - Real-time preview of data assignments
 */

class FeedingPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // State
        this.selectedWidget = null;
        this.assignments = {
            dimensions: [],
            measures: [],
            filters: []
        };
        this.dragDropManager = null;
        
        // Bind methods
        this.handleFieldDrop = this.handleFieldDrop.bind(this);
        this.handleGlobalEvent = this.handleGlobalEvent.bind(this);
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        
        // Sélectionner automatiquement le Bar Chart par défaut
        this.selectedWidget = 'bar-chart';
        
        // Connect to global drag & drop system
        if (window.WidgetPlatform) {
            this.dragDropManager = window.WidgetPlatform.getDragDropManager();
            this.dragDropManager.onDrop(this.handleFieldDrop);
        }
    }

    render() {
        const style = `
            <style>
                :host {
                    display: block;
                    height: 100%;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }
                
                .feeding-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--background-primary, #12171C);
                    border-left: 1px solid var(--border-light, #1A2733);
                    overflow: hidden;
                    color: var(--text-primary, #EAECEE);
                }
                
                .widget-selection {
                    padding: var(--spacing-md, 16px);
                    background: var(--background-secondary, #1A2733);
                    border-bottom: 1px solid var(--border-light, #1A2733);
                }
                
                .widget-selector {
                    width: 100%;
                    padding: var(--spacing-sm, 8px);
                    border: 1px solid var(--border-medium, #475E75);
                    border-radius: var(--radius-sm, 4px);
                    background: var(--background-primary, #12171C);
                    color: var(--text-primary, #EAECEE);
                    font-size: 0.9em;
                    transition: border-color var(--transition-fast, 0.15s ease);
                }
                
                .widget-selector:focus {
                    outline: none;
                    border-color: var(--business-teal, #049f9a);
                    box-shadow: 0 0 0 2px rgba(4, 159, 154, 0.1);
                }
                
                .assignments-container {
                    flex: 1;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: var(--business-grey, #a9b4be) transparent;
                }
                
                .assignments-container::-webkit-scrollbar {
                    width: 6px;
                }
                
                .assignments-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .assignments-container::-webkit-scrollbar-thumb {
                    background: var(--business-grey, #a9b4be);
                    border-radius: 3px;
                }
                
                .assignment-section {
                    border-bottom: 1px solid var(--border-ultra-light, #f0f1f2);
                }
                
                .section-header {
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    background: var(--business-indigo-light, #ddd5ff);
                    font-weight: 500;
                    color: var(--business-indigo, #7858ff);
                    font-size: 0.85em;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid var(--border-light, #eaecee);
                }
                
                .drop-zone {
                    min-height: 80px;
                    padding: var(--spacing-md, 16px);
                    background: white;
                    border: 2px dashed var(--border-medium, #a9b4be);
                    margin: var(--spacing-sm, 8px);
                    border-radius: var(--radius-sm, 4px);
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm, 8px);
                    transition: all var(--transition-fast, 0.15s ease);
                    position: relative;
                }
                
                .drop-zone.dimensions {
                    border-color: var(--business-blue, #1B90FF);
                    background: var(--background-tertiary, #00144A);
                }
                
                .drop-zone.measures {
                    border-color: var(--business-mango, #E76500);
                    background: var(--background-tertiary, #00144A);
                }
                
                .drop-zone.filters {
                    border-color: var(--business-indigo, #7858FF);
                    background: var(--background-tertiary, #00144A);
                }
                
                .drop-zone.drag-over {
                    border-style: solid;
                    background: var(--business-teal, #049F9A);
                    border-color: var(--business-teal, #049f9a);
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(4, 159, 154, 0.4);
                }
                
                .drop-zone-placeholder {
                    text-align: center;
                    color: var(--text-secondary, #A9B4BE);
                    font-style: italic;
                    font-size: 0.9em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: var(--spacing-xs, 4px);
                }
                
                .drop-zone-icon {
                    font-size: 1.5em;
                    opacity: 0.5;
                }
                
                .assigned-field {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-sm, 8px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: var(--radius-sm, 4px);
                    transition: all var(--transition-fast, 0.15s ease);
                    animation: slideIn 0.3s ease-out;
                    margin: 2px 0;
                }
                
                .assigned-field.dimension {
                    background: #89D1FF;
                    color: white;
                }
                
                .assigned-field.measure {
                    background: #FFC933;
                    color: #333;
                }
                
                .assigned-field.dimension:hover {
                    border-color: white;
                    background: #1B90FF;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(137, 209, 255, 0.3);
                }
                
                .assigned-field.measure:hover {
                    border-color: #333;
                    background: #E76500;
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(255, 201, 51, 0.3);
                }
                
                .field-info {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm, 8px);
                    flex: 1;
                }
                
                .field-icon {
                    font-size: 1.1em;
                    flex-shrink: 0;
                }
                
                .field-details {
                    flex: 1;
                    min-width: 0;
                }
                
                .field-name {
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 0.9em;
                    margin-bottom: 2px;
                }
                
                .assigned-field.dimension .field-name {
                    color: white;
                }
                
                .assigned-field.measure .field-name {
                    color: #333;
                }
                
                .field-meta {
                    font-size: 0.75em;
                }
                
                .assigned-field.dimension .field-meta {
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .assigned-field.measure .field-meta {
                    color: rgba(0, 0, 0, 0.6);
                }
                
                .remove-field {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: var(--spacing-xs, 4px);
                    border-radius: var(--radius-sm, 4px);
                    font-size: 0.9em;
                    opacity: 0.7;
                    transition: all var(--transition-fast, 0.15s ease);
                }
                
                .assigned-field.dimension .remove-field {
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .assigned-field.measure .remove-field {
                    color: rgba(0, 0, 0, 0.6);
                }
                
                .remove-field:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                    opacity: 1;
                }
                
                .remove-field:hover {
                    opacity: 1;
                    background: var(--business-red-light, #f8d7d7);
                    transform: scale(1.1);
                }
                
                .no-widget-selected {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-xl, 32px);
                    color: var(--text-secondary, #5b738b);
                    text-align: center;
                    height: 200px;
                }
                
                .no-widget-icon {
                    font-size: 3em;
                    margin-bottom: var(--spacing-md, 16px);
                    opacity: 0.3;
                }
                
                .assignment-summary {
                    padding: var(--spacing-md, 16px);
                    background: var(--business-teal-ultra-light, #e6f4f4);
                    border-top: 1px solid var(--border-light, #eaecee);
                    font-size: 0.85em;
                    color: var(--text-secondary, #5b738b);
                }
                
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: var(--spacing-xs, 4px);
                }
                
                .summary-item:last-child {
                    margin-bottom: 0;
                    font-weight: 500;
                    color: var(--text-primary, #1a2733);
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .config-actions {
                    padding: var(--spacing-md, 16px);
                    background: var(--background-secondary, #f5f6f7);
                    border-top: 1px solid var(--border-light, #eaecee);
                    display: flex;
                    gap: var(--spacing-sm, 8px);
                }
                
                .btn-config {
                    flex: 1;
                    padding: var(--spacing-sm, 8px);
                    border: 1px solid var(--business-teal, #049f9a);
                    background: white;
                    color: var(--business-teal, #049f9a);
                    border-radius: var(--radius-sm, 4px);
                    font-size: 0.85em;
                    cursor: pointer;
                    transition: all var(--transition-fast, 0.15s ease);
                }
                
                .btn-config:hover {
                    background: var(--business-teal, #049f9a);
                    color: white;
                    transform: translateY(-1px);
                }
                
                .btn-config.primary {
                    background: var(--business-teal, #049f9a);
                    color: white;
                }
                
                .btn-config.primary:hover {
                    background: var(--business-teal-dark, #038077);
                }
            </style>
        `;

        const template = `
            ${style}
            <div class="feeding-container">
                ${this.renderContent()}
            </div>
        `;

        this.shadowRoot.innerHTML = template;
        this.bindEvents();
    }

    renderContent() {
        if (!this.selectedWidget) {
            return this.renderNoWidgetSelected();
        }

        return `
            <div class="widget-selection">
                <select class="widget-selector" id="widget-selector">
                    <option value="bar-chart" ${this.selectedWidget === 'bar-chart' ? 'selected' : ''}>📊 Bar Chart</option>
                    <option value="line-chart">📈 Line Chart (Coming Soon)</option>
                    <option value="pie-chart">🥧 Pie Chart (Coming Soon)</option>
                    <option value="table">📋 Table (Coming Soon)</option>
                </select>
            </div>
            
            <div class="assignments-container">
                ${this.renderDimensionsSection()}
                ${this.renderMeasuresSection()}
                ${this.renderFiltersSection()}
            </div>
            
            ${this.renderAssignmentSummary()}
            ${this.renderConfigActions()}
        `;
    }

    renderNoWidgetSelected() {
        return `
            <div class="no-widget-selected">
                <div class="no-widget-icon">⚙️</div>
                <div>No widget selected</div>
                <div style="font-size: 0.8em; margin-top: 8px; opacity: 0.7;">
                    Select a widget from the Widget Library to configure data assignments
                </div>
            </div>
        `;
    }

    renderDimensionsSection() {
        return `
            <div class="assignment-section">
                <div class="section-header">🏷️ Dimensions</div>
                <div class="drop-zone dimensions" data-drop-zone="dimensions">
                    ${this.assignments.dimensions.length === 0 ? 
                        `<div class="drop-zone-placeholder">
                            <span class="drop-zone-icon">🏷️</span>
                            <span>Drop dimensions here (categories, labels)</span>
                        </div>` :
                        this.assignments.dimensions.map(field => this.renderAssignedField(field)).join('')
                    }
                </div>
            </div>
        `;
    }

    renderMeasuresSection() {
        return `
            <div class="assignment-section">
                <div class="section-header">📊 Measures</div>
                <div class="drop-zone measures" data-drop-zone="measures">
                    ${this.assignments.measures.length === 0 ? 
                        `<div class="drop-zone-placeholder">
                            <span class="drop-zone-icon">📊</span>
                            <span>Drop measures here (values, metrics)</span>
                        </div>` :
                        this.assignments.measures.map(field => this.renderAssignedField(field)).join('')
                    }
                </div>
            </div>
        `;
    }

    renderFiltersSection() {
        return `
            <div class="assignment-section">
                <div class="section-header">🔍 Filters</div>
                <div class="drop-zone filters" data-drop-zone="filters">
                    ${this.assignments.filters.length === 0 ? 
                        `<div class="drop-zone-placeholder">
                            <span class="drop-zone-icon">🔍</span>
                            <span>Drop fields to filter data (optional)</span>
                        </div>` :
                        this.assignments.filters.map(field => this.renderAssignedField(field)).join('')
                    }
                </div>
            </div>
        `;
    }

    renderAssignedField(field) {
        return `
            <div class="assigned-field ${field.category === 'DIMENSION' ? 'dimension' : 'measure'}" data-field-id="${field.id}">
                <div class="field-info">
                    <span class="field-icon">${field.category === 'DIMENSION' ? '🏷️' : '📊'}</span>
                    <div class="field-details">
                        <div class="field-name" title="${field.displayName}">${field.displayName}</div>
                        <div class="field-meta">${field.dataType} • ${field.source}</div>
                    </div>
                </div>
                <button class="remove-field" data-field-id="${field.id}" title="Remove field">
                    ✕
                </button>
            </div>
        `;
    }

    renderAssignmentSummary() {
        return `
            <div class="assignment-summary">
                <div class="summary-item">
                    <span>Dimensions:</span>
                    <span>${this.assignments.dimensions.length}</span>
                </div>
                <div class="summary-item">
                    <span>Measures:</span>
                    <span>${this.assignments.measures.length}</span>
                </div>
                <div class="summary-item">
                    <span>Filters:</span>
                    <span>${this.assignments.filters.length}</span>
                </div>
                <div class="summary-item">
                    <span>Total Assignments:</span>
                    <span>${this.getTotalAssignments()}</span>
                </div>
            </div>
        `;
    }

    renderConfigActions() {
        const canCreateWidget = this.assignments.dimensions.length > 0 && this.assignments.measures.length > 0;
        
        return `
            <div class="config-actions">
                <button class="btn-config clear-all-btn">
                    🗑️ Clear All
                </button>
                <button class="btn-config create-widget-btn ${canCreateWidget ? 'primary' : ''}" 
                        ${canCreateWidget ? '' : 'disabled'}>
                    ${canCreateWidget ? '✨ Create Widget' : '⏳ Need Data'}
                </button>
            </div>
        `;
    }

    bindEvents() {
        const container = this.shadowRoot.querySelector('.feeding-container');
        if (!container) return;

        // Widget selector change
        const widgetSelector = this.shadowRoot.querySelector('#widget-selector');
        if (widgetSelector) {
            widgetSelector.addEventListener('change', (e) => {
                this.selectedWidget = e.target.value;
                console.log('⚙️ Widget selected:', this.selectedWidget);
            });
        }

        // Remove field buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-field')) {
                const fieldId = e.target.dataset.fieldId;
                if (fieldId) {
                    this.removeField(fieldId);
                }
            }
            
            // Clear all button
            if (e.target.classList.contains('clear-all-btn')) {
                this.clearAssignments();
            }
            
            // Create widget button
            if (e.target.classList.contains('create-widget-btn') && !e.target.disabled) {
                this.createWidget();
            }
        });

        // Configure drop zones
        const dropZones = container.querySelectorAll('.drop-zone');
        dropZones.forEach(dropZone => {
            // Configure as drop zone for drag manager
            if (this.dragDropManager) {
                this.dragDropManager.registerDropZone(dropZone, dropZone.dataset.dropZone);
            }
            
            // Set up native drag & drop events
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                dropZone.classList.add('drag-over');
            });
            
            dropZone.addEventListener('dragleave', (e) => {
                if (!dropZone.contains(e.relatedTarget)) {
                    dropZone.classList.remove('drag-over');
                }
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                
                try {
                    const fieldData = JSON.parse(e.dataTransfer.getData('application/json'));
                    this.handleFieldDrop(fieldData, dropZone, dropZone.dataset.dropZone);
                } catch (error) {
                    console.warn('⚠️ Invalid drop data:', error);
                }
            });
        });
    }

    handleFieldDrop(fieldData, dropZone, dropType) {
        // Valider que c'est une drop zone de ce composant
        if (!this.shadowRoot.contains(dropZone)) return;

        console.log('⚙️ Feeding Panel: Field dropped', fieldData.name, 'on', dropType);

        // Valider les règles de drop
        if (dropType === 'dimensions' && fieldData.category !== 'DIMENSION') {
            this.showError('Only dimensions can be dropped in the dimensions zone');
            return;
        }

        if (dropType === 'measures' && fieldData.category !== 'MEASURE') {
            this.showError('Only measures can be dropped in the measures zone');
            return;
        }

        // Éviter les doublons
        const targetArray = this.assignments[dropType];
        if (targetArray.some(field => field.id === fieldData.id)) {
            this.showError('Field already assigned');
            return;
        }

        // Ajouter le champ
        targetArray.push(fieldData);
        this.render();

        // Déclencher l'événement de changement
        this.dispatchEvent(new CustomEvent('assignmentChanged', {
            detail: {
                fieldData,
                dropType,
                assignments: this.assignments
            },
            bubbles: true,
            composed: true
        }));

        console.log('✅ Field assigned successfully');
    }

    showError(message) {
        console.warn('⚠️ Feeding Panel error:', message);
        // Réutiliser le système de notification du DragDropManager
        if (this.dragDropManager) {
            this.dragDropManager.showDropError(message);
        }
    }

    // Public API methods
    selectWidget(widgetType) {
        this.selectedWidget = widgetType;
        this.render();
        console.log('⚙️ Widget selected programmatically:', widgetType);
    }

    removeField(fieldId) {
        // Retirer le champ de toutes les catégories
        ['dimensions', 'measures', 'filters'].forEach(category => {
            this.assignments[category] = this.assignments[category].filter(
                field => field.id !== fieldId
            );
        });
        
        this.render();
        
        this.dispatchEvent(new CustomEvent('assignmentChanged', {
            detail: {
                action: 'remove',
                fieldId,
                assignments: this.assignments
            },
            bubbles: true,
            composed: true
        }));
        
        console.log('🗑️ Field removed:', fieldId);
    }

    clearAssignments() {
        this.assignments = {
            dimensions: [],
            measures: [],
            filters: []
        };
        
        this.render();
        
        this.dispatchEvent(new CustomEvent('assignmentChanged', {
            detail: {
                action: 'clear',
                assignments: this.assignments
            },
            bubbles: true,
            composed: true
        }));
        
        console.log('🗑️ All assignments cleared');
    }

    createWidget() {
        if (this.assignments.dimensions.length === 0 || this.assignments.measures.length === 0) {
            this.showError('At least one dimension and one measure are required');
            return;
        }

        const widgetConfig = {
            type: this.selectedWidget,
            dimensions: this.assignments.dimensions,
            measures: this.assignments.measures,
            filters: this.assignments.filters,
            id: 'widget_' + Date.now()
        };

        this.dispatchEvent(new CustomEvent('createWidget', {
            detail: widgetConfig,
            bubbles: true,
            composed: true
        }));

        console.log('✨ Widget creation requested:', widgetConfig);
    }

    getTotalAssignments() {
        return this.assignments.dimensions.length + 
               this.assignments.measures.length + 
               this.assignments.filters.length;
    }

    getAssignments() {
        return { ...this.assignments };
    }

    // Update fields when data source changes (compatibility with data loading system)
    updateFields(fields) {
        console.log('⚙️ Feeding Panel: updateFields called with', fields?.length || 0, 'fields');
        // For now, just log the update - the feeding panel doesn't need to display all fields
        // It receives fields via drag & drop from the Available Objects panel
        // This method exists for compatibility with the notification system
    }

    // Global event handler for cross-component communication
    handleGlobalEvent(eventType, data) {
        switch (eventType) {
            case 'widgetSelected':
                this.selectWidget(data.type);
                break;
            case 'dataSourceChanged':
                // Reset assignments when data source changes
                this.clearAssignments();
                break;
        }
    }
}

// Register the custom element
customElements.define('feeding-panel', FeedingPanel);

// Export for modules
window.FeedingPanel = FeedingPanel;