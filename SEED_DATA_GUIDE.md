# Seed Data Guide

This guide explains how to populate your database with test data for development and testing.

## 🌱 What Does the Seed Script Do?

The seed script creates **33 users** with realistic healthcare data:

### Users Created
- **3 Administrators** - Hospital management staff
- **8 Doctors** - Various medical specialists  
- **7 Nurses** - Nursing staff
- **15 Patients** - People seeking medical care

### Additional Data
- **22 Appointments** - Mix of scheduled, completed, and cancelled
- **15 Medical Records** - Diagnoses and prescriptions
- All with realistic medical scenarios

---

## 🚀 How to Run the Seed Script

### Method 1: Using npm script (Recommended)

```bash
cd backend
npm run seed
```

### Method 2: Direct execution

```bash
cd backend
node seed.js
```

### What Happens:
1. ✅ Clears existing data (keeps default admin)
2. ✅ Creates 33 users with hashed passwords
3. ✅ Creates appointments between patients and doctors
4. ✅ Creates medical records for patients
5. ✅ Displays summary of what was created

---

## 🔐 Login Credentials

All passwords are same: **pass@123**

### Default Admin (Always Available)
```
Username: admin
Password: admin123
```

### User Details

All passwords are same: **pass@123**

#### Administrators
| Username | Full Name | Phone | Email |
|----------|-----------|-------|-------|
| admin1 | Sarah Johnson | 555-0101 | admin1@hospital.com |
| admin2 | Michael Chen | 555-0102 | admin2@hospital.com |
| admin3 | Emily Davis | 555-0103 | admin3@hospital.com |

#### Doctors
| Username | Full Name | Phone | Email |
|----------|-----------|-------|-------|
| doctor1 | Dr. James Wilson | 555-0201 | doctor1@hospital.com |
| doctor2 | Dr. Lisa Anderson | 555-0202 | doctor2@hospital.com |
| doctor3 | Dr. Robert Martinez | 555-0203 | doctor3@hospital.com |
| doctor4 | Dr. Jennifer Taylor | 555-0204 | doctor4@hospital.com |
| doctor5 | Dr. David Brown | 555-0205 | doctor5@hospital.com |
| doctor6 | Dr. Amanda White | 555-0206 | doctor6@hospital.com |
| doctor7 | Dr. Christopher Lee | 555-0207 | doctor7@hospital.com |
| doctor8 | Dr. Maria Garcia | 555-0208 | doctor8@hospital.com |

#### Nurses
| Username | Full Name | Phone |
|----------|-----------|-------|
| nurse1 | Nancy Thompson | 555-0301 |
| nurse2 | Patricia Moore | 555-0302 |
| nurse3 | Linda Jackson | 555-0303 |
| nurse4 | Barbara Harris | 555-0304 |
| nurse5 | Susan Clark | 555-0305 |
| nurse6 | Jessica Lewis | 555-0306 |
| nurse7 | Michelle Walker | 555-0307 |

#### Patients
| Username | Full Name | Phone |
|----------|-----------|-------|
| patient1 | John Smith | 555-1001 |
| patient2 | Mary Johnson | 555-1002 |
| patient3 | William Brown | 555-1003 |
| patient4 | Patricia Jones | 555-1004 |
| patient5 | Robert Davis | 555-1005 |
| patient6 | Jennifer Miller | 555-1006 |
| patient7 | Michael Wilson | 555-1007 |
| patient8 | Linda Moore | 555-1008 |
| patient9 | David Taylor | 555-1009 |
| patient10 | Barbara Anderson | 555-1010 |
| patient11 | Richard Thomas | 555-1011 |
| patient12 | Susan Jackson | 555-1012 |
| patient13 | Joseph White | 555-1013 |
| patient14 | Jessica Harris | 555-1014 |
| patient15 | Thomas Martin | 555-1015 |

### Appointment Types

**Scheduled Appointments (Future):**
- Annual physical examinations
- Follow-up consultations
- Diabetes management reviews
- Hypertension check-ups
- Allergy consultations
- Skin examinations

**Completed Appointments (Past):**
- Initial consultations
- Blood pressure monitoring
- Lab results reviews
- Medication adjustments
- Flu symptoms treatment
- Routine check-ups

**Cancelled Appointments:**
- Dental pain (patient cancelled)
- Eye examination (rescheduled)

### Medical Conditions Included

The seed data includes realistic medical records for:
- Hypertension
- Type 2 Diabetes
- Common Cold
- GERD (Acid Reflux)
- Acute Bronchitis
- Anxiety Disorder
- Lumbar Strain (Back Pain)
- Migraine
- Seasonal Allergies
- Vitamin D Deficiency
- Upper Respiratory Infections
- Osteoarthritis
- Insomnia

---

## 🧪 Testing Scenarios

### Scenario 1: Patient Journey
```bash
1. Login as patient1 / Patient123
2. View your appointments (should see 2-3)
3. View your medical records (should see 1-2)
4. Check appointment status (scheduled/completed)
```

### Scenario 2: Doctor Workflow
```bash
1. Login as doctor1 / Doctor123
2. View your appointments (see assigned patients)
3. Complete an appointment
4. Create a medical record for a patient
5. View all medical records you've created
```

### Scenario 3: Nurse Tasks
```bash
1. Login as nurse1 / Nurse123
2. View all appointments
3. Schedule a new appointment
4. Check appointment statuses
```

### Scenario 4: Admin Management
```bash
1. Login as admin1 / Administrator123
2. View all users (33 total)
3. View user statistics by role
4. Click "View Records" on any patient
5. See comprehensive patient history
```

### Scenario 5: RBAC Testing
```bash
1. Login as patient1
2. Try to access /api/users (should fail - 403)
3. Try to access another patient's records (should fail - 403)
4. Logout and login as doctor1
5. Access /api/users/role/Patient (should succeed)
6. Create a medical record (should succeed)
```

---

## 🔄 Re-running the Seed Script

**⚠️ WARNING:** Running the seed script will:
- Delete all existing appointments
- Delete all existing medical records  
- Delete all users (except the default admin)
- Create fresh seed data

**Safe to run:** Anytime you want to reset to a clean state with test data

**To preserve custom data:** Don't run the seed script, or modify it to append rather than replace

---

## 📊 Data Flow Relationships

```
Administrators (3)
├── Can view all users
├── Can delete users
└── Can view all appointments and records

Doctors (8)
├── Have appointments with patients
├── Create medical records for patients
└── Can complete/cancel appointments

Nurses (7)
├── Schedule appointments
├── View all appointments
└── Can cancel appointments

Patients (15)
├── Have appointments with doctors
├── Have medical records created by doctors
└── Can only view their own data
```

---

## 🛠️ Customizing Seed Data

### Add More Users

Edit `backend/seed.js` and add to the `users` array:

```javascript
const users = [
  // ... existing users
  { 
    username: 'patient16', 
    email: 'patient16@email.com', 
    password: 'Patient123', 
    role: 'Patient', 
    full_name: 'New Patient Name', 
    phone: '555-1016' 
  },
];
```

### Add More Appointments

Add to the `appointmentsData` array:

```javascript
const appointmentsData = [
  // ... existing appointments
  { 
    patientIndex: 31, // Index of patient in users array
    doctorIndex: 3,   // Index of doctor in users array
    date: '2024-12-25T10:00:00', 
    reason: 'Christmas checkup', 
    status: 'scheduled' 
  },
];
```

### Add More Medical Records

Add to the `medicalRecordsData` array:

```javascript
const medicalRecordsData = [
  // ... existing records
  { 
    patientIndex: 31, 
    doctorIndex: 3, 
    diagnosis: 'New Diagnosis', 
    prescription: 'New Prescription', 
    notes: 'Additional notes', 
    visitDate: '2024-12-01' 
  },
];
```

---

## 📝 Database Schema Reference

### Users Table
```sql
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- email (TEXT UNIQUE)
- password (TEXT) -- bcrypt hashed
- role (TEXT) -- Administrator, Doctor, Nurse, Patient
- full_name (TEXT)
- phone (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### Appointments Table
```sql
- id (INTEGER PRIMARY KEY)
- patient_id (INTEGER) -- FK to users
- doctor_id (INTEGER) -- FK to users
- appointment_date (DATETIME)
- status (TEXT) -- scheduled, completed, cancelled
- reason (TEXT)
- notes (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### Medical Records Table
```sql
- id (INTEGER PRIMARY KEY)
- patient_id (INTEGER) -- FK to users
- doctor_id (INTEGER) -- FK to users
- diagnosis (TEXT)
- prescription (TEXT)
- notes (TEXT)
- visit_date (DATETIME)
- created_at (DATETIME)
- updated_at (DATETIME)
```

---

## 🎉 Quick Start After Seeding

```bash
# 1. Seed the database
cd backend
npm run seed

# 2. Start the server (if not running)
npm start

# 3. Start frontend (new terminal)
cd ../frontend
npm start

# 4. Login and test!
# Try: admin1 / Administrator123
#      doctor1 / Doctor123
#      patient1 / Patient123
```

---

**Happy Testing! 🚀**