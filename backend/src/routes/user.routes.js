const express = require('express');
const { getDb } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Access denied
 */
router.get('/', authenticateToken, authorizeRoles('Administrator'), (req, res) => {
  const db = getDb();
  
  db.all(
    `SELECT id, username, email, role, full_name, phone, created_at FROM users`,
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching users' });
      }
      res.json(users);
    }
  );
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.params.id;

  // Users can only view their own profile unless they're an admin
  if (req.user.role !== 'Administrator' && req.user.id !== parseInt(userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.get(
    `SELECT id, username, email, role, full_name, phone, created_at FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching user' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', authenticateToken, (req, res) => {
  const db = getDb();
  const userId = req.params.id;
  const { full_name, phone, email } = req.body;

  // Users can only update their own profile unless they're an admin
  if (req.user.role !== 'Administrator' && req.user.id !== parseInt(userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.run(
    `UPDATE users SET full_name = ?, phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [full_name, phone, email, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating user' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User updated successfully' });
    }
  );
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticateToken, authorizeRoles('Administrator'), (req, res) => {
  const db = getDb();
  const userId = req.params.id;

  db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

/**
 * @swagger
 * /api/users/role/{role}:
 *   get:
 *     summary: Get users by role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Administrator, Doctor, Nurse, Patient]
 *     responses:
 *       200:
 *         description: List of users with specified role
 */
router.get('/role/:role', authenticateToken, (req, res) => {
  const db = getDb();
  const role = req.params.role;

  db.all(
    `SELECT id, username, email, role, full_name, phone FROM users WHERE role = ?`,
    [role],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching users' });
      }
      res.json(users);
    }
  );
});

module.exports = router;