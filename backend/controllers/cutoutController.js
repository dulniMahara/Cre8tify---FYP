const asyncHandler = require('express-async-handler');
const { Blob } = require('buffer');
const sharp = require('sharp');
const { removeBackground } = require('@imgly/background-removal-node');

const cutoutImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No image uploaded');
    }

    try {
        const inputBuffer = req.file.buffer;
        const normalizedBuffer = await sharp(inputBuffer)
            .resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true })
            .png()
            .toBuffer();
        const inputBlob = new Blob([normalizedBuffer], { type: 'image/png' });

        const outputBlob = await removeBackground(inputBlob);
        const outputArrayBuffer = await outputBlob.arrayBuffer();
        const outputBuffer = Buffer.from(outputArrayBuffer);

        res.setHeader('Content-Type', 'image/png');
        res.send(outputBuffer);
    } catch (err) {
        console.error('Cutout failed:', err);
        res.status(500).send('Cutout failed');
    }
});

module.exports = { cutoutImage };
