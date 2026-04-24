# Football Management System - PHASE 1

## Structure du Projet

```
football-manager/
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Database, schema, seed
│   │   ├── controllers/   # Auth & User controllers
│   │   ├── middlewares/   # Auth & Role middleware
│   │   └── routes/        # API routes
│   ├── package.json
│   └── server.js
│
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/           # Axios API
│   │   ├── components/    # Layout components
│   │   ├── pages/         # Pages (auth, dashboards, admin, profile)
│   │   ├── store/         # Zustand stores
│   │   ├── routes/        # Protected routes
│   │   └── utils/         # Utilities
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Prérequis

- Node.js 18+
- Mysql2
- npm ou yarn

## Installation

### 1. Base de données PostgreSQL

Créer la base de données :
```bash
createdb football_management
```

Ou via psql :
```sql
CREATE DATABASE football_management;
```

### 2. Backend

```bash
cd server
npm install
```

Configurer le fichier `.env` :
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=football_management
DB_USER=root
DB_PASSWORD=

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:5173
```

Démarrer le serveur :
```bash
npm start
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

## Comptes de test (seedés automatiquement)

| Rôle |
|------|
| Super Admin | 
| Admin Sportif |
| Responsable Club |
| Arbitre |
| Visiteur |

## Fonctionnalités implémentées (Phase 1)

### Authentification
- Login avec email/username + mot de passe
- JWT authentication
- Changement de mot de passe
- Déconnexion
- Redirection selon le rôle

### Gestion des utilisateurs (Super Admin)
- Liste paginée avec recherche et filtre
- Création d'utilisateur
- Modification d'utilisateur
- Suppression d'utilisateur
- Activation/désactivation
- Changement de rôle

### Dashboards par rôle
- **Super Admin** : Stats utilisateurs, répartition par rôle
- **Admin Sportif** : Dashboard vide (prêt pour modules football)
- **Responsable Club** : Dashboard vide
- **Arbitre** : Dashboard vide
- **Visiteur** : Dashboard public

### Interface
- Sidebar dynamique selon le rôle
- Header avec utilisateur connecté
- Modales pour CRUD
- Tableaux avec pagination
- Formulaires avec validation
- Toasts notifications

## Routes API

### Auth
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil connecté
- `PUT /api/auth/change-password` - Changer mot de passe

### Users (Super Admin only pour création/suppression)
- `GET /api/users` - Liste paginée
- `GET /api/users/:id` - Détail utilisateur
- `POST /api/users` - Créer utilisateur
- `PUT /api/users/:id` - Modifier utilisateur
- `PATCH /api/users/:id/role` - Changer rôle
- `PATCH /api/users/:id/status` - Activer/désactiver
- `DELETE /api/users/:id` - Supprimer utilisateur

## Prochaines phases

Phase 2 prévoit l'implémentation des modules :
- Clubs
- Joueurs
- Compétitions
- Matchs
- Résultats
- Classements
- Trophées
