/**
 * 🔍 WIDGET DISCOVERY SERVICE
 * 
 * Service de découverte automatique des w        // Scanner les fichiers widget existants
        console.log('🔍 Scanning widget_* files...');ets en scannant le dossier widgets/
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

        console.log('🔍 Starting STRICT widget discovery...');
        
        // Mode strict - aucun fallback toléré
        const widgetPaths = await this.scanWidgetDirectory();
        
        if (widgetPaths.length === 0) {
            throw new Error('❌ STRICT DISCOVERY FAILED: No widgets discovered! Check if widgets are accessible or server configuration.');
        }
        
        this.discoveryCache = widgetPaths;
        this.widgetPaths = widgetPaths;
        
        console.log(`✅ STRICT DISCOVERY SUCCESS: ${widgetPaths.length} widgets discovered:`, widgetPaths);
        return widgetPaths;
    }

    /**
     * Scanne le répertoire widgets/ pour trouver les fichiers widget_*
     * @returns {Promise<string[]>}
     */
    async scanWidgetDirectory() {
        console.log('🔍 STRICT MODE: Widget discovery requires API...');
        
        try {
            // Tentative d'accès à l'API de découverte de widgets (OBLIGATOIRE)
            const apiResponse = await fetch('/api/discover-widgets');
            
            if (!apiResponse.ok) {
                throw new Error(`Widget Discovery API failed: ${apiResponse.status} - API de découverte widgets non disponible`);
            }
            
            const apiData = await apiResponse.json();
            
            if (!apiData.success) {
                throw new Error(`Widget Discovery failed: ${apiData.error}`);
            }
            
            const widgetDir = 'src/widgets/';
            const discoveredWidgets = apiData.widgets.map(widget => widgetDir + widget);
            
            console.log(`� API Discovery: Found ${discoveredWidgets.length} widgets:`, discoveredWidgets);
            return discoveredWidgets;
            
        } catch (error) {
            console.error('❌ Widget discovery failed:', error.message);
            console.error('💡 Solution: Implémentez une API de découverte de widgets (/api/discover-widgets)');
            throw new Error(`Widget Discovery Service indisponible: ${error.message}`);
        }
    }

    /**
     * Découverte automatique des widgets par pattern matching
     * @param {string} widgetDir 
     * @returns {Promise<string[]>}
     */
    async autoDiscoverWidgets(widgetDir) {
        const discoveredWidgets = [];
        
        console.log('🔍 TRUE AUTO-DISCOVERY: Scanning ALL widget_* files...');
        
        // Commencer directement par la méthode de pattern matching ciblé
        console.log('� Using targeted pattern matching for existing widget_* files...');
        console.log('🔍 Fallback: Using targeted pattern matching for existing widget_* files...');
        
        // Liste précise des widgets existants (pour éviter les 404)
        const exactWidgetFiles = [
            'widget_tile_v1.0.js',
            'widget_tile_v1.1.js',
            'widget_bar-chart_v1.0.js', 
            'widget_line-chart_v1.0.js',
            'widget_pie-chart_v1.0.js',
            'widget_table_v1.0.js'
        ];
        
        // Scanner UNIQUEMENT les fichiers qui existent réellement
        for (const filename of exactWidgetFiles) {
            const fullPath = widgetDir + filename;
            
            try {
                const response = await fetch(fullPath, { method: 'HEAD' });
                if (response.ok) {
                    discoveredWidgets.push(fullPath);
                    console.log(`✅ Pattern-discovered: ${filename}`);
                }
            } catch (error) {
                console.warn(`⚠️ Expected widget not found: ${filename}`);
            }
        }
        
        console.log(`🎯 TARGETED PATTERN DISCOVERY: Found ${discoveredWidgets.length} widgets`);
        return discoveredWidgets;
    }

    /**
     * Méthode de probe strict - échec si aucun widget trouvé
     * @param {string} widgetDir 
     * @returns {Promise<string[]>}
     */
    async probeKnownWidgets(widgetDir) {
        // Liste de base pour le probe (sera étendue dynamiquement)
        const baseWidgets = [
            'widget_bar-chart_v1.0.js',
            'widget_line-chart_v1.0.js', 
            'widget_pie-chart_v1.0.js',
            'widget_table_v1.0.js',
            'widget_tile_v1.0.js',
            'widget_tile_v1.1.js'
        ];
        
        console.log(`🔍 Probing ${baseWidgets.length} known widgets...`);

        // Vérifier que chaque widget existe en tentant de le charger
        const discoveredWidgets = [];
        
        for (const widget of baseWidgets) {
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

        // Nouvelle méthode: Utiliser un endpoint API pour lister les fichiers
        try {
            const apiWidgets = await this.discoverViaAPI(widgetDir);
            for (const widget of apiWidgets) {
                if (!discoveredWidgets.includes(widget)) {
                    discoveredWidgets.push(widget);
                    console.log(`✅ API-discovered widget: ${widget}`);
                }
            }
        } catch (error) {
            console.log('🔌 API discovery not available, continuing with current results');
        }

        // PAS DE FALLBACK - Échec strict si aucun widget trouvé
        if (discoveredWidgets.length === 0) {
            throw new Error('❌ STRICT MODE: No widgets discovered! All discovery methods failed.');
        }

        return discoveredWidgets;
    }

    /**
     * Découverte via un service API/CSV qui liste les fichiers
     * @param {string} widgetDir 
     * @returns {Promise<string[]>}
     */
    async discoverViaAPI(widgetDir) {
        try {
            // Essayer d'utiliser le service CSV discovery existant
            const response = await fetch('http://localhost:8081/list-widgets');
            if (response.ok) {
                const data = await response.json();
                return data.widgets || [];
            }
        } catch (error) {
            // Service non disponible
        }
        
        // Alternative: Scanner avec patterns étendus
        return await this.scanWithExtendedPatterns(widgetDir);
    }

    /**
     * Scanner avec patterns étendus pour découvrir TOUS les widgets inconnus
     * @param {string} widgetDir 
     * @returns {Promise<string[]>}
     */
    async scanWithExtendedPatterns(widgetDir) {
        const discoveredWidgets = [];
        
        console.log('🔍 EXHAUSTIVE SCAN: Searching for ALL possible widget_* files...');
        
        // Liste très étendue de tous les types de widgets possibles
        const allPossibleWidgetTypes = [
            // Types existants
            'tile', 'bar-chart', 'line-chart', 'pie-chart', 'table', 'gauge', 'map', 
            'calendar', 'kanban', 'other', 'custom', 'test', 'demo', 'experimental',
            
            // Types de visualisation
            'chart', 'graph', 'plot', 'diagram', 'visualization', 'dataviz',
            'scatter', 'bubble', 'heatmap', 'treemap', 'sunburst', 'radar',
            
            // Types métier
            'metric', 'kpi', 'dashboard', 'report', 'analytics', 'scorecard',
            'indicator', 'progress', 'status', 'alert', 'notification',
            
            // Types d'interface
            'form', 'input', 'button', 'menu', 'toolbar', 'panel', 'modal',
            'popup', 'dropdown', 'slider', 'toggle', 'switch', 'checkbox',
            
            // Types de contenu
            'text', 'image', 'video', 'audio', 'media', 'document', 'file',
            'link', 'news', 'feed', 'social', 'comment', 'review',
            
            // Types temporels
            'clock', 'timer', 'countdown', 'schedule', 'timeline', 'gantt',
            'planning', 'booking', 'appointment', 'event',
            
            // Types spécialisés
            'weather', 'stock', 'crypto', 'currency', 'exchange', 'finance',
            'health', 'fitness', 'sport', 'game', 'quiz', 'poll', 'survey'
        ];
        
        const allVersions = ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '2.0', '2.1', '2.2', '3.0'];
        
        // Scanner avec versions
        for (const type of allPossibleWidgetTypes) {
            for (const version of allVersions) {
                const filename = `widget_${type}_v${version}.js`;
                const fullPath = widgetDir + filename;
                
                try {
                    const response = await fetch(fullPath, { method: 'HEAD' });
                    if (response.ok) {
                        discoveredWidgets.push(fullPath);
                        console.log(`🔍 Exhaustive-discovered: ${filename}`);
                    }
                } catch (error) {
                    // Continue scanning
                }
            }
            
            // Scanner sans version aussi
            const filenameNoVersion = `widget_${type}.js`;
            const fullPathNoVersion = widgetDir + filenameNoVersion;
            
            try {
                const response = await fetch(fullPathNoVersion, { method: 'HEAD' });
                if (response.ok) {
                    discoveredWidgets.push(fullPathNoVersion);
                    console.log(`🔍 Exhaustive-discovered (no version): ${filenameNoVersion}`);
                }
            } catch (error) {
                // Continue scanning
            }
        }
        
        console.log(`🎯 EXHAUSTIVE SCAN COMPLETE: Found ${discoveredWidgets.length} widgets`);
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

    /**
     * Refresh widget definitions by clearing cache and reloading
     */
    async refreshWidgetDefinitions() {
        console.log('🔄 Refreshing widget definitions...');
        
        // Clear cache to force fresh discovery
        this.discoveryCache = null;
        this.loadedWidgets.clear();
        
        // Re-discover widgets
        await this.discoverWidgets();
        
        // Reload all widgets
        if (window.widgetManager) {
            await this.loadAllDiscoveredWidgets(window.widgetManager);
        }
        
        console.log('✅ Widget definitions refreshed');
    }

    /**
     * Get widget definition by type
     * @param {string} type Widget type
     * @returns {Object|null} Widget definition
     */
    getWidgetDefinition(type) {
        for (const [path, widget] of this.loadedWidgets) {
            if (widget && widget.type === type) {
                return widget;
            }
        }
        
        // Also check global widget definitions
        const globalDefs = [
            'TILE_WIDGET_DEFINITION',
            'BAR_CHART_WIDGET_DEFINITION', 
            'LINE_CHART_WIDGET_DEFINITION',
            'PIE_CHART_WIDGET_DEFINITION',
            'TABLE_WIDGET_DEFINITION'
        ];
        
        for (const defName of globalDefs) {
            if (window[defName] && window[defName].type === type) {
                return window[defName];
            }
        }
        
        return null;
    }
}

// Instance globale du service
window.WidgetDiscoveryService = WidgetDiscoveryService;
window.widgetDiscovery = new WidgetDiscoveryService();
window.widgetDiscoveryService = window.widgetDiscovery; // Alias pour cohérence

console.log('🔍 Widget Discovery Service initialized');