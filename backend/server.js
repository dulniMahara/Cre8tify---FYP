require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // 1. Import CORS
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const libraryRoutes = require('./routes/libraryRoutes');
const baseProductRoutes = require('./routes/baseProductRoutes');
const productRoutes = require('./routes/productRoutes');
const cutoutRoutes = require('./routes/cutoutRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// 2. CORS MUST BE FIRST - This solves the "Silent Failure" 🟢
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

connectDB();

const port = process.env.PORT || 5000;

// 3. Body Parsers - set limits high for base64 mockup images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// 4. Static Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/library', libraryRoutes);
app.use('/api/base-products', require('./routes/baseProductRoutes'));
app.use('/api/products', productRoutes);
app.use('/api/cutout', cutoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tryon', require('./routes/tryonRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));



app.get('/', (req, res) => {
    res.send('Welcome to Cre8tify Backend API!');
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`🚀 Server is running on port: ${port}`);
});

const { removeBackground } = require('@imgly/background-removal-node');
const multer = require('multer');

// Use memory storage for the AI cutout so we don't save temp files to disk
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

// --- SMART CUTOUT ROUTE ---
app.post('/api/cutout', uploadMemory.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image uploaded');
        }

        console.log("AI starting background removal...");

        // 1. Process the image buffer with the AI library
        // Note: The first time this runs, it will download the AI model (~80MB)
        const blob = await removeBackground(req.file.buffer);

        // 2. Convert the result back to a buffer
        const buffer = Buffer.from(await blob.arrayBuffer());

        // 3. Send the transparent PNG back to the frontend
        res.set('Content-Type', 'image/png');
        res.send(buffer);

        console.log("AI Cutout complete!");

    } catch (error) {
        console.error("AI Cutout Error:", error);
        res.status(500).send("AI processing failed. Check server memory.");
    }
});// trigger restart


//app.get('/test-ping', (req, res) => res.json({ status: 'ok' }));
