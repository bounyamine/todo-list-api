const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();

// Connexion à la base de données MongoDB
connectDB();

// Middleware
app.use(cors());                    // Gestion des CORS
app.use(helmet());                  // Sécurité HTTP
app.use(express.json());            // Parser JSON
app.use(express.urlencoded({ extended: true }));  // Parser URL-encoded

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Route par défaut
app.get('/', (req, res) => {
  res.send('API ToDo List fonctionnelle. Consultez /api-docs pour la documentation.');
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Documentation API disponible sur http://localhost:${PORT}/api-docs`);
});

module.exports = app;