const express = require('express');
const router = express.Router();
// Import both functions from the controller
const { registerUser, loginUser } = require('../controllers/userController'); 

// POST request to /api/users/register
router.post('/register', registerUser);

// POST request to /api/users/login (NEW)
router.post('/login', loginUser); 

module.exports = router;