# BRIEF UX - Page Dashboard Direction
## Styleanglais - POS Omnicanal

---

## 1. CONTEXTE & OBJECTIF

**Page** : Tableau de bord décisionnel (route `/dashboard`)
**Objectif principal** : Donner à la direction une vue actionnable en 2 minutes (5 tuiles clés)
**Public cible** : Direction (1 personne), besoin de décisions rapides
**Contrainte** : Pas 50 graphiques inutiles, juste l'essentiel

---

## 2. CONTENU & STRUCTURE

### Layout Global
- **Structure** : Header fixe | Grid de tuiles (responsive)
- **Grid** : 1 colonne (mobile) → 2 colonnes (iPad) → 3 colonnes (desktop)
- **Gap** : 16px entre tuiles

### Header
- **Titre** : "📊 Tableau de Bord"
- **Navigation** : 
  - Bouton "Caisse" (vers `/pos`) - primary
  - Bouton "Atelier" (vers `/atelier`) - secondary

### Les 5 Tuiles (ordre prioritaire)

#### Tuile 1 : CA Semaine (💰)
**Position** : Première (priorité #1)
**Contenu** :
- Titre : "CA Semaine"
- Breakdown par canal :
  - Boutique : 8 450€ (+12%)
  - Web : 1 890€ (-5%)
  - Atelier : 3 200€ (+18%)
- Total : 13 540€ (+9%)

**Style** :
- Fond blanc, shadow
- Chiffres en gras
- Variations en couleur (vert +, rouge -)

#### Tuile 2 : Stocks Critiques (📦)
**Position** : Deuxième
**Contenu** :
- Titre : "Stocks Critiques"
- Liste des produits < seuil :
  - Veste Noir M : 2 restants (seuil: 5)
  - Doublure Beige L : 1 restant (seuil: 3)
- Bouton "Commander" par produit

**Style** :
- Fond blanc, shadow
- Items en fond rouge très clair (red-50)
- Badge "Commander" primary

#### Tuile 3 : Atelier (🔧)
**Position** : Troisième
**Contenu** :
- Titre : "Atelier"
- Stats rapides :
  - Devis en attente : 7
  - En cours : 18
  - Prêts à retirer : 4
- Lien "Voir tous les dossiers"

**Style** :
- Fond blanc, shadow
- Nombres en gras, colorés selon statut
- Lien sous forme de bouton secondaire

#### Tuile 4 : Top Ventes (📈)
**Position** : Quatrième
**Contenu** :
- Titre : "Top Ventes (7j)"
- Classement :
  1. Veste Imperméable Noir - 23 ventes
  2. Pantalon Technique Gris - 18 ventes
  3. Doublure Amovible Beige - 12 ventes

**Style** :
- Fond blanc, shadow
- Items en fond gris très clair
- Numéros 1-2-3 en couleur primary

#### Tuile 5 : Suggestions IA (⚙️)
**Position** : Cinquième
**Contenu** :
- Titre : "Suggestions Réassort"
- Alertes intelligentes :
  - 🌧️ Pluie prévue → +30% vestes
  - 📊 Rupture concurrent → opportunité
  - 📈 Pic média → anticiper demande
- Bouton "Créer commande"

**Style** :
- Fond blanc, shadow
- Alertes en fond bleu très clair
- Bouton action primary

---

## 3. DESIGN SYSTEM

### Couleurs
- Background : #F9FAFB
- Card : #FFFFFF
- Text : #1F2937
- Primary : #2563EB
- Secondary : #059669
- Success : #10B981
- Warning : #F59E0B
- Danger : #EF4444

### Typographie
- Titre page : Inter, 24px, bold
- Titre tuile : Inter, 16px, semibold
- Chiffres : Inter, 24-32px, bold
- Body : Inter, 14px

---

## 4. INTERACTIONS

### Navigation
- Click "Caisse" → `/pos`
- Click "Atelier" → `/atelier`
- Click tuile Atelier → `/atelier`
- Click "Commander" → Modal ou page commande

### Hover
- Tuiles : Légère élévation (shadow-lg)
- Boutons : Changement couleur

### Data
- Données mockées pour MVP
- Actualisation temps réel (WebSocket à venir)

---

## 5. ACCESSIBILITÉ

- Contraste 4.5:1
- Focus visible sur tuiles et boutons
- ARIA labels sur les actions
- Navigation clavier logique (tabindex)

---

## 6. FICHIERS

- `pages/dashboard/index.vue`
- `layouts/default.vue`
- Store à créer : `stores/dashboardStore.ts` (données temps réel)

---

**Date** : 7 février 2026
**Version** : 1.0 - MVP
**Priorité** : IMPORTANT
**Assigné à** : Agent UX Frontend - Module Dashboard
