const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Middleware pour protéger les routes, vérifie le token JWT
 */
const protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Récupérer le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur (sans le mot de passe)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        message: 'Non autorisé, token invalide'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Non autorisé, pas de token'
    });
  }
};

module.exports = { protect };