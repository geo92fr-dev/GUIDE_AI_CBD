/**
 * 🏗️ Widget Entity System Loader
 * 
 * Central loader for the complete WidgetEntity architecture system.
 * Loads all core components in the correct dependency order.
 */

(function() {
    'use strict';

    console.log('🏗️ Loading Widget Entity System...');

    // Track loading state
    const loadingState = {
        coreClasses: false,
        components: false,
        helpers: false,
        ready: false
    };

    /**
     * Load a script dynamically
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Load CSS file
     */
    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`link[href="${href}"]`)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    /**
     * Load core Entity classes
     */
    async function loadCoreClasses() {
        console.log('📦 Loading core Entity classes...');
        
        try {
            // Load in dependency order
            await loadScript('src/core/widget-entity.js');
            await loadScript('src/core/widget-manager.js');
            await loadScript('src/core/widget-repository.js');
            await loadScript('src/core/entity-renderer.js');
            
            loadingState.coreClasses = true;
            console.log('✅ Core Entity classes loaded');
            
        } catch (error) {
            console.error('❌ Failed to load core Entity classes:', error);
            throw error;
        }
    }

    /**
     * Load Entity components
     */
    async function loadComponents() {
        console.log('🧩 Loading Entity components...');
        
        try {
            await loadScript('src/components/dashboard-canvas-entity.js');
            
            loadingState.components = true;
            console.log('✅ Entity components loaded');
            
        } catch (error) {
            console.error('❌ Failed to load Entity components:', error);
            throw error;
        }
    }

    /**
     * Load helper utilities
     */
    async function loadHelpers() {
        console.log('🔧 Loading Entity helpers...');
        
        try {
            await loadScript('src/core/entity-migration-helper.js');
            
            loadingState.helpers = true;
            console.log('✅ Entity helpers loaded');
            
        } catch (error) {
            console.error('❌ Failed to load Entity helpers:', error);
            throw error;
        }
    }

    /**
     * Verify all classes are available
     */
    function verifyEntitySystem() {
        console.log('🔍 Verifying Entity system...');
        
        const requiredClasses = [
            'WidgetEntity',
            'WidgetManager',
            'WidgetRepository',
            'LocalStorageWidgetRepository',
            'IndexedDBWidgetRepository',
            'WidgetRepositoryFactory',
            'EntityRenderer',
            'DashboardCanvasEntity',
            'EntityMigrationHelper'
        ];

        const missing = [];
        const available = [];

        for (const className of requiredClasses) {
            if (typeof window[className] !== 'undefined') {
                available.push(className);
            } else {
                missing.push(className);
            }
        }

        if (missing.length > 0) {
            console.warn('⚠️ Some Entity classes are missing:', missing);
            console.log('✅ Available Entity classes:', available);
            return false;
        }

        console.log('✅ All Entity classes verified');
        return true;
    }

    /**
     * Initialize the Entity system
     */
    async function initializeEntitySystem() {
        console.log('🚀 Initializing Entity system...');
        
        try {
            // Create global Entity system instance
            window.WidgetEntitySystem = {
                widgetManager: new WidgetManager(),
                entityRenderer: new EntityRenderer(),
                migrationHelper: new EntityMigrationHelper(),
                version: '1.0.0',
                initialized: true,
                initializedAt: new Date().toISOString()
            };

            // Configure repository
            const repository = WidgetRepositoryFactory.create('localStorage');
            window.WidgetEntitySystem.widgetManager.setRepository(repository);

            console.log('✅ Entity system initialized successfully');
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('entitySystemReady', {
                detail: window.WidgetEntitySystem
            }));

            return window.WidgetEntitySystem;
            
        } catch (error) {
            console.error('❌ Failed to initialize Entity system:', error);
            throw error;
        }
    }

    /**
     * Auto-migration check
     */
    function checkAutoMigration() {
        console.log('🔄 Checking for auto-migration...');
        
        // Check if old canvas exists
        const oldCanvas = document.querySelector('dashboard-canvas');
        if (oldCanvas && oldCanvas.widgets && oldCanvas.widgets.length > 0) {
            console.log(`📦 Found ${oldCanvas.widgets.length} widgets to migrate`);
            
            // Ask user if they want to migrate
            const shouldMigrate = confirm(
                `Found ${oldCanvas.widgets.length} existing widgets. ` +
                'Would you like to migrate them to the new Entity system?'
            );
            
            if (shouldMigrate) {
                return performAutoMigration();
            }
        } else {
            console.log('📝 No existing widgets found for migration');
        }
        
        return Promise.resolve();
    }

    /**
     * Perform automatic migration
     */
    async function performAutoMigration() {
        console.log('🔄 Performing auto-migration...');
        
        try {
            const migrationResult = await window.WidgetEntitySystem.migrationHelper.performFullMigration({
                canvasSelector: 'dashboard-canvas',
                preserveData: true,
                backupData: true
            });

            console.log('✅ Auto-migration completed successfully');
            
            // Show migration summary
            if (migrationResult.migrationResult) {
                const { entities, errors } = migrationResult.migrationResult;
                alert(
                    `Migration completed!\n\n` +
                    `✅ ${entities.length} widgets migrated successfully\n` +
                    `❌ ${errors.length} migration errors\n\n` +
                    `Your dashboard is now using the new Entity system.`
                );
            }

            return migrationResult;
            
        } catch (error) {
            console.error('❌ Auto-migration failed:', error);
            alert(`Migration failed: ${error.message}\n\nPlease check the console for details.`);
            throw error;
        }
    }

    /**
     * Main loading sequence
     */
    async function loadEntitySystem() {
        try {
            console.log('🎯 Starting Entity system loading sequence...');
            
            // Load components in dependency order
            await loadCoreClasses();
            await loadComponents();
            await loadHelpers();
            
            // Verify everything is loaded
            const systemReady = verifyEntitySystem();
            if (!systemReady) {
                throw new Error('Entity system verification failed');
            }
            
            // Initialize the system
            await initializeEntitySystem();
            
            // Check for auto-migration
            await checkAutoMigration();
            
            loadingState.ready = true;
            console.log('🎉 Widget Entity System loaded and ready!');
            
            return window.WidgetEntitySystem;
            
        } catch (error) {
            console.error('❌ Failed to load Entity system:', error);
            
            // Fallback notification
            console.warn('⚠️ Falling back to legacy widget system');
            throw error;
        }
    }

    /**
     * Export loading function for manual control
     */
    window.loadWidgetEntitySystem = loadEntitySystem;

    /**
     * Auto-load when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Small delay to ensure other scripts are loaded
            setTimeout(loadEntitySystem, 100);
        });
    } else {
        // DOM already ready
        setTimeout(loadEntitySystem, 100);
    }

    /**
     * Expose loading state for debugging
     */
    window.EntitySystemLoadingState = loadingState;

})();