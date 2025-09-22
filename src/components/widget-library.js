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
        
        // State - All widgets will be loaded dynamically
        this.selectedWidget = null;
        this.availableWidgets = []; // Start empty, populate via discovery
        this.eventsInitialized = false; // Protection contre events multiples
        this.dynamicWidgetsLoaded = false; // Protection contre chargements multiples
        
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        // Load widgets dynamically after initialization
        this.loadDynamicWidgets();
    }

    /**
     * Load widgets dynamically from discovery service
     */
    async loadDynamicWidgets() {
        // Protection contre les chargements multiples
        if (this.dynamicWidgetsLoaded) {
            console.log('✅ Widget Library: Dynamic widgets already loaded, skipping');
            return;
        }
        
        try {
            console.log('🔍 Widget Library: Loading dynamic widgets...');
            
            // Wait for discovery service to be available
            if (window.widgetDiscovery) {
                this.dynamicWidgetsLoaded = true; // Marquer avant le chargement
                
                // ÉTAPE 1: Découvrir les widgets
                const discoveredWidgets = await window.widgetDiscovery.discoverWidgets();
                console.log('📦 Widget Library: Discovered widgets:', discoveredWidgets);
                
                // ÉTAPE 2: Charger les widgets découverts (AJOUTÉ)
                if (window.widgetManager) {
                    console.log('🔄 Widget Library: Loading discovered widgets into memory...');
                    const loadResults = await window.widgetDiscovery.loadAllDiscoveredWidgets(window.widgetManager);
                    console.log('📊 Widget Library: Load results:', loadResults);
                    
                    // ÉTAPE 2.5: Vérifier les definitions chargées
                    const availableTypes = window.widgetManager.getAvailableWidgetTypes();
                    console.log('🔍 Widget Library: Available widget types after loading:', availableTypes);
                    
                    const availableDefinitions = window.widgetManager.getAvailableWidgetDefinitions();
                    console.log('🔍 Widget Library: Available widget definitions:', availableDefinitions.map(d => d.type));
                    
                    // Diagnostic complet de l'état du WidgetManager
                    window.widgetManager.getState();
                } else {
                    console.warn('⚠️ Widget Library: WidgetManager not available, skipping widget loading');
                }
                
                // ÉTAPE 3: Convert discovered widgets to library format
                this.availableWidgets = this.convertDiscoveredWidgets(discoveredWidgets);
                
                // Re-render with discovered widgets
                this.render();
                this.bindEvents();
                
                console.log('✅ Widget Library: Dynamic loading completed');
            } else {
                this.dynamicWidgetsLoaded = false; // Reset si pas disponible
                console.warn('⚠️ Widget Library: Discovery service not available yet');
                // Retry after a short delay
                setTimeout(() => this.loadDynamicWidgets(), 1000);
            }
        } catch (error) {
            this.dynamicWidgetsLoaded = false; // Reset en cas d'erreur
            console.error('❌ Widget Library: Failed to load dynamic widgets:', error);
        }
    }

    /**
     * Convert discovered widget filenames to library format
     */
    convertDiscoveredWidgets(discoveredWidgets) {
        const widgetMappings = {
            'widget_bar-chart_v1.0.js': {
                id: 'bar-chart', name: 'Bar Chart', icon: '📊',
                description: 'Compare values across categories',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 6, height: 4 }, type: 'chart'
            },
            'widget_line-chart_v1.0.js': {
                id: 'line-chart', name: 'Line Chart', icon: '📈',
                description: 'Show trends over time',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 8, height: 4 }, type: 'chart'
            },
            'widget_pie-chart_v1.0.js': {
                id: 'pie-chart', name: 'Pie Chart', icon: '🥧',
                description: 'Show proportions of a whole',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 4, height: 4 }, type: 'chart'
            },
            'widget_table_v1.0.js': {
                id: 'table', name: 'Table', icon: '📋',
                description: 'Display detailed data',
                requirements: { dimensions: 0, measures: 0 },
                size: { width: 12, height: 6 }, type: 'table'
            },
            'widget_tile_v1.0.js': {
                id: 'tile', name: 'KPI Tile', icon: '🎯',
                description: 'Display key performance indicators',
                requirements: { dimensions: 0, measures: 1 },
                size: { width: 4, height: 3 }, type: 'kpi'
            },
            'widget_tile_v1.1.js': {
                id: 'tile-v1.1', name: 'KPI Tile v1.1', icon: '📊',
                description: 'Enhanced KPI tile with new render function',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 4, height: 3 }, type: 'kpi'
            }
        };

        return discoveredWidgets
            .map(widgetPath => {
                const filename = widgetPath.split('/').pop();
                return widgetMappings[filename];
            })
            .filter(widget => widget !== undefined)
            .filter((widget, index, array) => 
                // Éviter les doublons basés sur l'id
                array.findIndex(w => w.id === widget.id) === index
            );
    }

    /**
     * Get widget filename based on widget type
     */
    getWidgetFileName(widgetId) {
        const fileNameMap = {
            'bar-chart': 'widget_bar-chart_v1.0.js',
            'line-chart': 'widget_line-chart_v1.0.js',
            'pie-chart': 'widget_pie-chart_v1.0.js',
            'table': 'widget_table_v1.0.js',
            'tile': 'widget_tile_v1.0.js',
            'tile-v1.1': 'widget_tile_v1.1.js',
            'kpi-card': 'widget_kpi-card_v1.0.js'
        };
        
        return fileNameMap[widgetId] || `widget_${widgetId}_v1.0.js`;
    }

    render() {
        const template = `
            <style>
                :host {
                    display: block;
                    height: 100%;
                    background: var(--background-primary, #12171C);
                    color: var(--text-primary, #EAECEE);
                    border-right: 1px solid var(--border-light, #1A2733);
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                    overflow: hidden;
                }

                .library-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .library-header {
                    padding: var(--spacing-md, 16px);
                    background: var(--background-tertiary, #00144A);
                    border-bottom: 1px solid var(--border-light, #1A2733);
                    flex-shrink: 0;
                }

                .widgets-container {
                    flex: 1;
                    padding: var(--spacing-md, 16px);
                    overflow-y: auto;
                }

                .widgets-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--spacing-sm, 8px);
                }

                .widget-item {
                    background: var(--background-secondary, #1A2733);
                    border: 1px solid var(--border-light, #1A2733);
                    border-radius: var(--radius-md, 8px);
                    padding: var(--spacing-md, 16px);
                    cursor: pointer;
                    transition: all var(--transition-fast, 0.15s ease);
                    position: relative;
                }

                .widget-item:hover {
                    background: var(--background-primary, #12171C);
                    border-color: var(--business-blue, #1B90FF);
                    transform: translateY(-2px);
                }

                .widget-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm, 8px);
                    margin-bottom: var(--spacing-xs, 4px);
                }

                .widget-icon {
                    font-size: 1.5em;
                }

                .widget-name {
                    font-weight: 500;
                    color: var(--text-primary, #EAECEE);
                }

                .widget-description {
                    font-size: 0.8em;
                    color: var(--text-secondary, #A9B4BE);
                    margin-bottom: var(--spacing-sm, 8px);
                }

                .widget-filename {
                    font-size: 0.7em;
                    color: var(--text-disabled, #6B7680);
                    font-family: 'Courier New', monospace;
                    background: var(--background-primary, #12171C);
                    padding: 2px 6px;
                    border-radius: var(--radius-sm, 4px);
                    border: 1px solid var(--border-light, #1A2733);
                    margin-bottom: var(--spacing-xs, 4px);
                    display: inline-block;
                }

                .add-widget-btn {
                    position: absolute;
                    top: var(--spacing-sm, 8px);
                    right: var(--spacing-sm, 8px);
                    background: var(--business-green, #28a745);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    font-size: 0.8em;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity var(--transition-fast, 0.15s ease);
                }

                .widget-item:hover .add-widget-btn {
                    opacity: 1;
                }
            </style>

            <div class="library-container">
                <div class="library-header">
                    <h2>🧩 Widget Library</h2>
                </div>

                <div class="widgets-container">
                    <div class="widgets-grid">
                        ${this.renderWidgets()}
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = template;
    }

    renderWidgets() {
        return this.availableWidgets.map(widget => `
            <div class="widget-item" 
                 data-widget-id="${widget.id}"
                 data-widget-name="${widget.name}"
                 data-widget-size='${JSON.stringify(widget.size)}'
                 draggable="true">
                
                <button class="add-widget-btn" data-action="add-widget" data-widget-type="${widget.id}">
                    ➕
                </button>
                
                <div class="widget-header">
                    <span class="widget-icon">${widget.icon}</span>
                    <span class="widget-name">${widget.name}</span>
                </div>
                
                <div class="widget-description">
                    ${widget.description}
                </div>
                
                <div class="widget-filename">
                    📄 ${this.getWidgetFileName(widget.id)}
                </div>
            </div>
        `).join('');
    }

    bindEvents() {
        // Protection contre les event listeners multiples
        if (this.eventsInitialized) {
            console.log('🔄 Widget Library: Events already bound, skipping');
            return;
        }
        
        // Add widget button
        this.shadowRoot.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="add-widget"]')) {
                e.stopPropagation();
                const widgetType = e.target.dataset.widgetType;
                console.log('🎯 Widget Library: Click detected for widget:', widgetType);
                this.addWidgetToCanvas(widgetType);
            }
        });

        // Drag and drop
        this.shadowRoot.addEventListener('dragstart', (e) => {
            const widgetItem = e.target.closest('.widget-item');
            if (widgetItem) {
                this.handleDragStart(e, widgetItem);
            }
        });
        
        this.eventsInitialized = true;
        console.log('✅ Widget Library: Events bound successfully');
    }

    handleDragStart(e, widgetItem) {
        console.log('🎯 Widget Library: Drag start:', widgetItem.dataset.widgetName);
        
        const widgetData = {
            id: widgetItem.dataset.widgetId,
            name: widgetItem.dataset.widgetName,
            size: JSON.parse(widgetItem.dataset.widgetSize || '{"width": 4, "height": 3}'),
            type: 'widget'
        };

        e.dataTransfer.setData('application/json', JSON.stringify(widgetData));
        e.dataTransfer.effectAllowed = 'copy';
    }

    addWidgetToCanvas(widgetType) {
        console.log('🎯 Widget Library: Adding widget via click:', widgetType);
        console.log('🔍 Widget Library: Available widgets:', this.availableWidgets);
        console.log('🔍 Widget Library: Looking for widget with id:', widgetType);
        
        const widgetData = this.availableWidgets.find(w => w.id === widgetType);
        if (!widgetData) {
            console.error('❌ Widget Library: Widget type not found:', widgetType);
            return;
        }

        console.log('✅ Widget Library: Found widget data:', widgetData);

        // Find canvas and call addEntity directly
        const canvas = document.querySelector('dashboard-canvas-entity');
        if (canvas && canvas.addEntity) {
            // Create entity configuration
            const entityConfig = {
                type: widgetType,
                title: widgetData.name,
                size: widgetData.size
            };
            
            canvas.addEntity(entityConfig)
                .then(() => {
                    console.log('✅ Widget Library: Widget added successfully');
                })
                .catch((error) => {
                    console.error('❌ Widget Library: Failed to add widget:', error);
                });
        } else {
            console.error('❌ Widget Library: Canvas not found or addEntity method missing');
        }
    }

    /**
     * Refresh widgets library - called after dynamic widget discovery
     */
    refreshWidgets() {
        console.log('🔄 Widget Library: Refreshing widgets display');
        
        // Reload dynamic widgets to ensure we have the latest
        this.loadDynamicWidgets();
        
        console.log('✅ Widget Library: Refresh completed');
    }
}

// Register the custom element
customElements.define('widget-library', WidgetLibrary);