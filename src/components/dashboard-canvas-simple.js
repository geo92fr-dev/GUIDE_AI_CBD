/**
 * 🎯 Simple Widget Display - Zone d'affichage ultra-simplifiée
 * 
 * Affichage direct du widget sans structure de canvas complexe
 */

class DashboardCanvasEntity extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // État ultra-simplifié
        this.currentWidget = null;  // Widget actuellement affiché
        this.widgetManager = null;  // Gestionnaire de widgets
        this.dualModeRenderer = null;  // Renderer pour affichage
        
        this.init();
    }

    async init() {
        // Initialiser les systèmes de base
        await this.initializeSimpleSystems();
        this.render();
        this.bindEvents();
    }

    /**
     * Initialiser les systèmes simplifiés
     */
    async initializeSimpleSystems() {
        console.log('🎯 Simple Display: Initializing basic systems');
        
        try {
            // Initialize WidgetManager
            if (typeof WidgetManager !== 'undefined') {
                this.widgetManager = new WidgetManager();
                window.widgetManager = this.widgetManager;
                console.log('✅ Simple Display: WidgetManager initialized');
            }

            // Initialize DualModeRenderer
            if (typeof WidgetDualModeRenderer !== 'undefined') {
                this.dualModeRenderer = new WidgetDualModeRenderer();
                window.dualModeRenderer = this.dualModeRenderer; // Exposer globalement
                console.log('✅ Simple Display: DualModeRenderer initialized and exposed globally');
            }
        } catch (error) {
            console.error('❌ Simple Display: Initialization failed:', error);
        }
    }

    /**
     * Render ultra-simplifié
     */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    background: var(--background-primary, #f8f9fa);
                }
                
                .widget-display {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    box-sizing: border-box;
                }
                
                .widget-container {
                    width: 95%;
                    height: 95%;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .widget-header {
                    background: #007bff;
                    color: white;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-height: 50px;
                }
                
                .widget-title {
                    font-weight: 600;
                    font-size: 1.1em;
                }
                
                .widget-content {
                    flex: 1;
                    padding: 0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .widget-render-area {
                    flex: 1;
                    width: 100%;
                    height: 100%;
                }
                
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #6c757d;
                    text-align: center;
                }
                
                .empty-icon {
                    font-size: 4em;
                    margin-bottom: 16px;
                    opacity: 0.6;
                }
                
                .empty-text {
                    font-size: 1.2em;
                    margin-bottom: 8px;
                }
                
                .empty-hint {
                    font-size: 0.9em;
                    opacity: 0.7;
                }
            </style>
            
            <div class="widget-display">
                ${this.currentWidget ? this.renderCurrentWidget() : this.renderEmptyState()}
            </div>
        `;
    }

    /**
     * Afficher le widget actuel
     */
    renderCurrentWidget() {
        return `
            <div class="widget-container">
                <div class="widget-content">
                    <div class="widget-render-area" id="widget-render-${this.currentWidget.id}">
                        <!-- Le widget sera rendu ici avec son propre toggle intégré -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Afficher l'état vide
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🧩</div>
                <div class="empty-text">No Widget Selected</div>
                <div class="empty-hint">Drag & drop a widget from the library to display it here</div>
            </div>
        `;
    }

    /**
     * Ajouter/remplacer widget (ultra-simplifié)
     */
    async addEntity(entityConfig) {
        console.log('🎯 Simple Display: Displaying widget:', entityConfig.type);
        
        try {
            let widget;
            
            if (this.widgetManager) {
                widget = this.widgetManager.createWidget(entityConfig.type, entityConfig);
            } else {
                widget = this.createSimpleWidget(entityConfig);
            }

            // Remplacer le widget actuel
            this.currentWidget = widget;
            
            // Re-render
            this.render();
            
            // Attendre que le DOM soit mis à jour
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Rendre le widget dans sa zone
            await this.renderWidgetContent();
            
            console.log('✅ Simple Display: Widget displayed successfully:', widget.id);
            return widget;
        } catch (error) {
            console.error('❌ Simple Display: Failed to display widget:', error);
            return null;
        }
    }

    /**
     * Rendre le contenu du widget
     */
    async renderWidgetContent() {
        if (!this.currentWidget) return;
        
        const renderArea = this.shadowRoot.querySelector(`#widget-render-${this.currentWidget.id}`);
        if (!renderArea) {
            console.warn('⚠️ Simple Display: Render area not found');
            return;
        }
        
        try {
            if (this.dualModeRenderer) {
                // Le DualModeRenderer gère maintenant tout : wrapper, header, toggle et contenu
                await this.dualModeRenderer.renderWidget(this.currentWidget, renderArea);
                console.log('✅ Simple Display: Widget with integrated toggle rendered');
            } else {
                // Fallback simple
                renderArea.innerHTML = `<div style="padding: 20px; text-align: center;">Widget: ${this.currentWidget.type}</div>`;
                console.log('✅ Simple Display: Widget content rendered via fallback');
            }
        } catch (error) {
            console.error('❌ Simple Display: Widget rendering failed:', error);
            renderArea.innerHTML = `<div style="padding: 20px; color: red;">Error rendering widget</div>`;
        }
    }

    /**
     * Créer un widget simple en fallback
     */
    createSimpleWidget(config) {
        return {
            id: 'widget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: config.type,
            title: config.title || config.type,
            ...config
        };
    }

    /**
     * Bind events
     */
    bindEvents() {
        // Pas d'événements spécifiques - les widgets gèrent leurs propres toggles
        console.log('� Simple Display: Events bound (minimal)');
    }

    /**
     * Clear widget
     */
    clearWidget() {
        this.currentWidget = null;
        this.render();
        console.log('🗑️ Simple Display: Widget cleared');
    }

    /**
     * Get current widget
     */
    getCurrentWidget() {
        return this.currentWidget;
    }
}

// Register the custom element
customElements.define('dashboard-canvas-entity', DashboardCanvasEntity);

console.log('✅ Simple Widget Display component loaded');