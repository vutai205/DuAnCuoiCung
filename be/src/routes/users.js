const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    getUserProfile, 
    updateUserProfile,
    createUser,
    searchUser,
    toggleStatus
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All user management routes require at least being logged in
router.use(protect);

// User profile routes (For normal logged-in users)
router.route('/profile')
    .get(getUserProfile)
    .put(updateUserProfile);

// Admin-only routes
router.use(admin);

router.get('/search', searchUser);
router.put('/status/:id', toggleStatus);

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
