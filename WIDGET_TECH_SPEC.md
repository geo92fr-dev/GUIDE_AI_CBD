# 🔧 WIDGET TECH SPEC - Spécifications Techniques

> **Framework CBD :** Documentation technique complète pour l'implémentation des widgets business

## 📋 Vue d'Ensemble

### 🎯 **Objectif Technique**
Architecture modulaire de widgets HTML/JavaScript avec Web Components pour portabilité maximale et intégration universelle.

### 🏗️ **Principles de Design**
- **Modularity** : Widgets autonomes et réutilisables
- **Portability** : Copy/paste dans n'importe quel projet
- **Single-File Constraint** : 🚨 **UN SEUL FICHIER PAR WIDGET** (contrainte absolue)
- **Performance** : Optimisé pour grandes volumes de données
- **Accessibility** : Conforme WCAG 2.1 AA
- **Responsiveness** : Mobile-first design

---

## 📄 Single-File Widget Architecture

### 🎯 **Contrainte Absolue : Un Widget = Un Fichier**

#### **Structure de Fichier Unique**
```html
<!-- bar-chart-widget.html -->
<!DOCTYPE html>
<template id="bar-chart-widget-template">
  <!-- CSS intégré avec palette business -->
  <style>
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 200px;
      border: 1px solid var(--color-border, #A9B4BE);
      border-radius: var(--border-radius-md, 8px);
      background: var(--color-background, #FFFFFF);
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }
    
    .widget-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: var(--spacing-md, 16px);
    }
    
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm, 8px);
      border-bottom: 1px solid var(--color-border-light, #EAECEE);
      padding-bottom: var(--spacing-sm, 8px);
    }
    
    .widget-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text, #1A2733);
      margin: 0;
    }
    
    .widget-controls {
      display: flex;
      gap: var(--spacing-xs, 4px);
    }
    
    .refresh-btn {
      background: none;
      border: 1px solid var(--color-border, #A9B4BE);
      border-radius: var(--border-radius-sm, 4px);
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      cursor: pointer;
      color: var(--color-text-secondary, #5B738B);
      transition: all 0.2s ease;
    }
    
    .refresh-btn:hover {
      background: var(--color-hover, rgba(27, 144, 255, 0.1));
      border-color: var(--color-primary, #1B90FF);
      color: var(--color-primary, #1B90FF);
    }
    
    .widget-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .chart-canvas {
      width: 100%;
      height: 100%;
      max-height: 300px;
    }
    
    /* États d'interaction */
    :host(:hover) {
      box-shadow: var(--shadow-md, 0 4px 6px rgba(26, 39, 51, 0.1));
    }
    
    :host(:focus-within) {
      outline: 2px solid var(--color-primary, #1B90FF);
      outline-offset: 2px;
    }
    
    /* Responsive avec container queries */
    @container (max-width: 300px) {
      .widget-title { 
        font-size: 0.875rem; 
      }
      .widget-container { 
        padding: var(--spacing-sm, 8px); 
      }
      .widget-controls {
        display: none;
      }
    }
    
    @container (min-width: 500px) {
      .widget-title { 
        font-size: 1.25rem; 
      }
      .widget-header {
        margin-bottom: var(--spacing-md, 16px);
      }
    }
    
    /* Support du thème sombre */
    @media (prefers-color-scheme: dark) {
      :host {
        border-color: var(--color-border-dark, #5B738B);
        background: var(--color-surface, #1A2733);
      }
    }
  </style>
  
  <!-- HTML structure -->
  <div class="widget-container">
    <div class="widget-header">
      <h3 class="widget-title">Bar Chart</h3>
      <div class="widget-controls">
        <button class="refresh-btn" aria-label="Refresh data">🔄</button>
      </div>
    </div>
    <div class="widget-content">
      <canvas class="chart-canvas"></canvas>
    </div>
  </div>
</template>

<!-- JavaScript intégré -->
<script>
class BarChartWidget extends HTMLElement {
  // Private properties avec palette business
  #data = [];
  #config = {
    title: 'Bar Chart',
    colors: 'business-palette', // Utilise la palette par défaut
    showGrid: true,
    showLegend: false,
    theme: 'business',
    animation: { enabled: true, duration: 300 }
  };
  #canvas = null;
  #ctx = null;
  
  // Palettes de couleurs business
  #colorPalettes = {
    'business-palette': [
      '#1B90FF', // Blue 6
      '#049F9A', // Teal 6  
      '#36A41D', // Green 6
      '#E76500', // Mango 6
      '#FA4F96', // Raspberry 6
      '#7858FF', // Indigo 6
      '#F31DED', // Pink 6
      '#EE3939'  // Red 6
    ],
    'primary-shades': [
      '#D1EFFF', '#89D1FF', '#1B90FF', 
      '#0070F2', '#002A86', '#00144A'
    ],
    'status-colors': [
      '#36A41D', // Success
      '#E76500', // Warning  
      '#EE3939', // Error
      '#7858FF'  // Info
    ]
  };
  
  // Static properties
  static get observedAttributes() {
    return ['data', 'config', 'title'];
  }
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Clone template
    const template = document.getElementById('bar-chart-widget-template');
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    // Initialize
    this.#initializeElements();
    this.#bindEvents();
  }
  
  connectedCallback() {
    this.#render();
    this.#setupResizeObserver();
  }
  
  disconnectedCallback() {
    this.#cleanup();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'data':
          try { this.setData(JSON.parse(newValue)); } catch {}
          break;
        case 'config':
          try { this.configure(JSON.parse(newValue)); } catch {}
          break;
        case 'title':
          this.#config.title = newValue;
          this.#updateTitle();
          break;
      }
    }
  }
  
  // Private methods
  #initializeElements() {
    this.#canvas = this.shadowRoot.querySelector('.chart-canvas');
    this.#ctx = this.#canvas.getContext('2d');
    
    // Set canvas size
    this.#resizeCanvas();
  }
  
  #bindEvents() {
    // Refresh button
    const refreshBtn = this.shadowRoot.querySelector('.refresh-btn');
    refreshBtn?.addEventListener('click', () => this.#render());
    
    // Canvas interactions
    this.#canvas?.addEventListener('click', (e) => this.#handleCanvasClick(e));
    this.#canvas?.addEventListener('mousemove', (e) => this.#handleCanvasHover(e));
  }
  
  #setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.#resizeObserver = new ResizeObserver(() => {
        this.#resizeCanvas();
        this.#render();
      });
      this.#resizeObserver.observe(this);
    }
  }
  
  #resizeCanvas() {
    const container = this.shadowRoot.querySelector('.widget-content');
    if (container && this.#canvas) {
      const rect = container.getBoundingClientRect();
      this.#canvas.width = rect.width;
      this.#canvas.height = rect.height;
    }
  }
  
  #render() {
    if (!this.#ctx || !this.#data.length) return;
    
    this.#clearCanvas();
    this.#drawChart();
    
    // Dispatch render event
    this.dispatchEvent(new CustomEvent('widget-rendered', {
      detail: { widget: 'bar-chart', dataPoints: this.#data.length }
    }));
  }
  
  #clearCanvas() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }
  
  #drawChart() {
    const { width, height } = this.#canvas;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    if (this.#data.length === 0) return;
    
    // Calculate scales
    const maxValue = Math.max(...this.#data.map(d => d.value));
    const barWidth = chartWidth / this.#data.length * 0.8;
    const barSpacing = chartWidth / this.#data.length * 0.2;
    
    // Get colors from selected palette
    const colors = this.#getColorsFromPalette(this.#config.colors);
    
    // Draw grid if enabled
    if (this.#config.showGrid) {
      this.#drawGrid(padding, chartWidth, chartHeight, maxValue);
    }
    
    // Draw bars
    this.#data.forEach((dataPoint, index) => {
      const barHeight = (dataPoint.value / maxValue) * chartHeight;
      const x = padding + (index * (barWidth + barSpacing));
      const y = height - padding - barHeight;
      
      // Bar color from business palette
      const colorIndex = index % colors.length;
      this.#ctx.fillStyle = colors[colorIndex];
      
      // Draw bar with animation
      if (this.#config.animation.enabled) {
        this.#animateBar(x, y, barWidth, barHeight);
      } else {
        this.#ctx.fillRect(x, y, barWidth, barHeight);
      }
      
      // Draw label
      this.#drawLabel(dataPoint.label, x + barWidth/2, height - padding + 20);
      
      // Draw value
      this.#drawValue(dataPoint.value, x + barWidth/2, y - 10);
    });
  }
  
  #getColorsFromPalette(colorConfig) {
    if (Array.isArray(colorConfig)) {
      return colorConfig;
    }
    
    if (typeof colorConfig === 'string' && this.#colorPalettes[colorConfig]) {
      return this.#colorPalettes[colorConfig];
    }
    
    // Fallback vers palette business par défaut
    return this.#colorPalettes['business-palette'];
  }
  
  #drawGrid(padding, chartWidth, chartHeight, maxValue) {
    // Utilise les couleurs neutres de la palette business
    this.#ctx.strokeStyle = '#A9B4BE'; // Grey 4
    this.#ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      this.#ctx.beginPath();
      this.#ctx.moveTo(padding, y);
      this.#ctx.lineTo(padding + chartWidth, y);
      this.#ctx.stroke();
      
      // Grid labels avec couleur business
      const value = maxValue - (maxValue / 5) * i;
      this.#drawGridLabel(value.toFixed(0), padding - 10, y + 3);
    }
  }
  
  #animateBar(x, y, width, height) {
    // Simple animation - in real implementation, use requestAnimationFrame
    this.#ctx.fillRect(x, y, width, height);
  }
  
  #drawLabel(text, x, y) {
    this.#ctx.fillStyle = '#5B738B'; // Grey 6 - Text secondary
    this.#ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    this.#ctx.textAlign = 'center';
    this.#ctx.fillText(text, x, y);
  }
  
  #drawValue(value, x, y) {
    this.#ctx.fillStyle = '#1A2733'; // Grey 10 - Text primary
    this.#ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    this.#ctx.textAlign = 'center';
    this.#ctx.fillText(value.toString(), x, y);
  }
  
  #drawGridLabel(text, x, y) {
    this.#ctx.fillStyle = '#A9B4BE'; // Grey 4 - Text disabled
    this.#ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    this.#ctx.textAlign = 'right';
    this.#ctx.fillText(text, x, y);
  }
  
  #handleCanvasClick(event) {
    // Handle bar selection
    const rect = this.#canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Detect clicked bar and dispatch event
    const barIndex = this.#getBarIndexAtPosition(x, y);
    if (barIndex >= 0) {
      this.dispatchEvent(new CustomEvent('bar-click', {
        detail: { index: barIndex, data: this.#data[barIndex] }
      }));
    }
  }
  
  #handleCanvasHover(event) {
    // Handle hover effects
    this.#canvas.style.cursor = this.#isOverBar(event) ? 'pointer' : 'default';
  }
  
  #getBarIndexAtPosition(x, y) {
    // Calculate which bar was clicked
    const padding = 40;
    const chartWidth = this.#canvas.width - (padding * 2);
    const barWidth = chartWidth / this.#data.length * 0.8;
    const barSpacing = chartWidth / this.#data.length * 0.2;
    
    for (let i = 0; i < this.#data.length; i++) {
      const barX = padding + (i * (barWidth + barSpacing));
      if (x >= barX && x <= barX + barWidth) {
        return i;
      }
    }
    return -1;
  }
  
  #isOverBar(event) {
    const rect = this.#canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return this.#getBarIndexAtPosition(x, y) >= 0;
  }
  
  #updateTitle() {
    const titleElement = this.shadowRoot.querySelector('.widget-title');
    if (titleElement) {
      titleElement.textContent = this.#config.title;
    }
  }
  
  #cleanup() {
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
    }
  }
  
  // Public API
  setData(data) {
    if (Array.isArray(data)) {
      this.#data = data.map(item => ({
        label: item.label || '',
        value: Number(item.value) || 0,
        ...item
      }));
      this.#render();
    }
  }
  
  getData() {
    return [...this.#data];
  }
  
  configure(config) {
    this.#config = { ...this.#config, ...config };
    this.#updateTitle();
    this.#render();
  }
  
  getConfig() {
    return { ...this.#config };
  }
  
  exportPNG() {
    return this.#canvas.toDataURL('image/png');
  }
  
  exportSVG() {
    // Convert canvas to SVG (simplified implementation)
    return `<svg><!-- SVG representation --></svg>`;
  }
  
  // Static factory method
  static create(data, config = {}) {
    const widget = document.createElement('bar-chart-widget');
    if (data) widget.setData(data);
    if (config) widget.configure(config);
    return widget;
  }
}

// Register the custom element
customElements.define('bar-chart-widget', BarChartWidget);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BarChartWidget;
}
</script>
```

#### **Utilisation Single-File Widget**
```html
<!-- Option 1: Include directement -->
<script src="./bar-chart-widget.html"></script>
<bar-chart-widget 
  data='[{"label":"Q1","value":100},{"label":"Q2","value":150}]'
  title="Sales Data">
</bar-chart-widget>

<!-- Option 2: JavaScript API -->
<script>
  const widget = BarChartWidget.create([
    { label: 'Q1', value: 100 },
    { label: 'Q2', value: 150 },
    { label: 'Q3', value: 120 }
  ], { title: 'Revenue Chart' });
  
  document.body.appendChild(widget);
</script>
```

---

## 🧩 Architecture Core

### 🔧 **Widget Base Class**

```typescript
class WidgetBase extends HTMLElement {
  // Core Properties
  protected _data: any[] = [];
  protected _config: WidgetConfig = {};
  protected _theme: WidgetTheme = {};
  
  // Lifecycle Methods
  constructor();
  connectedCallback();
  disconnectedCallback();
  attributeChangedCallback();
  
  // Data Methods
  setData(data: any[]): void;
  updateData(data: any[]): void;
  clearData(): void;
  
  // Config Methods
  configure(config: WidgetConfig): void;
  getConfig(): WidgetConfig;
  
  // Rendering Methods
  render(): void;
  update(): void;
  destroy(): void;
  
  // Event Methods
  addEventListener(type: string, listener: EventListener): void;
  dispatchEvent(event: CustomEvent): boolean;
}
```

### 📊 **Data Model Standard avec DIMENSIONS/MEASURES**

```typescript
interface WidgetDataPoint {
  id: string | number;
  [dimensionField: string]: any;  // Valeurs des dimensions
  [measureField: string]: number; // Valeurs des mesures
  metadata?: Record<string, any>;
}

interface DataField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  category: 'DIMENSION' | 'MEASURE';
  cardinality?: number;        // Nombre de valeurs uniques
  samples?: any[];            // Exemples de valeurs
  format?: string;            // Format d'affichage
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  required: boolean;
}

interface WidgetDataset {
  id: string;
  name: string;
  description: string;
  data: WidgetDataPoint[];
  schema: DataSchema;
  dimensions: DataField[];     // Champs de dimension
  measures: DataField[];       // Champs de mesure
  lastUpdated: Date;
}

interface DataSchema {
  fields: DataField[];
  primaryKey: string;
  relationships?: Record<string, string>;
}

// Configuration de binding pour widgets
interface WidgetBinding {
  widgetId: string;
  dataSourceId: string;
  dimensionMappings: {
    [widgetAxis: string]: string; // ex: 'x-axis' → 'product_category'
  };
  measureMappings: {
    [widgetValue: string]: string; // ex: 'value' → 'sales_amount'
  };
  filters?: DataFilter[];
  aggregations?: DataAggregation[];
}
```

### 🎨 **Theme System**

```typescript
interface WidgetTheme {
  colors: {
    // Couleurs primaires (Blue palette)
    primary: string;           // #1B90FF (Blue 6)
    primaryDark: string;       // #0070F2 (Blue 7)
    primaryLight: string;      // #D1EFFF (Blue 2)
    primaryContrast: string;   // #002A86 (Blue 10)
    
    // Couleurs secondaires
    secondary: string;         // #049F9A (Teal 6)
    accent: string;           // #FA4F96 (Raspberry 6)
    
    // États et feedback
    success: string;          // #36A41D (Green 6)
    warning: string;          // #E76500 (Mango 6)
    error: string;           // #EE3939 (Red 6)
    info: string;            // #7858FF (Indigo 6)
    
    // Surfaces et arrière-plans
    background: string;       // #FFFFFF
    surface: string;         // #EAECEE (Grey 2)
    surfaceVariant: string;  // #A9B4BE (Grey 4)
    
    // Texte
    text: string;            // #1A2733 (Grey 10)
    textSecondary: string;   // #5B738B (Grey 6)
    textDisabled: string;    // #A9B4BE (Grey 4)
    
    // Bordures et séparateurs
    border: string;          // #A9B4BE (Grey 4)
    borderLight: string;     // #EAECEE (Grey 2)
    borderDark: string;      // #5B738B (Grey 6)
    
    // Couleurs de données (pour les charts)
    dataColors: string[];    // Palette complète pour visualisations
  };
  fonts: {
    family: string;
    sizes: Record<string, string>;
    weights: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  zIndex: Record<string, number>;
}

// Palette de couleurs complète basée sur COLOR.md
const BUSINESS_COLOR_PALETTE = {
  blue: {
    2: '#D1EFFF',
    4: '#89D1FF', 
    6: '#1B90FF',
    7: '#0070F2',
    10: '#002A86',
    11: '#00144A'
  },
  grey: {
    2: '#EAECEE',
    4: '#A9B4BE',
    6: '#5B738B',
    7: '#475E75',
    10: '#1A2733',
    11: '#12171C'
  },
  teal: {
    2: '#C2FCEE',
    4: '#2CE0BF',
    6: '#049F9A',
    7: '#07838F',
    10: '#02414C',
    11: '#012931'
  },
  green: {
    2: '#EBF5CB',
    4: '#97DD40',
    6: '#36A41D',
    7: '#188918',
    10: '#164323',
    11: '#0E2B16'
  },
  mango: {
    2: '#FFF3B8',
    4: '#FFC933',
    6: '#E76500',
    7: '#C35500',
    10: '#6D1900',
    11: '#450B00'
  },
  red: {
    2: '#FFD5EA',
    4: '#FF8CB2',
    6: '#EE3939',
    7: '#D20A0A',
    10: '#5A0404',
    11: '#350000'
  },
  raspberry: {
    2: '#FFDCE8',
    4: '#FEADC8',
    6: '#FA4F96',
    7: '#DF1278',
    10: '#71014B',
    11: '#510136'
  },
  pink: {
    2: '#FFDCF3',
    4: '#FF8AF0',
    6: '#F31DED',
    7: '#CC00DC',
    10: '#510080',
    11: '#28004A'
  },
  indigo: {
    2: '#E2D8FF',
    4: '#B894FF',
    6: '#7858FF',
    7: '#5D36FF',
    10: '#1C0C6E',
    11: '#0E0637'
  }
};
```

---

## 📊 Widgets Specifications

### 📈 **Bar Chart Widget (MVP v1.0)**

#### **Technical Stack**
- **Base**: WidgetBase + Canvas API / SVG
- **Data Format**: Numeric series with categories
- **Size**: Responsive grid units (1x1 to 4x4)
- **Performance**: Optimized for up to 1000 data points

#### **Configuration Options**
```typescript
interface BarChartConfig extends WidgetConfig {
  chart: {
    orientation: 'vertical' | 'horizontal';
    barSpacing: number;
    barRadius: number;
    showGrid: boolean;
    showLegend: boolean;
    showTooltips: boolean;
  };
  axes: {
    x: AxisConfig;
    y: AxisConfig;
  };
  colors: string[] | 'auto' | 'business-palette';
  theme: 'light' | 'dark' | 'business';
  animation: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

interface AxisConfig {
  show: boolean;
  label: string;
  min?: number;
  max?: number;
  format: string;
  ticks: number;
}

// Palettes de couleurs prédéfinies
const COLOR_PALETTES = {
  'business-palette': [
    '#1B90FF', // Blue 6
    '#049F9A', // Teal 6  
    '#36A41D', // Green 6
    '#E76500', // Mango 6
    '#FA4F96', // Raspberry 6
    '#7858FF', // Indigo 6
    '#F31DED', // Pink 6
    '#EE3939'  // Red 6
  ],
  'primary-shades': [
    '#D1EFFF', // Blue 2
    '#89D1FF', // Blue 4
    '#1B90FF', // Blue 6
    '#0070F2', // Blue 7
    '#002A86', // Blue 10
    '#00144A'  // Blue 11
  ],
  'status-colors': [
    '#36A41D', // Success (Green 6)
    '#E76500', // Warning (Mango 6)
    '#EE3939', // Error (Red 6)
    '#7858FF'  // Info (Indigo 6)
  ]
};
```

#### **API Methods**
```typescript
class BarChartWidget extends WidgetBase {
  // Data Methods
  addSeries(name: string, data: number[], color?: string): void;
  removeSeries(name: string): void;
  updateSeries(name: string, data: number[]): void;
  
  // Interaction Methods
  highlightBar(index: number): void;
  selectBar(index: number): void;
  
  // Export Methods
  exportPNG(width?: number, height?: number): Promise<Blob>;
  exportSVG(): string;
  exportData(): WidgetDataset;
}
```

### 📋 **KPI Card Widget (MVP v1.1)**

#### **Technical Stack**
- **Base**: WidgetBase + CSS Grid
- **Data Format**: Single numeric value with metadata
- **Size**: 1x1 fixed grid unit
- **Performance**: Real-time updates (< 100ms)

#### **Configuration Options**
```typescript
interface KPICardConfig extends WidgetConfig {
  display: {
    title: string;
    unit: string;
    precision: number;
    format: 'number' | 'currency' | 'percentage';
    showTrend: boolean;
    showTarget: boolean;
  };
  thresholds: {
    good: number;
    warning: number;
    critical: number;
  };
  colors: {
    good: string;      // Défaut: #36A41D (Green 6)
    warning: string;   // Défaut: #E76500 (Mango 6)  
    critical: string;  // Défaut: #EE3939 (Red 6)
    neutral: string;   // Défaut: #5B738B (Grey 6)
  };
  trend: {
    period: 'day' | 'week' | 'month' | 'quarter';
    comparison: 'previous' | 'target' | 'baseline';
    colors: {
      positive: string; // Défaut: #36A41D (Green 6)
      negative: string; // Défaut: #EE3939 (Red 6)
      neutral: string;  // Défaut: #5B738B (Grey 6)
    };
  };
  theme: 'light' | 'dark' | 'business';
}
```

#### **API Methods**
```typescript
class KPICardWidget extends WidgetBase {
  // Value Methods
  setValue(value: number, timestamp?: Date): void;
  setTarget(target: number): void;
  setTrend(trend: number, direction: 'up' | 'down' | 'stable'): void;
  
  // Status Methods
  getStatus(): 'good' | 'warning' | 'critical';
  updateThresholds(thresholds: KPIThresholds): void;
}
```

### 📅 **Gantt Chart Widget (MVP v1.2)**

#### **Technical Stack**
- **Base**: WidgetBase + D3.js integration
- **Data Format**: Task timeline with dependencies
- **Size**: Responsive (minimum 2x3 grid units)
- **Performance**: Optimized for up to 500 tasks

#### **Configuration Options**
```typescript
interface GanttChartConfig extends WidgetConfig {
  timeline: {
    startDate: Date;
    endDate: Date;
    scale: 'days' | 'weeks' | 'months';
    workingDays: number[];
  };
  tasks: {
    showCriticalPath: boolean;
    showDependencies: boolean;
    showProgress: boolean;
    showMilestones: boolean;
  };
  interaction: {
    allowDragDrop: boolean;
    allowResize: boolean;
    allowEdit: boolean;
  };
}

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  dependencies: string[];
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  milestone: boolean;
}
```

### 🗺️ **Map Widget (MVP v1.2)**

#### **Technical Stack**
- **Base**: WidgetBase + Leaflet.js
- **Data Format**: GeoJSON with properties
- **Size**: Responsive (minimum 2x2 grid units)
- **Performance**: Clustering for 10K+ markers

#### **Configuration Options**
```typescript
interface MapConfig extends WidgetConfig {
  map: {
    center: [number, number]; // [lat, lng]
    zoom: number;
    minZoom: number;
    maxZoom: number;
    tileLayer: string;
  };
  markers: {
    clustering: boolean;
    clusterRadius: number;
    showPopups: boolean;
    customIcons: boolean;
  };
  layers: {
    heatmap: boolean;
    choropleth: boolean;
    boundaries: boolean;
  };
}

interface MapDataPoint extends WidgetDataPoint {
  coordinates: [number, number]; // [lat, lng]
  popup?: string;
  icon?: string;
  color?: string;
}
```

---

## 🏗️ Canvas & Layout System (4-Panels Architecture)

### 📐 **4-Panels Grid System**
```typescript
interface FourPanelsLayout {
  leftPanel: {
    width: string;           // Défaut: '250px'
    collapsible: boolean;    // Peut être réduit
    content: 'widget-library' | 'templates' | 'tools';
  };
  canvas: {
    flex: number;            // Défaut: 1 (prend l'espace restant)
    minWidth: string;        // Défaut: '400px'
    grid: CanvasGrid;
  };
  rightPanel1: {             // FEEDING PANEL
    width: string;           // Défaut: '300px'
    title: 'Widget Configuration';
    content: 'feeding-panel';
    collapsible: boolean;
  };
  rightPanel2: {             // AVAILABLE OBJECTS
    width: string;           // Défaut: '250px'
    title: 'Data Objects';
    content: 'available-objects';
    collapsible: boolean;
  };
}

interface CanvasGrid {
  columns: number; // Default: 12
  rows: number; // Default: auto
  gap: number; // Default: 16px
  cellSize: {
    width: number; // Auto-calculated
    height: number; // Default: 200px
  };
}

interface WidgetLayout {
  id: string;
  gridArea: {
    column: number;
    row: number;
    colspan: number;
    rowspan: number;
  };
  zIndex: number;
  locked: boolean;
}
```

### 🎯 **Drag & Drop System Cross-Panel**
```typescript
class CrossPanelDragManager {
  // Drag Sources (Available Objects Panel)
  initializeDragSources(dataFields: DataField[]): void;
  createDraggableField(field: DataField, category: 'DIMENSION' | 'MEASURE'): HTMLElement;
  
  // Drop Zones (Feeding Panel)  
  initializeDropZones(widgetType: string): void;
  createDropZone(type: 'dimension' | 'measure', accepts: string[]): HTMLElement;
  
  // Drag & Drop Events
  onDragStart(event: DragEvent, field: DataField): void;
  onDragOver(event: DragEvent, dropZone: HTMLElement): void;
  onDrop(event: DragEvent, dropZone: HTMLElement, field: DataField): void;
  
  // Binding Management
  createBinding(widgetId: string, fieldName: string, target: string): WidgetBinding;
  updateWidgetConfiguration(binding: WidgetBinding): void;
  validateBinding(binding: WidgetBinding): ValidationResult;
}
```

### 📊 **Available Objects Panel**
```typescript
class AvailableObjectsPanel extends HTMLElement {
  private dataSource: WidgetDataset | null = null;
  private dimensions: DataField[] = [];
  private measures: DataField[] = [];
  
  // Data Source Management
  setDataSource(dataSource: WidgetDataset): void {
    this.dataSource = dataSource;
    this.classifyFields();
    this.render();
  }
  
  // Field Classification
  private classifyFields(): void {
    if (!this.dataSource) return;
    
    this.dimensions = this.dataSource.schema.fields.filter(
      field => field.category === 'DIMENSION'
    );
    this.measures = this.dataSource.schema.fields.filter(
      field => field.category === 'MEASURE'
    );
  }
  
  // Rendering
  private render(): void {
    this.innerHTML = `
      <div class="panel-header">
        <h3>Data Objects</h3>
        <span class="source-name">${this.dataSource?.name || 'No source'}</span>
      </div>
      
      <div class="dimensions-section">
        <h4>📏 DIMENSIONS</h4>
        <div class="fields-list">
          ${this.renderDimensions()}
        </div>
      </div>
      
      <div class="measures-section">
        <h4>📊 MEASURES</h4>
        <div class="fields-list">
          ${this.renderMeasures()}
        </div>
      </div>
    `;
  }
  
  private renderDimensions(): string {
    return this.dimensions.map(dim => `
      <div class="draggable-field dimension" 
           draggable="true" 
           data-field="${dim.name}"
           data-type="DIMENSION">
        <span class="field-icon">🏷️</span>
        <span class="field-name">${dim.name}</span>
        <span class="field-info">${dim.cardinality} values</span>
      </div>
    `).join('');
  }
  
  private renderMeasures(): string {
    return this.measures.map(measure => `
      <div class="draggable-field measure" 
           draggable="true" 
           data-field="${measure.name}"
           data-type="MEASURE">
        <span class="field-icon">📈</span>
        <span class="field-name">${measure.name}</span>
        <span class="field-info">${measure.aggregation || 'sum'}</span>
      </div>
    `).join('');
  }
}
```

### 🔧 **Feeding Panel (Inspiré WebI Data Assignment)**
```typescript
class FeedingPanel extends HTMLElement {
  private selectedWidget: WidgetBase | null = null;
  private bindings: WidgetBinding | null = null;
  
  // Widget Selection
  selectWidget(widget: WidgetBase): void {
    this.selectedWidget = widget;
    this.bindings = this.getWidgetBindings(widget.id);
    this.render();
  }
  
  // Rendering WebI-style
  private render(): void {
    if (!this.selectedWidget) {
      this.innerHTML = `
        <div class="panel-header">
          <h3>Data Assignment</h3>
          <p class="no-selection">Select a widget to configure</p>
        </div>
      `;
      return;
    }
    
    this.innerHTML = `
      <div class="panel-header">
        <h3>Data Assignment</h3>
        <span class="widget-type">${this.selectedWidget.tagName}</span>
      </div>
      
      <!-- WebI-style "Turn Into" section -->
      <div class="turn-into-section">
        <h4>Turn Into</h4>
        <div class="widget-type-options">
          ${this.renderWidgetTypeOptions()}
        </div>
      </div>
      
      <!-- WebI-style Drop Zones -->
      <div class="drop-zones-container">
        ${this.createDropZones(this.selectedWidget.widgetType)}
      </div>
      
      <!-- Instruction message like WebI -->
      <div class="feeding-instructions">
        <p>You need to feed the element with at least:</p>
        <ul>
          ${this.getRequiredFields()}
        </ul>
      </div>
    `;
    
    this.bindDropEvents();
  }
  
  // WebI-style "Turn Into" functionality
  private renderWidgetTypeOptions(): string {
    const availableTypes = ['bar-chart', 'kpi-card', 'line-chart', 'pie-chart'];
    
    return availableTypes.map(type => `
      <button class="widget-type-btn ${type === this.selectedWidget?.widgetType ? 'active' : ''}"
              data-widget-type="${type}"
              title="Convert to ${type}">
        ${this.getWidgetIcon(type)}
      </button>
    `).join('');
  }
  
  // Drop Zone Creation WebI-style
  private createDropZones(widgetType: string): string {
    const zones = this.getDropZoneConfig(widgetType);
    
    return zones.map(zone => `
      <div class="drop-zone-section">
        <h4>${zone.label}</h4>
        <div class="drop-zone ${zone.type}-zone ${zone.required ? 'required' : 'optional'}"
             data-accepts="${zone.accepts.join(',')}"
             data-zone-id="${zone.id}">
          <div class="zone-content">
            ${this.renderCurrentBinding(zone.id)}
            <div class="drop-placeholder ${this.hasBinding(zone.id) ? 'hidden' : ''}">
              <span class="zone-icon">${zone.icon}</span>
              <span class="zone-text">Drop ${zone.accepts.join(' or ')} here</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  private getDropZoneConfig(widgetType: string): DropZoneConfig[] {
    switch (widgetType) {
      case 'bar-chart':
        return [
          {
            id: 'category-axis',
            label: 'Category Axis',
            type: 'dimension',
            accepts: ['DIMENSION'],
            required: true,
            icon: '📊',
            description: 'Groups data into categories'
          },
          {
            id: 'value-axis', 
            label: 'Value Axis',
            type: 'measure',
            accepts: ['MEASURE'],
            required: true,
            icon: '📈',
            description: 'Numeric values to display'
          },
          {
            id: 'color',
            label: 'Color',
            type: 'dimension',
            accepts: ['DIMENSION'],
            required: false,
            icon: '🎨',
            description: 'Color coding by dimension'
          }
        ];
        
      case 'kpi-card':
        return [
          {
            id: 'value',
            label: 'Value',
            type: 'measure',
            accepts: ['MEASURE'],
            required: true,
            icon: '📊',
            description: 'Main KPI value'
          },
          {
            id: 'target',
            label: 'Target',
            type: 'measure', 
            accepts: ['MEASURE'],
            required: false,
            icon: '🎯',
            description: 'Target value for comparison'
          },
          {
            id: 'filter',
            label: 'Filter',
            type: 'dimension',
            accepts: ['DIMENSION'],
            required: false,
            icon: '🔍',
            description: 'Filter by dimension'
          }
        ];
        
      default:
        return [];
    }
  }
  
  // Real-time update like WebI
  private onDrop(event: DragEvent): void {
    event.preventDefault();
    const dropZone = event.currentTarget as HTMLElement;
    const fieldData = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');
    
    if (this.validateDrop(dropZone, fieldData)) {
      // Add field to zone
      this.addFieldToZone(dropZone, fieldData);
      
      // Update widget immediately (like WebI real-time update)
      this.updateWidgetBinding();
      this.refreshWidgetData();
      
      // Visual feedback
      this.showDropSuccess(dropZone);
    } else {
      this.showDropError(dropZone, 'Invalid field type for this zone');
    }
  }
  
  private addFieldToZone(dropZone: HTMLElement, field: DataField): void {
    const zoneContent = dropZone.querySelector('.zone-content');
    if (!zoneContent) return;
    
    // Clear existing content
    zoneContent.innerHTML = '';
    
    // Add field chip (WebI-style)
    const fieldChip = document.createElement('div');
    fieldChip.className = 'field-chip';
    fieldChip.innerHTML = `
      <span class="field-icon">${field.category === 'DIMENSION' ? '🏷️' : '📊'}</span>
      <span class="field-name">${field.name}</span>
      <button class="remove-field" aria-label="Remove field">×</button>
    `;
    
    // Remove functionality
    fieldChip.querySelector('.remove-field')?.addEventListener('click', () => {
      this.removeFieldFromZone(dropZone);
    });
    
    zoneContent.appendChild(fieldChip);
    
    // Hide placeholder
    const placeholder = dropZone.querySelector('.drop-placeholder');
    if (placeholder) {
      placeholder.classList.add('hidden');
    }
  }
  
  private getRequiredFields(): string {
    if (!this.selectedWidget) return '';
    
    const config = this.getDropZoneConfig(this.selectedWidget.widgetType);
    const required = config.filter(zone => zone.required);
    
    return required.map(zone => 
      `<li>${zone.label}: ${zone.description}</li>`
    ).join('');
  }
  
  // Widget type conversion (WebI "Turn Into")
  private onWidgetTypeChange(newType: string): void {
    if (!this.selectedWidget) return;
    
    // Save current bindings
    const currentBindings = this.collectBindings();
    
    // Convert widget type
    this.convertWidgetType(this.selectedWidget, newType);
    
    // Try to preserve compatible bindings
    this.migrateBindings(currentBindings, newType);
    
    // Re-render with new drop zones
    this.render();
  }
}

interface DropZoneConfig {
  id: string;
  label: string;
  type: 'dimension' | 'measure';
  accepts: string[];
  required: boolean;
  icon: string;
  description: string;
}
```

---

## 📡 Data Management

### 🔄 **Data Sources**
```typescript
interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'api' | 'websocket';
  url?: string;
  config: DataSourceConfig;
  schema: DataSchema;
  lastSync: Date;
}

interface DataSourceConfig {
  refreshInterval?: number; // milliseconds
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api-key';
    credentials?: Record<string, string>;
  };
  transformation?: {
    filters: DataFilter[];
    aggregations: DataAggregation[];
    sorting: DataSort[];
  };
}

interface DataFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in';
  value: any;
}
```

### 🔧 **Data Processing Pipeline avec Classification DIMENSIONS/MEASURES**
```typescript
class DataProcessor {
  // Import Methods avec auto-classification
  parseCSV(csvString: string, delimiter?: string): WidgetDataset {
    const rawData = this.parseCsvToObjects(csvString, delimiter);
    const schema = this.analyzeSchema(rawData);
    const classifiedFields = this.classifyFields(schema.fields, rawData);
    
    return {
      id: this.generateId(),
      name: 'CSV Dataset',
      description: 'Auto-imported CSV data',
      data: rawData,
      schema: { ...schema, fields: classifiedFields },
      dimensions: classifiedFields.filter(f => f.category === 'DIMENSION'),
      measures: classifiedFields.filter(f => f.category === 'MEASURE'),
      lastUpdated: new Date()
    };
  }
  
  // Classification automatique DIMENSION vs MEASURE
  private classifyFields(fields: any[], sampleData: any[]): DataField[] {
    return fields.map(field => {
      const samples = sampleData.slice(0, 100).map(row => row[field.name]);
      const uniqueValues = new Set(samples).size;
      const totalValues = samples.length;
      const cardinality = uniqueValues / totalValues;
      
      // Règles de classification
      let category: 'DIMENSION' | 'MEASURE';
      let aggregation: string | undefined;
      
      if (field.type === 'number') {
        // Numérique avec haute cardinalité = MEASURE
        if (cardinality > 0.7 || uniqueValues > 50) {
          category = 'MEASURE';
          aggregation = this.suggestAggregation(field.name);
        } else {
          // Numérique avec faible cardinalité = DIMENSION (ex: années, notes)
          category = 'DIMENSION';
        }
      } else if (field.type === 'date') {
        category = 'DIMENSION'; // Les dates sont toujours des dimensions
      } else {
        // String/Boolean = DIMENSION
        category = 'DIMENSION';
      }
      
      return {
        ...field,
        category,
        cardinality: uniqueValues,
        samples: samples.slice(0, 5), // 5 exemples
        aggregation
      };
    });
  }
  
  private suggestAggregation(fieldName: string): string {
    const name = fieldName.toLowerCase();
    
    if (name.includes('count') || name.includes('quantity') || name.includes('number')) {
      return 'sum';
    } else if (name.includes('amount') || name.includes('total') || name.includes('revenue')) {
      return 'sum';
    } else if (name.includes('rate') || name.includes('percentage') || name.includes('avg')) {
      return 'avg';
    } else if (name.includes('price') || name.includes('cost')) {
      return 'avg';
    }
    
    return 'sum'; // Défaut
  }
  
  // Transformation Methods avec bindings
  applyBindings(dataset: WidgetDataset, bindings: WidgetBinding): WidgetDataPoint[] {
    let processedData = [...dataset.data];
    
    // Appliquer les filtres
    if (bindings.filters) {
      processedData = this.filter(processedData, bindings.filters);
    }
    
    // Appliquer les agrégations
    if (bindings.aggregations) {
      processedData = this.aggregate(processedData, bindings.aggregations);
    }
    
    // Transformer selon les mappings
    return processedData.map(row => this.mapDataPoint(row, bindings));
  }
  
  private mapDataPoint(row: any, bindings: WidgetBinding): any {
    const mapped: any = { ...row };
    
    // Mapper les dimensions
    Object.entries(bindings.dimensionMappings).forEach(([target, source]) => {
      mapped[target] = row[source];
    });
    
    // Mapper les mesures
    Object.entries(bindings.measureMappings).forEach(([target, source]) => {
      mapped[target] = Number(row[source]) || 0;
    });
    
    return mapped;
  }
  
  // Validation Methods
  validateBinding(binding: WidgetBinding, dataset: WidgetDataset): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Vérifier que les champs source existent
    const availableFields = dataset.schema.fields.map(f => f.name);
    
    Object.values(binding.dimensionMappings).forEach(source => {
      if (!availableFields.includes(source)) {
        errors.push(`Dimension field '${source}' not found in dataset`);
      }
    });
    
    Object.values(binding.measureMappings).forEach(source => {
      if (!availableFields.includes(source)) {
        errors.push(`Measure field '${source}' not found in dataset`);
      }
    });
    
    // Vérifier la compatibilité des types
    Object.entries(binding.measureMappings).forEach(([target, source]) => {
      const field = dataset.schema.fields.find(f => f.name === source);
      if (field && field.type !== 'number') {
        warnings.push(`Measure '${source}' is not numeric, automatic conversion will be attempted`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // Cache Methods
  cacheDataset(dataset: WidgetDataset): void;
  getCachedDataset(id: string): WidgetDataset | null;
  invalidateCache(id: string): void;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

---

## 🎨 Styling & Theming

### 🌈 **CSS Variables System Basé sur Palette Business**
```css
:root {
  /* === COULEURS PRIMAIRES === */
  /* Blue - Couleur principale de la marque */
  --color-primary: #1B90FF;           /* Blue 6 */
  --color-primary-hover: #0070F2;     /* Blue 7 */
  --color-primary-light: #D1EFFF;     /* Blue 2 */
  --color-primary-contrast: #002A86;   /* Blue 10 */
  --color-primary-dark: #00144A;      /* Blue 11 */
  
  /* === COULEURS SECONDAIRES === */
  /* Teal - Accents et éléments secondaires */
  --color-secondary: #049F9A;         /* Teal 6 */
  --color-secondary-light: #C2FCEE;   /* Teal 2 */
  --color-secondary-dark: #02414C;    /* Teal 10 */
  
  /* === COULEURS D'ÉTAT === */
  --color-success: #36A41D;           /* Green 6 */
  --color-success-light: #EBF5CB;     /* Green 2 */
  --color-success-dark: #164323;      /* Green 10 */
  
  --color-warning: #E76500;           /* Mango 6 */
  --color-warning-light: #FFF3B8;     /* Mango 2 */
  --color-warning-dark: #6D1900;      /* Mango 10 */
  
  --color-error: #EE3939;             /* Red 6 */
  --color-error-light: #FFD5EA;       /* Red 2 */
  --color-error-dark: #5A0404;        /* Red 10 */
  
  --color-info: #7858FF;              /* Indigo 6 */
  --color-info-light: #E2D8FF;        /* Indigo 2 */
  --color-info-dark: #1C0C6E;         /* Indigo 10 */
  
  /* === COULEURS NEUTRES === */
  --color-background: #FFFFFF;
  --color-surface: #EAECEE;           /* Grey 2 */
  --color-surface-variant: #A9B4BE;   /* Grey 4 */
  
  --color-text: #1A2733;              /* Grey 10 */
  --color-text-secondary: #5B738B;    /* Grey 6 */
  --color-text-disabled: #A9B4BE;     /* Grey 4 */
  
  --color-border: #A9B4BE;            /* Grey 4 */
  --color-border-light: #EAECEE;      /* Grey 2 */
  --color-border-dark: #5B738B;       /* Grey 6 */
  
  /* === COULEURS DE DONNÉES (Charts) === */
  --chart-color-1: #1B90FF;           /* Blue 6 */
  --chart-color-2: #049F9A;           /* Teal 6 */
  --chart-color-3: #36A41D;           /* Green 6 */
  --chart-color-4: #E76500;           /* Mango 6 */
  --chart-color-5: #FA4F96;           /* Raspberry 6 */
  --chart-color-6: #7858FF;           /* Indigo 6 */
  --chart-color-7: #F31DED;           /* Pink 6 */
  --chart-color-8: #EE3939;           /* Red 6 */
  
  /* === COULEURS D'ACCENT === */
  --color-accent-raspberry: #FA4F96;   /* Raspberry 6 - KPI highlights */
  --color-accent-pink: #F31DED;        /* Pink 6 - Special features */
  
  /* === ÉTATS INTERACTIFS === */
  --color-hover: rgba(27, 144, 255, 0.1);      /* Primary avec alpha */
  --color-focus: rgba(27, 144, 255, 0.2);      /* Primary avec alpha */
  --color-active: rgba(27, 144, 255, 0.3);     /* Primary avec alpha */
  --color-disabled: #A9B4BE;                   /* Grey 4 */
  
  /* === BREAKPOINTS RESPONSIVE === */
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  
  /* === ESPACEMENTS === */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* === BORDURES === */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
  
  /* === OMBRES === */
  --shadow-sm: 0 1px 2px rgba(26, 39, 51, 0.1);
  --shadow-md: 0 4px 6px rgba(26, 39, 51, 0.1);
  --shadow-lg: 0 10px 15px rgba(26, 39, 51, 0.1);
  --shadow-xl: 0 20px 25px rgba(26, 39, 51, 0.1);
}

/* === THÈME SOMBRE === */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #12171C;        /* Grey 11 */
    --color-surface: #1A2733;           /* Grey 10 */
    --color-surface-variant: #475E75;   /* Grey 7 */
    
    --color-text: #EAECEE;              /* Grey 2 */
    --color-text-secondary: #A9B4BE;    /* Grey 4 */
    --color-text-disabled: #5B738B;     /* Grey 6 */
    
    --color-border: #475E75;            /* Grey 7 */
    --color-border-light: #5B738B;      /* Grey 6 */
    --color-border-dark: #1A2733;       /* Grey 10 */
    
    /* Ajuster les couleurs primaires pour le contraste */
    --color-primary-light: #89D1FF;     /* Blue 4 */
    --color-secondary-light: #2CE0BF;   /* Teal 4 */
  }
}
```

### 📱 **Responsive Design**
```css
.widget-container {
  /* Mobile First */
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--widget-gap, 1rem);
  
  /* Tablet */
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  /* Desktop */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(12, 1fr);
  }
}

.widget {
  /* Core Responsive Behavior */
  container-type: inline-size;
  min-height: 200px;
  
  /* Container Queries */
  @container (max-width: 300px) {
    .widget-title { font-size: 0.875rem; }
    .widget-legend { display: none; }
  }
  
  @container (min-width: 500px) {
    .widget-title { font-size: 1.25rem; }
    .widget-toolbar { display: flex; }
  }
}
```

---

## ⚡ Performance & Optimization

### 🚀 **Performance Targets**
| Metric | Target | Critical |
|--------|--------|----------|
| **Initial Load** | < 2s | < 5s |
| **Widget Render** | < 500ms | < 1s |
| **Data Update** | < 100ms | < 300ms |
| **Memory Usage** | < 50MB/widget | < 100MB/widget |
| **Bundle Size** | < 200KB/widget | < 500KB/widget |

### 🔧 **Optimization Strategies**
```typescript
class PerformanceOptimizer {
  // Virtualization for Large Datasets
  enableVirtualScrolling(threshold: number = 1000): void;
  enableDataPagination(pageSize: number = 100): void;
  
  // Debouncing & Throttling
  debounceDataUpdates(delay: number = 300): void;
  throttleAnimations(fps: number = 60): void;
  
  // Memory Management
  implementDataCaching(maxSize: number = 50): void;
  enableGarbageCollection(): void;
  
  // Bundle Optimization
  enableCodeSplitting(): void;
  enableTreeShaking(): void;
  implementLazyLoading(): void;
}
```

### 📊 **Monitoring & Analytics**
```typescript
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  dataSize: number;
  updateFrequency: number;
  userInteractions: InteractionEvent[];
}

class PerformanceMonitor {
  // Metrics Collection
  startTracking(widgetId: string): void;
  stopTracking(widgetId: string): PerformanceMetrics;
  
  // Reporting
  generateReport(): PerformanceReport;
  exportMetrics(format: 'json' | 'csv'): string;
  
  // Alerting
  setThresholds(thresholds: PerformanceThresholds): void;
  onThresholdExceeded(callback: (metric: string, value: number) => void): void;
}
```

---

## 🔒 Security & Accessibility

### 🛡️ **Security Standards**
- **XSS Protection**: Content Security Policy + Input Sanitization
- **Data Validation**: Schema validation + Type checking
- **Secure Communication**: HTTPS only + API authentication
- **Privacy**: No PII in client-side storage + GDPR compliance

### ♿ **Accessibility Features**
```typescript
interface AccessibilityConfig {
  // ARIA Support
  ariaLabels: Record<string, string>;
  ariaDescriptions: Record<string, string>;
  
  // Keyboard Navigation
  keyboardShortcuts: Record<string, string>;
  focusManagement: boolean;
  
  // Screen Reader Support
  announcements: boolean;
  dataTableMode: boolean;
  
  // Visual Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
}
```

### 🧪 **Testing Standards**
```typescript
// Unit Tests
describe('WidgetBase', () => {
  test('should render correctly with default config');
  test('should update data without memory leaks');
  test('should handle invalid data gracefully');
});

// Integration Tests
describe('Canvas Integration', () => {
  test('should add/remove widgets correctly');
  test('should persist layout state');
  test('should handle responsive breakpoints');
});

// Accessibility Tests
describe('A11y Compliance', () => {
  test('should pass WCAG 2.1 AA standards');
  test('should support keyboard navigation');
  test('should work with screen readers');
});
```

---

## 📦 Build & Deployment

### 🔨 **Build Configuration Single-File**
```typescript
// build-single-file-widgets.js
const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

class SingleFileWidgetBuilder {
  static async buildWidget(widgetName, options = {}) {
    const templatePath = `./src/widgets/${widgetName}/template.html`;
    const stylePath = `./src/widgets/${widgetName}/styles.css`;
    const scriptPath = `./src/widgets/${widgetName}/script.js`;
    
    // Read components
    const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    const cssStyles = fs.readFileSync(stylePath, 'utf8');
    const jsScript = fs.readFileSync(scriptPath, 'utf8');
    
    // Combine into single file
    const singleFileWidget = `
<!DOCTYPE html>
<template id="${widgetName}-widget-template">
  <style>
    ${cssStyles}
  </style>
  ${htmlTemplate}
</template>

<script>
${jsScript}

// Auto-register if not in module environment
if (typeof customElements !== 'undefined') {
  customElements.define('${widgetName}-widget', ${this.capitalize(widgetName)}Widget);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ${this.capitalize(widgetName)}Widget;
}
</script>
    `.trim();
    
    // Minify if requested
    let output = singleFileWidget;
    if (options.minify) {
      output = await minify(singleFileWidget, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
      });
    }
    
    // Write output
    const outputPath = `./dist/${widgetName}-widget.html`;
    fs.writeFileSync(outputPath, output, 'utf8');
    
    console.log(`✅ Built single-file widget: ${outputPath}`);
    return outputPath;
  }
  
  static async buildCollection(widgetNames, options = {}) {
    const widgets = [];
    
    for (const widgetName of widgetNames) {
      const templatePath = `./src/widgets/${widgetName}/template.html`;
      const stylePath = `./src/widgets/${widgetName}/styles.css`;
      const scriptPath = `./src/widgets/${widgetName}/script.js`;
      
      widgets.push({
        name: widgetName,
        template: fs.readFileSync(templatePath, 'utf8'),
        styles: fs.readFileSync(stylePath, 'utf8'),
        script: fs.readFileSync(scriptPath, 'utf8')
      });
    }
    
    // Generate collection file
    const collectionFile = this.generateCollectionFile(widgets);
    
    // Minify if requested
    let output = collectionFile;
    if (options.minify) {
      output = await minify(collectionFile, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
      });
    }
    
    // Write output
    const outputPath = './dist/widget-collection.html';
    fs.writeFileSync(outputPath, output, 'utf8');
    
    console.log(`✅ Built widget collection: ${outputPath}`);
    return outputPath;
  }
  
  static generateCollectionFile(widgets) {
    const templates = widgets.map(w => `
  <template id="${w.name}-widget-template">
    <style>${w.styles}</style>
    ${w.template}
  </template>`).join('\n');
    
    const scripts = widgets.map(w => w.script).join('\n\n');
    
    const registrations = widgets.map(w => 
      `customElements.define('${w.name}-widget', ${this.capitalize(w.name)}Widget);`
    ).join('\n  ');
    
    const factoryMethods = widgets.map(w => w.name).map(name => `'${name}'`).join(', ');
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Business Widgets Collection</title>
</head>
<body>
${templates}

<script>
${scripts}

// Register all widgets
${registrations}

// Widget Factory
class WidgetFactory {
  static create(type, data, config) {
    const widget = document.createElement(\`\${type}-widget\`);
    if (data) widget.setData(data);
    if (config) widget.configure(config);
    return widget;
  }
  
  static getAvailableTypes() {
    return [${factoryMethods}];
  }
}

// Export globals
window.WidgetFactory = WidgetFactory;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WidgetFactory, ${widgets.map(w => `${this.capitalize(w.name)}Widget`).join(', ')} };
}
</script>
</body>
</html>
    `.trim();
  }
  
  static capitalize(str) {
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  }
}

// Build script usage
async function buildAll() {
  const widgets = ['bar-chart', 'kpi-card', 'gantt-chart', 'map'];
  
  // Build individual widgets
  for (const widget of widgets) {
    await SingleFileWidgetBuilder.buildWidget(widget, { minify: true });
  }
  
  // Build collection
  await SingleFileWidgetBuilder.buildCollection(widgets, { minify: true });
}

module.exports = { SingleFileWidgetBuilder, buildAll };
```

#### **Package.json Scripts**
```json
{
  "name": "business-widgets",
  "version": "1.0.0",
  "description": "Single-file business widgets collection",
  "scripts": {
    "build": "node build-single-file-widgets.js",
    "build:dev": "node build-single-file-widgets.js --dev",
    "build:widget": "node -e \"require('./build-single-file-widgets.js').SingleFileWidgetBuilder.buildWidget(process.argv[2])\"",
    "serve": "python -m http.server 8000",
    "test": "jest --testMatch=\"**/*.test.html\""
  },
  "files": [
    "dist/*.html",
    "examples/*.html",
    "README.md"
  ]
}
```

### 📋 **Distribution Strategy Single-File**
```bash
# Structure de distribution simplifiée
widgets/
├── bar-chart-widget.html          # Widget Bar Chart complet
├── kpi-card-widget.html           # Widget KPI Card complet  
├── gantt-chart-widget.html        # Widget Gantt complet
├── map-widget.html                # Widget Map complet
├── widget-collection.html         # Tous les widgets en un fichier
└── examples/
    ├── dashboard-basic.html        # Exemple d'utilisation
    ├── dashboard-advanced.html     # Exemple avancé
    └── integration-guide.html      # Guide d'intégration
```

#### **Widget Collection File**
```html
<!-- widget-collection.html - Tous les widgets en un seul fichier -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Business Widgets Collection</title>
</head>
<body>
  <!-- Templates pour tous les widgets -->
  <template id="bar-chart-widget-template">
    <!-- Contenu du widget Bar Chart -->
  </template>
  
  <template id="kpi-card-widget-template">
    <!-- Contenu du widget KPI Card -->
  </template>
  
  <template id="gantt-chart-widget-template">
    <!-- Contenu du widget Gantt Chart -->
  </template>
  
  <template id="map-widget-template">
    <!-- Contenu du widget Map -->
  </template>

  <script>
    // Tous les widgets définis dans ce fichier
    class BarChartWidget extends HTMLElement { /* ... */ }
    class KPICardWidget extends HTMLElement { /* ... */ }
    class GanttChartWidget extends HTMLElement { /* ... */ }
    class MapWidget extends HTMLElement { /* ... */ }
    
    // Registration
    customElements.define('bar-chart-widget', BarChartWidget);
    customElements.define('kpi-card-widget', KPICardWidget);
    customElements.define('gantt-chart-widget', GanttChartWidget);
    customElements.define('map-widget', MapWidget);
    
    // Widget Factory
    class WidgetFactory {
      static create(type, data, config) {
        const widget = document.createElement(`${type}-widget`);
        if (data) widget.setData(data);
        if (config) widget.configure(config);
        return widget;
      }
      
      static getAvailableTypes() {
        return ['bar-chart', 'kpi-card', 'gantt-chart', 'map'];
      }
    }
    
    // Export global
    window.WidgetFactory = WidgetFactory;
  </script>
</body>
</html>
```

## 🤖 AI Platform Compatibility

### 🎯 **Gemini Canvas Integration Requirements**

#### **Technical Constraints Analysis**
- **Web Standards Compliance** : HTML5 + ES2020+ + CSS3
- **Security Requirements** : CSP-compliant + sandboxed execution
- **Performance Limits** : < 5MB bundle size + < 2s initialization
- **API Compatibility** : RESTful + JSON format + CORS-enabled

#### **Platform-Specific Adaptations**
```typescript
interface GeminiCanvasConfig {
  // Execution Environment
  sandboxMode: boolean;
  allowedOrigins: string[];
  cspDirectives: string[];
  
  // Resource Constraints
  maxMemoryUsage: number; // bytes
  maxExecutionTime: number; // milliseconds
  maxNetworkRequests: number;
  
  // Data Security
  dataEncryption: boolean;
  allowExternalAPIs: boolean;
  restrictedDomains: string[];
}
```

#### **Widget Adaptation Layer**
```typescript
class GeminiCanvasAdapter extends WidgetBase {
  // Platform Detection
  static isGeminiCanvas(): boolean {
    return typeof window !== 'undefined' && 
           window.navigator.userAgent.includes('GeminiCanvas');
  }
  
  // Resource Management
  optimizeForPlatform(): void {
    if (GeminiCanvasAdapter.isGeminiCanvas()) {
      this.enableLightweightMode();
      this.disableHeavyAnimations();
      this.limitDataPoints(1000);
    }
  }
  
  // Communication Bridge
  sendToGemini(data: any): void {
    if (window.geminiCanvasAPI) {
      window.geminiCanvasAPI.receiveWidgetData(data);
    }
  }
  
  receiveFromGemini(callback: (data: any) => void): void {
    if (window.geminiCanvasAPI) {
      window.geminiCanvasAPI.onDataUpdate = callback;
    }
  }
}
```

#### **Security & Sandboxing**
```typescript
// Content Security Policy Compliance
const GEMINI_CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "blob:"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "blob:"],
  'connect-src': ["'self'", "https://api.widgets.com"],
  'worker-src': ["'self'", "blob:"]
};

// Sandboxed Execution
class SecureWidgetContainer {
  private iframe: HTMLIFrameElement;
  
  constructor(private config: GeminiCanvasConfig) {
    this.iframe = this.createSandboxedFrame();
  }
  
  private createSandboxedFrame(): HTMLIFrameElement {
    const frame = document.createElement('iframe');
    frame.sandbox = 'allow-scripts allow-same-origin';
    frame.srcdoc = this.generateSecureHTML();
    return frame;
  }
  
  private generateSecureHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="Content-Security-Policy" content="${this.buildCSP()}">
        </head>
        <body>
          <div id="widget-container"></div>
          <script type="module" src="./widget-secure.js"></script>
        </body>
      </html>
    `;
  }
}
```

#### **Data Exchange Protocol**
```typescript
// Gemini-compatible data format
interface GeminiWidgetData {
  widget: {
    id: string;
    type: string;
    version: string;
  };
  data: {
    format: 'json' | 'csv' | 'structured';
    content: any;
    schema: DataSchema;
    metadata: {
      source: string;
      timestamp: Date;
      size: number;
    };
  };
  visualization: {
    config: WidgetConfig;
    state: WidgetState;
    interactions: InteractionEvent[];
  };
}

// Bi-directional communication
class GeminiDataBridge {
  // Send widget state to Gemini
  exportForGemini(): GeminiWidgetData {
    return {
      widget: {
        id: this.widgetId,
        type: this.widgetType,
        version: this.version
      },
      data: {
        format: 'json',
        content: this.processedData,
        schema: this.dataSchema,
        metadata: this.getDataMetadata()
      },
      visualization: {
        config: this.currentConfig,
        state: this.getCurrentState(),
        interactions: this.getInteractionHistory()
      }
    };
  }
  
  // Receive updates from Gemini
  importFromGemini(geminiData: GeminiWidgetData): void {
    this.validateGeminiData(geminiData);
    this.updateData(geminiData.data.content);
    this.applyConfig(geminiData.visualization.config);
    this.restoreState(geminiData.visualization.state);
  }
}
```

#### **AI-Enhanced Features**
```typescript
// Gemini AI integration capabilities
interface GeminiAIFeatures {
  // Automated insights
  generateInsights(data: WidgetDataset): Promise<string[]>;
  suggestVisualizations(data: WidgetDataset): Promise<WidgetSuggestion[]>;
  detectAnomalies(data: WidgetDataset): Promise<AnomalyReport>;
  
  // Natural language interaction
  processTextQuery(query: string): Promise<WidgetAction>;
  explainVisualization(): Promise<string>;
  generateSummary(): Promise<DataSummary>;
  
  // Adaptive behavior
  optimizeForContext(context: GeminiContext): void;
  personalizeForUser(preferences: UserPreferences): void;
  adaptToScreen(screenInfo: ScreenInfo): void;
}

class GeminiAIWidget extends WidgetBase implements GeminiAIFeatures {
  private geminiAPI: GeminiAPI;
  
  async generateInsights(data: WidgetDataset): Promise<string[]> {
    const prompt = this.buildInsightPrompt(data);
    const response = await this.geminiAPI.generateContent(prompt);
    return this.parseInsights(response);
  }
  
  async suggestVisualizations(data: WidgetDataset): Promise<WidgetSuggestion[]> {
    const dataProfile = this.analyzeDataProfile(data);
    const suggestions = await this.geminiAPI.suggestCharts(dataProfile);
    return this.formatSuggestions(suggestions);
  }
  
  async processTextQuery(query: string): Promise<WidgetAction> {
    const intent = await this.geminiAPI.classifyIntent(query);
    return this.translateToAction(intent, query);
  }
}
```

#### **Performance Optimizations for AI Platforms**
```typescript
// Lightweight mode for AI environments
class LightweightWidget extends WidgetBase {
  // Reduced feature set for AI platforms
  private readonly AI_MODE_FEATURES = {
    animations: false,
    transitions: false,
    interactivity: 'basic',
    dataLimit: 1000,
    refreshRate: 5000, // 5 seconds minimum
    memoryLimit: 10 * 1024 * 1024 // 10MB
  };
  
  enableAIMode(): void {
    this.disableAnimations();
    this.limitDataPoints(this.AI_MODE_FEATURES.dataLimit);
    this.setRefreshRate(this.AI_MODE_FEATURES.refreshRate);
    this.enableMemoryOptimization();
  }
  
  // Streaming data for large datasets
  async streamDataToAI(data: WidgetDataset): Promise<void> {
    const chunks = this.chunkData(data, 100); // 100 points per chunk
    
    for (const chunk of chunks) {
      await this.processChunk(chunk);
      await this.waitForAIProcessing(); // Respect AI platform limits
    }
  }
  
  // Memory-efficient rendering
  renderForAI(): void {
    this.useVirtualScrolling();
    this.enableDataPagination();
    this.disableHighResolutionGraphics();
  }
}
```

#### **Compatibility Matrix**
```typescript
// Platform compatibility checker
class PlatformCompatibility {
  static readonly GEMINI_CANVAS_REQUIREMENTS = {
    htmlVersion: 'HTML5',
    jsVersion: 'ES2020',
    cssVersion: 'CSS3',
    maxBundleSize: 5 * 1024 * 1024, // 5MB
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    maxInitTime: 2000, // 2 seconds
    requiredAPIs: [
      'Canvas',
      'WebGL',
      'CSS Grid',
      'Flexbox',
      'Web Components',
      'ES Modules'
    ],
    restrictedAPIs: [
      'eval',
      'Function constructor',
      'document.write',
      'location.href modification'
    ]
  };
  
  static checkCompatibility(): CompatibilityReport {
    const results = {
      compatible: true,
      warnings: [] as string[],
      errors: [] as string[],
      optimizations: [] as string[]
    };
    
    // Check bundle size
    if (this.getBundleSize() > this.GEMINI_CANVAS_REQUIREMENTS.maxBundleSize) {
      results.errors.push('Bundle size exceeds Gemini Canvas limit');
      results.compatible = false;
    }
    
    // Check API compatibility
    this.GEMINI_CANVAS_REQUIREMENTS.requiredAPIs.forEach(api => {
      if (!this.isAPISupported(api)) {
        results.errors.push(`Required API not supported: ${api}`);
        results.compatible = false;
      }
    });
    
    return results;
  }
}
```

---

### 🚀 **Quick Start Single-File**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Dashboard with Single-File Widgets</title>
  <style>
    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }
  </style>
</head>
<body>
  <!-- Include widgets (option 1: individual files) -->
  <script src="./widgets/bar-chart-widget.html"></script>
  <script src="./widgets/kpi-card-widget.html"></script>
  
  <!-- Or include collection (option 2: all widgets) -->
  <!-- <script src="./widgets/widget-collection.html"></script> -->
  
  <div class="dashboard">
    <!-- Direct HTML usage -->
    <bar-chart-widget 
      data='[{"label":"Q1","value":100},{"label":"Q2","value":150}]'
      title="Sales Revenue">
    </bar-chart-widget>
    
    <kpi-card-widget 
      data='{"value":85,"target":90,"trend":12}'
      title="Customer Satisfaction">
    </kpi-card-widget>
  </div>
  
  <!-- Programmatic usage -->
  <script>
    // Create widgets via JavaScript
    const salesChart = BarChartWidget.create([
      { label: 'Jan', value: 120 },
      { label: 'Feb', value: 150 },
      { label: 'Mar', value: 180 }
    ], { title: 'Monthly Sales' });
    
    document.querySelector('.dashboard').appendChild(salesChart);
    
    // Event handling
    salesChart.addEventListener('bar-click', (e) => {
      console.log('Clicked:', e.detail.data);
    });
  </script>
</body>
</html>
```

### 📱 **Framework Integration Single-File**
```typescript
// React Integration avec Single-File Widget
import { useEffect, useRef } from 'react';

export function SingleFileWidget({ 
  widgetFile, 
  widgetType, 
  data, 
  config 
}: {
  widgetFile: string;
  widgetType: string;
  data: any;
  config?: any;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Load widget file dynamically
    const script = document.createElement('script');
    script.src = widgetFile;
    script.onload = () => {
      // Create widget instance
      const WidgetClass = customElements.get(`${widgetType}-widget`);
      if (WidgetClass && containerRef.current) {
        widgetRef.current = new WidgetClass();
        widgetRef.current.setData(data);
        if (config) widgetRef.current.configure(config);
        
        containerRef.current.appendChild(widgetRef.current);
      }
    };
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      if (widgetRef.current) {
        widgetRef.current.remove();
      }
      script.remove();
    };
  }, [widgetFile, widgetType]);
  
  useEffect(() => {
    // Update data when props change
    if (widgetRef.current) {
      widgetRef.current.setData(data);
    }
  }, [data]);
  
  useEffect(() => {
    // Update config when props change
    if (widgetRef.current && config) {
      widgetRef.current.configure(config);
    }
  }, [config]);
  
  return <div ref={containerRef} />;
}

// Usage
<SingleFileWidget
  widgetFile="./widgets/bar-chart-widget.html"
  widgetType="bar-chart"
  data={chartData}
  config={{ title: 'Sales Data' }}
/>
```

### 🔄 **Vue.js Integration**
```vue
<template>
  <div ref="widgetContainer"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  widgetFile: String,
  widgetType: String,
  data: Object,
  config: Object
});

const widgetContainer = ref(null);
let widgetInstance = null;

onMounted(async () => {
  // Load single-file widget
  await loadWidgetFile(props.widgetFile);
  createWidget();
});

async function loadWidgetFile(filePath) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = filePath;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function createWidget() {
  const WidgetClass = customElements.get(`${props.widgetType}-widget`);
  if (WidgetClass && widgetContainer.value) {
    widgetInstance = new WidgetClass();
    widgetInstance.setData(props.data);
    if (props.config) widgetInstance.configure(props.config);
    
    widgetContainer.value.appendChild(widgetInstance);
  }
}

watch(() => props.data, (newData) => {
  if (widgetInstance) {
    widgetInstance.setData(newData);
  }
});

watch(() => props.config, (newConfig) => {
  if (widgetInstance && newConfig) {
    widgetInstance.configure(newConfig);
  }
});
</script>
```

---

> **Next Steps :** Implémenter MVP v1.0 avec Bar Chart Widget suivant ces spécifications techniques
