const express = require('express');
const { getDb } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - doctor_id
 *               - appointment_date
 *               - reason
 *             properties:
 *               patient_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               appointment_date:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */
router.post('/', authenticateToken, (req, res) => {
  const db = getDb();
  const { patient_id, doctor_id, appointment_date, reason, notes } = req.body;

  db.run(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, notes) VALUES (?, ?, ?, ?, ?)`,
    [patient_id, doctor_id, appointment_date, reason, notes || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating appointment' });
      }
      res.status(201).json({
        message: 'Appointment created successfully',
        appointmentId: this.lastID,
      });
    }
  );
});

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  let query = `
    SELECT a.*, 
           p.full_name as patient_name, 
           d.full_name as doctor_name
    FROM appointments a
    JOIN users p ON a.patient_id = p.id
    JOIN users d ON a.doctor_id = d.id
  `;
  let params = [];

  // Role-based filtering
  if (req.user.role === 'Patient') {
    query += ' WHERE a.patient_id = ?';
    params.push(req.user.id);
  } else if (req.user.role === 'Doctor') {
    query += ' WHERE a.doctor_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY a.appointment_date DESC';

  db.all(query, params, (err, appointments) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching appointments' });
    }
    res.json(appointments);
  });
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const appointmentId = req.params.id;

  db.get(
    `SELECT a.*, 
            p.full_name as patient_name, p.email as patient_email,
            d.full_name as doctor_name, d.email as doctor_email
     FROM appointments a
     JOIN users p ON a.patient_id = p.id
     JOIN users d ON a.doctor_id = d.id
     WHERE a.id = ?`,
    [appointmentId],
    (err, appointment) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching appointment' });
      }
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Check access rights
      if (req.user.role === 'Patient' && appointment.patient_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (req.user.role === 'Doctor' && appointment.doctor_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(appointment);
    }
  );
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointment_date:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 */
router.put('/:id', authenticateToken, authorizeRoles('Administrator', 'Doctor', 'Nurse'), (req, res) => {
  const db = getDb();
  const appointmentId = req.params.id;
  const { appointment_date, status, notes } = req.body;

  // Build dynamic update query based on provided fields
  const updates = [];
  const values = [];

  if (appointment_date !== undefined) {
    updates.push('appointment_date = ?');
    values.push(appointment_date);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    values.push(notes);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(appointmentId);

  const query = `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Error updating appointment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment updated successfully' });
  });
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 */
router.delete('/:id', authenticateToken, authorizeRoles('Administrator', 'Doctor'), (req, res) => {
  const db = getDb();
  const appointmentId = req.params.id;

  db.run(`DELETE FROM appointments WHERE id = ?`, [appointmentId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting appointment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  });
});

module.exports = router;