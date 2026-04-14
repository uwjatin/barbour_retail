# Barbour by Jockey Club - Application de Gestion

Application de gestion complète pour Barbour by Jockey Club avec POS, VAD (Vente À Domicile), Atelier de réparation, et Dashboard.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 15+
- Docker (optionnel pour le déploiement)

### Installation Locale

1. **Cloner le repository**
```bash
git clone https://github.com/unikwebsamir-code/barbour.git
cd barbour
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Modifier .env avec vos paramètres
```

4. **Configurer la base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev

# (Optionnel) Seed les produits
npx tsx scripts/seed-products.ts
```

5. **Démarrer le serveur**
```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

## 🐳 Déploiement avec Docker

### Build et Run avec Docker Compose

```bash
# Build l'image
docker-compose build

# Démarrer les services
docker-compose up -d
```

### Déploiement sur Portainer

1. **Build l'image Docker**
```bash
docker build -t barbour-app:latest .
```

2. **Push vers un registry (optionnel)**
```bash
docker tag barbour-app:latest votre-registry/barbour-app:latest
docker push votre-registry/barbour-app:latest
```

3. **Dans Portainer:**
   - Créer un nouveau stack
   - Utiliser le fichier `docker-compose.yml`
   - Configurer les variables d'environnement
   - Déployer

## 📋 Variables d'Environnement

Voir `.env.example` pour la liste complète des variables disponibles:

- `DATABASE_URL`: Connection string PostgreSQL
- `TWILIO_*`: Configuration SMS
- `EMAIL_*`: Configuration Email
- `NOTIFICATION_MODE`: "mock" ou "real"

## 🏗️ Architecture

- **Framework**: Nuxt.js 3
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **State Management**: Pinia

## 📁 Structure du Projet

```
├── pages/              # Pages de l'application
│   ├── vad/           # Vente À Domicile
│   ├── pos/           # Point de Vente
│   ├── atelier/       # Atelier de réparation
│   └── dashboard/     # Dashboard analytics
├── server/api/        # API endpoints
├── prisma/           # Schema et migrations
├── stores/           # Pinia stores
├── components/       # Composants Vue
└── scripts/          # Scripts utilitaires
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Mode développement
npm run build        # Build production
npm run start        # Démarrer en production
npm run generate     # Générer le site statique
npx prisma migrate   # Exécuter les migrations
npx tsx scripts/seed-products.ts  # Seed les produits
```

## 📊 Base de Données

### Modèles Principaux
- **Customer**: Clients
- **Order**: Commandes (VAD)
- **Product**: Produits
- **OrderItem**: Articles des commandes
- **Repair**: Réparations (Atelier)
- **StockMovement**: Mouvements de stock
- **Notification**: Notifications (SMS/Email)

## 🎯 Fonctionnalités

### VAD (Vente À Domicile)
- Création de commandes téléphoniques
- Gestion des clients
- Ajout d'articles avec tailles et couleurs
- Suivi des statuts de commande
- Notifications SMS/Email

### POS (Point de Vente)
- Vente en caisse
- Panier en temps réel
- Gestion des paiements
- Impression de tickets

### Atelier
- Gestion des réparations
- Suivi des statuts (devis, en cours, prêt, terminé)
- Workflow complet de réparation

### Dashboard
- Statistiques de vente
- KPIs en temps réel
- Graphiques et analytics

## 🔒 Sécurité

- Authentification à implémenter
- Validation des données avec Zod
- Protection des endpoints API
- Environment variables pour les secrets

## 📝 License

Propriétaire - Barbour by Jockey Club

## 👥 Support

Pour toute question ou assistance, contactez l'équipe technique.
