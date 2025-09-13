/**
 * 🎨 Dashboard Canvas - Central Display Area (Entity-based)
 * 
 * Canvas component for widget display and management according to WIDGET_TECH_SPEC.md:
 * - Widget rendering and layout using WidgetEntity system
 * - Responsive grid system
 * - Widget interaction and management
 * - Entity-based rendering with EntityRenderer
 */

class DashboardCanvasEntity extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Entity-based state
        this.entities = [];  // Array of WidgetEntity instances
        this.widgetManager = null;  // Will be initialized
        this.entityRenderer = null;  // Will be initialized
        this.gridColumns = 12;
        this.gridGap = 16;
        this.eventsInitialized = false;  // Track event binding
        
        this.init();
    }

    async init() {
        // Initialize Entity systems
        await this.initializeEntitySystems();
        this.render();
        this.bindEvents();
    }

    /**
     * Initialize WidgetEntity management systems
     */
    async initializeEntitySystems() {
        console.log('🏗️ Canvas: Initializing Entity systems');
        
        try {
            // Initialize WidgetManager
            if (typeof WidgetManager !== 'undefined') {
                this.widgetManager = new WidgetManager();
                console.log('✅ Canvas: WidgetManager initialized');
            } else {
                console.warn('⚠️ Canvas: WidgetManager not available, falling back to simple mode');
            }
            
            // Initialize EntityRenderer
            if (typeof EntityRenderer !== 'undefined') {
                this.entityRenderer = new EntityRenderer();
                console.log('✅ Canvas: EntityRenderer initialized');
            } else {
                console.warn('⚠️ Canvas: EntityRenderer not available, falling back to simple mode');
            }
            
            // Load existing entities
            await this.loadExistingEntities();
            
        } catch (error) {
            console.error('❌ Canvas: Entity systems initialization failed:', error);
            // Continue with fallback mode
        }
    }

    /**
     * Load existing entities from storage
     */
    async loadExistingEntities() {
        if (!this.widgetManager) return;
        
        try {
            console.log('📁 Canvas: Loading existing entities');
            this.entities = await this.widgetManager.getAll();
            console.log('✅ Canvas: Loaded', this.entities.length, 'entities');
        } catch (error) {
            console.error('❌ Canvas: Failed to load entities:', error);
            this.entities = [];
        }
    }

    render() {
        console.log('🎨 Canvas: render() called - Entity count:', this.entities.length);
        
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
                
                .widget-container, .entity-container {
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
                
                .widget-container:hover, .entity-container:hover {
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
                    color: var(--text-primary, #EAECEE);
                    font-size: 0.9em;
                }
                
                .widget-type-icon {
                    font-size: 1.1em;
                }

                .widget-id-label {
                    font-size: 0.8em;
                    font-weight: 600;
                    color: #00144A;
                    background: #D1EFFF;
                    padding: 3px 8px;
                    border-radius: 12px;
                    margin-left: auto;
                    font-family: monospace;
                    opacity: 1;
                    border: 1px solid #89D1FF;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                }
                
                .widget-actions {
                    display: flex;
                    gap: var(--spacing-xs, 4px);
                    opacity: 0;
                    transition: opacity var(--transition-fast, 0.15s ease);
                }
                
                .widget-container:hover .widget-actions,
                .entity-container:hover .widget-actions {
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
                
                .widget-content, .entity-content {
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
                }

                .drop-hint-icon {
                    font-size: 2em;
                    margin-bottom: 8px;
                    opacity: 0.7;
                }

                .loading-widget, .entity-loading {
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
        
        // Re-render entities with EntityRenderer after DOM is ready
        this.renderEntitiesAsync();
    }

    renderContent() {
        if (this.entities.length === 0) {
            return this.renderEmptyCanvas();
        }

        return `
            <div class="canvas-content">
                <div class="widgets-grid">
                    ${this.entities.map((entity, index) => this.renderEntityContainer(entity, index)).join('')}
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
                            Current entities: ${this.entities.length}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render entity container using WidgetEntity layout properties
     */
    renderEntityContainer(entity, index) {
        const gridSpan = entity.layout.size.width || 4; // Default to 4 columns
        const gridRowSpan = entity.layout.size.height || 1; // Default to 1 row
        
        return `
            <div class="entity-container" 
                 style="grid-column: span ${gridSpan}; grid-row: span ${gridRowSpan};"
                 data-entity-id="${entity.id}"
                 data-widget-id="${entity.id}"
                 data-entity-type="${entity.type}"
                 data-entity-index="${index}"
                 id="entity-container-${entity.id}">
                
                <div class="widget-header">
                    <div class="widget-title">
                        <span class="widget-type-icon">${this.getWidgetIcon(entity.type)}</span>
                        <span>${entity.title || entity.type}</span>
                        <span class="widget-id-label">#${entity.id.split('_').pop()}</span>
                    </div>
                    <div class="widget-actions">
                        <button class="btn-widget edit-btn" data-action="edit" data-entity-id="${entity.id}" title="Edit widget">
                            ⚙️
                        </button>
                        <button class="btn-widget duplicate-btn" data-action="duplicate" data-entity-id="${entity.id}" title="Duplicate widget">
                            📋
                        </button>
                        <button class="btn-widget danger remove-btn" data-action="remove" data-entity-id="${entity.id}" title="Remove widget">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="entity-content" id="entity-content-${entity.id}">
                    ${this.renderEntityContent(entity)}
                </div>
            </div>
        `;
    }

    /**
     * Render entity content using EntityRenderer or fallback
     */
    renderEntityContent(entity) {
        // Check if entity is loading
        if (entity.state.loading) {
            return this.renderLoadingState();
        }

        // Check if entity has errors
        if (entity.state.error) {
            return this.renderErrorState(entity.state.error);
        }

        // Return placeholder for EntityRenderer async processing
        return this.renderEntityPlaceholder(entity);
    }

    /**
     * Render placeholder while EntityRenderer processes
     */
    renderEntityPlaceholder(entity) {
        // Check if entity has data binding
        const hasData = entity.dataBinding.dimensions.length > 0 || 
                       entity.dataBinding.measures.length > 0 || 
                       entity.dataBinding.filters.length > 0;
        
        return `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary);">
                <div style="text-align: center;">
                    <div style="font-size: 2em; margin-bottom: 8px;">${this.getWidgetIcon(entity.type)}</div>
                    <div>${entity.type} Widget</div>
                    <div style="font-size: 0.8em; margin-top: 4px; opacity: 0.7;">Entity ID: ${entity.id}</div>
                    ${hasData ? this.renderEntityDataStatus(entity) : this.renderNoDataStatus()}
                </div>
            </div>
        `;
    }

    /**
     * Render entities asynchronously with EntityRenderer
     */
    async renderEntitiesAsync() {
        if (!this.entityRenderer) return;

        for (const entity of this.entities) {
            try {
                const container = this.shadowRoot.querySelector(`#entity-content-${entity.id}`);
                if (container) {
                    await this.entityRenderer.render(entity, container);
                }
            } catch (error) {
                console.error(`❌ Canvas: Failed to render entity ${entity.id}:`, error);
            }
        }
    }

    /**
     * Render data status for entity
     */
    renderEntityDataStatus(entity) {
        const dimensionsCount = entity.dataBinding.dimensions.length;
        const measuresCount = entity.dataBinding.measures.length;
        const filtersCount = entity.dataBinding.filters.length;
        
        const lastApplied = entity.dataBinding.lastApplied;
        const timeString = lastApplied ? new Date(lastApplied).toLocaleTimeString() : 'Never';
        
        return `
            <div style="font-size: 0.8em; margin-top: 8px; color: var(--business-green, #28a745);">
                ✅ Data Connected
            </div>
            <div style="font-size: 0.75em; margin-top: 4px; opacity: 0.8;">
                📊 ${dimensionsCount} dimensions • 📈 ${measuresCount} measures • 🔍 ${filtersCount} filters
            </div>
            <div style="font-size: 0.7em; margin-top: 4px; opacity: 0.6;">
                Last updated: ${timeString}
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

    renderLoadingState() {
        return `
            <div class="entity-loading">
                <div class="loading-icon">⏳</div>
                <div>Loading entity...</div>
            </div>
        `;
    }

    renderErrorState(error) {
        return `
            <div style="color: var(--business-red); text-align: center;">
                <div style="font-size: 2em; margin-bottom: 8px;">⚠️</div>
                <div>Error: ${error}</div>
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
        console.log('🔗 Canvas: Binding events - eventsInitialized:', this.eventsInitialized);
        
        if (this.eventsInitialized) {
            console.log('⏭️ Canvas: Events already initialized, skipping');
            return;
        }

        // Clear canvas button
        const clearBtn = this.shadowRoot.querySelector('#clear-canvas-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearCanvas();
            });
        }

        // Widget action buttons (event delegation)
        this.shadowRoot.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-widget');
            if (!button) return;

            e.preventDefault();
            e.stopPropagation();

            const action = button.getAttribute('data-action');
            const entityId = button.getAttribute('data-entity-id');
            
            if (entityId) {
                this.handleEntityAction(action, entityId);
            }
        });

        // Mark events as initialized
        this.eventsInitialized = true;
        console.log('✅ Canvas: Events bound successfully');
    }

    /**
     * Handle entity actions (edit, duplicate, remove)
     */
    handleEntityAction(action, entityId) {
        console.log(`🎨 Canvas: ${action} button clicked for entity ${entityId}`);
        
        const entity = this.entities.find(e => e.id === entityId);
        if (!entity) {
            console.error('❌ Canvas: Entity not found:', entityId);
            return;
        }

        switch (action) {
            case 'edit':
                this.editEntity(entity);
                break;
            case 'duplicate':
                this.duplicateEntity(entity);
                break;
            case 'remove':
                this.removeEntity(entityId);
                break;
            default:
                console.warn('⚠️ Canvas: Unknown action:', action);
        }
    }

    /**
     * Add new entity to canvas
     */
    async addEntity(entityConfig) {
        console.log('📦 Canvas: Adding new entity:', entityConfig);
        
        try {
            let entity;
            
            if (this.widgetManager) {
                // Use WidgetManager to create entity
                entity = await this.widgetManager.create(entityConfig);
            } else {
                // Fallback: create simple entity object
                entity = this.createSimpleEntity(entityConfig);
            }

            // Add to entities array
            this.entities.push(entity);
            
            // Re-render
            this.render();
            
            // Emit event for external components
            this.dispatchEvent(new CustomEvent('entityAdded', {
                detail: {
                    entity: entity,
                    entities: this.entities
                },
                bubbles: true
            }));
            
            console.log('✅ Canvas: Entity added successfully:', entity.id);
            return entity;
            
        } catch (error) {
            console.error('❌ Canvas: Failed to add entity:', error);
            throw error;
        }
    }

    /**
     * Create simple entity object (fallback)
     */
    createSimpleEntity(config) {
        return {
            id: config.id || `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: config.type,
            title: config.title || `${config.type} Widget`,
            layout: {
                size: {
                    width: config.size?.width || 4,
                    height: config.size?.height || 1
                }
            },
            dataBinding: {
                dimensions: [],
                measures: [],
                filters: [],
                lastApplied: null
            },
            state: {
                loading: false,
                error: null
            }
        };
    }

    /**
     * Remove entity from canvas
     */
    async removeEntity(entityId) {
        console.log('🗑️ Canvas: Removing entity:', entityId);
        
        try {
            if (this.widgetManager) {
                await this.widgetManager.delete(entityId);
            }
            
            // Remove from entities array
            this.entities = this.entities.filter(e => e.id !== entityId);
            
            // Clean up EntityRenderer cache
            if (this.entityRenderer) {
                this.entityRenderer.removeFromCache(entityId);
            }
            
            // Re-render
            this.render();
            
            // Emit event for external components
            this.dispatchEvent(new CustomEvent('entityRemoved', {
                detail: {
                    entityId: entityId,
                    entities: this.entities
                },
                bubbles: true
            }));
            
            console.log('✅ Canvas: Entity removed successfully');
            
        } catch (error) {
            console.error('❌ Canvas: Failed to remove entity:', error);
        }
    }

    /**
     * Duplicate entity
     */
    async duplicateEntity(originalEntity) {
        console.log('📋 Canvas: Duplicating entity:', originalEntity.id);
        
        try {
            let duplicatedEntity;
            
            if (this.widgetManager) {
                // Use WidgetManager to clone entity
                duplicatedEntity = await this.widgetManager.clone(originalEntity.id);
            } else {
                // Fallback: simple clone
                duplicatedEntity = {
                    ...originalEntity,
                    id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: `${originalEntity.title} (Copy)`
                };
            }

            // Add to entities array
            this.entities.push(duplicatedEntity);
            
            // Re-render
            this.render();
            
            // Emit event for external components
            this.dispatchEvent(new CustomEvent('entityAdded', {
                detail: {
                    entity: duplicatedEntity,
                    entities: this.entities
                },
                bubbles: true
            }));
            
            console.log('✅ Canvas: Entity duplicated successfully');
            
        } catch (error) {
            console.error('❌ Canvas: Failed to duplicate entity:', error);
        }
    }

    /**
     * Edit entity (placeholder)
     */
    editEntity(entity) {
        console.log('⚙️ Canvas: Edit entity:', entity.id);
        
        // Emit event for feeding panel to handle
        document.dispatchEvent(new CustomEvent('editWidget', {
            detail: {
                widgetId: entity.id,
                entity: entity
            }
        }));
        
        console.log('📡 Canvas: editWidget event dispatched for entity:', entity.id);
    }

    /**
     * Clear all entities
     */
    async clearCanvas() {
        console.log('🗑️ Canvas: Clearing all entities');
        
        try {
            if (this.widgetManager) {
                // Clear from storage
                for (const entity of this.entities) {
                    await this.widgetManager.delete(entity.id);
                }
            }
            
            // Clear EntityRenderer cache
            if (this.entityRenderer) {
                this.entityRenderer.clearCache();
            }
            
            // Clear entities array
            this.entities = [];
            
            // Re-render
            this.render();
            
            console.log('✅ Canvas: All entities cleared');
            
        } catch (error) {
            console.error('❌ Canvas: Failed to clear entities:', error);
        }
    }

    /**
     * Update entity data binding
     */
    async updateEntityDataBinding(entityId, dataBinding) {
        console.log('🔄 Canvas: Updating entity data binding:', entityId);
        
        try {
            const entity = this.entities.find(e => e.id === entityId);
            if (!entity) {
                throw new Error(`Entity not found: ${entityId}`);
            }
            
            if (this.widgetManager) {
                // Update through WidgetManager
                await this.widgetManager.updateDataBinding(entityId, dataBinding);
                
                // Refresh entity from manager
                const updatedEntity = await this.widgetManager.get(entityId);
                const index = this.entities.findIndex(e => e.id === entityId);
                if (index !== -1) {
                    this.entities[index] = updatedEntity;
                }
            } else {
                // Fallback: direct update
                entity.dataBinding = { ...entity.dataBinding, ...dataBinding };
                entity.dataBinding.lastApplied = new Date().toISOString();
            }
            
            // Re-render specific entity
            if (this.entityRenderer) {
                await this.entityRenderer.rerender(entityId);
            } else {
                // Fallback: re-render entire canvas
                this.render();
            }
            
            console.log('✅ Canvas: Entity data binding updated');
            
        } catch (error) {
            console.error('❌ Canvas: Failed to update entity data binding:', error);
            throw error;
        }
    }

    /**
     * Get all entities
     */
    getEntities() {
        return this.entities;
    }

    /**
     * Get entity by ID
     */
    getEntity(entityId) {
        return this.entities.find(e => e.id === entityId);
    }

    /**
     * Get entity statistics
     */
    getStats() {
        return {
            totalEntities: this.entities.length,
            entitiesByType: this.entities.reduce((acc, entity) => {
                acc[entity.type] = (acc[entity.type] || 0) + 1;
                return acc;
            }, {}),
            hasWidgetManager: !!this.widgetManager,
            hasEntityRenderer: !!this.entityRenderer
        };
    }
}

// Register the custom element
customElements.define('dashboard-canvas-entity', DashboardCanvasEntity);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardCanvasEntity;
} else if (typeof window !== 'undefined') {
    window.DashboardCanvasEntity = DashboardCanvasEntity;
}