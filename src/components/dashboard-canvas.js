/**
 * 🎨 Dashboard Canvas - Central Display Area
 * 
 * Canvas component for widget display and management according to WIDGET_TECH_SPEC.md:
 * - Widget rendering and layout
 * - Responsive grid system
 * - Widget interaction and management
 */

class DashboardCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // State
        this.widgets = [];
        this.gridColumns = 12;
        this.gridGap = 16;
        
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
                
                .canvas-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--background-secondary, #1A2733);
                    overflow: hidden;
                    color: var(--text-primary, #EAECEE);
                }
                
                .canvas-content {
                    flex: 1;
                    padding: var(--spacing-md, 16px);
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: var(--business-grey, #a9b4be) transparent;
                }
                
                .canvas-content::-webkit-scrollbar {
                    width: 8px;
                }
                
                .canvas-content::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .canvas-content::-webkit-scrollbar-thumb {
                    background: var(--business-grey, #a9b4be);
                    border-radius: 4px;
                }
                
                .widgets-grid {
                    display: grid;
                    grid-template-columns: repeat(${this.gridColumns}, 1fr);
                    gap: ${this.gridGap}px;
                    min-height: 100%;
                }
                
                .widget-container {
                    background: var(--background-primary, #12171C);
                    border: 1px solid var(--border-light, #1A2733);
                    border-radius: var(--radius-md, 8px);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: all var(--transition-fast, 0.15s ease);
                    position: relative;
                    min-height: 300px;
                    color: var(--text-primary, #EAECEE);
                }
                
                .widget-container:hover {
                    box-shadow: 0 4px 12px rgba(27, 144, 255, 0.2);
                    transform: translateY(-1px);
                    border-color: var(--business-blue, #1B90FF);
                }
                
                .widget-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
                    background: var(--background-tertiary, #00144A);
                    border-bottom: 1px solid var(--border-light, #1A2733);
                    min-height: 40px;
                    color: var(--text-primary, #EAECEE);
                }
                
                .widget-title {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xs, 4px);
                    font-weight: 500;
                    color: var(--text-primary, #1a2733);
                    font-size: 0.9em;
                }
                
                .widget-type-icon {
                    font-size: 1.1em;
                }
                
                .widget-actions {
                    display: flex;
                    gap: var(--spacing-xs, 4px);
                    opacity: 0;
                    transition: opacity var(--transition-fast, 0.15s ease);
                }
                
                .widget-container:hover .widget-actions {
                    opacity: 1;
                }
                
                .btn-widget {
                    background: none;
                    border: none;
                    color: var(--text-secondary, #5b738b);
                    cursor: pointer;
                    padding: var(--spacing-xs, 4px);
                    border-radius: var(--radius-sm, 4px);
                    font-size: 0.8em;
                    transition: all var(--transition-fast, 0.15s ease);
                }
                
                .btn-widget:hover {
                    background: var(--business-grey-light, #eaecee);
                    color: var(--text-primary, #1a2733);
                }
                
                .btn-widget.danger:hover {
                    background: var(--business-red-light, #f8d7d7);
                    color: var(--business-red, #e74c3c);
                }
                
                .widget-content {
                    flex: 1;
                    padding: var(--spacing-md, 16px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--background-primary, #12171C);
                    color: var(--text-primary, #EAECEE);
                }
                
                .empty-canvas {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    text-align: center;
                    color: var(--text-secondary, #A9B4BE);
                    padding: var(--spacing-lg, 24px);
                }
                
                .empty-icon {
                    font-size: 3em;
                    margin-bottom: var(--spacing-md, 16px);
                    opacity: 0.6;
                    color: var(--business-blue, #1B90FF);
                }
                
                .empty-title {
                    font-size: 1.1em;
                    font-weight: 500;
                    margin-bottom: var(--spacing-sm, 8px);
                    color: var(--text-primary, #EAECEE);
                }
                
                .empty-description {
                    max-width: 350px;
                    line-height: 1.4;
                    margin-bottom: var(--spacing-md, 16px);
                    font-size: 0.9em;
                    color: var(--text-secondary, #A9B4BE);
                }
                
                .empty-steps {
                    text-align: left;
                    max-width: 280px;
                }
                
                .empty-step {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm, 8px);
                    margin-bottom: var(--spacing-xs, 4px);
                    font-size: 0.85em;
                }
                
                .step-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    background: var(--business-blue, #1B90FF);
                    color: white;
                    border-radius: 50%;
                    font-size: 0.75em;
                    font-weight: 500;
                    flex-shrink: 0;
                }
                
                .loading-widget {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary, #5b738b);
                    animation: pulse 2s infinite;
                }
                
                .loading-icon {
                    font-size: 2em;
                    margin-bottom: var(--spacing-sm, 8px);
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                
                /* Responsive grid */
                @media (max-width: 1200px) {
                    .widgets-grid {
                        grid-template-columns: repeat(8, 1fr);
                    }
                }
                
                @media (max-width: 768px) {
                    .widgets-grid {
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                    }
                    
                    .canvas-content {
                        padding: var(--spacing-sm, 8px);
                    }
                }
                
                @media (max-width: 480px) {
                    .widgets-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

        const template = `
            ${style}
            <div class="canvas-container">
                ${this.renderContent()}
            </div>
        `;

        this.shadowRoot.innerHTML = template;
        this.bindEvents();
    }

    renderContent() {
        if (this.widgets.length === 0) {
            return this.renderEmptyCanvas();
        }

        return `
            <div class="canvas-content">
                <div class="widgets-grid">
                    ${this.widgets.map((widget, index) => this.renderWidget(widget, index)).join('')}
                </div>
            </div>
        `;
    }

    renderEmptyCanvas() {
        return `
            <div class="canvas-content">
                <div class="empty-canvas">
                    <div class="empty-icon">🎨</div>
                    <div class="empty-title">Start Building Your Dashboard</div>
                    <div class="empty-description">
                        Follow these steps to create data visualizations:
                    </div>
                    <div class="empty-steps">
                        <div class="empty-step">
                            <span class="step-number">1</span>
                            <span>Load CSV data (📤 button)</span>
                        </div>
                        <div class="empty-step">
                            <span class="step-number">2</span>
                            <span>Select a widget type</span>
                        </div>
                        <div class="empty-step">
                            <span class="step-number">3</span>
                            <span>Drag fields to configure</span>
                        </div>
                        <div class="empty-step">
                            <span class="step-number">4</span>
                            <span>Create your widget</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderWidget(widget, index) {
        const gridSpan = widget.size?.width || 4; // Default to 4 columns
        const gridRowSpan = widget.size?.height || 1; // Default to 1 row
        
        return `
            <div class="widget-container" 
                 style="grid-column: span ${gridSpan}; grid-row: span ${gridRowSpan};"
                 data-widget-id="${widget.id}"
                 data-widget-index="${index}">
                
                <div class="widget-header">
                    <div class="widget-title">
                        <span class="widget-type-icon">${this.getWidgetIcon(widget.type)}</span>
                        <span>${widget.title || widget.type}</span>
                    </div>
                    <div class="widget-actions">
                        <button class="btn-widget" onclick="this.closest('dashboard-canvas').editWidget(${index})" title="Edit widget">
                            ⚙️
                        </button>
                        <button class="btn-widget" onclick="this.closest('dashboard-canvas').duplicateWidget(${index})" title="Duplicate widget">
                            📋
                        </button>
                        <button class="btn-widget danger" onclick="this.closest('dashboard-canvas').removeWidget(${index})" title="Remove widget">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="widget-content" id="widget-content-${widget.id}">
                    ${this.renderWidgetContent(widget)}
                </div>
            </div>
        `;
    }

    renderWidgetContent(widget) {
        if (widget.loading) {
            return `
                <div class="loading-widget">
                    <div class="loading-icon">⏳</div>
                    <div>Loading widget...</div>
                </div>
            `;
        }

        if (widget.error) {
            return `
                <div style="color: var(--business-red); text-align: center;">
                    <div style="font-size: 2em; margin-bottom: 8px;">⚠️</div>
                    <div>Error: ${widget.error}</div>
                </div>
            `;
        }

        // Widget content will be rendered by specific widget components
        return `
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                <div style="text-align: center;">
                    <div style="font-size: 2em; margin-bottom: 8px;">${this.getWidgetIcon(widget.type)}</div>
                    <div>${widget.type} Widget</div>
                    <div style="font-size: 0.8em; margin-top: 4px;">
                        ${widget.dimensions?.length || 0} dimensions, ${widget.measures?.length || 0} measures
                    </div>
                </div>
            </div>
        `;
    }

    getWidgetIcon(type) {
        const icons = {
            'bar-chart': '📊',
            'line-chart': '📈',
            'pie-chart': '🥧',
            'table': '📋'
        };
        return icons[type] || '📊';
    }

    bindEvents() {
        // Listen for widget creation events
        document.addEventListener('createWidget', (e) => {
            this.addWidget(e.detail);
        });
    }

    // Public API methods
    addWidget(widgetConfig) {
        const widget = {
            id: widgetConfig.id || 'widget_' + Date.now(),
            type: widgetConfig.type,
            title: widgetConfig.title || `${widgetConfig.type} Widget`,
            dimensions: widgetConfig.dimensions || [],
            measures: widgetConfig.measures || [],
            filters: widgetConfig.filters || [],
            size: widgetConfig.size || { width: 4, height: 1 },
            created: new Date().toISOString(),
            loading: false,
            error: null
        };

        this.widgets.push(widget);
        this.render();

        // Dispatch event for other components
        this.dispatchEvent(new CustomEvent('widgetAdded', {
            detail: widget,
            bubbles: true,
            composed: true
        }));

        console.log('🎨 Widget added to canvas:', widget.type);
        return widget;
    }

    removeWidget(index) {
        if (index < 0 || index >= this.widgets.length) return;

        const widget = this.widgets[index];
        this.widgets.splice(index, 1);
        this.render();

        this.dispatchEvent(new CustomEvent('widgetRemoved', {
            detail: widget,
            bubbles: true,
            composed: true
        }));

        console.log('🗑️ Widget removed from canvas:', widget.type);
    }

    editWidget(index) {
        if (index < 0 || index >= this.widgets.length) return;

        const widget = this.widgets[index];
        
        this.dispatchEvent(new CustomEvent('editWidget', {
            detail: widget,
            bubbles: true,
            composed: true
        }));

        console.log('⚙️ Editing widget:', widget.type);
    }

    duplicateWidget(index) {
        if (index < 0 || index >= this.widgets.length) return;

        const originalWidget = this.widgets[index];
        const duplicatedWidget = {
            ...originalWidget,
            id: 'widget_' + Date.now(),
            title: `${originalWidget.title} (Copy)`,
            created: new Date().toISOString()
        };

        this.widgets.push(duplicatedWidget);
        this.render();

        this.dispatchEvent(new CustomEvent('widgetDuplicated', {
            detail: { original: originalWidget, duplicate: duplicatedWidget },
            bubbles: true,
            composed: true
        }));

        console.log('📋 Widget duplicated:', duplicatedWidget.type);
    }

    clearAllWidgets() {
        if (this.widgets.length === 0) return;
        
        if (confirm('Are you sure you want to remove all widgets?')) {
            this.widgets = [];
            this.render();
            
            this.dispatchEvent(new CustomEvent('allWidgetsCleared', {
                bubbles: true,
                composed: true
            }));
            
            console.log('🗑️ All widgets cleared from canvas');
        }
    }

    exportCanvas() {
        const canvasData = {
            widgets: this.widgets,
            exported: new Date().toISOString(),
            version: '1.0.0'
        };

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(canvasData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('📤 Canvas exported successfully');
    }

    // Getters
    getWidgets() {
        return [...this.widgets];
    }

    getWidget(id) {
        return this.widgets.find(widget => widget.id === id);
    }

    getWidgetCount() {
        return this.widgets.length;
    }

    // Global event handler
    handleGlobalEvent(eventType, data) {
        switch (eventType) {
            case 'dataSourceChanged':
                // Could refresh widgets when data changes
                this.widgets.forEach(widget => {
                    widget.loading = true;
                });
                this.render();
                break;
        }
    }
}

// Register the custom element
customElements.define('dashboard-canvas', DashboardCanvas);

// Export for modules
window.DashboardCanvas = DashboardCanvas;