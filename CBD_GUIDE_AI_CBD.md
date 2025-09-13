```markdown
# 🤖 GUIDE_AI_CBD - Check Before Doing

> **GUIDE_AI_CBD : Guide de collaboration optimisée Humain ↔ IA (Projet Générique)**  
> Version: 1.15 | Date: 13/09/2025

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

... (the rest of the original guide content with internal filename references updated similarly) ...

``` 