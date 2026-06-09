const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All user management routes require at least being logged in
router.use(protect);

// User profile routes (For normal logged-in users)
router.route('/profile')
    .get(getUserProfile)
    .put(updateUserProfile);

// Admin-only routes
router.use(admin);

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
