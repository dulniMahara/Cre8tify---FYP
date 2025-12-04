require('dotenv').config(); 
// Import the connection function
const connectDB = require('./config/db'); 
 
// Connect to the database
connectDB(); 

const express = require('express');
const app = express();
// Set the port number from the .env file, or use 3000 as a backup
const port = process.env.PORT || 3000;

// Define a basic route (the home page)
app.get('/', (req, res) => {
    res.send('Welcome to Cre8tify Backend API!');
});

// Start the server and listen for connections
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});