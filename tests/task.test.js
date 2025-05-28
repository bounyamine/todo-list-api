const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock du middleware d'authentification
jest.mock('../src/middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'mockuserid123' };
    next();
  }
}));

// Charger app APRÈS les mocks
const app = require('../src/app');
const Task = require('../src/models/taskModel');
const User = require('../src/models/userModel');

// Mock pour dotenv et connexion à la base de données
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('../src/config/db', () => jest.fn());

describe('Task API Tests', () => {
  let token;
  const mockUserId = 'mockuserid123';

  // Créer un token JWT pour les tests
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_key';
    token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET);
  });
  
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // Test de création d'une tâche
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        dueDate: new Date(),
        assignedTo: mockUserId
      };

      // Mock pour vérifier si l'utilisateur existe
      User.findById = jest.fn().mockResolvedValue({ _id: mockUserId });
      
      // Mock pour créer une tâche
      Task.create = jest.fn().mockResolvedValue({
        _id: 'mocktaskid123',
        ...taskData,
        status: 'à faire',
        createdAt: new Date()
      });

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.task).toHaveProperty('_id');
      expect(res.body.task).toHaveProperty('title', taskData.title);
    });

    it('should not create a task without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Task without title'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // Test de récupération de tâches
  describe('GET /api/tasks', () => {
    it('should get all tasks', async () => {
      // Mock pour récupérer les tâches
      const mockTasks = [
        {
          _id: 'task1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'à faire'
        },
        {
          _id: 'task2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'en cours'
        }
      ];

      Task.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          sort: jest.fn().mockResolvedValue(mockTasks)
        }))
      }));

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('tasks');
      expect(res.body.tasks.length).toBe(2);
    });
  });

  // Test de récupération d'une tâche par son ID
  describe('GET /api/tasks/:id', () => {
    it('should get task by ID', async () => {
      const mockTask = {
        _id: 'task1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'à faire'
      };

      Task.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockTask)
      }));

      const res = await request(app)
        .get('/api/tasks/task1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('task');
      expect(res.body.task).toHaveProperty('_id', 'task1');
    });

    it('should return 404 for non-existent task', async () => {
      Task.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null)
      }));

      const res = await request(app)
        .get('/api/tasks/nonexistent')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // Test de mise à jour d'une tâche
  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'en cours'
      };

      const mockTask = {
        _id: 'task1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'à faire',
        save: jest.fn().mockResolvedValue({
          _id: 'task1',
          ...updateData,
          description: 'Description 1'
        })
      };

      Task.findById = jest.fn().mockResolvedValue(mockTask);

      const res = await request(app)
        .put('/api/tasks/task1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.task).toHaveProperty('title', updateData.title);
      expect(res.body.task).toHaveProperty('status', updateData.status);
    });
  });

  // Test pour marquer une tâche comme terminée
  describe('PATCH /api/tasks/:id/complete', () => {
    it('should mark a task as completed', async () => {
      const mockTask = {
        _id: 'task1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'à faire',
        save: jest.fn().mockResolvedValue({
          _id: 'task1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'terminée',
          completedAt: expect.any(Date)
        })
      };

      Task.findById = jest.fn().mockResolvedValue(mockTask);

      const res = await request(app)
        .patch('/api/tasks/task1/complete')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.task).toHaveProperty('status', 'terminée');
      expect(res.body.task).toHaveProperty('completedAt');
    });
  });

  // Test de suppression d'une tâche
  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const mockTask = {
        _id: 'task1',
        title: 'Task 1',
        remove: jest.fn().mockResolvedValue(true)
      };

      Task.findById = jest.fn().mockResolvedValue(mockTask);

      const res = await request(app)
        .delete('/api/tasks/task1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Tâche supprimée');
    });
  });
});