/**
 * 🛠️ WIDGET DISCOVERY UTILS
 * 
 * Utilitaires pour l'administration et la gestion de la découverte des widgets
 */

class WidgetDiscoveryUtils {
    /**
     * Scanne manuellement le dossier widgets/ et affiche la liste
     * Utile pour déboguer et voir quels widgets sont disponibles
     */
    static async scanAndDisplayWidgets() {
        console.log('🔍 === WIDGET DISCOVERY SCAN ===');
        
        try {
            const widgets = await window.widgetDiscovery.discoverWidgets();
            
            console.log(`📊 Found ${widgets.length} widgets:`);
            widgets.forEach((widget, index) => {
                console.log(`  ${index + 1}. ${widget}`);
            });
            
            // Tester l'accessibilité de chaque widget
            console.log('\n🔗 Testing widget accessibility:');
            for (const widget of widgets) {
                try {
                    const response = await fetch(widget, { method: 'HEAD' });
                    const status = response.ok ? '✅' : '❌';
                    console.log(`  ${status} ${widget} (${response.status})`);
                } catch (error) {
                    console.log(`  ❌ ${widget} (${error.message})`);
                }
            }
            
        } catch (error) {
            console.error('❌ Scan failed:', error);
        }
        
        console.log('🔍 === END SCAN ===');
    }

    /**
     * Force le rechargement de tous les widgets
     */
    static async reloadAllWidgets() {
        console.log('🔄 Reloading all widgets...');
        
        // Vider le cache
        window.widgetDiscovery.refreshDiscovery();
        
        // Recharger
        const canvas = document.querySelector('dashboard-canvas-entity');
        const widgetManager = canvas?.widgetManager;
        
        if (widgetManager) {
            const results = await window.widgetDiscovery.loadAllDiscoveredWidgets(widgetManager);
            console.log('✅ Reload completed:', results);
            return results;
        } else {
            console.warn('⚠️ No widget manager found');
            return null;
        }
    }

    /**
     * Ajoute un nouveau widget à la découverte (pour test)
     * @param {string} widgetPath 
     */
    static async addWidget(widgetPath) {
        console.log(`➕ Adding widget: ${widgetPath}`);
        
        const canvas = document.querySelector('dashboard-canvas-entity');
        const widgetManager = canvas?.widgetManager;
        
        if (widgetManager) {
            const success = await window.widgetDiscovery.loadDiscoveredWidget(widgetPath, widgetManager);
            console.log(success ? '✅ Widget added successfully' : '❌ Widget addition failed');
            return success;
        } else {
            console.warn('⚠️ No widget manager found');
            return false;
        }
    }

    /**
     * Obtient des statistiques sur les widgets
     */
    static getWidgetStats() {
        const loadedWidgets = window.widgetDiscovery.getLoadedWidgets();
        const stats = {
            total: loadedWidgets.length,
            loaded: loadedWidgets,
            types: {}
        };

        // Analyser les types de widgets
        loadedWidgets.forEach(widget => {
            const filename = widget.split('/').pop();
            const match = filename.match(/widget_([^_]+)/);
            if (match) {
                const type = match[1];
                stats.types[type] = (stats.types[type] || 0) + 1;
            }
        });

        console.log('📊 Widget Statistics:', stats);
        return stats;
    }

    /**
     * Affiche l'aide pour les commandes de découverte
     */
    static help() {
        console.log(`
🛠️ WIDGET DISCOVERY UTILS - Commands:

WidgetDiscoveryUtils.scanAndDisplayWidgets()  - Scanne et affiche tous les widgets
WidgetDiscoveryUtils.reloadAllWidgets()       - Recharge tous les widgets  
WidgetDiscoveryUtils.addWidget(path)          - Ajoute un widget spécifique
WidgetDiscoveryUtils.getWidgetStats()         - Affiche les statistiques
WidgetDiscoveryUtils.help()                   - Affiche cette aide

Global objects:
window.widgetDiscovery                        - Service de découverte principal
        `);
    }
}

// Exposer les utilitaires globalement
window.WidgetDiscoveryUtils = WidgetDiscoveryUtils;

// Commande rapide pour scanner les widgets
window.scanWidgets = () => WidgetDiscoveryUtils.scanAndDisplayWidgets();

console.log('🛠️ Widget Discovery Utils loaded. Type WidgetDiscoveryUtils.help() for commands.');