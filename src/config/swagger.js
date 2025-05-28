const swaggerJSDoc = require('swagger-jsdoc');

/**
 * Configuration complète de Swagger/OpenAPI pour l'API ToDo List
 * 
 * Ce module configure la génération automatique de la documentation API
 * en utilisant swagger-jsdoc pour analyser les annotations JSDoc dans les routes.
 * 
 * @module SwaggerConfig
 * @requires swagger-jsdoc
 * @author Votre équipe de développement
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * Options de configuration pour la génération de la documentation Swagger/OpenAPI
 * 
 * @constant {Object} swaggerOptions - Configuration principale de Swagger
 * @property {Object} definition - Définition OpenAPI 3.0
 * @property {string} definition.openapi - Version de la spécification OpenAPI utilisée
 * @property {Object} definition.info - Métadonnées de l'API
 * @property {string} definition.info.title - Nom de l'API
 * @property {string} definition.info.version - Version de l'API
 * @property {string} definition.info.description - Description détaillée de l'API
 * @property {string} definition.info.contact - Informations de contact
 * @property {string} definition.info.license - Informations de licence
 * @property {Array<Object>} definition.servers - Liste des serveurs disponibles
 * @property {Object} definition.components - Composants réutilisables (schémas, réponses, etc.)
 * @property {Array<string>} apis - Chemins vers les fichiers contenant les annotations Swagger
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API ToDo List',
      version: '1.0.0',
      description: `
        API RESTful complète pour la gestion de tâches et d'utilisateurs dans une application ToDo List.
        
        ## Fonctionnalités principales
        - Gestion des utilisateurs (création, authentification, profils)
        - Gestion des tâches (CRUD complet)
        - Système d'authentification JWT
        - Validation des données
        - Gestion des erreurs standardisée
        
        ## Authentification
        Cette API utilise l'authentification JWT (JSON Web Token). 
        Incluez le token dans l'en-tête Authorization : \`Bearer <votre-token>\`
      `,
      contact: {
        name: 'Équipe de développement',
        email: 'dev@todolist.com',
        url: 'https://github.com/votre-repo/todolist-api'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      termsOfService: 'https://todolist.com/terms'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Serveur de développement local'
      },
      {
        url: process.env.PROD_SERVER_URL || 'https://api.todolist.com',
        description: 'Serveur de production'
      },
      {
        url: process.env.STAGING_SERVER_URL || 'https://staging-api.todolist.com',
        description: 'Serveur de test/staging'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT pour l\'authentification. Format: Bearer <token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['message', 'status'],
          properties: {
            message: {
              type: 'string',
              description: 'Message d\'erreur descriptif'
            },
            status: {
              type: 'integer',
              description: 'Code de statut HTTP'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Horodatage de l\'erreur'
            },
            path: {
              type: 'string',
              description: 'Chemin de la requête qui a causé l\'erreur'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Message de succès'
            },
            data: {
              type: 'object',
              description: 'Données de la réponse'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token d\'authentification manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Token d\'authentification requis',
                status: 401,
                timestamp: '2024-01-15T10:30:00Z',
                path: '/api/tasks'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Accès interdit - permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/Error' },
                  {
                    type: 'object',
                    properties: {
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            field: { type: 'string' },
                            message: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        ServerError: {
          description: 'Erreur interne du serveur',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      },
      parameters: {
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Nombre maximum d\'éléments à retourner',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        OffsetParam: {
          name: 'offset',
          in: 'query',
          description: 'Nombre d\'éléments à ignorer (pagination)',
          required: false,
          schema: {
            type: 'integer',
            minimum: 0,
            default: 0
          }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Champ de tri (préfixe avec - pour ordre décroissant)',
          required: false,
          schema: {
            type: 'string',
            example: '-createdAt'
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentification',
        description: 'Opérations d\'authentification et de gestion des sessions'
      },
      {
        name: 'Utilisateurs',
        description: 'Gestion des comptes utilisateurs'
      },
      {
        name: 'Tâches',
        description: 'Gestion des tâches ToDo'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/routes/**/*.js',
    './src/models/*.js',
    './src/controllers/*.js'
  ]
};

/**
 * Génération de la spécification Swagger/OpenAPI
 * 
 * Utilise swagger-jsdoc pour analyser les annotations JSDoc dans les fichiers
 * spécifiés et générer automatiquement la documentation API.
 * 
 * @constant {Object} swaggerSpec - Spécification OpenAPI générée
 * @throws {Error} Lance une erreur si la génération de la spécification échoue
 * 
 * @example
 * // Utilisation dans app.js
 * const swaggerSpec = require('./config/swagger');
 * const swaggerUi = require('swagger-ui-express');
 * 
 * app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 */
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Validation de la spécification générée
if (!swaggerSpec || !swaggerSpec.info) {
  console.error('❌ Erreur lors de la génération de la spécification Swagger');
  throw new Error('Spécification Swagger invalide ou manquante');
}

// Log de confirmation en mode développement
if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Spécification Swagger générée avec succès');
  console.log(`📚 Documentation disponible sur: http://localhost:${process.env.PORT || 5000}/api-docs`);
}

module.exports = swaggerSpec;