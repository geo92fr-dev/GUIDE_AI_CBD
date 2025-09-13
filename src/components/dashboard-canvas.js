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
        this.eventsInitialized = false;  // Track event binding
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        console.log('🎨 Canvas: render() called - Widget count:', this.widgets.length);
        console.trace('🎨 Canvas: render() call stack');
        
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
                    transition: all var(--transition-fast, 0.15s ease);
                }
                
                .canvas-container.drag-over {
                    background: var(--background-primary, #12171C);
                    border: 2px dashed var(--business-blue, #1B90FF);
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

                .widget-id-label {
                    font-size: 0.8em;
                    font-weight: 600;
                    color: #00144A; /* Blue 11 - texte très foncé */
                    background: #D1EFFF; /* Blue 2 - fond très clair */
                    padding: 3px 8px;
                    border-radius: 12px;
                    margin-left: auto;
                    font-family: monospace;
                    opacity: 1;
                    border: 1px solid #89D1FF; /* Blue 4 - bordure claire */
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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

                .drop-hint {
                    margin-top: 24px;
                    padding: 20px;
                    border: 2px dashed var(--grey-6);
                    border-radius: 12px;
                    background: var(--grey-10);
                    text-align: center;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: var(--grey-3);
                    font-style: italic;
                }

                .drop-hint-icon {
                    font-size: 24px;
                    opacity: 0.7;
                }

                .canvas-container.drag-over .drop-hint {
                    border-color: var(--blue-4);
                    background: var(--blue-11);
                    color: var(--blue-4);
                }

                .canvas-container.drag-over .drop-hint-icon {
                    opacity: 1;
                    transform: scale(1.1);
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
        
        // Always bind events (global events only once, container events every time)
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
                            <span>Select a dataset from Available Objects</span>
                        </div>
                        <div class="empty-step">
                            <span class="step-number">2</span>
                            <span>🧩 Drag a widget from Widget Library to this canvas</span>
                        </div>
                        <div class="empty-step">
                            <span class="step-number">3</span>
                            <span>📊 Drag fields to Data Assignment panel</span>
                        </div>
                        <div class="empty-step">
                            <span class="step-number">4</span>
                            <span>✨ Create your widget</span>
                        </div>
                    </div>
                    <div class="drop-hint">
                        <div class="drop-hint-icon">🧩</div>
                        <div>Drag widgets here to add them to your dashboard</div>
                    </div>
                    <div style="margin-top: 20px;">
                        <button id="clear-canvas-btn" style="padding: 8px 16px; background: var(--red-5, #ff4757); color: white; border: none; border-radius: 4px; cursor: pointer;">
                            🗑️ Clear Canvas (Debug)
                        </button>
                        <span style="margin-left: 10px; color: var(--grey-3); font-size: 0.9em;">
                            Current widgets: ${this.widgets.length}
                        </span>
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
                        <span class="widget-id-label">#${widget.id.split('_').pop()}</span>
                    </div>
                    <div class="widget-actions">
                        <button class="btn-widget edit-btn" data-action="edit" data-index="${index}" title="Edit widget">
                            ⚙️
                        </button>
                        <button class="btn-widget duplicate-btn" data-action="duplicate" data-index="${index}" title="Duplicate widget">
                            📋
                        </button>
                        <button class="btn-widget danger remove-btn" data-action="remove" data-index="${index}" title="Remove widget">
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
        const hasData = widget.dataConfig && 
                       (widget.dataConfig.dimensions?.length > 0 || 
                        widget.dataConfig.measures?.length > 0 || 
                        widget.dataConfig.filters?.length > 0);
        
        return `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary);">
                <div style="text-align: center;">
                    <div style="font-size: 2em; margin-bottom: 8px;">${this.getWidgetIcon(widget.type)}</div>
                    <div>${widget.type} Widget</div>
                    ${hasData ? this.renderDataStatus(widget.dataConfig) : this.renderNoDataStatus()}
                </div>
            </div>
        `;
    }

    renderDataStatus(dataConfig) {
        const dimensionsCount = dataConfig.dimensions?.length || 0;
        const measuresCount = dataConfig.measures?.length || 0;
        const filtersCount = dataConfig.filters?.length || 0;
        
        return `
            <div style="font-size: 0.8em; margin-top: 8px; color: var(--business-green, #28a745);">
                ✅ Data Connected
            </div>
            <div style="font-size: 0.75em; margin-top: 4px; opacity: 0.8;">
                📊 ${dimensionsCount} dimensions • 📈 ${measuresCount} measures • 🔍 ${filtersCount} filters
            </div>
            <div style="font-size: 0.7em; margin-top: 4px; opacity: 0.6;">
                Last updated: ${new Date(dataConfig.timestamp).toLocaleTimeString()}
            </div>
        `;
    }

    renderNoDataStatus() {
        return `
            <div style="font-size: 0.8em; margin-top: 8px; color: var(--text-tertiary, #999);">
                No data assigned
            </div>
            <div style="font-size: 0.75em; margin-top: 4px; opacity: 0.7;">
                Use Data Assignment to connect data
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
        // Prevent multiple global event binding
        if (this.eventsInitialized) {
            console.log('🎨 Canvas: Global events already initialized, only binding container events...');
            this.bindContainerEvents();
            return;
        }

        console.log('🎨 Canvas: Initializing all events...');
        // Prevent duplicate event listeners
        if (this.eventsInitialized) {
            console.log('🎨 Canvas: Events already initialized, skipping...');
            return;
        }

        // Listen for widget creation events (global) - ONLY ONCE
        this.createWidgetHandler = (e) => {
            console.log('🎨 Canvas: Received createWidget event', e.detail);
            console.log('🎨 Canvas: Current widgets count:', this.widgets.length);
            this.addWidget(e.detail);
        };
        document.addEventListener('createWidget', this.createWidgetHandler);

        // Listen for widget update events - ONLY ONCE
        this.updateWidgetHandler = (e) => {
            console.log('🎨 Canvas: Received updateWidget event', e.detail);
            this.updateWidget(e.detail.index, e.detail.widget);
        };
        document.addEventListener('updateWidget', this.updateWidgetHandler);

        this.eventsInitialized = true;
        
        // Bind container events
        this.bindContainerEvents();
    }

    bindContainerEvents() {
        const container = this.shadowRoot.querySelector('.canvas-container');
        if (!container) {
            console.error('🎨 Canvas: No container found for binding events!');
            return;
        }

        console.log('🎨 Canvas: Events DISABLED - using SimpleDragDrop bypass');
        
        // TOUS LES LISTENERS DÉSACTIVÉS - SimpleDragDrop s'en charge
        console.log('🔧 Canvas: All native drag events disabled, SimpleDragDrop will handle everything');
        
        // Test simple - détection de tous les événements sur le canvas
        container.addEventListener('mouseenter', () => {
            console.log('🖱️ Canvas: Mouse entered - canvas is accessible');
        });

        container.addEventListener('click', () => {
            console.log('🖱️ Canvas: CLICKED - canvas responds to events');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            container.classList.remove('drag-over');
            
            console.log('🎨 Canvas: Drop event detected');

            try {
                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                console.log('🎨 Canvas: Drop data parsed:', data);
                
                if (data.type === 'widget') {
                    this.handleWidgetDrop(data, e);
                } else {
                    console.warn('🎨 Canvas: Unknown drop data type:', data.type);
                }
            } catch (error) {
                console.error('🎨 Canvas: Error parsing drop data:', error);
            }
        });

        // Debug button (temporary)
        const clearBtn = this.shadowRoot.querySelector('#clear-canvas-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearWidgets();
            });
        }

        // Widget action buttons
        container.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;

            // Stop event propagation to prevent interference with drag & drop
            e.stopPropagation();

            const action = button.dataset.action;
            const index = parseInt(button.dataset.index);

            console.log(`🎨 Canvas: ${action} button clicked for widget index ${index}`);

            switch (action) {
                case 'edit':
                    this.editWidget(index);
                    break;
                case 'duplicate':
                    this.duplicateWidget(index);
                    break;
                case 'remove':
                    this.removeWidget(index);
                    break;
            }
        });
    }

    handleWidgetDrop(widgetData, dropEvent) {
        console.log('🎨 Canvas: Widget dropped:', widgetData.name);
        console.log('🎨 Canvas: Current widgets count before drop:', this.widgets.length);

        // Create widget configuration
        const uniqueId = 'widget_drop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const widgetConfig = {
            id: uniqueId,
            type: widgetData.id,
            title: widgetData.name,
            dimensions: [],
            measures: [],
            filters: [],
            size: widgetData.size || { width: 4, height: 3 }, // Use widget's default size
            created: new Date().toISOString(),
            loading: false,
            error: null,
            source: 'drag-drop'  // Mark as drag & drop source
        };

        console.log('🎨 Canvas: About to call addWidget with:', widgetConfig.id);
        console.log('🎨 Canvas: Widget size will be:', widgetConfig.size);

        // Add widget directly (no event dispatching to avoid loop)
        const addedWidget = this.addWidget(widgetConfig);

        console.log('🎨 Canvas: Widget creation completed. Final count:', this.widgets.length);
        console.log('✅ Widget created on canvas via drag & drop:', widgetConfig.title);
        
        return addedWidget;
    }

    // Public API methods
    addWidget(widgetConfig) {
        console.log('🎨 Canvas: addWidget called with:', widgetConfig);
        console.log('🎨 Canvas: Current widgets before add:', this.widgets.length);
        console.log('🎨 Canvas: Existing widgets:', this.widgets.map(w => ({id: w.id, type: w.type, title: w.title})));
        console.log('🎨 Canvas: Widget source:', widgetConfig.source || 'unknown');
        
        // Vérifier si un widget avec le même ID existe déjà
        if (widgetConfig.id && this.widgets.find(w => w.id === widgetConfig.id)) {
            console.warn('🎨 Canvas: Widget with ID already exists, skipping:', widgetConfig.id);
            return this.widgets.find(w => w.id === widgetConfig.id);
        }
        
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
        console.log('🎨 Canvas: Widget added, new count:', this.widgets.length);
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

    updateWidget(index, updatedWidget) {
        if (index < 0 || index >= this.widgets.length) {
            console.error('🎨 Canvas: Invalid widget index for update:', index);
            return;
        }

        console.log('🎨 Canvas: Updating widget at index', index, 'with:', updatedWidget);

        // Update the widget in the array
        this.widgets[index] = {
            ...this.widgets[index],
            ...updatedWidget,
            updated: new Date().toISOString()
        };

        // Re-render to show changes
        this.render();

        // Dispatch event for other components
        this.dispatchEvent(new CustomEvent('widgetUpdated', {
            detail: {
                index: index,
                widget: this.widgets[index]
            },
            bubbles: true,
            composed: true
        }));

        console.log('💾 Widget updated on canvas:', this.widgets[index].type, this.widgets[index].id);
        return this.widgets[index];
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
        
        // Prepare widget data for editing
        const editData = {
            widget: widget,
            index: index,
            action: 'edit',
            source: 'canvas'
        };
        
        console.log('⚙️ Editing widget:', widget.type, 'with data:', editData);
        
        // Dispatch event to feeding panel
        document.dispatchEvent(new CustomEvent('editWidget', {
            detail: editData
        }));
        
        // Also dispatch local event for other components
        this.dispatchEvent(new CustomEvent('widgetEditRequested', {
            detail: editData,
            bubbles: true,
            composed: true
        }));
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

    // Clear all widgets (for testing/debugging)
    clearWidgets() {
        console.log('🗑️ Canvas: Clearing all widgets (count was:', this.widgets.length + ')');
        this.widgets = [];
        this.render();
    }

    // Global event handler
    handleGlobalEvent(eventType, data) {
        switch (eventType) {
            case 'dataSourceChanged':
                // IMPORTANT: Ne PAS affecter les widgets lors du changement de dataset
                // Les widgets doivent préserver leurs données jusqu'au prochain Apply
                console.log('🎨 Canvas: DataSource changed, but widgets data is PROTECTED');
                console.log('🎨 Canvas: Widgets will keep their current state until next Apply');
                // Ne pas mettre loading: true, ne pas re-render
                break;
        }
    }

    // Cleanup method
    disconnectedCallback() {
        if (this.eventsInitialized) {
            if (this.createWidgetHandler) {
                document.removeEventListener('createWidget', this.createWidgetHandler);
            }
            if (this.updateWidgetHandler) {
                document.removeEventListener('updateWidget', this.updateWidgetHandler);
            }
            console.log('🎨 Canvas: Event listeners cleaned up');
        }
    }

    // API pour récupérer tous les widgets du canvas
    getAllWidgets() {
        return this.widgets.map(widget => ({
            id: widget.id,
            type: widget.type,
            name: widget.title || widget.type,
            title: widget.title,
            config: widget.config || {}
        }));
    }

    // API pour mettre à jour les données d'un widget spécifique
    updateWidgetData(widgetId, dataConfig) {
        console.log('🎨 Canvas: Updating widget data for:', widgetId, dataConfig);
        
        const widget = this.widgets.find(w => w.id === widgetId);
        if (!widget) {
            console.warn('🎨 Canvas: Widget not found:', widgetId);
            return false;
        }

        // Mettre à jour les données du widget et l'état de loading
        widget.dataConfig = dataConfig;
        widget.lastUpdated = new Date().toISOString();
        widget.loading = false; // Important: sortir de l'état loading
        widget.error = null;   // Clear any previous errors
        
        console.log('🎨 Canvas: Widget data updated:', widget);
        console.log('🎨 Canvas: Widget loading state set to:', widget.loading);
        console.log('🔒 Canvas: Widget data is PROTECTED from dataset changes - only Apply button updates it');
        
        // Déclencher le re-rendu du widget
        this.render();
        
        // Notifier le widget spécifique s'il a une méthode de mise à jour
        const widgetElement = this.shadowRoot.querySelector(`[data-widget-id="${widgetId}"]`);
        if (widgetElement && widgetElement.updateData) {
            widgetElement.updateData(dataConfig);
        }
        
        // Événement global pour notifier la mise à jour
        document.dispatchEvent(new CustomEvent('widgetDataUpdated', {
            detail: { widgetId, dataConfig, widget }
        }));
        
        return true;
    }
}

// Register the custom element
customElements.define('dashboard-canvas', DashboardCanvas);

// Export for modules
window.DashboardCanvas = DashboardCanvas;