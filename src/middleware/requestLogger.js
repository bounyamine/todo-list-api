const { v4: uuidv4 } = require('uuid');

/**
 * Middleware de logging des requêtes
 */
const requestLogger = (req, res, next) => {
  // Générer un ID unique pour chaque requête
  req.requestId = uuidv4();
  
  const startTime = Date.now();
  
  // Log de la requête entrante
  console.log(`📥 [${req.requestId}] ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Override de res.json pour logger la réponse
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    console.log(`📤 [${req.requestId}] ${res.statusCode} - ${duration}ms`, {
      status: res.statusCode >= 400 ? 'ERROR' : 'SUCCESS'
    });
    
    return originalJson.call(this, data);
  };

  next();
};

module.exports = requestLogger;