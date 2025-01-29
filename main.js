// Import required modules
require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const routes = require('./routes/routes'); // Import routes

const app = express();
const PORT = process.env.PORT || 4000;

// Check for required environment variables
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in .env file');
    process.exit(1); // Exit the application if MONGO_URI is missing
}

// Database Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the application if the database connection fails
    });

const db = mongoose.connection;
db.on('error', (error) => console.error('Database error:', error));
db.once('open', () => console.log('Database connection is open!'));

// Middlewares
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON data

// Configure session
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'my_secret_key', // Use environment variable for session secret
        saveUninitialized: true,
        resave: false,
    })
);

// Flash message middleware
app.use((req, res, next) => {
    res.locals.message = req.session.message || null;
    delete req.session.message;
    next();
});

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Routes
app.use('/', routes);

// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).render('layout/404', { title: '404 - Page Not Found' });
});

// Global Error Handler (optional)
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Something went wrong! Please try again later.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



app.use(session({
    secret: 'ABC',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set 'secure: true' in production with HTTPS
}));

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Set view engine to EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Body parsing middleware
app.use(express.urlencoded({ extended: true })); // Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Body parsing middleware for form data
app.use(express.urlencoded({ extended: true }));

// Set up view engine and routes
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));