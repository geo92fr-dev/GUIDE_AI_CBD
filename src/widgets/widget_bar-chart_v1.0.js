
// ====================================================================
// 📄 BAR CHART WIDGET (v1.0 → redesign readability)
// ====================================================================
// Visual Specification Documentation (FR):
// Objectif: Rendre un bar chart business lisible dans un thème sombre avec:
//   1. Axes clairs (Y graduations "nice" + X catégories adaptatives)
//   2. Espacement & proportions robustes (jusqu'à 1000 catégories)
//   3. Légende triée (<=10 catégories) avec pourcentages pour contexte part relatif
//   4. Labels valeurs intelligents (interne si espace, au-dessus sinon, masqués si dense)
//   5. Mode dense & scroll horizontal automatique si trop de barres
//   6. Tooltips accessibles (hover + focus clavier)
//   7. Formatting valeurs (K / M) et ticks "nice" pour cohérence
//   8. Edge cases: dataset vide, toutes valeurs =0, single bar, série très longue
// Justification visuelle (Pourquoi optimal):
//   - Contraste respectant palette business (COLOR.md) : fond sombre #1A2733 / textes #EAECEE / lignes subtiles rgba(255,255,255,0.07)
//   - Bars colorées via palette cyclique business évitant confusion (teinte distincte initiale + fallback variation HSL si > palette)
//   - Hiérarchie: Valeurs -> Bars -> Axes -> Grille (grid atténuée pour ne pas distraire)
//   - Lecture rapide: pourcentage dans la légende (si <=10) + tri desc → insight immédiat de distribution.
//   - Adaptation densité: supprime labels superflus quand l'espace ne permet pas une lisibilité acceptable (principe de graceful degradation)
//   - Accessibilité: focus keyboard sur barres (tabindex), aria-label sur SVG, stroke + outline sur focus, tooltip textuel.
//   - Performance: O(n) création DOM, aucun recalcul complexe; fallback mode dense supprime textes inutiles (> coût rendu) au delà d'un seuil.
// Conformité CBD / Specs:
//   - Fichier unique (Single-File Widget Architecture)
//   - Palette business (COLOR.md) respectée
//   - maxDataPoints (1000) géré sans lib externe
//   - Thème sombre homogène avec autres widgets refactorés
//   - Pas de dépendances externes → portabilité maximale
// ====================================================================
// 📦 DATASET DE DÉMONSTRATION (Isolé des fonctions)
// ====================================================================

const BAR_CHART_DEMO_DATASET = {
    metadata: {
        name: 'Sales Performance Demo Dataset',
        description: 'Dataset de démonstration pour les ventes par région',
        source: 'internal-demo',
        lastUpdated: new Date().toISOString(),
        rowCount: 7
    },
    data: [
        { label: 'Nord', value: 25000, value2: 850, category: 'Region' },
        { label: 'Sud', value: 18000, value2: 1200, category: 'Region' },
        { label: 'Est', value: 32000, value2: 650, category: 'Region' },
        { label: 'Ouest', value: 21000, value2: 950, category: 'Region' },
        { label: 'Centre', value: 28000, value2: 1100, category: 'Region' },
        { label: 'Pacifique', value: 19500, value2: 750, category: 'Region' },
        { label: 'Atlantique', value: 26500, value2: 880, category: 'Region' }
    ]
};

// ====================================================================
// �📋 BAR CHART WIDGET - Métadonnées
// ====================================================================

const BAR_CHART_WIDGET_DEFINITION = {
    type: 'bar-chart',
    name: 'Bar Chart v1.0',
    title: 'Bar Chart Visualization',
    version: '1.0.0',
    metadata: {
        description: 'Bar chart for categorical data with demo dataset',
        author: 'Widgets Platform',
        tags: ['chart', 'visualization', 'bar', 'business', 'demo'],
        category: 'Charts',
        icon: '📊',
        preview: '',
        documentation: 'Bar chart widget for displaying categorical data with quantitative values'
    },
    
    // Dataset intégré mais séparé du code
    demoDataset: BAR_CHART_DEMO_DATASET,
    metadataSchema: [
        { name: 'label', type: 'string', semantic: 'dimension', description: 'Category label' },
        { name: 'value', type: 'number', semantic: 'measure', description: 'Primary measure (bar height)' },
        { name: 'value2', type: 'number', semantic: 'measure', description: 'Secondary measure (bar width when enabled)' }
    ],
    dataBinding: {
        requirements: {
            dimensions: { min: 1, max: 2, required: true },
            measures: { min: 1, max: 2, required: true },
            filters: { min: 0, max: 10, required: false }
        },
        defaultBinding: {
            dimensions: [],
            measures: [],
            filters: []
        }
    },
    layout: {
        size: { width: 6, height: 4 },
        minSize: { width: 3, height: 2 },
        maxSize: { width: 12, height: 8 },
        responsive: true
    },
    configuration: {
        orientation: { type: 'select', options: ['vertical', 'horizontal'], default: 'vertical' },
        showValues: { type: 'boolean', default: true },
        showGrid: { type: 'boolean', default: true },
        animation: { type: 'boolean', default: true },
        colorScheme: { type: 'select', options: ['business', 'rainbow', 'monochrome'], default: 'business' }
    },
    rendering: {
        engine: 'native-svg',
        dependencies: [],
        performance: {
            maxDataPoints: 1000,
            updateMode: 'incremental'
        }
    }
};

// ====================================================================
// 🎨 RENDER FUNCTION - Nouvelle version lisible & adaptive
// ====================================================================
const barChartRender = (function(args) {
    const rawData = Array.isArray(args.json) ? args.json : [];
    const title = (args.title || '📊 Raphael Bar Chart 1').replace('📊 ','');
    const options = args.options || {};
    
    // Configuration des noms business pour les mesures
    const measureLabels = {
        value: options.measure1Label || 'Sales Revenue',
        value2: options.measure2Label || 'Market Volume'
    };
    
    // Toutes les mesures disponibles incluant "none" (aucune mesure de largeur)
    const availableMeasures = ['value', 'value2', ''];
    
    // ✅ DÉCLARATION DES DONNÉES D'ABORD
    let data = (rawData && rawData.length > 0 ? rawData : BAR_CHART_DEMO_DATASET.data);
    
    // Configuration du mode variwide (largeurs variables) - Auto-détection
    const baseHeightMeasure = options.heightMeasure || 'value';
    
    // 🎯 CONFIGURATION : Par défaut width = "None", l'utilisateur choisit manuellement
    const defaultWidthMeasure = ''; // Toujours "None" par défaut
    
    const baseWidthMeasure = options.widthMeasure !== undefined ? options.widthMeasure : defaultWidthMeasure;
    const varidConfig = {
        enabled: baseWidthMeasure !== '', // Activé si width measure sélectionnée
        heightMeasure: baseHeightMeasure, // Mesure pour la hauteur
        widthMeasure: baseWidthMeasure, // Mesure pour la largeur (auto-détecté ou spécifié)
        minBarWidth: options.minBarWidth || 20,
        maxBarWidth: options.maxBarWidth || 300,
        labels: measureLabels
    };
    
    // Filtrage et validation des mesures selon la configuration
    data = data.filter(d => {
        const heightValue = d[varidConfig.heightMeasure];
        const widthValue = varidConfig.enabled ? d[varidConfig.widthMeasure] : null;
        
        // Valider la mesure de hauteur (obligatoire)
        if (typeof heightValue !== 'number' || isNaN(heightValue)) return false;
        
        // Si variwide activé, valider aussi la mesure de largeur
        if (varidConfig.enabled && (typeof widthValue !== 'number' || isNaN(widthValue) || widthValue <= 0)) {
            return false;
        }
        
        return true;
    });

    const container = document.createElement('div');
    container.className = 'bc-root bc-ultra'; // activation mode ultra compact

    // 🎯 CONFIGURATION CENTRALISÉE DES POLICES
    const BC_FONT_SIZE = 16; // Taille unique pour toutes les polices du widget

    const style = document.createElement('style');
            style.textContent = `
            :root {
                --bc-font-size: ${BC_FONT_SIZE}px;
            }
            .bc-root { position:relative; display:flex; flex-direction:column; width:100%; height:100%; background: var(--surface-primary, var(--background-secondary,#1A2733)); border-radius: var(--radius-md,8px); font-family: var(--font-family-base,'Segoe UI',Roboto,sans-serif); padding:2px 4px 2px 4px; overflow:hidden; }
            .bc-root:before { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0)); }
            .bc-header { display:flex; flex-direction:column; align-items:stretch; gap:0; padding:0; margin:0; margin-bottom:0; }
            .bc-title-row { text-align:center; line-height:1.0; margin:0; }
            .bc-title { display:block; text-align:center; font-size:var(--bc-font-size); font-weight:600; letter-spacing:.5px; text-transform:uppercase; color: var(--text-secondary,#A9B4BE); margin:0 auto; width:100%; }
            .bc-legend-row { margin:-2px 0 0 0; padding:0; display:flex; justify-content:center; }
            .bc-legend { display:flex; flex-wrap:wrap; gap:2px 6px; align-items:center; justify-content:center; max-width:100%; }
            /* Large variant when peu de catégories (<=6) */
            .bc-legend.bc-legend-large { gap:4px 8px; }
            .bc-legend.bc-legend-large .bc-legend-item { font-size:var(--bc-font-size); padding:2px 8px; border-radius:12px; }
            .bc-legend.bc-legend-large .bc-legend-color { width:12px; height:12px; }
            .bc-legend.bc-legend-large .bc-legend-pct { font-size:var(--bc-font-size); }
            /* Compact variant quand >6 catégories */
            .bc-legend.bc-legend-compact { gap:2px 4px; }
            .bc-legend.bc-legend-compact .bc-legend-item { padding:1px 5px; font-size:var(--bc-font-size); }
            .bc-legend-item { display:inline-flex; align-items:center; gap:5px; font-size:var(--bc-font-size); padding:2px 6px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.20); border-radius:16px; cursor:default; line-height:1; position:relative; color: var(--text-primary,#EAECEE); outline:none; backdrop-filter:blur(2px); }
            .bc-legend-item:focus-visible { box-shadow:0 0 0 2px rgba(27,144,255,0.55); }
            .bc-legend-color { width:14px; height:14px; border-radius:4px; box-shadow:0 0 0 1px rgba(255,255,255,0.25) inset; }
            .bc-legend-pct { font-weight:600; font-size:var(--bc-font-size); color: var(--text-secondary,#A9B4BE); }
            /* Section diff dédiée sous le chart */
            .bc-diff-section { padding:2px 4px; margin-top:0; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:3px; height:20px; min-height:20px; max-height:20px; display:flex; align-items:center; justify-content:center; text-align:center; flex-shrink:0; overflow:hidden; white-space:nowrap; }
            .bc-diff-default { font-size:var(--bc-font-size); color: var(--text-secondary,#A9B4BE); font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .bc-diff-content { width:100%; text-align:center; }
            .bc-diff-header-inline { display:flex; justify-content:space-between; align-items:center; margin-bottom:2px; }
            .bc-diff-header-inline span { font-weight:600; font-size:var(--bc-font-size); letter-spacing:.3px; color: var(--text-primary,#EAECEE); }
            .bc-diff-swap { background:none; border:none; font-size:var(--bc-font-size); color:var(--text-secondary,#A9B4BE); cursor:pointer; padding:0 4px; border-radius:4px; }
            .bc-diff-swap:hover { background:rgba(255,255,255,0.1); color:var(--text-primary,#EAECEE); }
            .bc-diff-inline { display:flex; align-items:center; justify-content:center; gap:6px; flex-wrap:nowrap; white-space:nowrap; overflow:hidden; }
            .bc-diff-labels { font-size:var(--bc-font-size); font-weight:600; color: var(--text-primary,#EAECEE); }
            .bc-diff-values { font-size:var(--bc-font-size); color:var(--text-secondary,#A9B4BE); }
            .bc-diff-delta { font-size:var(--bc-font-size); font-weight:600; }
            .bc-diff-separator { font-size:var(--bc-font-size); color:var(--text-secondary,#A9B4BE); opacity:0.6; }
            
            /* Contrôles Variwide */
            .bc-variwide-controls { display:flex; align-items:center; justify-content:center; gap:8px; margin:2px 0; padding:2px 4px; background:rgba(255,255,255,0.03); border-radius:6px; }
            .bc-variwide-toggle { background:none; border:1px solid rgba(255,255,255,0.2); color:var(--text-secondary,#A9B4BE); font-size:var(--bc-font-size); padding:2px 6px; border-radius:4px; cursor:pointer; transition:all 0.2s; }
            .bc-variwide-toggle:hover { border-color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.05); }
            .bc-variwide-toggle.active { border-color:var(--accent-primary,#4A9EFF); background:var(--accent-primary,#4A9EFF); color:#ffffff; }
            .bc-variwide-label { font-size:var(--bc-font-size); color:var(--text-muted,#5B738B); font-weight:500; }
            .bc-measure-selector { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.2); color:var(--text-secondary,#A9B4BE); font-size:var(--bc-font-size); padding:1px 4px; border-radius:3px; cursor:pointer; min-width:60px; }
    .bc-chart-wrapper { position:relative; flex:1; overflow:hidden; border-top:none; margin:0; padding:0; }
      .bc-scroll { width:100%; height:100%; overflow-x:auto; overflow-y:hidden; scrollbar-width:thin; }
      .bc-scroll::-webkit-scrollbar { height:8px; }
      .bc-scroll::-webkit-scrollbar-track { background:rgba(255,255,255,0.04); }
      .bc-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.18); border-radius:20px; }
      .bc-svg { width:100%; height:100%; display:block; font-variant-numeric:tabular-nums; }
      .bc-axis line, .bc-axis path { stroke: rgba(255,255,255,0.18); stroke-width:0.6; shape-rendering:crispEdges; }
      .bc-grid line { stroke: rgba(255,255,255,0.07); stroke-width:0.5; shape-rendering:crispEdges; }
      .bc-tick-label { font-size:var(--bc-font-size); fill: var(--text-secondary,#A9B4BE); font-weight:500; }
      .bc-cat-label { font-size:var(--bc-font-size); fill: var(--text-muted,#5B738B); dominant-baseline: hanging; }
      .bc-cat-rot45 { transform-origin: center; }
      .bc-value-label { font-size:var(--bc-font-size); font-weight:600; fill: var(--text-primary,#EAECEE); paint-order: stroke; stroke: rgba(0,0,0,0.45); stroke-width:.8; stroke-linejoin:round; }
    .bc-bar { rx:1.5; cursor:pointer; transition:filter .18s ease, opacity .18s ease, width .4s ease, x .4s ease; }
    .bc-bar:focus-visible { outline:2px solid rgba(255,255,255,0.8); outline-offset:2px; }
    .bc-bars.hover-mode .bc-bar { opacity:0.25; }
    .bc-bars.hover-mode .bc-bar.hovered { opacity:1; filter:brightness(1.08); }
    /* Selected bars never fade and always have white outline */
    .bc-bar.selected, .bc-bar.selected-alt { opacity:1 !important; filter:brightness(1.05); outline:2px solid rgba(255,255,255,0.8); outline-offset:1px; }
      .bc-footer-tag { position:absolute; top:6px; right:10px; font-size:var(--bc-font-size); color: var(--text-secondary,#A9B4BE); letter-spacing:.5px; text-transform:uppercase; pointer-events:none; }
      .bc-empty { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:6px; font-size:var(--bc-font-size); color: var(--text-secondary,#A9B4BE); }
      .bc-empty span { font-size:var(--bc-font-size); opacity:.8; }
            .bc-tooltip { position:absolute; background:#12171C; color:#EAECEE; font-size:var(--bc-font-size); padding:6px 8px; border-radius:6px; pointer-events:none; box-shadow:0 4px 12px rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.12); z-index:10; max-width:200px; line-height:1.25; }

            .bc-tooltip.fade-in { animation: bcTipIn .15s ease; }
            .bc-tooltip.compact { padding:5px 7px; font-size:var(--bc-font-size); line-height:1.2; }
            .bc-tooltip.minimal { padding:3px 5px; font-size:var(--bc-font-size); line-height:1.15; }
            .bc-tooltip .bc-rank { display:inline-block; background:rgba(255,255,255,0.08); padding:2px 5px; border-radius:10px; font-size:var(--bc-font-size); font-weight:600; margin-right:6px; color: var(--text-secondary,#A9B4BE); }
            .bc-tooltip .bc-line { margin-top:2px; font-size:inherit; }
      .bc-diff-line {
        z-index: 10 !important;
        pointer-events: none;
        opacity: 0.7;
      }
      .bc-diff-line.visible {
        opacity: 1;
        transition: opacity 0.3s ease;
      }
      @keyframes bcTipIn { from { opacity:0; transform:translateY(3px);} to { opacity:1; transform:translateY(0);} }
      .bc-scroll-hint { position:absolute; bottom:4px; right:8px; font-size:var(--bc-font-size); color: var(--text-secondary,#A9B4BE); background:rgba(0,0,0,0.35); padding:2px 6px; border-radius:10px; pointer-events:none; }
      .bc-vis-hidden { position:absolute !important; left:-9999px !important; top:auto !important; width:1px !important; height:1px !important; overflow:hidden !important; }
            @media (max-width:600px){ .bc-title { font-size:var(--bc-font-size); } .bc-legend-item { font-size:var(--bc-font-size); padding:3px 6px;} }

            /* ================= ULTRA COMPACT MODE ================= */
            .bc-ultra .bc-title { font-size:var(--bc-font-size); letter-spacing:.4px; }
            .bc-ultra .bc-title-row { margin-bottom:1px; }
            .bc-ultra .bc-legend { gap:2px 4px; }
            .bc-ultra .bc-legend-item { padding:1px 4px; font-size:var(--bc-font-size); gap:4px; background:rgba(255,255,255,0.05); border-radius:10px; }
            .bc-ultra .bc-legend.bc-legend-large .bc-legend-item { font-size:var(--bc-font-size); padding:2px 6px; }
            .bc-ultra .bc-legend-color { width:10px; height:10px; border-radius:3px; }
            .bc-ultra .bc-legend-pct { font-size:var(--bc-font-size); }
            .bc-ultra .bc-diff-section { margin-top:0; padding:1px 3px; height:18px; min-height:18px; max-height:18px; }
            .bc-ultra .bc-diff-default { font-size:var(--bc-font-size); }
            .bc-ultra .bc-diff-inline { gap:4px; }
            .bc-ultra .bc-diff-labels, .bc-ultra .bc-diff-values, .bc-ultra .bc-diff-delta { font-size:var(--bc-font-size); }
            .bc-ultra .bc-chart-wrapper { margin-top:0; padding-top:0; border-top:none; }
            .bc-ultra .bc-tick-label { font-size:var(--bc-font-size); }
            .bc-ultra .bc-cat-label { font-size:var(--bc-font-size); }
            .bc-ultra .bc-value-label { font-size:var(--bc-font-size); }
            .bc-ultra .bc-footer-tag { top:4px; right:6px; font-size:var(--bc-font-size); }
            .bc-ultra .bc-scroll-hint { bottom:2px; right:4px; font-size:var(--bc-font-size); padding:1px 4px; }
            .bc-ultra.bc-root { padding:1px 3px 1px 3px; }
            /* Supprimer légère backdrop blur si besoin performance/compacité visuelle */
            .bc-ultra .bc-legend-item { backdrop-filter:none; }
            .bc-ultra .bc-legend.bc-legend-large { gap:4px 6px; }
            .bc-ultra .bc-legend.bc-legend-compact { gap:2px 4px; }
            /* Réduire stroke axes */
            .bc-ultra .bc-axis line, .bc-ultra .bc-axis path { stroke-width:0.5; }
            .bc-ultra .bc-grid line { stroke-width:0.4; }
            /* Sélection outline plus fine */
            .bc-ultra .bc-bar.selected, .bc-ultra .bc-bar.selected-alt { outline-width:1px; }
            /* Diff line plus fine */
            .bc-ultra .bc-diff-line { stroke-width:1px; stroke-dasharray:2,2; }
            /* Suppression complète du padding */
            .bc-chart-wrapper { padding:0; }
            .bc-ultra .bc-chart-wrapper { padding:0; margin:0; }
            /* Padding SVG supprimé pour maximiser l'espace chart */
            /* Renforcer densité: réduction des marges gérée via variables JS (topMargin, baseXLabelArea) */
        `;

    // === Utilitaires ===
    function formatValue(v){
        if (v === 0) return '0';
        const abs = Math.abs(v);
        if (abs >= 1_000_000) return (v/1_000_000).toFixed(1).replace(/\.0$/,'')+'M';
        if (abs >= 10_000) return (v/1000).toFixed(abs<100_000?1:0).replace(/\.0$/,'')+'K';
        if (abs >= 1000) return (v/1000).toFixed(1).replace(/\.0$/,'')+'K';
        return String(v);
    }
    function niceRoundUp(x){
        if(x<=0) return 1;
        const mag = Math.pow(10, Math.floor(Math.log10(x)));
        const norm = x / mag;
        let candidate;
        if (norm <= 1) candidate = 1; else if (norm <=2) candidate = 2; else if (norm <=2.5) candidate=2.5; else if (norm<=5) candidate=5; else candidate=10;
        return candidate * mag;
    }
    function computeTicks(maxValue, height, headroomTarget=0.08){
        // Stratégie ultra-serrée: garantir yMax >= maxValue avec headroom minimal
        if(maxValue<=0) return {ticks:[0], max:1};
        const target = Math.min(Math.max(Math.floor(height/45),3),8); // densité encore plus élevée
        
        // GARANTIR que le max calculé dépasse toujours maxValue
        const minHeadroom = Math.max(maxValue * headroomTarget, maxValue * 0.05); // minimum 5%
        const requiredMax = maxValue + minHeadroom;
        
        // Chercher le plus petit "nice number" qui soit >= requiredMax
        let bestMax = niceRoundUp(requiredMax);
        
        // Si toujours insuffisant, forcer à dépasser
        if(bestMax < maxValue) {
            bestMax = maxValue * 1.05; // forcer 5% minimum
        }
        
        // Essayer des candidates plus fins si le headroom est excessif (>20%)
        if(bestMax > maxValue * 1.20) {
            const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
            
            // Candidates ultra-fins pour minimiser le headroom
            const candidates = [1.02, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.2, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 9, 10];
            
            for(let candidate of candidates) {
                const candidateMax = candidate * magnitude;
                if(candidateMax >= maxValue && candidateMax < bestMax) {
                    bestMax = candidateMax;
                    break;
                }
            }
        }
        
        // Double vérification: s'assurer que bestMax >= maxValue
        if(bestMax < maxValue) {
            bestMax = Math.ceil(maxValue * 1.02); // au pire, 2% de plus que maxValue
        }
        
        const step = niceRoundUp(bestMax / target);
        const ticks=[]; 
        for(let v=0; v<=bestMax+0.0001; v+=step){ 
            ticks.push(v); 
        }
        
        return {ticks, max: Math.max(ticks[ticks.length-1], maxValue * 1.02)};
    }
    function truncateLabel(label, max=12){
        if (!label) return '';
        return label.length>max ? label.slice(0,max-1)+'…' : label;
    }
    // Palette business + fallback variation
    const basePalette = ['#1B90FF','#049F9A','#36A41D','#E76500','#7858FF','#FA4F96','#F31DED','#EE3939'];
    function colorForIndex(i){ if (i < basePalette.length) return basePalette[i];
        // simple variation (rotate hue via HSL approximation) => fallback lighten/darken
        const base = basePalette[i % basePalette.length];
        // crude lighten/darken by cycling factor
        const f = ((i / basePalette.length)|0) % 4; // 0..3
        const adjust = (hex, factor)=>{ const c=parseInt(hex.slice(1),16); let r=(c>>16)&255,g=(c>>8)&255,b=c&255; r=Math.min(255,Math.max(0,r+factor)); g=Math.min(255,Math.max(0,g+factor)); b=Math.min(255,Math.max(0,b+factor)); return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1); };
        return adjust(base, (f-1)*18); // -18,0,18,36
    }

    // === Layout dynamique ===
    const ultra = container.classList.contains('bc-ultra');
    const legendEnabled = data.length <= 10; // règle spec
    // Estimation plus précise de la hauteur de légende basée sur les logs réels
    const legendHeight = legendEnabled ? Math.ceil(data.length / 6) * (ultra ? 20 : 24) + (ultra ? 14 : 16) : 0; // hauteur par ligne + padding title
    const yAxisWidth = ultra ? 30 : 34; // px réduit en ultra
    const baseXLabelArea = ultra ? 20 : 32; // zone labels X ultra-réduite
    // densité initiale estimée en phase layout secondaire
    // Chart zone sera calculée après dimensions réelles du conteneur (utilisation de 600x320 fallback logique pour ratio initial)

    // Construction structure DOM ultra-simplifiée
    const header = document.createElement('div'); 
    header.className='bc-header';
    const titleEl = document.createElement('div'); 
    titleEl.className='bc-title'; 
    titleEl.textContent=title;
    header.appendChild(titleEl);
    
    // Contrôles des mesures (interface simplifiée)
    const measureControlsEl = document.createElement('div');
    measureControlsEl.className = 'bc-variwide-controls';
    measureControlsEl.style.display = 'flex';
    measureControlsEl.style.alignItems = 'center';
    measureControlsEl.style.gap = '8px';
    
    // Initialisation des sélecteurs avec filtrage
    header.appendChild(measureControlsEl);
    
    // Fonction pour générer les options de sélecteurs avec filtrage mutuel
    function generateSelectorOptions(currentType, currentValue, excludedValue = null) {
        const isHeight = currentType === 'height';
        let options = '';
        
        if (isHeight) {
            // Height selector : uniquement les vraies mesures (pas "")
            availableMeasures.filter(m => m !== '').forEach(measure => {
                if (measure !== excludedValue) {
                    const selected = measure === currentValue ? 'selected' : '';
                    const label = measureLabels[measure];
                    options += `<option value="${measure}" ${selected}>${label}</option>`;
                }
            });
        } else {
            // Width selector : None + les autres mesures non sélectionnées en Height
            // Toujours inclure "None" (valeur vide)
            const noneSelected = currentValue === '' ? 'selected' : '';
            options += `<option value="" ${noneSelected}>None</option>`;
            
            // Ajouter les mesures non utilisées par Height
            availableMeasures.filter(m => m !== '' && m !== excludedValue).forEach(measure => {
                const selected = measure === currentValue ? 'selected' : '';
                const label = measureLabels[measure];
                options += `<option value="${measure}" ${selected}>${label}</option>`;
            });
        }
        
        return options;
    }
    
    // Function pour mettre à jour les sélecteurs avec filtrage
    function updateSelectors() {
        const heightOptions = generateSelectorOptions('height', varidConfig.heightMeasure, varidConfig.widthMeasure);
        const widthOptions = generateSelectorOptions('width', varidConfig.widthMeasure, varidConfig.heightMeasure);
        
        measureControlsEl.innerHTML = `
            <span class="bc-variwide-label">Height:</span>
            <select class="bc-measure-selector bc-height-measure">
                ${heightOptions}
            </select>
            <span class="bc-variwide-label">Width:</span>
            <select class="bc-measure-selector bc-width-measure">
                ${widthOptions}
            </select>
        `;
        
        // Re-attacher les gestionnaires d'événements
        const heightMeasureSelect = measureControlsEl.querySelector('.bc-height-measure');
        const widthMeasureSelect = measureControlsEl.querySelector('.bc-width-measure');
        
        heightMeasureSelect?.addEventListener('change', (e) => {
            varidConfig.heightMeasure = e.target.value;
            console.log('📊 HEIGHT MEASURE CHANGE:', varidConfig.heightMeasure);
            updateSelectors(); // Mettre à jour les sélecteurs
            reRenderChart();
        });
        
        widthMeasureSelect?.addEventListener('change', (e) => {
            varidConfig.widthMeasure = e.target.value;
            varidConfig.enabled = e.target.value !== '';
            console.log('📊 WIDTH MEASURE CHANGE:', {
                width: varidConfig.widthMeasure,
                enabled: varidConfig.enabled
            });
            updateSelectors(); // Mettre à jour les sélecteurs
            reRenderChart();
        });
    }
    
    // Gestionnaires d'événements pour les sélecteurs de mesures
    const reRenderChart = () => {
        // Re-rendu complet du widget avec nouvelles options
        const newOptions = {
            ...options,
            heightMeasure: varidConfig.heightMeasure,
            widthMeasure: varidConfig.widthMeasure
        };
        const newArgs = { ...args, options: newOptions };
        const newWidget = barChartRender(newArgs);
        container.parentNode?.replaceChild(newWidget, container);
    };
    
    // Initialisation initiale des sélecteurs avec filtrage
    updateSelectors();
    
    // 🔍 DEBUG - Mesurer header réel après ajout
    setTimeout(() => {
        const actualHeaderHeight = header.getBoundingClientRect().height;
        console.log('📊 HEADER DEBUG - Hauteur réelle:', actualHeaderHeight, 'px vs estimée:', legendHeight, 'px');
    }, 10);
    
    if(legendEnabled){
        const legendEl = document.createElement('div'); legendEl.className='bc-legend';
        if(data.length<=6){
            legendEl.classList.add('bc-legend-large');
        } else if(data.length>6){
            legendEl.classList.add('bc-legend-compact');
        }
        const total = data.reduce((a,b)=>a+(b[varidConfig.heightMeasure] || 0),0) || 1;
        const sortedLegend = [...data].sort((a,b)=>b[varidConfig.heightMeasure]-a[varidConfig.heightMeasure]);
        sortedLegend.forEach((d,i)=>{
            const item = document.createElement('div'); item.className='bc-legend-item'; item.setAttribute('tabindex','0');
            const sw = document.createElement('div'); sw.className='bc-legend-color'; sw.style.background=colorForIndex(data.indexOf(d));
            const pct = (d[varidConfig.heightMeasure]/total)*100; const pctSpan=document.createElement('span'); pctSpan.className='bc-legend-pct'; pctSpan.textContent = (pct<3?pct.toFixed(1):pct.toFixed(0)).replace(/\.0$/,'')+'%';
            const labelSpan=document.createElement('span'); labelSpan.textContent = truncateLabel(d.label,18);
            item.appendChild(sw); item.appendChild(labelSpan); item.appendChild(pctSpan); legendEl.appendChild(item);
        });
        header.appendChild(legendEl);
    }
    
    container.appendChild(header);

    const chartWrapper = document.createElement('div'); chartWrapper.className='bc-chart-wrapper';
    const scrollHost = document.createElement('div'); scrollHost.className='bc-scroll';
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.classList.add('bc-svg'); svg.setAttribute('role','img'); svg.setAttribute('aria-label', `Bar chart showing ${data.length} categories`);
    scrollHost.appendChild(svg); chartWrapper.appendChild(scrollHost); container.appendChild(chartWrapper);
    
    // Section diff dédiée sous le chart
    const diffSection = document.createElement('div'); 
    diffSection.className = 'bc-diff-section';
    diffSection.innerHTML = '<div class="bc-diff-default">Sélectionnez 2 barres pour comparaison</div>';
    container.appendChild(diffSection);

    // 🔍 DEBUG - Mesurer sections réelles après render complet
    setTimeout(() => {
        const containerRect = container.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        const chartRect = chartWrapper.getBoundingClientRect();
        const diffRect = diffSection.getBoundingClientRect();
        
        console.log('📊 REAL DIMENSIONS DEBUG:');
        console.log('├── Container total:', containerRect.height, 'px');
        console.log('├── Header actual:', headerRect.height, 'px');
        console.log('├── Chart wrapper actual:', chartRect.height, 'px');
        console.log('├── Diff section actual:', diffRect.height, 'px');
        console.log('├── Sum check:', (headerRect.height + chartRect.height + diffRect.height), 'px');
        console.log('└── Missing space:', (containerRect.height - (headerRect.height + chartRect.height + diffRect.height)), 'px');
    }, 50);

    const footerTag = document.createElement('div'); footerTag.className='bc-footer-tag'; footerTag.textContent = `${data.length} cat.`; container.appendChild(footerTag);
    // Tooltip config & element
    const tooltipCfg = { variant: 'default', maxWidth: 220, fontSize: BC_FONT_SIZE, showRank: false, ...(options.tooltip||{}) };
    const tooltip = document.createElement('div'); tooltip.className='bc-tooltip'; tooltip.hidden=true; tooltip.classList.add(tooltipCfg.variant); tooltip.style.maxWidth = tooltipCfg.maxWidth+'px'; tooltip.style.fontSize = tooltipCfg.fontSize+'px'; container.appendChild(tooltip);

    // Gestion dataset vide ou toutes valeurs 0
    if(data.length===0){
        const empty = document.createElement('div'); empty.className='bc-empty'; empty.innerHTML = 'No data<br><span>Provide feeding input</span>'; container.appendChild(style); return container; }
    // Utiliser la mesure de hauteur configurée pour les calculs d'échelle
    const heightValues = data.map(d => d[varidConfig.heightMeasure] || 0);
    const maxValueRaw = Math.max(...heightValues);
    const allZero = maxValueRaw === 0;
    if(allZero){
        const empty = document.createElement('div'); empty.className='bc-empty'; empty.innerHTML = 'All values are zero<br><span>Awaiting new data</span>'; container.appendChild(style); container.appendChild(empty); return container; }

    // Injection style maintenant (taille sera fournie via options.width/height par le widget parent)
    container.appendChild(style);
    
    // 🔍 DÉTECTION INTELLIGENTE DES DIMENSIONS RÉELLES
    console.log('🔄 CENTRALIZED-16PX barChartRender v1.7.46.00 - Centralized font system: ALL text at 16px via --bc-font-size variable');
    
    let width = 0;
    let height = 0;
    let dimensionSource = 'unknown';
    
    // PRIORITÉ 1: Dimensions directes depuis args (les plus fiables)
    if (args.containerWidth && args.containerWidth > 60) {
        width = args.containerWidth;
        dimensionSource = 'args.containerWidth';
    }
    if (args.containerHeight && args.containerHeight > 60) {
        height = args.containerHeight;
        dimensionSource = dimensionSource === 'args.containerWidth' ? 'args.container' : 'args.containerHeight';
    }
    
    // PRIORITÉ 2: Dimensions depuis options si args non disponible
    if (width === 0 && typeof options.width === 'number' && options.width > 60) {
        width = options.width;
        dimensionSource = 'options.width';
    }
    if (height === 0 && typeof options.height === 'number' && options.height > 60) {
        height = options.height;
        dimensionSource = dimensionSource.includes('options') ? 'options' : 'options.height';
    }
    
    // 🚀 PRIORITÉ 3: NOUVEAU - Essayer de détecter les dimensions du container parent
    if (width === 0 || height === 0) {
        console.log('🔍 SMART DETECTION - Starting DOM scan for containers...');
        
        // PREMIÈRE APPROCHE : Explorer le DOM pour trouver les vraies classes
        console.log('🔍 DOM EXPLORATION - Scanning all possible containers...');
        
        // Chercher tous les DIVs avec des dimensions significatives
        const allDivs = document.querySelectorAll('div');
        const significantContainers = [];
        
        allDivs.forEach((div, index) => {
            const rect = div.getBoundingClientRect();
            if (rect.width > 300 && rect.height > 300) { // Containers potentiels
                significantContainers.push({
                    element: div,
                    rect: rect,
                    className: div.className,
                    id: div.id
                });
            }
        });
        
        console.log(`🔍 Found ${significantContainers.length} significant containers (>300x300px):`);
        
        // Afficher les premiers containers significatifs
        significantContainers.slice(0, 5).forEach((container, i) => {
            console.log(`🔍 Container ${i}:`, {
                className: container.className,
                id: container.id,
                dimensions: {width: container.rect.width, height: container.rect.height},
                tagName: container.element.tagName
            });
        });
        
        // Essayer d'utiliser le plus grand container trouvé
        if (significantContainers.length > 0) {
            // Trouver le container le plus approprié (pas trop grand, pas trop petit)
            const suitableContainer = significantContainers.find(c => 
                c.rect.width < 1200 && c.rect.height < 1200 && // pas trop grand
                c.rect.width > 400 && c.rect.height > 400      // pas trop petit
            ) || significantContainers[0]; // fallback au premier
            
            if (width === 0) {
                width = Math.max(suitableContainer.rect.width - 40, 300);
                dimensionSource = 'dom-scan-width';
            }
            if (height === 0) {
                height = Math.max(suitableContainer.rect.height - 40, 200);
                dimensionSource = dimensionSource.includes('dom-scan') ? 'dom-scan' : 'dom-scan-height';
            }
            
            console.log('🎯 SMART DETECTION - Selected from DOM scan:', {
                className: suitableContainer.className,
                id: suitableContainer.id,
                originalDimensions: {width: suitableContainer.rect.width, height: suitableContainer.rect.height},
                finalDimensions: {width: width, height: height},
                source: dimensionSource
            });
        } else {
            console.log('⚠️ SMART DETECTION - No suitable container found in DOM scan');
        }
        
        if (width === 0 || height === 0) {
            console.log('⚠️ SMART DETECTION - No suitable container found, using fallback');
        }
    }
    
    // PRIORITÉ 4: Essayer de détecter si on est dans un dashboard et ajuster les fallbacks
    const isDashboardContext = (typeof args.title === 'string' && args.title.includes('Demo Dataset')) || 
                               (typeof window !== 'undefined' && window.location && window.location.pathname.includes('index.html'));
    
    if (width === 0) {
        width = isDashboardContext ? 600 : 800; // Ajuster selon le contexte
        dimensionSource = 'fallback-width';
    }
    if (height === 0) {
        height = isDashboardContext ? 350 : 400; // Ajuster selon le contexte  
        dimensionSource = dimensionSource.includes('fallback') ? 'fallback' : 'fallback-height';
    }
    
    console.log('📊 DIMENSIONS RESOLUTION:', { 
        fromArgs: { width: args.containerWidth, height: args.containerHeight },
        fromOptions: { width: options.width, height: options.height },
        final: { width, height },
        source: dimensionSource,
        isDashboard: isDashboardContext
    });

    // Densité / calcul bar width
    const plotWidthInitial = width - yAxisWidth - 8; // marge droite min
    let barNominal = (plotWidthInitial / data.length) * 0.7;
    const dense = barNominal < 10 || data.length > 120; // condition mode dense
    const rotate70 = !dense && barNominal < 18;
    const rotate45 = !dense && !rotate70 && barNominal < 28;
    // ORDRE CORRIGÉ : xLabelArea calculé AVANT bottomReduction
    const xLabelArea = dense ? 4 : (rotate70 ? 25 : (rotate45 ? 18 : (ultra ? 8 : 12))); // Ultra-réduit
    const topMargin = ultra ? 2 : 4; // petit espace pour éviter le collage au bord
    // Réduction drastique du bottomMargin avec compensation élevée  
    const bottomReduction = dense ? 0 : (rotate70 ? 20 : (rotate45 ? 16 : (ultra ? 18 : 20)));
    const bottomMargin = ultra ? Math.max(2, xLabelArea - bottomReduction) : Math.max(4, xLabelArea - bottomReduction);
    const leftMargin = yAxisWidth;
    const rightMargin = ultra ? 6 : 8;
    const plotWidth = Math.max(10, width - leftMargin - rightMargin);
    const plotHeight = Math.max(10, height - topMargin - bottomMargin);

    // Calcul des largeurs de barres selon le mode (normal ou variwide)
    let barWidths = []; // Array pour stocker la largeur de chaque barre
    let totalBarsWidth = 0;
    let gap = 2; // Gap minimal entre barres
    
    console.log('🚀 BAR WIDTH CALCULATION START:', {
        variwidEnabled: varidConfig.enabled,
        heightMeasure: varidConfig.heightMeasure,
        widthMeasure: varidConfig.widthMeasure,
        dataLength: data.length
    });
    
    if (varidConfig.enabled) {
        // Mode Variwide : largeurs proportionnelles à la mesure de largeur
        const widthValues = data.map(d => d[varidConfig.widthMeasure] || 0);
        const totalWidthValue = widthValues.reduce((a, b) => a + b, 0);
        
        // ✨ LARGEUR CONSTANTE : Utiliser toute la largeur disponible (moins les gaps)
        const totalGapWidth = gap * (data.length + 1);
        const availableWidthForBars = plotWidth - totalGapWidth;
        
        console.log('📊 VARIWIDE MODE - Width calculation (constant total):', {
            enabled: varidConfig.enabled,
            widthMeasure: varidConfig.widthMeasure,
            plotWidth,
            totalGapWidth,
            availableWidthForBars,
            widthValues,
            totalWidthValue,
            minBarWidth: varidConfig.minBarWidth,
            maxBarWidth: varidConfig.maxBarWidth
        });
        
        if (totalWidthValue > 0) {
            // Calculer les largeurs proportionnelles utilisant TOUTE la largeur disponible
            const rawBarWidths = widthValues.map((value, index) => {
                const proportionalWidth = (value / totalWidthValue) * availableWidthForBars;
                return Math.max(varidConfig.minBarWidth, Math.min(proportionalWidth, varidConfig.maxBarWidth));
            });
            
            // ✨ REDISTRIBUTION pour maintenir largeur constante
            const currentTotal = rawBarWidths.reduce((a, b) => a + b, 0);
            const scaleFactor = availableWidthForBars / currentTotal;
            
            barWidths = rawBarWidths.map((width, index) => {
                const scaledWidth = width * scaleFactor;
                console.log(`📐 Bar ${index} width calc (constant total):`, {
                    widthValue: widthValues[index],
                    proportional: ((widthValues[index] / totalWidthValue) * availableWidthForBars).toFixed(2),
                    raw: width.toFixed(2),
                    scaled: scaledWidth.toFixed(2),
                    scaleFactor: scaleFactor.toFixed(3)
                });
                return scaledWidth;
            });
        } else {
            // Fallback si toutes les valeurs de largeur sont 0
            const noneWidth = availableWidthForBars / data.length;
            barWidths = new Array(data.length).fill(noneWidth);
        }
        
        totalBarsWidth = barWidths.reduce((a, b) => a + b, 0);
        
        console.log('📊 VARIWIDE RESULT - Final bar widths (constant total):', {
            barWidths: barWidths.map(w => w.toFixed(2)),
            totalBarsWidth: totalBarsWidth.toFixed(2),
            expectedTotal: availableWidthForBars.toFixed(2),
            totalWidthWithGaps: (totalBarsWidth + totalGapWidth).toFixed(2),
            plotWidth: plotWidth.toFixed(2)
        });
        
    } else {
        // Mode normal : largeurs égales (None)
        barNominal = (plotWidth / data.length) * 0.7;
        const barWidth = Math.min(Math.max(barNominal, dense?4:6), 48);
        barWidths = new Array(data.length).fill(barWidth);
        totalBarsWidth = barWidth * data.length;
        gap = (plotWidth - totalBarsWidth) / (data.length + 1);
        if (gap < 2) gap = 2;
    }
    
    // Virtual width si overflow
    let virtualWidth = plotWidth;
    const totalUsedWidth = totalBarsWidth + gap * (data.length + 1);
    if (totalUsedWidth > plotWidth) {
        virtualWidth = totalUsedWidth;
    }

    // Axes & ticks avec headroom minimal
    const {ticks, max: yMax} = computeTicks(maxValueRaw, plotHeight, ultra?0.01:0.02); // headroom ultra-minimal
    const scaleY = v => topMargin + (1 - (v / yMax)) * plotHeight;

    // Calculer les dimensions SVG AVANT les logs de debug
    const svgWidth = leftMargin + virtualWidth + rightMargin;
    const svgHeight = topMargin + plotHeight + bottomMargin;
    const optimizedHeight = ultra ? Math.max(svgHeight - 4, plotHeight + 1) : Math.max(svgHeight - 2, plotHeight + 2); // Réduction maximale

    // 🔍 DEBUG LOGS - Dimensions et calculs détaillés
    console.log('📊 BAR CHART DEBUG - Dimensions du widget:');
    console.log('├── Container dimensions:', { width, height });
    console.log('├── Ultra mode:', ultra);
    console.log('├── Legend enabled:', legendEnabled, 'Legend height:', legendHeight);
    console.log('├── Margins:', { topMargin, bottomMargin, leftMargin, rightMargin });
    console.log('├── Plot dimensions:', { plotWidth, plotHeight });
    console.log('├── xLabelArea:', xLabelArea, 'bottomReduction:', bottomReduction);
    console.log('├── Data:', { count: data.length, maxValueRaw, yMax });
    console.log('├── SVG dimensions:', { svgWidth, svgHeight, optimizedHeight });
    console.log('└── Dense mode:', dense);
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${optimizedHeight}`);
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', optimizedHeight);

    // Groupes
    const gridG = document.createElementNS('http://www.w3.org/2000/svg','g'); gridG.setAttribute('class','bc-grid');
    const axisYG = document.createElementNS('http://www.w3.org/2000/svg','g'); axisYG.setAttribute('class','bc-axis bc-axis-y');
    const axisXG = document.createElementNS('http://www.w3.org/2000/svg','g'); axisXG.setAttribute('class','bc-axis bc-axis-x');
    const barsG = document.createElementNS('http://www.w3.org/2000/svg','g'); barsG.setAttribute('class','bc-bars');
    const valuesG = document.createElementNS('http://www.w3.org/2000/svg','g'); valuesG.setAttribute('class','bc-values');

    // Grille + ticks Y
    ticks.forEach(t => {
        const y = scaleY(t);
        // grid line
        const gl = document.createElementNS('http://www.w3.org/2000/svg','line');
        gl.setAttribute('x1', leftMargin);
        gl.setAttribute('x2', leftMargin + virtualWidth);
        gl.setAttribute('y1', y);
        gl.setAttribute('y2', y);
        gridG.appendChild(gl);
        // tick label
        const tl = document.createElementNS('http://www.w3.org/2000/svg','text');
        tl.setAttribute('x', leftMargin - 4);
        tl.setAttribute('y', y + 3);
        tl.setAttribute('text-anchor','end');
        tl.setAttribute('class','bc-tick-label');
        tl.textContent = formatValue(t);
        axisYG.appendChild(tl);
    });
    // Axis baseline Y (vertical)
    const axisLineY = document.createElementNS('http://www.w3.org/2000/svg','line');
    axisLineY.setAttribute('x1', leftMargin);
    axisLineY.setAttribute('x2', leftMargin);
    axisLineY.setAttribute('y1', topMargin);
    axisLineY.setAttribute('y2', topMargin + plotHeight);
    axisYG.appendChild(axisLineY);

    // Axis X baseline
    const axisLineX = document.createElementNS('http://www.w3.org/2000/svg','line');
    const baseY = topMargin + plotHeight;
    axisLineX.setAttribute('x1', leftMargin);
    axisLineX.setAttribute('x2', leftMargin + virtualWidth);
    axisLineX.setAttribute('y1', baseY);
    axisLineX.setAttribute('y2', baseY);
    axisXG.appendChild(axisLineX);

    // Pré-calcul ranking (desc) pour tooltip optionnel - Utiliser la mesure de hauteur
    const rankMap = new Map();
    [...data].sort((a,b)=>(b[varidConfig.heightMeasure] || 0)-(a[varidConfig.heightMeasure] || 0)).forEach((d,i)=>{ if(!rankMap.has(d.label)) rankMap.set(d.label,i+1); });

    // Bars avec support variwide
    const total = data.reduce((a,b)=>a+(b[varidConfig.heightMeasure] || 0),0) || 1;
    let maxBarHeight = 0;
    let currentX = leftMargin + gap; // Position X courante
    
    // VERIFICATION: S'assurer que barWidths est bien défini
    console.log('🔍 CHECK barWidths array:', {
        barWidthsLength: barWidths?.length,
        dataLength: data.length,
        barWidthsArray: barWidths
    });
    
    data.forEach((d,i)=>{
        const barWidth = barWidths[i]; // Largeur spécifique à cette barre
        
        // SECURITE: Vérifier que barWidth n'est pas undefined
        if (barWidth === undefined || isNaN(barWidth)) {
            console.error(`❌ ERREUR: barWidth[${i}] est undefined ou NaN:`, barWidth);
        }
        const heightValue = d[varidConfig.heightMeasure] || 0;
        const widthValue = varidConfig.enabled ? (d[varidConfig.widthMeasure] || 0) : heightValue;
        
        // DEBUG: Tracer les largeurs pour chaque barre
        console.log(`📊 Bar ${i} (${d.label}):`, {
            barWidth,
            heightValue,
            widthValue,
            variwidEnabled: varidConfig.enabled,
            heightMeasure: varidConfig.heightMeasure,
            widthMeasure: varidConfig.widthMeasure
        });
        
        const h = (heightValue / yMax) * plotHeight;
        const y = topMargin + plotHeight - h;
        
        // Track tallest bar
        if (h > maxBarHeight) {
            maxBarHeight = h;
            console.log('🔍 Tallest bar so far:', d.label, 'height:', h, 'heightValue:', heightValue, 'widthValue:', widthValue, 'y-position:', y);
        }
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
        rect.setAttribute('x', currentX);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', h);
        
        // LOG: Vérifier que la largeur est bien appliquée au SVG
        console.log(`🎯 SVG Bar ${i} (${d.label}) - Applied width: ${barWidth}px at x: ${currentX}px`);
        rect.setAttribute('fill', colorForIndex(i));
        rect.setAttribute('class','bc-bar');
        rect.setAttribute('tabindex','0');
        rect.dataset.label = d.label;
        rect.dataset.value = String(heightValue); // Valeur de hauteur
        rect.dataset.value2 = String(widthValue); // Valeur de largeur
        rect.dataset.pct = ((heightValue/total)*100).toFixed(2);
        rect.dataset.rank = rankMap.get(d.label);
        barsG.appendChild(rect);
        
        // ✅ CORRECTION : Calculer le centre AVANT de mettre à jour currentX
        const barCenterX = currentX + barWidth/2;
        
        // Mettre à jour la position X pour la prochaine barre
        currentX += barWidth + gap;

        // Category label (si pas dense)
        if(!dense){
            const cat = document.createElementNS('http://www.w3.org/2000/svg','text');
            const fullLabel = d.label || '';
            const truncated = truncateLabel(fullLabel, rotate70?10:(rotate45?12:14));
            cat.textContent = truncated;
            const labelX = barCenterX; // ✅ Utiliser le centre calculé correctement
            cat.setAttribute('x', barCenterX);
            const catLabelYOffset = ultra ? -1 : (dense ? 0 : 1); // déplacement vers le haut en ultra
            cat.setAttribute('y', baseY + catLabelYOffset);
            cat.setAttribute('text-anchor','middle');
            cat.setAttribute('class','bc-cat-label');
            if (truncated !== fullLabel) cat.setAttribute('title', fullLabel);
            if (rotate70){
                cat.setAttribute('transform',`rotate(70 ${barCenterX} ${baseY + catLabelYOffset})`);
            } else if (rotate45){
                cat.setAttribute('transform',`rotate(45 ${barCenterX} ${baseY + catLabelYOffset})`);
            }
            axisXG.appendChild(cat);
        }

        // Value label adaptatif
        if(!dense){
            const inner = h >= 14; const above = !inner && h >= 8; if(inner || above){
                const vt = document.createElementNS('http://www.w3.org/2000/svg','text');
                vt.setAttribute('x', barCenterX); // ✅ Utiliser barCenterX calculé correctement
                vt.setAttribute('text-anchor','middle');
                vt.setAttribute('class','bc-value-label');
                vt.textContent = formatValue(heightValue);
                vt.setAttribute('y', inner ? (y + 12) : (y - 2));
                if(inner) vt.style.fill = '#FFFFFF';
                valuesG.appendChild(vt);
            }
        }
    });

    // Scroll hint si virtual
    if (virtualWidth > plotWidth){
        const hint = document.createElement('div'); hint.className='bc-scroll-hint'; hint.textContent='Scroll →'; chartWrapper.appendChild(hint);
        svg.setAttribute('width', leftMargin + virtualWidth + rightMargin);
    }

    svg.appendChild(gridG); svg.appendChild(axisYG); svg.appendChild(axisXG); svg.appendChild(barsG); svg.appendChild(valuesG);

    // 🔍 DEBUG LOGS - Résumé final des hauteurs
    console.log('📊 BAR CHART DEBUG - Hauteurs finales:');
    console.log('├── Max bar height:', maxBarHeight, 'px');
    console.log('├── Plot height:', plotHeight, 'px');
    console.log('├── SVG optimized height:', optimizedHeight, 'px');
    console.log('├── Bar height ratio:', (maxBarHeight/plotHeight*100).toFixed(1) + '%');
    console.log('├── Espaces vides potentiels:');
    console.log('│   ├── Au-dessus des bars:', (plotHeight - maxBarHeight), 'px');
    console.log('│   ├── Bottom margin:', bottomMargin, 'px');
    console.log('│   └── Top margin:', topMargin, 'px');
    console.log('└── Header estimé:', legendHeight, 'px (legend only)');

    // Tooltip interactions (delegation)
    const selection = [];// store selected rect elements (max 2)
    // Diff connector (SVG line overlay) - simple et discret
    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    svg.appendChild(defs);
    // Ligne de connexion simple et discrète - pointillés gris fins
    const diffPath = document.createElementNS('http://www.w3.org/2000/svg','path');
    diffPath.setAttribute('stroke','rgba(255,255,255,0.3)');
    diffPath.setAttribute('stroke-width','1.5');
    diffPath.setAttribute('stroke-dasharray','3,2');
    diffPath.setAttribute('fill','none');
    diffPath.setAttribute('class','bc-diff-line');
    diffPath.style.display='none';
    diffPath.setAttribute('stroke-linecap','round');
    svg.appendChild(diffPath);
    let diffReversed = false; // state for A<->B swap
    function formatDiffBlock(){
        const selectionOrdered = diffReversed ? [selection[1], selection[0]] : selection;
        const [a,b] = selectionOrdered.map(r=>({ label:r.dataset.label, value:Number(r.dataset.value) }));
        const diff = b.value - a.value; const pct = a.value!==0 ? (diff / a.value)*100 : 0;
        const trendColor = diff>=0 ? 'var(--positive-trend,#36A41D)' : 'var(--negative-trend,#EE3939)';
        const sign = diff>=0 ? '+' : '';
        return `<div class="bc-diff-content">
                    <div class="bc-diff-inline">
                        <span>Comparaison</span>
                        <button class="bc-diff-swap" title="Inverser la comparaison">⇄</button>
                        <span>${a.label} → ${b.label}</span>
                        <span class="bc-diff-separator">•</span>
                        <span>${formatValue(a.value)} → ${formatValue(b.value)}</span>
                        <span class="bc-diff-separator">•</span>
                        <span style="color:${trendColor};">${sign}${formatValue(diff)} (${sign}${pct.toFixed(1).replace(/\.0$/,'')}%)</span>
                    </div>
                </div>`;
    }
    function updateDiffArtifacts(){
        if(selection.length===0){
            diffPath.classList.remove('visible');
            diffPath.style.display='none'; 
            diffSection.innerHTML = '<div class="bc-diff-default">Sélectionnez 2 barres pour comparaison</div>';
            return;
        }
        
        if(selection.length===1){
            diffPath.classList.remove('visible');
            diffPath.style.display='none';
            // Afficher les informations de la barre sélectionnée
            const selected = selection[0];
            const label = selected.dataset.label;
            const value = Number(selected.dataset.value);
            const pct = Number(selected.dataset.pct);
            const rank = Number(selected.dataset.rank);
            diffSection.innerHTML = `<div class="bc-diff-content">
                <div class="bc-diff-inline">
                    <span style="font-weight:600; color:var(--text-primary,#EAECEE);">Sélection: ${label}</span>
                    <span class="bc-diff-separator">•</span>
                    <span class="bc-diff-values">Valeur: ${formatValue(value)}</span>
                    <span class="bc-diff-separator">•</span>
                    <span class="bc-diff-values">Part: ${pct.toFixed(1).replace(/\.0$/,'')}%</span>
                    <span class="bc-diff-separator">•</span>
                    <span class="bc-diff-values">Rang: #${rank}</span>
                </div>
            </div>`;
            return;
        }
        
        if(selection.length!==2){ 
            return; 
        }
        
        const selectionOrdered = diffReversed ? [selection[1], selection[0]] : selection;
        const [r1,r2] = selectionOrdered;

        // Compute centers & tops
        const x1 = parseFloat(r1.getAttribute('x')) + parseFloat(r1.getAttribute('width'))/2;
        const x2 = parseFloat(r2.getAttribute('x')) + parseFloat(r2.getAttribute('width'))/2;
        const y1 = parseFloat(r1.getAttribute('y'));
        const y2 = parseFloat(r2.getAttribute('y'));
        
        // Path is always drawn left-to-right for consistency
        const fromLeft = x1 <= x2;
        const xa = fromLeft ? x1 : x2; const ya = fromLeft ? y1 : y2;
        const xb = fromLeft ? x2 : x1; const yb = fromLeft ? y2 : y1;

        // Horizontal segment above both bars - plus discret
        const tallestTop = Math.min(ya, yb);
        const lift = 15; // réduit pour plus de discrétion
        const topRise = Math.max(4, tallestTop - lift);
        
        // Path: up from A to topRise, horizontal to above B, down to B
        const d = `M ${xa} ${ya} L ${xa} ${topRise} L ${xb} ${topRise} L ${xb} ${yb}`;
        diffPath.setAttribute('d', d);
        
        // Affichage simple sans animation
        diffPath.style.display='block';
        diffPath.classList.add('visible');
        
        // Mettre à jour la section diff dédiée
        diffSection.innerHTML = formatDiffBlock();
    }

    function toggleSelection(rect){
        const already = selection.indexOf(rect);
        if(already>=0){
            // Désélection: retirer toutes les classes de sélection
            rect.classList.remove('selected','selected-alt'); 
            selection.splice(already,1); 
            updateSelectionStyles(); 
            updateDiffArtifacts(); 
            return;
        }
        if(selection.length===2){ 
            const removed = selection.shift(); 
            removed.classList.remove('selected','selected-alt'); 
        }
        selection.push(rect); 
        updateSelectionStyles(); 
        updateDiffArtifacts();
    }
    function updateSelectionStyles(){
        // D'abord nettoyer toutes les barres
        document.querySelectorAll('.bc-bar.selected, .bc-bar.selected-alt').forEach(bar => {
            bar.classList.remove('selected', 'selected-alt');
        });
        // Puis appliquer les classes seulement aux barres sélectionnées
        selection.forEach((r,i) => { 
            r.classList.add(i===0?'selected':'selected-alt'); 
        });
    }

    function showTip(evt, target){
        const label = target.dataset.label || '';
        const value = Number(target.dataset.value||0);
        const value2 = Number(target.dataset.value2||0);
        const pct = Number(target.dataset.pct||0);
        const rank = Number(target.dataset.rank||0);
        const pctTxt = pct.toFixed(pct<3?1:0).replace(/\.0$/,'');
        
        let baseHtml;
        if(varidConfig.enabled) {
            // Mode variwide : afficher les deux mesures avec noms business
            const heightLabel = varidConfig.labels[varidConfig.heightMeasure];
            const widthLabel = varidConfig.labels[varidConfig.widthMeasure];
            const heightValue = varidConfig.heightMeasure === 'value' ? value : value2;
            const widthValue = varidConfig.widthMeasure === 'value' ? value : value2;
            
            if(tooltipCfg.variant==='minimal'){
                baseHtml = `${tooltipCfg.showRank?`<span class="bc-rank">#${rank}</span>`:''}${label}<br>📏 ${heightValue}<br>📐 ${widthValue}`;
            } else {
                baseHtml = `${tooltipCfg.showRank?`<span class="bc-rank">#${rank}</span>`:''}<strong>${label}</strong>
                    <div class="bc-line"><strong>📏 ${heightLabel}:</strong> ${formatValue(heightValue)} (${pctTxt}%)</div>
                    <div class="bc-line"><strong>📐 ${widthLabel}:</strong> ${formatValue(widthValue)}</div>`;
            }
        } else {
            // Mode normal : afficher uniquement la mesure principale
            if(tooltipCfg.variant==='minimal'){
                baseHtml = `${tooltipCfg.showRank?`<span class="bc-rank">#${rank}</span>`:''}${label}: ${formatValue(value)} (${pctTxt}%)`;
            } else {
                baseHtml = `${tooltipCfg.showRank?`<span class="bc-rank">#${rank}</span>`:''}<strong>${label}</strong><div class="bc-line">${formatValue(value)} (${pctTxt}%)</div>`;
            }
        }
        tooltip.innerHTML = baseHtml;
        tooltip.hidden=false; tooltip.classList.add('fade-in');
        const bounds = container.getBoundingClientRect();
        const tx = evt.clientX - bounds.left + 12; const ty = evt.clientY - bounds.top + 8;
        const tw = tooltip.offsetWidth; const th = tooltip.offsetHeight;
        tooltip.style.left = Math.min(bounds.width - tw - 4, tx)+'px';
        tooltip.style.top = Math.min(bounds.height - th - 4, ty)+'px';
        target.classList.add('active');
    }
    function hideTip(target){ tooltip.hidden=true; tooltip.classList.remove('fade-in'); if(target) target.classList.remove('active'); }
    // Hover fade logic
    let lastHover = null;
    svg.addEventListener('pointermove', e=>{
        const t = e.target;
        if(t && t.classList && t.classList.contains('bc-bar')){
            if(lastHover!==t){ if(lastHover) lastHover.classList.remove('hovered'); lastHover = t; t.classList.add('hovered'); }
            // Apply fade only to non-selected bars
            barsG.classList.add('hover-mode');
            showTip(e,t);
        } else {
            if(lastHover){ lastHover.classList.remove('hovered'); lastHover=null; }
            barsG.classList.remove('hover-mode');
            hideTip(document.querySelector('.bc-bar.active'));
        }
    });
    svg.addEventListener('pointerleave', ()=>{
        if(lastHover){ lastHover.classList.remove('hovered'); lastHover=null; }
        barsG.classList.remove('hover-mode');
        hideTip(document.querySelector('.bc-bar.active'));
    });
    svg.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ const t=e.target; if(t && t.classList.contains('bc-bar')){ e.preventDefault(); showTip(e,t);} } });
    svg.addEventListener('focusout', e=>{ const related = e.relatedTarget; if(!related || !related.classList || !related.classList.contains('bc-bar')) hideTip(document.querySelector('.bc-bar.active')); });

    // Selection interactions
    svg.addEventListener('click', e=>{ const t=e.target; if(t && t.classList && t.classList.contains('bc-bar')){ toggleSelection(t); if(selection.length===1){ showTip(e,t);} }});
    svg.addEventListener('keydown', e=>{ if((e.key==='Enter'|| e.key===' ') && e.target && e.target.classList && e.target.classList.contains('bc-bar')){ toggleSelection(e.target); if(selection.length===1){ showTip(e,e.target); } }});

    // Diff section interaction pour le bouton swap
    diffSection.addEventListener('click', e => {
        if (e.target.classList.contains('bc-diff-swap')) {
            e.stopPropagation();
            diffReversed = !diffReversed;
            updateDiffArtifacts();
        }
    });

    // Reposition diff artifacts sur scroll horizontal - plus besoin car section fixe
    // Gardons juste l'animation de la ligne
    let diffRaf = null;
    scrollHost.addEventListener('scroll', ()=>{
        if(selection.length!==2) return; 
        if(diffRaf) return; 
        diffRaf = requestAnimationFrame(()=>{ 
            diffRaf=null; 
            // Plus besoin de repositionner car la section est fixe
            // On garde juste l'animation de la ligne si nécessaire
        });
    });

    // Gestion simple du scroll - pas d'effets visuels
    // La ligne reste stable et discrète

    // Plus de phase temporaire : rendu direct
    return container;
});

// ====================================================================
// 🔌 WIDGET CLASS WITH FEEDING INTERFACE
// ====================================================================

class BarChartWidgetUnified extends HTMLElement {
    static get metadataSchema() {
        return BAR_CHART_WIDGET_DEFINITION.metadataSchema;
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.widgetId = this.getAttribute('widget-id') || 'bar-chart-' + Date.now();
        this.isDemo = true; // Mode démo par défaut
        this.feedingData = null; // Données externes via feeding
        
        console.log('📊 BAR CHART: Widget instance created:', this.widgetId);
    }
    
    connectedCallback() {
        console.log('📊 BAR CHART: Widget connected to DOM');
        this.render();
        this.#initResizeObserver();
    }

    // ================================================================
    // 🔄 INTERFACE DE FEEDING - Séparée du dataset démo
    // ================================================================
    
    setFeedingData(data) {
        console.log('📊 BAR CHART: Receiving feeding data:', data);
        this.feedingData = data;
        this.isDemo = false;
        this.render();
    }
    
    clearFeedingData() {
        console.log('📊 BAR CHART: Clearing feeding data, reverting to demo');
        this.feedingData = null;
        this.isDemo = true;
        this.render();
    }
    
    getFeedingStatus() {
        return {
            hasData: this.feedingData !== null,
            isDemo: this.isDemo,
            dataSource: this.isDemo ? 'demo-dataset' : 'external-feeding'
        };
    }

    // ================================================================
    // 🔄 COMPATIBILITY - Alias pour updateData
    // ================================================================
    
    updateData(data) {
        console.log('📊 BAR CHART: updateData called (forwarding to setFeedingData):', data);
        this.setFeedingData(data);
    }

    // ================================================================
    // 📊 LOGIQUE DE DONNÉES - Priorise feeding > demo
    // ================================================================
    
    getDisplayData() {
        if (this.feedingData && Array.isArray(this.feedingData)) {
            console.log('📊 BAR CHART: Using feeding data');
            return this.feedingData;
        }
        
        console.log('📊 BAR CHART: Using demo dataset');
        return BAR_CHART_DEMO_DATASET.data;
    }

    // ================================================================
    // 🎨 RENDU VISUEL
    // ================================================================
    
    render() {
        console.log('🔄 ENHANCED RENDER v1.7.30.57 - Starting dimension detection strategy');
        const data = this.getDisplayData();
        const dataSource = this.isDemo ? 'Demo Dataset' : 'External Data';
        
        // STRATÉGIE MULTIPLE pour obtenir les vraies dimensions
        const hostRect = this.getBoundingClientRect();
        const parentRect = this.parentElement ? this.parentElement.getBoundingClientRect() : null;
        
        let finalWidth = 0;
        let finalHeight = 0;
        let dimensionSource = 'none';
        
        // Essayer différentes sources de dimensions par ordre de priorité
        if (hostRect.width > 60 && hostRect.height > 60) {
            finalWidth = hostRect.width;
            finalHeight = hostRect.height;
            dimensionSource = 'host-element';
        } else if (parentRect && parentRect.width > 60 && parentRect.height > 60) {
            // Utiliser les dimensions du parent avec marge de sécurité
            finalWidth = parentRect.width - 20; // marge de 10px de chaque côté
            finalHeight = parentRect.height - 20;
            dimensionSource = 'parent-element';
        } else {
            // Dernier recours : chercher dans les containers parents
            let current = this.parentElement;
            let attempts = 0;
            while (current && attempts < 5) {
                const rect = current.getBoundingClientRect();
                if (rect.width > 60 && rect.height > 60) {
                    finalWidth = Math.max(rect.width - 40, 300); // marge plus large
                    finalHeight = Math.max(rect.height - 40, 200);
                    dimensionSource = `ancestor-${attempts}`;
                    break;
                }
                current = current.parentElement;
                attempts++;
            }
        }
        
        const useRealDimensions = finalWidth > 60 && finalHeight > 60;
        
        // 🔍 DEBUG - Afficher les dimensions détectées
        console.log('📊 HOST DIMENSIONS DEBUG (Enhanced):', {
            hostRect: {width: hostRect.width, height: hostRect.height},
            parentRect: parentRect ? {width: parentRect.width, height: parentRect.height} : null,
            finalDimensions: {width: finalWidth, height: finalHeight},
            useRealDimensions: useRealDimensions,
            dimensionSource: dimensionSource,
            dataSource: dataSource
        });
        
        const renderedElement = barChartRender({
            json: data,
            title: `📊 Raphael Bar Chart 1 (${dataSource})`,
            // PASSER LES DIMENSIONS DÉTECTÉES
            containerWidth: useRealDimensions ? finalWidth : undefined,
            containerHeight: useRealDimensions ? finalHeight : undefined,
            options: { 
                width: useRealDimensions ? finalWidth : undefined, 
                height: useRealDimensions ? finalHeight : undefined,
                tooltip: { variant: 'compact', maxWidth: 220, fontSize: BC_FONT_SIZE, showRank: true }
            }
        });
        
        // Si les dimensions ne sont toujours pas disponibles, réessayer avec plusieurs tentatives
        if (!useRealDimensions) {
            const retryRender = (attempt = 1) => {
                if (attempt > 3) return; // Max 3 tentatives
                
                setTimeout(() => {
                    const newHostRect = this.getBoundingClientRect();
                    const newParentRect = this.parentElement ? this.parentElement.getBoundingClientRect() : null;
                    
                    if ((newHostRect.width > 60 && newHostRect.height > 60) || 
                        (newParentRect && newParentRect.width > 60 && newParentRect.height > 60)) {
                        console.log(`📊 DELAYED RENDER (attempt ${attempt}) with dimensions:`, {
                            host: {width: newHostRect.width, height: newHostRect.height},
                            parent: newParentRect ? {width: newParentRect.width, height: newParentRect.height} : null
                        });
                        this.render(); // Re-render avec les vraies dimensions
                    } else {
                        retryRender(attempt + 1); // Réessayer
                    }
                }, attempt * 25); // Délai croissant: 25ms, 50ms, 75ms
            };
            
            retryRender();
        }
        
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(renderedElement);
    }

    #initResizeObserver(){
        if (this._resizeObs) return;
        if (typeof ResizeObserver === 'undefined') return; // environnement legacy
        this._resizeObs = new ResizeObserver(entries => {
            if (!entries || !entries.length) return;
            // Debounce via rAF
            if (this._resizeScheduled) return;
            this._resizeScheduled = true;
            requestAnimationFrame(()=> { this._resizeScheduled = false; this.render(); });
        });
        this._resizeObs.observe(this);
    }

    // ================================================================
    // 📋 PROPRIÉTÉS PUBLIQUES
    // ================================================================

    getWidgetInfo() {
        return {
            id: this.widgetId,
            type: 'bar-chart',
            version: '1.0.0',
            title: 'Bar Chart v1.0',
            dataSource: this.isDemo ? 'demo' : 'feeding',
            status: 'active'
        };
    }

    // API de données pour debugging
    getDataSummary() {
        const data = this.getDisplayData();
        return {
            source: this.isDemo ? 'demo-dataset' : 'external-feeding',
            rowCount: data ? data.length : 0,
            hasData: data && data.length > 0,
            sampleData: data ? data.slice(0, 2) : null
        };
    }
}

// ====================================================================
// 🔌 REGISTRATION & EXPORT  
// ====================================================================
// Version: CENTRALIZED-16PX-v1.7.46.00 (VARIABLE CENTRALIZED FONTS!)  
// Timestamp: 2025-09-24T17:46:00.000Z - CENTRALIZED VARIABLE SYSTEM: ALL FONTS = 16px

BAR_CHART_WIDGET_DEFINITION.class = BarChartWidgetUnified;
BAR_CHART_WIDGET_DEFINITION.render = barChartRender;

// Vérifier si le custom element n'est pas déjà défini
if (!customElements.get('bar-chart-widget-unified')) {
    customElements.define('bar-chart-widget-unified', BarChartWidgetUnified);
    console.log('✅ BAR CHART: Custom element registered');
} else {
    console.log('⚠️ BAR CHART: Custom element already registered, skipping');
}

if (typeof window !== 'undefined') {
    window.BAR_CHART_WIDGET_DEFINITION = BAR_CHART_WIDGET_DEFINITION;
    window.BarChartWidgetUnified = BarChartWidgetUnified;
    window.barChartRender = barChartRender;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BAR_CHART_WIDGET_DEFINITION,
        BarChartWidgetUnified,
        render: barChartRender
    };
}

console.log('📊 Bar Chart Widget loaded:', BAR_CHART_WIDGET_DEFINITION.name, BAR_CHART_WIDGET_DEFINITION.version);