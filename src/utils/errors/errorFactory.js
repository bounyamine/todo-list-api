const AppError = require('./AppError');
const { ErrorMessages } = require('./errors/errorTypes');

/**
 * Factory pour créer des erreurs standardisées
 */
class ErrorFactory {
  // Erreurs d'authentification
  static createAuthenticationError(message = ErrorMessages.INVALID_CREDENTIALS) {
    return new AppError(message, 401);
  }

  static createAuthorizationError(message = ErrorMessages.ACCESS_DENIED) {
    return new AppError(message, 403);
  }

  static createTokenError(message = ErrorMessages.TOKEN_INVALID) {
    return new AppError(message, 401);
  }

  // Erreurs de validation
  static createValidationError(message = ErrorMessages.INVALID_INPUT, errors = []) {
    const error = new AppError(message, 400);
    error.errors = errors;
    return error;
  }

  static createRequiredFieldError(fieldName) {
    return new AppError(`${fieldName} est requis`, 400);
  }

  // Erreurs de ressources
  static createNotFoundError(resource = 'Ressource') {
    return new AppError(`${resource} non trouvé(e)`, 404);
  }

  static createDuplicateError(field) {
    return new AppError(`${field} déjà utilisé`, 409);
  }

  // Erreurs de base de données
  static createDatabaseError(message = ErrorMessages.DATABASE_CONNECTION_ERROR) {
    return new AppError(message, 500);
  }

  // Erreurs de rate limiting
  static createRateLimitError(message = ErrorMessages.RATE_LIMIT_EXCEEDED) {
    return new AppError(message, 429);
  }
}

module.exports = ErrorFactory;
