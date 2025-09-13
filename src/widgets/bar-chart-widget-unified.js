/**
 * 📊 BAR CHART WIDGET - Widget auto-contenu complet
 * 
 * Fichier unique contenant :
 * - Métadonnées WidgetEntity (template de création)
 * - Code de rendu complet (HTML/CSS/JS)
 * - Configuration et logique métier
 * 
 * Ce fichier peut être distribué indépendamment et chargé dynamiquement.
 */

// ====================================================================
// 📋 WIDGET ENTITY METADATA - Template de création
// ====================================================================

const BAR_CHART_WIDGET_DEFINITION = {
    // === IDENTITÉ ===
    type: 'bar-chart',
    name: 'Bar Chart',
    title: 'Bar Chart Visualization',
    version: '1.0.0',
    
    // === MÉTADONNÉES ===
    metadata: {
        description: 'Interactive bar chart for comparing values across categories',
        author: 'Widgets Platform',
        tags: ['chart', 'visualization', 'comparison', 'business'],
        category: 'Charts',
        icon: '📊',
        preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3QgeD0iMTAiIHk9IjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMxQjkwRkYiLz48L3N2Zz4=',
        documentation: 'Bar chart widget for displaying categorical data with quantitative values'
    },
    
    // === CONFIGURATION DONNÉES ===
    dataBinding: {
        requirements: {
            dimensions: { min: 1, max: 2, required: true },
            measures: { min: 1, max: 3, required: true },
            filters: { min: 0, max: 10, required: false }
        },
        defaultBinding: {
            dimensions: [],
            measures: [],
            filters: []
        }
    },
    
    // === LAYOUT PAR DÉFAUT ===
    layout: {
        size: { width: 6, height: 4 },
        minSize: { width: 3, height: 2 },
        maxSize: { width: 12, height: 8 },
        responsive: true
    },
    
    // === CONFIGURATION WIDGET ===
    configuration: {
        orientation: { type: 'select', options: ['vertical', 'horizontal'], default: 'vertical' },
        showValues: { type: 'boolean', default: true },
        showGrid: { type: 'boolean', default: true },
        animation: { type: 'boolean', default: true },
        colorScheme: { type: 'select', options: ['business', 'rainbow', 'monochrome'], default: 'business' }
    },
    
    // === RENDU ===
    rendering: {
        engine: 'native-svg',
        dependencies: [], // Pas de dépendances externes
        performance: {
            maxDataPoints: 1000,
            updateMode: 'incremental'
        }
    }
};

// Ajouter la classe à la définition après la déclaration de la classe
// Cette ligne sera mise à jour plus bas après la déclaration de BarChartWidgetUnified

// ====================================================================
// 🎨 BAR CHART WIDGET CLASS - Implémentation complète
// ====================================================================

class BarChartWidgetUnified extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // État du widget
        this.widgetEntity = null;
        this.chartData = [];
        this.isRendered = false;
        
        // Configuration par défaut
        this.config = {
            orientation: 'vertical',
            showValues: true,
            showGrid: true,
            animation: true,
            colorScheme: 'business',
            margins: { top: 20, right: 30, bottom: 40, left: 60 }
        };
        
        // Couleurs business
        this.colorSchemes = {
            business: [
                '#1B90FF', // Blue primary
                '#049F9A', // Teal
                '#36A41D', // Green
                '#E76500', // Orange
                '#EE3939', // Red
                '#7858FF', // Indigo
                '#FA4F96', // Raspberry
                '#F31DED'  // Pink
            ],
            rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
            monochrome: ['#1a1a1a', '#404040', '#666666', '#808080', '#999999', '#b3b3b3']
        };
    }

    // ================================
    // 🔧 API PUBLIQUE WIDGET
    // ================================

    /**
     * Initialise le widget avec une entité
     */
    initializeWithEntity(widgetEntity) {
        this.widgetEntity = widgetEntity;
        
        // Charger configuration depuis l'entité
        if (widgetEntity.configuration) {
            Object.assign(this.config, widgetEntity.configuration);
        }
        
        // Charger données depuis dataBinding
        this.loadDataFromEntity();
        
        // Rendre le widget
        this.render();
        
        console.log('📊 Bar Chart Widget initialized with entity:', widgetEntity.id);
    }

    /**
     * Met à jour les données du widget
     */
    updateData(newData) {
        console.log('📊 BarChartWidgetUnified: updateData called with:', newData);
        this.chartData = this.processRawData(newData);
        console.log('🎯 BarChartWidgetUnified: Chart data after processing:', this.chartData);
        this.renderChart();
        console.log('✅ BarChartWidgetUnified: Chart rendered');
    }

    /**
     * Met à jour la configuration
     */
    updateConfiguration(newConfig) {
        Object.assign(this.config, newConfig);
        this.render();
    }

    // ================================
    // 📊 TRAITEMENT DES DONNÉES
    // ================================

    loadDataFromEntity() {
        if (!this.widgetEntity || !this.widgetEntity.dataBinding) {
            this.chartData = this.generateSampleData();
            return;
        }

        const { dimensions, measures } = this.widgetEntity.dataBinding;
        
        if (dimensions.length === 0 || measures.length === 0) {
            this.chartData = this.generateSampleData();
            return;
        }

        // TODO: Charger vraies données depuis dataSource
        // Pour l'instant, générer des données d'exemple
        this.chartData = this.generateSampleData();
    }

    processRawData(rawData) {
        console.log('🔧 BarChartWidgetUnified: Processing raw data:', rawData);
        
        if (!rawData || rawData.length === 0) {
            console.log('⚠️ BarChartWidgetUnified: No data provided, using sample data');
            return this.generateSampleData();
        }

        // Traitement basique des données - harmoniser les noms de propriétés
        const processedData = rawData.map((item, index) => {
            const processedItem = {
                category: item.category || item.label || item.name || `Category ${index + 1}`,
                value: parseFloat(item.value) || 0,
                color: this.getColor(index)
            };
            console.log(`📊 Processed item ${index}:`, processedItem);
            return processedItem;
        });
        
        console.log('✅ BarChartWidgetUnified: Final processed data:', processedData);
        return processedData;
    }

    generateSampleData() {
        const categories = ['Sales', 'Marketing', 'Development', 'Support', 'Finance'];
        return categories.map((category, index) => ({
            category,
            value: Math.floor(Math.random() * 100) + 20,
            color: this.getColor(index)
        }));
    }

    getColor(index) {
        const colors = this.colorSchemes[this.config.colorScheme];
        return colors[index % colors.length];
    }

    // ================================
    // 🎨 RENDU DU WIDGET
    // ================================

    render() {
        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <div class="bar-chart-widget">
                <div class="widget-header">
                    <h3 class="widget-title">${this.widgetEntity?.title || 'Bar Chart'}</h3>
                </div>
                <div class="chart-container">
                    <svg class="chart-svg" id="barChart">
                        <!-- Chart content will be rendered here -->
                    </svg>
                </div>
                ${this.config.showValues ? '<div class="chart-legend"></div>' : ''}
            </div>
        `;

        // Attendre que le DOM soit prêt puis rendre le graphique
        setTimeout(() => {
            this.renderChart();
            this.isRendered = true;
        }, 0);
    }

    renderChart() {
        console.log('🎨 BarChartWidgetUnified: renderChart called');
        console.log('📊 Chart data to render:', this.chartData);
        
        const svg = this.shadowRoot.querySelector('#barChart');
        if (!svg) {
            console.error('❌ SVG element #barChart not found');
            return;
        }

        // Obtenir dimensions du conteneur
        const container = this.shadowRoot.querySelector('.chart-container');
        const rect = container.getBoundingClientRect();
        const width = rect.width - this.config.margins.left - this.config.margins.right;
        const height = rect.height - this.config.margins.top - this.config.margins.bottom;
        
        console.log('📐 Container dimensions:', { 
            containerWidth: rect.width, 
            containerHeight: rect.height, 
            chartWidth: width, 
            chartHeight: height 
        });

        if (width <= 0 || height <= 0) {
            console.log('⏳ Container not ready, retrying in 100ms');
            setTimeout(() => this.renderChart(), 100);
            return;
        }

        // Nettoyer le SVG
        svg.innerHTML = '';
        svg.setAttribute('width', rect.width);
        svg.setAttribute('height', rect.height);

        // Créer le groupe principal avec marges
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${this.config.margins.left}, ${this.config.margins.top})`);
        svg.appendChild(g);

        // Calculer les échelles
        const maxValue = Math.max(...this.chartData.map(d => d.value));
        const barWidth = width / this.chartData.length * 0.8;
        const barSpacing = width / this.chartData.length * 0.2;
        
        console.log('📏 Chart calculations:', {
            dataPoints: this.chartData.length,
            maxValue,
            barWidth,
            barSpacing
        });

        // Rendu des barres
        this.chartData.forEach((data, index) => {
            const barHeight = (data.value / maxValue) * height;
            const x = index * (barWidth + barSpacing) + barSpacing / 2;
            const y = height - barHeight;
            
            console.log(`📊 Bar ${index}:`, {
                category: data.category,
                value: data.value,
                barHeight,
                x, y
            });

            // Créer la barre
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', data.color);
            rect.setAttribute('class', 'bar');
            rect.setAttribute('data-value', data.value);
            rect.setAttribute('data-category', data.category);

            // Animation
            if (this.config.animation) {
                rect.style.transition = 'all 0.3s ease';
            }

            // Events
            rect.addEventListener('mouseenter', (e) => this.handleBarHover(e, data));
            rect.addEventListener('mouseleave', (e) => this.handleBarLeave(e, data));

            g.appendChild(rect);

            // Label de catégorie
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + barWidth / 2);
            text.setAttribute('y', height + 15);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', 'category-label');
            text.textContent = data.category;
            g.appendChild(text);

            // Valeur au-dessus de la barre
            if (this.config.showValues) {
                const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                valueText.setAttribute('x', x + barWidth / 2);
                valueText.setAttribute('y', y - 5);
                valueText.setAttribute('text-anchor', 'middle');
                valueText.setAttribute('class', 'value-label');
                valueText.textContent = Math.round(data.value);
                g.appendChild(valueText);
            }
        });

        // Grille si activée
        if (this.config.showGrid) {
            this.renderGrid(g, width, height, maxValue);
        }
    }

    renderGrid(container, width, height, maxValue) {
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = height - (i / gridLines) * height;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('class', 'grid-line');
            container.appendChild(line);

            // Label de valeur
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', -10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('class', 'grid-label');
            text.textContent = Math.round((i / gridLines) * maxValue);
            container.appendChild(text);
        }
    }

    // ================================
    // 🎯 INTERACTIONS
    // ================================

    handleBarHover(event, data) {
        const bar = event.target;
        bar.style.opacity = '0.8';
        bar.style.stroke = '#1a2733';
        bar.style.strokeWidth = '2';

        // TODO: Afficher tooltip
        console.log('📊 Bar hovered:', data);
    }

    handleBarLeave(event, data) {
        const bar = event.target;
        bar.style.opacity = '1';
        bar.style.stroke = 'none';
    }

    // ================================
    // 🎨 STYLES CSS INTÉGRÉS
    // ================================

    getStyles() {
        return `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }

                .bar-chart-widget {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: var(--background-primary, #ffffff);
                    border-radius: var(--radius-md, 8px);
                    overflow: hidden;
                }

                .widget-header {
                    padding: var(--spacing-md, 16px);
                    background: var(--background-tertiary, #f8f9fa);
                    border-bottom: 1px solid var(--border-light, #eaecee);
                    flex-shrink: 0;
                }

                .widget-title {
                    margin: 0;
                    font-size: 1.1em;
                    font-weight: 600;
                    color: var(--text-primary, #1a2733);
                }

                .chart-container {
                    flex: 1;
                    padding: var(--spacing-md, 16px);
                    overflow: hidden;
                }

                .chart-svg {
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                }

                .bar {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .bar:hover {
                    filter: brightness(1.1);
                }

                .category-label {
                    font-size: 12px;
                    fill: var(--text-secondary, #5b738b);
                }

                .value-label {
                    font-size: 11px;
                    fill: var(--text-primary, #1a2733);
                    font-weight: 600;
                }

                .grid-line {
                    stroke: var(--border-light, #eaecee);
                    stroke-width: 1;
                    opacity: 0.5;
                }

                .grid-label {
                    font-size: 10px;
                    fill: var(--text-tertiary, #a9b4be);
                }

                .chart-legend {
                    padding: var(--spacing-sm, 8px);
                    background: var(--background-secondary, #f8f9fa);
                    border-top: 1px solid var(--border-light, #eaecee);
                    font-size: 0.85em;
                    color: var(--text-secondary, #5b738b);
                    text-align: center;
                    flex-shrink: 0;
                }

                /* Responsive */
                @media (max-width: 600px) {
                    .widget-header {
                        padding: var(--spacing-sm, 8px);
                    }
                    
                    .chart-container {
                        padding: var(--spacing-sm, 8px);
                    }
                    
                    .category-label {
                        font-size: 10px;
                    }
                }
            </style>
        `;
    }
}

// ====================================================================
// 🔌 REGISTRATION & EXPORT
// ====================================================================

// Ajouter la propriété class à la définition maintenant que la classe est déclarée
BAR_CHART_WIDGET_DEFINITION.class = BarChartWidgetUnified;

// Enregistrer le custom element avec un nom unique
customElements.define('bar-chart-widget-unified', BarChartWidgetUnified);

// Exporter la définition du widget pour le système Entity
if (typeof window !== 'undefined') {
    window.BAR_CHART_WIDGET_DEFINITION = BAR_CHART_WIDGET_DEFINITION;
    window.BarChartWidgetUnified = BarChartWidgetUnified;
}

// Export pour modules (si utilisé en tant que module)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BAR_CHART_WIDGET_DEFINITION,
        BarChartWidgetUnified
    };
}

console.log('📊 Bar Chart Widget loaded:', BAR_CHART_WIDGET_DEFINITION.name, BAR_CHART_WIDGET_DEFINITION.version);