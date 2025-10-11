const request = require('supertest');
const app = require('../server');
const { initializeDatabase } = require('../src/config/database');

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Initialize test database
    await initializeDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'Patient',
        full_name: 'Test User',
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('userId');
    });

    it('should fail with duplicate username', async () => {
      const userData = {
        username: 'admin', // Already exists
        email: 'newemail@example.com',
        password: 'password123',
        role: 'Patient',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid email', async () => {
      const userData = {
        username: 'newuser',
        email: 'invalid-email',
        password: 'password123',
        role: 'Patient',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with short password', async () => {
      const userData = {
        username: 'newuser2',
        email: 'test2@example.com',
        password: '123', // Too short
        role: 'Patient',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with invalid role', async () => {
      const userData = {
        username: 'newuser3',
        email: 'test3@example.com',
        password: 'password123',
        role: 'InvalidRole',
        full_name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials = {
        username: 'admin',
        password: 'admin123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'admin');
      expect(response.body.user).toHaveProperty('role', 'Administrator');
    });

    it('should fail with invalid username', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      const credentials = {
        username: 'admin',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});

describe('JWT Token Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get a valid token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    
    authToken = response.body.token;
  });

  it('should access protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should fail to access protected route without token', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Access token required');
  });

  it('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Invalid or expired token');
  });
});

describe('Role-Based Authorization Tests', () => {
  let adminToken, patientToken;

  beforeAll(async () => {
    // Get admin token
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminResponse.body.token;

    // Create and login as patient
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'patient1',
        email: 'patient1@example.com',
        password: 'password123',
        role: 'Patient',
        full_name: 'Patient One'
      });

    const patientResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'patient1', password: 'password123' });
    patientToken = patientResponse.body.token;
  });

  it('should allow admin to view all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should deny patient from viewing all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Access denied');
  });

  it('should allow admin to delete users', async () => {
    // Create a test user to delete
    const createResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'todelete',
        email: 'delete@example.com',
        password: 'password123',
        role: 'Patient',
        full_name: 'To Delete'
      });

    const userId = createResponse.body.userId;

    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'User deleted successfully');
  });

  it('should deny patient from deleting users', async () => {
    const response = await request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error');
  });
});