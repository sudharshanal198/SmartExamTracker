const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

router.get('/users', auth, admin, adminController.getAllUsers);
router.get('/students', auth, admin, adminController.getStudents);
router.get('/stats', auth, admin, adminController.getGlobalStats);

module.exports = router;
