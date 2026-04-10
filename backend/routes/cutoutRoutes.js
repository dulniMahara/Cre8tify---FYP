const express = require('express');
const multer = require('multer');
const { cutoutImage } = require('../controllers/cutoutController');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }
});

router.post('/', upload.single('image'), cutoutImage);

module.exports = router;
