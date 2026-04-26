const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateTryOn } = require('../controllers/tryonController');

// Use memory storage for the uploaded files to avoid writing to disk
const uploadMemory = multer({ storage: multer.memoryStorage() });

// Endpoint will receive 'humanImage' and 'garmImage'
router.post('/', uploadMemory.fields([
    { name: 'humanImage', maxCount: 1 },
    { name: 'garmImage', maxCount: 1 }
]), generateTryOn);

module.exports = router;
