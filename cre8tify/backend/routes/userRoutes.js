const express = require('express');
const router = express.Router();
// Import the registerUser function from the controller
const { registerUser } = require('../controllers/userController'); 

// POST request to the URL /api/users/register will run registerUser
router.post('/register', registerUser);

// We will add the login route here later...

module.exports = router;