/**
 * Simple Drag & Drop System
 * Solution de contournement pour les problèmes de drag & drop
 */

class SimpleDragDrop {
    constructor() {
        this.isDragging = false;
        this.dragData = null;
        this.dragElement = null;
        this.dropZones = new Map();
        
        this.init();
    }
    
    init() {
        console.log('� SimpleDragDrop: DISABLED - using click-to-add system instead');
        return; // Complètement désactivé
        
        // Ancien code de drag & drop commenté
        /*
        console.log('🚀 SimpleDragDrop: Initializing bypass system');
        
        // Gérer tous les dragstart de façon globale
        document.addEventListener('dragstart', (e) => {
            this.handleDragStart(e);
        }, true); // Capture phase
        */
    }
    
    handleDragStart(e) {
        console.log('🟢 SimpleDragDrop: DRAGSTART detected');
        
        // Détecter si c'est un widget
        const widgetItem = e.target.closest('.widget-item');
        if (widgetItem && widgetItem.hasAttribute('draggable')) {
            this.isDragging = true;
            this.dragElement = widgetItem;
            
            const widgetData = {
                id: widgetItem.dataset.widgetId,
                name: widgetItem.dataset.widgetName,
                icon: widgetItem.dataset.widgetIcon,
                description: widgetItem.dataset.widgetDescription,
                requirements: JSON.parse(widgetItem.dataset.widgetRequirements || '{}'),
                size: JSON.parse(widgetItem.dataset.widgetSize || '{"width": 4, "height": 3}'),
                type: 'widget'
            };
            
            this.dragData = widgetData;
            
            // Forcer les données
            try {
                e.dataTransfer.setData('application/json', JSON.stringify(widgetData));
                e.dataTransfer.effectAllowed = 'copy';
            } catch (error) {
                console.warn('Could not set dataTransfer, using fallback');
            }
            
            console.log('🧩 SimpleDragDrop: Widget drag started:', widgetData.name);
            return;
        }
        
        // Sinon, c'est peut-être un field - laisser passer
        console.log('🔵 SimpleDragDrop: Non-widget drag detected');
    }
    
    handleDragEnd(e) {
        if (this.isDragging) {
            console.log('🔴 SimpleDragDrop: DRAGEND - cleaning up');
            this.isDragging = false;
            this.dragData = null;
            this.dragElement = null;
        }
    }
    
    handleDragOver(e) {
        if (!this.isDragging || !this.dragData || this.dragData.type !== 'widget') {
            return; // Ne gérer que les widgets
        }
        
        // Vérifier si on survole le canvas
        const canvas = e.target.closest('dashboard-canvas-entity');
        if (canvas) {
            console.log('🟡 SimpleDragDrop: DRAGOVER on entity canvas');
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
            
            // Ajouter classe visual
            const container = canvas.shadowRoot.querySelector('.canvas-container');
            if (container) {
                container.classList.add('drag-over');
            }
        }
    }
    
    handleDrop(e) {
        if (!this.isDragging || !this.dragData || this.dragData.type !== 'widget') {
            return; // Ne gérer que les widgets
        }
        
        // Vérifier si on drop sur le canvas
        const canvas = e.target.closest('dashboard-canvas-entity');
        if (canvas) {
            console.log('🟢 SimpleDragDrop: DROP on entity canvas');
            e.preventDefault();
            e.stopPropagation();
            
            // Nettoyer visual
            const container = canvas.shadowRoot.querySelector('.canvas-container');
            if (container) {
                container.classList.remove('drag-over');
            }
            
            // Simuler le drop sur le canvas
            this.triggerCanvasDrop(canvas, this.dragData, e);
        }
    }
    
    triggerCanvasDrop(canvas, widgetData, originalEvent) {
        console.log('🎯 SimpleDragDrop: Triggering canvas drop for:', widgetData.name);
        
        // Appeler directement la méthode du canvas
        if (canvas.handleWidgetDrop) {
            canvas.handleWidgetDrop(widgetData, originalEvent);
        } else {
            console.warn('Canvas handleWidgetDrop method not found');
        }
    }
}

// Initialiser le système de contournement
window.SimpleDragDrop = new SimpleDragDrop();