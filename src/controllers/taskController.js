const Task = require('../models/taskModel');
const User = require('../models/userModel');
const { validationResult } = require('express-validator');

/**
 * @desc    Créer une nouvelle tâche
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { title, description, dueDate, assignedTo } = req.body;

    // Vérifier si l'utilisateur assigné existe
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'L\'utilisateur assigné n\'existe pas'
        });
      }
    }

    // Créer la tâche
    const task = await Task.create({
      title,
      description,
      dueDate,
      assignedTo: assignedTo || null
    });

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    Récupérer toutes les tâches
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    let query = {};

    // Filtrer par statut si spécifié
    if (status) {
      query.status = status;
    }

    // Filtrer par utilisateur assigné si spécifié
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    Récupérer une tâche par son ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'username email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error(error);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    Mettre à jour une tâche
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignedTo } = req.body;

    // Vérifier si la tâche existe
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    // Vérifier si l'utilisateur assigné existe
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'L\'utilisateur assigné n\'existe pas'
        });
      }
    }

    // Mise à jour des champs
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo) task.assignedTo = assignedTo;
    
    // Si le statut change à "terminée", ajouter la date de complétion
    if (status && status !== task.status) {
      task.status = status;
      if (status === 'terminée') {
        task.completedAt = Date.now();
      } else {
        // Si la tâche n'est plus terminée, effacer la date de complétion
        task.completedAt = undefined;
      }
    }

    const updatedTask = await task.save();

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error(error);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    Supprimer une tâche
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    await task.remove();

    res.json({
      success: true,
      message: 'Tâche supprimée'
    });
  } catch (error) {
    console.error(error);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @desc    Marquer une tâche comme terminée
 * @route   PATCH /api/tasks/:id/complete
 * @access  Private
 */
const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    task.status = 'terminée';
    task.completedAt = Date.now();

    const updatedTask = await task.save();

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error(error);
    
    // Vérifier si l'erreur est due à un ID invalide
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask
};