const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust this path based on your project structure
const { v4: uuidv4 } = require('uuid');

// Render register page
router.get('/', (req, res) => {
    res.render('register', { messages: [] }); // Pass an empty messages array
});

// Registration route
router.post('/', async (req, res) => {
    const messages = [];

    const name = req.body.name;
    const email = req.body.email;
    const pass = req.body.pass;
    const cpass = req.body.cpass;

    // Basic input sanitization (improve as needed)
    const sanitized_name = name;
    const sanitized_email = email;
    const sanitized_pass = pass;
    const sanitized_cpass = cpass;

    try {
        // Check for existing user
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [sanitized_email]);

        if (existingUser.length > 0) {
            messages.push('Email already taken!');
        } else {
            if (sanitized_pass !== sanitized_cpass) {
                messages.push('Confirm password does not match!');
            } else {
                // Insert new user
                const userId = uuidv4();
                await db.query(
                    'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', 
                    [userId, sanitized_name, sanitized_email, sanitized_pass]
                );
                messages.push('New tutor registered! Please login now.');

                // Verify the user after insertion
                const [verifyResults] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', 
                    [sanitized_email, sanitized_pass]
                );

                if (verifyResults.length > 0) {
                    res.cookie('user_id', verifyResults[0].id, { maxAge: 60 * 60 * 24 * 30 * 1000, httpOnly: true });
                    return res.redirect('/home'); // Adjust path as necessary
                }
            }
        }
    } catch (err) {
        console.error('Database error:', err);
        messages.push('An error occurred during registration.');
    }

    // Render the registration page again with messages
    res.render('register', { messages });
});

module.exports = router;
