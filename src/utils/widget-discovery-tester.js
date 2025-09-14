/**
 * 🧪 WIDGET DISCOVERY TEST UTILITY
 * Utilitaire pour tester et diagnostiquer le système de découverte automatique des widgets
 */

class WidgetDiscoveryTester {
    constructor() {
        this.discoveryService = window.widgetDiscovery;
    }

    /**
     * Lance un test complet du système de découverte
     */
    async runFullTest() {
        console.log('🧪 ===== WIDGET DISCOVERY TEST =====');
        
        try {
            // Test 1: Découverte
            console.log('\n📋 Test 1: Widget Discovery');
            const discovered = await this.discoveryService.discoverWidgets();
            console.log(`✅ Discovered ${discovered.length} widgets:`, discovered);
            
            // Test 2: Chargement
            console.log('\n📦 Test 2: Widget Loading');
            const loadResults = await this.discoveryService.loadAllDiscoveredWidgets();
            console.log('✅ Load results:', loadResults);
            
            // Test 3: Statistiques
            console.log('\n📊 Test 3: Statistics');
            const stats = this.discoveryService.getStats();
            console.log('✅ Discovery stats:', stats);
            
            // Test 4: Widgets chargés
            console.log('\n📋 Test 4: Loaded Widgets');
            const loaded = this.discoveryService.getLoadedWidgets();
            console.log('✅ Loaded widgets:', loaded);
            
            // Rapport final
            console.log('\n🎯 ===== FINAL REPORT =====');
            console.log(`📦 Total discovered: ${discovered.length}`);
            console.log(`✅ Successfully loaded: ${loadResults.loaded}`);
            console.log(`❌ Failed to load: ${loadResults.failed}`);
            console.log(`📈 Load rate: ${stats.loadRate}`);
            console.log(`🏷️ Widget types: ${stats.types.join(', ')}`);
            
            return {
                success: true,
                discovered: discovered.length,
                loaded: loadResults.loaded,
                failed: loadResults.failed,
                stats
            };
            
        } catch (error) {
            console.error('❌ Discovery test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Test rapide de découverte uniquement
     */
    async quickDiscoveryTest() {
        console.log('🔍 Quick Discovery Test...');
        try {
            const widgets = await this.discoveryService.discoverWidgets();
            console.log(`✅ Found ${widgets.length} widgets:`, widgets.map(w => w.split('/').pop()));
            return widgets;
        } catch (error) {
            console.error('❌ Quick test failed:', error);
            return [];
        }
    }

    /**
     * Affiche l'état actuel du système
     */
    showCurrentState() {
        console.log('\n📊 ===== CURRENT WIDGET STATE =====');
        
        const discovered = this.discoveryService.getDiscoveredWidgets();
        const loaded = this.discoveryService.getLoadedWidgets();
        const stats = this.discoveryService.getStats();
        
        console.log(`📦 Discovered widgets (${discovered.length}):`);
        discovered.forEach((widget, index) => {
            const name = widget.split('/').pop();
            const isLoaded = this.discoveryService.isWidgetLoaded(widget);
            console.log(`  ${index + 1}. ${name} ${isLoaded ? '✅' : '⏳'}`);
        });
        
        console.log(`\n📊 Statistics:`, stats);
        
        if (loaded.length > 0) {
            console.log(`\n✅ Loaded widgets (${loaded.length}):`);
            loaded.forEach((widget, index) => {
                console.log(`  ${index + 1}. ${widget.name} (${widget.type})`);
            });
        }
    }

    /**
     * Force une redécouverte et un rechargement
     */
    async forceRefresh() {
        console.log('🔄 Forcing widget refresh...');
        try {
            this.discoveryService.refreshDiscovery();
            const results = await this.discoveryService.loadAllDiscoveredWidgets();
            console.log('✅ Refresh completed:', results);
            return results;
        } catch (error) {
            console.error('❌ Refresh failed:', error);
            return null;
        }
    }

    /**
     * Teste la découverte d'un widget spécifique
     */
    async testSpecificWidget(widgetName) {
        console.log(`🎯 Testing specific widget: ${widgetName}`);
        
        const widgetPath = `src/widgets/${widgetName}`;
        
        try {
            // Test d'existence
            const response = await fetch(widgetPath, { method: 'HEAD' });
            console.log(`📁 Widget file exists: ${response.ok}`);
            
            if (response.ok) {
                // Test de chargement
                const loadResult = await this.discoveryService.loadDiscoveredWidget(widgetPath, null);
                console.log(`📦 Widget loaded: ${loadResult}`);
                
                return {
                    exists: true,
                    loaded: loadResult
                };
            } else {
                return {
                    exists: false,
                    loaded: false
                };
            }
        } catch (error) {
            console.error(`❌ Test failed for ${widgetName}:`, error);
            return {
                exists: false,
                loaded: false,
                error: error.message
            };
        }
    }
}

// Créer l'instance globale
window.WidgetDiscoveryTester = WidgetDiscoveryTester;
window.widgetTester = new WidgetDiscoveryTester();

// Ajouter des commandes pratiques à la console
window.testWidgetDiscovery = () => window.widgetTester.runFullTest();
window.quickTestWidgets = () => window.widgetTester.quickDiscoveryTest();
window.showWidgetState = () => window.widgetTester.showCurrentState();
window.refreshWidgets = () => window.widgetTester.forceRefresh();

console.log('🧪 Widget Discovery Tester initialized');
console.log('💡 Available commands:');
console.log('  - testWidgetDiscovery() : Run full test');
console.log('  - quickTestWidgets() : Quick discovery test');
console.log('  - showWidgetState() : Show current state');
console.log('  - refreshWidgets() : Force refresh');