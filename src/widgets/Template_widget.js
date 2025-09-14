/**
 * 🏗️ WIDGET TEMPLATE - Modèle pour widgets auto-contenus
 * 
 * Template de base pour créer des widgets unifiés contenant :
 * - Métadonnées WidgetEntity complètes
 * - Code de rendu intégré (HTML/CSS/JS)
 * - Configuration et logique métier
 * - API standardisée
 * 
 * Copier ce template et personnaliser pour créer de nouveaux widgets.
 */

// ====================================================================
// 📋 WIDGET ENTITY METADATA - Template à personnaliser
// ====================================================================

const WIDGET_TEMPLATE_DEFINITION = {
    // === IDENTITÉ === (À MODIFIER)
    type: 'my-widget',                    // Identifiant unique du widget
    name: 'My Widget',                    // Nom affiché
    title: 'My Custom Widget',           // Titre par défaut
    version: '1.0.0',                    // Version du widget
    
    // === MÉTADONNÉES === (À PERSONNALISER)
    metadata: {
        description: 'Description de mon widget',
        author: 'Mon Nom',
        tags: ['category', 'type', 'usage'],
        category: 'Charts|Tables|KPI|Custom',    // Catégorie principale
        icon: '📊',                              // Emoji ou URL icon
        preview: 'data:image/svg+xml;base64,...', // Preview base64 (optionnel)
        documentation: 'Description détaillée du widget et de son usage'
    },
    
    // === CONFIGURATION DONNÉES === (À ADAPTER)
    dataBinding: {
        requirements: {
            dimensions: { min: 0, max: 5, required: false },  // Exigences dimensions
            measures: { min: 1, max: 3, required: true },     // Exigences mesures
            filters: { min: 0, max: 10, required: false }     // Exigences filtres
        },
        defaultBinding: {
            dimensions: [],
            measures: [],
            filters: []
        }
    },
    
    // === LAYOUT PAR DÉFAUT === (À AJUSTER)
    layout: {
        size: { width: 4, height: 3 },           // Taille par défaut (grid units)
        minSize: { width: 2, height: 2 },        // Taille minimale
        maxSize: { width: 12, height: 8 },       // Taille maximale
        responsive: true                          // Support responsive
    },
    
    // === CONFIGURATION WIDGET === (À PERSONNALISER)
    configuration: {
        // Exemple de configurations personnalisables
        colorScheme: { type: 'select', options: ['business', 'rainbow', 'monochrome'], default: 'business' },
        showTitle: { type: 'boolean', default: true },
        animation: { type: 'boolean', default: true }
    },
    
    // === RENDU === (À SPÉCIFIER)
    rendering: {
        engine: 'native-html|native-svg|chartjs|d3js|custom',  // Moteur de rendu
        dependencies: [],                                       // Dépendances externes (URLs)
        performance: {
            maxDataPoints: 1000,                               // Limite données
            updateMode: 'full|incremental'                     // Mode mise à jour
        }
    }
};

// ====================================================================
// 🎨 WIDGET CLASS TEMPLATE - Structure de base
// ====================================================================

class MyWidgetTemplate extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // État du widget
        this.widgetEntity = null;     // Entité associée
        this.data = [];              // Données du widget
        this.isRendered = false;     // État rendu
        
        // Configuration par défaut (fusionnée avec entity)
        this.config = {
            colorScheme: 'business',
            showTitle: true,
            animation: true
            // Ajouter autres configs par défaut
        };
        
        // Initialisation
        this.initializeWidget();
    }

    // ================================
    // 🔧 API PUBLIQUE STANDARDISÉE
    // ================================

    /**
     * Initialise le widget avec une entité WidgetEntity
     * @param {WidgetEntity} widgetEntity - L'entité contenant config et data
     */
    initializeWithEntity(widgetEntity) {
        this.widgetEntity = widgetEntity;
        
        // Fusionner configuration depuis l'entité
        if (widgetEntity.configuration) {
            Object.assign(this.config, widgetEntity.configuration);
        }
        
        // Charger données depuis dataBinding
        this.loadDataFromEntity();
        
        // Rendre le widget
        this.render();
        
        console.log(`🎨 ${WIDGET_TEMPLATE_DEFINITION.name} initialized with entity:`, widgetEntity.id);
    }

    /**
     * Met à jour les données du widget
     * @param {Array} newData - Nouvelles données
     */
    updateData(newData) {
        this.data = this.processRawData(newData);
        
        if (this.isRendered) {
            this.renderContent();
        }
    }

    /**
     * Met à jour la configuration du widget
     * @param {Object} newConfig - Nouvelle configuration
     */
    updateConfiguration(newConfig) {
        Object.assign(this.config, newConfig);
        
        if (this.isRendered) {
            this.render();
        }
    }

    /**
     * Obtient l'état actuel du widget
     * @returns {Object} État du widget
     */
    getState() {
        return {
            config: { ...this.config },
            data: [...this.data],
            isRendered: this.isRendered,
            entityId: this.widgetEntity?.id
        };
    }

    /**
     * Détruit le widget et nettoie les ressources
     */
    destroy() {
        // Nettoyer event listeners, timers, etc.
        this.cleanup();
        this.shadowRoot.innerHTML = '';
        this.isRendered = false;
    }

    // ================================
    // 🔧 MÉTHODES INTERNES À IMPLÉMENTER
    // ================================

    initializeWidget() {
        // Initialisation spécifique au widget
        // Ex: créer des objets, configurer des listeners, etc.
    }

    loadDataFromEntity() {
        if (!this.widgetEntity || !this.widgetEntity.dataBinding) {
            this.data = this.generateSampleData();
            return;
        }

        const { dimensions, measures, filters } = this.widgetEntity.dataBinding;
        
        // Valider les exigences
        const requirements = WIDGET_TEMPLATE_DEFINITION.dataBinding.requirements;
        if (measures.length < requirements.measures.min) {
            console.warn(`Widget requires at least ${requirements.measures.min} measures`);
            this.data = this.generateSampleData();
            return;
        }

        // TODO: Charger vraies données depuis dataSource
        // Pour l'instant, générer des données d'exemple
        this.data = this.generateSampleData();
    }

    processRawData(rawData) {
        // Traiter les données brutes selon les besoins du widget
        // À implémenter selon le type de widget
        return rawData || this.generateSampleData();
    }

    generateSampleData() {
        // Générer des données d'exemple pour le développement
        // À implémenter selon le type de widget
        return [
            { label: 'Sample 1', value: 100 },
            { label: 'Sample 2', value: 200 },
            { label: 'Sample 3', value: 150 }
        ];
    }

    // ================================
    // 🎨 RENDU DU WIDGET
    // ================================

    render() {
        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <div class="widget-container">
                ${this.config.showTitle ? this.renderHeader() : ''}
                <div class="widget-content">
                    ${this.renderContent()}
                </div>
                ${this.renderFooter()}
            </div>
        `;

        this.isRendered = true;
        this.postRender();
    }

    renderHeader() {
        return `
            <div class="widget-header">
                <h3 class="widget-title">${this.widgetEntity?.title || WIDGET_TEMPLATE_DEFINITION.title}</h3>
            </div>
        `;
    }

    renderContent() {
        // À implémenter - contenu principal du widget
        return `
            <div class="widget-main">
                <!-- Contenu principal du widget -->
                <p>Widget content goes here</p>
                <pre>${JSON.stringify(this.data, null, 2)}</pre>
            </div>
        `;
    }

    renderFooter() {
        // Footer optionnel (légende, contrôles, etc.)
        return '';
    }

    postRender() {
        // Actions après rendu (binding events, animations, etc.)
        this.bindEvents();
        
        if (this.config.animation) {
            this.initializeAnimations();
        }
    }

    bindEvents() {
        // Binding des événements UI
        // À implémenter selon les interactions du widget
    }

    initializeAnimations() {
        // Initialiser les animations si activées
        // À implémenter selon les besoins du widget
    }

    cleanup() {
        // Nettoyer les ressources (timers, listeners, etc.)
        // À implémenter si nécessaire
    }

    // ================================
    // 🎨 STYLES CSS À PERSONNALISER
    // ================================

    getStyles() {
        return `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }

                .widget-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: var(--background-primary, #ffffff);
                    border: 1px solid var(--border-light, #eaecee);
                    border-radius: var(--radius-md, 8px);
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .widget-header {
                    padding: var(--spacing-md, 16px);
                    background: var(--background-tertiary, #f8f9fa);
                    border-bottom: 1px solid var(--border-light, #eaecee);
                    flex-shrink: 0;
                }

                .widget-title {
                    margin: 0;
                    font-size: 1.1em;
                    font-weight: 600;
                    color: var(--text-primary, #1a2733);
                }

                .widget-content {
                    flex: 1;
                    padding: var(--spacing-md, 16px);
                    overflow: auto;
                }

                .widget-main {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                /* Styles responsive */
                @media (max-width: 600px) {
                    .widget-header,
                    .widget-content {
                        padding: var(--spacing-sm, 8px);
                    }
                    
                    .widget-title {
                        font-size: 1em;
                    }
                }

                /* Animation par défaut */
                .widget-container {
                    transition: all 0.3s ease;
                }

                /* États du widget */
                :host([loading]) .widget-content {
                    opacity: 0.6;
                    pointer-events: none;
                }

                :host([error]) .widget-container {
                    border-color: var(--semantic-red, #EE3939);
                }
            </style>
        `;
    }
}

// ====================================================================
// 🔌 ENREGISTREMENT ET EXPORT
// ====================================================================

// Enregistrer le custom element (remplacer par le nom réel)
// customElements.define('my-widget', MyWidgetTemplate);

// Exporter pour le système global
if (typeof window !== 'undefined') {
    window.WIDGET_TEMPLATE_DEFINITION = WIDGET_TEMPLATE_DEFINITION;
    window.MyWidgetTemplate = MyWidgetTemplate;
}

// Export pour modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WIDGET_TEMPLATE_DEFINITION,
        MyWidgetTemplate
    };
}

// ====================================================================
// 📖 INSTRUCTIONS D'UTILISATION
// ====================================================================

/*
COMMENT CRÉER UN NOUVEAU WIDGET :

1. Copier ce fichier template
2. Remplacer "WIDGET_TEMPLATE" par le nom de votre widget
3. Modifier WIDGET_TEMPLATE_DEFINITION avec vos métadonnées
4. Implémenter les méthodes :
   - generateSampleData()
   - processRawData()
   - renderContent()
   - bindEvents() (si interactions)
5. Personnaliser getStyles() avec votre CSS
6. Enregistrer avec customElements.define()

EXEMPLE D'UTILISATION :

// Chargement du widget
const widget = document.createElement('my-widget');

// Initialisation avec entité
const entity = new WidgetEntity({
    type: 'my-widget',
    title: 'Mon Widget Personnalisé',
    dataBinding: { measures: [...] }
});

widget.initializeWithEntity(entity);
document.body.appendChild(widget);

// Mise à jour
widget.updateData(newData);
widget.updateConfiguration({ colorScheme: 'rainbow' });
*/

console.log('🏗️ Widget Template loaded for creating unified widgets');