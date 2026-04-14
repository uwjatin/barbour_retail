# Index des Briefs UX - Styleanglais

## Navigation rapide

### Pages MVP (Phase 1)

1. **[Page d'Accueil](brief-ux-home.md)** - `/`
   - Accueil et orientation vers la caisse
   - Priorité: Standard

2. **[POS Caisse](brief-ux-pos.md)** - `/pos` ⭐ CRITIQUE
   - Interface encaissement ultra-rapide (< 30s)
   - Raccourcis: F1 (focus), F3 (checkout), Esc (vider)
   - Priorité: CRITIQUE

3. **[Atelier Réparation](brief-ux-atelier.md)** - `/atelier`
   - Workflow réparation (prise en charge → facturation)
   - Priorité: IMPORTANT

4. **[Dashboard](brief-ux-dashboard.md)** - `/dashboard` 🔒
   - 5 tuiles décisionnelles (CA, Stocks, Atelier, Top ventes, IA)
   - **Accès protégé** (cadenas dans la nav)
   - Priorité: IMPORTANT

5. **[Notifications](brief-ux-notifications.md)** - `/notifications`
   - Validation SMS/Email avant envoi (RGPD)
   - Priorité: UTILE

## Design System Commun

### Couleurs
```
Background    : #F9FAFB (gray-50)
Card          : #FFFFFF (white)
Text          : #1F2937 (gray-800)
Primary       : #2563EB (blue-600)
Secondary     : #059669 (emerald-600)
Error         : #EF4444 (red-500)
Alert         : #F59E0B (amber-500)
```

### Typographie
- Police : Inter (Google Fonts)
- Titres : 24px bold
- Sections : 18px semibold
- Body : 14px regular

### Composants Réutilisables
- **Cards** : bg-white, rounded-lg, shadow
- **Badges** : rounded, px-2, py-1, text-sm
- **Boutons** : rounded, px-4, py-2, transition-colors
- **Inputs** : border, rounded-lg, focus:border-primary

## Navigation entre Pages

```
┌─────────────┐
│    Home     │ ← Point d'entrée
│      /      │
└──────┬──────┘
       │
   ┌───┴───┐
   │  POS  │ ← Caisse (CRITIQUE)
   │  /pos │
   └───┬───┘
       │
   ┌───┴───┐
   │Atelier│ ← Réparations
   │/atelier
   └───┬───┘
       │
   ┌───┴───┐
   │Dashboard│ 🔒 Protégé
   │/dashboard
   └─────────┘
       │
   ┌───┴───┐
   │Notifs │
   │/notifications
   └─────────┘
```

## Phase 2 (Modules Avancés)

- Retours/Échanges
- Rapports détaillés
- Suggestions IA avancées
- Veille prix concurrence
- Programme fidélité
- Réservation produits
- Click & Collect

## Ressources

- **Design System** : `tailwind.config.cjs`
- **Composants** : `components/AppNavigation.vue`
- **Layouts** : `layouts/default.vue`
- **Stores** : `stores/` (Pinia)

---

**Date** : 7 février 2026
**Version** : 1.0 - MVP
**Responsable** : Lead UX Styleanglais
