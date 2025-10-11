# Quick Start Guide

Get the Healthcare RBAC System running in 5 minutes!

## Prerequisites

- Node.js (v14+)
- npm or yarn

## 🚀 Quick Setup

### 1. Clone or Extract the Project

```bash
# If from git
git clone <your-repo-url>
cd rbac-healthcare-system

# Or extract the zip file and navigate to the directory
```

### 2. Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create database directory
mkdir database

# Start the server
npm start
```

✅ Backend running at: `http://localhost:5000`  
📚 API Docs available at: `http://localhost:5000/api-docs`

### 3. Frontend Setup (Terminal 2)

```bash
# Navigate to frontend (open new terminal)
cd frontend

# Install dependencies
npm install

# Start the app
npm start
```

✅ Frontend running at: `http://localhost:3000`

## 🔐 Default Login

**Administrator Account:**
- Username: `admin`
- Password: `admin123`

## 📋 Quick Test Checklist

1. ✅ Login with admin credentials
2. ✅ View the dashboard
3. ✅ Navigate to "User Management" tab
4. ✅ Create a new user (try Doctor or Patient role)
5. ✅ Logout and login with the new user
6. ✅ Notice different dashboard based on role

## 🎯 Quick Demo Script

### Create Complete User Accounts

1. **Login as Admin** (`admin` / `admin123`)

2. **Create a Doctor:**
   - Go to Register (or use Swagger)
   - Username: `doctor1`
   - Email: `doctor1@hospital.com`
   - Password: `doctor123`
   - Role: `Doctor`
   - Full Name: `Dr. John Smith`

3. **Create a Patient:**
   - Username: `patient1`
   - Email: `patient1@email.com`
   - Password: `patient123`
   - Role: `Patient`
   - Full Name: `Jane Doe`

4. **Create a Nurse:**
   - Username: `nurse1`
   - Email: `nurse1@hospital.com`
   - Password: `nurse123`
   - Role: `Nurse`
   - Full Name: `Sarah Williams`

### Test Different Role Perspectives

**As Nurse (nurse1):**
- Schedule appointment between patient1 and doctor1
- View all appointments
- Try to create medical record (should fail - not authorized)

**As Doctor (doctor1):**
- View your appointments
- Complete an appointment
- Create medical record for patient1
- View your medical records

**As Patient (patient1):**
- View your appointments
- View your medical records
- Try to view all users (should fail - not authorized)

**As Admin (admin):**
- View all users
- View all appointments
- Delete a test user
- Full system access

## 🔧 Troubleshooting

### Port Already in Use

**Backend (5000):**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

**Frontend (3000):**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows
```

### Database Issues

```bash
# Delete and recreate database
cd backend
rm -rf database/rbac.db
npm start  # Will recreate with fresh data
```

### Module Not Found Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📊 Using Swagger API Documentation

1. Start backend server
2. Open browser: `http://localhost:5000/api-docs`
3. Click "Authorize" button
4. Login via `/api/auth/login` to get token
5. Copy the token
6. Click "Authorize" and paste: `Bearer <your-token>`
7. Test any endpoint!

## 🧪 Running Tests

**Backend Tests:**
```bash
cd backend
npm test
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

## 📁 Project Structure Overview

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth & authorization
│   └── routes/          # API endpoints
├── tests/              # Test files
└── server.js           # Entry point

frontend/
├── src/
│   ├── components/      # Dashboard components
│   ├── context/         # Auth context
│   ├── pages/          # Login, Register, Dashboard
│   └── App.js          # Main app
└── public/             # Static files
```

## 🎓 Learning Path

1. **Explore Authentication**
   - Study `backend/src/middleware/auth.middleware.js`
   - See JWT implementation in action

2. **Understand RBAC**
   - Check `authorizeRoles` middleware
   - Test different role permissions

3. **API Design**
   - Review Swagger documentation
   - Study RESTful endpoint structure

4. **Frontend State Management**
   - Examine `AuthContext.js`
   - See React Router protected routes

5. **Testing Strategies**
   - Read `TESTING_GUIDE.md`
   - Run existing tests
   - Write your own tests

## 🚀 Next Steps

- [ ] Add more user roles
- [ ] Implement additional features
- [ ] Write comprehensive tests
- [ ] Deploy to production
- [ ] Add monitoring and logging
- [ ] Implement CI/CD pipeline

## 📞 Support

- Check `README.md` for detailed information
- Review `TESTING_GUIDE.md` for testing strategies
- Use Swagger docs for API reference

---

**Happy Coding! 🎉**