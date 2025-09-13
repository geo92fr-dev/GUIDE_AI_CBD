/**
 * 🎨 Widget Dual Mode Renderer
 * 
 * Renderer qui gère les deux modes d'affichage des widgets :
 * - Mode Info : Affiche les métadonnées et informations du widget (par défaut)
 * - Mode View : Affiche le rendu visuel du widget (graphique, tableau, etc.)
 */

class WidgetDualModeRenderer {
    constructor() {
        this.viewModeStates = new Map(); // widget-id -> boolean (true = view mode)
        this.widgetManager = null;
    }

    /**
     * Get WidgetManager instance (lazy initialization)
     */
    getWidgetManager() {
        if (!this.widgetManager) {
            console.log('🔍 DualModeRenderer: Checking WidgetManager availability...');
            console.log('🔍 window.WidgetManager:', typeof window.WidgetManager);
            console.log('🔍 WidgetManager global:', typeof WidgetManager);
            
            if (typeof window.WidgetManager !== 'undefined') {
                console.log('🏭 DualModeRenderer: Initializing WidgetManager from window');
                this.widgetManager = new window.WidgetManager();
            } else if (typeof WidgetManager !== 'undefined') {
                console.log('🏭 DualModeRenderer: Initializing WidgetManager from global');
                this.widgetManager = new WidgetManager();
            } else {
                console.error('❌ DualModeRenderer: WidgetManager not available');
                return null;
            }
        }
        
        if (this.widgetManager) {
            console.log('🔍 DualModeRenderer: widgetDefinitions:', this.widgetManager.widgetDefinitions);
        }
        
        return this.widgetManager;
    }

    /**
     * Set view mode for a widget
     */
    setViewMode(widgetId, isViewMode) {
        this.viewModeStates.set(widgetId, isViewMode);
        console.log('🔄 DualModeRenderer: Widget', widgetId, '→', isViewMode ? 'VIEW' : 'INFO');
    }

    /**
     * Get view mode for a widget
     */
    getViewMode(widgetId) {
        return this.viewModeStates.get(widgetId) || false; // Default to Info mode
    }

    /**
     * Toggle view mode for a widget
     */
    toggleViewMode(widgetId) {
        const currentMode = this.getViewMode(widgetId);
        this.setViewMode(widgetId, !currentMode);
        return !currentMode;
    }

    /**
     * Render widget based on current mode
     */
    async renderWidget(entity, container) {
        if (!entity || !container) {
            console.error('❌ DualModeRenderer: Missing entity or container');
            return;
        }

        const isViewMode = this.getViewMode(entity.id);
        
        if (isViewMode) {
            await this.renderViewMode(entity, container);
        } else {
            this.renderInfoMode(entity, container);
        }
    }

    /**
     * Render widget in View mode (visual rendering)
     */
    async renderViewMode(entity, container) {
        console.log('👁️ DualModeRenderer: Rendering VIEW mode for', entity.type, entity.id);
        
        try {
            // Vérifier si l'entité a des données
            const hasData = this.hasValidData(entity);
            
            if (!hasData) {
                container.innerHTML = this.renderNoDataForView(entity);
                return;
            }

            // Essayer d'utiliser les widgets unifiés d'abord
            if (await this.tryRenderUnifiedWidget(entity, container)) {
                return;
            }

            // Fallback vers le système de widgets classique
            if (await this.tryRenderClassicWidget(entity, container)) {
                return;
            }

            // Si aucun widget n'est disponible
            throw new Error(`No widget renderer available for type: ${entity.type}`);
            
        } catch (error) {
            console.error('❌ DualModeRenderer: View mode rendering failed:', error);
            container.innerHTML = this.renderDataError(entity, error);
        }
    }

    /**
     * Essayer de rendre avec un widget unifié
     */
    async tryRenderUnifiedWidget(entity, container) {
        console.log('🏭 DualModeRenderer: Trying unified widget for', entity.type);
        
        // Obtenir le WidgetManager (lazy initialization)
        const widgetManager = this.getWidgetManager();
        
        if (!widgetManager || !widgetManager.widgetDefinitions) {
            console.warn('⚠️ DualModeRenderer: No WidgetManager or definitions available');
            console.log('🔍 DualModeRenderer: WidgetManager available:', typeof WidgetManager);
            console.log('🔍 DualModeRenderer: widgetManager instance:', widgetManager);
            if (widgetManager) {
                console.log('🔍 DualModeRenderer: widgetDefinitions:', widgetManager.widgetDefinitions);
            }
            return false;
        }

        try {
            // Vérifier que le WidgetManager a une Map de définitions
            if (!widgetManager.widgetDefinitions || !(widgetManager.widgetDefinitions instanceof Map)) {
                console.error('❌ DualModeRenderer: WidgetManager widgetDefinitions is not a Map:', widgetManager.widgetDefinitions);
                return false;
            }
            
            // Charger le widget unifié si pas déjà chargé
            const widgetType = entity.type;
            console.log('🔍 DualModeRenderer: Looking for widget type:', widgetType);
            
            if (!widgetManager.widgetDefinitions.has(widgetType)) {
                console.log('📦 DualModeRenderer: Loading unified widget for', widgetType);
                // Essayer de charger le widget unifié
                const unifiedPath = `src/widgets/${widgetType}-widget-unified.js`;
                await widgetManager.loadUnifiedWidget(unifiedPath);
            } else {
                console.log('✅ DualModeRenderer: Widget definition already loaded for', widgetType);
            }

            if (widgetManager.widgetDefinitions.has(widgetType)) {
                console.log('🏭 DualModeRenderer: Using unified widget for', widgetType);
                
                // Créer l'instance du widget unifié
                const definition = widgetManager.widgetDefinitions.get(widgetType);
                console.log('📋 Widget definition:', definition);
                
                const widgetElement = new definition.class();
                console.log('🔧 Widget element created:', widgetElement);
                
                // Initialiser avec l'entité
                widgetElement.initializeWithEntity(entity);
                console.log('⚙️ Widget initialized with entity');
                
                // Convertir les données de l'entité vers le format du widget
                console.log('📊 DualModeRenderer: Converting entity data...');
                const widgetData = this.convertEntityDataToWidgetFormat(entity);
                console.log('📊 Widget data generated:', widgetData);
                
                widgetElement.updateData(widgetData);
                console.log('✅ Widget data updated');
                
                // Ajouter au container
                container.innerHTML = '';
                container.appendChild(widgetElement);
                console.log('🎨 Widget added to container');
                
                return true;
            } else {
                console.warn('⚠️ DualModeRenderer: Widget definition not found after loading for', widgetType);
                return false;
            }
        } catch (error) {
            console.error('❌ DualModeRenderer: Unified widget rendering failed:', error);
            return false;
        }
    }

    /**
     * Essayer de rendre avec le système de widgets classique
     */
    async tryRenderClassicWidget(entity, container) {
        try {
            // Essayer de créer un widget classique
            const widgetClass = this.getWidgetClass(entity.type);
            if (widgetClass) {
                console.log('🔧 DualModeRenderer: Using classic widget for', entity.type);
                
                const widget = new widgetClass();
                
                // Configurer le widget avec les données de l'entité
                const config = this.entityToClassicWidgetConfig(entity);
                if (widget.updateConfig) {
                    widget.updateConfig(config);
                }
                
                // Rendre le widget
                container.innerHTML = '';
                container.appendChild(widget);
                
                return true;
            }
        } catch (error) {
            console.warn('⚠️ DualModeRenderer: Classic widget rendering failed:', error);
        }
        
        return false;
    }

    /**
     * Render widget in Info mode (metadata display)
     */
    renderInfoMode(entity, container) {
        console.log('ℹ️ DualModeRenderer: Rendering INFO mode for', entity.type, entity.id);
        
        const hasData = this.hasValidData(entity);
        
        container.innerHTML = `
            <div class="widget-info-mode">
                <div class="widget-info-header">
                    <div class="widget-icon">${this.getWidgetIcon(entity.type)}</div>
                    <div class="widget-details">
                        <div class="widget-name">${entity.title || entity.type}</div>
                        <div class="widget-type">${entity.type} Widget</div>
                        <div class="widget-id">ID: ${entity.id}</div>
                    </div>
                </div>
                
                <div class="widget-info-content">
                    ${this.renderDataBindingInfo(entity)}
                    ${this.renderConfigurationInfo(entity)}
                    ${this.renderStateInfo(entity)}
                </div>
                
                ${hasData ? this.renderDataPreview(entity) : this.renderNoDataInfo()}
            </div>
            
            <style>
                .widget-info-mode {
                    padding: 16px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    color: var(--text-primary, #EAECEE);
                    font-size: 0.9em;
                    overflow-y: auto;
                }
                
                .widget-info-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--border-light, #1A2733);
                }
                
                .widget-icon {
                    font-size: 2em;
                    line-height: 1;
                }
                
                .widget-details {
                    flex: 1;
                }
                
                .widget-name {
                    font-weight: 600;
                    color: var(--business-blue, #1B90FF);
                    margin-bottom: 4px;
                }
                
                .widget-type {
                    color: var(--text-secondary, #A9B4BE);
                    font-size: 0.9em;
                }
                
                .widget-id {
                    font-family: monospace;
                    font-size: 0.8em;
                    color: var(--text-disabled, #6B7680);
                    margin-top: 4px;
                }
                
                .info-section {
                    margin-bottom: 16px;
                }
                
                .info-section-title {
                    font-weight: 600;
                    color: var(--text-primary, #EAECEE);
                    margin-bottom: 6px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .info-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .info-item {
                    padding: 4px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .info-label {
                    color: var(--text-secondary, #A9B4BE);
                    font-size: 0.85em;
                }
                
                .info-value {
                    color: var(--text-primary, #EAECEE);
                    font-weight: 500;
                    font-size: 0.85em;
                }
                
                .status-indicator {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 6px;
                }
                
                .status-success { background: var(--success-color, #30C330); }
                .status-warning { background: var(--warning-color, #FF9500); }
                .status-error { background: var(--danger-color, #FF3B30); }
                
                .no-data-info {
                    text-align: center;
                    padding: 20px;
                    color: var(--text-secondary, #A9B4BE);
                    background: var(--background-tertiary, #00144A);
                    border-radius: var(--radius-md, 8px);
                    border: 1px dashed var(--border-light, #1A2733);
                }
            </style>
        `;
    }

    /**
     * Render data binding information
     */
    renderDataBindingInfo(entity) {
        const { dimensions, measures, filters } = entity.dataBinding;
        
        return `
            <div class="info-section">
                <div class="info-section-title">
                    🔗 Data Binding
                </div>
                <ul class="info-list">
                    <li class="info-item">
                        <span class="info-label">Dimensions:</span>
                        <span class="info-value">${dimensions.length} field(s)</span>
                    </li>
                    <li class="info-item">
                        <span class="info-label">Measures:</span>
                        <span class="info-value">${measures.length} field(s)</span>
                    </li>
                    <li class="info-item">
                        <span class="info-label">Filters:</span>
                        <span class="info-value">${filters.length} filter(s)</span>
                    </li>
                </ul>
                ${dimensions.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <div class="info-label">Dimensions:</div>
                        ${dimensions.map(d => `<div class="info-value">• ${d.displayName || d.name}</div>`).join('')}
                    </div>
                ` : ''}
                ${measures.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <div class="info-label">Measures:</div>
                        ${measures.map(m => `<div class="info-value">• ${m.displayName || m.name}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render configuration information
     */
    renderConfigurationInfo(entity) {
        const config = entity.configuration || {};
        const configKeys = Object.keys(config);
        
        if (configKeys.length === 0) {
            return `
                <div class="info-section">
                    <div class="info-section-title">⚙️ Configuration</div>
                    <div class="info-value">Default configuration</div>
                </div>
            `;
        }
        
        return `
            <div class="info-section">
                <div class="info-section-title">⚙️ Configuration</div>
                <ul class="info-list">
                    ${configKeys.map(key => `
                        <li class="info-item">
                            <span class="info-label">${key}:</span>
                            <span class="info-value">${this.formatConfigValue(config[key])}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Render state information
     */
    renderStateInfo(entity) {
        const state = entity.state || {};
        const hasData = this.hasValidData(entity);
        
        return `
            <div class="info-section">
                <div class="info-section-title">📊 Status</div>
                <ul class="info-list">
                    <li class="info-item">
                        <span class="info-label">Data Status:</span>
                        <span class="info-value">
                            <span class="status-indicator ${hasData ? 'status-success' : 'status-warning'}"></span>
                            ${hasData ? 'Has Data' : 'No Data'}
                        </span>
                    </li>
                    <li class="info-item">
                        <span class="info-label">Visibility:</span>
                        <span class="info-value">
                            <span class="status-indicator ${state.isVisible !== false ? 'status-success' : 'status-error'}"></span>
                            ${state.isVisible !== false ? 'Visible' : 'Hidden'}
                        </span>
                    </li>
                    <li class="info-item">
                        <span class="info-label">Error State:</span>
                        <span class="info-value">
                            <span class="status-indicator ${state.hasError ? 'status-error' : 'status-success'}"></span>
                            ${state.hasError ? 'Has Errors' : 'OK'}
                        </span>
                    </li>
                    <li class="info-item">
                        <span class="info-label">Created:</span>
                        <span class="info-value">${this.formatDate(entity.createdAt)}</span>
                    </li>
                    <li class="info-item">
                        <span class="info-label">Updated:</span>
                        <span class="info-value">${this.formatDate(entity.updatedAt)}</span>
                    </li>
                </ul>
            </div>
        `;
    }

    /**
     * Render data preview
     */
    renderDataPreview(entity) {
        console.log('📋 DualModeRenderer: Rendering data preview for entity:', entity.id);
        console.log('🔍 Entity dataBinding:', entity.dataBinding);
        
        // Récupérer les données réelles
        let dataPreviewHtml = '';
        try {
            if (typeof window !== 'undefined' && window.dataModel && entity.dataBinding) {
                const realData = window.dataModel.getDataForBinding(entity.dataBinding);
                console.log('📊 Data preview - Real data type:', typeof realData);
                console.log('📊 Data preview - Real data:', realData);
                console.log('📊 Data preview - Is Array:', Array.isArray(realData));
                
                if (realData && realData.length > 0) {
                    console.log('📊 Data preview - First item type:', typeof realData[0]);
                    console.log('📊 Data preview - First item:', realData[0]);
                    
                    // Analyser la structure du premier élément
                    let firstRowKeys = 'None';
                    let firstRowSample = 'None';
                    
                    if (realData[0] && typeof realData[0] === 'object') {
                        try {
                            firstRowKeys = Object.keys(realData[0]);
                            firstRowSample = realData[0];
                            console.log('� Data preview - First row keys:', firstRowKeys);
                        } catch (e) {
                            console.error('❌ Error getting keys from first row:', e);
                            firstRowKeys = 'Error getting keys';
                        }
                    }
                    
                    // Prendre les 10 premières lignes
                    const previewData = realData.slice(0, 10);
                    const { dimensions, measures } = entity.dataBinding;
                    
                    console.log('🔍 Dimensions configuration:', dimensions);
                    console.log('🔍 Measures configuration:', measures);
                    
                    // Créer un tableau HTML
                    let tableHtml = '<table class="data-preview-table"><thead><tr>';
                    
                    // En-têtes des colonnes - essayer différentes propriétés pour les noms de champs
                    const dimensionFields = [];
                    dimensions.forEach(dim => {
                        const fieldName = dim.name || dim.fieldId || dim.field || dim.id;
                        dimensionFields.push(fieldName);
                        tableHtml += `<th>${fieldName} (dim)</th>`;
                        console.log('🔍 Dimension field name:', fieldName, 'from config:', dim);
                    });
                    
                    const measureFields = [];
                    measures.forEach(measure => {
                        const fieldName = measure.name || measure.fieldId || measure.field || measure.id;
                        measureFields.push(fieldName);
                        tableHtml += `<th>${fieldName} (measure)</th>`;
                        console.log('🔍 Measure field name:', fieldName, 'from config:', measure);
                    });
                    tableHtml += '</tr></thead><tbody>';
                    
                    // Lignes de données
                    previewData.forEach((row, index) => {
                        console.log(`🔍 Row ${index} type:`, typeof row);
                        console.log(`🔍 Row ${index} data:`, row);
                        tableHtml += '<tr>';
                        
                        dimensionFields.forEach(fieldName => {
                            let value = '-';
                            if (row && typeof row === 'object') {
                                value = row[fieldName];
                                console.log(`🔍 Looking for dimension field '${fieldName}' in row:`, value);
                            }
                            tableHtml += `<td>${value !== undefined && value !== null ? value : '-'}</td>`;
                        });
                        
                        measureFields.forEach(fieldName => {
                            let value = '-';
                            if (row && typeof row === 'object') {
                                value = row[fieldName];
                                console.log(`🔍 Looking for measure field '${fieldName}' in row:`, value);
                            }
                            tableHtml += `<td>${value !== undefined && value !== null ? value : '-'}</td>`;
                        });
                        tableHtml += '</tr>';
                    });
                    tableHtml += '</tbody></table>';
                    
                    // Ajouter un debug des clés disponibles - corrigé
                    let availableKeysDisplay = 'None';
                    if (Array.isArray(firstRowKeys)) {
                        availableKeysDisplay = firstRowKeys.join(', ');
                    } else if (typeof firstRowKeys === 'string') {
                        availableKeysDisplay = firstRowKeys;
                    }
                    
                    dataPreviewHtml = `
                        <div class="data-preview-content">
                            <div style="margin-bottom: 8px; color: var(--text-secondary);">
                                Showing ${previewData.length} of ${realData.length} rows
                            </div>
                            <div style="margin-bottom: 8px; font-size: 0.7em; color: var(--warning-color);">
                                🔍 Available data keys: ${availableKeysDisplay}
                            </div>
                            <div style="margin-bottom: 8px; font-size: 0.7em; color: var(--info-color);">
                                📊 First row sample: ${typeof firstRowSample === 'object' ? JSON.stringify(firstRowSample) : firstRowSample}
                            </div>
                            ${tableHtml}
                        </div>
                        
                        <style>
                            .data-preview-table {
                                width: 100%;
                                border-collapse: collapse;
                                font-size: 0.75em;
                                margin-top: 8px;
                            }
                            .data-preview-table th,
                            .data-preview-table td {
                                padding: 4px 8px;
                                text-align: left;
                                border: 1px solid var(--border-light, #1A2733);
                            }
                            .data-preview-table th {
                                background: var(--background-secondary, #1A2733);
                                font-weight: 600;
                                color: var(--text-primary);
                            }
                            .data-preview-table td {
                                color: var(--text-secondary);
                            }
                            .data-preview-table tr:nth-child(even) {
                                background: rgba(26, 39, 51, 0.3);
                            }
                        </style>
                    `;
                } else {
                    dataPreviewHtml = `
                        <div style="color: var(--warning-color); font-size: 0.8em;">
                            ⚠️ No data found for this binding (length: ${realData ? realData.length : 'null'})
                        </div>
                    `;
                }
            } else {
                dataPreviewHtml = `
                    <div style="color: var(--text-secondary); font-size: 0.8em;">
                        DataModel not available or no dataBinding
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error generating data preview:', error);
            dataPreviewHtml = `
                <div style="color: var(--danger-color); font-size: 0.8em;">
                    ❌ Error loading data: ${error.message}
                </div>
            `;
        }
        
        return `
            <div class="info-section">
                <div class="info-section-title">📋 Data Preview</div>
                ${dataPreviewHtml}
                <div style="font-size: 0.8em; color: var(--text-secondary, #A9B4BE); margin-top: 8px;">
                    Switch to View mode to see the rendered widget
                </div>
            </div>
        `;
    }

    /**
     * Render no data information
     */
    renderNoDataInfo() {
        return `
            <div class="no-data-info">
                <div style="font-size: 1.5em; margin-bottom: 8px;">📊</div>
                <div>No data assigned</div>
                <div style="font-size: 0.8em; margin-top: 8px;">
                    Use the Feeding Panel to assign data to this widget
                </div>
            </div>
        `;
    }

    /**
     * Utility methods
     */
    hasValidData(entity) {
        if (!entity.dataBinding) return false;
        return entity.dataBinding.dimensions.length > 0 || 
               entity.dataBinding.measures.length > 0;
    }

    getWidgetIcon(type) {
        const icons = {
            'bar-chart': '📊',
            'line-chart': '📈',
            'pie-chart': '🥧',
            'table': '📋',
            'kpi-card': '🎯',
            'scatter-plot': '📈'
        };
        return icons[type] || '📊';
    }

    formatConfigValue(value) {
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return 'Invalid Date';
        }
    }

    renderNoDataForView(entity) {
        return `
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary, #A9B4BE); text-align: center;">
                <div style="font-size: 3em; margin-bottom: 16px;">${this.getWidgetIcon(entity.type)}</div>
                <div style="font-size: 1.1em; margin-bottom: 8px;">No Data to Display</div>
                <div style="font-size: 0.9em; opacity: 0.7;">Assign data using the Feeding Panel to see the rendered widget</div>
            </div>
        `;
    }

    renderDataError(entity, error) {
        const isDataError = error.message.includes('data') || error.message.includes('Data');
        
        return `
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--danger-color, #FF3B30); text-align: center; padding: 20px;">
                <div style="font-size: 3em; margin-bottom: 16px;">${isDataError ? '📊' : '⚠️'}</div>
                <div style="font-size: 1.2em; margin-bottom: 12px; font-weight: 600;">
                    ${isDataError ? 'Data Required' : 'Rendering Error'}
                </div>
                <div style="font-size: 0.9em; margin-bottom: 16px; opacity: 0.8; max-width: 300px; line-height: 1.4;">
                    ${error.message}
                </div>
                ${isDataError ? `
                    <div style="font-size: 0.8em; color: var(--text-secondary, #A9B4BE); margin-top: 8px;">
                        💡 Use the Feeding Panel to assign data to this widget
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderViewError(entity, error) {
        return `
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--danger-color, #FF3B30); text-align: center;">
                <div style="font-size: 3em; margin-bottom: 16px;">⚠️</div>
                <div style="font-size: 1.1em; margin-bottom: 8px;">Rendering Error</div>
                <div style="font-size: 0.9em; opacity: 0.7;">${error.message}</div>
            </div>
        `;
    }

    convertEntityDataToWidgetFormat(entity) {
        console.log('🔄 DualModeRenderer: Converting entity data for', entity.type);
        
        // Vérifier si l'entité a des données binding
        const { dimensions, measures } = entity.dataBinding || { dimensions: [], measures: [] };
        
        if (dimensions.length === 0 || measures.length === 0) {
            console.log('⚠️ DualModeRenderer: No data binding for entity', entity.id);
            return [];
        }
        
        // Récupérer les vraies données via le DataModel global
        try {
            if (typeof window !== 'undefined' && window.dataModel) {
                console.log('📊 DualModeRenderer: Getting real data from DataModel');
                
                // Utiliser getDataForBinding pour récupérer les données réelles
                const realData = window.dataModel.getDataForBinding(entity.dataBinding);
                
                if (realData && realData.length > 0) {
                    console.log('✅ DualModeRenderer: Found real data:', realData.length, 'records');
                    return this.formatDataForWidget(realData, dimensions, measures, entity.type);
                } else {
                    console.warn('⚠️ DualModeRenderer: No real data found, DataModel returned empty');
                }
            } else {
                console.warn('⚠️ DualModeRenderer: DataModel not available in window');
            }
        } catch (error) {
            console.error('❌ DualModeRenderer: Error accessing real data:', error);
            throw new Error(`Unable to access widget data: ${error.message}`);
        }
        
        // Erreur propre si aucune vraie donnée n'est disponible
        throw new Error('No real data available for this widget. Please assign data using the Feeding Panel.');
    }

    /**
     * Formater les vraies données pour les widgets
     */
    formatDataForWidget(realData, dimensions, measures, widgetType) {
        console.log('🎨 DualModeRenderer: Formatting real data for widget:', widgetType);
        console.log('📊 Raw data type:', typeof realData, 'Is Array:', Array.isArray(realData));
        console.log('� Raw data:', realData);
        console.log('�📋 Dimensions config:', dimensions);
        console.log('📈 Measures config:', measures);
        
        if (!realData || realData.length === 0) {
            console.warn('⚠️ No real data to format');
            return [];
        }
        
        // Debug: Afficher les clés disponibles dans les données - robuste
        if (realData[0]) {
            console.log('🔍 First item type:', typeof realData[0]);
            console.log('🔍 First item content:', realData[0]);
            
            if (realData[0] && typeof realData[0] === 'object') {
                try {
                    const keys = Object.keys(realData[0]);
                    console.log('🔍 Available data keys:', keys);
                    console.log('🔍 First row sample values:');
                    keys.forEach(key => {
                        console.log(`  - ${key}:`, realData[0][key], `(${typeof realData[0][key]})`);
                    });
                } catch (e) {
                    console.error('❌ Error getting keys from first item:', e);
                }
            }
        }
        
        const formattedData = [];
        
        try {
            // Pour chaque ligne de données réelles
            realData.forEach((dataRow, index) => {
                console.log(`📝 Processing row ${index} (type: ${typeof dataRow}):`, dataRow);
                
                // Vérifier que la ligne est un objet
                if (!dataRow || typeof dataRow !== 'object') {
                    console.warn(`⚠️ Row ${index} is not an object, skipping`);
                    return;
                }
                
                // Extraire la valeur de dimension (pour le label)
                let label = 'Unknown';
                if (dimensions.length > 0) {
                    const dimension = dimensions[0]; // Prendre la première dimension
                    const dimensionField = dimension.name || dimension.fieldId || dimension.field || dimension.id;
                    console.log(`🔍 Looking for dimension field '${dimensionField}' in:`, dataRow);
                    
                    // Essayer différentes approches pour trouver la valeur
                    label = dataRow[dimensionField];
                    
                    // Si pas trouvé, essayer avec les clés disponibles (fallback intelligent)
                    if (label === undefined || label === null) {
                        try {
                            const availableKeys = Object.keys(dataRow);
                            console.log('🔍 Dimension field not found, available keys:', availableKeys);
                            
                            // Essayer de deviner le bon champ (premier champ string-like)
                            for (const key of availableKeys) {
                                const value = dataRow[key];
                                if (typeof value === 'string' || (typeof value !== 'number' && value !== null)) {
                                    label = value;
                                    console.log(`🎯 Using '${key}' as dimension fallback:`, value);
                                    break;
                                }
                            }
                        } catch (e) {
                            console.error('❌ Error getting fallback dimension:', e);
                        }
                        
                        if (label === undefined || label === null) {
                            label = `Item ${index + 1}`;
                        }
                    }
                }
                
                // Extraire la valeur de mesure (pour la valeur)
                let value = 0;
                if (measures.length > 0) {
                    const measure = measures[0]; // Prendre la première mesure
                    const measureField = measure.name || measure.fieldId || measure.field || measure.id;
                    console.log(`🔍 Looking for measure field '${measureField}' in:`, dataRow);
                    
                    value = dataRow[measureField];
                    
                    // Si pas trouvé, essayer avec les clés disponibles (fallback intelligent)
                    if (value === undefined || value === null) {
                        try {
                            const availableKeys = Object.keys(dataRow);
                            console.log('🔍 Measure field not found, available keys:', availableKeys);
                            
                            // Essayer de deviner le bon champ (premier champ numérique)
                            for (const key of availableKeys) {
                                const val = dataRow[key];
                                if (typeof val === 'number' || !isNaN(parseFloat(val))) {
                                    value = parseFloat(val);
                                    console.log(`🎯 Using '${key}' as measure fallback:`, val);
                                    break;
                                }
                            }
                        } catch (e) {
                            console.error('❌ Error getting fallback measure:', e);
                        }
                        
                        if (value === undefined || value === null || isNaN(value)) {
                            value = 0;
                        }
                    } else {
                        value = parseFloat(value) || 0;
                    }
                }
                
                // Ajouter le point de données formaté
                formattedData.push({
                    label: String(label),
                    value: value
                });
                
                console.log(`✅ Formatted data point: ${label} = ${value}`);
            });
            
            console.log('🎯 Final formatted data:', formattedData);
            return formattedData;
            
        } catch (error) {
            console.error('❌ Error formatting real data:', error);
            throw new Error(`Data formatting failed: ${error.message}`);
        }
    }

    /**
     * Générer des données d'exemple pour un type de widget
     */
    generateSampleDataForWidget(widgetType) {
        switch (widgetType) {
            case 'bar-chart':
                return [
                    { label: 'North', value: 25000 },
                    { label: 'South', value: 18000 },
                    { label: 'East', value: 32000 },
                    { label: 'West', value: 21000 },
                    { label: 'Central', value: 28000 }
                ];
            case 'line-chart':
                return [
                    { label: 'Jan', value: 15000 },
                    { label: 'Feb', value: 18000 },
                    { label: 'Mar', value: 22000 },
                    { label: 'Apr', value: 25000 },
                    { label: 'May', value: 28000 },
                    { label: 'Jun', value: 32000 }
                ];
            case 'pie-chart':
                return [
                    { label: 'Desktop', value: 45 },
                    { label: 'Mobile', value: 35 },
                    { label: 'Tablet', value: 20 }
                ];
            default:
                return [
                    { label: 'Sample A', value: 100 },
                    { label: 'Sample B', value: 150 },
                    { label: 'Sample C', value: 200 }
                ];
        }
    }

    /**
     * Générer des données de bar chart basées sur les bindings
     */
    generateBarChartData(dimensions, measures, entity) {
        const dimension = dimensions[0]; // Première dimension
        const measure = measures[0]; // Première mesure
        
        // Générer des données basées sur les noms des champs
        const sampleCategories = this.generateCategoriesFromDimension(dimension);
        const data = [];
        
        for (const category of sampleCategories) {
            data.push({
                label: category,
                value: Math.floor(Math.random() * 50000) + 10000 // Valeurs entre 10k et 60k
            });
        }
        
        console.log('📊 Generated bar chart data:', data);
        return data;
    }

    /**
     * Générer des données de line chart basées sur les bindings
     */
    generateLineChartData(dimensions, measures, entity) {
        const dimension = dimensions[0];
        const measure = measures[0];
        
        const timeCategories = this.generateTimeCategoriesFromDimension(dimension);
        const data = [];
        
        let baseValue = 15000;
        for (const category of timeCategories) {
            baseValue += (Math.random() - 0.5) * 5000; // Variation aléatoire
            data.push({
                label: category,
                value: Math.max(1000, Math.floor(baseValue)) // Minimum 1000
            });
        }
        
        console.log('📈 Generated line chart data:', data);
        return data;
    }

    /**
     * Générer des données de pie chart basées sur les bindings
     */
    generatePieChartData(dimensions, measures, entity) {
        const dimension = dimensions[0];
        const measure = measures[0];
        
        const categories = this.generateCategoriesFromDimension(dimension);
        const data = [];
        let total = 100;
        
        for (let i = 0; i < categories.length; i++) {
            const isLast = i === categories.length - 1;
            const value = isLast ? total : Math.floor(Math.random() * (total / 2)) + 5;
            total -= value;
            
            data.push({
                label: categories[i],
                value: value
            });
            
            if (total <= 0) break;
        }
        
        console.log('🥧 Generated pie chart data:', data);
        return data;
    }

    /**
     * Générer des catégories basées sur le nom de la dimension
     */
    generateCategoriesFromDimension(dimension) {
        const name = dimension.name.toLowerCase();
        
        if (name.includes('region') || name.includes('area') || name.includes('zone')) {
            return ['North', 'South', 'East', 'West', 'Central'];
        }
        if (name.includes('team') || name.includes('department') || name.includes('group')) {
            return ['Sales', 'Marketing', 'Engineering', 'Support', 'Finance'];
        }
        if (name.includes('product') || name.includes('item') || name.includes('category')) {
            return ['Product A', 'Product B', 'Product C', 'Product D'];
        }
        if (name.includes('country') || name.includes('nation')) {
            return ['USA', 'France', 'Germany', 'Japan', 'Brazil'];
        }
        if (name.includes('city') || name.includes('location')) {
            return ['New York', 'Paris', 'London', 'Tokyo', 'Sydney'];
        }
        
        // Fallback générique
        return ['Category 1', 'Category 2', 'Category 3', 'Category 4'];
    }

    /**
     * Générer des catégories temporelles basées sur le nom de la dimension
     */
    generateTimeCategoriesFromDimension(dimension) {
        const name = dimension.name.toLowerCase();
        
        if (name.includes('month') || name.includes('monthly')) {
            return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        }
        if (name.includes('quarter') || name.includes('q')) {
            return ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        if (name.includes('year') || name.includes('annual')) {
            return ['2020', '2021', '2022', '2023', '2024'];
        }
        if (name.includes('week') || name.includes('weekly')) {
            return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        }
        if (name.includes('day') || name.includes('daily')) {
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        }
        
        // Fallback vers les mois
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    }

    getWidgetClass(type) {
        // Retourner la classe de widget classique selon le type
        // À implémenter selon votre système de widgets existant
        return null;
    }

    entityToClassicWidgetConfig(entity) {
        // Convertir une entité vers la configuration des widgets classiques
        return {
            id: entity.id,
            title: entity.title,
            type: entity.type,
            ...entity.configuration
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WidgetDualModeRenderer;
}