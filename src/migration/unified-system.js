/**
 * 🔄 Migration Script - Intégration Système Unifié
 * 
 * Ce script unifie le nouveau système de données (data-parser.js + data-model.js)
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
        // Gérer les événements de drag & drop à travers les panels
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('available-objects-panel')) {
                this.handleFieldDragStart(e);
            }
        });

        document.addEventListener('dragover', (e) => {
            const dropZone = e.target.closest('[data-drop-zone]');
            if (dropZone) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                dropZone.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            const dropZone = e.target.closest('[data-drop-zone]');
            if (dropZone && !dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            const dropZone = e.target.closest('[data-drop-zone]');
            if (dropZone) {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                this.handleFieldDrop(e, dropZone);
            }
        });
    }

    handleFieldDragStart(e) {
        const fieldData = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
        this.activeField = fieldData;
        
        // Notifier les composants
        this.dragStartHandlers.forEach(handler => handler(fieldData));
        
        console.log('🎯 DragDropManager: Field drag started', fieldData.name);
    }

    handleFieldDrop(e, dropZone) {
        if (!this.activeField) return;

        const dropType = dropZone.dataset.dropZone;
        const fieldCategory = this.activeField.category;

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
        this.dropHandlers.forEach(handler => 
            handler(this.activeField, dropZone, dropType)
        );

        console.log('✅ DragDropManager: Field dropped', this.activeField.name, 'on', dropType);
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
        this.dropHandlers.push(handler);
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
                this.handleWidgetCreation(e.detail);
            });
            
            console.log('⚙️ Feeding Panel connected to unified system');
        }
        
        // Dashboard Canvas
        const dashboardCanvas = document.querySelector('dashboard-canvas');
        if (dashboardCanvas && !dashboardCanvas.initialized) {
            dashboardCanvas.initialized = true;
            
            // Connect widget events
            dashboardCanvas.addEventListener('widgetAdded', (e) => {
                this.updateAllComponents('widgetAdded', e.detail);
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
            'dashboard-canvas',
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
        
        // Ajouter le widget au canvas
        const dashboardCanvas = document.querySelector('dashboard-canvas');
        if (dashboardCanvas && typeof dashboardCanvas.addWidget === 'function') {
            const widget = dashboardCanvas.addWidget(widgetConfig);
            
            // Si c'est un Bar Chart, créer le composant
            if (widgetConfig.type === 'bar-chart') {
                this.createBarChartWidget(widget, widgetConfig);
            }
            
            return widget;
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