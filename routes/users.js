const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminAuth = require('../middleware/adminAuth');

// Health check
router.get('/health', userController.healthCheck);

// Authentication routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/admin-login', userController.adminLogin);
router.post('/admin/create', userController.createAdmin);

// User routes (CRUD)
// List and manage users are admin-only
router.get('/', adminAuth, userController.getAllUsers);
router.get('/:id', adminAuth, userController.getUserById);
router.post('/', adminAuth, userController.createUser);
router.put('/:id', adminAuth, userController.updateUser);
router.post('/:id/change-password', userController.changePassword);
router.delete('/:id', adminAuth, userController.deleteUser);

module.exports = router;
