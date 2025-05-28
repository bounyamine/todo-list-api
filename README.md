# API REST To-Do List

API REST développée avec NodeJS, Express et MongoDB pour la gestion d'une liste de tâches (To-Do list).

## Fonctionnalités

- Gestion des utilisateurs (inscription, connexion, profil)
- Gestion des tâches (CRUD)
- Assignation de tâches à des utilisateurs
- Marquage des tâches comme terminées
- Documentation API avec Swagger
- Tests unitaires et d'intégration

## Technologies utilisées

- **Backend**: Node.js avec Express.js
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT (JSON Web Token)
- **Validation**: Express Validator
- **Documentation API**: Swagger/OpenAPI
- **Tests**: Jest et Supertest

## Configuration requise

- Node.js 14+ et npm
- MongoDB (local ou distant)

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-username/todo-list-api.git
cd todo-list-api
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-list
JWT_SECRET=votre_secret_jwt_super_securise
NODE_ENV=development
```
