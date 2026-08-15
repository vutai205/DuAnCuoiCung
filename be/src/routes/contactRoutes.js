const express = require('express');
const router = express.Router();
const { 
    createContact, 
    getAllContacts, 
    updateContactStatus, 
    replyContactEmail 
} = require('../controllers/contactController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', createContact);
router.get('/', protect, admin, getAllContacts);
router.put('/:id/status', protect, admin, updateContactStatus);
router.post('/:id/reply', protect, admin, replyContactEmail);

module.exports = router;
