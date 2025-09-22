/**
 * Log Configuration - Controls console output levels
 */

// Configuration globale des logs
window.LOG_CONFIG = {
    // Niveaux généraux
    WIDGET_DISCOVERY: false,     // Logs de découverte de widgets
    WIDGET_LOADING: false,       // Logs de chargement de widgets  
    WIDGET_REGISTRATION: false,  // Logs d'enregistrement de widgets
    CSV_DISCOVERY: false,        // Logs de découverte CSV
    DRAG_DROP: false,           // Logs de drag & drop
    ENTITY_SYSTEM: false,       // Logs du système d'entités
    
    // Niveaux spécifiques
    WIDGET_MANAGER_INIT: false, // Initialisation du WidgetManager
    WIDGET_MANAGER_CRUD: true,  // Opérations CRUD importantes
    ERROR_LOGS: true,           // Toujours garder les erreurs
    WARNING_LOGS: true,         // Toujours garder les warnings
    
    // Mode debug
    DEBUG_MODE: false           // Mode debug complet
};

// Helper functions pour les logs conditionnels
window.logIf = (condition, ...args) => {
    if (window.LOG_CONFIG[condition] || window.LOG_CONFIG.DEBUG_MODE) {
        console.log(...args);
    }
};

window.warnIf = (condition, ...args) => {
    if (window.LOG_CONFIG[condition] || window.LOG_CONFIG.WARNING_LOGS) {
        console.warn(...args);
    }
};

window.errorIf = (condition, ...args) => {
    if (window.LOG_CONFIG[condition] || window.LOG_CONFIG.ERROR_LOGS) {
        console.error(...args);
    }
};

// Export pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.LOG_CONFIG;
}

console.log('🔇 Log configuration loaded - Most logs disabled for cleaner console');