const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path based on your project structure

// Middleware to handle contact form submission
router.post('/', async (req, res) => {
    const { name, email, number, msg } = req.body;

    // Sanitize input
    const sanitized_name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitized_email = email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitized_number = number.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitized_msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    try {
        const [rows] = await db.query("SELECT * FROM contact WHERE name = ? AND email = ? AND number = ? AND message = ?", 
            [sanitized_name, sanitized_email, sanitized_number, sanitized_msg]);

        if (rows.length > 0) {
            return res.json({ message: 'Message sent already!' });
        }

        await db.query("INSERT INTO contact(name, email, number, message) VALUES(?, ?, ?, ?)", 
            [sanitized_name, sanitized_email, sanitized_number, sanitized_msg]);

        res.json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Render contact page
router.get('/', (req, res) => {
    res.render('contact');
});

module.exports = router;
