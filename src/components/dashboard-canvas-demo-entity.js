/**
 * 🎨 Dashboard Canvas Demo - Affichage automatique de tous les widgets avec données de démo
 */
class DashboardCanvasDemoEntity extends HTMLElement {
    #hasRendered = false;
    constructor() {
        super();
        console.log('[DemoCanvas] Composant instancié');
        this.attachShadow({ mode: 'open' });
        this.entities = [];
        this.isInitializing = false;
        this.isInitialized = false;
        // Ne plus initialiser automatiquement - attendre l'appel explicite
        console.log('[DemoCanvas] Prêt pour initialisation à la demande');
    }

    async waitForWidgetElements() {
        // Attend que le service de découverte soit disponible et ait chargé les widgets
        console.log('[DemoCanvas] Attente du service de découverte...');
        
        let tries = 0;
        while (tries < 10) { // Réduire le nombre d'essais
            // Vérifier si le service de découverte est disponible
            if (window.widgetDiscovery) {
                try {
                    // Vérifier d'abord les widgets déjà chargés (cache)
                    const loadedWidgets = window.widgetDiscovery.getLoadedWidgets();
                    console.log('[DemoCanvas] Widgets déjà chargés:', loadedWidgets);
                    
                    if (loadedWidgets.size > 0) {
                        console.log('[DemoCanvas] ✅ Widgets déjà disponibles dans le cache');
                        return;
                    }
                    
                    // Sinon, découvrir les widgets (une seule fois)
                    if (tries === 0) {
                        const discoveredWidgets = await window.widgetDiscovery.discoverWidgets();
                        console.log('[DemoCanvas] Widgets découverts:', discoveredWidgets);
                    }
                } catch (error) {
                    console.warn('[DemoCanvas] Erreur lors de la vérification:', error);
                }
            }
            
            await new Promise(res => setTimeout(res, 200)); // Réduire le délai
            tries++;
        }
        console.warn('⚠️ [DemoCanvas] Timeout: widgets non disponibles après attente.');
    }

    async init() {
        console.log('[DemoCanvas] Initialisation démarrée');
        
        // Protection contre l'initialisation multiple
        if (this.isInitializing || this.isInitialized) {
            console.log('[DemoCanvas] Initialisation déjà en cours ou terminée, ignorant');
            return;
        }
        
        this.isInitializing = true;
        
        await this.waitForWidgetElements();
        console.log('[DemoCanvas] Tous les widgets sont enregistrés');

        // Sélection automatique du premier dataset dans le sélecteur
        const dataSourceSelector = document.getElementById('data-source-selector');
        if (dataSourceSelector) {
            // Sélectionner le premier dataset réel (ignorer l'option vide)
            if (dataSourceSelector.options.length > 1) {
                dataSourceSelector.selectedIndex = 1;
                dataSourceSelector.dispatchEvent(new Event('change'));
                console.log('[DemoCanvas] Premier dataset sélectionné:', dataSourceSelector.options[1].value);
            }
        }

        // Charger le dataset et alimenter les widgets
        let sampleData = [];
        let datasetUrl = '';
        if (dataSourceSelector && dataSourceSelector.options.length > 1) {
            datasetUrl = dataSourceSelector.options[1].value;
        } else {
            datasetUrl = 'samples/marketing-data.csv';
        }
        try {
            const response = await fetch(datasetUrl);
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',');
            sampleData = lines.slice(1).map(line => {
                const values = line.split(',');
                const obj = {};
                headers.forEach((h, i) => { obj[h] = values[i]; });
                return obj;
            });
        } catch (err) {
            console.warn('⚠️ Impossible de charger les données du dataset:', err);
        }

        await this.injectAllWidgetsWithSampleData(sampleData);
        console.log('[DemoCanvas] Entités injectées:', this.entities);
        if (!this.#hasRendered) {
            this.render();
            this.#hasRendered = true;
            console.log('[DemoCanvas] render() appelé');
        } else {
            console.log('[DemoCanvas] render() ignoré (déjà appelé)');
        }
        
        // Marquer l'initialisation comme terminée
        this.isInitializing = false;
        this.isInitialized = true;
        console.log('[DemoCanvas] ✅ Initialisation terminée');
    }

    async injectAllWidgetsWithSampleData() {
        console.log('[DemoCanvas] Injection des widgets avec données de démo...');
        
        // Protection contre la réinjection multiple
        if (this.entities.length > 0) {
            console.log('[DemoCanvas] Widgets déjà injectés, ignorant la réinjection');
            return;
        }
        
        let availableWidgets = [];
        
        // Utiliser le service de découverte pour obtenir les widgets disponibles
        if (window.widgetDiscovery) {
            try {
                const discoveredWidgets = await window.widgetDiscovery.discoverWidgets();
                console.log('[DemoCanvas] Widgets découverts:', discoveredWidgets);
                
                // Obtenir la bibliothèque de widgets pour le mapping
                const widgetLibrary = document.querySelector('widget-library');
                if (widgetLibrary && widgetLibrary.availableWidgets.length > 0) {
                    availableWidgets = widgetLibrary.availableWidgets;
                    console.log('[DemoCanvas] Widgets de la bibliothèque:', availableWidgets);
                } else {
                    throw new Error('Widget library not ready - no widgets available');
                }
            } catch (error) {
                console.error('[DemoCanvas] Erreur lors de la découverte des widgets:', error);
                throw new Error(`Demo Canvas: Widget discovery failed - ${error.message}`);
            }
        } else {
            console.error('[DemoCanvas] Service de découverte non disponible');
            throw new Error('Demo Canvas: Widget discovery service not available');
        }
        
        console.log('[DemoCanvas] Widgets à injecter:', availableWidgets);
        
        // sampleData est passé en paramètre
        for (const widget of availableWidgets) {
            let dataBinding = { dimensions: [], measures: [], filters: [] };
            if (arguments.length > 0 && Array.isArray(arguments[0]) && arguments[0].length > 0) {
                const sampleData = arguments[0];
                const row = sampleData[0];
                const allFields = Object.keys(row);
                dataBinding.dimensions = allFields.slice(0, widget.requirements.dimensions || 0);
                dataBinding.measures = allFields.slice(widget.requirements.dimensions || 0, (widget.requirements.dimensions || 0) + (widget.requirements.measures || 0));
                this.entities.push({
                    id: `demo_${widget.id}_${Date.now()}`,
                    type: widget.id,
                    title: widget.name + ' (Démo)',
                    layout: widget.size,
                    dataBinding: dataBinding,
                    configuration: { sampleData: sampleData }
                });
            }
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
                padding: 20px;
                box-sizing: border-box;
                background: var(--background-secondary, #1a1a1a);
                color: var(--text-primary, #ffffff);
                overflow-y: auto;
            }
            
            .canvas-demo-container {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            h3 {
                margin: 0 0 20px 0;
                padding: 10px;
                background: var(--primary-blue, #1B90FF);
                color: white;
                border-radius: 5px;
                text-align: center;
                font-size: 1.2em;
            }
            
            .widgets-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                flex: 1;
                align-items: start;
            }
            
            .demo-widget {
                min-height: 250px;
                background: var(--background-primary, #2d2d2d);
                border: 1px solid var(--border-light, #404040);
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
            
            .widget-demo {
                min-height: 100px;
                background: var(--background-primary, #2d2d2d);
                border: 1px solid var(--border-light, #404040);
                border-radius: 8px;
                padding: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-secondary, #cccccc);
                font-style: italic;
            }
        </style>
        <div class="canvas-demo-container">
            <h3>🎨 Demo Canvas: Tous les widgets</h3>
            <div class="widgets-grid">
                ${this.entities.map(entity => {
                    switch(entity.type) {
                        case 'bar-chart':
                            return `<bar-chart-widget-unified class='demo-widget' title='${entity.title}'></bar-chart-widget-unified>`;
                        case 'line-chart':
                            return `<line-chart-widget-unified class='demo-widget' title='${entity.title}'></line-chart-widget-unified>`;
                        case 'pie-chart':
                            return `<pie-chart-widget-unified class='demo-widget' title='${entity.title}'></pie-chart-widget-unified>`;
                        case 'table':
                            return `<table-widget-unified class='demo-widget' title='${entity.title}'></table-widget-unified>`;
                        case 'tile':
                            return `<tile-widget-unified class='demo-widget' title='${entity.title}'></tile-widget-unified>`;
                        default:
                            return `<div class='widget-demo'>${entity.title}</div>`;
                    }
                }).join('')}
            </div>
        </div>`;
        console.log('[DemoCanvas] HTML injecté dans le shadowRoot');
        // Log du contenu du shadowRoot pour diagnostic
        console.log('[DemoCanvas] shadowRoot.innerHTML:', this.shadowRoot.innerHTML);
        // Initialisation JS des widgets après injection
        setTimeout(() => {
            this.entities.forEach(entity => {
                let tag;
                switch(entity.type) {
                    case 'bar-chart': tag = 'bar-chart-widget-unified'; break;
                    case 'line-chart': tag = 'line-chart-widget-unified'; break;
                    case 'pie-chart': tag = 'pie-chart-widget-unified'; break;
                    case 'table': tag = 'table-widget-unified'; break;
                    case 'tile': tag = 'tile-widget-unified'; break;
                    default: return;
                }
                const widgetEl = this.shadowRoot.querySelector(`${tag}.demo-widget`);
                console.log(`[DemoCanvas] Recherche widget <${tag}>`, widgetEl);
                if (widgetEl && typeof widgetEl.initializeWithEntity === 'function') {
                    console.log(`[DemoCanvas] Appel initializeWithEntity sur <${tag}>`, entity);
                    widgetEl.initializeWithEntity({
                        ...entity,
                        configuration: { ...entity.configuration }
                    });
                } else if (widgetEl && typeof widgetEl.updateData === 'function') {
                    console.log(`[DemoCanvas] Appel updateData sur <${tag}>`, entity.configuration.sampleData);
                    widgetEl.updateData(entity.configuration.sampleData);
                } else {
                    console.warn(`[DemoCanvas] Widget <${tag}> non initialisé (méthode manquante)`);
                }
            });
            console.log('[DemoCanvas] Initialisation JS des widgets terminée');
            // Log du contenu du shadowRoot après initialisation JS
            console.log('[DemoCanvas] shadowRoot.innerHTML après init:', this.shadowRoot.innerHTML);
        }, 0);
    }

    /**
     * Créer un mapping de widgets à partir des widgets découverts
     */
    createWidgetMappingFromDiscovered(discoveredWidgets) {
        const widgetMappings = {
            'widget_bar-chart_v1.0.js': {
                id: 'bar-chart', name: 'Bar Chart', type: 'chart',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 6, height: 4 }
            },
            'widget_line-chart_v1.0.js': {
                id: 'line-chart', name: 'Line Chart', type: 'chart',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 8, height: 4 }
            },
            'widget_pie-chart_v1.0.js': {
                id: 'pie-chart', name: 'Pie Chart', type: 'chart',
                requirements: { dimensions: 1, measures: 1 },
                size: { width: 4, height: 4 }
            },
            'widget_table_v1.0.js': {
                id: 'table', name: 'Table', type: 'table',
                requirements: { dimensions: 0, measures: 0 },
                size: { width: 12, height: 6 }
            },
            'widget_tile_v1.0.js': {
                id: 'tile', name: 'KPI Tile', type: 'kpi',
                requirements: { dimensions: 0, measures: 1 },
                size: { width: 4, height: 3 }
            }
        };

        return discoveredWidgets
            .map(widgetPath => {
                const filename = widgetPath.split('/').pop();
                return widgetMappings[filename];
            })
            .filter(widget => widget !== undefined);
    }
}

customElements.define('dashboard-canvas-demo-entity', DashboardCanvasDemoEntity);
