const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database/rbac.db');

// Sample data
const users = [
  // Administrators (3)
  { username: 'admin1', email: 'admin1@hospital.com', password: 'pass@123', role: 'Administrator', full_name: 'Sarah Johnson', phone: '555-0101' },
  { username: 'admin2', email: 'admin2@hospital.com', password: 'pass@123', role: 'Administrator', full_name: 'Michael Chen', phone: '555-0102' },
  { username: 'admin3', email: 'admin3@hospital.com', password: 'pass@123', role: 'Administrator', full_name: 'Emily Davis', phone: '555-0103' },
  
  // Doctors (8)
  { username: 'doctor1', email: 'doctor1@hospital.com', password: 'pass@123', role: 'Doctor', full_name: 'Dr. James Wilson', phone: '555-0201' },
  { username: 'doctor2', email: 'doctor2@hospital.com', password: 'pass@123', role: 'Doctor', full_name: 'Dr. Lisa Anderson', phone: '555-0202' },
  { username: 'doctor3', email: 'doctor3@hospital.com', password: 'pass@123', role: 'Doctor', full_name: 'Dr. Robert Martinez', phone: '555-0203' },
  { username: 'doctor4', email: 'doctor4@hospital.com', password: 'pass@123', role: 'Doctor', full_name: 'Dr. Jennifer Taylor', phone: '555-0204' },
  { username: 'doctor5', email: 'doctor5@hospital.com', password: 'pass@123', role: 'Doctor', full_name: 'Dr. David Brown', phone: '555-0205' },
  { username: 'doctor6', email: 'doctor6@hospital.com', password: 'pass@123', role: 'Doctor', full_name: 'Dr. Amanda White', phone: '555-0206' },
  { username: 'doctor7', email: 'doctor7@hospital.com', password: 'pass@123', role: 'Doctor', full_name: 'Dr. Christopher Lee', phone: '555-0207' },
  { username: 'doctor8', email: 'doctor8@hospital.com', password: 'pass@123', role: 'Doctor', full_name: 'Dr. Maria Garcia', phone: '555-0208' },
  
  // Nurses (7)
  { username: 'nurse1', email: 'nurse1@hospital.com', password: 'pass@123', role: 'Nurse', full_name: 'Nancy Thompson', phone: '555-0301' },
  { username: 'nurse2', email: 'nurse2@hospital.com', password: 'pass@123', role: 'Nurse', full_name: 'Patricia Moore', phone: '555-0302' },
  { username: 'nurse3', email: 'nurse3@hospital.com', password: 'pass@123', role: 'Nurse', full_name: 'Linda Jackson', phone: '555-0303' },
  { username: 'nurse4', email: 'nurse4@hospital.com', password: 'pass@123', role: 'Nurse', full_name: 'Barbara Harris', phone: '555-0304' },
  { username: 'nurse5', email: 'nurse5@hospital.com', password: 'pass@123', role: 'Nurse', full_name: 'Susan Clark', phone: '555-0305' },
  { username: 'nurse6', email: 'nurse6@hospital.com', password: 'pass@123', role: 'Nurse', full_name: 'Jessica Lewis', phone: '555-0306' },
  { username: 'nurse7', email: 'nurse7@hospital.com', password: 'pass@123', role: 'Nurse', full_name: 'Michelle Walker', phone: '555-0307' },
  
  // Patients (15)
  { username: 'patient1', email: 'patient1@email.com', password: 'pass@123', role: 'Patient', full_name: 'John Smith', phone: '555-1001' },
  { username: 'patient2', email: 'patient2@email.com', password: 'pass@123', role: 'Patient', full_name: 'Mary Johnson', phone: '555-1002' },
  { username: 'patient3', email: 'patient3@email.com', password: 'pass@123', role: 'Patient', full_name: 'William Brown', phone: '555-1003' },
  { username: 'patient4', email: 'patient4@email.com', password: 'pass@123', role: 'Patient', full_name: 'Patricia Jones', phone: '555-1004' },
  { username: 'patient5', email: 'patient5@email.com', password: 'pass@123', role: 'Patient', full_name: 'Robert Davis', phone: '555-1005' },
  { username: 'patient6', email: 'patient6@email.com', password: 'pass@123', role: 'Patient', full_name: 'Jennifer Miller', phone: '555-1006' },
  { username: 'patient7', email: 'patient7@email.com', password: 'pass@123', role: 'Patient', full_name: 'Michael Wilson', phone: '555-1007' },
  { username: 'patient8', email: 'patient8@email.com', password: 'pass@123', role: 'Patient', full_name: 'Linda Moore', phone: '555-1008' },
  { username: 'patient9', email: 'patient9@email.com', password: 'pass@123', role: 'Patient', full_name: 'David Taylor', phone: '555-1009' },
  { username: 'patient10', email: 'patient10@email.com', password: 'pass@123', role: 'Patient', full_name: 'Barbara Anderson', phone: '555-1010' },
  { username: 'patient11', email: 'patient11@email.com', password: 'pass@123', role: 'Patient', full_name: 'Richard Thomas', phone: '555-1011' },
  { username: 'patient12', email: 'patient12@email.com', password: 'pass@123', role: 'Patient', full_name: 'Susan Jackson', phone: '555-1012' },
  { username: 'patient13', email: 'patient13@email.com', password: 'pass@123', role: 'Patient', full_name: 'Joseph White', phone: '555-1013' },
  { username: 'patient14', email: 'patient14@email.com', password: 'pass@123', role: 'Patient', full_name: 'Jessica Harris', phone: '555-1014' },
  { username: 'patient15', email: 'patient15@email.com', password: 'pass@123', role: 'Patient', full_name: 'Thomas Martin', phone: '555-1015' },
];

// Sample appointments data
const appointmentsData = [
  { patientIndex: 18, doctorIndex: 3, date: '2025-12-15T09:00:00', reason: 'Annual physical examination', status: 'scheduled' },
  { patientIndex: 19, doctorIndex: 4, date: '2025-12-15T10:30:00', reason: 'Follow-up consultation', status: 'scheduled' },
  { patientIndex: 20, doctorIndex: 5, date: '2025-12-16T14:00:00', reason: 'Diabetes management review', status: 'scheduled' },
  { patientIndex: 21, doctorIndex: 6, date: '2025-12-17T11:00:00', reason: 'Hypertension check-up', status: 'scheduled' },
  { patientIndex: 22, doctorIndex: 7, date: '2025-12-18T15:30:00', reason: 'Respiratory infection symptoms', status: 'scheduled' },
  { patientIndex: 23, doctorIndex: 8, date: '2025-12-19T09:30:00', reason: 'Allergy consultation', status: 'scheduled' },
  { patientIndex: 24, doctorIndex: 9, date: '2025-12-20T13:00:00', reason: 'Skin rash examination', status: 'scheduled' },
  { patientIndex: 25, doctorIndex: 10, date: '2025-12-21T10:00:00', reason: 'General health check-up', status: 'scheduled' },
  
  // Past completed appointments
  { patientIndex: 18, doctorIndex: 3, date: '2025-11-01T09:00:00', reason: 'Initial consultation', status: 'completed', notes: 'Patient in good health' },
  { patientIndex: 19, doctorIndex: 4, date: '2025-11-05T14:00:00', reason: 'Blood pressure monitoring', status: 'completed', notes: 'BP normal, continue medication' },
  { patientIndex: 20, doctorIndex: 5, date: '2025-11-10T11:30:00', reason: 'Lab results review', status: 'completed', notes: 'All tests normal' },
  { patientIndex: 21, doctorIndex: 6, date: '2025-11-12T10:00:00', reason: 'Medication adjustment', status: 'completed', notes: 'Dosage increased' },
  { patientIndex: 22, doctorIndex: 7, date: '2025-11-15T15:00:00', reason: 'Flu symptoms', status: 'completed', notes: 'Prescribed antibiotics' },
  { patientIndex: 23, doctorIndex: 8, date: '2025-11-18T09:00:00', reason: 'Chest pain evaluation', status: 'completed', notes: 'ECG normal, anxiety related' },
  { patientIndex: 24, doctorIndex: 9, date: '2025-11-20T13:30:00', reason: 'Back pain assessment', status: 'completed', notes: 'Physical therapy recommended' },
  { patientIndex: 25, doctorIndex: 10, date: '2025-11-22T11:00:00', reason: 'Headache consultation', status: 'completed', notes: 'Migraine diagnosis' },
  { patientIndex: 26, doctorIndex: 3, date: '2025-11-25T14:30:00', reason: 'Routine check-up', status: 'completed', notes: 'Healthy, no concerns' },
  { patientIndex: 27, doctorIndex: 4, date: '2025-11-28T10:30:00', reason: 'Cold symptoms', status: 'completed', notes: 'Rest and fluids advised' },
  
  // Cancelled appointments
  { patientIndex: 28, doctorIndex: 5, date: '2025-12-01T09:00:00', reason: 'Dental pain', status: 'cancelled', notes: 'Patient cancelled' },
  { patientIndex: 29, doctorIndex: 6, date: '2025-12-03T15:00:00', reason: 'Eye examination', status: 'cancelled', notes: 'Rescheduled' },
];

// Sample medical records data
const medicalRecordsData = [
  { patientIndex: 18, doctorIndex: 3, diagnosis: 'Hypertension (Stage 1)', prescription: 'Lisinopril 10mg daily', notes: 'Monitor blood pressure weekly', visitDate: '2025-11-01' },
  { patientIndex: 19, doctorIndex: 4, diagnosis: 'Type 2 Diabetes Mellitus', prescription: 'Metformin 500mg twice daily', notes: 'Follow up in 3 months for A1C test', visitDate: '2025-11-05' },
  { patientIndex: 20, doctorIndex: 5, diagnosis: 'Common Cold', prescription: 'Rest, fluids, and over-the-counter pain relievers', notes: 'Should resolve in 7-10 days', visitDate: '2025-11-10' },
  { patientIndex: 21, doctorIndex: 6, diagnosis: 'Gastroesophageal Reflux Disease (GERD)', prescription: 'Omeprazole 20mg once daily before breakfast', notes: 'Avoid spicy foods and late-night meals', visitDate: '2025-11-12' },
  { patientIndex: 22, doctorIndex: 7, diagnosis: 'Acute Bronchitis', prescription: 'Amoxicillin 500mg three times daily for 7 days', notes: 'Complete full course of antibiotics', visitDate: '2025-11-15' },
  { patientIndex: 23, doctorIndex: 8, diagnosis: 'Anxiety Disorder', prescription: 'Sertraline 50mg daily, increase to 100mg after 2 weeks', notes: 'Consider cognitive behavioral therapy', visitDate: '2025-11-18' },
  { patientIndex: 24, doctorIndex: 9, diagnosis: 'Lumbar Strain', prescription: 'Ibuprofen 400mg as needed, Physical therapy 3x per week', notes: 'Avoid heavy lifting for 4 weeks', visitDate: '2025-11-20' },
  { patientIndex: 25, doctorIndex: 10, diagnosis: 'Migraine with Aura', prescription: 'Sumatriptan 50mg as needed for migraine attacks', notes: 'Keep headache diary, avoid known triggers', visitDate: '2025-11-22' },
  { patientIndex: 26, doctorIndex: 3, diagnosis: 'Seasonal Allergies', prescription: 'Cetirizine 10mg daily during allergy season', notes: 'May cause drowsiness', visitDate: '2025-11-25' },
  { patientIndex: 27, doctorIndex: 4, diagnosis: 'Vitamin D Deficiency', prescription: 'Vitamin D3 2000 IU daily', notes: 'Retest levels in 3 months', visitDate: '2025-11-28' },
  { patientIndex: 18, doctorIndex: 3, diagnosis: 'Follow-up: Hypertension well controlled', prescription: 'Continue Lisinopril 10mg daily', notes: 'Blood pressure readings excellent', visitDate: '2025-10-15' },
  { patientIndex: 19, doctorIndex: 4, diagnosis: 'Follow-up: Diabetes management', prescription: 'Continue Metformin 500mg twice daily', notes: 'A1C improved from 7.2% to 6.5%', visitDate: '2025-10-20' },
  { patientIndex: 28, doctorIndex: 5, diagnosis: 'Upper Respiratory Infection', prescription: 'Symptomatic treatment with decongestants', notes: 'Viral infection, antibiotics not needed', visitDate: '2025-10-25' },
  { patientIndex: 29, doctorIndex: 6, diagnosis: 'Osteoarthritis of the knee', prescription: 'Acetaminophen 650mg as needed, Physical therapy', notes: 'Consider knee replacement if conservative treatment fails', visitDate: '2025-10-28' },
  { patientIndex: 30, doctorIndex: 7, diagnosis: 'Insomnia', prescription: 'Melatonin 3mg at bedtime, Sleep hygiene counseling', notes: 'Avoid screens 1 hour before bed', visitDate: '2025-11-02' },
];

async function seedDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }

      console.log('🌱 Starting database seeding...\n');

      try {
        // Clear existing data (except admin)
        await new Promise((res, rej) => {
          db.run(`DELETE FROM medical_records`, (err) => err ? rej(err) : res());
        });
        await new Promise((res, rej) => {
          db.run(`DELETE FROM appointments`, (err) => err ? rej(err) : res());
        });
        await new Promise((res, rej) => {
          db.run(`DELETE FROM users WHERE username != 'admin'`, (err) => err ? rej(err) : res());
        });

        console.log('✅ Cleared existing data\n');

        // Insert users
        console.log('👥 Creating users...');
        const userIds = [];
        
        for (const user of users) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          const userId = await new Promise((res, rej) => {
            db.run(
              `INSERT INTO users (username, email, password, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)`,
              [user.username, user.email, hashedPassword, user.role, user.full_name, user.phone],
              function(err) {
                if (err) rej(err);
                else res(this.lastID);
              }
            );
          });
          userIds.push(userId);
          console.log(`   ✓ Created ${user.role}: ${user.full_name} (${user.username})`);
        }

        console.log(`\n✅ Created ${users.length} users\n`);

        // Insert appointments
        console.log('📅 Creating appointments...');
        let appointmentCount = 0;
        
        for (const apt of appointmentsData) {
          await new Promise((res, rej) => {
            db.run(
              `INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status, notes) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [userIds[apt.patientIndex], userIds[apt.doctorIndex], apt.date, apt.reason, apt.status, apt.notes || null],
              function(err) {
                if (err) rej(err);
                else {
                  appointmentCount++;
                  res(this.lastID);
                }
              }
            );
          });
        }

        console.log(`✅ Created ${appointmentCount} appointments\n`);

        // Insert medical records
        console.log('📋 Creating medical records...');
        let recordCount = 0;
        
        for (const record of medicalRecordsData) {
          await new Promise((res, rej) => {
            db.run(
              `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes, visit_date) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [userIds[record.patientIndex], userIds[record.doctorIndex], record.diagnosis, record.prescription, record.notes, record.visitDate],
              function(err) {
                if (err) rej(err);
                else {
                  recordCount++;
                  res(this.lastID);
                }
              }
            );
          });
        }

        console.log(`✅ Created ${recordCount} medical records\n`);

        // Summary
        console.log('═══════════════════════════════════════');
        console.log('🎉 DATABASE SEEDING COMPLETED!');
        console.log('═══════════════════════════════════════');
        console.log(`\n📊 Summary:`);
        console.log(`   • Total Users: ${users.length}`);
        console.log(`   • Administrators: 3`);
        console.log(`   • Doctors: 8`);
        console.log(`   • Nurses: 7`);
        console.log(`   • Patients: 15`);
        console.log(`   • Appointments: ${appointmentCount}`);
        console.log(`   • Medical Records: ${recordCount}`);
        console.log(`\n🔐 Login Credentials:`);
        console.log(`   • Admin: admin / admin123`);
        console.log(`   • Administrators: admin1-3 / pass@123`);
        console.log(`   • Doctors: doctor1-8 / pass@123`);
        console.log(`   • Nurses: nurse1-7 / pass@123`);
        console.log(`   • Patients: patient1-15 / pass@123`);
        console.log('\n✨ You can now login and test the system!\n');

        db.close();
        resolve();
      } catch (error) {
        console.error('❌ Error seeding database:', error);
        db.close();
        reject(error);
      }
    });
  });
}

// Run the seed script
seedDatabase()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to seed database:', err);
    process.exit(1);
  });