/**
 * Types d'erreurs standardisées pour l'application
 */
const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
};

/**
 * Messages d'erreur standardisés
 */
const ErrorMessages = {
  // Authentification
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  TOKEN_MISSING: 'Token d\'authentification manquant',
  TOKEN_INVALID: 'Token d\'authentification invalide',
  TOKEN_EXPIRED: 'Token d\'authentification expiré',
  ACCESS_DENIED: 'Accès refusé - permissions insuffisantes',
  
  // Utilisateurs
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  USER_ALREADY_EXISTS: 'Un utilisateur avec cet email existe déjà',
  USER_INACTIVE: 'Compte utilisateur inactif',
  
  // Tâches
  TASK_NOT_FOUND: 'Tâche non trouvée',
  TASK_ACCESS_DENIED: 'Vous n\'avez pas accès à cette tâche',
  
  // Validation
  INVALID_INPUT: 'Données d\'entrée invalides',
  REQUIRED_FIELD: 'Ce champ est obligatoire',
  INVALID_EMAIL: 'Format d\'email invalide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
  
  // Général
  INTERNAL_ERROR: 'Erreur interne du serveur',
  DATABASE_CONNECTION_ERROR: 'Erreur de connexion à la base de données',
  RATE_LIMIT_EXCEEDED: 'Trop de requêtes - veuillez réessayer plus tard'
};

module.exports = { ErrorTypes, ErrorMessages };
