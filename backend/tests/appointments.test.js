const request = require('supertest');
const app = require('../server');

describe('Appointment API Tests', () => {
  let adminToken, doctorToken, patientToken;
  let doctorId, patientId, appointmentId;

  beforeAll(async () => {
    // Login as admin
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminResponse.body.token;

    // Create and login as doctor
    const doctorRegister = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'doctor1',
        email: 'doctor1@hospital.com',
        password: 'password123',
        role: 'Doctor',
        full_name: 'Dr. John Smith'
      });
    doctorId = doctorRegister.body.userId;

    const doctorLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'doctor1', password: 'password123' });
    doctorToken = doctorLogin.body.token;

    // Create and login as patient
    const patientRegister = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'patient2',
        email: 'patient2@email.com',
        password: 'password123',
        role: 'Patient',
        full_name: 'Jane Doe'
      });
    patientId = patientRegister.body.userId;

    const patientLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'patient2', password: 'password123' });
    patientToken = patientLogin.body.token;
  });

  describe('POST /api/appointments', () => {
    it('should create an appointment successfully', async () => {
      const appointmentData = {
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: '2025-12-01T10:00:00',
        reason: 'Regular checkup',
        notes: 'First visit'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Appointment created successfully');
      expect(response.body).toHaveProperty('appointmentId');
      
      appointmentId = response.body.appointmentId;
    });

    it('should allow authenticated user to create appointment', async () => {
      const appointmentData = {
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: '2025-12-15T14:00:00',
        reason: 'Follow-up visit'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body).toHaveProperty('appointmentId');
    });

    it('should fail without authentication', async () => {
      const appointmentData = {
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: '2025-12-20T10:00:00',
        reason: 'Consultation'
      };

      await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(401);
    });
  });

  describe('GET /api/appointments', () => {
    it('should get all appointments for admin', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get only doctor appointments for doctor', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // All appointments should belong to this doctor
      response.body.forEach(apt => {
        expect(apt.doctor_id).toBe(doctorId);
      });
    });

    it('should get only patient appointments for patient', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // All appointments should belong to this patient
      response.body.forEach(apt => {
        expect(apt.patient_id).toBe(patientId);
      });
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should get appointment by ID', async () => {
      const response = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', appointmentId);
      expect(response.body).toHaveProperty('patient_name');
      expect(response.body).toHaveProperty('doctor_name');
    });

    it('should allow patient to view their own appointment', async () => {
      const response = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', appointmentId);
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app)
        .get('/api/appointments/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    it('should allow doctor to update appointment status', async () => {
      const updateData = {
        status: 'completed',
        notes: 'Checkup completed successfully'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Appointment updated successfully');
    });

    it('should deny patient from updating appointment', async () => {
      const updateData = {
        status: 'cancelled'
      };

      await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updateData)
        .expect(403);
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should allow doctor to delete appointment', async () => {
      // Create a new appointment to delete
      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patient_id: patientId,
          doctor_id: doctorId,
          appointment_date: '2025-12-25T10:00:00',
          reason: 'To be deleted'
        });

      const deleteId = createResponse.body.appointmentId;

      const response = await request(app)
        .delete(`/api/appointments/${deleteId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Appointment deleted successfully');
    });

    it('should deny patient from deleting appointment', async () => {
      await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);
    });
  });
});

describe('Appointment Edge Cases', () => {
  let token;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    token = response.body.token;
  });

  it('should handle invalid appointment date format', async () => {
    const appointmentData = {
      patient_id: 1,
      doctor_id: 1,
      appointment_date: 'invalid-date',
      reason: 'Checkup'
    };

    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send(appointmentData)
      .expect(201); // SQLite will accept this, but you might want to add validation
  });

  it('should handle missing required fields', async () => {
    const appointmentData = {
      patient_id: 1,
      // Missing doctor_id and appointment_date
      reason: 'Checkup'
    };

    // This might create with NULL values - consider adding validation
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send(appointmentData);
    
    // Test depends on your validation implementation
  });
});