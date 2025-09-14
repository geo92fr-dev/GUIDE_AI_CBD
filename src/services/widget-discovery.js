/**
 * 🔍 WIDGET DISCOVERY SERVICE
 * 
 * Service de découverte automatique des widgets en scannant le dossier widgets/
 * Charge dynamiquement tous les fichiers commençant par "widget_"
 */

class WidgetDiscoveryService {
    constructor() {
        this.widgetPaths = [];
        this.loadedWidgets = new Map();
        this.discoveryCache = null;
    }

    /**
     * Découvre automatiquement tous les widgets dans le dossier widgets/
     * @returns {Promise<string[]>} Liste des chemins des widgets découverts
     */
    async discoverWidgets() {
        if (this.discoveryCache) {
            console.log('📋 Using cached widget discovery results');
            return this.discoveryCache;
        }

        console.log('🔍 Starting widget discovery...');
        
        // Pas de fallback - forcer l'erreur pour diagnostiquer
        const widgetPaths = await this.scanWidgetDirectory();
        
        if (widgetPaths.length === 0) {
            throw new Error('No widgets discovered! Check if widgets are accessible or server configuration.');
        }
        
        this.discoveryCache = widgetPaths;
        this.widgetPaths = widgetPaths;
        
        console.log(`✅ Discovered ${widgetPaths.length} widgets:`, widgetPaths);
        return widgetPaths;
    }

    /**
     * Scanne le répertoire widgets/ pour trouver les fichiers widget_*
     * @returns {Promise<string[]>}
     */
    async scanWidgetDirectory() {
        const widgetDir = 'src/widgets/';
        
        // Liste étendue des widgets possibles à découvrir
    const possibleWidgets = [
        'widget_bar-chart_v1.0.js',
        'widget_line-chart_v1.0.js', 
        'widget_pie-chart_v1.0.js',
        'widget_table_v1.0.js',
        'widget_tile_v1.0.js'
    ];        console.log(`🔍 Scanning for ${possibleWidgets.length} possible widgets...`);

        // Vérifier que chaque widget existe en tentant de le charger
        const discoveredWidgets = [];
        
        for (const widget of possibleWidgets) {
            try {
                const fullPath = widgetDir + widget;
                console.log(`🔍 Testing widget: ${widget} at ${fullPath}`);
                
                // Test de disponibilité avec HEAD request
                const response = await fetch(fullPath, { method: 'HEAD' });
                console.log(`📋 Widget ${widget}: status ${response.status}, ok: ${response.ok}`);
                
                if (response.ok) {
                    discoveredWidgets.push(fullPath);
                    console.log(`✅ Widget found: ${widget}`);
                } else {
                    console.log(`⚠️ Widget not accessible: ${widget} (status: ${response.status})`);
                }
            } catch (error) {
                console.log(`❌ Widget check failed: ${widget}`, error.message);
            }
        }

        // Recherche étendue par exploration du dossier (si supporté par le serveur)
        try {
            const additionalWidgets = await this.exploreWidgetDirectory(widgetDir);
            // Ajouter les widgets découverts qui ne sont pas déjà dans la liste
            for (const widget of additionalWidgets) {
                if (!discoveredWidgets.includes(widget)) {
                    discoveredWidgets.push(widget);
                    console.log(`✅ Additional widget discovered: ${widget}`);
                }
            }
        } catch (error) {
            console.log('📁 Directory exploration not supported, using probe method only');
        }

        return discoveredWidgets;
    }

    /**
     * Tentative d'exploration du répertoire (si le serveur le supporte)
     * @param {string} dirPath 
     * @returns {Promise<string[]>}
     */
    async exploreWidgetDirectory(dirPath) {
        try {
            // Tentative de listing du répertoire (peut ne pas fonctionner selon le serveur)
            const response = await fetch(dirPath);
            if (response.ok) {
                const html = await response.text();
                
                // Parser le HTML pour extraire les liens vers les fichiers widget_*
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const links = doc.querySelectorAll('a[href]');
                
                const widgets = [];
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('widget_') && href.endsWith('.js')) {
                        widgets.push(dirPath + href);
                    }
                });
                
                return widgets;
            }
        } catch (error) {
            // Exploration du répertoire non supportée
        }
        
        return [];
    }

    /**
     * Liste de fallback des widgets connus
     * @returns {string[]}
     */
    getFallbackWidgets() {
        const fallbackWidgets = [
            'src/widgets/widget_bar-chart_v1.0.js',
            'src/widgets/widget_line-chart_v1.0.js',
            'src/widgets/widget_pie-chart_v1.0.js',
            'src/widgets/widget_table_v1.0.js'
        ];
        
        console.log('📋 Using fallback widget list:', fallbackWidgets);
        return fallbackWidgets;
    }

    /**
     * Charge dynamiquement un widget découvert
     * @param {string} widgetPath 
     * @param {Object} widgetManager 
     * @returns {Promise<boolean>}
     */
    async loadDiscoveredWidget(widgetPath, widgetManager) {
        if (this.loadedWidgets.has(widgetPath)) {
            console.log(`📦 Widget already loaded: ${widgetPath}`);
            return true;
        }

        try {
            console.log(`🔄 Loading discovered widget: ${widgetPath}`);
            
            if (widgetManager && widgetManager.loadUnifiedWidget) {
                await widgetManager.loadUnifiedWidget(widgetPath);
            } else {
                // Chargement direct via script tag
                await this.loadWidgetScript(widgetPath);
            }
            
            this.loadedWidgets.set(widgetPath, true);
            console.log(`✅ Widget loaded successfully: ${widgetPath}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to load widget ${widgetPath}:`, error);
            return false;
        }
    }

    /**
     * Charge un widget via script tag
     * @param {string} widgetPath 
     * @returns {Promise<void>}
     */
    loadWidgetScript(widgetPath) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = widgetPath;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${widgetPath}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Charge tous les widgets découverts
     * @param {Object} widgetManager 
     * @returns {Promise<Object>} Résultats du chargement
     */
    async loadAllDiscoveredWidgets(widgetManager) {
        const widgets = await this.discoverWidgets();
        const results = {
            total: widgets.length,
            loaded: 0,
            failed: 0,
            paths: []
        };

        console.log(`🚀 Loading ${widgets.length} discovered widgets...`);

        for (const widgetPath of widgets) {
            const success = await this.loadDiscoveredWidget(widgetPath, widgetManager);
            if (success) {
                results.loaded++;
                results.paths.push(widgetPath);
            } else {
                results.failed++;
            }
        }

        console.log(`📊 Widget loading complete: ${results.loaded}/${results.total} loaded, ${results.failed} failed`);
        return results;
    }

    /**
     * Recharge la découverte (vide le cache)
     */
    refreshDiscovery() {
        this.discoveryCache = null;
        this.loadedWidgets.clear();
        console.log('🔄 Widget discovery cache cleared');
    }

    /**
     * Obtient la liste des widgets découverts
     * @returns {string[]}
     */
    getDiscoveredWidgets() {
        return this.widgetPaths;
    }

    /**
     * Obtient la liste des widgets chargés
     * @returns {Array}
     */
    getLoadedWidgets() {
        return Array.from(this.loadedWidgets.entries()).map(([path, loaded]) => ({
            path,
            name: path.split('/').pop(),
            loaded,
            type: this.extractWidgetType(path)
        }));
    }

    /**
     * Extrait le type de widget du nom de fichier
     * @param {string} widgetPath 
     * @returns {string}
     */
    extractWidgetType(widgetPath) {
        const filename = widgetPath.split('/').pop();
        const match = filename.match(/widget_([^_]+)/);
        return match ? match[1] : 'unknown';
    }

    /**
     * Vérifie si un widget est chargé
     * @param {string} widgetPath 
     * @returns {boolean}
     */
    isWidgetLoaded(widgetPath) {
        return this.loadedWidgets.has(widgetPath);
    }

    /**
     * Force le rechargement de tous les widgets
     * @param {Object} widgetManager 
     * @returns {Promise<Object>}
     */
    async forceReloadAll(widgetManager) {
        console.log('🔄 Force reloading all widgets...');
        this.refreshDiscovery();
        return await this.loadAllDiscoveredWidgets(widgetManager);
    }

    /**
     * Obtient des statistiques sur la découverte et le chargement
     * @returns {Object}
     */
    getStats() {
        return {
            discovered: this.widgetPaths.length,
            loaded: this.loadedWidgets.size,
            loadRate: this.widgetPaths.length > 0 ? (this.loadedWidgets.size / this.widgetPaths.length * 100).toFixed(1) + '%' : '0%',
            types: [...new Set(this.widgetPaths.map(path => this.extractWidgetType(path)))]
        };
    }

    /**
     * Ajoute manuellement un widget à découvrir
     * @param {string} widgetPath 
     */
    addWidget(widgetPath) {
        if (!this.widgetPaths.includes(widgetPath)) {
            this.widgetPaths.push(widgetPath);
            console.log(`➕ Widget added manually: ${widgetPath}`);
        }
    }

    /**
     * Supprime un widget de la liste découverte
     * @param {string} widgetPath 
     */
    removeWidget(widgetPath) {
        const index = this.widgetPaths.indexOf(widgetPath);
        if (index > -1) {
            this.widgetPaths.splice(index, 1);
            this.loadedWidgets.delete(widgetPath);
            console.log(`➖ Widget removed: ${widgetPath}`);
        }
    }
}

// Instance globale du service
window.WidgetDiscoveryService = WidgetDiscoveryService;
window.widgetDiscovery = new WidgetDiscoveryService();

console.log('🔍 Widget Discovery Service initialized');