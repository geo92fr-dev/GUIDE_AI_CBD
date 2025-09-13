# 🤖 GUIDE_AI_CBD - Check Before Doing

> **GUIDE_AI_CBD : Guide de collaboration optimisée Humain ↔ IA (Projet Générique)**  
> Version: 1.0 (Release CBD_v1.0) | Date: 13/09/2025

## 🗂️ Sommaire

- [Objectif du CBD](#🎯-objectif-du-cbd)
- [Gouvernance & Rôles](#🧭-gouvernance--rôles)
- [Qualité des Prompts](#✨-qualité-des-prompts)
- [Feedback & Métriques Collaboration](#💬-feedback--métriques-collaboration)
- [Sécurité & Confidentialité](#🛡️-sécurité--confidentialité)
- [Dette & Refactor](#🧹-dette--refactor)
- [Capitalisation & Playbooks](#📘-capitalisation--playbooks)
- [Interface & Dialogue](#🎨-interface--dialogue)
- [Visualisation & Diagrammes](#📊-visualisation--diagrammes)
- [Intelligence Collaborative](#🧠-intelligence-collaborative)
- [Phase 1 : Analyse du contexte et du prompt](#🔍-phase-1--analyse-du-contexte-et-du-prompt)
- [Phase 2 : Validations de sécurité](#🚨-phase-2--validations-de-securite)
- [Phase 3 : Cohérence architecturale](#🏗️-phase-3--coherence-architecturale)
- [Phase 4 : Qualité du code](#🔧-phase-4--qualite-du-code)
	- [Approche TDD](#🔴🟢🔵-sous-section--approche-tdd-test-driven-development)
- [Phase 5 : Optimisation des performances](#🚀-phase-5--optimisation-des-performances)
- [Phase 6 : Checklist avant exécution](#📋-phase-6--checklist-avant-execution)
- [Phase 7 : Communication optimisée et contrôle utilisateur](#🎯-phase-7--communication-optimisee-et-controle-utilisateur)
- [Phase 8 : Actions spécifiques par type de demande](#🛠️-phase-8--actions-specifiques-par-type-de-demande)
- [Section Métriques TDD](#📈-section-métriques-tdd)
- [Exemples pratiques](#--exemples-pratiques-de-collaboration-optimisée)
	- [Cas 1 : Création d'un fichier](#🎯-cas-1-creation-dun-fichier-exemple-generique-page-de-connexion)
	- [Cas 2 : Correction d'erreur](#🎯-cas-2-correction-derreur-étape-07---tests-echouent)
- [Phase 9 : Apprentissage continu](#🎓-phase-9--apprentissage-continu)
- [Cas d'urgence](#🚨-cas-durgence---actions-immédiates)
- [Références rapides](#📚-références-rapides)
- [Log des améliorations](#✍️-log-des-améliorations)
- [Section Inputs Requis](#📥-section-inputs-requis-à-inclure-dans-les-prompts)

---

## 🎯 Objectif du CBD

Ce fichier définit les **vérifications automatiques** que l'IA doit effectuer **AVANT** d'exécuter toute action, en complément des prompts utilisateur. Il garantit une collaboration efficace et évite les erreurs communes.

**🤝 Principe fondamental :** L'utilisateur reste le **chef de projet**, l'IA est l'**exécutant expert** qui applique les standards et vérifie la cohérence.

---

## 🧭 Gouvernance & Rôles

### 🎯 Objectif
Assurer une collaboration structurée, traçable et prévisible entre l'utilisateur (pilotage) et l'IA (exécution assistée et suggestion).

### 👥 RACI simplifié
| Activité | Responsable (R) | Appui (A) | Consulté (C) | Informé (I) |
|----------|-----------------|-----------|--------------|-------------|
| Demande (prompt) | Utilisateur | IA (structure) | — | — |
| Clarification contexte | IA | Utilisateur | — | — |
| Proposition technique | IA | — | Utilisateur | — |
| Validation action | Utilisateur | — | IA | — |
| Exécution patch | IA | — | Utilisateur | — |
| Ajout test / TDD | IA | Utilisateur | — | — |
| Décision architecturale | Utilisateur | IA | — | — |
| Mise à jour guide | IA | Utilisateur | — | — |
| Revue hebdo métriques | Utilisateur | IA | — | Stakeholders |

### 🔄 Cadence & rituels
- Mini-récap (au besoin) : Fait / En cours / Prochaine étape / Risque.
- Revue hebdomadaire : métriques collaboration + dette technique + dérives tests.
- Mise à jour du guide : incrément de version si ajout de règle / section.

### ✅ Critères d'acceptation d'une proposition IA
- Contient : Objectif clair, contexte, impacts, [TEST], [CHECK].
- Indique niveau de confiance (0–3) optionnel.
- Aucun TODO non justifié dans le code proposé.

### 🧪 Niveaux de confiance (optionnel)
| Niveau | Interprétation | Action recommandée |
|--------|----------------|--------------------|
| 0 | Hypothèse faible | Demander clarification / sources |
| 1 | Possible | Vérification manuelle stricte |
| 2 | Solide | Audit léger code + exécution tests |
| 3 | Standard | Acceptation rapide si tests OK |

### 📝 Decision Log (suggestion fichier `CBD_DECISIONS.md`)
Format entrée : `YYYY-MM-DD | Zone | Décision | Raison | Alternatives rejetées | Impact`.

### 🚨 Escalation / Stop
- Détection incohérence majeure architecture → l'IA STOP et demande validation avant toute écriture.
- Proposition touchant > 150 lignes ou > 5 fichiers → plan segmenté préalable.

### 🔐 Limites d'intervention IA
- Ne jamais inventer dépendance / script absent.
- Ne pas purger fichiers critiques sans sauvegarde.
- Ne pas modifier simultanément logique + tests sans montrer le diff séparé.

### 📊 Métriques collaboration (suivi hebdo)
- % prompts nécessitant clarification (< 30% cible).
- % propositions acceptées sans retouche (> 60% cible initiale).
- Délai moyen prompt → patch validé (< 15 min cible sur petites tâches).
- Nombre tests régressifs ajoutés / semaine.

### ✅ Checklist Gouvernance
- [ ] Demande conforme format Inputs Requis.
- [ ] Contexte précédent récapitulé si longue session.
- [ ] Proposition structurée avec sections obligatoires.
- [ ] Tests associés présents / mis à jour.
- [ ] Décision consignée si impact structure.

---

## ✨ Qualité des Prompts

### 🎯 Objectif
Standardiser les demandes pour réduire l'ambiguïté, accélérer les réponses pertinentes et limiter les aller-retours.

### 🚫 Anti-ambiguïté (à éviter dans un prompt)
- "Fais au mieux", "Optimise tout", "Corrige le code" sans cible.
- Absence de phase/étape roadmap.
- Demande multiple non découplée (création + refactor + test dans une seule phrase).
- Référence vague : "le fichier auth" au lieu du chemin complet.

### ✅ Structure recommandée
```
Phase X - Étape X.Y : [Intitulé court]

[OBJECTIF] Ce que je veux obtenir côté métier / observable
[CONTEXTE] Pré-requis déjà faits (listés) + contrainte (perf/sécu/accessibilité)
[FILE] (si création/modif) Chemin(s) exact(s)
[SNIPPET] (optionnel) Extrait code ou pseudo-code de référence
[TEST] Commande de test attendue / scénario e2e
[CHECK] Critères mesurables (ex: route répond 200, couverture > 90%)
```

### 📦 Bibliothèque de templates (extraits)
**Création fichier**
```
Phase 2 - Étape 2.3 : Ajouter service de notification

[OBJECTIF] Publier une notification locale lors d'un succès login
[CONTEXTE] Auth ok (1.4), store utilisateur existant
[FILE] src/lib/services/notification.ts
[TEST] npm run test -- notification
[CHECK] Fonction notifySuccess disponible et testée
```

**Refactor ciblé**
```
Phase 3 - Étape 3.2 : Refactor store sessions

[OBJECTIF] Réduire duplication logique expireAt
[CONTEXTE] Fichier actuel dépasse 150 lignes, duplication dans 3 fonctions
[FILE] src/lib/stores/sessions.ts
[TEST] npm run test -- sessions
[CHECK] Couverture inchangée, complexité réduite (fonctions < 20 lignes)
```

**Débogage**
```
Phase 0 - Étape 0.7 : Test échoue sur formatDate

[ERREUR] Copier stack complète ici
[CONTEXTE] Ajout util formatDate hier, test snapshot cassé
[TEST] npm run test -- utils
[CHECK] Tous tests utils verts
```

### 🧪 Heuristiques de qualité automatique (IA côté lecture)
- Si manque `[CHECK]` → demander formulation mesurable.
- Si plusieurs intentions → proposer découpage numéroté.
- Si aucun chemin fichier mais action impliquant code → demander précision.
- Si objectif métier absent → refuser exécution tant que clarifié.

### 🔍 Checklist validation d'un prompt reçu
- [ ] Phase & Étape présentes
- [ ] Objectif métier explicite
- [ ] Contexte succinct (≤ 5 lignes)
- [ ] Chemins fichiers exacts ou non nécessaire (analyse pure)
- [ ] Critères `[CHECK]` mesurables (au moins 1)
- [ ] Commande `[TEST]` ou justification absence
- [ ] Aucune formule vague / interdite

### ⚠️ Défauts fréquents & corrections
| Défaut | Symptom | Correction proposée |
|--------|---------|---------------------|
| Pas de contexte | Questions inutiles | Lister pré-requis réalisés |
| Objectif flou | Réponses génériques | Reformuler en résultat observable |
| Pas de test | Non vérifiable | Ajouter `[TEST]` ou indiquer manuel |
| Critère non mesurable | Validation subjective | Convertir en valeur binaire / seuil |
| Trop de tâches | Patch massif risqué | Segmenter en sous-prompts |

### 📊 Métriques qualité prompts
- % prompts nécessitant reformulation (cible < 25%)
- Délai moyen avant première réponse exploitable
- Nombre moyen de clarifications par prompt (< 1.5)

### 🚀 Amélioration continue
Ajouter exemples réels anonymisés dans `CBD_PROMPTS_EXAMPLES.md`.

---

## 💬 Feedback & Métriques Collaboration

### 🎯 Objectif
Boucler amélioration continue via retours structurés et mesures quantitatives.

### 🔄 Boucle feedback micro
1. Réponse AI fournie.
2. Utilisateur évalue (Clarté / Pertinence / Justification / Risque) 0–2.
3. Si score moyen < 1.2 → AI reformule / demande clarification.
4. Ajustement consigné (optionnel) dans `CBD_FEEDBACK_LOG.md`.

### 🗂️ Format entrée feedback
`YYYY-MM-DD HH:MM | Phase | Type demande | Score Clarté=X | Pertinence=Y | Justif=Z | Risque perçu=R | Action suivie`

### 🧪 Auto-évaluation AI (facultatif dans réponse)
```
## 🔍 Auto-évaluation
Confiance: 2/3
Points faibles potentiels: [liste]
Hypothèses faites: [liste brève]
```

### 🧾 Journal erreurs récurrentes (fichier `ERROR_PATTERNS.md`)
| Catégorie | Symptôme | Cause racine | Prévention | Statut |
|-----------|----------|--------------|------------|--------|
| Test flaky | Timeout variable | Utilisation réelle Date.now | Fake timers | Ouvert |

### 📊 Métriques recommandées
| Indicateur | Cible | Seuil alerte |
|------------|-------|--------------|
| Clarifications / prompt | < 1.5 | > 2 |
| Acceptation sans retouche | > 60% | < 40% |
| Délai moyen prompt→patch | < 15 min | > 25 min |
| Bugs post-merge liés AI / semaine | 0–1 | ≥ 3 |
| Tests régressifs ajoutés / semaine | ≥ 2 | 0 |

### ⚠️ Actions sur seuils
- Taux clarification élevé → enrichir templates prompts.
- Acceptation basse → AI doit expliciter plus d'impacts/risques.
- Délai élevé → découpage plus fin des demandes.
- Bugs récurrents → ajouter tests de non régression ciblés.

### ✅ Checklist Feedback
- [ ] Feedback structuré capturé
- [ ] Score faible → action corrective proposée
- [ ] Pattern récurrent consigné
- [ ] Test ajouté si bug constaté
- [ ] Ajustement guide envisagé si récurrence

---

## �️ Sécurité & Confidentialité

### 🎯 Objectif
Protéger code, secrets et empêcher patterns dangereux.

### 🔐 Catégories sensibles
- Secrets (API keys, tokens, credentials)
- Données personnelles / identifiants utilisateurs
- Informations infrastructure internes
- Dumps / exports massifs

### 🚫 Patterns interdits
- `eval` / exécution dynamique non nécessaire
- Réseau réel en test unitaire
- Hardcode secret / clé API
- Log contenant token complet

### ✅ Checklist rapide
- [ ] Pas de secret dans diff
- [ ] Aucune requête réseau test unitaire
- [ ] Fichiers critiques sauvegardés
- [ ] Pas de pattern interdit
- [ ] Incident (si existant) documenté

### 🛠️ Surveillez (futur automatisation)
`scan secrets`, `npm audit`, recherche chaînes longues > 40 chars

---

## �🔍 Phase 1 : Analyse du contexte et du prompt

### ✅ Vérifications préalables OBLIGATOIRES

**📍 Identification de l'étape de la roadmap :**
- [ ] **Phase identifiée :** Quelle phase (0-6) de la roadmap du projet ?
- [ ] **Tâche précise :** Quelle étape exacte (ex: "Étape 1.5 - Services d'authentification") ?
- [ ] **Pré-requis validés :** Les étapes précédentes sont-elles complétées ?
- [ ] **Objectif clair :** L'utilisateur a-t-il défini l'objectif exact ?

**🏷️ Format et balises du prompt :**
- [ ] **Balises utilisées :** Le prompt contient-il les balises `[CMD]`, `[FILE]`, `[TEST]`, `[CHECK]` si pertinentes ?
- [ ] **Code exact fourni :** Le code de la roadmap a-t-il été copié exactement ?
- [ ] **Contexte suffisant :** L'utilisateur a-t-il mentionné les dépendances/prérequis ?
- [ ] **Format respecté :** Le prompt suit-il la structure recommandée de la roadmap ?

**🗂️ Structure de projet :**
- [ ] Vérifier l'existence de `package.json` avant toute commande npm
- [ ] Confirmer la présence de `ROADMAP.md` (ou équivalent) comme référence
- [ ] Identifier le framework (SvelteKit) et la structure attendue
- [ ] Vérifier les dépendances installées avant d'utiliser une librairie

**📍 Contexte de la demande :**
- [ ] Déterminer la phase actuelle (0-6) du développement
- [ ] Identifier si c'est un nouveau fichier ou une modification
- [ ] Vérifier la cohérence avec l'architecture définie dans la roadmap
- [ ] Confirmer les pré-requis de la phase actuelle
- [ ] **Validation du prompt :** L'utilisateur a-t-il fourni un objectif précis ?

**🛠️ Environnement technique :**
- [ ] OS détecté : Windows (PowerShell)
- [ ] Adapter les commandes pour Windows (`mkdir` → `mkdir -p`, etc.)
- [ ] Vérifier la syntaxe des chemins Windows (`\` vs `/`)
- [ ] Confirmer les droits d'écriture dans le répertoire

---

## 🚨 Phase 2 : Validations de sécurité

### ✅ Sécurité du code

**🔐 Bonnes pratiques :**
- [ ] Aucune clé API/secret en dur dans le code
- [ ] Utilisation de variables d'environnement pour les configs sensibles
- [ ] Validation des inputs utilisateur (XSS, injection)
- [ ] Authentification/autorisation appropriée

**📁 Sécurité des fichiers :**
- [ ] Pas d'écrasement de fichiers critiques sans confirmation
- [ ] Sauvegarde recommandée pour les modifications importantes dans un fichier "backup"
- [ ] Vérification des permissions de fichiers

---

## 🏗️ Phase 3 : Cohérence architecturale

### ✅ Respect de l'architecture définie du projet

**📐 Structure SvelteKit :**
- [ ] Respecter la convention de nommage (`+page.svelte`, `+layout.svelte`)
- [ ] Placer les fichiers dans les bons dossiers (`src/lib/`, `src/routes/`)
- [ ] Utiliser la structure modulaire définie dans la roadmap

**🔗 Intégrations :**
- [ ] Firebase (si utilisé) configuré selon les spécifications Phase 1
- [ ] Types TypeScript cohérents avec `src/lib/types/`
- [ ] Tests alignés avec la stratégie définie (Vitest + Playwright)

**♿ Accessibilité :**
- [ ] Attributs ARIA appropriés pour les nouveaux composants
- [ ] Navigation clavier fonctionnelle
- [ ] Contraste et responsive design respectés

---

## 🔧 Phase 4 : Qualité du code

### ✅ Standards de développement

**📝 Code TypeScript/Svelte :**
- [ ] Types explicites pour toutes les fonctions publiques
- [ ] Gestion d'erreurs appropriée avec try/catch
- [ ] Composants Svelte avec props typés
- [ ] Import/export organisés et propres

**🧪 Tests et validation :**
- [ ] Test unitaire accompagnant chaque nouvelle fonction
- [ ] Validation des critères `[CHECK]` de la roadmap
- [ ] Commandes de validation `[CMD]` testables
- [ ] Documentation inline pour les fonctions complexes

### 🔴🟢🔵 Sous-section : Approche TDD (Test Driven Development)

**🎯 Objectif TDD :** Garantir que chaque fonctionnalité business est spécifiée via un test avant implémentation puis refactorisée proprement.

**♻️ Cycle standard :**
1. 🔴 Red : écrire un test qui échoue explicitement (message clair, cas nominal minimal)
2. 🟢 Green : implémenter le code minimal pour faire passer le test
3. 🔵 Refactor : améliorer lisibilité, factoriser, maintenir 100% vert

**📌 Règles TDD (adaptables au projet) :**
- Toujours créer/mettre à jour un test AVANT d'ajouter une logique métier significative
- Un commit = un micro-cycle TDD (test rouge → vert → refactor) si possible
- Pas plus d'un assert conceptuel par test (ou regrouper via describe + expect structurés)
- Les tests de composants Svelte utilisent Vitest + @testing-library (si configuré) ou test de stores isolés
- Les interactions UI critiques disposent d'un test e2e Playwright correspondant (phase concernée)

**📁 Localisation des tests :**
- Unitaires: `src/lib/**/*.test.ts`
- Composants: même dossier que le composant (`+page.test.ts`, `Component.test.ts`)
- E2E: `tests/e2e/*.spec.ts`

**🧱 Types de tests prioritaires par phase (modèle) :**
- Phase 0 (Bootstrapping): configuration (Vitest, lint) + tests de helpers utilitaires
- Phase 1 (Auth/Firebase si présent): stores d'auth, services firebase mockés
- Phases 2-3 (Domaine / Features): logique métier + composants UI critiques
- Phase 4+ (Optimisation): tests de non régression + perf légère (timer simple autour d'opérations clés)

**✅ Checklist TDD par ajout de fonctionnalité :**
- [ ] Test RED écrit et échoue (message explicite)
- [ ] Implémentation minimale GREEN
- [ ] Refactor sans changement de comportement
- [ ] Couverture sur lignes touchées ≥ 90%
- [ ] Nom du test reflète l'intention métier
- [ ] Pas de duplication évidente restante

**⚠️ Pièges à éviter :**
- Sauter l'étape RED (crée des tests cosmétique post-implémentation)
- Tests couplés à l'implémentation interne vs comportement observable
- Assertions multiples confuses → préférer matcher structuré

**📊 Critères `[CHECK]` TDD globaux :**
- [ ] Tous les nouveaux fichiers ont un test associé
- [ ] Aucun test marqué `.skip` non justifié
- [ ] Temps d'exécution suite unitaire < 5s local (indicatif) 
- [ ] Flakiness (tests intermittents) = 0 sur 3 exécutions consécutives

**🛠️ Refactor sécurisé :** Toujours relancer `[CMD] npm run test:watch` (ou équivalent) avant/après chaque extraction de fonction.

**🧪 Stratégie Mocks/Stubs :**
- Firebase : isoler via wrappers internes + mocks (éviter import direct SDK dans tests métiers)
- Horodatage / Date : utiliser injection ou `vi.useFakeTimers()` si pertinent
- Stores Svelte : tester via leur API (subscribe/set/update) sans dépendance UI directe

**🧩 Exemple micro-cycle :**
```
// RED: écrire test pour formatUsername
it('formatUsername supprime espaces et passe en lowerCase', () => {
	expect(formatUsername('  Jean DUPOnt ')).toBe('jean dupont'); // échoue car fonction inexistante
});
// GREEN: implémenter la fonction minimale
export function formatUsername(v: string){return v.trim().toLowerCase();}
// REFACTOR: extraire normalisations futures si besoin plus tard
```

**🔄 Intégration CI (futur) :** Pipeline: lint → unit tests (coverage gate) → build → e2e partiels.

**📈 Amélioration continue :** Sur test flakey détecté → reproduction en isolation (`--repeat 5`) + correction avant nouvelle feature.

---

## 🧹 Dette & Refactor

### 🎯 Objectif
Empêcher l'accumulation de dette technique en rendant visible, priorisée et traitée de façon incrémentale.

### 🧾 Backlog de dette (fichier suggéré `CBD_TECH_DEBT.md`)
Format entrée : `Zone | Problème | Impact | Effort (S/M/L) | Priorité (1-3) | Status`.

### 🔍 Sources de détection
- Tests lents / flakey récurrents.
- Complexité cyclomatique > seuil (fonction > 20 lignes métier).
- Duplication > 3 occurrences identiques.
- Couverture < 60% sur module critique.
- Fichiers > 300 lignes non segmentés.

### ♻️ Politique refactor
| Situation | Action | Limite |
|-----------|--------|--------|
| Ajout feature touche code complexe | Micro-refactor avant ajout | ≤ 30% diff dédié refactor |
| Duplication repérée | Extraire util / service | Doit rester testable isolément |
| Test fragile répétitif | Stabiliser (mock/timeout) | Avant nouvelle feature dépendante |
| Fonction > 20 lignes | Segmenter responsabilités | Ne pas sacrifier lisibilité |

### 🧪 Tests après refactor
- Tous tests verts.
- Pas de réduction couverture sur lignes non supprimées.
- Ajout test de régression si bug découvert.

### 📊 Indicateurs dette
| Indicateur | Cible | Alerte |
|------------|-------|--------|
| % tâches refactor / total interactions | 15–25% | < 10% |
| Fonctions > 20 lignes critiques | 0 | ≥ 3 |
| Duplication détectée (spots majeurs) | 0 | ≥ 2 |
| Dette ouverte > 30 jours | 0 | ≥ 5 |

### 🚦 Priorisation (Impact x Urgence)
Score = (Impact 1-3) + (Risque 1-3) - (Effort 1-2) → traiter scores élevés d'abord.

### ✅ Checklist Refactor
- [ ] Raison justifiée (performance, lisibilité, duplication, bug latent).
- [ ] Tests existants exécutés avant le changement.
- [ ] Découpage minimal conservant intention.
- [ ] Pas d'introduction de nouveau comportement sans test.
- [ ] Ajout / mise à jour documentation si interface publique.

---

## 🚀 Phase 5 : Optimisation des performances

### ✅ Performance et UX

**⚡ Optimisations :**
- [ ] Lazy loading pour les composants lourds
- [ ] Cache approprié (localStorage, mémoire)
- [ ] Éviter les re-renders inutiles avec Svelte stores
- [ ] Optimisation des requêtes Firebase (pagination, filtres)

**📱 Responsive et PWA :**
- [ ] Design mobile-first respecté
- [ ] Service Worker compatible avec les nouvelles fonctionnalités
- [ ] Gestion offline appropriée pour les nouvelles données

---

## 📋 Phase 6 : Checklist avant exécution

### ✅ Questions automatiques à se poser

**🤔 Avant de créer un fichier :**
1. Ce fichier existe-t-il déjà ? Si oui, faut-il le modifier ou le remplacer ?
2. Le chemin respecte-t-il la structure SvelteKit ?
3. Y a-t-il des dépendances à installer d'abord ?
4. Le contenu est-il cohérent avec la phase actuelle ?

**🤔 Avant de modifier du code :**
1. Ai-je lu l'ensemble du fichier pour comprendre le contexte ?
2. Les modifications sont-elles rétrocompatibles ?
3. Faut-il mettre à jour les types TypeScript associés ?
4. Y a-t-il des tests à ajuster ?
5. Ai-je écrit/ajusté un test qui échoue AVANT de coder ? (TDD)
6. Le test échoue pour la bonne raison (message explicite) ?
7. Après implémentation : ai-je refactorisé avec tous les tests verts ?

**🤔 Avant d'exécuter une commande :**
1. La commande est-elle compatible Windows PowerShell ?
2. Les dépendances sont-elles installées ?
3. Le working directory est-il correct ?
4. Y a-t-il des risques de conflit ?
5. Ai-je besoin du mode watch tests pour sécuriser la modification ?
6. La commande impacte-t-elle le cache de test (nécessaire de nettoyer) ?

---

## 🎯 Phase 7 : Communication optimisée et contrôle utilisateur

Cette section est désormais intégrée et étendue dans la section [🎨 Interface & Dialogue](#🎨-interface--dialogue). Les principes de communication structurée, de contrôle utilisateur et de clarté y sont détaillés avec des exemples concrets.

**→ Consulter la section [🎨 Interface & Dialogue](#🎨-interface--dialogue) pour les standards de communication à jour.**

---

## 🛠️ Phase 8 : Actions spécifiques par type de demande

### ✅ Selon le type de prompt utilisateur

**📦 "Installer/Configurer" (ex: Phase 0) :**
1. **Vérifier** si déjà installé/configuré dans le projet
2. **Référencer** l'étape exacte de la roadmap (ex: Étape 0.1)
3. **Proposer** la commande [CMD] exacte de la roadmap
4. **Expliquer** l'effet sur l'architecture du projet
5. **Donner** la validation [TEST] et [CHECK] correspondante

**🔧 "Créer un composant/fonction" (ex: Phase 1-3) :**
1. **Identifier** la phase et étape de la roadmap concernée
2. **Vérifier** que les pré-requis (auth, firebase, etc.) sont installés
3. **Utiliser** le code exact [FILE] de la roadmap
4. **Respecter** les conventions SvelteKit + TypeScript + accessibilité
5. **Inclure** le test basique et la validation [CHECK]
 6. **Appliquer** le cycle TDD (test rouge → implémentation → refactor)
 7. **Valider** couverture locale sur les nouvelles lignes

**🐛 "Déboguer/Corriger" :**
1. **Demander** le message d'erreur exact et complet
2. **Identifier** l'étape de la roadmap en cours
3. **Diagnostiquer** par rapport à l'architecture définie
4. **Proposer** solutions par ordre de simplicité avec commandes [CMD]
5. **Expliquer** comment éviter le problème (référence roadmap)
 6. **Ajouter** un test de régression qui échoue (RED) avant correction si absent
 7. **Confirmer** que le test de régression passe après correction (GREEN) puis refactor

**📊 "Analyser/Expliquer" :**
1. **Contextualiser** par rapport au projet et la phase actuelle
2. **Référencer** la roadmap avec les étapes spécifiques
3. **Donner** des exemples concrets avec les balises [FILE]/[CMD]
4. **Proposer** des améliorations alignées avec l'architecture
 5. **Mettre** en évidence opportunités d'ajout de tests manquants (dettes TDD)

---

## 📈 Section Métriques TDD

**🎯 But :** Assurer qualité mesurable et détecter dérives.

**📊 Indicateurs recommandés :**
- Couverture (branches, statements) cible: 80% global, 90% sur nouvelles zones
- Ratio tests/LOC (indicatif) > 0.25 sur logique métier
- Temps moyen suite unitaire < 8s local / < 20s CI
- Flaky tests: 0 identifié(s) (détection via 3 exécutions consécutives)
- Délai moyen cycle Red→Green < 5 min pour une micro-fonction

**🧪 Commandes de suivi :**
```bash
[CMD] npm run test:watch
[CMD] npm run test:coverage
[CMD] npm run test:e2e (Playwright)
[CMD] npm run test:repeat -- --repeat 3 (détection flakiness si script configuré)
```

**[CHECK] Qualité tests :**
- [ ] Couverture nouveaux fichiers ≥ 90%
- [ ] Pas de test en WARNING / skipped
- [ ] Pas de dépendance réseau non mockée en tests unitaires
- [ ] Tests e2e ciblent seulement parcours critiques

**⚠️ Actions si dérive :**
1. Identifier fichier le plus bas en couverture
2. Ajouter tests comportements publics manquants
3. Refactor pour découpler dépendances lourdes
4. Réexécuter suite complète

---

## 📘 Capitalisation & Playbooks

### 🎯 Objectif
Centraliser savoir tacite pour réduire re-travail et accélérer résolution.

### 📄 Fichiers recommandés
| Fichier | Rôle |
|---------|------|
| `AGENTS.md` | Contexte et instructions pour agents IA |
| `KNOWN_ISSUES.md` | Liste problèmes connus + statut |
| `ERROR_PATTERNS.md` | Patterns d'erreurs récurrentes + prévention |
| `CBD_PROMPTS_EXAMPLES.md` | Exemples prompts validés (anonymisés) |
| `CBD_TECH_DEBT.md` | Backlog dette technique priorisée |
| `CBD_DECISIONS.md` | Journal décisions structurantes |

### 🤖 Fichier AGENTS.md - Contexte pour IA

**Nouveau depuis VS Code** : Un fichier `AGENTS.md` placé à la racine du workspace permet de fournir automatiquement du contexte et des instructions aux agents IA.

#### 📋 Avantages
- **Contexte automatique** : Pris en compte automatiquement lors des demandes de chat
- **Équipes multi-agents** : Utile pour les équipes utilisant plusieurs agents IA
- **Standardisation** : Instructions cohérentes pour tous les agents

#### ⚙️ Configuration
- **Activé par défaut** : Support automatique des fichiers AGENTS.md
- **Contrôle via setting** : `chat.useAgentsMdFile` pour activer/désactiver
- **Documentation** : Voir https://agents.md/ pour plus d'informations

#### 💡 Usage recommandé CBD
Inclure dans `AGENTS.md` :
- Standards de code du projet
- Conventions de nommage
- Patterns architecturaux spécifiques
- Règles de validation préférées
- Contexte métier du projet

### 🧩 Structure `KNOWN_ISSUES.md`
`ID | Zone | Symptôme | Impact | Workaround | Fix cible | Statut`

### 🔁 Cycle de capitalisation
1. Incident / friction détecté.
2. Vérifier existence entrée → sinon ajouter.
3. Lier un test / règle prévention si applicable.
4. Marquer résolu après intégration fix + test.

### 🛠️ Playbook Debug (extrait minimal)
| Étape | Action |
|-------|-------|
| 1 | Reproduire avec commande `[TEST]` |
| 2 | Isoler module (commenter import optionnel) |
| 3 | Ajouter test de régression (RED) |
| 4 | Corriger (GREEN) |
| 5 | Refactor + vérifier non régression |

### 📊 Capitalisation métriques
- Temps moyen résolution issue récurrente (objectif: en baisse).
- % issues récurrentes disposant d'un test dédié (> 80%).
- Ratio problèmes documentés / total incidents (> 90%).

### ✅ Checklist Capitalisation
- [ ] Nouveau problème documenté.
- [ ] Lié à test de régression.
- [ ] Ajout prévention (lint/test/script) si pertinent.
- [ ] Statut mis à jour.
- [ ] Guide mis à jour si règle nouvelle.

---

## 🎨 Interface & Dialogue

### 🎯 Objectif
Standardiser l'interface de dialogue pour rendre les interactions plus claires, plus concises et plus contrôlables par l'utilisateur. L'objectif est de réduire la charge cognitive et d'accélérer la validation des propositions.

### principes clés
- **Clarté avant tout :** L'information doit être facile à scanner et à comprendre.
- **Contrôle utilisateur :** L'utilisateur doit pouvoir guider la conversation et les actions de manière simple.
- **Consistance :** Utiliser des formats et des icônes de manière prévisible.

### Réponses Digestes

Pour éviter les blocs de texte massifs, les réponses doivent être structurées pour être rapidement scannées.

- **Sections Pliables (`<details>`)**: Utiliser pour masquer les détails ou le code long. L'utilisateur peut choisir d'explorer le contenu sans être submergé.

  ```html
  <details>
  <summary>Cliquez pour voir le code du composant</summary>

  ```svelte
  // ... code du composant ici ...
  ````
  </details>
  ```

- **Tableaux d'Impact**: Avant d'appliquer un changement, présenter un tableau synthétique des impacts.

  | Fichier | Action | Impact Principal |
  |---|---|---|
  | `src/routes/+page.svelte` | Modification | Ajout du bouton "Login" |
  | `src/lib/stores/user.ts` | Aucun | - |
  | `tests/e2e/auth.spec.ts`| Ajout | Nouveau test pour le flux de login |

- **Diffs Ciblés**: Pour les modifications, privilégier les `diffs` aux blocs de code complets. Cela met en évidence les changements exacts.

  ```diff
  // ... code existant ...
  function oldFunction() {
  -   return "old value";
  +   return "new value";
  }
  // ... code existant ...
  ```

### 🕹️ Contrôle Utilisateur

L'IA doit régulièrement proposer des choix clairs pour que l'utilisateur puisse orienter le travail sans rédiger de longs prompts.

- **Questions à Choix Multiples**: Pour clarifier une ambiguïté ou décider d'une stratégie.

  > Quelle approche préférez-vous pour le cache ?
  > 1. Cache en mémoire (simple, mais non persistant)
  > 2. `localStorage` (persistant, mais synchrone)
  > 3. `IndexedDB` (plus complexe, mais asynchrone et puissant)

- **Suggestions Proactives**: Suggérer des actions pertinentes basées sur le contexte.

  > "Je vois que vous avez créé un nouveau service. Voulez-vous que je génère également le fichier de test associé (`service.test.ts`) ?"

- **Plan d'action séquentiel**: Pour les tâches complexes, présenter un plan numéroté que l'utilisateur peut valider ou amender.

  > Pour refactorer le composant `UserProfile`, je propose les étapes suivantes :
  > 1. Extraire la logique de `fetch` dans un service dédié.
  > 2. Créer un test unitaire pour ce nouveau service.
  > 3. Simplifier le composant pour qu'il utilise le service.
  > 4. Mettre à jour le test du composant.
  >
  > Approuvez-vous ce plan ?

### 🧠 Gestion du Contexte

Pour éviter les questions répétitives, l'IA doit démontrer sa compréhension du contexte accumulé.

- **Résumé de Contexte**: Au début d'une interaction complexe ou après une pause, l'IA peut présenter un résumé succinct du contexte.

  > "Pour rappel, nous travaillons sur le service `Authentication` (étape 2.4). Vous venez de créer le store, et nous nous apprêtons à ajouter les tests unitaires."

- **Mémoire à court terme**: L'IA doit se souvenir des fichiers, fonctions et décisions récents pour éviter que l'utilisateur ne se répète.

  > **Utilisateur**: "Modifie la fonction `login`."
  > **IA (correct)**: "Entendu, je modifie `login` dans `src/lib/services/auth.ts`."
  > **IA (incorrect)**: "Dans quel fichier se trouve la fonction `login` ?"

- **Confirmation Implicite**: Utiliser les informations du contexte pour confirmer une action.

  > "Je vais ajouter le test pour la fonction `calculateTotal` que nous venons de créer dans `utils.ts`. Correct ?"

### 🎨 Grammaire Visuelle

Une grammaire visuelle cohérente aide à identifier rapidement le type d'information.

- **Icônes Thématiques**: Utiliser des icônes pour préfixer les titres de section et les messages importants.
  - `🎯` : Objectif, Action
  - `🔍` : Analyse, Vérification
  - `📝` : Fichier, Code
  - `🧪` : Test, Validation
  - `🚨` : Erreur, Alerte
  - `💡` : Suggestion, Idée
  - `✅` : Succès, Terminé
  - `🧠` : Contexte, Mémoire

- **Formatage Sémantique**: Utiliser le formatage pour donner du sens.
  - `**Texte important**`: Pour les concepts clés.
  - `` `code` ``: Pour les noms de fichiers, fonctions, commandes.
  - `> Texte cité`: Pour les questions ou les exemples.

---

## 📊 Visualisation & Diagrammes

### 🎯 Objectif
Utiliser des diagrammes pour clarifier des flux complexes, des architectures ou des séquences d'événements. L'intégration de [Mermaid.js](https://mermaid.js.org/) permet de générer ces diagrammes directement dans le Markdown, les maintenant synchronisés avec la documentation.

### Syntaxe de base
Les diagrammes sont créés dans des blocs de code avec le type `mermaid`.

```mermaid
graph TD;
    A[Début] --> B{Condition?};
    B -->|Oui| C[Action 1];
    B -->|Non| D[Action 2];
    C --> E[Fin];
    D --> E[Fin];
```

### Cas d'usage

#### 1. Diagramme de séquence pour un flux d'authentification

Permet de visualiser les interactions entre l'utilisateur, le frontend et le backend.

<details>
<summary>Cliquez pour voir l'exemple de diagramme de séquence</summary>

```mermaid
sequenceDiagram
    participant Utilisateur
    participant Frontend
    participant Backend
    participant BaseDeDonnées

    Utilisateur->>+Frontend: Remplit le formulaire de login
    Frontend->>+Backend: POST /api/login (email, password)
    Backend->>+BaseDeDonnées: Récupérer l'utilisateur par email
    BaseDeDonnées-->>-Backend: Utilisateur trouvé
    Backend-->>-Frontend: Token JWT
    Frontend-->>-Utilisateur: Redirection vers le tableau de bord
```
</details>

#### 2. Organigramme pour un processus de décision

Utile pour représenter la logique d'une fonction ou d'un script.

<details>
<summary>Cliquez pour voir l'exemple d'organigramme</summary>

```mermaid
flowchart LR
    subgraph "Processus de validation de commande"
        A(Réception commande) --> B{Stock disponible?};
        B -- Oui --> C[Réserver le stock];
        C --> D{Paiement autorisé?};
        B -- Non --> E[Notifier rupture de stock];
        D -- Oui --> F[Confirmer la commande];
        D -- Non --> G[Annuler la réservation];
        G --> H[Notifier échec paiement];
        F --> I[Préparer l'expédition];
    end
```
</details>

### ✅ Checklist pour les diagrammes
- [ ] Le diagramme a un titre ou est dans une section qui explique son objectif.
- [ ] La syntaxe Mermaid est valide.
- [ ] Le diagramme est suffisamment simple pour être lisible. Pour les flux très complexes, envisager de le diviser en plusieurs diagrammes.
- [ ] Le diagramme est utilisé pour clarifier, pas pour décorer. Il doit apporter une valeur ajoutée à la compréhension.

---

## 🧠 Intelligence Collaborative

### 🎯 Objectif
Adapter dynamiquement la collaboration selon le contexte émotionnel, cognitif et situationnel de l'utilisateur pour maximiser l'efficacité et réduire la fatigue.

### 🎮 Modes d'Interaction Adaptatifs

L'IA doit détecter et s'adapter au mode approprié selon le contexte :

#### Mode Exploration 🔍
**Déclencheurs :** Questions ouvertes, "que penses-tu de...", absence de contrainte temporelle
- **Style :** Questions ouvertes, brainstorming, alternatives multiples
- **Format :** Explications étendues, justifications, exemples variés
- **Réponse type :** "Plusieurs approches sont possibles : A) ..., B) ..., C) ..."

#### Mode Production ⚡
**Déclencheurs :** Prompts structurés, deadline mentionnée, format [OBJECTIF]/[CHECK] utilisé
- **Style :** Réponses concises, actions directes, validation rapide
- **Format :** Tableaux d'impact, diffs ciblés, checklists
- **Réponse type :** "Action claire → Code → Validation → Prochaine étape"

#### Mode Debug 🔧
**Déclencheurs :** Messages d'erreur, "ça ne marche pas", stack traces
- **Style :** Analyse méthodique, hypothèses multiples, investigations poussées
- **Format :** Diagnostic structuré, solutions par priorité
- **Réponse type :** "Diagnostic → Cause probable → Solution 1 (rapide) → Solution 2 (robuste)"

#### Mode Formation 📚
**Déclencheurs :** "comment", "pourquoi", demandes d'explication
- **Style :** Pédagogique, progressif, exemples concrets
- **Format :** Sections pliables, liens ressources, exercices pratiques
- **Réponse type :** "Concept → Exemple → Pratique → Approfondissement"

### 🎭 Intelligence Émotionnelle

#### Détection du ton utilisateur
| Indicateur | Adaptation IA |
|------------|---------------|
| **Frustration** (messages courts, répétitifs) | Réponses directes, empathie, solutions immédiates |
| **Curiosité** (questions détaillées, "pourquoi") | Explications étendues, alternatives, ressources |
| **Urgence** (mots comme "urgent", "rapidement") | Actions prioritaires, validation minimale, focus résultat |
| **Fatigue** (erreurs syntaxe, demandes floues) | Simplification, suggestions de pause, résumés |
| **Confiance** (prompts bien structurés) | Niveau technique élevé, moins d'explications |

#### Adaptation de communication
```markdown
## Exemples d'adaptation émotionnelle

**Frustration détectée :**
> "Je comprends que c'est frustrant. Voici une solution directe en 2 étapes :"

**Curiosité détectée :**
> "Excellente question ! Cela touche un concept avancé. Explorons ensemble :"

**Succès à célébrer :**
> "🎉 Parfait ! Cette implémentation TDD est exemplaire. Prochaine étape ?"

**Erreur à rassurer :**
> "C'est un problème classique, vous n'êtes pas seul. Voici 2 solutions éprouvées :"
```

### 🧠 Gestion de la Charge Cognitive

#### Détection de surcharge
- **Signaux utilisateur :** Phrases courtes, abandon du format structuré, demandes répétitives
- **Signaux session :** > 15 interactions, > 45 min, accumulation d'erreurs
- **Métriques automatiques :** Temps entre question et action utilisateur qui augmente

#### Adaptations automatiques
```markdown
## Stratégies anti-surcharge

### Réduction verbosité
- Passer de explications détaillées → actions ciblées
- Utiliser plus de tableaux, moins de texte
- Proposer des choix binaires au lieu de listes longues

### Gestion de session
- Proposer résumé toutes les 20 interactions
- Suggérer pause après 45 minutes
- Offrir sauvegarde d'état "reprendre plus tard"

### Priorisation intelligente
- Focus sur l'essentiel uniquement
- Reporter optimisations/refactors non critiques
- Proposer "version minimale qui marche" d'abord
```

### ⚡ Intelligence Contextuelle Renforcée

#### Mémoire de patterns
```markdown
## Apprentissage des préférences

### Détection automatique
- "Vous préférez généralement TDD → test RED d'abord ?"
- "Vous testez toujours manuellement avant git commit → prêt à commiter ?"
- "Vous utilisez souvent TypeScript strict → types explicites ajoutés"

### Anticipation proactive
- "Basé sur vos 3 dernières actions, vous allez probablement vouloir..."
- "Je remarque que vous créez toujours un service après un store → le générer ?"
- "Pattern détecté : nouvelle route → test e2e → voulez-vous que je le prépare ?"
```

#### Workflows personnalisables

##### Profil Développeur Senior 🎖️
- **Moins d'explications**, plus d'options avancées
- **Patterns complexes** autorisés sans validation
- **Suggestions techniques** poussées (performance, architecture)
- **Validation allégée** si historique de qualité

##### Profil Apprenant 🎓
- **Plus de contexte**, alternatives expliquées
- **Justifications** pour chaque choix technique
- **Liens ressources** et documentation
- **Validation renforcée** avec explications

##### Profil Pressé ⏰
- **Actions directes**, minimal de validation
- **Diffs immédiats** sans explication
- **Choix par défaut** intelligents
- **Résumé final** seulement

##### Profil Méticuleux 🔍
- **Vérifications étendues**, analyses d'impact
- **Alternatives multiples** toujours proposées
- **Tests supplémentaires** suggérés
- **Documentation** complète générée

### 📊 Métriques Collaboration Avancées

#### Indicateurs temps réel
| Métrique | Calcul | Seuil optimal | Action si dérive |
|----------|--------|---------------|------------------|
| Temps question→action | Horodatage réponse IA → action utilisateur | < 2 min | Simplifier réponses |
| Taux d'abandon | Propositions non suivies / total | < 20% | Réviser pertinence |
| Satisfaction implicite | Reformulations / acceptations | < 0.3 | Adapter style |
| Efficacité session | Objectifs atteints / interactions | > 0.6 | Optimiser workflow |

#### Feedback continu
```markdown
## Système de feedback léger

### Score rapide post-interaction
👍 Parfait  👌 Bien  👎 À améliorer

### Ajustement automatique
- Score < 2/3 → Reformuler approche
- Pattern 👎 répété → Changer mode interaction
- Score 👍 constant → Maintenir style

### Apprentissage préférences
- Style communication préféré
- Niveau de détail optimal
- Fréquence de validation souhaitée
```

### 🚨 Gestion Intelligente des Erreurs

#### Historique et patterns
```markdown
## Prévention proactive

### Détection récurrence
- "Cette erreur TypeScript est la 3ème fois ce mois"
- "Vous bloquez souvent sur les imports → checklist ajoutée"
- "Pattern détecté : refactor → test cassé → checklist TDD renforcée"

### Suggestions préventives
- "⚠️ Cette action a causé un rollback hier → backup suggéré"
- "💡 Vous oubliez souvent de redémarrer le serveur → ajout au script"
- "🎯 Ce type de composant nécessite généralement un test e2e"
```

### 🔄 Sessions Multi-Contextes

#### Gestion de projets multiples
- **Basculement intelligent :** "Projet A ou B ?" si ambiguïté
- **Contexte préservé :** Variables d'état par projet
- **Reprise de session :** "Nous étions sur l'authentification du projet A"

#### Collaboration équipe
```markdown
## Contexte partagé

### Handover entre développeurs
- État actuel explicite dans prompts
- Décisions importantes documentées
- Context switching facilité

### Cohérence d'équipe
- Standards appliqués uniformément
- Patterns d'équipe mémorisés
- Reviews croisées facilitées
```

### ✅ Checklist Intelligence Collaborative

- [ ] Mode d'interaction détecté et adapté
- [ ] Ton émotionnel utilisateur pris en compte
- [ ] Charge cognitive évaluée et ajustée
- [ ] Préférences utilisateur appliquées
- [ ] Métriques collaboration suivies
- [ ] Prévention d'erreurs activée
- [ ] Contexte session maintenu
- [ ] Feedback implicite capturé

---

##  Exemples pratiques de collaboration optimisée

### 🎯 Cas 1: Création d'un fichier (Exemple générique: Page de connexion)

**✅ Prompt utilisateur bien préparé :**
```
Phase 1 - Étape 1.8 : Peux-tu créer le fichier de la page de connexion ?

[FILE] Créer 'src/routes/auth/login/+page.svelte' avec le code exact de la roadmap
[TEST] npm run dev puis vérifier l'accès à /auth/login
[CHECK] Page accessible, formulaire fonctionnel, styles appliqués

Contexte : Firebase installé à l'étape 1.1, auth store créé à l'étape 1.4
```

**🤖 Réponse IA structurée :**
```
## 🎯 Action proposée
Création de la page de connexion - Phase 1, Étape 1.8

## 🔍 Vérifications CBD effectuées
- [x] Phase identifiée : Phase 1 - Firebase & Authentification
- [x] Tâche identifiée : Étape 1.8 - Page de connexion
- [x] Pré-requis validés : Firebase (1.1), Auth store (1.4)
- [x] Format prompt vérifié : [FILE], [TEST], [CHECK] présentes

## 📝 Code/Commandes exacts
[FILE] src/routes/auth/login/+page.svelte
[Code exact de la roadmap]

## 🧪 Validation post-action
[TEST] npm run dev
[CHECK] Naviguer vers http://localhost:5173/auth/login
- [ ] Page s'affiche sans erreur
- [ ] Formulaire visible avec champs email/password
- [ ] Styles Svelte appliqués correctement

## 🔄 Prochaine étape suggérée
Étape 1.9 - Page d'inscription après validation réussie
```

### 🎯 Cas 2: Correction d'erreur (Étape 0.7 - Tests échouent)

**❌ Problème :** `npm run test` échoue après création de `helpers.test.ts`

**✅ Prompt utilisateur pour déboguer :**
```
Phase 0 - Étape 0.7 : Erreur dans les tests

Erreur exacte :
[Copier le message d'erreur complet de la console]

Contexte : Vitest configuré étape 0.3, fichier helpers.test.ts créé étape 0.7
[TEST] npm run test échoue
Besoin d'analyse et correction ciblée
```

**🤖 Réponse IA de débogage :**
```
## 🎯 Action proposée
Correction de l'erreur de test - Phase 0, Étape 0.7

## 🔍 Diagnostic de l'erreur
[Analyse de l'erreur fournie]
Cause probable : [Explication technique]

## 📝 Correction proposée
[FILE] Modification de src/lib/utils/helpers.test.ts
[Code corrigé exact]

## 🧪 Validation post-correction
[TEST] npm run test
[CHECK] Tests passent au vert sans erreur

## 🚨 Prévention future
Pour éviter ce problème : [Explication de la bonne pratique]
```

## 🎓 Phase 9 : Apprentissage continu

### ✅ Adaptation et amélioration

**📈 Suivi des patterns récurrents :**
- Noter les types d'erreurs fréquentes
- Identifier les points de confusion récurrents
- Adapter les vérifications selon les retours utilisateur

**🔄 Mise à jour du CBD :**
- Ajouter de nouvelles vérifications basées sur l'expérience
- Affiner les critères selon l'évolution du projet
- Maintenir la cohérence avec les mises à jour de la roadmap

---

## 🚨 Cas d'urgence - Actions immédiates

### ⚠️ Si quelque chose ne va pas

**🆘 Erreur critique détectée :**
1. **STOP** - Ne pas continuer l'action
2. Signaler le problème clairement
3. Proposer un diagnostic rapide
4. Suggérer une solution de contournement si possible

**📞 Demande ambiguë :**
1. Demander clarification avec des options spécifiques
2. Référencer la roadmap pour le contexte
3. Proposer plusieurs interprétations possibles

**🔄 Incohérence détectée :**
1. Signaler l'incohérence avec la roadmap/architecture
2. Expliquer les implications
3. Proposer une solution alignée avec l'architecture

---

## 📚 Références rapides

### 🔗 Liens essentiels

- **Roadmap principale :** `ROADMAP.md`

- **Structure SvelteKit :** [Documentation officielle](https://kit.svelte.dev)
- **Firebase pour SvelteKit :** [Guide d'intégration](https://firebase.google.com)
- **Standards accessibilité :** [WCAG 2.1](https://www.w3.org/WAI/WCAG21/)

### 🛠️ Commandes de diagnostic rapide

```bash
# Vérification environnement
[CMD] node --version && npm --version
[CMD] ls -la (Linux/Mac) ou dir (Windows)

# Vérification projet
[CMD] npm run validate
[CMD] npm run test
[CMD] npm run build
 [CMD] npm run test:watch
 [CMD] npm run test:coverage
 [CMD] npm run test:e2e

# Nettoyage si problème
[CMD] rm -rf node_modules package-lock.json && npm install
 # (Windows équivalent manuel : supprimer dossier node_modules + package-lock.json)
```

---

## ✍️ Log des améliorations

| Date | Version | Amélioration |
|------|---------|--------------|
| 29/08/2025 | 1.0 | Version initiale CBD |
| 29/08/2025 | 1.1 | Intégration recommandations format prompt et contrôle utilisateur |
| 13/09/2025 | 1.2 | Généralisation projet, intégration TDD et section Inputs requis |
| 13/09/2025 | 1.3 | Renommage en GUIDE_AI_CBD |
| 13/09/2025 | 1.4 | Ajout Sommaire + suppression références projet spécifiques résiduelles |
| 13/09/2025 | 1.5 | Ajout section Gouvernance & Rôles (RACI, métriques collaboration) |
| 13/09/2025 | 1.6 | Ajout section Qualité des Prompts (templates, anti-ambiguïté) |
| 13/09/2025 | 1.7 | Ajout section Feedback & Métriques Collaboration |
| 13/09/2025 | 1.8 | Ajout section Sécurité & Confidentialité + corrections encodage titres |
| 13/09/2025 | 1.9 | Ajout section Dette & Refactor |
| 13/09/2025 | 1.10 | Ajout section Capitalisation & Playbooks |
| 13/09/2025 | 1.11 | Ajout section Interface & Dialogue (communication améliorée) |
| 13/09/2025 | 1.12 | Ajout sous-sections Gestion Contexte & Grammaire Visuelle |
| 13/09/2025 | 1.13 | Fusion Phase 7 dans section Interface & Dialogue |
| 13/09/2025 | 1.14 | Ajout section Visualisation & Diagrammes (Mermaid.js) |
| 13/09/2025 | 1.15 | Ajout section Intelligence Collaborative (modes adaptatifs, IA émotionnelle, gestion cognitive) |

---

> **💡 Rappel :** Ce fichier est un guide vivant. L'IA doit l'adapter selon l'évolution du projet et les retours d'expérience !

> **🤝 Principe clé :** L'utilisateur reste le chef de projet qui donne des ordres précis et valide les résultats. L'IA est l'exécutant expert qui applique les standards et propose des solutions optimisées.

> **🤝 Principe clé :** Si des tests temporaires sont effectués, ils doivent être intégrés proprement ou supprimés rapidement.

---

## 📥 Section Inputs Requis (à inclure dans les prompts)

**Contexte minimum :**
- Phase (0-6) et Étape (ex: 1.8) référencées depuis `ROADMAP.md`
- Extrait exact de la roadmap (code / description) quand action sur fichier
- Pré-requis déjà réalisés (liste courte)

**Action demandée :**
- Type (création / modification / suppression)
- Chemin(s) de fichier(s) cible(s)
- Objectif métier observable

**Qualité & Tests :**
- Commande `[TEST]` attendue (unit / e2e)
- Critères `[CHECK]` mesurables (ex: couverture > 90%, route accessible)
- Indication TDD (oui/non)

**Contraintes :**
- Libs/frameworks impliqués
- Limitations performance / sécurité / accessibilité

**Validation finale :**
- Commande de vérification
- Étape suivante prévue
