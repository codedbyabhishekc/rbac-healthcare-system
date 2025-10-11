# Testing Strategies Guide

This guide demonstrates various testing approaches for the Healthcare RBAC System.

## Table of Contents

1. [Unit Testing](#unit-testing)
2. [Integration Testing](#integration-testing)
3. [API Testing](#api-testing)
4. [Security Testing](#security-testing)
5. [Performance Testing](#performance-testing)
6. [E2E Testing](#e2e-testing)
7. [Test Coverage](#test-coverage)

---

## 1. Unit Testing

Unit tests verify individual functions and components in isolation.

### Backend Unit Tests

**Testing Authentication Middleware:**

```javascript
// tests/unit/auth.middleware.test.js
const { authenticateToken, authorizeRoles } = require('../../src/middleware/auth.middleware');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const token = jwt.sign({ id: 1, role: 'Doctor' }, process.env.JWT_SECRET);
      const req = {
        headers: { authorization: `Bearer ${token}` }
      };
      const res = {};
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should reject invalid token', () => {
      const req = {
        headers: { authorization: 'Bearer invalid-token' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
```

**Testing Role Authorization:**

```javascript
describe('authorizeRoles', () => {
  it('should allow authorized role', () => {
    const middleware = authorizeRoles('Administrator', 'Doctor');
    const req = { user: { role: 'Doctor' } };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should block unauthorized role', () => {
    const middleware = authorizeRoles('Administrator');
    const req = { user: { role: 'Patient' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
```

### Frontend Unit Tests

**Testing React Components:**

```javascript
// src/components/__tests__/PrivateRoute.test.js
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import { AuthProvider } from '../../context/AuthContext';

describe('PrivateRoute', () => {
  it('should render children when authenticated', () => {
    const mockAuth = { token: 'valid-token', loading: false };
    
    render(
      <BrowserRouter>
        <AuthProvider value={mockAuth}>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when not authenticated', () => {
    const mockAuth = { token: null, loading: false };
    
    render(
      <BrowserRouter>
        <AuthProvider value={mockAuth}>
          <PrivateRoute>
            <div>Protected Content</div>
          </PrivateRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
```

---

## 2. Integration Testing

Integration tests verify that multiple components work together correctly.

### Testing API Endpoints with Database

```javascript
// tests/integration/users.test.js
describe('User Management Integration', () => {
  it('should create, read, update, and delete user', async () => {
    // CREATE
    const createResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'integrationtest',
        email: 'integration@test.com',
        password: 'password123',
        role: 'Patient',
        full_name: 'Integration Test'
      });
    expect(createResponse.status).toBe(201);
    const userId = createResponse.body.userId;

    // READ
    const readResponse = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(readResponse.status).toBe(200);
    expect(readResponse.body.username).toBe('integrationtest');

    // UPDATE
    const updateResponse = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        full_name: 'Updated Name',
        email: 'updated@test.com',
        phone: '9876543210'
      });
    expect(updateResponse.status).toBe(200);

    // DELETE
    const deleteResponse = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteResponse.status).toBe(200);
  });
});
```

---

## 3. API Testing

### Manual Testing with Swagger

1. Start the backend server
2. Navigate to `http://localhost:5000/api-docs`
3. Test each endpoint with different payloads
4. Verify responses and status codes

### Automated API Testing with Postman

**Create a Postman Collection:**

```json
{
  "info": {
    "name": "RBAC Healthcare API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"username\":\"admin\",\"password\":\"admin123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

**Using Newman for CI/CD:**

```bash
npm install -g newman
newman run postman_collection.json -e environment.json
```

---

## 4. Security Testing

### Testing Authentication Security

```javascript
describe('Security Tests', () => {
  it('should hash passwords before storing', async () => {
    const password = 'testpassword123';
    // Register user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'securitytest',
        email: 'security@test.com',
        password: password,
        role: 'Patient',
        full_name: 'Security Test'
      });

    // Verify password is hashed in database
    const db = getDb();
    db.get('SELECT password FROM users WHERE username = ?', 
      ['securitytest'], 
      (err, user) => {
        expect(user.password).not.toBe(password);
        expect(user.password).toContain('$2'); // bcrypt hash prefix
      }
    );
  });

  it('should prevent SQL injection', async () => {
    const maliciousInput = "admin' OR '1'='1";
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: maliciousInput,
        password: 'anything'
      });

    expect(response.status).toBe(401);
  });

  it('should have secure JWT tokens', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const token = response.body.token;
    const decoded = jwt.decode(token);

    expect(decoded).toHaveProperty('id');
    expect(decoded).toHaveProperty('role');
    expect(decoded).toHaveProperty('exp'); // Expiration
    expect(decoded).not.toHaveProperty('password');
  });
});
```

### Testing RBAC Security

```javascript
describe('RBAC Security Tests', () => {
  it('should prevent privilege escalation', async () => {
    // Patient tries to access admin endpoint
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(response.status).toBe(403);
  });

  it('should prevent horizontal privilege escalation', async () => {
    // Patient A tries to access Patient B's data
    const responseA = await request(app)
      .get(`/api/users/${patientBId}`)
      .set('Authorization', `Bearer ${patientAToken}`);

    expect(responseA.status).toBe(403);
  });
});
```

---

## 5. Performance Testing

### Load Testing with Artillery

**Install Artillery:**

```bash
npm install -g artillery
```

**Create test configuration (`load-test.yml`):**

```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
  variables:
    username: "admin"
    password: "admin123"

scenarios:
  - name: "Login and fetch users"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            username: "{{ username }}"
            password: "{{ password }}"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/users"
          headers:
            Authorization: "Bearer {{ token }}"
```

**Run the test:**

```bash
artillery run load-test.yml
```

### Database Performance Testing

```javascript
describe('Performance Tests', () => {
  it('should handle 1000 concurrent user fetches', async () => {
    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < 1000; i++) {
      promises.push(
        request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)
      );
    }

    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`1000 requests completed in ${duration}ms`);
    expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
  });
});
```

---

## 6. E2E Testing

### Using Cypress

**Install Cypress:**

```bash
cd frontend
npm install --save-dev cypress
```

**Create test (`cypress/e2e/login.cy.js`):**

```javascript
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[type="text"]').type('admin');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Administrator').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[type="text"]').type('invalid');
    cy.get('input[type="password"]').type('wrong');
    cy.get('button[type="submit"]').click();

    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/login');
  });
});

describe('Dashboard Navigation', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('http://localhost:3000/login');
    cy.get('input[type="text"]').type('admin');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
  });

  it('should display admin dashboard', () => {
    cy.contains('Administrator Dashboard').should('be.visible');
    cy.contains('Total Users').should('be.visible');
  });

  it('should logout successfully', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
```

---

## 7. Test Coverage

### Generate Coverage Report

**Backend:**

```bash
cd backend
npm run test:coverage
```

**Frontend:**

```bash
cd frontend
npm test -- --coverage --watchAll=false
```

### Interpreting Coverage Reports

- **Statements**: Percentage of statements executed
- **Branches**: Percentage of if/else branches tested
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

**Target Coverage:**
- Minimum: 70% for all metrics
- Ideal: 80%+ for critical paths
- 90%+ for authentication and authorization code

---

## Testing Best Practices

1. **Write tests first** (TDD approach)
2. **Test edge cases** and error conditions
3. **Keep tests independent** and isolated
4. **Use descriptive test names**
5. **Mock external dependencies**
6. **Test user behavior**, not implementation
7. **Maintain test data** separately
8. **Run tests automatically** in CI/CD
9. **Review test coverage** regularly
10. **Refactor tests** as code evolves

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm install
      
      - name: Run frontend tests
        run: cd frontend && npm test -- --watchAll=false
```

---

## Conclusion

This testing guide provides a comprehensive framework for ensuring the quality, security, and performance of the Healthcare RBAC System. Implement these strategies progressively, starting with critical paths and expanding coverage over time.