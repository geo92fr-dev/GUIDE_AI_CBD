/**
 * 🏷️ Tile Info Widget - Composant d'affichage générique pour toutes les tuiles
 * 
 * Widget générique pour l'affichage des informations de toutes les tuiles en mode INFO :
 * - Compatible avec tous les types de widgets (bar-chart, line-chart, table, etc.)
 * - Affiche les métadonnées, configuration et état
 * - Interface unifiée pour le mode INFO du canvas
 */

class TileInfoWidget extends WidgetBase {
    constructor() {
        super();
        
        // Configuration générique pour toutes les tuiles
        this.config.type = 'tile-info';
        this.config.title = 'Widget Information';
        this.config.isGeneric = true; // Marquer comme widget générique
        
        // Propriétés spécifiques à l'affichage des infos
        this.tileType = 'unknown';
        this.widgetFileName = '';
        this.tileEntity = null;
    }

    /**
     * Initialise avec les informations de la tuile
     */
    initializeForTile(entity) {
        this.tileEntity = entity;
        this.tileType = entity.type || 'unknown';
        this.widgetFileName = this.getWidgetFileName(entity.type);
        this.config.title = `${entity.title || entity.type} - Information`;
        
        console.log('🏷️ TileInfoWidget initialized for:', this.tileType);
    }

    /**
     * Détermine le nom du fichier widget basé sur le type
     */
    getWidgetFileName(type) {
        const fileNameMap = {
            'bar-chart': 'widget_bar-chart_v1.0.js',
            'line-chart': 'widget_line-chart_v1.0.js',
            'pie-chart': 'widget_pie-chart_v1.0.js',
            'table': 'widget_table_v1.0.js',
            'kpi': 'widget_kpi_v1.0.js'
        };
        
        return fileNameMap[type] || `widget_${type}_v1.0.js`;
    }

    renderWidget() {
        if (!this.tileEntity) {
            return this.renderEmpty();
        }

        const entity = this.tileEntity;
        const hasData = this.hasValidData(entity);
        
        return `
            <div class="tile-info-container">
                <div class="tile-header">
                    <div class="tile-icon">${this.getTileIcon(entity.type)}</div>
                    <div class="tile-details">
                        <div class="tile-name">${entity.title || entity.type}</div>
                        <div class="tile-type">${entity.type} Widget</div>
                        <div class="tile-id">ID: ${entity.id}</div>
                        <div class="widget-file">📄 ${this.widgetFileName}</div>
                    </div>
                </div>
                
                <div class="tile-content">
                    ${this.renderDataBindingInfo(entity)}
                    ${this.renderConfigurationInfo(entity)}
                    ${this.renderStateInfo(entity)}
                    ${this.renderWidgetFileInfo()}
                </div>
                
                ${hasData ? this.renderDataPreview(entity) : this.renderNoDataInfo()}
            </div>
        `;
    }

    /**
     * Rendu des informations de binding des données
     */
    renderDataBindingInfo(entity) {
        if (!entity.dataBinding) {
            return `
                <div class="info-section">
                    <div class="info-section-title">📊 Data Binding</div>
                    <div class="no-binding">No data binding configured</div>
                </div>
            `;
        }

        const { dimensions, measures, filters } = entity.dataBinding;
        
        return `
            <div class="info-section">
                <div class="info-section-title">📊 Data Binding</div>
                <div class="binding-details">
                    <div class="binding-group">
                        <span class="binding-label">Dimensions:</span>
                        <span class="binding-value">${dimensions?.length || 0} configured</span>
                    </div>
                    <div class="binding-group">
                        <span class="binding-label">Measures:</span>
                        <span class="binding-value">${measures?.length || 0} configured</span>
                    </div>
                    <div class="binding-group">
                        <span class="binding-label">Filters:</span>
                        <span class="binding-value">${filters?.length || 0} applied</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Rendu des informations de configuration
     */
    renderConfigurationInfo(entity) {
        return `
            <div class="info-section">
                <div class="info-section-title">⚙️ Configuration</div>
                <div class="config-details">
                    <div class="config-group">
                        <span class="config-label">Type:</span>
                        <span class="config-value">${entity.type}</span>
                    </div>
                    <div class="config-group">
                        <span class="config-label">Version:</span>
                        <span class="config-value">v1.0</span>
                    </div>
                    <div class="config-group">
                        <span class="config-label">Size:</span>
                        <span class="config-value">${entity.size?.width || 6} × ${entity.size?.height || 4}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Rendu des informations d'état
     */
    renderStateInfo(entity) {
        const hasData = this.hasValidData(entity);
        const status = hasData ? '✅ Ready' : '⚠️ No Data';
        
        return `
            <div class="info-section">
                <div class="info-section-title">📈 Status</div>
                <div class="status-details">
                    <div class="status-group">
                        <span class="status-label">Data Status:</span>
                        <span class="status-value ${hasData ? 'ready' : 'warning'}">${status}</span>
                    </div>
                    <div class="status-group">
                        <span class="status-label">Created:</span>
                        <span class="status-value">${entity.createdAt ? new Date(entity.createdAt).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <div class="status-group">
                        <span class="status-label">Modified:</span>
                        <span class="status-value">${entity.updatedAt ? new Date(entity.updatedAt).toLocaleDateString() : 'Never'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Rendu des informations sur le fichier widget
     */
    renderWidgetFileInfo() {
        return `
            <div class="info-section">
                <div class="info-section-title">📄 Widget File</div>
                <div class="file-details">
                    <div class="file-group">
                        <span class="file-label">Filename:</span>
                        <span class="file-value">${this.widgetFileName}</span>
                    </div>
                    <div class="file-group">
                        <span class="file-label">Type:</span>
                        <span class="file-value">Unified Widget</span>
                    </div>
                    <div class="file-group">
                        <span class="file-label">Load:</span>
                        <span class="file-value">Dynamic (on View)</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Vérifie si l'entité a des données valides
     */
    hasValidData(entity) {
        if (!entity.dataBinding) return false;
        return entity.dataBinding.dimensions?.length > 0 || 
               entity.dataBinding.measures?.length > 0;
    }

    /**
     * Rendu des aperçus de données
     */
    renderDataPreview(entity) {
        return `
            <div class="info-section">
                <div class="info-section-title">📋 Data Preview</div>
                <div class="preview-note">
                    Switch to View mode to see the rendered widget with live data
                </div>
            </div>
        `;
    }

    /**
     * Rendu quand pas de données
     */
    renderNoDataInfo() {
        return `
            <div class="no-data-section">
                <div class="no-data-icon">📊</div>
                <div class="no-data-title">No Data Assigned</div>
                <div class="no-data-description">
                    Use the Feeding Panel to assign data to this widget
                </div>
            </div>
        `;
    }

    /**
     * Icône pour le type de tuile
     */
    getTileIcon(type) {
        const icons = {
            'bar-chart': '📊',
            'line-chart': '📈',
            'pie-chart': '🥧',
            'table': '📋',
            'kpi': '🎯',
            'map': '🗺️',
            'gauge': '⏲️'
        };
        
        return icons[type] || '📊';
    }

    getBaseStyles() {
        return super.getBaseStyles() + `
            <style>
                .tile-info-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }
                
                .tile-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    border-bottom: 1px solid var(--border-light, #eaecee);
                    background: var(--background-secondary, #f8f9fa);
                }
                
                .tile-icon {
                    font-size: 2em;
                    line-height: 1;
                }
                
                .tile-details {
                    flex: 1;
                }
                
                .tile-name {
                    font-size: 1.1em;
                    font-weight: 600;
                    color: var(--text-primary, #1a2733);
                    margin-bottom: 4px;
                }
                
                .tile-type,
                .tile-id {
                    font-size: 0.85em;
                    color: var(--text-secondary, #5b738b);
                    margin-bottom: 2px;
                }
                
                .widget-file {
                    font-size: 0.8em;
                    color: var(--info-color, #007bff);
                    font-family: monospace;
                    background: var(--background-tertiary, #f0f1f2);
                    padding: 2px 6px;
                    border-radius: 3px;
                    margin-top: 4px;
                    display: inline-block;
                }
                
                .tile-content {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }
                
                .info-section {
                    margin-bottom: 16px;
                }
                
                .info-section-title {
                    font-weight: 600;
                    color: var(--text-primary, #1a2733);
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .binding-details,
                .config-details,
                .status-details,
                .file-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .binding-group,
                .config-group,
                .status-group,
                .file-group {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 4px 0;
                }
                
                .binding-label,
                .config-label,
                .status-label,
                .file-label {
                    color: var(--text-secondary, #5b738b);
                    font-size: 0.85em;
                }
                
                .binding-value,
                .config-value,
                .status-value,
                .file-value {
                    color: var(--text-primary, #1a2733);
                    font-weight: 500;
                    font-size: 0.85em;
                }
                
                .status-value.ready {
                    color: var(--success-color, #28a745);
                }
                
                .status-value.warning {
                    color: var(--warning-color, #ffc107);
                }
                
                .file-value {
                    font-family: monospace;
                    font-size: 0.8em;
                }
                
                .preview-note {
                    color: var(--text-secondary, #5b738b);
                    font-size: 0.85em;
                    font-style: italic;
                }
                
                .no-data-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    text-align: center;
                }
                
                .no-data-icon {
                    font-size: 3em;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }
                
                .no-data-title {
                    font-size: 1.1em;
                    font-weight: 600;
                    color: var(--text-primary, #1a2733);
                    margin-bottom: 8px;
                }
                
                .no-data-description {
                    color: var(--text-secondary, #5b738b);
                    font-size: 0.9em;
                }
                
                .no-binding {
                    color: var(--text-tertiary, #a9b4be);
                    font-size: 0.85em;
                    font-style: italic;
                }
            </style>
        `;
    }
}

// Register the custom element
customElements.define('tile-info-widget', TileInfoWidget);

// Export for modules
window.TileInfoWidget = TileInfoWidget;