const { validationResult } = require('express-validator');
const ErrorFactory = require('../errors/errorFactory');

/**
 * Middleware pour vérifier les erreurs de validation express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    const validationError = ErrorFactory.createValidationError(
      'Erreurs de validation détectées',
      formattedErrors
    );

    return next(validationError);
  }

  next();
};

/**
 * Créer une réponse de validation personnalisée
 */
const createValidationResponse = (errors) => {
  return {
    success: false,
    message: 'Erreurs de validation',
    errors: errors.map(error => ({
      field: error.field,
      message: error.message,
      code: error.code || 'VALIDATION_ERROR'
    }))
  };
};

module.exports = {
  handleValidationErrors,
  createValidationResponse
};
