/**
 * 🔍 WIDGET DISCOVERY SERVICE -     async scanWidgetDirectory() {
        console.log('🔍 STRICT MODE: Widget discovery requires API...');
        
        const API_URL = 'http://localhost:8080/api/discover-widgets';
        console.log('🌐 Using API URL:', API_URL);
        
        try {
            // Tentative d'accès à l'API de découverte de widgets (OBLIGATOIRE) sur port 8080
            const apiResponse = await fetch(API_URL);CT UNIQUEMENT
 * 
 * Service de découverte des widgets en mode strict sans fallback.
 * Exige une API de découverte fonctionnelle.
 */

class WidgetDiscoveryService {
    constructor() {
        this.discoveredWidgets = [];
        this.loadedWidgets = [];
        this.loadedDefinitions = new Map();
        this.cache = new Map();
    }

    /**
     * Découverte STRICTE des widgets via API uniquement
     * @returns {Promise<string[]>}
     */
    async discoverWidgets() {
        console.log('🔍 Starting STRICT widget discovery...');
        
        // Mode strict - aucun fallback toléré
        try {
            const discoveredPaths = await this.scanWidgetDirectory();
            this.discoveredWidgets = discoveredPaths;
            console.log(`✅ STRICT DISCOVERY SUCCESS: ${discoveredPaths.length} widgets discovered:`, discoveredPaths);
            return discoveredPaths;
        } catch (error) {
            console.error('❌ STRICT DISCOVERY FAILED:', error.message);
            throw error;
        }
    }

    /**
     * Scanne le répertoire widgets/ pour trouver les fichiers widget_*
     * @returns {Promise<string[]>}
     */
    async scanWidgetDirectory() {
        console.log('🔍 STRICT MODE: Widget discovery requires API...');
        
        const API_URL = 'http://localhost:8081/list-widgets';
        console.log('🌐 Using API URL:', API_URL);
        
        try {
            // Tentative d'accès à l'API de découverte de widgets (OBLIGATOIRE) sur port 8081
            const apiResponse = await fetch(API_URL);
            
            if (!apiResponse.ok) {
                throw new Error(`Widget Discovery API failed: ${apiResponse.status} - API de découverte widgets non disponible`);
            }
            
            const apiData = await apiResponse.json();
            
            if (!apiData.success) {
                throw new Error(`Widget Discovery failed: ${apiData.error}`);
            }
            
            // Le serveur CSV retourne les noms de fichiers, on doit ajouter le chemin complet
            const widgetDir = 'src/widgets/';
            const discoveredWidgets = (apiData.widgets || []).map(widget => widgetDir + widget);
            
            console.log(`🔍 API Discovery: Found ${discoveredWidgets.length} widgets:`, discoveredWidgets);
            return discoveredWidgets;
            
        } catch (error) {
            console.error('❌ Widget discovery failed:', error.message);
            console.error('💡 Solution: Vérifiez que le serveur widget discovery fonctionne sur /list-widgets');
            throw new Error(`Widget Discovery Service indisponible: ${error.message}`);
        }
    }

    /**
     * Charge un widget spécifique
     * @param {string} widgetPath 
     * @param {Object} widgetManager 
     * @returns {Promise<boolean>}
     */
    async loadDiscoveredWidget(widgetPath, widgetManager) {
        try {
            console.log(`🔄 Loading discovered widget: ${widgetPath}`);
            await widgetManager.loadUnifiedWidget(widgetPath);
            console.log(`✅ Widget loaded successfully: ${widgetPath}`);
            
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

        console.log(`📊 Widget loading complete: ${results.loaded}/${results.total} loaded, ${results.failed} failed`);
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

console.log('🔍 Widget Discovery Service initialized');