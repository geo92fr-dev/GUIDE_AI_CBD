/**
 * 🔄 Entity Migration Helper
 * 
 * Helper functions to migrate from simple widget objects to WidgetEntity system
 * and integrate all Entity-based components together.
 */

class EntityMigrationHelper {
    constructor() {
        this.migrationLog = [];
        console.log('🔄 EntityMigrationHelper: Initialized');
    }

    /**
     * Migrate simple widget to WidgetEntity
     */
    migrateWidgetToEntity(widget) {
        console.log('🔄 Migration: Converting widget to entity:', widget.id);
        
        try {
            // Create WidgetEntity instance
            const entity = new WidgetEntity({
                id: widget.id,
                type: widget.type,
                title: widget.title || `${widget.type} Widget`,
                description: widget.description || `A ${widget.type} widget`,
                category: this.getWidgetCategory(widget.type)
            });

            // Migrate layout properties
            if (widget.size) {
                entity.layout.size.width = widget.size.width || 4;
                entity.layout.size.height = widget.size.height || 1;
            }

            if (widget.position) {
                entity.layout.position.x = widget.position.x || 0;
                entity.layout.position.y = widget.position.y || 0;
            }

            // Migrate data configuration to data binding
            if (widget.dataConfig) {
                entity.dataBinding.dimensions = widget.dataConfig.dimensions || [];
                entity.dataBinding.measures = widget.dataConfig.measures || [];
                entity.dataBinding.filters = widget.dataConfig.filters || [];
                entity.dataBinding.lastApplied = widget.dataConfig.timestamp || null;
            }

            // Migrate state
            if (widget.loading !== undefined) {
                entity.setLoading(widget.loading);
            }

            if (widget.error) {
                entity.setError(widget.error);
            }

            // Generate source code from widget template
            this.generateSourceCodeForEntity(entity);

            this.migrationLog.push({
                type: 'widget_to_entity',
                originalId: widget.id,
                entityId: entity.id,
                timestamp: new Date().toISOString(),
                success: true
            });

            console.log('✅ Migration: Widget converted to entity successfully');
            return entity;

        } catch (error) {
            console.error('❌ Migration: Failed to convert widget to entity:', error);
            
            this.migrationLog.push({
                type: 'widget_to_entity',
                originalId: widget.id,
                timestamp: new Date().toISOString(),
                success: false,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Generate source code for entity based on type
     */
    generateSourceCodeForEntity(entity) {
        const sourceCode = this.getSourceCodeTemplate(entity.type);
        
        // Set rendering properties
        entity.rendering.sourceCode = sourceCode;
        entity.rendering.template = this.getWidgetTemplate(entity.type);
        entity.rendering.customCSS = this.getDefaultCSS(entity.type);
        
        console.log(`📝 Migration: Generated source code for ${entity.type} entity`);
    }

    /**
     * Get source code template by widget type
     */
    getSourceCodeTemplate(type) {
        const templates = {
            'bar-chart': `
                <div class="widget-container" data-widget-id="{{id}}" data-widget-type="bar-chart">
                    <div class="widget-header">
                        <h3 class="widget-title">{{title}}</h3>
                    </div>
                    <div class="widget-content">
                        <div class="chart-placeholder">
                            <div class="chart-icon">📊</div>
                            <div class="chart-title">Bar Chart</div>
                            <div class="chart-description">Ready for data visualization</div>
                        </div>
                    </div>
                </div>
            `,
            'pie-chart': `
                <div class="widget-container" data-widget-id="{{id}}" data-widget-type="pie-chart">
                    <div class="widget-header">
                        <h3 class="widget-title">{{title}}</h3>
                    </div>
                    <div class="widget-content">
                        <div class="chart-placeholder">
                            <div class="chart-icon">🥧</div>
                            <div class="chart-title">Pie Chart</div>
                            <div class="chart-description">Ready for data visualization</div>
                        </div>
                    </div>
                </div>
            `,
            'line-chart': `
                <div class="widget-container" data-widget-id="{{id}}" data-widget-type="line-chart">
                    <div class="widget-header">
                        <h3 class="widget-title">{{title}}</h3>
                    </div>
                    <div class="widget-content">
                        <div class="chart-placeholder">
                            <div class="chart-icon">📈</div>
                            <div class="chart-title">Line Chart</div>
                            <div class="chart-description">Ready for data visualization</div>
                        </div>
                    </div>
                </div>
            `,
            'table': `
                <div class="widget-container" data-widget-id="{{id}}" data-widget-type="table">
                    <div class="widget-header">
                        <h3 class="widget-title">{{title}}</h3>
                    </div>
                    <div class="widget-content">
                        <div class="table-placeholder">
                            <div class="table-icon">📋</div>
                            <div class="table-title">Data Table</div>
                            <div class="table-description">Ready for data display</div>
                        </div>
                    </div>
                </div>
            `
        };

        return templates[type] || templates['bar-chart'];
    }

    /**
     * Get widget template object
     */
    getWidgetTemplate(type) {
        return {
            name: `${type}-template`,
            version: '1.0.0',
            variables: ['id', 'title', 'data'],
            placeholders: {
                'chart-placeholder': 'Chart will be rendered here',
                'table-placeholder': 'Table will be rendered here'
            }
        };
    }

    /**
     * Get default CSS for widget type
     */
    getDefaultCSS(type) {
        return `
            .widget-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: var(--background-primary);
                border-radius: var(--radius-md);
                overflow: hidden;
            }
            
            .widget-header {
                padding: 12px 16px;
                background: var(--background-tertiary);
                border-bottom: 1px solid var(--border-light);
            }
            
            .widget-title {
                margin: 0;
                font-size: 0.9em;
                font-weight: 500;
                color: var(--text-primary);
            }
            
            .widget-content {
                flex: 1;
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .chart-placeholder, .table-placeholder {
                text-align: center;
                color: var(--text-secondary);
            }
            
            .chart-icon, .table-icon {
                font-size: 2.5em;
                margin-bottom: 8px;
                opacity: 0.8;
            }
            
            .chart-title, .table-title {
                font-size: 1.1em;
                font-weight: 500;
                margin-bottom: 4px;
                color: var(--text-primary);
            }
            
            .chart-description, .table-description {
                font-size: 0.85em;
                opacity: 0.7;
            }
        `;
    }

    /**
     * Get widget category by type
     */
    getWidgetCategory(type) {
        const categories = {
            'bar-chart': 'chart',
            'line-chart': 'chart',
            'pie-chart': 'chart',
            'table': 'data'
        };
        return categories[type] || 'general';
    }

    /**
     * Migrate entire widget array to entities
     */
    async migrateWidgetsToEntities(widgets, widgetManager = null) {
        console.log(`🔄 Migration: Converting ${widgets.length} widgets to entities`);
        
        const entities = [];
        const errors = [];

        for (const widget of widgets) {
            try {
                const entity = this.migrateWidgetToEntity(widget);
                
                // Save to manager if available
                if (widgetManager) {
                    await widgetManager.save(entity);
                }
                
                entities.push(entity);
                
            } catch (error) {
                console.error(`❌ Migration: Failed to migrate widget ${widget.id}:`, error);
                errors.push({ widget, error });
            }
        }

        console.log(`✅ Migration: Converted ${entities.length} widgets, ${errors.length} errors`);
        
        return {
            entities,
            errors,
            migrationLog: this.migrationLog
        };
    }

    /**
     * Initialize Entity system in existing application
     */
    async initializeEntitySystem() {
        console.log('🏗️ Migration: Initializing Entity system');
        
        try {
            // Check if core classes are available
            const coreClassesAvailable = this.checkCoreClasses();
            if (!coreClassesAvailable.allAvailable) {
                throw new Error(`Missing core classes: ${coreClassesAvailable.missing.join(', ')}`);
            }

            // Initialize WidgetManager
            const widgetManager = new WidgetManager();
            console.log('✅ Migration: WidgetManager initialized');

            // Initialize EntityRenderer
            const entityRenderer = new EntityRenderer();
            console.log('✅ Migration: EntityRenderer initialized');

            // Get repository for persistence
            const repository = WidgetRepositoryFactory.create('localStorage');
            widgetManager.setRepository(repository);
            console.log('✅ Migration: Repository configured');

            return {
                widgetManager,
                entityRenderer,
                repository
            };

        } catch (error) {
            console.error('❌ Migration: Failed to initialize Entity system:', error);
            throw error;
        }
    }

    /**
     * Check if core Entity classes are available
     */
    checkCoreClasses() {
        const requiredClasses = [
            'WidgetEntity',
            'WidgetManager', 
            'EntityRenderer',
            'WidgetRepositoryFactory'
        ];

        const missing = [];
        const available = [];

        for (const className of requiredClasses) {
            if (typeof window[className] !== 'undefined' || typeof global[className] !== 'undefined') {
                available.push(className);
            } else {
                missing.push(className);
            }
        }

        return {
            allAvailable: missing.length === 0,
            available,
            missing
        };
    }

    /**
     * Replace old canvas with Entity-based canvas
     */
    replaceCanvasWithEntityVersion(canvasSelector = 'dashboard-canvas') {
        console.log('🔄 Migration: Replacing canvas with Entity version');
        
        try {
            const oldCanvas = document.querySelector(canvasSelector);
            if (!oldCanvas) {
                throw new Error(`Canvas not found: ${canvasSelector}`);
            }

            // Create new Entity-based canvas
            const newCanvas = document.createElement('dashboard-canvas-entity');
            
            // Copy relevant attributes
            if (oldCanvas.id) {
                newCanvas.id = oldCanvas.id;
            }
            
            // Copy classes
            if (oldCanvas.className) {
                newCanvas.className = oldCanvas.className;
            }

            // Replace in DOM
            oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);
            
            console.log('✅ Migration: Canvas replaced successfully');
            return newCanvas;

        } catch (error) {
            console.error('❌ Migration: Failed to replace canvas:', error);
            throw error;
        }
    }

    /**
     * Update feeding panel to work with entities
     */
    updateFeedingPanelForEntities() {
        console.log('🔄 Migration: Updating feeding panel for entities');
        
        try {
            const feedingPanel = document.querySelector('feeding-panel');
            if (!feedingPanel) {
                console.warn('⚠️ Migration: Feeding panel not found');
                return;
            }

            // Add entity compatibility flag
            feedingPanel.setAttribute('entity-mode', 'true');
            
            // Trigger refresh if method exists
            if (feedingPanel.refreshWidgetList) {
                feedingPanel.refreshWidgetList();
            }
            
            console.log('✅ Migration: Feeding panel updated');

        } catch (error) {
            console.error('❌ Migration: Failed to update feeding panel:', error);
        }
    }

    /**
     * Full migration workflow
     */
    async performFullMigration(options = {}) {
        console.log('🚀 Migration: Starting full migration to Entity system');
        
        try {
            const {
                canvasSelector = 'dashboard-canvas',
                preserveData = true,
                backupData = true
            } = options;

            // Step 1: Backup existing data if requested
            let backup = null;
            if (backupData) {
                backup = this.createBackup();
                console.log('💾 Migration: Data backup created');
            }

            // Step 2: Initialize Entity system
            const entitySystem = await this.initializeEntitySystem();

            // Step 3: Migrate existing widgets if any
            const oldCanvas = document.querySelector(canvasSelector);
            let migrationResult = null;
            
            if (oldCanvas && oldCanvas.widgets && preserveData) {
                migrationResult = await this.migrateWidgetsToEntities(
                    oldCanvas.widgets, 
                    entitySystem.widgetManager
                );
                console.log(`📦 Migration: Migrated ${migrationResult.entities.length} widgets`);
            }

            // Step 4: Replace canvas
            const newCanvas = this.replaceCanvasWithEntityVersion(canvasSelector);

            // Step 5: Update feeding panel
            this.updateFeedingPanelForEntities();

            // Step 6: Load entities into new canvas
            if (migrationResult && migrationResult.entities.length > 0) {
                newCanvas.entities = migrationResult.entities;
                newCanvas.render();
            }

            const result = {
                success: true,
                entitySystem,
                newCanvas,
                migrationResult,
                backup,
                timestamp: new Date().toISOString()
            };

            console.log('🎉 Migration: Full migration completed successfully');
            return result;

        } catch (error) {
            console.error('❌ Migration: Full migration failed:', error);
            throw error;
        }
    }

    /**
     * Create backup of current state
     */
    createBackup() {
        console.log('💾 Migration: Creating backup');
        
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                widgets: [],
                canvasState: null
            };

            // Backup canvas widgets
            const canvas = document.querySelector('dashboard-canvas');
            if (canvas && canvas.widgets) {
                backup.widgets = JSON.parse(JSON.stringify(canvas.widgets));
                backup.canvasState = {
                    gridColumns: canvas.gridColumns,
                    gridGap: canvas.gridGap
                };
            }

            // Store backup in localStorage
            localStorage.setItem('widget_backup_' + Date.now(), JSON.stringify(backup));
            
            console.log('✅ Migration: Backup created successfully');
            return backup;

        } catch (error) {
            console.error('❌ Migration: Failed to create backup:', error);
            return null;
        }
    }

    /**
     * Get migration statistics
     */
    getMigrationStats() {
        const stats = {
            totalMigrations: this.migrationLog.length,
            successfulMigrations: this.migrationLog.filter(m => m.success).length,
            failedMigrations: this.migrationLog.filter(m => !m.success).length,
            migrationsByType: this.migrationLog.reduce((acc, m) => {
                acc[m.type] = (acc[m.type] || 0) + 1;
                return acc;
            }, {}),
            lastMigration: this.migrationLog[this.migrationLog.length - 1] || null
        };

        return stats;
    }

    /**
     * Clear migration log
     */
    clearMigrationLog() {
        this.migrationLog = [];
        console.log('🗑️ Migration: Log cleared');
    }
}

// Create global instance
const entityMigrationHelper = new EntityMigrationHelper();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EntityMigrationHelper, entityMigrationHelper };
} else if (typeof window !== 'undefined') {
    window.EntityMigrationHelper = EntityMigrationHelper;
    window.entityMigrationHelper = entityMigrationHelper;
}