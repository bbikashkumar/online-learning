const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path based on your project structure
const sha1 = require('sha1'); // For hashing passwords

// Middleware to check for logged-in users
const checkUserLoggedIn = (req, res, next) => {
    if (req.cookies.user_id) {
        return res.redirect('/home');
    }
    next();
};

// Use the checkUserLoggedIn middleware for this route
router.use(checkUserLoggedIn);

// Route to render login page
router.get('/', (req, res) => {
    res.render('login');
});

// Route to handle login form submission
router.post('/', async (req, res) => {
    const email = req.body.email.trim();
    const pass = sha1(req.body.pass); // Hash the password

    try {
        const [user] = await db.query("SELECT * FROM `users` WHERE email = ? AND password = ? LIMIT 1", [email, pass]);
        
        if (user.length > 0) {
            res.cookie('user_id', user[0].id, { maxAge: 60 * 60 * 24 * 30 * 1000, httpOnly: true });
            return res.redirect('/home');
        } else {
            req.flash('message', 'Incorrect email or password!');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
