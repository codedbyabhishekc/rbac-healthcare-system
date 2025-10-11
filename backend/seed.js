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
  { patientIndex: 18, doctorIndex: 3, date: '2025-12-15T09:00:00', reason: 'Suspects they turned into a werewolf', status: 'scheduled' },
  { patientIndex: 19, doctorIndex: 4, date: '2025-12-15T10:30:00', reason: 'Can\'t stop hiccupping since Tuesday', status: 'scheduled' },
  { patientIndex: 20, doctorIndex: 5, date: '2025-12-16T14:00:00', reason: 'Believes they\'re allergic to Mondays', status: 'scheduled' },
  { patientIndex: 21, doctorIndex: 6, date: '2025-12-17T11:00:00', reason: 'Too much Netflix causing couch fusion', status: 'scheduled' },
  { patientIndex: 22, doctorIndex: 7, date: '2025-12-18T15:30:00', reason: 'Laughed too hard at memes, now can\'t stop', status: 'scheduled' },
  { patientIndex: 23, doctorIndex: 8, date: '2025-12-19T09:30:00', reason: 'Thinks WiFi is making them magnetic', status: 'scheduled' },
  { patientIndex: 24, doctorIndex: 9, date: '2025-12-20T13:00:00', reason: 'Ate too much pizza, needs intervention', status: 'scheduled' },
  { patientIndex: 25, doctorIndex: 10, date: '2025-12-21T10:00:00', reason: 'Convinced their cat is plotting against them', status: 'scheduled' },
  
  // Past completed appointments
  { patientIndex: 18, doctorIndex: 3, date: '2025-11-01T09:00:00', reason: 'Fear of running out of coffee', status: 'completed', notes: 'Prescribed unlimited coffee subscription' },
  { patientIndex: 19, doctorIndex: 4, date: '2025-11-05T14:00:00', reason: 'Extreme procrastination disorder', status: 'completed', notes: 'Will start treatment... eventually' },
  { patientIndex: 20, doctorIndex: 5, date: '2025-11-10T11:30:00', reason: 'Addicted to checking phone notifications', status: 'completed', notes: 'Phone confiscated during visit' },
  { patientIndex: 21, doctorIndex: 6, date: '2025-11-12T10:00:00', reason: 'Can\'t remember last time touched grass', status: 'completed', notes: 'Prescribed 30 min outdoor daily' },
  { patientIndex: 22, doctorIndex: 7, date: '2025-11-15T15:00:00', reason: 'Chronic dad joke syndrome', status: 'completed', notes: 'No cure available, it\'s hereditary' },
  { patientIndex: 23, doctorIndex: 8, date: '2025-11-18T09:00:00', reason: 'Social media thumb strain', status: 'completed', notes: 'Take a break from scrolling' },
  { patientIndex: 24, doctorIndex: 9, date: '2025-11-20T13:30:00', reason: 'Binge-watching fatigue', status: 'completed', notes: 'Recommend touching grass protocol' },
  { patientIndex: 25, doctorIndex: 10, date: '2025-11-22T11:00:00', reason: 'Too many browser tabs syndrome', status: 'completed', notes: 'Closed 347 tabs during consultation' },
  { patientIndex: 26, doctorIndex: 3, date: '2025-11-25T14:30:00', reason: 'Forgot how to adult', status: 'completed', notes: 'YouTube tutorial recommended' },
  { patientIndex: 27, doctorIndex: 4, date: '2025-11-28T10:30:00', reason: 'Weekend went by too fast', status: 'completed', notes: 'Unfortunately, this is normal' },
  
  // Cancelled appointments
  { patientIndex: 28, doctorIndex: 5, date: '2025-12-01T09:00:00', reason: 'Keyboard warrior rage symptoms', status: 'cancelled', notes: 'Patient got banned from Twitter' },
  { patientIndex: 29, doctorIndex: 6, date: '2025-12-03T15:00:00', reason: 'Fear of missing out (FOMO)', status: 'cancelled', notes: 'Missed appointment due to FOMO' },
];

// Sample medical records data - FUNNY VERSION! 😄
const medicalRecordsData = [
  { 
    patientIndex: 18, 
    doctorIndex: 3, 
    diagnosis: 'Acute Meme-itis with chronic LOL syndrome', 
    prescription: '2 funny cat videos daily, 1 dad joke before meals, avoid cringe content', 
    notes: 'Patient laughed so hard, they forgot why they came. Mission accomplished!', 
    visitDate: '2025-11-01' 
  },
  { 
    patientIndex: 19, 
    doctorIndex: 4, 
    diagnosis: 'Netflix Addiction (Stage: Just-One-More-Episode)', 
    prescription: 'Touch grass twice daily, sunlight exposure 15min, delete "Are you still watching?" shame', 
    notes: 'Patient asked if life has a skip intro button. Concerning.', 
    visitDate: '2025-11-05' 
  },
  { 
    patientIndex: 20, 
    doctorIndex: 5, 
    diagnosis: 'Chronic Snooze Button Syndrome', 
    prescription: 'Alarm clock placed across room, coffee IV recommended, motivational rooster', 
    notes: 'Patient snoozed 47 times this morning. New record!', 
    visitDate: '2025-11-10' 
  },
  { 
    patientIndex: 21, 
    doctorIndex: 6, 
    diagnosis: 'Monday-phobia with Weekend Withdrawal', 
    prescription: 'Friday thoughts all week, pretend every day is Saturday, pizza therapy', 
    notes: 'Prescribed unlimited "It\'s Friday somewhere" mentality', 
    visitDate: '2025-11-12' 
  },
  { 
    patientIndex: 22, 
    doctorIndex: 7, 
    diagnosis: 'Extreme Dad Joke Disorder (EDD)', 
    prescription: 'No puns for 24hrs, avoid "Hi Hungry, I\'m Dad" responses, support group meetings', 
    notes: 'Patient made 3 dad jokes during exam. Incurable.', 
    visitDate: '2025-11-15' 
  },
  { 
    patientIndex: 23, 
    doctorIndex: 8, 
    diagnosis: 'Social Media Scroll Paralysis', 
    prescription: 'Unfollow 50 accounts, touch grass protocol, reality check every 30min', 
    notes: 'Patient tried to double-tap my clipboard. Yikes.', 
    visitDate: '2025-11-18' 
  },
  { 
    patientIndex: 24, 
    doctorIndex: 9, 
    diagnosis: 'Pizza Dependency Syndrome', 
    prescription: 'Pizza once a day (down from 3x), try vegetables (very scary), cheese support group', 
    notes: 'Patient cried when I mentioned salad. Progress will be slow.', 
    visitDate: '2025-11-20' 
  },
  { 
    patientIndex: 25, 
    doctorIndex: 10, 
    diagnosis: 'Chronic Procrastination Disease', 
    prescription: 'Start tasks immediately (or tomorrow), to-do lists in easy-mode, deadline panic avoidance', 
    notes: 'Will write follow-up notes later... maybe next week', 
    visitDate: '2025-11-22' 
  },
  { 
    patientIndex: 26, 
    doctorIndex: 3, 
    diagnosis: 'Coffee Deficiency Syndrome', 
    prescription: 'Coffee every 2 hours, emergency espresso shots, caffeine IV if needed', 
    notes: 'Patient fell asleep mid-sentence. Clearly needs more coffee.', 
    visitDate: '2025-11-25' 
  },
  { 
    patientIndex: 27, 
    doctorIndex: 4, 
    diagnosis: 'Selfie Arm Fatigue', 
    prescription: 'Selfie stick, find good angle faster, face filter detox program', 
    notes: 'Took 50 selfies in waiting room. No good angles found.', 
    visitDate: '2025-11-28' 
  },
  { 
    patientIndex: 18, 
    doctorIndex: 3, 
    diagnosis: 'Follow-up: Meme tolerance improving', 
    prescription: 'Continue cat videos, add dog videos for variety, wholesome memes only', 
    notes: 'Sent me 20 memes during visit. I laughed at 3.', 
    visitDate: '2025-10-15' 
  },
  { 
    patientIndex: 19, 
    doctorIndex: 4, 
    diagnosis: 'Follow-up: Netflix hours reduced to only 8 hours daily', 
    prescription: 'Keep up the good work! Try going outside when sun is up', 
    notes: 'Patient discovered reality TV. We may need to start over.', 
    visitDate: '2025-10-20' 
  },
  { 
    patientIndex: 28, 
    doctorIndex: 5, 
    diagnosis: 'Acute Keyboard Warrior Syndrome', 
    prescription: 'Log off Twitter, count to 10 before replying, consider anger management memes', 
    notes: 'Patient got into 5 internet arguments during visit. Aggressive.', 
    visitDate: '2025-10-25' 
  },
  { 
    patientIndex: 29, 
    doctorIndex: 6, 
    diagnosis: 'FOMO (Fear of Missing Out) - Critical Stage', 
    prescription: 'Delete social media, accept that other people have lives, JOMO therapy (Joy of Missing Out)', 
    notes: 'Patient checked phone 89 times. Asked if exam was Instagram-worthy.', 
    visitDate: '2025-10-28' 
  },
  { 
    patientIndex: 30, 
    doctorIndex: 7, 
    diagnosis: 'Chronic "One More Episode" Syndrome', 
    prescription: 'Bedtime routine without screens, melatonin, acceptance that cliffhangers will exist', 
    notes: 'Patient asked if they could binge-watch sleeping. Creative but no.', 
    visitDate: '2025-11-02' 
  },
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
        console.log(`   • Medical Records: ${recordCount} (HILARIOUS! 😄)`);
        console.log(`\n🔐 Login Credentials:`);
        console.log(`   • Admin: admin / admin123`);
        console.log(`   • All Users: username / pass@123`);
        console.log(`   • Examples: admin1/pass@123, doctor1/pass@123, patient1/pass@123`);
        console.log('\n🤣 WARNING: Medical records contain extreme humor!');
        console.log('✨ You can now login and laugh at the diagnoses!\n');

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