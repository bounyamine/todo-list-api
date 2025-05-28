/**
 * Helper pour standardiser les réponses API
 */
class ResponseHelper {
  /**
   * Réponse de succès
   */
  static success(res, data = null, message = 'Opération réussie', statusCode = 200) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Réponse de succès avec pagination
   */
  static successWithPagination(res, data, pagination, message = 'Données récupérées avec succès') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Réponse de création
   */
  static created(res, data, message = 'Ressource créée avec succès') {
    return ResponseHelper.success(res, data, message, 201);
  }

  /**
   * Réponse sans contenu
   */
  static noContent(res, message = 'Opération réussie') {
    return res.status(204).json({
      success: true,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ResponseHelper;
