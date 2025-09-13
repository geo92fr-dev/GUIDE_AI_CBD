```markdown
# PROMPTS_EXAMPLES - Exemples anonymisés de prompts

Ce fichier contient des templates de prompts validés (anonymisés) que vous pouvez adapter pour accélérer les interactions avec l'IA en respectant la structure recommandée du GUIDE_AI_CBD.

Règles d'usage :
- Remplacez les valeurs entre `<>` par vos éléments réels.
- Conservez les balises `[OBJECTIF]`, `[CONTEXTE]`, `[FILE]`, `[TEST]`, `[CHECK]` lorsque pertinentes.
- Si un prompt manipule des secrets, fournissez un équivalent mock ou énoncez clairement que les valeurs sont masquées.

---

## 1) Création de fichier - Composant / Page

Phase 1 - Étape 1.8 : Créer la page de connexion

[OBJECTIF] Créer `src/routes/auth/login/+page.svelte` conforme à la roadmap et testable
[CONTEXTE] Firebase installé (Phase 1.1), store auth présent
[FILE] src/routes/auth/login/+page.svelte
[TEST] npm run dev puis vérifier l'accès à /auth/login
[CHECK] Page accessible, formulaire email/password visible, styles appliqués

---

## 2) Refactor ciblé

Phase 3 - Étape 3.2 : Refactor store sessions

[OBJECTIF] Extraire la logique `expireAt` dans un util `src/lib/utils/date.ts`
[CONTEXTE] Duplication observée dans `src/lib/stores/sessions.ts` (3 occurrences)
[FILE] src/lib/stores/sessions.ts
[TEST] npm run test -- sessions
[CHECK] Couverture inchangée, duplication supprimée

---

## 3) Débogage / Correction de test

Phase 0 - Étape 0.7 : Test échoue sur `formatDate`

[ERREUR] Coller le message d'erreur exact ici
[CONTEXTE] Vitest configuré, `helpers.test.ts` ajouté hier
[TEST] npm run test
[CHECK] Tous les tests utils passent

---

## 4) Revue de PR - checklist automatique

Phase X - Revue PR : Demandez une revue critique

[OBJECTIF] Vérifier que la PR respecte TDD, style et tests
[FILE] <liste des fichiers modifiés>
[CHECK]
- Tests ajoutés/ajustés
- Aucun secret dans le diff
- Changelog / DECISIONS mis à jour si impact

---

## 5) Génération de tests unitaires (TDD starter)

Phase Y - Ajouter tests pour `calculateTotal`

[OBJECTIF] Écrire le test RED pour `calculateTotal` qui normalise prix et quantité
[FILE] src/lib/utils/calc.test.ts
[TEST] npm run test -- calc
[CHECK] Test rouge initial, implémentation verte ensuite, refactor final

---

## 6) Documentation / Guide d'utilisation

Phase Z - Mise à jour docs

[OBJECTIF] Ajouter section dans `CBD/CBD_GUIDE_IA.md` décrivant l'usage d'une nouvelle fonctionnalité
[FILE] CBD/CBD_GUIDE_IA.md
[TEST] Aucune commande; vérification visuelle + validation PR
[CHECK] Section presence + lien TOC mis à jour

---

## Template court pour demandes rapides

Phase <X> - <Étape>

[OBJECTIF] <but métier>
[CONTEXTE] <pré-requis et contraintes>
[FILE] <chemin(s)> (optionnel)
[TEST] <commande de test attendue>
[CHECK] <critères mesurables>

---

Contribuez en ajoutant d'autres prompts anonymisés dans ce fichier lorsque vous trouvez une formulation performant bien adaptée à votre workflow.

```
