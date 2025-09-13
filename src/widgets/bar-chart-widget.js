/**
 * 📊 Bar Chart Widget - Data Visualization Component
 * 
 * Bar chart implementation extending WidgetBase according to WIDGET_TECH_SPEC.md:
 * - SVG-based rendering for performance
 * - Responsive design with business theme
 * - Interactive features with hover effects
 */

class BarChartWidget extends WidgetBase {
    constructor() {
        super();
        
        // Bar chart specific configuration
        this.config.type = 'bar-chart';
        this.config.title = 'Bar Chart';
        this.config.options = {
            orientation: 'vertical', // 'vertical' or 'horizontal'
            showValues: true,
            showGrid: true,
            animation: true,
            colors: [
                'var(--business-blue, #1B90FF)',
                'var(--business-teal, #049f9a)',
                'var(--business-purple, #9966cc)',
                'var(--business-orange, #ff8800)',
                'var(--business-red, #e74c3c)',
                'var(--business-green, #28a745)'
            ],
            margins: { top: 20, right: 30, bottom: 40, left: 50 }
        };
        
        // Chart dimensions and scales
        this.chartDimensions = { width: 0, height: 0 };
        this.scales = { x: null, y: null };
    }

    renderWidget() {
        if (!this.state.data || this.state.data.length === 0) {
            return this.renderEmpty();
        }

        const chartId = `chart-${this.config.id || this.getUniqueId()}`;
        
        return `
            <div class="bar-chart-container">
                <svg id="${chartId}" class="bar-chart-svg">
                    <!-- Chart will be rendered here -->
                </svg>
                ${this.config.options.showValues ? '<div class="chart-legend"></div>' : ''}
            </div>
        `;
    }

    getBaseStyles() {
        return super.getBaseStyles() + `
            <style>
                .bar-chart-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .bar-chart-svg {
                    flex: 1;
                    width: 100%;
                    height: auto;
                    overflow: visible;
                }
                
                .chart-legend {
                    padding: var(--spacing-sm, 8px);
                    background: var(--business-grey-ultra-light, #f5f6f7);
                    border-top: 1px solid var(--border-light, #eaecee);
                    font-size: 0.8em;
                    color: var(--text-secondary, #5b738b);
                    text-align: center;
                }
                
                .bar {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .bar:hover {
                    opacity: 0.8;
                    stroke: var(--text-primary, #1a2733);
                    stroke-width: 2;
                }
                
                .axis {
                    stroke: var(--border-medium, #a9b4be);
                    stroke-width: 1;
                }
                
                .axis text {
                    fill: var(--text-secondary, #5b738b);
                    font-size: 12px;
                    font-family: var(--font-family-base, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
                }
                
                .grid-line {
                    stroke: var(--border-ultra-light, #f0f1f2);
                    stroke-width: 1;
                    stroke-dasharray: 2,2;
                }
                
                .value-label {
                    fill: var(--text-primary, #1a2733);
                    font-size: 11px;
                    font-weight: 500;
                    text-anchor: middle;
                    pointer-events: none;
                }
                
                .chart-title {
                    fill: var(--text-primary, #1a2733);
                    font-size: 14px;
                    font-weight: 600;
                    text-anchor: middle;
                }
                
                .tooltip {
                    position: absolute;
                    background: var(--text-primary, #1a2733);
                    color: white;
                    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
                    border-radius: var(--radius-sm, 4px);
                    font-size: 0.8em;
                    pointer-events: none;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    white-space: nowrap;
                }
                
                .tooltip.visible {
                    opacity: 1;
                }
            </style>
        `;
    }

    async processData(rawData) {
        console.log('📊 Processing data for bar chart');
        
        if (this.config.dimensions.length === 0 || this.config.measures.length === 0) {
            throw new Error('At least one dimension and one measure are required');
        }
        
        const dimension = this.config.dimensions[0].name;
        const measure = this.config.measures[0].name;
        
        // Group data by dimension and aggregate measure
        const grouped = {};
        
        rawData.forEach(row => {
            const key = row[dimension] || 'Unknown';
            const value = parseFloat(row[measure]) || 0;
            
            if (!grouped[key]) {
                grouped[key] = { values: [], count: 0 };
            }
            
            grouped[key].values.push(value);
            grouped[key].count++;
        });
        
        // Calculate aggregated values
        const result = Object.entries(grouped).map(([key, data]) => ({
            category: key,
            value: data.values.reduce((sum, val) => sum + val, 0),
            average: data.values.reduce((sum, val) => sum + val, 0) / data.count,
            count: data.count,
            min: Math.min(...data.values),
            max: Math.max(...data.values)
        }));
        
        // Sort by value descending
        result.sort((a, b) => b.value - a.value);
        
        return result;
    }

    bindEvents() {
        super.bindEvents();
        
        // Re-render chart when container resizes
        const container = this.shadowRoot.querySelector('.bar-chart-container');
        if (container) {
            // Use ResizeObserver if available
            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => {
                    this.renderChart();
                });
                resizeObserver.observe(container);
            }
        }
        
        // Initial chart render
        setTimeout(() => this.renderChart(), 100);
    }

    renderChart() {
        const container = this.shadowRoot.querySelector('.bar-chart-container');
        const svg = this.shadowRoot.querySelector('.bar-chart-svg');
        
        if (!container || !svg || !this.state.data) return;
        
        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const margins = this.config.options.margins;
        
        this.chartDimensions = {
            width: containerRect.width - margins.left - margins.right,
            height: containerRect.height - margins.top - margins.bottom - 40 // Space for legend
        };
        
        if (this.chartDimensions.width <= 0 || this.chartDimensions.height <= 0) {
            return; // Container not ready yet
        }
        
        // Set SVG dimensions
        svg.setAttribute('width', containerRect.width);
        svg.setAttribute('height', containerRect.height - 40);
        
        // Clear existing content
        svg.innerHTML = '';
        
        // Create chart group
        const chartGroup = this.createSVGElement('g', {
            transform: `translate(${margins.left}, ${margins.top})`
        });
        svg.appendChild(chartGroup);
        
        // Calculate scales
        this.calculateScales();
        
        // Render chart components
        this.renderGrid(chartGroup);
        this.renderAxes(chartGroup);
        this.renderBars(chartGroup);
        
        if (this.config.options.showValues) {
            this.renderValueLabels(chartGroup);
        }
        
        // Create tooltip
        this.createTooltip();
    }

    calculateScales() {
        const data = this.state.data;
        
        // X scale (categories)
        this.scales.x = {
            domain: data.map(d => d.category),
            range: [0, this.chartDimensions.width],
            bandwidth: this.chartDimensions.width / data.length
        };
        
        // Y scale (values)
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(0, Math.min(...data.map(d => d.value)));
        
        this.scales.y = {
            domain: [minValue, maxValue],
            range: [this.chartDimensions.height, 0]
        };
    }

    renderGrid(parent) {
        if (!this.config.options.showGrid) return;
        
        const gridGroup = this.createSVGElement('g', { class: 'grid' });
        parent.appendChild(gridGroup);
        
        // Horizontal grid lines
        const yTicks = this.getYTicks();
        yTicks.forEach(tick => {
            const y = this.getYPosition(tick);
            const line = this.createSVGElement('line', {
                class: 'grid-line',
                x1: 0,
                y1: y,
                x2: this.chartDimensions.width,
                y2: y
            });
            gridGroup.appendChild(line);
        });
    }

    renderAxes(parent) {
        // X axis
        const xAxis = this.createSVGElement('g', {
            class: 'axis x-axis',
            transform: `translate(0, ${this.chartDimensions.height})`
        });
        parent.appendChild(xAxis);
        
        // X axis line
        const xAxisLine = this.createSVGElement('line', {
            class: 'axis',
            x1: 0,
            y1: 0,
            x2: this.chartDimensions.width,
            y2: 0
        });
        xAxis.appendChild(xAxisLine);
        
        // X axis labels
        this.state.data.forEach((d, i) => {
            const x = this.getXPosition(d.category) + this.scales.x.bandwidth / 2;
            const text = this.createSVGElement('text', {
                x: x,
                y: 20,
                class: 'axis'
            });
            text.textContent = this.truncateText(d.category, 10);
            xAxis.appendChild(text);
        });
        
        // Y axis
        const yAxis = this.createSVGElement('g', { class: 'axis y-axis' });
        parent.appendChild(yAxis);
        
        // Y axis line
        const yAxisLine = this.createSVGElement('line', {
            class: 'axis',
            x1: 0,
            y1: 0,
            x2: 0,
            y2: this.chartDimensions.height
        });
        yAxis.appendChild(yAxisLine);
        
        // Y axis labels
        const yTicks = this.getYTicks();
        yTicks.forEach(tick => {
            const y = this.getYPosition(tick);
            const text = this.createSVGElement('text', {
                x: -10,
                y: y + 4,
                class: 'axis',
                'text-anchor': 'end'
            });
            text.textContent = this.formatNumber(tick, 0);
            yAxis.appendChild(text);
        });
    }

    renderBars(parent) {
        const barsGroup = this.createSVGElement('g', { class: 'bars' });
        parent.appendChild(barsGroup);
        
        this.state.data.forEach((d, i) => {
            const x = this.getXPosition(d.category);
            const y = this.getYPosition(d.value);
            const width = this.scales.x.bandwidth * 0.8; // 80% of available space
            const height = this.chartDimensions.height - y;
            
            const rect = this.createSVGElement('rect', {
                class: 'bar',
                x: x + this.scales.x.bandwidth * 0.1, // Center the bar
                y: y,
                width: width,
                height: height,
                fill: this.config.options.colors[i % this.config.options.colors.length],
                'data-category': d.category,
                'data-value': d.value
            });
            
            // Add hover events
            rect.addEventListener('mouseenter', (e) => this.showTooltip(e, d));
            rect.addEventListener('mouseleave', () => this.hideTooltip());
            rect.addEventListener('click', () => this.handleBarClick(d));
            
            barsGroup.appendChild(rect);
        });
    }

    renderValueLabels(parent) {
        const labelsGroup = this.createSVGElement('g', { class: 'value-labels' });
        parent.appendChild(labelsGroup);
        
        this.state.data.forEach((d, i) => {
            const x = this.getXPosition(d.category) + this.scales.x.bandwidth / 2;
            const y = this.getYPosition(d.value) - 5;
            
            const text = this.createSVGElement('text', {
                class: 'value-label',
                x: x,
                y: y
            });
            text.textContent = this.formatNumber(d.value, 0);
            labelsGroup.appendChild(text);
        });
    }

    createTooltip() {
        let tooltip = this.shadowRoot.querySelector('.tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            this.shadowRoot.appendChild(tooltip);
        }
        this.tooltip = tooltip;
    }

    showTooltip(event, data) {
        if (!this.tooltip) return;
        
        const measureName = this.config.measures[0]?.displayName || 'Value';
        
        this.tooltip.innerHTML = `
            <div><strong>${data.category}</strong></div>
            <div>${measureName}: ${this.formatNumber(data.value)}</div>
            <div>Count: ${data.count}</div>
        `;
        
        this.tooltip.style.left = event.pageX + 10 + 'px';
        this.tooltip.style.top = event.pageY - 10 + 'px';
        this.tooltip.classList.add('visible');
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.remove('visible');
        }
    }

    handleBarClick(data) {
        this.dispatchEvent(new CustomEvent('barClick', {
            detail: { data, widget: this },
            bubbles: true
        }));
        
        console.log('📊 Bar clicked:', data.category, data.value);
    }

    // Utility methods
    createSVGElement(tagName, attributes = {}) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
        
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        return element;
    }

    getXPosition(category) {
        const index = this.scales.x.domain.indexOf(category);
        return index * this.scales.x.bandwidth;
    }

    getYPosition(value) {
        const domain = this.scales.y.domain;
        const range = this.scales.y.range;
        
        const ratio = (value - domain[0]) / (domain[1] - domain[0]);
        return range[0] - ratio * (range[0] - range[1]);
    }

    getYTicks() {
        const domain = this.scales.y.domain;
        const tickCount = 5;
        const step = (domain[1] - domain[0]) / tickCount;
        
        const ticks = [];
        for (let i = 0; i <= tickCount; i++) {
            ticks.push(domain[0] + i * step);
        }
        
        return ticks;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength - 3) + '...';
    }

    // Override resize handler for chart-specific logic
    handleResize() {
        super.handleResize();
        
        // Re-render chart on resize
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.renderChart();
        }, 150);
    }
}

// Register the custom element
customElements.define('bar-chart-widget', BarChartWidget);

// Export for modules
window.BarChartWidget = BarChartWidget;