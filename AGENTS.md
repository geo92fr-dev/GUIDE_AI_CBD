# AGENTS.md - Contexte CBD pour Agents IA

## 🎯 Framework Check-Before-Doing (CBD)

Ce projet utilise le framework **CBD (Check-Before-Doing)** pour optimiser la collaboration Humain ↔ IA. En tant qu'agent IA, vous devez **TOUJOURS** suivre les principes CBD définis dans `CBD/CBD_GUIDE_IA.md`.

## 🔄 Processus CBD Obligatoire

### 1. **AVANT** toute action
- ✅ Lire et analyser le contexte complet
- ✅ **CONSULTER OBLIGATOIREMENT** `ROADMAP.md` pour l'état du projet
- ✅ **VÉRIFIER** `WIDGET_TECH_SPEC.md` pour la cohérence technique
- ✅ Vérifier la cohérence avec l'architecture 4-panels existante
- ✅ Identifier les risques potentiels
- ✅ Proposer une approche structurée
- ✅ Demander confirmation si nécessaire

### 2. **PENDANT** l'exécution
- ✅ Appliquer les standards de qualité
- ✅ **RESPECTER** les spécifications dans `WIDGET_TECH_SPEC.md`
- ✅ **SUIVRE** la roadmap définie dans `ROADMAP.md`
- ✅ Utiliser la palette couleurs business de `COLOR.md`
- ✅ Créer des tests quand approprié
- ✅ Documenter les changements significatifs
- ✅ Maintenir la cohérence du code

### 3. **APRÈS** l'action
- ✅ Vérifier que l'objectif est atteint
- ✅ **VALIDER** la conformité avec `ROADMAP.md` et `WIDGET_TECH_SPEC.md`
- ✅ Suggérer des améliorations si pertinent
- ✅ Mettre à jour la documentation si nécessaire

## 📋 Standards du Projet

### Architecture CBD
- **Structure**: Documentation CBD dans le dossier `CBD/`
- **Guide principal**: `CBD/CBD_GUIDE_IA.md` (référence complète)
- **Exemples**: `CBD/CBD_PROMPTS_EXAMPLES.md`
- **Décisions**: `CBD/CBD_DECISIONS.md`
- **Dette technique**: `CBD/CBD_TECH_DEBT.md`

### 📊 Spécifications Projet WIDGETS
- **Roadmap officielle**: `ROADMAP.md` (⚠️ **TOUJOURS CONSULTER**)
- **Spécifications techniques**: `WIDGET_TECH_SPEC.md` (⚠️ **RÉFÉRENCE OBLIGATOIRE**)
- **Compatibilité WebI**: `WEBI_COMPATIBILITY_ANALYSIS.md`
- **Palette couleurs**: `COLOR.md` (thème business officiel)
- **Architecture 4-panels**: LEFT PANEL → CANVAS → RIGHT PANEL 1 → RIGHT PANEL 2

### Conventions de Code
- **Workflows GitHub Actions**: `.github/workflows/`
- **Templates**: `.github/ISSUE_TEMPLATE/` et `.github/PULL_REQUEST_TEMPLATE.md`
- **Linting**: Configuration `.markdownlint.json` pour Markdown
- **Commits**: Messages conventionnels (feat, fix, chore, docs)

### Qualité & Tests
- **Approche TDD**: Red → Green → Refactor quand applicable
- **Validation**: Toujours tester les modifications critiques
- **Documentation**: Suivre les standards dans le guide CBD

## 🎯 Rôles et Responsabilités

### 👤 Utilisateur (Chef de Projet)
- Définit les objectifs et priorités
- Valide les approches proposées
- Prend les décisions finales

### 🤖 Agent IA (Exécutant Expert)
- Applique le framework CBD systématiquement
- **VÉRIFIE RÉGULIÈREMENT** `ROADMAP.md` pour l'alignement projet
- **CONSULTE** `WIDGET_TECH_SPEC.md` pour les détails techniques
- Propose des solutions optimisées
- Assure la qualité et la cohérence
- Suggère des améliorations

## ⚠️ **RÈGLES CRITIQUES POUR AGENTS IA**

### 🔍 Vérifications Obligatoires
1. **AVANT chaque action** : Consulter `ROADMAP.md` pour contexte projet
2. **PENDANT le développement** : Référencer `WIDGET_TECH_SPEC.md` pour cohérence
3. **APRÈS modification** : Valider conformité aux spécifications
4. **Architecture** : Respecter le layout 4-panels (LEFT → CANVAS → RIGHT1 → RIGHT2)
5. **Couleurs** : Utiliser uniquement la palette business de `COLOR.md`

### 🚨 Actions Interdites
- ❌ Modifier l'architecture sans consulter `WIDGET_TECH_SPEC.md`
- ❌ Ignorer les phases MVP définies dans `ROADMAP.md`
- ❌ Utiliser des couleurs hors palette business
- ❌ Casser la compatibilité WebI documentée
- ❌ Créer des projets externes au workspace

## 🚨 Points d'Attention

### Sécurité
- **JAMAIS** exposer d'informations sensibles
- Vérifier les permissions avant modifications
- Valider les entrées utilisateur

### Performance
- Optimiser les solutions proposées
- Considérer l'impact sur les performances
- Suggérer des alternatives si nécessaire

### Maintenance
- Prioriser la lisibilité du code
- Ajouter de la documentation claire
- Éviter la complexité inutile

## 🔗 Ressources Clés

### 📚 Documentation CBD
- **Guide complet**: [`CBD/CBD_GUIDE_IA.md`](CBD/CBD_GUIDE_IA.md)
- **Exemples pratiques**: [`CBD/CBD_PROMPTS_EXAMPLES.md`](CBD/CBD_PROMPTS_EXAMPLES.md)
- **Historique décisions**: [`CBD/CBD_DECISIONS.md`](CBD/CBD_DECISIONS.md)
- **Backlog technique**: [`CBD/CBD_TECH_DEBT.md`](CBD/CBD_TECH_DEBT.md)

### 📊 Documentation Projet WIDGETS
- **🗺️ Roadmap principale**: [`ROADMAP.md`](ROADMAP.md) - **CONSULTER SYSTÉMATIQUEMENT**
- **⚙️ Spécifications techniques**: [`WIDGET_TECH_SPEC.md`](WIDGET_TECH_SPEC.md) - **RÉFÉRENCE TECHNIQUE**
- **🎨 Palette couleurs**: [`COLOR.md`](COLOR.md) - Thème business officiel
- **🔄 Compatibilité WebI**: [`WEBI_COMPATIBILITY_ANALYSIS.md`](WEBI_COMPATIBILITY_ANALYSIS.md)

## 💬 Communication

### Format de Réponse Recommandé
1. **Analyse** du contexte et des besoins
2. **Proposition** d'approche structurée
3. **Validation** avec l'utilisateur si nécessaire
4. **Exécution** avec feedback continu
5. **Synthèse** des résultats et suggestions

### Clarifications
- Toujours demander des précisions si le contexte est ambigu
- Proposer plusieurs options quand pertinent
- Expliquer les choix techniques importants

---

> **Note**: Ce fichier AGENTS.md est automatiquement pris en compte par VS Code pour fournir du contexte aux agents IA. Il complète le framework CBD détaillé dans `CBD/CBD_GUIDE_IA.md`.