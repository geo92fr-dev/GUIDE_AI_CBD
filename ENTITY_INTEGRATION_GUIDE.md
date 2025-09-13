# 🚀 Guide d'Intégration WidgetEntity - Quick Start

## TL;DR - Intégration Rapide

### 1. Chargement Automatique (Recommandé)
```html
<!-- Ajoutez cette ligne dans votre HTML -->
<script src="src/entity-system-loader.js"></script>
<!-- Le système se charge automatiquement et propose la migration -->
```

### 2. Utilisation Immédiate
```javascript
// Le système est disponible globalement
const { widgetManager, entityRenderer } = window.WidgetEntitySystem;

// Créer une entité
const entity = await widgetManager.create({
    type: 'bar-chart',
    title: 'Mon Graphique'
});

// L'afficher sur le canvas
const canvas = document.querySelector('dashboard-canvas-entity');
await canvas.addEntity(entity);
```

## 📋 Checklist de Migration

### Phase 1: Préparation (5 min)
- [ ] Sauvegarder votre projet actuel
- [ ] Vérifier que les nouveaux fichiers sont présents :
  - [ ] `src/core/widget-entity.js`
  - [ ] `src/core/widget-manager.js` 
  - [ ] `src/core/widget-repository.js`
  - [ ] `src/core/entity-renderer.js`
  - [ ] `src/components/dashboard-canvas-entity.js`
  - [ ] `src/core/entity-migration-helper.js`
  - [ ] `src/entity-system-loader.js`

### Phase 2: Intégration (2 min)
- [ ] Ajouter `<script src="src/entity-system-loader.js"></script>` à votre HTML
- [ ] Recharger la page
- [ ] Accepter la migration automatique si proposée
- [ ] Vérifier que `window.WidgetEntitySystem` est disponible

### Phase 3: Validation (3 min)
- [ ] Tester la création de widgets
- [ ] Vérifier le drag & drop
- [ ] Valider le système Apply button
- [ ] Confirmer la persistance des données

## 🎯 Scénarios d'Usage

### Scénario 1: Nouveau Projet
```javascript
// 1. Le système se charge automatiquement
// 2. Canvas Entity disponible immédiatement
const canvas = document.querySelector('dashboard-canvas-entity');

// 3. Utilisation normale
await canvas.addEntity({
    type: 'pie-chart',
    title: 'New Pie Chart'
});
```

### Scénario 2: Projet Existant avec Widgets
```javascript
// 1. Le loader détecte les widgets existants
// 2. Propose la migration automatique
// 3. Après migration, tous les widgets deviennent des entités
// 4. Fonctionnalité identique mais architecture robuste
```

### Scénario 3: Migration Manuelle
```javascript
// Si vous préférez contrôler la migration
const migrationHelper = window.WidgetEntitySystem.migrationHelper;

// Migrer widgets spécifiques
const entities = await migrationHelper.migrateWidgetsToEntities(yourWidgets);

// Ou migration complète
const result = await migrationHelper.performFullMigration({
    preserveData: true,
    backupData: true
});
```

## 🔧 API Essentielle

### WidgetManager
```javascript
const manager = window.WidgetEntitySystem.widgetManager;

// CRUD
const entity = await manager.create({ type: 'bar-chart', title: 'Chart' });
const retrieved = await manager.get(entity.id);
await manager.update(entity.id, { title: 'Updated Chart' });
await manager.delete(entity.id);

// Data Binding
await manager.applyDataBinding(entity.id, {
    dimensions: [{ field: 'Month', type: 'dimension' }],
    measures: [{ field: 'Sales', type: 'measure' }]
});

// Bulk Operations
const allEntities = await manager.getAll();
await manager.deleteMany(['id1', 'id2']);
```

### Canvas Entity
```javascript
const canvas = document.querySelector('dashboard-canvas-entity');

// Gestion d'entités
await canvas.addEntity(config);
await canvas.removeEntity(entityId);
await canvas.updateEntityDataBinding(entityId, binding);

// État
const entities = canvas.getEntities();
const entity = canvas.getEntity(entityId);
const stats = canvas.getStats();
```

### EntityRenderer
```javascript
const renderer = window.WidgetEntitySystem.entityRenderer;

// Rendu
await renderer.render(entity, containerElement);
await renderer.rerender(entityId);

// Cache
renderer.removeFromCache(entityId);
renderer.clearCache();
const stats = renderer.getStats();
```

## 🐛 Debugging et Troubleshooting

### Vérifier le Système
```javascript
// État du système
console.log('Entity System:', window.WidgetEntitySystem);
console.log('Loading State:', window.EntitySystemLoadingState);

// Statistiques de migration
const migrationStats = window.WidgetEntitySystem.migrationHelper.getMigrationStats();
console.log('Migration Stats:', migrationStats);

// État du canvas
const canvas = document.querySelector('dashboard-canvas-entity');
console.log('Canvas Stats:', canvas.getStats());
```

### Erreurs Courantes

#### 1. "WidgetEntity is not defined"
```javascript
// Solution: Vérifier le chargement
if (!window.WidgetEntitySystem) {
    console.error('Entity system not loaded');
    // Rechargement manuel
    await window.loadWidgetEntitySystem();
}
```

#### 2. "Canvas not found"
```javascript
// Solution: Vérifier la migration
const canvas = document.querySelector('dashboard-canvas-entity');
if (!canvas) {
    console.log('Canvas not migrated yet');
    // Migration manuelle
    const newCanvas = migrationHelper.replaceCanvasWithEntityVersion();
}
```

#### 3. "Widgets not migrating"
```javascript
// Solution: Migration forcée
const oldCanvas = document.querySelector('dashboard-canvas');
if (oldCanvas && oldCanvas.widgets) {
    const result = await migrationHelper.migrateWidgetsToEntities(oldCanvas.widgets);
    console.log('Migration result:', result);
}
```

### Logs de Debug
```javascript
// Activer les logs détaillés
localStorage.setItem('debug_entity_system', 'true');

// Désactiver
localStorage.removeItem('debug_entity_system');
```

## 🎨 Personalisation

### Templates Custom
```javascript
// Ajouter un template personnalisé
const entity = await widgetManager.create({
    type: 'custom-chart',
    title: 'My Custom Chart'
});

// Modifier le code source
entity.rendering.sourceCode = `
    <div class="custom-widget">
        <h3>{{title}}</h3>
        <div class="custom-content">Custom rendering here</div>
    </div>
`;

// CSS custom
entity.rendering.customCSS = `
    .custom-widget {
        background: linear-gradient(45deg, #1B90FF, #00FF88);
        border-radius: 12px;
        padding: 20px;
    }
`;

await widgetManager.save(entity);
```

### Événements Custom
```javascript
// Écouter les événements d'entité
document.addEventListener('entityCreated', (e) => {
    console.log('New entity:', e.detail.entity);
});

document.addEventListener('entityUpdated', (e) => {
    console.log('Updated entity:', e.detail.entity);
});

document.addEventListener('entityDeleted', (e) => {
    console.log('Deleted entity:', e.detail.entityId);
});
```

## 📊 Performance et Monitoring

### Métriques en Temps Réel
```javascript
// Statistiques globales
setInterval(() => {
    const stats = {
        entities: canvas.getStats(),
        renderer: renderer.getStats(),
        manager: widgetManager.getStats()
    };
    console.log('System Stats:', stats);
}, 5000);
```

### Optimisation
```javascript
// Optimisation du rendu
const renderer = window.WidgetEntitySystem.entityRenderer;

// Désactiver le cache en développement
renderer.clearCache();

// Optimiser le re-rendu
await renderer.rerender(entityId); // Au lieu de render complet
```

## 🔄 Rollback (si nécessaire)

### Restauration Rapide
```javascript
// 1. Récupérer le backup automatique
const backups = Object.keys(localStorage)
    .filter(key => key.startsWith('widget_backup_'))
    .map(key => ({
        key,
        data: JSON.parse(localStorage.getItem(key)),
        timestamp: new Date(JSON.parse(localStorage.getItem(key)).timestamp)
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

const latestBackup = backups[0];
console.log('Latest backup:', latestBackup);

// 2. Restaurer manuellement si nécessaire
// (Retirer le script entity-system-loader.js et recharger)
```

## ✅ Validation de l'Intégration

### Tests de Fumée
```javascript
// Test complet du système
async function validateEntitySystem() {
    try {
        // 1. Vérifier la disponibilité
        if (!window.WidgetEntitySystem) throw new Error('System not loaded');
        
        // 2. Test CRUD
        const entity = await widgetManager.create({
            type: 'bar-chart',
            title: 'Test Chart'
        });
        
        const retrieved = await widgetManager.get(entity.id);
        if (retrieved.id !== entity.id) throw new Error('CRUD failed');
        
        // 3. Test rendu
        const canvas = document.querySelector('dashboard-canvas-entity');
        await canvas.addEntity(entity);
        
        // 4. Test data binding
        await canvas.updateEntityDataBinding(entity.id, {
            dimensions: [{ field: 'test', type: 'dimension' }]
        });
        
        // 5. Nettoyage
        await canvas.removeEntity(entity.id);
        
        console.log('✅ Entity system validation passed');
        return true;
        
    } catch (error) {
        console.error('❌ Entity system validation failed:', error);
        return false;
    }
}

// Exécuter la validation
validateEntitySystem();
```

---

## 🎉 Félicitations !

Votre système de widgets est maintenant équipé de l'architecture WidgetEntity robuste et scalable !

**Prochaines étapes recommandées :**
1. Explorer la [documentation complète](WIDGET_ENTITY_ARCHITECTURE.md)
2. Personnaliser les templates selon vos besoins
3. Implémenter des widgets custom
4. Configurer le monitoring en production

**Support :** Toutes les fonctionnalités existantes continuent de fonctionner avec une architecture plus robuste sous le capot.