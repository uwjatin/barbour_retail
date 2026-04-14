# BRIEF UX - Page POS Caisse
## Styleanglais - POS Omnicanal

---

## 1. CONTEXTE & OBJECTIF

**Page** : Interface Caisse (route `/pos`)
**Objectif principal** : Encaissement ultra-rapide (< 30s), interface minimaliste
**Public cible** : Vendeurs (turnover élevé, formation 5 min)
**Contrainte** : 1 écran = tout (zéro navigation)

---

## 2. CONTENU & STRUCTURE

### Layout Global
- **Structure** : Flex column, 100vh
- **Zones** : Header (fixe) | Recherche | Panier (scrollable) | Actions (fixe)

### Header (60px)
- **Gauche** : "🛍️ POS – Styleanglais" (text-2xl, bold)
- **Droite** : "Vendeur : [Nom]" (text-sm)

### Zone Recherche (80px) - CRITIQUE
- **Input** : 
  - Width: 100%, Height: 48px
  - Placeholder: "🔍 Recherche produit ou scan code-barre..."
  - Focus: border primary (#2563EB)
  
- **Action** : Enter = ajout au panier

### Zone Panier (Flex-1, scrollable)
- **Titre** : "📦 Panier (X articles)"
- **Item** : 
  - SKU + Qté
  - Prix total
  - Bouton 🗑️ (supprimer)
- **Total** : En bas, sticky, 24px, bold

### Zone Actions (Footer - 80px)
- **Bouton Vider** : "🗑️ Vider", bg-gray-200
- **Bouton Encaisser** : "💳 ENCAISSER (F3)", bg-secondary (#059669)

---

## 3. DESIGN SYSTEM

### Couleurs
- Background : #F9FAFB
- Card/Input : #FFFFFF
- Text : #1F2937
- Primary : #2563EB
- Secondary : #059669
- Error : #EF4444

### Typographie
- Titre : Inter, 24px, bold
- Section : Inter, 18px, semibold
- Body : Inter, 14px
- Prix : Inter, 16px, semibold
- Total : Inter, 24px, bold

---

## 4. INTERACTIONS & COMPORTEMENTS

### Raccourcis Clavier (CRITIQUE)
- **F1** : Focus input recherche
- **F3** : Lancer encaissement
- **Esc** : Vider panier (confirmation)
- **Enter** : Valider recherche

### Recherche Produit
1. Tape/scan code-barre
2. Enter
3. Recherche dans products.json
4. Ajout au panier ou alert "Produit non trouvé"

### Gestion Panier
- Ajout : qté = 1 ou incrément
- Suppression : clic 🗑️ immédiat
- Vider : confirmation puis vide
- Total : calcul auto

### Checkout (Stub)
- Alert : "Le paiement sera intégré ultérieurement."
- Panier vidé

---

## 5. ACCESSIBILITÉ

- Contraste : 4.5:1 minimum
- Focus visible : Outline #2563EB
- ARIA : aria-label sur boutons
- Navigation : Tabulation logique

---

## 6. NOTES POUR LE DÉVELOPPEUR

### Fichiers
- `pages/pos/index.vue`
- `stores/cartStore.ts`
- `composables/useKeyboardShortcuts.ts`
- `public/products.json`
- `layouts/default.vue`

### Dépendances
- `@vueuse/core`
- `pinia`

### Tests
1. Ajout/suppression articles
2. Raccourcis F1, F3, Esc
3. Recherche SKU/nom
4. Responsive iPad/desktop
5. Accessibilité clavier

---

**Date** : 7 février 2026
**Version** : 1.0 - MVP
**Priorité** : CRITIQUE
**Assigné à** : Agent UX Frontend - Module Caisse
