/**
 * 🧪 WIDGET DISCOVERY TEST
 * 
 * Script de test pour démontrer le système de découverte automatique des widgets
 */

console.log('🧪 === WIDGET DISCOVERY TEST STARTING ===');

// Fonction de test principale
async function testWidgetDiscovery() {
    try {
        console.log('\n1️⃣ Testing widget discovery service...');
        
        // Test de découverte
        const discoveredWidgets = await window.widgetDiscovery.discoverWidgets();
        console.log(`✅ Discovered ${discoveredWidgets.length} widgets:`, discoveredWidgets);
        
        console.log('\n2️⃣ Testing widget accessibility...');
        for (const widget of discoveredWidgets) {
            try {
                const response = await fetch(widget, { method: 'HEAD' });
                const status = response.ok ? '✅' : '❌';
                console.log(`  ${status} ${widget.split('/').pop()} (HTTP ${response.status})`);
            } catch (error) {
                console.log(`  ❌ ${widget.split('/').pop()} (Error: ${error.message})`);
            }
        }
        
        console.log('\n3️⃣ Testing widget loading...');
        const canvas = document.querySelector('dashboard-canvas-entity');
        if (canvas && canvas.widgetManager) {
            const loadResults = await window.widgetDiscovery.loadAllDiscoveredWidgets(canvas.widgetManager);
            console.log('✅ Load results:', loadResults);
        } else {
            console.log('⚠️ Canvas not ready, testing direct loading...');
            const loadResults = await window.widgetDiscovery.loadAllDiscoveredWidgets(null);
            console.log('✅ Direct load results:', loadResults);
        }
        
        console.log('\n4️⃣ Testing widget statistics...');
        const stats = window.WidgetDiscoveryUtils.getWidgetStats();
        
        console.log('\n5️⃣ Testing cache behavior...');
        console.log('Cache before refresh:', window.widgetDiscovery.discoveryCache ? 'EXISTS' : 'EMPTY');
        window.widgetDiscovery.refreshDiscovery();
        console.log('Cache after refresh:', window.widgetDiscovery.discoveryCache ? 'EXISTS' : 'EMPTY');
        
        console.log('\n✅ === ALL TESTS COMPLETED SUCCESSFULLY ===');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Attendre que la page soit chargée avant de lancer les tests
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testWidgetDiscovery, 2000); // Attendre 2s pour que tout soit initialisé
    });
} else {
    setTimeout(testWidgetDiscovery, 2000);
}

// Exposer la fonction de test globalement
window.testWidgetDiscovery = testWidgetDiscovery;

console.log('🧪 Widget Discovery Test loaded. Tests will run automatically or call window.testWidgetDiscovery()');