/**
 * 🧩 Widget Library - LEFT PANEL
 * 
 * Component for widget selection and management according to WIDGET_TECH_SPEC.md:
 * - Available widget types with previews
 * - Widget selection for configuration
 * - WebI-compatible interface
 */

class WidgetLibrary extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // State
        this.selectedWidget = null;
        this.availableWidgets = [
            {
                id: 'bar-chart',
                name: 'Bar Chart',
                icon: '📊',
                description: 'Compare values across categories',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 6, height: 4 }, // Taille recommandée pour les graphiques
                status: 'available'
            },
            {
                id: 'line-chart',
                name: 'Line Chart',
                icon: '📈',
                description: 'Show trends over time',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 8, height: 4 }, // Plus large pour les tendances temporelles
                status: 'coming-soon'
            },
            {
                id: 'pie-chart',
                name: 'Pie Chart',
                icon: '🥧',
                description: 'Display proportions',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 4, height: 4 }, // Format carré pour les camemberts
                status: 'coming-soon'
            },
            {
                id: 'table',
                name: 'Table',
                icon: '📋',
                description: 'Detailed data view',
                requirements: { dimensions: 0, measures: 0 },
                size: { width: 12, height: 6 }, // Pleine largeur pour les tableaux
                status: 'coming-soon'
            }
        ];
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const style = `
            <style>
                :host {
                    display: block;
                    height: 100%;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }
                
                .library-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--background-primary, #12171C);
                    border-right: 1px solid var(--border-light, #1A2733);
                    overflow: hidden;
                    color: var(--text-primary, #EAECEE);
                }
                
                .widgets-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: var(--spacing-sm, 8px);
                    scrollbar-width: thin;
                    scrollbar-color: var(--business-grey, #a9b4be) transparent;
                }
                
                .widgets-container::-webkit-scrollbar {
                    width: 6px;
                }
                
                .widgets-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .widgets-container::-webkit-scrollbar-thumb {
                    background: var(--business-grey, #a9b4be);
                    border-radius: 3px;
                }
                
                .widget-item {
                    display: flex;
                    flex-direction: column;
                    padding: var(--spacing-md, 16px);
                    margin-bottom: var(--spacing-sm, 8px);
                    background: var(--background-secondary, #1A2733);
                    border: 2px solid var(--border-light, #1A2733);
                    border-radius: var(--radius-md, 8px);
                    cursor: pointer;
                    transition: all var(--transition-fast, 0.15s ease);
                    position: relative;
                    color: var(--text-primary, #EAECEE);
                }
                
                .widget-item:hover {
                    border-color: var(--business-blue, #1B90FF);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(27, 144, 255, 0.3);
                    background: var(--background-tertiary, #00144A);
                }
                
                .widget-item.selected {
                    border-color: var(--business-blue, #1B90FF);
                    background: var(--background-tertiary, #00144A);
                    box-shadow: 0 2px 8px rgba(27, 144, 255, 0.4);
                }
                
                .widget-item.disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    background: var(--background-primary, #12171C);
                }
                
                .widget-item.disabled:hover {
                    transform: none;
                    box-shadow: none;
                    border-color: var(--border-light, #1A2733);
                }
                
                .widget-item[draggable="true"] {
                    cursor: grab;
                }
                
                .widget-item.dragging {
                    opacity: 0.5;
                    transform: rotate(2deg);
                    z-index: 1000;
                }
                
                .widget-item:active {
                    cursor: grabbing;
                }
                
                .widget-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm, 8px);
                    margin-bottom: var(--spacing-sm, 8px);
                }
                
                .widget-icon {
                    font-size: 2em;
                    flex-shrink: 0;
                }
                
                .widget-info {
                    flex: 1;
                }
                
                .widget-name {
                    font-weight: 600;
                    color: var(--text-primary, #EAECEE);
                    font-size: 1em;
                    margin-bottom: 2px;
                }
                
                .widget-status {
                    font-size: 0.75em;
                    padding: 0.1rem 0.4rem;
                    border-radius: 10px;
                    font-weight: 500;
                }
                
                .widget-status.available {
                    background: var(--business-green, #36A41D);
                    color: #FFFFFF;
                }
                
                .widget-status.coming-soon {
                    background: var(--business-mango, #E76500);
                    color: #FFFFFF;
                }
                
                .widget-description {
                    color: var(--text-secondary, #A9B4BE);
                    font-size: 0.85em;
                    line-height: 1.4;
                    margin-bottom: var(--spacing-sm, 8px);
                }
                
                .widget-requirements {
                    display: flex;
                    gap: var(--spacing-xs, 4px);
                    flex-wrap: wrap;
                }
                
                .requirement-badge {
                    font-size: 0.7em;
                    padding: 0.1rem 0.3rem;
                    border-radius: 3px;
                    background: var(--business-blue, #1B90FF);
                    color: #FFFFFF;
                    border: 1px solid var(--business-blue, #1B90FF);
                }
                
                .selection-indicator {
                    position: absolute;
                    top: var(--spacing-sm, 8px);
                    right: var(--spacing-sm, 8px);
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--business-blue, #1B90FF);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8em;
                    opacity: 0;
                    transition: opacity var(--transition-fast, 0.15s ease);
                }
                
                .widget-item.selected .selection-indicator {
                    opacity: 1;
                }
                
                .widget-actions {
                    margin-top: var(--spacing-sm, 8px);
                    padding-top: var(--spacing-sm, 8px);
                    border-top: 1px solid var(--border-light, #2A3F5A);
                }
                
                .add-widget-btn {
                    width: 100%;
                    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
                    background: var(--business-blue, #1B90FF);
                    color: white;
                    border: none;
                    border-radius: var(--radius-sm, 4px);
                    font-size: 0.8em;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast, 0.15s ease);
                }
                
                .add-widget-btn:hover {
                    background: var(--business-blue-dark, #1570CC);
                    transform: translateY(-1px);
                }
                
                .add-widget-btn:active {
                    transform: translateY(0);
                }
                
                .library-footer {
                    padding: var(--spacing-md, 16px);
                    background: var(--background-secondary, #1A2733);
                    border-top: 1px solid var(--border-light, #1A2733);
                    text-align: center;
                    font-size: 0.8em;
                    color: var(--text-secondary, #A9B4BE);
                }
                
                .selection-info {
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    background: var(--business-purple-light, #e6d9f5);
                    border-top: 1px solid var(--border-light, #eaecee);
                    border-bottom: 1px solid var(--border-light, #eaecee);
                    font-size: 0.85em;
                    color: var(--business-purple, #9966cc);
                    text-align: center;
                    display: none;
                }
                
                .selection-info.visible {
                    display: block;
                }
            </style>
        `;

        const template = `
            ${style}
            <div class="library-container">
                ${this.renderSelectionInfo()}
                ${this.renderWidgets()}
                ${this.renderFooter()}
            </div>
        `;

        this.shadowRoot.innerHTML = template;
        this.bindEvents();
    }

    renderSelectionInfo() {
        if (!this.selectedWidget) return '';
        
        const widget = this.availableWidgets.find(w => w.id === this.selectedWidget);
        if (!widget) return '';

        return `
            <div class="selection-info visible">
                Selected: ${widget.icon} ${widget.name}
            </div>
        `;
    }

    renderWidgets() {
        return `
            <div class="widgets-container">
                ${this.availableWidgets.map(widget => this.renderWidget(widget)).join('')}
            </div>
        `;
    }

    renderWidget(widget) {
        const isSelected = this.selectedWidget === widget.id;
        const isDisabled = widget.status !== 'available';
        
        return `
            <div class="widget-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
                 data-widget-id="${widget.id}"
                 data-widget-name="${widget.name}"
                 data-widget-icon="${widget.icon}"
                 data-widget-description="${widget.description}"
                 data-widget-requirements='${JSON.stringify(widget.requirements)}'
                 data-widget-size='${JSON.stringify(widget.size)}'
                 ${!isDisabled ? 'draggable="true"' : ''}>
                
                <div class="widget-header">
                    <span class="widget-icon">${widget.icon}</span>
                    <div class="widget-info">
                        <div class="widget-name">${widget.name}</div>
                        <span class="widget-status ${widget.status}">${widget.status.replace('-', ' ')}</span>
                    </div>
                </div>
                
                <div class="widget-description">${widget.description}</div>
                
                <div class="widget-requirements">
                    <span class="requirement-badge">
                        🏷️ ${widget.requirements.dimensions}+ dimensions
                    </span>
                    <span class="requirement-badge">
                        📊 ${widget.requirements.measures}+ measures
                    </span>
                </div>
                
                <div class="widget-actions">
                    ${!isDisabled ? `<button class="add-widget-btn" data-widget-id="${widget.id}">➕ Add to Canvas</button>` : ''}
                </div>
                
                <div class="selection-indicator">✓</div>
            </div>
        `;
    }

    renderFooter() {
        return `
            <div class="library-footer">
                ${this.availableWidgets.filter(w => w.status === 'available').length} of ${this.availableWidgets.length} widgets available
            </div>
        `;
    }

    bindEvents() {
        const container = this.shadowRoot.querySelector('.widgets-container');
        if (!container) return;

        container.addEventListener('click', (e) => {
            // Handle "Add to Canvas" button clicks
            if (e.target.classList.contains('add-widget-btn')) {
                const widgetId = e.target.dataset.widgetId;
                const widgetItem = e.target.closest('.widget-item');
                
                if (widgetItem && !widgetItem.classList.contains('disabled')) {
                    this.addWidgetToCanvas(widgetItem);
                }
                return;
            }
            
            // Handle widget selection
            const widgetItem = e.target.closest('.widget-item');
            if (!widgetItem || widgetItem.classList.contains('disabled')) return;

            const widgetId = widgetItem.dataset.widgetId;
            const widgetName = widgetItem.dataset.widgetName;
            
            this.selectWidget(widgetId, widgetName);
        });

        // Drag & Drop handlers avec logs détaillés
        container.addEventListener('dragstart', (e) => {
            const widgetItem = e.target.closest('.widget-item');
            if (!widgetItem || widgetItem.classList.contains('disabled')) {
                console.log('🧩 Widget Library: Drag blocked - no widget item or disabled');
                return;
            }

            const widgetData = {
                id: widgetItem.dataset.widgetId,
                name: widgetItem.dataset.widgetName,
                icon: widgetItem.dataset.widgetIcon,
                description: widgetItem.dataset.widgetDescription,
                requirements: JSON.parse(widgetItem.dataset.widgetRequirements || '{}'),
                size: JSON.parse(widgetItem.dataset.widgetSize || '{"width": 4, "height": 3}'),
                type: 'widget'
            };

            console.log('🧩 Widget Library: DRAGSTART - Setting data:', widgetData);
            e.dataTransfer.setData('application/json', JSON.stringify(widgetData));
            e.dataTransfer.effectAllowed = 'copy';

            // Visual feedback
            widgetItem.classList.add('dragging');

            console.log('🧩 Widget drag started:', widgetData.name, 'EffectAllowed:', e.dataTransfer.effectAllowed);
        });

        container.addEventListener('dragend', (e) => {
            const widgetItem = e.target.closest('.widget-item');
            if (widgetItem) {
                widgetItem.classList.remove('dragging');
            }
        });
    }

    selectWidget(widgetId, widgetName) {
        this.selectedWidget = widgetId;
        this.render();

        // Notify feeding panel
        this.dispatchEvent(new CustomEvent('widgetSelected', {
            detail: {
                id: widgetId,
                name: widgetName,
                type: widgetId
            },
            bubbles: true,
            composed: true
        }));

        console.log('🧩 Widget selected:', widgetName);
    }

    // Public API
    getSelectedWidget() {
        return this.selectedWidget ? 
            this.availableWidgets.find(w => w.id === this.selectedWidget) : 
            null;
    }

    clearSelection() {
        this.selectedWidget = null;
        this.render();
    }

    addWidgetToCanvas(widgetItem) {
        // Empêcher les double-clics rapides
        if (widgetItem.dataset.adding === 'true') {
            console.log('🎯 Widget Library: Widget already being added, ignoring...');
            return;
        }
        
        widgetItem.dataset.adding = 'true';
        
        const widgetData = {
            id: widgetItem.dataset.widgetId,
            name: widgetItem.dataset.widgetName,
            icon: widgetItem.dataset.widgetIcon,
            description: widgetItem.dataset.widgetDescription,
            requirements: JSON.parse(widgetItem.dataset.widgetRequirements || '{}'),
            size: JSON.parse(widgetItem.dataset.widgetSize || '{"width": 4, "height": 3}'),
            type: 'widget'
        };

        console.log('🎯 Widget Library: Adding widget to canvas via click:', widgetData.name);

        // Find canvas and call handleWidgetDrop directly
        const canvas = document.querySelector('dashboard-canvas');
        if (canvas && canvas.handleWidgetDrop) {
            // Create a fake event object for compatibility
            const fakeEvent = {
                clientX: 100,
                clientY: 100,
                preventDefault: () => {},
                stopPropagation: () => {}
            };
            
            canvas.handleWidgetDrop(widgetData, fakeEvent);
            console.log('✅ Widget Library: Widget added successfully via click!');
        } else {
            console.error('❌ Widget Library: Canvas not found or handleWidgetDrop not available');
        }
        
        // Reset flag après un délai
        setTimeout(() => {
            delete widgetItem.dataset.adding;
        }, 1000);
    }

    // Global event handler
    handleGlobalEvent(eventType, data) {
        switch (eventType) {
            case 'dataSourceChanged':
                // Could update widget availability based on data
                break;
        }
    }
}

// Register the custom element
customElements.define('widget-library', WidgetLibrary);

// Export for modules
window.WidgetLibrary = WidgetLibrary;