# BRIEF UX - Page Notifications
## Styleanglais - POS Omnicanal

---

## 1. CONTEXTE & OBJECTIF

**Page** : Centre de notifications (route `/notifications`)
**Objectif principal** : Valider/envoyer les notifications (SMS/email) avant envoi + historique
**Public cible** : Direction (validation), Vendeurs (envoi)
**Contrainte** : RGPD - validation humaine obligatoire avant envoi

---

## 2. CONTENU & STRUCTURE

### Layout Global
- **Structure** : Header | Grid 2 colonnes
- **Colonnes** : Notifications en attente | Historique

### Header
- **Titre** : "🔔 Notifications"
- **Navigation** : Bouton "Dashboard" (vers `/dashboard`)

### Colonne 1 : En attente de validation
- **Titre** : "⏳ En attente de validation" + badge nombre
- **Items** :
  - Type (SMS/Email badge coloré)
  - Destinataire
  - Contenu preview
  - Boutons : "Valider & Envoyer" (vert) / "Annuler" (gris)

### Colonne 2 : Historique (24h)
- **Titre** : "📜 Historique (24h)"
- **Items** :
  - Statut (✓ envoyé / ✕ échoué)
  - Description
  - Timestamp relatif ("Il y a 2h")

---

## 3. DESIGN SYSTEM

### Couleurs
- Background : #F9FAFB
- Card : #FFFFFF
- SMS badge : bg-yellow-100, text-yellow-800
- Email badge : bg-blue-100, text-blue-800
- Success : #10B981
- Danger : #EF4444

### Typographie
- Titre : Inter, 24px, bold
- Section : Inter, 16px, semibold
- Body : Inter, 14px
- Timestamp : Inter, 12px, gray-500

---

## 4. INTERACTIONS

### Validation notification
1. User review le contenu
2. Click "Valider & Envoyer"
3. Envoi via Twilio (SMS) ou SendGrid (Email)
4. Item déplacé vers historique

### Annulation
- Click "Annuler" → Confirmation → Item supprimé

### Navigation
- Click "Dashboard" → `/dashboard`

---

## 5. ACCESSIBILITÉ

- Contraste 4.5:1
- Focus visible sur boutons
- ARIA labels sur actions
- Navigation clavier logique

---

## 6. FICHIERS

- `pages/notifications/index.vue`
- Store à créer : `stores/notificationStore.ts`
- API à créer : `/api/notifications` (envoi Twilio/SendGrid)

---

**Date** : 7 février 2026
**Version** : 1.0 - MVP
**Priorité** : UTILE
**Assigné à** : Agent UX Frontend - Module Notifications
