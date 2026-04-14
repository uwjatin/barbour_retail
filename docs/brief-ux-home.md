# BRIEF UX - Page d'Accueil (Home)
## Styleanglais - POS Omnicanal

---

## 1. CONTEXTE & OBJECTIF

**Page** : Page d'accueil (route `/`)
**Objectif principal** : Accueillir l'utilisateur et orienter vers la caisse
**Public cible** : Tous les utilisateurs (vendeurs, direction)

---

## 2. CONTENU & STRUCTURE

### Layout
- Centré, minimaliste, 100vh
- Alignement vertical et horizontal centré

### Éléments UI

#### Header
- **Logo** : "🏪 Styleanglais" (text-4xl, bold)
- **Sous-titre** : "Gestion de votre boutique de vêtements techniques"

#### CTA Principal
- **Bouton** : "Accéder à la caisse"
- **Style** : bg-secondary (#059669), text-white
- **Action** : Navigation vers `/pos`

---

## 3. DESIGN SYSTEM

### Couleurs
- Background : #F9FAFB
- Texte : #1F2937
- Primary : #2563EB
- Secondary : #059669

### Typographie
- Titre : Inter, 36px, bold
- Sous-titre : Inter, 18px
- Bouton : Inter, 16px, semibold

---

## 4. INTERACTIONS

- **F1** : Focus sur le bouton principal
- **Enter** : Active le bouton (même que clic)
- **Hover** : Changement de couleur secondary → secondary/90

---

## 5. ACCESSIBILITÉ

- Contraste minimum 4.5:1
- Focus visible sur le bouton
- ARIA label sur le CTA

---

## 6. FICHIERS

- `pages/index.vue`
- `layouts/default.vue`

---

**Date** : 7 février 2026
**Version** : 1.0 - MVP
**Assigné à** : Agent UX Frontend - Module Home
