const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/userModel');

// Mocking dotenv pour les tests
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock pour mongoose.connect
jest.mock('../src/config/db', () => jest.fn());

describe('User API Tests', () => {
  let token;
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  // Nettoyer la base de données avant les tests
  beforeAll(async () => {
    // Mocking connection pour les tests
    process.env.JWT_SECRET = 'test_secret_key';
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  // Test d'enregistrement d'un utilisateur
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      // Mock User.findOne pour simuler que l'utilisateur n'existe pas
      User.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock User.create pour simuler la création d'un utilisateur
      User.create = jest.fn().mockResolvedValue({
        _id: 'mockid123',
        ...testUser,
        password: 'hashedpassword123'
      });

      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user).toHaveProperty('username', testUser.username);
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with existing email', async () => {
      // Mock User.findOne pour simuler que l'utilisateur existe déjà
      User.findOne = jest.fn().mockResolvedValue({ email: testUser.email });

      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cet utilisateur existe déjà');
    });
  });

  // Test de connexion d'un utilisateur
  describe('POST /api/users/login', () => {
    it('should login an existing user', async () => {
      // Mock User.findOne pour simuler la récupération d'un utilisateur
      const mockUser = {
        _id: 'mockid123',
        ...testUser,
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser)
      }));

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body).toHaveProperty('token');
      
      // Sauvegarder le token pour les tests suivants
      token = res.body.token;
    });

    it('should not login with incorrect password', async () => {
      // Mock User.findOne pour simuler la récupération d'un utilisateur
      const mockUser = {
        _id: 'mockid123',
        ...testUser,
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      
      User.findOne = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser)
      }));

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // Tests pour le profil utilisateur
  describe('GET /api/users/profile', () => {
    it('should not get profile without token', async () => {
      const res = await request(app).get('/api/users/profile');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    // Dans un environnement réel, il faudrait tester avec un token valide
    // mais ici nous devons mocker le middleware d'authentification
  });
});