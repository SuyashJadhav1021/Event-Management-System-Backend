const express = require('express');
const { getMyRegistrations } = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get all events the logged-in user registered for
router.get('/my-events', protect, getMyRegistrations);

module.exports = router;
