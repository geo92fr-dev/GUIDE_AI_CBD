/**
 * WidgetManager - Management layer for WidgetEntity operations
 * 
 * Provides CRUD operations, validation, serialization, and lifecycle
 * management for WidgetEntity instances.
 */

class WidgetManager {
    constructor(repository = null) {
        this.entities = new Map(); // In-memory storage
        this.repository = repository; // External storage backend
        this.listeners = new Map(); // Event listeners
        this.entityRenderer = null; // Will be injected
        this.widgetDefinitions = new Map(); // Widget definitions storage
    }
    
    /**
     * Set entity renderer for rendering operations
     */
    setEntityRenderer(renderer) {
        this.entityRenderer = renderer;
        console.log('🎨 WidgetManager: Entity renderer attached');
    }
    
    /**
     * Set storage repository
     */
    setRepository(repository) {
        this.repository = repository;
        window.logIf('WIDGET_MANAGER_INIT', '💾 WidgetManager: Repository attached:', repository.constructor.name);
    }
    
    // === UNIFIED WIDGET LOADING ===
    
    /**
     * Load and register a unified widget file
     * @param {string} widgetPath - Path to the unified widget file
     * @returns {Promise<Object>} Widget definition and class
     */
    async loadUnifiedWidget(widgetPath) {
        try {
            // Load the widget file
            const script = document.createElement('script');
            script.src = widgetPath;
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
            
            // Extract widget definition from global scope
            const widgetDefinitions = this.extractWidgetDefinitions();
            
            if (widgetDefinitions.length === 0) {
                throw new Error('No widget definitions found in loaded script');
            }
            
            // Register each widget definition
            const registeredWidgets = [];
            for (const definition of widgetDefinitions) {
                await this.registerWidgetDefinition(definition);
                registeredWidgets.push(definition);
            }
            
            const definitions = this.extractWidgetDefinitions();
            
            return definitions;
            return registeredWidgets;
            
        } catch (error) {
            console.error('❌ WidgetManager: Failed to load unified widget:', error);
            throw error;
        }
    }
    
    /**
     * Extract widget definitions from global scope
     */
    extractWidgetDefinitions() {
        const definitions = [];
        
        // Look for widget definitions in window object
        for (const key in window) {
            if (key.endsWith('_WIDGET_DEFINITION') && typeof window[key] === 'object') {
                definitions.push(window[key]);
            }
        }
        
        return definitions;
    }
    
    /**
     * Register a widget definition for use in the system
     */
    async registerWidgetDefinition(definition) {
        window.logIf && window.logIf('WIDGET_REGISTRATION', '📋 WidgetManager: Registering widget definition:', definition.type);
        
        try {
            // Validate definition structure
            if (!definition.type || !definition.name) {
                throw new Error('Widget definition must have type and name');
            }
            
            // Store definition for widget creation
            this.widgetDefinitions.set(definition.type, definition);
            
            window.logIf && window.logIf('WIDGET_REGISTRATION', '✅ WidgetManager: Widget definition registered:', definition.type);
            this.emit('widgetDefinitionRegistered', definition);
            
        } catch (error) {
            console.error('❌ WidgetManager: Failed to register widget definition:', error);
            throw error;
        }
    }
    
    /**
     * Create widget entity from registered definition
     */
    createWidgetFromDefinition(type, config = {}) {
        console.log('🏭 WidgetManager: Creating widget from definition:', type);
        
        if (!this.widgetDefinitions || !this.widgetDefinitions.has(type)) {
            throw new Error(`Widget definition not found for type: ${type}`);
        }
        
        const definition = this.widgetDefinitions.get(type);
        console.log('📊 WidgetManager: Found definition with demoDataset:', !!definition.demoDataset);
        
        // Create entity config using definition as template
        const entityConfig = {
            type: definition.type,
            name: definition.name,
            title: config.title || definition.title,
            version: definition.version,
            metadata: { ...definition.metadata },
            dataBinding: { 
                ...definition.dataBinding.defaultBinding,
                ...config.dataBinding 
            },
            layout: { 
                ...definition.layout,
                ...config.layout 
            },
            configuration: {
                ...this.getDefaultConfiguration(definition.configuration),
                ...config.configuration
            },
            rendering: { ...definition.rendering }
        };
        
        // Create entity directly without calling createWidget (avoid recursion)
        const entity = new WidgetEntity(entityConfig);
        
        // 🎯 AUTO-PUSH DEMO DATASET si disponible
        if (definition.demoDataset && definition.demoDataset.data) {
            console.log('🚀 WidgetManager: Auto-pushing demo dataset to widget:', definition.demoDataset.metadata.name);
            
            // Initialiser widgetData si pas déjà fait
            if (!entity.widgetData) {
                entity.widgetData = {
                    rawData: null,
                    formattedData: null,
                    lastUpdated: null,
                    isLoaded: false
                };
            }
            
            // Pousser les données de démo
            entity.widgetData.rawData = definition.demoDataset.data;
            entity.widgetData.formattedData = definition.demoDataset.data;
            entity.widgetData.lastUpdated = new Date().toISOString();
            entity.widgetData.isLoaded = true;
            entity.widgetData.source = 'demo-dataset';
            entity.widgetData.metadata = definition.demoDataset.metadata;
            
            console.log('✅ WidgetManager: Demo dataset auto-pushed:', {
                source: entity.widgetData.source,
                rowCount: entity.widgetData.rawData.length,
                lastUpdated: entity.widgetData.lastUpdated
            });
        }
        
        // Validate entity
        const validation = entity.validate();
        if (!validation.isValid) {
            throw new Error(`Invalid widget entity: ${validation.errors.join(', ')}`);
        }
        
        // Store in memory
        this.entities.set(entity.id, entity);
        
        // Persist if repository available
        if (this.repository) {
            this.repository.save(entity);
        }
        
        console.log('✅ WidgetManager: Widget created from definition:', entity.getSummary());
        this.emit('widgetCreated', entity);
        
        return entity;
    }
    
    /**
     * Get default configuration values from definition
     */
    getDefaultConfiguration(configDefinition) {
        const defaultConfig = {};
        
        for (const [key, configItem] of Object.entries(configDefinition || {})) {
            if (configItem.default !== undefined) {
                defaultConfig[key] = configItem.default;
            }
        }
        
        return defaultConfig;
    }
    
    /**
     * Get available widget types
     */
    getAvailableWidgetTypes() {
        if (!this.widgetDefinitions) return [];
        
        return Array.from(this.widgetDefinitions.keys());
    }
    
    /**
     * Get widget definition by type
     */
    getWidgetDefinition(type) {
        return this.widgetDefinitions?.get(type) || null;
    }
    
    /**
     * Get all available widget definitions
     */
    getAvailableWidgetDefinitions() {
        if (!this.widgetDefinitions) return [];
        
        return Array.from(this.widgetDefinitions.values());
    }
    
    /**
     * Diagnostic method to check current state
     */
    getState() {
        const state = {
            totalDefinitions: this.widgetDefinitions ? this.widgetDefinitions.size : 0,
            totalEntities: this.entities ? this.entities.size : 0,
            definitionTypes: this.widgetDefinitions ? Array.from(this.widgetDefinitions.keys()) : [],
            entityIds: this.entities ? Array.from(this.entities.keys()) : [],
            windowDefinitions: Object.keys(window).filter(k => k.endsWith('_WIDGET_DEFINITION'))
        };
        
        window.logIf && window.logIf('WIDGET_MANAGER_INIT', '🔍 WidgetManager State:', state);
        return state;
    }
    
    // === CRUD OPERATIONS ===
    
    /**
     * Create a new widget entity
     */
    createWidget(type, config = {}) {
        console.log('🆕 WidgetManager: Creating widget:', type, config);
        
        try {
            // Check if we have a registered definition for this type
            if (this.widgetDefinitions && this.widgetDefinitions.has(type)) {
                console.log('🏭 WidgetManager: Using registered definition for:', type);
                return this.createWidgetFromDefinition(type, config);
            }
            
            // Fallback to basic entity creation
            const entity = new WidgetEntity({
                type: type,
                ...config
            });
            
            // Validate entity
            const validation = entity.validate();
            if (!validation.isValid) {
                throw new Error(`Invalid widget entity: ${validation.errors.join(', ')}`);
            }
            
            // Store in memory
            this.entities.set(entity.id, entity);
            
            // Persist if repository available
            if (this.repository) {
                this.repository.save(entity);
            }
            
            console.log('✅ WidgetManager: Widget created:', entity.getSummary());
            this.emit('widgetCreated', entity);
            
            return entity;
        } catch (error) {
            console.error('❌ WidgetManager: Failed to create widget:', error);
            throw error;
        }
    }
    
    /**
     * Get widget entity by ID
     */
    getWidget(id) {
        const entity = this.entities.get(id);
        if (entity) {
            console.log('📋 WidgetManager: Widget retrieved:', entity.getSummary());
        } else {
            console.warn('⚠️ WidgetManager: Widget not found:', id);
        }
        return entity || null;
    }
    
    /**
     * Update widget entity
     */
    updateWidget(id, updates) {
        console.log('🔄 WidgetManager: Updating widget:', id, updates);
        
        const entity = this.entities.get(id);
        if (!entity) {
            console.error('❌ WidgetManager: Widget not found for update:', id);
            return false;
        }
        
        try {
            // Apply updates
            if (updates.dataBinding) {
                Object.assign(entity.dataBinding, updates.dataBinding);
            }
            if (updates.layout) {
                Object.assign(entity.layout, updates.layout);
            }
            if (updates.rendering) {
                Object.assign(entity.rendering, updates.rendering);
            }
            if (updates.state) {
                Object.assign(entity.state, updates.state);
            }
            if (updates.metadata) {
                Object.assign(entity.metadata, updates.metadata);
            }
            
            // Handle widget data updates (new!)
            if (updates.data || updates.widgetData) {
                // Ensure entity.widgetData exists
                if (!entity.widgetData) {
                    entity.widgetData = {
                        rawData: [],
                        formattedData: [],
                        lastUpdated: null,
                        isLoaded: false
                    };
                }
                
                const dataUpdate = updates.widgetData || {
                    rawData: updates.data || [],
                    formattedData: updates.formattedData || [],
                    lastUpdated: new Date().toISOString(),
                    isLoaded: true
                };
                
                Object.assign(entity.widgetData, dataUpdate);
                console.log('📊 WidgetManager: Widget data updated', {
                    rawDataCount: entity.widgetData.rawData.length,
                    formattedDataCount: entity.widgetData.formattedData.length,
                    lastUpdated: entity.widgetData.lastUpdated
                });
            }
            
            // Update basic properties
            if (updates.name) entity.name = updates.name;
            if (updates.title) entity.title = updates.title;
            
            // Touch entity to update timestamp
            entity.touch();
            
            // Validate after update
            const validation = entity.validate();
            if (!validation.isValid) {
                throw new Error(`Invalid widget after update: ${validation.errors.join(', ')}`);
            }
            
            // Persist if repository available
            if (this.repository) {
                this.repository.save(entity);
            }
            
            console.log('✅ WidgetManager: Widget updated:', entity.getSummary());
            this.emit('widgetUpdated', entity);
            
            return true;
        } catch (error) {
            console.error('❌ WidgetManager: Failed to update widget:', error);
            return false;
        }
    }
    
    /**
     * Delete widget entity
     */
    deleteWidget(id) {
        console.log('🗑️ WidgetManager: Deleting widget:', id);
        
        const entity = this.entities.get(id);
        if (!entity) {
            console.warn('⚠️ WidgetManager: Widget not found for deletion:', id);
            return false;
        }
        
        try {
            // Remove from memory
            this.entities.delete(id);
            
            // Remove from repository
            if (this.repository) {
                this.repository.delete(id);
            }
            
            console.log('✅ WidgetManager: Widget deleted:', id);
            this.emit('widgetDeleted', { id, entity });
            
            return true;
        } catch (error) {
            console.error('❌ WidgetManager: Failed to delete widget:', error);
            return false;
        }
    }
    
    /**
     * Get all widget entities
     */
    getAllWidgets() {
        const widgets = Array.from(this.entities.values());
        return widgets;
    }
    
    /**
     * Get widgets filtered by criteria
     */
    getWidgets(filter = {}) {
        const allWidgets = this.getAllWidgets();
        
        let filtered = allWidgets;
        
        if (filter.type) {
            filtered = filtered.filter(w => w.type === filter.type);
        }
        
        if (filter.hasData) {
            filtered = filtered.filter(w => 
                w.dataBinding.dimensions.length > 0 || 
                w.dataBinding.measures.length > 0
            );
        }
        
        if (filter.hasError !== undefined) {
            filtered = filtered.filter(w => w.state.hasError === filter.hasError);
        }
        
        if (filter.isVisible !== undefined) {
            filtered = filtered.filter(w => w.state.isVisible === filter.isVisible);
        }
        
        console.log('🔍 WidgetManager: Filtered widgets:', filtered.length, 'of', allWidgets.length);
        return filtered;
    }
    
    // === DATA BINDING OPERATIONS ===
    
    /**
     * Apply data binding to widget
     */
    applyDataBinding(id, dataBinding) {
        console.log('🔗 WidgetManager: Applying data binding:', id, dataBinding);
        
        const entity = this.entities.get(id);
        if (!entity) {
            console.error('❌ WidgetManager: Widget not found for data binding:', id);
            return false;
        }
        
        try {
            // Validate data binding compatibility with widget type
            const validation = this.validateDataBindingCompatibility(entity.type, dataBinding);
            if (!validation.isValid) {
                throw new Error(`Data binding incompatible: ${validation.errors.join(', ')}`);
            }
            
            // Update entity data binding
            entity.dataBinding = {
                ...entity.dataBinding,
                ...dataBinding,
                lastApplied: new Date().toISOString()
            };
            
            // Apply data binding (clear loading/error states)
            entity.applyDataBinding();
            
            // Persist
            if (this.repository) {
                this.repository.save(entity);
            }
            
            console.log('✅ WidgetManager: Data binding applied:', entity.getSummary());
            this.emit('dataBindingApplied', { entity, dataBinding });
            
            return true;
        } catch (error) {
            console.error('❌ WidgetManager: Failed to apply data binding:', error);
            entity.setError(error.message);
            return false;
        }
    }
    
    /**
     * Validate data binding compatibility with widget type
     */
    validateDataBindingCompatibility(widgetType, dataBinding) {
        const errors = [];
        
        const requirements = {
            'bar-chart': { minDimensions: 1, minMeasures: 1 },
            'pie-chart': { minDimensions: 1, minMeasures: 1 },
            'table': { minDimensions: 0, minMeasures: 1 },
            'kpi': { minDimensions: 0, minMeasures: 1 }
        };
        
        const req = requirements[widgetType] || requirements['bar-chart'];
        
        if (dataBinding.dimensions.length < req.minDimensions) {
            errors.push(`${widgetType} requires at least ${req.minDimensions} dimension(s)`);
        }
        
        if (dataBinding.measures.length < req.minMeasures) {
            errors.push(`${widgetType} requires at least ${req.minMeasures} measure(s)`);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    // === SERIALIZATION OPERATIONS ===
    
    /**
     * Serialize widget entity to JSON string
     */
    serializeWidget(id) {
        const entity = this.entities.get(id);
        if (!entity) {
            throw new Error(`Widget not found for serialization: ${id}`);
        }
        
        console.log('💾 WidgetManager: Serializing widget:', id);
        return entity.serialize();
    }
    
    /**
     * Deserialize widget entity from JSON string
     */
    deserializeWidget(jsonString) {
        console.log('📥 WidgetManager: Deserializing widget entity');
        
        try {
            const entity = WidgetEntity.deserialize(jsonString);
            
            // Store in memory
            this.entities.set(entity.id, entity);
            
            // Persist if repository available
            if (this.repository) {
                this.repository.save(entity);
            }
            
            console.log('✅ WidgetManager: Widget deserialized:', entity.getSummary());
            this.emit('widgetDeserialized', entity);
            
            return entity;
        } catch (error) {
            console.error('❌ WidgetManager: Failed to deserialize widget:', error);
            throw error;
        }
    }
    
    /**
     * Export widget as complete package
     */
    exportWidget(id) {
        const entity = this.entities.get(id);
        if (!entity) {
            throw new Error(`Widget not found for export: ${id}`);
        }
        
        console.log('📦 WidgetManager: Exporting widget package:', id);
        
        const widgetPackage = {
            entity: entity,
            dependencies: this.getWidgetDependencies(entity),
            assets: this.getWidgetAssets(entity),
            documentation: this.getWidgetDocumentation(entity),
            examples: this.getWidgetExamples(entity),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return widgetPackage;
    }
    
    /**
     * Import widget from package
     */
    importWidget(widgetPackage) {
        console.log('📥 WidgetManager: Importing widget package');
        
        try {
            // Validate package structure
            if (!widgetPackage.entity) {
                throw new Error('Invalid widget package: missing entity');
            }
            
            // Create entity from package
            const entity = new WidgetEntity(widgetPackage.entity);
            
            // Generate new ID to avoid conflicts
            entity.id = entity.generateUniqueId();
            entity.metadata.created = new Date().toISOString();
            
            // Store entity
            this.entities.set(entity.id, entity);
            
            // Persist if repository available
            if (this.repository) {
                this.repository.save(entity);
            }
            
            console.log('✅ WidgetManager: Widget imported:', entity.getSummary());
            this.emit('widgetImported', { entity, package: widgetPackage });
            
            return entity;
        } catch (error) {
            console.error('❌ WidgetManager: Failed to import widget:', error);
            throw error;
        }
    }
    
    // === RENDERING OPERATIONS ===
    
    /**
     * Render widget to DOM container
     */
    async renderWidget(id, container) {
        const entity = this.entities.get(id);
        if (!entity) {
            console.error('❌ WidgetManager: Widget not found for rendering:', id);
            return false;
        }
        
        if (!this.entityRenderer) {
            console.error('❌ WidgetManager: No entity renderer available');
            return false;
        }
        
        console.log('🎨 WidgetManager: Rendering widget:', id);
        
        try {
            const startTime = performance.now();
            
            // Set loading state
            entity.setLoading(true);
            
            // Render using entity renderer
            const success = await this.entityRenderer.render(entity, container);
            
            if (success) {
                // Track performance
                const renderTime = performance.now() - startTime;
                entity.trackRenderTime(renderTime);
                entity.setLoading(false);
                
                console.log(`✅ WidgetManager: Widget rendered in ${renderTime.toFixed(2)}ms:`, id);
                this.emit('widgetRendered', { entity, renderTime });
            } else {
                entity.setError('Rendering failed');
                console.error('❌ WidgetManager: Widget rendering failed:', id);
            }
            
            return success;
        } catch (error) {
            entity.setError(error.message);
            console.error('❌ WidgetManager: Widget rendering error:', error);
            return false;
        }
    }
    
    // === UTILITY METHODS ===
    
    /**
     * Get widget dependencies (placeholder)
     */
    getWidgetDependencies(entity) {
        // TODO: Implement dependency detection
        return [];
    }
    
    /**
     * Get widget assets (placeholder)
     */
    getWidgetAssets(entity) {
        // TODO: Implement asset collection
        return [];
    }
    
    /**
     * Get widget documentation (placeholder)
     */
    getWidgetDocumentation(entity) {
        return `Documentation for ${entity.name} (${entity.type})`;
    }
    
    /**
     * Get widget examples (placeholder)
     */
    getWidgetExamples(entity) {
        // TODO: Implement example generation
        return [];
    }
    
    // === EVENT SYSTEM ===
    
    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * Emit event
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('❌ WidgetManager: Event listener error:', error);
                }
            });
        }
    }
    
    // === BULK OPERATIONS ===
    
    /**
     * Clear all widgets
     */
    clear() {
        console.log('🗑️ WidgetManager: Clearing all widgets');
        
        const count = this.entities.size;
        this.entities.clear();
        
        if (this.repository) {
            this.repository.clear();
        }
        
        console.log(`✅ WidgetManager: Cleared ${count} widgets`);
        this.emit('allWidgetsCleared', { count });
    }
    
    /**
     * Load widgets from repository
     */
    async loadFromRepository() {
        if (!this.repository) {
            console.warn('⚠️ WidgetManager: No repository available for loading');
            return [];
        }
        
        console.log('📥 WidgetManager: Loading widgets from repository');
        
        try {
            const entities = await this.repository.loadAll();
            
            // Store in memory
            entities.forEach(entity => {
                this.entities.set(entity.id, entity);
            });
            
            console.log(`✅ WidgetManager: Loaded ${entities.length} widgets from repository`);
            this.emit('widgetsLoaded', entities);
            
            return entities;
        } catch (error) {
            console.error('❌ WidgetManager: Failed to load widgets from repository:', error);
            return [];
        }
    }
    
    /**
     * Get manager statistics
     */
    getStats() {
        const widgets = this.getAllWidgets();
        
        return {
            totalWidgets: widgets.length,
            widgetTypes: [...new Set(widgets.map(w => w.type))],
            widgetsWithData: widgets.filter(w => 
                w.dataBinding.dimensions.length > 0 || 
                w.dataBinding.measures.length > 0
            ).length,
            widgetsWithErrors: widgets.filter(w => w.state.hasError).length,
            loadingWidgets: widgets.filter(w => w.state.isLoading).length,
            dirtyWidgets: widgets.filter(w => w.state.isDirty).length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WidgetManager;
} else if (typeof window !== 'undefined') {
    window.WidgetManager = WidgetManager;
}