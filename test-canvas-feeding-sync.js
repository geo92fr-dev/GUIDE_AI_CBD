/**
 * Script de test pour vérifier la synchronisation Canvas ↔ Feeding Panel
 */

// Fonction pour tester l'ajout d'un widget et la mise à jour du feeding panel
function testWidgetAddition() {
    console.log('🧪 TEST: Adding widget to canvas');
    
    const canvas = document.querySelector('dashboard-canvas-entity');
    const feedingPanel = document.querySelector('feeding-panel');
    
    if (!canvas || !feedingPanel) {
        console.error('❌ Canvas or Feeding Panel not found');
        return;
    }
    
    // Récupérer le nombre initial d'entités
    const initialCount = canvas.getEntities().length;
    console.log('📊 Initial entities count:', initialCount);
    
    // Ajouter un widget
    const widgetConfig = {
        type: 'bar-chart',
        title: 'Test Widget',
        size: { width: 4, height: 3 }
    };
    
    canvas.addEntity(widgetConfig).then(() => {
        // Vérifier que le nombre d'entités a augmenté
        const newCount = canvas.getEntities().length;
        console.log('📊 New entities count:', newCount);
        
        if (newCount === initialCount + 1) {
            console.log('✅ Widget successfully added to canvas');
            
            // Vérifier que le feeding panel a bien été mis à jour
            setTimeout(() => {
                feedingPanel.updateCanvasWidgets();
                const feedingPanelWidgets = feedingPanel.canvasWidgets;
                console.log('📊 Feeding panel widgets count:', feedingPanelWidgets.length);
                
                if (feedingPanelWidgets.length === newCount) {
                    console.log('✅ Feeding panel successfully updated');
                } else {
                    console.log('❌ Feeding panel not updated correctly');
                }
            }, 100);
        } else {
            console.log('❌ Widget not added correctly');
        }
    });
}

// Fonction pour tester l'édition d'un widget
function testWidgetEdit() {
    console.log('🧪 TEST: Testing widget edit');
    
    const canvas = document.querySelector('dashboard-canvas-entity');
    if (!canvas) {
        console.error('❌ Canvas not found');
        return;
    }
    
    const entities = canvas.getEntities();
    if (entities.length === 0) {
        console.log('📝 No entities to edit, adding one first...');
        testWidgetAddition();
        return;
    }
    
    // Tester l'édition du premier widget
    const firstEntity = entities[0];
    console.log('📝 Testing edit for entity:', firstEntity.id);
    
    canvas.editEntity(firstEntity);
}

// Fonction pour tester le changement de sélection dans la combo
function testWidgetSelectionChange() {
    console.log('🧪 TEST: Testing widget selection change in Data Assignment');
    
    const feedingPanel = document.querySelector('feeding-panel');
    if (!feedingPanel) {
        console.error('❌ Feeding Panel not found');
        return;
    }
    
    // S'assurer qu'on a des widgets
    feedingPanel.updateCanvasWidgets();
    
    if (feedingPanel.canvasWidgets.length === 0) {
        console.log('📝 No widgets available, adding some first...');
        testWidgetAddition();
        setTimeout(() => testWidgetSelectionChange(), 500);
        return;
    }
    
    console.log('📊 Available widgets:', feedingPanel.canvasWidgets.map(w => ({id: w.id, type: w.type})));
    
    // Simuler le changement de sélection
    const widgetSelector = feedingPanel.shadowRoot.querySelector('#widget-selector');
    if (!widgetSelector) {
        console.error('❌ Widget selector not found');
        return;
    }
    
    console.log('📊 Widget selector options:', Array.from(widgetSelector.options).map(opt => ({ value: opt.value, text: opt.text })));
    
    // Changer vers le premier widget disponible
    if (feedingPanel.canvasWidgets.length > 0) {
        const firstWidget = feedingPanel.canvasWidgets[0];
        console.log('🔄 Changing selection to:', firstWidget.id);
        
        widgetSelector.value = firstWidget.id;
        widgetSelector.dispatchEvent(new Event('change'));
        
        // Vérifier que les données ont été chargées
        setTimeout(() => {
            console.log('📊 Assignments after selection change:', feedingPanel.assignments);
            console.log('✅ Selection change test completed');
        }, 100);
    }
}

// Exposer les fonctions de test globalement
window.testWidgetAddition = testWidgetAddition;
window.testWidgetEdit = testWidgetEdit;
window.testWidgetSelectionChange = testWidgetSelectionChange;

console.log('🧪 Test functions available:');
console.log('- testWidgetAddition() : Teste l\'ajout d\'un widget et la mise à jour du feeding panel');
console.log('- testWidgetEdit() : Teste l\'édition d\'un widget');
console.log('- testWidgetSelectionChange() : Teste le changement de sélection dans la combo Data Assignment');