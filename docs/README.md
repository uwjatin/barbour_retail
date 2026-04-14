# Briefs UX - Styleanglais POS

Ce dossier contient les briefs UX détaillés pour chaque page du MVP Styleanglais.

## Pages du MVP

1. **[brief-ux-home.md](./brief-ux-home.md)** - Page d'accueil
   - Route : `/`
   - Objectif : Accueil et orientation
   - Priorité : Standard

2. **[brief-ux-pos.md](./brief-ux-pos.md)** - Interface Caisse (CRITIQUE)
   - Route : `/pos`
   - Objectif : Encaissement < 30s
   - Priorité : CRITIQUE
   - Contrainte : 1 écran = tout

3. **[brief-ux-atelier.md](./brief-ux-atelier.md)** - Gestion Atelier
   - Route : `/atelier`
   - Objectif : Workflow réparation
   - Priorité : IMPORTANT

4. **[brief-ux-dashboard.md](./brief-ux-dashboard.md)** - Tableau de Bord
   - Route : `/dashboard`
   - Objectif : Décisions en 2 minutes (5 tuiles)
   - Priorité : IMPORTANT
   - Contrainte : Pas 50 graphiques

5. **[brief-ux-notifications.md](./brief-ux-notifications.md)** - Centre de Notifications
   - Route : `/notifications`
   - Objectif : Validation envois SMS/Email
   - Priorité : UTILE
   - Contrainte : RGPD (validation humaine)

## Design System Commun

### Couleurs
- **Background** : #F9FAFB (gray-50)
- **Card/Input** : #FFFFFF (white)
- **Text primary** : #1F2937 (gray-800)
- **Text secondary** : #6B7280 (gray-600)
- **Primary** : #2563EB (blue-600)
- **Secondary** : #059669 (emerald-600)
- **Error** : #EF4444 (red-500)
- **Alert** : #F59E0B (amber-500)

### Typographie
- **Police** : Inter (Google Fonts)
- **Titre page** : 24px, bold
- **Section** : 18px, semibold
- **Body** : 14px, regular
- **Prix** : 16px, semibold

### Composants Réutilisables
- **Cards** : bg-white, rounded-lg, shadow
- **Badges** : rounded, px-2, py-1, text-sm
- **Boutons** : rounded, px-4, py-2, transition-colors
- **Inputs** : border, rounded-lg, focus:border-primary

## Navigation entre Pages

```
Home (/) → POS (/pos) → Dashboard (/dashboard)
                ↓              ↓
            Atelier (/atelier) ←┘
                ↓
        Notifications (/notifications)
```

## Prochaines Étapes

1. **Intégration Stripe Terminal** (module paiement)
2. **Cache Offline** (IndexedDB pour produits)
3. **Authentification** (JWT, rôles)
4. **Tests** (Vitest + Playwright)
5. **CI/CD** (GitHub Actions)

---

**Date de création** : 7 février 2026
**Version** : 1.0 - MVP
**Responsable UX** : Lead UX Styleanglais
