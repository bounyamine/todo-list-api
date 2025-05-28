const AppError = require('../utils/errors/AppError');
const { ErrorMessages } = require('../utils/errors/errorTypes');

/**
 * Gestionnaire d'erreurs global pour Express
 * Capture toutes les erreurs et les formate de manière cohérente
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur
  console.error('🔴 Erreur capturée:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Erreur de cast Mongoose (ID invalide)
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    error = new AppError(message, 404);
  }

  // Erreur de clé dupliquée MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} déjà utilisé`;
    error = new AppError(message, 400);
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    error = new AppError(ErrorMessages.TOKEN_INVALID, 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError(ErrorMessages.TOKEN_EXPIRED, 401);
  }

  // Réponse d'erreur formatée
  const response = {
    success: false,
    message: error.message || ErrorMessages.INTERNAL_ERROR,
    status: error.statusCode || 500,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Ajouter la stack trace en développement
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Ajouter l'ID de requête si disponible
  if (req.requestId) {
    response.requestId = req.requestId;
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * Middleware pour capturer les erreurs 404
 */
const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} non trouvée`;
  const error = new AppError(message, 404);
  next(error);
};

/**
 * Gestionnaire d'erreurs asynchrones
 * Évite les try/catch répétitifs dans les contrôleurs
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};