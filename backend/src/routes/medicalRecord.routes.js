const express = require('express');
const { getDb } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Create medical record (Doctor only)
 *     tags: [Medical Records]
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
 *               - diagnosis
 *             properties:
 *               patient_id:
 *                 type: integer
 *               diagnosis:
 *                 type: string
 *               prescription:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medical record created successfully
 */
router.post('/', authenticateToken, authorizeRoles('Doctor'), (req, res) => {
  const db = getDb();
  const { patient_id, diagnosis, prescription, notes } = req.body;
  const doctor_id = req.user.id;

  db.run(
    `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?)`,
    [patient_id, doctor_id, diagnosis, prescription || null, notes || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating medical record' });
      }
      res.status(201).json({
        message: 'Medical record created successfully',
        recordId: this.lastID,
      });
    }
  );
});

/**
 * @swagger
 * /api/medical-records:
 *   get:
 *     summary: Get all medical records
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medical records
 */
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  let query = `
    SELECT mr.*, 
           p.full_name as patient_name, 
           d.full_name as doctor_name
    FROM medical_records mr
    JOIN users p ON mr.patient_id = p.id
    JOIN users d ON mr.doctor_id = d.id
  `;
  let params = [];

  // Role-based filtering
  if (req.user.role === 'Patient') {
    query += ' WHERE mr.patient_id = ?';
    params.push(req.user.id);
  } else if (req.user.role === 'Doctor') {
    query += ' WHERE mr.doctor_id = ?';
    params.push(req.user.id);
  }

  query += ' ORDER BY mr.visit_date DESC';

  db.all(query, params, (err, records) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching medical records' });
    }
    res.json(records);
  });
});

/**
 * @swagger
 * /api/medical-records/{id}:
 *   get:
 *     summary: Get medical record by ID
 *     tags: [Medical Records]
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
 *         description: Medical record details
 *       404:
 *         description: Medical record not found
 */
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const recordId = req.params.id;

  db.get(
    `SELECT mr.*, 
            p.full_name as patient_name, p.email as patient_email,
            d.full_name as doctor_name, d.email as doctor_email
     FROM medical_records mr
     JOIN users p ON mr.patient_id = p.id
     JOIN users d ON mr.doctor_id = d.id
     WHERE mr.id = ?`,
    [recordId],
    (err, record) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching medical record' });
      }
      if (!record) {
        return res.status(404).json({ error: 'Medical record not found' });
      }

      // Check access rights
      if (req.user.role === 'Patient' && record.patient_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (req.user.role === 'Doctor' && record.doctor_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(record);
    }
  );
});

/**
 * @swagger
 * /api/medical-records/{id}:
 *   put:
 *     summary: Update medical record (Doctor only)
 *     tags: [Medical Records]
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
 *               diagnosis:
 *                 type: string
 *               prescription:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medical record updated successfully
 */
router.put('/:id', authenticateToken, authorizeRoles('Doctor'), (req, res) => {
  const db = getDb();
  const recordId = req.params.id;
  const { diagnosis, prescription, notes } = req.body;

  db.run(
    `UPDATE medical_records SET diagnosis = ?, prescription = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [diagnosis, prescription, notes, recordId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating medical record' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Medical record not found' });
      }
      res.json({ message: 'Medical record updated successfully' });
    }
  );
});

/**
 * @swagger
 * /api/medical-records/{id}:
 *   delete:
 *     summary: Delete medical record (Doctor/Admin only)
 *     tags: [Medical Records]
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
 *         description: Medical record deleted successfully
 */
router.delete('/:id', authenticateToken, authorizeRoles('Administrator', 'Doctor'), (req, res) => {
  const db = getDb();
  const recordId = req.params.id;

  db.run(`DELETE FROM medical_records WHERE id = ?`, [recordId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting medical record' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    res.json({ message: 'Medical record deleted successfully' });
  });
});

module.exports = router;