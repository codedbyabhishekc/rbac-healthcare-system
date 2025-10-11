# Quick Login Credentials Reference

## 🔐 Password Pattern
All passwords follow: **Role + 123**

---

## 👑 Default Admin (Always Available)
```
admin / admin123
```

---

## 🏥 Administrators (3)
```
admin1 / Administrator123
admin2 / Administrator123
admin3 / Administrator123
```

---

## 👨‍⚕️ Doctors (8)
```
doctor1 / Doctor123
doctor2 / Doctor123
doctor3 / Doctor123
doctor4 / Doctor123
doctor5 / Doctor123
doctor6 / Doctor123
doctor7 / Doctor123
doctor8 / Doctor123
```

---

## 👩‍⚕️ Nurses (7)
```
nurse1 / Nurse123
nurse2 / Nurse123
nurse3 / Nurse123
nurse4 / Nurse123
nurse5 / Nurse123
nurse6 / Nurse123
nurse7 / Nurse123
```

---

## 🤒 Patients (15)
```
patient1  / Patient123
patient2  / Patient123
patient3  / Patient123
patient4  / Patient123
patient5  / Patient123
patient6  / Patient123
patient7  / Patient123
patient8  / Patient123
patient9  / Patient123
patient10 / Patient123
patient11 / Patient123
patient12 / Patient123
patient13 / Patient123
patient14 / Patient123
patient15 / Patient123
```

---

## 🎯 Quick Test Accounts

### For Testing Admin Features
```
Username: admin1
Password: Administrator123
✓ View all users
✓ Delete users
✓ View patient records
```

### For Testing Doctor Features
```
Username: doctor1
Password: Doctor123
✓ View appointments
✓ Create medical records
✓ Complete appointments
```

### For Testing Nurse Features
```
Username: nurse1
Password: Nurse123
✓ Schedule appointments
✓ View all appointments
✓ Cancel appointments
```

### For Testing Patient Features
```
Username: patient1
Password: Patient123
✓ View own appointments
✓ View own medical records
✓ Limited access (RBAC testing)
```

---

## 📊 Data Summary

| Role | Count | Password Pattern |
|------|-------|------------------|
| Admin | 1 (default) + 3 | admin123 / Administrator123 |
| Doctor | 8 | Doctor123 |
| Nurse | 7 | Nurse123 |
| Patient | 15 | Patient123 |
| **Total** | **34** | - |

---

## 🚀 Quick Commands

```bash
# Seed database
cd backend
npm run seed

# Start backend
npm start

# Start frontend (new terminal)
cd frontend
npm start

# Login URL
http://localhost:3000/login
```

---

## 💡 Pro Tips

1. **Patient1 has the most data** - Best for testing patient record viewer
2. **Doctor1 has appointments** - Best for testing doctor workflow
3. **Admin1** - Best for testing all features
4. **Test RBAC** - Try logging in as different roles to see permission differences

---

## 🔄 Copy-Paste Ready

**Administrator:**
```
admin1
Administrator123
```

**Doctor:**
```
doctor1
Doctor123
```

**Nurse:**
```
nurse1
Nurse123
```

**Patient:**
```
patient1
Patient123
```

---

**Print this page or keep it handy while testing! 📋**