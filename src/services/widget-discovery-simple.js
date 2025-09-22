/**
 * 🔍 WIDGET DISCOVERY SERVICE - VERSION SIMPLE
 * 
 * Service de découverte des widgets avec liste statique.
 * Compatible avec serveur HTTP simple.
 */

class WidgetDiscoveryService {
    constructor() {
        this.discoveredWidgets = [];
        this.loadedWidgets = [];
        this.loadedDefinitions = new Map();
        this.cache = new Map();
    }

    /**
     * Découverte SIMPLE des widgets avec liste prédéfinie
     * @returns {Promise<string[]>}
     */
    async discoverWidgets() {
        window.logIf('WIDGET_DISCOVERY', '🔍 Starting SIMPLE widget discovery...');
        
        try {
            const discoveredPaths = await this.getKnownWidgets();
            this.discoveredWidgets = discoveredPaths;
            console.log(`✅ SIMPLE DISCOVERY SUCCESS: ${discoveredPaths.length} widgets discovered:`, discoveredPaths);
            return discoveredPaths;
        } catch (error) {
            console.error('❌ SIMPLE DISCOVERY FAILED:', error.message);
            throw error;
        }
    }

    /**
     * Retourne la liste des widgets connus
     * @returns {Promise<string[]>}
     */
    async getKnownWidgets() {
        window.logIf('WIDGET_DISCOVERY', '🔍 SIMPLE MODE: Using known widget list...');
        
        const knownWidgets = [
            'src/widgets/widget_bar-chart_v1.0.js',
            'src/widgets/widget_line-chart_v1.0.js',
            'src/widgets/widget_pie-chart_v1.0.js',
            'src/widgets/widget_table_v1.0.js',
            'src/widgets/widget_tile_v1.0.js',
            'src/widgets/widget_tile_v1.1.js',
            'src/widgets/widget_tile_v1.2.js'
        ];
        
        // Vérification simple que les fichiers sont accessibles
        const accessibleWidgets = [];
        
        for (const widgetPath of knownWidgets) {
            try {
                const response = await fetch(widgetPath);
                if (response.ok) {
                    accessibleWidgets.push(widgetPath);
                    window.logIf('WIDGET_DISCOVERY', `✅ Widget accessible: ${widgetPath}`);
                } else {
                    console.warn(`⚠️ Widget not accessible (${response.status}): ${widgetPath}`);
                }
            } catch (error) {
                console.warn(`⚠️ Widget error: ${widgetPath} -`, error.message);
            }
        }
        
        console.log(`🔍 Simple Widget Discovery: Found ${accessibleWidgets.length}/${knownWidgets.length} accessible widgets`);
        return accessibleWidgets;
    }

    /**
     * Charge un widget spécifique
     * @param {string} widgetPath 
     * @param {Object} widgetManager 
     * @returns {Promise<boolean>}
     */
    async loadDiscoveredWidget(widgetPath, widgetManager) {
        try {
            window.logIf('WIDGET_LOADING', `🔄 Loading discovered widget: ${widgetPath}`);
            await widgetManager.loadUnifiedWidget(widgetPath);
            window.logIf('WIDGET_LOADING', `✅ Widget loaded successfully: ${widgetPath}`);
            
            if (!this.loadedWidgets.includes(widgetPath)) {
                this.loadedWidgets.push(widgetPath);
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Failed to load widget ${widgetPath}:`, error);
            return false;
        }
    }

    /**
     * Charge tous les widgets découverts
     * @param {Object} widgetManager 
     * @returns {Promise<Object>}
     */
    async loadAllDiscoveredWidgets(widgetManager) {
        if (this.discoveredWidgets.length === 0) {
            throw new Error('No widgets discovered. Run discoverWidgets() first.');
        }

        console.log(`🚀 Loading ${this.discoveredWidgets.length} discovered widgets...`);
        
        const results = {
            total: this.discoveredWidgets.length,
            loaded: 0,
            failed: 0,
            paths: []
        };

        for (const widgetPath of this.discoveredWidgets) {
            const success = await this.loadDiscoveredWidget(widgetPath, widgetManager);
            if (success) {
                results.loaded++;
                results.paths.push({ path: widgetPath, status: 'loaded' });
            } else {
                results.failed++;
                results.paths.push({ path: widgetPath, status: 'failed' });
            }
        }
        
        return results;
    }

    /**
     * Retourne la liste des widgets chargés
     * @returns {Array}
     */
    getLoadedWidgets() {
        return this.loadedWidgets.map(path => {
            const filename = path.split('/').pop();
            return {
                path: path,
                filename: filename,
                name: filename.replace('.js', '').replace('widget_', '').replace(/_/g, ' ')
            };
        });
    }

    /**
     * Vide le cache et reset
     */
    reset() {
        this.discoveredWidgets = [];
        this.loadedWidgets = [];
        this.loadedDefinitions.clear();
        this.cache.clear();
        console.log('🔄 Widget Discovery Service reset');
    }
}

// Instance globale
window.WidgetDiscoveryService = WidgetDiscoveryService;
window.widgetDiscovery = new WidgetDiscoveryService();

console.log('🔍 Widget Discovery Service initialized (SIMPLE version)');