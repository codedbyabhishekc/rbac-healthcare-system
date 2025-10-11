# Healthcare RBAC System

A comprehensive Role-Based Access Control (RBAC) system built with React, Express, SQLite, JWT, and Swagger. This project demonstrates various testing strategies and best practices in full-stack development.

---

## 🔗 Quick Links

| Resource | Description |
|----------|-------------|
| [🧪 Testing Guide](TESTING_GUIDE.md) | Comprehensive testing strategies |
| [🌱 Seed Data Guide](SEED_DATA_GUIDE.md) | How to use test data (30+ records) |


---

## Features

- **Role-Based Access Control** with 4 distinct roles:
  - **Administrator**: Full system access, user management
  - **Doctor**: Manage appointments and medical records
  - **Nurse**: Schedule appointments, view patient information
  - **Patient**: View appointments and medical records

- **JWT Authentication**: Secure token-based authentication
- **RESTful API**: Well-structured endpoints with Swagger documentation
- **Responsive UI**: Clean, modern interface for all devices
- **SQLite Database**: Lightweight, file-based database

## Tech Stack

### Backend
- Node.js & Express
- SQLite3
- JWT (jsonwebtoken)
- Bcrypt for password hashing
- Swagger (swagger-jsdoc, swagger-ui-express)
- Express-validator

### Frontend
- React 18
- React Router v6
- Axios
- Context API for state management

## Project Structure

```

  ** TO Add Here **

```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create the database directory:
```bash
mkdir database
```

4. Configure environment variables (`.env` file):
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:5000`

### Seed Database with Test Data (Optional)

To populate the database with 30+ test records:

```bash
npm run seed
```

This creates:
- 3 Administrators
- 8 Doctors  
- 7 Nurses
- 15 Patients
- 22 Appointments
- 15 Medical Records

See [SEED_DATA_GUIDE.md](SEED_DATA_GUIDE.md) for complete details and passwords.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Default Credentials

The system creates a default administrator account:

- **Username**: `admin`
- **Password**: `admin123`

## API Documentation

Once the backend is running, access the Swagger documentation at:
```
http://localhost:5000/api-docs
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/role/:role` - Get users by role

#### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments (filtered by role)
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

#### Medical Records
- `POST /api/medical-records` - Create medical record (Doctor only)
- `GET /api/medical-records` - Get medical records (filtered by role)
- `GET /api/medical-records/:id` - Get record by ID
- `PUT /api/medical-records/:id` - Update record (Doctor only)
- `DELETE /api/medical-records/:id` - Delete record

## Testing Strategies

This project is designed to demonstrate various testing approaches:

### 1. Unit Testing
- Test individual functions and components
- Test middleware (authentication, authorization)
- Test database operations
- Example: `backend/tests/auth.test.js`

### 2. Integration Testing
- Test API endpoints
- Test database interactions
- Test authentication flows
- Example: `backend/tests/integration/users.test.js`

### 3. E2E Testing
- Test complete user workflows
- Test RBAC permissions across different roles
- Example: Cypress or Playwright tests

### 4. API Testing
- Use Swagger UI for manual API testing
- Postman collections for automated API testing
- Test authorization and permission boundaries

### 5. Security Testing
- Test JWT token validation
- Test password hashing
- Test SQL injection prevention
- Test XSS prevention
- Test CORS configuration

### 6. Performance Testing
- Load testing with tools like Apache JMeter
- Database query optimization
- API response time monitoring

## Running Tests

### Backend Tests
```bash
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Role Permissions Matrix

| Feature | Administrator | Doctor | Nurse | Patient |
|---------|--------------|--------|-------|---------|
| View all users | ✅ | ❌ | ❌ | ❌ |
| Create users | ✅ | ❌ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ | ❌ |
| View all appointments | ✅ | Own only | ✅ | Own only |
| Create appointments | ✅ | ✅ | ✅ | ❌ |
| Update appointments | ✅ | ✅ | ✅ | ❌ |
| Delete appointments | ✅ | ✅ | ❌ | ❌ |
| View medical records | ✅ | Own patients | ❌ | Own only |
| Create medical records | ❌ | ✅ | ❌ | ❌ |
| Update medical records | ✅ | ✅ | ❌ | ❌ |
| Delete medical records | ✅ | ✅ | ❌ | ❌ |

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based authorization middleware
- Input validation with express-validator
- SQL injection prevention (parameterized queries)
- CORS configuration
- Secure HTTP headers

## Future Enhancements

- Email notifications
- Password reset functionality
- Two-factor authentication
- Audit logging
- File upload for medical documents
- Real-time notifications with WebSockets
- Advanced reporting and analytics
- Docker containerization

## Contributing

Feel free to raise a PR

## License

MIT License

## Author

Created as a portfolio project to build other projects on.



**All artifacts are available in this conversation - scroll up to find them!** 🎯

---

## 🎉 What You Get

This complete RBAC system includes:

✅ **Backend (Express + SQLite + JWT)**
- Authentication & Authorization
- Swagger API Documentation
- 5 API route modules
- RBAC middleware
- Database seeding
- Unit & Integration tests

✅ **Frontend (React + Context API)**
- 4 Role-based dashboards
- Protected routes
- Inline form validation
- Success modals & error notifications
- Patient record viewer
- Responsive design

✅ **Documentation**
- Setup guides
- Testing strategies
- Seed data guide
- Credentials reference
- Complete file index

✅ **Features**
- JWT authentication
- Role-based permissions
- CRUD operations
- Appointment scheduling
- Medical records management
- Comprehensive patient viewer
- 30+ test records

---

**Ready to build? Start with [MASTER_FILE_INDEX.md](MASTER_FILE_INDEX.md) or [QUICK_START.md](QUICK_START.md)!** 🚀
