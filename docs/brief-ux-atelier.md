# BRIEF UX - Page Atelier Réparation
## Styleanglais - POS Omnicanal

---

## 1. CONTEXTE & OBJECTIF

**Page** : Gestion Atelier (route `/atelier`)
**Objectif principal** : Gérer le workflow réparation (prise en charge → devis → validation → facturation)
**Public cible** : Vendeurs + Technicien atelier
**Volume** : 25-70 réparations/semaine

---

## 2. CONTENU & STRUCTURE

### Layout Global
- **Structure** : Header fixe | Stats cards | Liste dossiers
- **Responsive** : Grid adaptable (1-3 colonnes selon écran)

### Header
- **Titre** : "🔧 Atelier Réparation"
- **Navigation** : Bouton "Retour Caisse" (vers `/pos`)

### Stats Cards (3 cards)
1. **Nouveau Dossier**
   - Icône : 📋
   - Bouton : "+ Créer une réparation"
   - Action : Ouvre formulaire (modal ou page)

2. **En Cours**
   - Icône : ⏳
   - Nombre : "12" (text-2xl, bold, color alert)
   - Label : "En Cours"

3. **Prêts à Retirer**
   - Icône : ✅
   - Nombre : "4" (text-2xl, bold, color secondary)
   - Label : "Prêts à Retirer"

### Liste des Dossiers
- **Titre** : "📋 Liste des Dossiers"
- **Items** : 
  - REP-XXXX (numéro dossier)
  - Nom client - Description
  - Badge statut (couleur selon statut)
  - Bouton action (Voir / Encaisser)

### Statuts et Couleurs
- **Devis envoyé** : bg-alert/20, text-alert (orange)
- **En cours** : bg-primary/20, text-primary (bleu)
- **Prêt à retirer** : bg-secondary/20, text-secondary (vert)
- **Terminé** : bg-gray-100, text-gray-600 (gris)

---

## 3. DESIGN SYSTEM

### Couleurs
- Background : #F9FAFB
- Card : #FFFFFF
- Text : #1F2937
- Primary : #2563EB
- Secondary : #059669
- Alert : #F59E0B
- Error : #EF4444

### Typographie
- Titre page : Inter, 24px, bold
- Stats nombres : Inter, 32px, bold
- Body : Inter, 14px

---

## 4. INTERACTIONS

### Navigation
- Click "Retour Caisse" → `/pos`
- Click "Créer une réparation" → Modal formulaire
- Click "Voir" → Détail du dossier
- Click "Encaisser" → Page caisse avec dossier pré-sélectionné

### Workflow Réparation (à implémenter)
1. **Prise en charge** : Formulaire (client, description, photos)
2. **Création devis** : Montant TTC, délai estimé
3. **Envoi notification** : SMS/Email client avec lien validation
4. **Validation client** : Lien web simple (Accepter/Refuser)
5. **Réparation** : Changement statut "En cours"
6. **Terminé** : Statut "Prêt à retirer", notification client
7. **Encaissement** : Paiement en caisse, facture

---

## 5. ACCESSIBILITÉ

- Contraste 4.5:1 minimum
- Focus visible sur boutons
- ARIA labels sur les actions
- Navigation clavier logique

---

## 6. FICHIERS

- `pages/atelier/index.vue`
- `stores/repairStore.ts` (à créer)
- `composables/useRepairWorkflow.ts` (à créer)
- `layouts/default.vue`

---

**Date** : 7 février 2026
**Version** : 1.0 - MVP
**Priorité** : IMPORTANT
**Assigné à** : Agent UX Frontend - Module Atelier
