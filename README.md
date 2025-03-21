# Application de Restaurant

Une application web moderne pour la gestion d'un restaurant, permettant aux clients de consulter le menu, passer des commandes et suivre leur statut.

## Fonctionnalités

- 📱 Interface responsive et moderne
- 🍽️ Gestion du menu
- 🛒 Système de panier
- 💳 Système de paiement
- 📦 Suivi des commandes en temps réel

## Technologies Utilisées

### Frontend
- React.js
- Material-UI (MUI)
- Vite
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (installé localement ou service cloud)
- npm ou yarn

## Installation

1. Clonez le repository :
```bash
git clone [URL_DU_REPO]
cd [NOM_DU_DOSSIER]
```

2. Installez les dépendances du backend :
```bash
cd backend
npm install
```

3. Installez les dépendances du frontend :
```bash
cd ../frontend
npm install
```

4. Configurez les variables d'environnement :
   - Créez un fichier `.env` dans le dossier `backend` :
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/restaurant
```

## Lancement de l'Application

1. Démarrez le serveur backend :
```bash
cd backend
npm start
```

2. Dans un nouveau terminal, démarrez le frontend :
```bash
cd frontend
npm run dev
```

3. Ouvrez votre navigateur et accédez à :
```
http://localhost:3000
```

## Tests

Pour lancer les tests :

```bash
# Tests du backend
cd backend
npm test

# Tests du frontend
cd frontend
npm test
```

## Structure du Projet

```
├── backend/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── tests/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── public/
```

## API Endpoints

- `GET /api/menu` - Récupérer le menu
- `POST /api/menu` - Ajouter un article au menu
- `POST /api/order/cart` - Ajouter un article au panier
- `POST /api/order/place` - Placer une commande
- `POST /api/payment` - Traiter un paiement
- `GET /api/payment/:id` - Obtenir le statut d'un paiement
- `GET /api/tracking/:orderNumber` - Suivre une commande

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 