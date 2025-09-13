/**
 * EntityRenderer - Rendering engine for WidgetEntity
 * 
 * Handles the rendering of widgets based on their WidgetEntity configuration,
 * including source code processing, template substitution, and DOM manipulation.
 */

class EntityRenderer {
    constructor() {
        this.templateCache = new Map();
        this.renderedWidgets = new Map();
        
        console.log('🎨 EntityRenderer: Initialized');
    }
    
    /**
     * Render widget entity to DOM container
     */
    async render(entity, container) {
        console.log('🎨 EntityRenderer: Rendering widget:', entity.id, entity.type);
        
        try {
            // Validate inputs
            if (!entity || !container) {
                throw new Error('Invalid entity or container for rendering');
            }
            
            // Set loading state
            entity.setLoading(true);
            
            // Get rendered HTML
            const html = await this.generateHTML(entity);
            
            // Inject into container
            container.innerHTML = html;
            
            // Apply custom CSS if available
            if (entity.rendering.customCSS) {
                this.applyCustomCSS(entity, container);
            }
            
            // Initialize interactivity
            await this.initializeInteractivity(entity, container);
            
            // Mark as successfully rendered
            entity.setLoading(false);
            entity.clearError();
            
            // Cache rendered widget
            this.renderedWidgets.set(entity.id, {
                entity: entity,
                container: container,
                renderedAt: new Date().toISOString()
            });
            
            console.log('✅ EntityRenderer: Widget rendered successfully:', entity.id);
            return true;
            
        } catch (error) {
            console.error('❌ EntityRenderer: Rendering failed:', error);
            entity.setError(`Rendering failed: ${error.message}`);
            
            // Show error state in container
            this.renderErrorState(entity, container, error);
            return false;
        }
    }
    
    /**
     * Generate HTML from entity
     */
    async generateHTML(entity) {
        console.log('🔧 EntityRenderer: Generating HTML for:', entity.type);
        
        // Get base source code
        let html = entity.getRenderedSourceCode();
        
        // Apply data binding if available
        if (this.hasDataBinding(entity)) {
            html = await this.applyDataBinding(entity, html);
        }
        
        // Apply widget-specific enhancements
        html = this.enhanceWidgetHTML(entity, html);
        
        return html;
    }
    
    /**
     * Check if entity has data binding
     */
    hasDataBinding(entity) {
        return entity.dataBinding.dimensions.length > 0 || 
               entity.dataBinding.measures.length > 0 ||
               entity.dataBinding.filters.length > 0;
    }
    
    /**
     * Apply data binding to HTML template
     */
    async applyDataBinding(entity, html) {
        console.log('🔗 EntityRenderer: Applying data binding');
        
        try {
            // Create data status section
            const dataStatus = this.generateDataStatus(entity);
            
            // Replace content placeholder with data-aware content
            html = html.replace(
                /<div class="chart-placeholder">[\s\S]*?<\/div>/,
                dataStatus
            );
            
            // Add data binding information
            html = this.addDataBindingInfo(entity, html);
            
            return html;
        } catch (error) {
            console.error('❌ EntityRenderer: Data binding application failed:', error);
            return html; // Return original HTML on error
        }
    }
    
    /**
     * Generate data status display
     */
    generateDataStatus(entity) {
        const dimensionsCount = entity.dataBinding.dimensions.length;
        const measuresCount = entity.dataBinding.measures.length;
        const filtersCount = entity.dataBinding.filters.length;
        
        const lastApplied = entity.dataBinding.lastApplied;
        const timeString = lastApplied ? new Date(lastApplied).toLocaleTimeString() : 'Never';
        
        return `
            <div class="widget-data-status">
                <div class="data-connected-indicator">
                    <div class="status-icon">✅</div>
                    <div class="status-text">Data Connected</div>
                </div>
                <div class="data-summary">
                    <span class="data-item">📊 ${dimensionsCount} dimensions</span>
                    <span class="data-separator">•</span>
                    <span class="data-item">📈 ${measuresCount} measures</span>
                    <span class="data-separator">•</span>
                    <span class="data-item">🔍 ${filtersCount} filters</span>
                </div>
                <div class="data-timestamp">
                    Last updated: ${timeString}
                </div>
            </div>
        `;
    }
    
    /**
     * Add data binding information to HTML
     */
    addDataBindingInfo(entity, html) {
        // Add data attributes for runtime access
        html = html.replace(
            'data-widget-id="' + entity.id + '"',
            `data-widget-id="${entity.id}" 
             data-has-data="true"
             data-dimensions="${entity.dataBinding.dimensions.length}"
             data-measures="${entity.dataBinding.measures.length}"
             data-filters="${entity.dataBinding.filters.length}"`
        );
        
        return html;
    }
    
    /**
     * Enhance HTML based on widget type
     */
    enhanceWidgetHTML(entity, html) {
        console.log('🎨 EntityRenderer: Enhancing HTML for widget type:', entity.type);
        
        // Add widget-specific CSS classes
        html = html.replace(
            'class="widget-container',
            `class="widget-container widget-${entity.type} entity-rendered`
        );
        
        // Add entity metadata as data attributes
        html = this.addEntityMetadata(entity, html);
        
        // Apply widget-specific styling
        html = this.applyWidgetStyling(entity, html);
        
        return html;
    }
    
    /**
     * Add entity metadata as data attributes
     */
    addEntityMetadata(entity, html) {
        const metadata = `
            data-entity-id="${entity.id}"
            data-entity-type="${entity.type}"
            data-entity-version="${entity.version}"
            data-entity-created="${entity.metadata.created}"
            data-entity-updated="${entity.metadata.updated}"
        `.replace(/\s+/g, ' ').trim();
        
        html = html.replace(
            `data-widget-id="${entity.id}"`,
            `data-widget-id="${entity.id}" ${metadata}`
        );
        
        return html;
    }
    
    /**
     * Apply widget-specific styling
     */
    applyWidgetStyling(entity, html) {
        // Widget size styling
        const sizeStyle = `
            width: ${entity.layout.size.width * 100}px;
            height: ${entity.layout.size.height * 80}px;
            min-width: ${entity.layout.size.minWidth || 200}px;
            min-height: ${entity.layout.size.minHeight || 150}px;
        `;
        
        // Add styling to container
        html = html.replace(
            'class="widget-container',
            `style="${sizeStyle}" class="widget-container`
        );
        
        return html;
    }
    
    /**
     * Apply custom CSS to rendered widget
     */
    applyCustomCSS(entity, container) {
        console.log('🎨 EntityRenderer: Applying custom CSS');
        
        try {
            // Create or update style element
            let styleId = `widget-style-${entity.id}`;
            let styleElement = document.getElementById(styleId);
            
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }
            
            // Scope CSS to widget container
            const scopedCSS = this.scopeCSS(entity.rendering.customCSS, entity.id);
            styleElement.textContent = scopedCSS;
            
        } catch (error) {
            console.error('❌ EntityRenderer: Custom CSS application failed:', error);
        }
    }
    
    /**
     * Scope CSS to specific widget
     */
    scopeCSS(css, widgetId) {
        // Simple CSS scoping - prepend widget selector to each rule
        const scopePrefix = `[data-widget-id="${widgetId}"]`;
        
        return css.replace(/([^{}]+){/g, (match, selector) => {
            return `${scopePrefix} ${selector.trim()} {`;
        });
    }
    
    /**
     * Initialize widget interactivity
     */
    async initializeInteractivity(entity, container) {
        console.log('🔧 EntityRenderer: Initializing interactivity');
        
        try {
            // Add basic hover effects
            this.addHoverEffects(entity, container);
            
            // Add click handlers if configured
            if (entity.rendering.interactivity.clickable) {
                this.addClickHandlers(entity, container);
            }
            
            // Add resize handlers if configured
            if (entity.rendering.interactivity.resizable) {
                this.addResizeHandlers(entity, container);
            }
            
            // Initialize widget-specific interactivity
            await this.initializeWidgetSpecificInteractivity(entity, container);
            
        } catch (error) {
            console.error('❌ EntityRenderer: Interactivity initialization failed:', error);
        }
    }
    
    /**
     * Add hover effects
     */
    addHoverEffects(entity, container) {
        const widgetElement = container.querySelector(`[data-widget-id="${entity.id}"]`);
        if (!widgetElement) return;
        
        widgetElement.addEventListener('mouseenter', () => {
            widgetElement.classList.add('widget-hover');
        });
        
        widgetElement.addEventListener('mouseleave', () => {
            widgetElement.classList.remove('widget-hover');
        });
    }
    
    /**
     * Add click handlers
     */
    addClickHandlers(entity, container) {
        const widgetElement = container.querySelector(`[data-widget-id="${entity.id}"]`);
        if (!widgetElement) return;
        
        widgetElement.addEventListener('click', (event) => {
            console.log('🖱️ EntityRenderer: Widget clicked:', entity.id);
            
            // Dispatch custom event
            const clickEvent = new CustomEvent('widgetClicked', {
                detail: { entity, element: widgetElement, originalEvent: event }
            });
            document.dispatchEvent(clickEvent);
        });
    }
    
    /**
     * Initialize widget-specific interactivity
     */
    async initializeWidgetSpecificInteractivity(entity, container) {
        // Placeholder for widget-specific interactivity
        // This would be extended based on widget type requirements
        
        switch (entity.type) {
            case 'bar-chart':
                await this.initializeBarChartInteractivity(entity, container);
                break;
            case 'pie-chart':
                await this.initializePieChartInteractivity(entity, container);
                break;
            case 'table':
                await this.initializeTableInteractivity(entity, container);
                break;
        }
    }
    
    /**
     * Bar chart specific interactivity
     */
    async initializeBarChartInteractivity(entity, container) {
        // Placeholder for bar chart specific features
        console.log('📊 EntityRenderer: Initializing bar chart interactivity');
    }
    
    /**
     * Pie chart specific interactivity
     */
    async initializePieChartInteractivity(entity, container) {
        // Placeholder for pie chart specific features
        console.log('🥧 EntityRenderer: Initializing pie chart interactivity');
    }
    
    /**
     * Table specific interactivity
     */
    async initializeTableInteractivity(entity, container) {
        // Placeholder for table specific features
        console.log('📋 EntityRenderer: Initializing table interactivity');
    }
    
    /**
     * Render error state
     */
    renderErrorState(entity, container, error) {
        console.log('❌ EntityRenderer: Rendering error state');
        
        const errorHTML = `
            <div class="widget-container widget-error" data-widget-id="${entity.id}">
                <div class="widget-header">
                    <h3 class="widget-title">${entity.title}</h3>
                </div>
                <div class="widget-content">
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <div class="error-title">Rendering Error</div>
                        <div class="error-message">${error.message}</div>
                        <div class="error-details">
                            <div>Widget ID: ${entity.id}</div>
                            <div>Widget Type: ${entity.type}</div>
                            <div>Timestamp: ${new Date().toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = errorHTML;
    }
    
    /**
     * Re-render widget (for updates)
     */
    async rerender(entityId) {
        const cached = this.renderedWidgets.get(entityId);
        if (!cached) {
            console.warn('⚠️ EntityRenderer: Widget not found in cache for re-render:', entityId);
            return false;
        }
        
        console.log('🔄 EntityRenderer: Re-rendering widget:', entityId);
        return await this.render(cached.entity, cached.container);
    }
    
    /**
     * Remove widget from cache
     */
    removeFromCache(entityId) {
        console.log('🗑️ EntityRenderer: Removing widget from cache:', entityId);
        
        // Remove custom CSS
        const styleElement = document.getElementById(`widget-style-${entityId}`);
        if (styleElement) {
            styleElement.remove();
        }
        
        // Remove from cache
        this.renderedWidgets.delete(entityId);
    }
    
    /**
     * Get rendering statistics
     */
    getStats() {
        return {
            renderedWidgets: this.renderedWidgets.size,
            templateCacheSize: this.templateCache.size,
            widgets: Array.from(this.renderedWidgets.keys())
        };
    }
    
    /**
     * Clear all cached widgets
     */
    clearCache() {
        console.log('🗑️ EntityRenderer: Clearing all cached widgets');
        
        // Remove all custom styles
        this.renderedWidgets.forEach((cached, entityId) => {
            const styleElement = document.getElementById(`widget-style-${entityId}`);
            if (styleElement) {
                styleElement.remove();
            }
        });
        
        // Clear caches
        this.renderedWidgets.clear();
        this.templateCache.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EntityRenderer;
} else if (typeof window !== 'undefined') {
    window.EntityRenderer = EntityRenderer;
}