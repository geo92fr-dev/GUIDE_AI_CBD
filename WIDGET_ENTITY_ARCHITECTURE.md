# 🏗️ WidgetEntity Architecture Documentation

## Vue d'ensemble

L'architecture WidgetEntity représente une évolution majeure du système de widgets, transformant des objets simples en entités complètes avec métadonnées, sérialisation, rendu autonome et gestion avancée du cycle de vie.

## 🎯 Objectifs de l'Architecture

### Avant (Simple Widget Objects)
```javascript
const widget = {
    id: "widget_123",
    type: "bar-chart", 
    title: "My Chart",
    dataConfig: { dimensions: [], measures: [] }
};
```

### Après (WidgetEntity System)
```javascript
const entity = new WidgetEntity({
    id: "widget_123",
    type: "bar-chart",
    title: "My Chart"
});
// + Métadonnées complètes
// + Data binding structuré  
// + Code source embarqué
// + Sérialisation automatique
// + Gestion d'état avancée
```

## 🧩 Composants de l'Architecture

### 1. Core Classes (`src/core/`)

#### 📦 `WidgetEntity` (`widget-entity.js`)
**Responsabilité** : Classe centrale représentant une entité widget complète

**Propriétés principales** :
- `identity` : ID, type, titre, description, catégorie
- `metadata` : Timestamps, version, tags, auteur
- `dataBinding` : Dimensions, mesures, filtres, configuration
- `layout` : Taille, position, contraintes, responsive
- `rendering` : Code source, template, CSS, interactivité
- `state` : Loading, erreur, état de validation
- `performance` : Métriques de rendu et performance

**Méthodes clés** :
- `serialize()` / `deserialize()` : Sérialisation JSON bidirectionnelle
- `clone()` : Clonage profond avec nouvel ID
- `validate()` : Validation de l'intégrité de l'entité
- `addDimension()` / `addMeasure()` : Gestion des bindings de données
- `setLoading()` / `setError()` : Gestion d'état

#### 🎛️ `WidgetManager` (`widget-manager.js`)
**Responsabilité** : Gestionnaire CRUD et coordination du cycle de vie des entités

**Fonctionnalités** :
- **CRUD Operations** : Create, Read, Update, Delete des entités
- **Data Binding** : Application des configurations de données
- **Serialization** : Import/export de packages d'entités
- **Event System** : Émission d'événements de cycle de vie
- **Bulk Operations** : Opérations en lot sur plusieurs entités

**Méthodes principales** :
```javascript
const manager = new WidgetManager();
await manager.create(config);           // Créer entité
await manager.get(id);                  // Récupérer entité
await manager.update(id, changes);      // Mettre à jour
await manager.delete(id);               // Supprimer
await manager.applyDataBinding(id, binding); // Appliquer données
```

#### 💾 `WidgetRepository` (`widget-repository.js`)
**Responsabilité** : Couche de persistance abstraite multi-backend

**Implémentations** :
- `LocalStorageWidgetRepository` : Stockage localStorage avec indexation
- `IndexedDBWidgetRepository` : Stockage robuste IndexedDB
- `WidgetRepositoryFactory` : Factory pour instanciation simple

**Interface unifiée** :
```javascript
const repository = WidgetRepositoryFactory.create('localStorage');
await repository.save(entity);
await repository.findById(id);
await repository.findByType(type);
await repository.getAll();
```

#### 🎨 `EntityRenderer` (`entity-renderer.js`)
**Responsabilité** : Moteur de rendu pour les entités basé sur leur code source

**Fonctionnalités** :
- **Template Processing** : Substitution de variables dans les templates
- **Data Binding Rendering** : Rendu des états de données connectées
- **CSS Scoping** : Application de CSS scopé par entité
- **Interactivity** : Initialisation des interactions widget-spécifiques
- **Error Handling** : Rendu des états d'erreur
- **Caching** : Cache des widgets rendus pour performance

**Workflow de rendu** :
```javascript
const renderer = new EntityRenderer();
await renderer.render(entity, containerElement);
// 1. Génère HTML depuis entity.rendering.sourceCode
// 2. Applique data binding si disponible  
// 3. Inject CSS custom scopé
// 4. Initialise interactivité
// 5. Cache le résultat
```

### 2. Components (`src/components/`)

#### 🎨 `DashboardCanvasEntity` (`dashboard-canvas-entity.js`)
**Responsabilité** : Canvas de rendu entièrement basé sur les entités

**Évolutions par rapport au canvas original** :
- Utilise `entities[]` au lieu de `widgets[]`
- Intégration native avec `WidgetManager` et `EntityRenderer`
- Gestion automatique du cycle de vie des entités
- Rendu asynchrone avec `EntityRenderer`
- Persistance automatique via `WidgetRepository`

**API principale** :
```javascript
const canvas = document.querySelector('dashboard-canvas-entity');

// Ajouter entité
await canvas.addEntity({
    type: 'bar-chart',
    title: 'New Chart'
});

// Mettre à jour data binding
await canvas.updateEntityDataBinding(entityId, {
    dimensions: [field1],
    measures: [field2]
});

// Statistiques
const stats = canvas.getStats();
```

### 3. Migration & Helpers (`src/core/`)

#### 🔄 `EntityMigrationHelper` (`entity-migration-helper.js`)
**Responsabilité** : Migration automatique des widgets simples vers entités

**Fonctionnalités** :
- **Widget to Entity** : Conversion automatique avec préservation des données
- **Source Code Generation** : Génération de templates par type de widget
- **Full Migration Workflow** : Migration complète avec backup
- **Canvas Replacement** : Remplacement automatique du canvas
- **Compatibility Checking** : Vérification des classes disponibles

**Migration workflow** :
```javascript
const helper = new EntityMigrationHelper();

// Migration complète automatique
const result = await helper.performFullMigration({
    canvasSelector: 'dashboard-canvas',
    preserveData: true,
    backupData: true
});

// Migration simple widget → entity
const entity = helper.migrateWidgetToEntity(widget);
```

#### 🏗️ `EntitySystemLoader` (`entity-system-loader.js`)
**Responsabilité** : Chargement et initialisation du système complet

**Séquence de chargement** :
1. **Core Classes** : WidgetEntity → WidgetManager → Repository → Renderer
2. **Components** : DashboardCanvasEntity
3. **Helpers** : EntityMigrationHelper  
4. **Verification** : Vérification de la disponibilité des classes
5. **Initialization** : Création de `window.WidgetEntitySystem`
6. **Auto-Migration** : Proposition de migration automatique

## 🔄 Workflow Complet

### 1. Création d'Entité
```javascript
// Via WidgetManager
const manager = new WidgetManager();
const entity = await manager.create({
    type: 'bar-chart',
    title: 'Sales Chart',
    description: 'Monthly sales analysis'
});

// Entité créée avec :
// - ID unique généré
// - Métadonnées complètes
// - Template de code source
// - Structure de data binding
// - Configuration de layout
```

### 2. Data Binding
```javascript
// Application de données
await manager.applyDataBinding(entity.id, {
    dimensions: [
        { field: 'Month', type: 'dimension' }
    ],
    measures: [
        { field: 'Sales', type: 'measure', aggregation: 'sum' }
    ]
});

// L'entité est automatiquement :
// - Validée pour la compatibilité
// - Mise à jour avec timestamp
// - Persistée en storage
// - Marquée pour re-rendu
```

### 3. Rendu
```javascript
// Via EntityRenderer
const renderer = new EntityRenderer();
const container = document.getElementById('widget-container');

await renderer.render(entity, container);
// 1. Traite le template source code
// 2. Injecte les données binding
// 3. Applique le CSS custom
// 4. Initialise l'interactivité
// 5. Cache le résultat
```

### 4. Persistance
```javascript
// Sérialisation automatique
const json = entity.serialize();
localStorage.setItem(`entity_${entity.id}`, json);

// Désérialisation
const restoredEntity = WidgetEntity.deserialize(json);

// Via Repository (recommandé)
const repository = WidgetRepositoryFactory.create('indexedDB');
await repository.save(entity);
const entities = await repository.getAll();
```

## 🚀 Migration depuis l'Ancien Système

### Étapes de Migration

1. **Chargement du Système Entity**
```html
<script src="src/entity-system-loader.js"></script>
<!-- Auto-chargement et vérification -->
```

2. **Migration Automatique**
```javascript
// Détection automatique + proposition
// Backup automatique des données existantes
// Conversion widgets → entities
// Remplacement du canvas
// Mise à jour du feeding panel
```

3. **Vérification Post-Migration**
```javascript
const stats = window.WidgetEntitySystem.migrationHelper.getMigrationStats();
console.log(`Migrated: ${stats.successfulMigrations}/${stats.totalMigrations}`);
```

### Compatibilité

- **Backward Compatible** : L'ancien système continue de fonctionner
- **Progressive Enhancement** : Migration progressive possible
- **Data Preservation** : Aucune perte de données
- **Rollback Capability** : Possibilité de retour en arrière via backup

## 🎯 Avantages de l'Architecture Entity

### 1. **Robustesse**
- Validation complète des données
- Gestion d'erreur centralisée
- État de loading/error trackés
- Intégrité des données garantie

### 2. **Scalabilité**
- Architecture modulaire
- Séparation des responsabilités
- Extensibilité via interfaces
- Performance optimisée avec cache

### 3. **Maintenabilité**
- Code source embarqué dans les entités
- Sérialisation complète
- Métadonnées riches pour debugging
- Cycle de vie tracé

### 4. **Flexibilité**
- Multi-backend storage
- Templates personnalisables
- CSS scopé par entité
- Interactivité configurable

### 5. **Developer Experience**
- API intuitive et cohérente
- Migration automatique
- Debugging amélioré
- Documentation des entités

## 🔧 Configuration et Utilisation

### Initialisation Basique
```javascript
// Auto-chargement via loader
// OU initialisation manuelle :

const entitySystem = await window.loadWidgetEntitySystem();
const { widgetManager, entityRenderer } = entitySystem;
```

### Utilisation dans les Composants
```javascript
// Dans feeding-panel.js
const canvas = document.querySelector('dashboard-canvas-entity');
const entities = canvas.getEntities();

// Sélection pour data assignment  
const entityOptions = entities.map(e => ({
    value: e.id,
    label: e.title,
    type: e.type
}));
```

### Extension du Système
```javascript
// Nouveau type de widget
class CustomChartEntity extends WidgetEntity {
    constructor(config) {
        super(config);
        this.type = 'custom-chart';
        // Logique spécifique
    }
}

// Enregistrement
WidgetManager.registerEntityType('custom-chart', CustomChartEntity);
```

## 📊 Performance et Monitoring

### Métriques Trackées
```javascript
// Dans WidgetEntity
entity.performance = {
    renderTime: 0,           // Temps de rendu en ms
    dataBindingTime: 0,      // Temps d'application des données
    validationTime: 0,       // Temps de validation
    lastRenderSize: 0,       // Taille du DOM généré
    memoryUsage: 0           // Estimation usage mémoire
};

// Accès aux métriques
const stats = entity.getPerformanceStats();
```

### Optimisations
- **Lazy Loading** : Rendu à la demande
- **Template Caching** : Cache des templates compilés  
- **DOM Recycling** : Réutilisation des éléments DOM
- **Batch Operations** : Opérations groupées

## 🧪 Tests et Validation

### Tests d'Entité
```javascript
// Validation d'intégrité
const validation = entity.validate();
if (!validation.isValid) {
    console.error('Entity validation failed:', validation.errors);
}

// Test de sérialisation
const serialized = entity.serialize();
const deserialized = WidgetEntity.deserialize(serialized);
assert.deepEqual(entity, deserialized);
```

### Tests de Migration
```javascript
// Test de conversion
const widget = { id: 'w1', type: 'bar-chart' };
const entity = migrationHelper.migrateWidgetToEntity(widget);
assert.equal(entity.type, widget.type);
assert.equal(entity.id, widget.id);
```

## 🎯 Roadmap et Évolutions

### Phase 1 : Foundation (Actuel)
- ✅ Core Entity classes
- ✅ EntityRenderer 
- ✅ Migration automatique
- ✅ Canvas Entity-based

### Phase 2 : Enhancement
- 🔄 Templates visuels avancés
- 🔄 Interactivité riche  
- 🔄 Thèmes et styling
- 🔄 Performance monitoring

### Phase 3 : Advanced Features
- 🔄 Real-time collaboration
- 🔄 Entity versioning
- 🔄 Plugin system
- 🔄 Cloud storage backend

---

## 📝 Conclusion

L'architecture WidgetEntity représente une transformation majeure qui établit des fondations solides pour l'évolution future du système de widgets. Elle apporte robustesse, scalabilité et flexibilité tout en préservant la compatibilité avec l'existant.

**Migration recommandée** : Utiliser le `EntitySystemLoader` pour une migration automatique et transparente.

**Support** : L'ancien système reste fonctionnel pendant la transition, permettant une migration progressive selon les besoins.