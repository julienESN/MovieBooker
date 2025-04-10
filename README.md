# MovieBooker API

https://moviebooker-0yos.onrender.com/api


- MovieBooker est une API permettant aux utilisateurs de consulter des films et de réserver des séances. L'application est construite avec NestJS et propose une authentification JWT, une intégration avec l'API TMDB et un système de réservation.

## 🚀 Fonctionnalités

- **Authentification**: Inscription et connexion des utilisateurs avec JWT
- **Catalogue de Films**: Intégration avec l'API TMDB pour accéder à des milliers de films
  - Films à l'affiche
  - Recherche par titre
  - Détails d'un film
  - Liste des genres
- **Gestion des Réservations**:
  - Création de réservations pour des films
  - Gestion des créneaux de 2h par film
  - Vérification des conflits pour éviter les chevauchements
  - Consultation et annulation des réservations

## 📋 Prérequis

- Node.js (v16+)
- PostgreSQL
- API TMDB (J'ai laissé mon bearer token dans le code, mais vous pouvez le remplacer par le vôtre)

## 🔧 Installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/votre-nom/moviebooker.git
cd moviebooker
cd auth-api
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration des variables d'environnement**

Créez un fichier `.env` à la racine du projet:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=moviebooker
JWT_SECRET=votre_secret_jwt_ultra_securise
JWT_EXPIRES_IN=24h
```

4. **Créer la base de données PostgreSQL**

```bash
createdb moviebooker
```

5. **Lancer l'application**

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

## 📚 Documentation API (Swagger)

Une fois l'application lancée, la documentation Swagger est disponible à l'adresse:

```
http://localhost:3000/api
```

### Utilisation de Swagger

1. **Authentification**:

   - Utilisez d'abord les endpoints `/auth/register` ou `/auth/login` pour obtenir un token JWT
   - Cliquez sur le bouton de cadenas (🔒) en haut à droite
   - Entrez votre token au format `votre_token_jwt_ici`
   - Cliquez sur "Authorize"

2. **Tester les endpoints**:
   - Tous les endpoints nécessitant une authentification sont marqués d'un cadenas
   - Cliquez sur un endpoint pour l'ouvrir
   - Remplissez les paramètres nécessaires
   - Cliquez sur "Execute" pour tester

## 🏛️ Architecture du Projet

```
src/
├── auth/                # Module d'authentification
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # Guards pour la protection des routes
│   └── strategies/      # Stratégies Passport
├── movies/              # Module de gestion des films (TMDB)
│   ├── dto/
│   └── interfaces/
├── reservation/         # Module de réservation
│   ├── dto/
│   └── entities/
├── user/                # Module utilisateur
│   ├── entities/
│   └── models/
└── main.ts              # Point d'entrée de l'application
```

## 📝 Exemples d'utilisation de l'API

### 1. Inscription d'un utilisateur

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "Password123!"
}

// Réponse en cas de succès
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-04-07T12:58:08.566Z",
    "updatedAt": "2025-04-07T12:58:08.566Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Connexion

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

// Réponse
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-04-07T12:58:08.566Z",
    "updatedAt": "2025-04-07T12:58:08.566Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Obtenir les films à l'affiche

```http
GET /movies/now_playing
Authorization: Bearer votre_token_jwt

// Réponse (partielle)
{
  "dates": {
    "maximum": "2025-04-16",
    "minimum": "2025-03-05"
  },
  "page": 1,
  "results": [
    {
      "adult": false,
      "backdrop_path": "/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg",
      "genre_ids": [10751, 35, 12, 14],
      "id": 950387,
      "original_language": "en",
      "original_title": "A Minecraft Movie",
      "overview": "Four misfits find themselves struggling with ordinary problems...",
      "popularity": 1004.1124,
      "poster_path": "/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg",
      "release_date": "2025-03-31",
      "title": "A Minecraft Movie",
      "video": false,
      "vote_average": 6.028,
      "vote_count": 321
    },
    // autres films...
  ]
}
```

### 4. Recherche de films

```http
GET /movies/search?query=Titanic
Authorization: Bearer votre_token_jwt

// Réponse similaire à now_playing avec les résultats de recherche
```

### 5. Détails d'un film par ID

```http
GET /movies/11021
Authorization: Bearer votre_token_jwt

// Réponse avec les détails du film Titanic
```

### 6. Liste des genres de films

```http
GET /movies
Authorization: Bearer votre_token_jwt

// Réponse avec la liste des genres
```

### 7. Création d'une réservation

```http
POST /reservations
Content-Type: application/json
Authorization: Bearer votre_token_jwt

{
  "movieId": 11021,
  "movieTitle": "Titanic",
  "startTime": "2025-04-10T18:00:00.000Z"
}

// Réponse
{
  "id": 2,
  "movieId": 11021,
  "movieTitle": "Titanic",
  "userId": 1,
  "startTime": "2025-04-10T18:00:00.000Z",
  "endTime": "2025-04-10T20:00:00.000Z",
  "createdAt": "2025-04-09T13:01:22.463Z",
  "updatedAt": "2025-04-09T13:01:22.463Z"
}
```

### 8. Récupération des réservations

```http
GET /reservations
Authorization: Bearer votre_token_jwt

// Réponse
[
  {
    "id": 2,
    "movieId": 11021,
    "movieTitle": "Titanic",
    "userId": 1,
    "startTime": "2025-04-10T18:00:00.000Z",
    "endTime": "2025-04-10T20:00:00.000Z",
    "createdAt": "2025-04-09T13:01:22.463Z",
    "updatedAt": "2025-04-09T13:01:22.463Z"
  }
]
```

### 9. Créneaux disponibles

```http
GET /reservations/available?date=2025-04-09
Authorization: Bearer votre_token_jwt

// Réponse
[
  {
    "startTime": "2025-04-09T08:00:00.000Z",
    "endTime": "2025-04-09T10:00:00.000Z"
  },
  {
    "startTime": "2025-04-09T10:00:00.000Z",
    "endTime": "2025-04-09T12:00:00.000Z"
  },
  // autres créneaux disponibles...
]
```

### 10. Récupérer une réservation par ID

```http
GET /reservations/2
Authorization: Bearer votre_token_jwt

// Réponse avec les détails de la réservation
```

### 11. Annuler une réservation

```http
DELETE /reservations/2
Authorization: Bearer votre_token_jwt

// Réponse
{
  "message": "Réservation annulée avec succès"
}
```

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 👥 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.
