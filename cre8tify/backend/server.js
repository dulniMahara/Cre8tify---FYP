require('dotenv').config(); 
// Import the database connection function
const connectDB = require('./config/db'); 
// Import the error handler middleware
const { errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

// Connect to the database
connectDB(); 

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// --- Middlewares to read request data ---
// Allows the app to read JSON data from the request body (e.g., username/password)
app.use(express.json()); 
// Allows the app to read form data
app.use(express.urlencoded({ extended: false }));
// This serves the files inside the /uploads folder at the /uploads URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define a basic route (the home page)
app.get('/', (req, res) => {
    res.send('Welcome to Cre8tify Backend API!');
});

// --- Routes ---
// Use the user routes for anything starting with /api/users
app.use('/api/users', require('./routes/userRoutes'));
// Use the design routes for anything starting with /api/designs
app.use('/api/designs', require('./routes/designRoutes'));
// Use the admin routes for anything starting with /api/admin
app.use('/api/admin', require('./routes/adminRoutes'));
// --- Error Handling Middleware ---
// This must be placed after routes
app.use(errorHandler);


// Start the server and listen for connections
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});