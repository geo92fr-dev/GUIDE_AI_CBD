/**
 * 🔄 Migration Script - Intégration Système Unifié
 * 
 * Ce script unifie le nouveau système de données (data-            // IMPORTANT: Only handle if this is a field drop zone AND we have an active field
            // AND the drop zone is either in feeding-panel OR found via Shadow DOM
            console.log('🔍 DragDropManager: NEW VERSION - Checking conditions:');
            console.log('  - dropZone exists:', !!dropZone);
            console.log('  - activeField exists:', !!this.activeField);
            console.log('  - activeField.type === "field":', this.activeField?.type === 'field');
            const isInFeedingPanel = !!dropZone?.closest('feeding-panel') || !!e.target.closest('feeding-panel');
            console.log('  - dropZone in feeding-panel (or target in feeding-panel):', isInFeedingPanel);
            console.log('  - e.target.closest("feeding-panel"):', !!e.target.closest('feeding-panel'));
            
            if (dropZone && this.activeField && this.activeField.type === 'field' && isInFeedingPanel) {
                console.log('🔄 DragDropManager: PREVENTING DEFAULT - allowing field drop');
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                dropZone.classList.add('drag-over');
            } else {
                console.log('🚫 DragDropManager: NOT preventing default - conditions not met');
            } data-model.js)
 * avec l'architecture existante dans index.html selon WIDGET_TECH_SPEC.md
 */

// Remplacer les anciens utilitaires par le nouveau système de données
window.DataParserLegacy = window.DataParser; // Backup si nécessaire
window.DataParser = class DataParser {
    constructor() {
        this.parser = new (window.DataParser || class {
            async parseCSV(text, options = {}) {
                console.warn('⚠️ DataParser not loaded, using fallback');
                return { data: [], fields: [], metadata: {} };
            }
        })();
    }

    async parseCSV(text, options = {}) {
        return await this.parser.parseCSV(text, options);
    }
};

// Migration du State Manager vers Data Model
window.StateManagerLegacy = window.StateManager; // Backup
window.StateManager = class StateManager {
    constructor() {
        this.dataModel = window.dataModel || new DataModel();
        this.subscribers = new Map();
    }

    // Adapter l'API existante vers le nouveau DataModel
    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType).push(callback);
        
        // Mapper vers les événements du DataModel
        if (eventType === 'dataLoaded') {
            this.dataModel.on('dataSourceChanged', callback);
        } else if (eventType === 'fieldsUpdated') {
            this.dataModel.on('fieldsUpdated', callback);
        }
    }

    // Migration des méthodes de données
    loadData(dataSource) {
        return this.dataModel.loadDataSource(dataSource);
    }

    getData() {
        return this.dataModel.getActiveDataSource();
    }

    getFields() {
        return this.dataModel.getFields();
    }

    getDimensions() {
        return this.dataModel.getDimensions();
    }

    getMeasures() {
        return this.dataModel.getMeasures();
    }
};

// Migration du Drag & Drop Manager
window.DragDropManagerLegacy = window.DragDropManager;
window.DragDropManager = class DragDropManager {
    constructor() {
        this.activeField = null;
        this.dropZones = new Map();
        this.dragStartHandlers = [];
        this.dropHandlers = [];
        
        this.initializeGlobalDragHandlers();
    }

    initializeGlobalDragHandlers() {
        console.log('🔧 DragDropManager: RE-ENABLED for field drag & drop only');
        
        // Écouter l'événement customisé fieldDragStart avec les bonnes données
        document.addEventListener('fieldDragStart', (e) => {
            console.log('🔍 DragDropManager: fieldDragStart event received', e.detail);
            this.handleFieldDragStart(e);
        });
        
        // Gérer les événements de drag & drop à travers les panels (backup)
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('available-objects-panel')) {
                console.log('🔍 DragDropManager: Native dragstart from available-objects-panel');
            }
        });

        document.addEventListener('dragend', (e) => {
            // Reset active field when drag ends
            if (this.activeField && e.target.closest('available-objects-panel')) {
                this.activeField = null;
                console.log('🏁 DragDropManager: Field drag ended');
            }
        });

        document.addEventListener('dragover', (e) => {
            // Recherche dans le Shadow DOM aussi
            let dropZone = e.target.closest('[data-drop-zone]');
            
            // Si pas trouvé, chercher dans le Shadow DOM des composants
            if (!dropZone) {
                const feedingPanel = e.target.closest('feeding-panel');
                if (feedingPanel && feedingPanel.shadowRoot) {
                    // Utiliser les coordonnées de la souris pour trouver l'élément dans le Shadow DOM
                    const elementFromPoint = feedingPanel.shadowRoot.elementFromPoint(e.clientX, e.clientY);
                    if (elementFromPoint) {
                        dropZone = elementFromPoint.closest('[data-drop-zone]');
            
            if (dropZone && this.activeField && this.activeField.type === 'field') {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                dropZone.classList.add('drag-over');
                return;
            }
                    }
                }
            }
            
            if (dropZone) {
                console.log('🔍 DragDropManager: dragover detected, dropZone:', dropZone.dataset.dropZone);
                console.log('🔍 DragDropManager: dropZone element:', dropZone.tagName, dropZone.className);
                console.log('🔍 DragDropManager: activeField:', this.activeField);
                console.log('🔍 DragDropManager: dropZone in feeding-panel:', !!dropZone.closest('feeding-panel'));
            } else {
                console.log('🔍 DragDropManager: No drop zone found, target:', e.target.tagName, e.target.className);
                console.log('🔍 DragDropManager: Target has data-drop-zone?', e.target.hasAttribute?.('data-drop-zone'));
                console.log('🔍 DragDropManager: Target parent:', e.target.parentElement?.tagName, e.target.parentElement?.className);
                console.log('🔍 DragDropManager: Looking for feeding-panel...', !!e.target.closest('feeding-panel'));
            }
            
            // IMPORTANT: Only handle if this is a field drop zone AND we have an active field
            // AND the drop zone is inside the feeding panel (Data Assignment)
            if (dropZone && this.activeField && this.activeField.type === 'field' && 
                dropZone.closest('feeding-panel')) {
                console.log('🔄 DragDropManager: PREVENTING DEFAULT - allowing field drop');
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                dropZone.classList.add('drag-over');
            } else {
                console.log('� DragDropManager: NOT preventing default - conditions not met');
            }
        });

        document.addEventListener('dragleave', (e) => {
            const dropZone = e.target.closest('[data-drop-zone]');
            // Only handle if this is a field drop zone AND we have an active field
            // AND the drop zone is inside the feeding panel
            if (dropZone && this.activeField && this.activeField.type === 'field' && 
                dropZone.closest('feeding-panel') && !dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
                console.log('🔄 DragDropManager: DRAGLEAVE - field left data assignment zone');
            }
        });

        document.addEventListener('drop', (e) => {
            // Même logique que dragover : chercher dans Shadow DOM
            let dropZone = e.target.closest('[data-drop-zone]');
            
            if (!dropZone) {
                const feedingPanel = e.target.closest('feeding-panel');
                if (feedingPanel && feedingPanel.shadowRoot) {
                    const elementFromPoint = feedingPanel.shadowRoot.elementFromPoint(e.clientX, e.clientY);
                    if (elementFromPoint) {
                        dropZone = elementFromPoint.closest('[data-drop-zone]');
                    }
                }
            }
            
            // Only handle if this is a field drop zone AND we have an active field
            if (dropZone && this.activeField && this.activeField.type === 'field') {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                this.handleFieldDrop(e, dropZone);
            }
        });
    }

    handleFieldDragStart(e) {
        console.log('🔍 DragDropManager: handleFieldDragStart called');
        
        // Si c'est un événement customisé fieldDragStart, on a les données dans e.detail
        if (e.detail && e.detail.type === 'field') {
            this.activeField = {
                type: 'field',
                data: e.detail,
                id: e.detail.id,
                name: e.detail.displayName || e.detail.name
            };
            console.log('🎯 DragDropManager: Field drag started from custom event:', this.activeField);
            return;
        }
        
        // Fallback : chercher l'élément field item dans un événement natif
        const fieldElement = e.target.closest('.field-item') || e.target.querySelector('.field-item');
        console.log('🔍 DragDropManager: fieldElement found:', !!fieldElement);
        console.log('🔍 DragDropManager: event target:', e.target.tagName, e.target.className);
        
        if (fieldElement) {
            this.activeField = { type: 'field', element: fieldElement };
            console.log('🎯 DragDropManager: Field drag started from element:', fieldElement.dataset.fieldId);
        } else {
            console.log('🔍 DragDropManager: No field element found, checking event target:', e.target);
        }
    }

    handleFieldDrop(e, dropZone) {
        console.log('🎯 DragDropManager: handleFieldDrop called!');
        console.log('🎯 DragDropManager: activeField:', this.activeField);
        console.log('🎯 DragDropManager: dropZone:', dropZone.dataset.dropZone);

        if (!this.activeField || this.activeField.type !== 'field') {
            return;
        }

        // Get the actual field data from the drag event
        try {
            const fieldData = JSON.parse(e.dataTransfer.getData('application/json'));
            
            if (fieldData.type !== 'field') {
                return; // Only handle field drops
            }
            
            const dropType = dropZone.dataset.dropZone;
            const fieldCategory = fieldData.category;

            // Validation des drops selon les règles WebI
            if (dropType === 'dimensions' && fieldCategory !== 'DIMENSION') {
                this.showDropError('Only dimensions can be dropped here');
                return;
            }

            if (dropType === 'measures' && fieldCategory !== 'MEASURE') {
                this.showDropError('Only measures can be dropped here');
                return;
            }

            // Notifier les composants du drop réussi
            this.dropHandlers.forEach((handler) => {
                try {
                    handler(fieldData, dropZone, dropType);
                } catch (error) {
                    console.error('❌ DragDropManager: Handler error:', error);
                }
            });

            // Si pas de handlers, mettre à jour directement le feeding-panel
            if (this.dropHandlers.length === 0) {
                const feedingPanel = document.querySelector('feeding-panel');
                if (feedingPanel && feedingPanel.addField) {
                    feedingPanel.addField(fieldData, dropType);
                }
            }
        } catch (error) {
            console.warn('⚠️ DragDropManager: Invalid field data');
        }
        
        this.activeField = null;
    }

    showDropError(message) {
        console.warn('⚠️ Drop error:', message);
        // Afficher une notification temporaire
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--business-red, #e74c3c);
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            z-index: 10000;
            font-family: var(--font-family-base);
            font-size: 0.9em;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // API pour l'enregistrement des handlers
    onDragStart(handler) {
        this.dragStartHandlers.push(handler);
    }

    onDrop(handler) {
        console.log('🔧 DragDropManager: Registering drop handler:', typeof handler);
        this.dropHandlers.push(handler);
        console.log('🔧 DragDropManager: Total handlers now:', this.dropHandlers.length);
    }

    // Méthodes utilitaires
    registerDropZone(element, type) {
        element.setAttribute('data-drop-zone', type);
        this.dropZones.set(element, type);
    }

    unregisterDropZone(element) {
        element.removeAttribute('data-drop-zone');
        this.dropZones.delete(element);
    }
};

// Configuration globale pour la compatibilité
window.WidgetPlatform = {
    version: '1.0.0',
    dataModel: null,
    stateManager: null,
    dragDropManager: null,
    
    init() {
        console.log('🔄 Initializing Unified Widget Platform...');
        
        // Initialiser le système de données unifié
        this.dataModel = window.dataModel || new DataModel();
        this.stateManager = new StateManager();
        this.dragDropManager = new DragDropManager();
        
        // Configurer les événements globaux
        this.setupGlobalEvents();
        
        // Initialiser les composants
        this.initializeComponents();
        
        console.log('✅ Unified Widget Platform initialized');
    },
    
    setupGlobalEvents() {
        // Événements de données
        this.dataModel.on('dataSourceChanged', (dataSource) => {
            console.log('📊 Data source changed:', dataSource?.name);
            this.updateAllComponents('dataSourceChanged', dataSource);
        });
        
        this.dataModel.on('fieldsUpdated', (fields) => {
            console.log('🏷️ Fields updated:', fields.length);
            this.updateAllComponents('fieldsUpdated', fields);
        });
        
        // Événements de drag & drop
        this.dragDropManager.onDragStart((fieldData) => {
            this.updateAllComponents('fieldDragStart', fieldData);
        });
        
        this.dragDropManager.onDrop((fieldData, dropZone, dropType) => {
            this.updateAllComponents('fieldDrop', { fieldData, dropZone, dropType });
        });
    },
    
    initializeComponents() {
        // Available Objects Panel
        const availableObjectsPanel = document.querySelector('available-objects-panel');
        if (availableObjectsPanel && !availableObjectsPanel.initialized) {
            availableObjectsPanel.initialized = true;
            
            // Connect drag events
            availableObjectsPanel.addEventListener('fieldDragStart', (e) => {
                this.updateAllComponents('fieldDragStart', e.detail);
            });
            
            availableObjectsPanel.addEventListener('fieldDragEnd', (e) => {
                this.updateAllComponents('fieldDragEnd', e.detail);
            });
            
            console.log('📚 Available Objects Panel connected to unified system');
        }
        
        // Feeding Panel
        const feedingPanel = document.querySelector('feeding-panel');
        if (feedingPanel && !feedingPanel.initialized) {
            feedingPanel.initialized = true;
            
            // Connect assignment events
            feedingPanel.addEventListener('assignmentChanged', (e) => {
                this.updateAllComponents('assignmentChanged', e.detail);
            });
            
            feedingPanel.addEventListener('createWidget', (e) => {
                // Only handle widget creation from feeding panel, not from drag & drop
                if (e.detail.source !== 'drag-drop') {
                    this.handleWidgetCreation(e.detail);
                }
            });
            
            console.log('⚙️ Feeding Panel connected to unified system');
        }
        
        // Dashboard Canvas Entity
        const dashboardCanvas = document.querySelector('dashboard-canvas-entity');
        if (dashboardCanvas && !dashboardCanvas.initialized) {
            dashboardCanvas.initialized = true;
            
            // Connect entity events
            dashboardCanvas.addEventListener('entityAdded', (e) => {
                this.updateAllComponents('entityAdded', e.detail);
            });
            
            console.log('🎨 Dashboard Canvas connected to unified system');
        }
        
        // Widget Library
        const widgetLibrary = document.querySelector('widget-library');
        if (widgetLibrary && !widgetLibrary.initialized) {
            widgetLibrary.initialized = true;
            
            // Connect widget selection events
            widgetLibrary.addEventListener('widgetSelected', (e) => {
                this.handleWidgetSelection(e.detail);
            });
            
            console.log('🧩 Widget Library connected to unified system');
        }
    },
    
    updateAllComponents(eventType, data) {
        // Notifier tous les composants des changements
        const components = [
            'available-objects-panel',
            'feeding-panel',
            'dashboard-canvas-entity',
            'widget-library'
        ];
        
        components.forEach(tagName => {
            const element = document.querySelector(tagName);
            if (element && typeof element.handleGlobalEvent === 'function') {
                element.handleGlobalEvent(eventType, data);
            }
        });
    },
    
    // API publique pour l'interaction avec les composants
    loadCSVFile(file) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('📤 Loading CSV file:', file.name);
                
                const text = await file.text();
                const parser = new DataParser();
                const result = await parser.parseCSV(text, {
                    source: file.name,
                    autoDetectTypes: true,
                    analyzeDimensions: true
                });
                
                this.dataModel.loadDataSource(result);
                resolve(result);
                
            } catch (error) {
                console.error('❌ Error loading CSV:', error);
                reject(error);
            }
        });
    },
    
    getDataModel() {
        return this.dataModel;
    },
    
    getStateManager() {
        return this.stateManager;
    },
    
    getDragDropManager() {
        return this.dragDropManager;
    },
    
    // Gestionnaires d'événements inter-composants
    handleWidgetSelection(widgetData) {
        console.log('🧩 Widget selected globally:', widgetData.name);
        
        // Notifier le Feeding Panel
        const feedingPanel = document.querySelector('feeding-panel');
        if (feedingPanel && typeof feedingPanel.selectWidget === 'function') {
            feedingPanel.selectWidget(widgetData.type);
        }
        
        this.updateAllComponents('widgetSelected', widgetData);
    },
    
    handleWidgetCreation(widgetConfig) {
        console.log('✨ Creating widget globally:', widgetConfig.type);
        
        // Ajouter l'entité au canvas
        const dashboardCanvas = document.querySelector('dashboard-canvas-entity');
        if (dashboardCanvas && typeof dashboardCanvas.addEntity === 'function') {
            const entity = dashboardCanvas.addEntity(widgetConfig);
            
            // Si c'est un Bar Chart, créer le composant entity
            if (widgetConfig.type === 'bar-chart') {
                this.createBarChartEntity(entity, widgetConfig);
            }
            
            return entity;
        }
        
        return null;
    },
    
    createBarChartWidget(widget, config) {
        // Trouver le conteneur du widget dans le canvas
        setTimeout(() => {
            const widgetContent = document.querySelector(`#widget-content-${widget.id}`);
            if (widgetContent) {
                // Créer le composant Bar Chart
                const barChart = document.createElement('bar-chart-widget');
                barChart.setConfig({
                    ...config,
                    id: widget.id
                });
                
                // Remplacer le contenu par défaut
                widgetContent.innerHTML = '';
                widgetContent.appendChild(barChart);
                
                console.log('📊 Bar Chart Widget created and integrated');
            }
        }, 100);
    }
};

// Auto-initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.WidgetPlatform.init();
    });
} else {
    window.WidgetPlatform.init();
}

// Export pour les modules
window.WidgetPlatform = WidgetPlatform;