const express = require('express');
const { getDb } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/patients/{patientId}/records:
 *   get:
 *     summary: Get all records for a specific patient
 *     tags: [Patient Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient records retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Patient not found
 */
router.get('/:patientId/records', authenticateToken, (req, res) => {
  const db = getDb();
  const patientId = req.params.patientId;

  // Check authorization - patients can only view their own records
  // Doctors, nurses, and admins can view any patient's records
  if (req.user.role === 'Patient' && req.user.id !== parseInt(patientId)) {
    return res.status(403).json({ error: 'Access denied. You can only view your own records.' });
  }

  // First, get patient information
  db.get(
    `SELECT id, username, email, full_name, phone, created_at FROM users WHERE id = ? AND role = 'Patient'`,
    [patientId],
    (err, patient) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching patient information' });
      }
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Get all appointments for this patient
      db.all(
        `SELECT a.*, d.full_name as doctor_name, d.email as doctor_email
         FROM appointments a
         JOIN users d ON a.doctor_id = d.id
         WHERE a.patient_id = ?
         ORDER BY a.appointment_date DESC`,
        [patientId],
        (err, appointments) => {
          if (err) {
            return res.status(500).json({ error: 'Error fetching appointments' });
          }

          // Get all medical records for this patient
          db.all(
            `SELECT mr.*, d.full_name as doctor_name, d.email as doctor_email
             FROM medical_records mr
             JOIN users d ON mr.doctor_id = d.id
             WHERE mr.patient_id = ?
             ORDER BY mr.visit_date DESC`,
            [patientId],
            (err, medicalRecords) => {
              if (err) {
                return res.status(500).json({ error: 'Error fetching medical records' });
              }

              // Return comprehensive patient record
              res.json({
                patient: patient,
                appointments: appointments,
                medicalRecords: medicalRecords,
                summary: {
                  totalAppointments: appointments.length,
                  scheduledAppointments: appointments.filter(a => a.status === 'scheduled').length,
                  completedAppointments: appointments.filter(a => a.status === 'completed').length,
                  cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
                  totalMedicalRecords: medicalRecords.length
                }
              });
            }
          );
        }
      );
    }
  );
});

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients (Admin, Doctor, Nurse only)
 *     tags: [Patient Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all patients
 *       403:
 *         description: Access denied
 */
router.get('/', authenticateToken, authorizeRoles('Administrator', 'Doctor', 'Nurse'), (req, res) => {
  const db = getDb();

  db.all(
    `SELECT id, username, email, full_name, phone, created_at FROM users WHERE role = 'Patient' ORDER BY full_name`,
    [],
    (err, patients) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching patients' });
      }
      res.json(patients);
    }
  );
});

module.exports = router;