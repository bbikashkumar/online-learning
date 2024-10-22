// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Assuming you're using a db.js file for connection
const sha1 = require('crypto').createHash('sha1'); // Include necessary hashing

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const pass = req.body.pass;
    const hashedPass = sha1.update(pass).digest('hex'); // Hashing the password using SHA1

    // SQL query to select user
    const selectUserQuery = "SELECT * FROM `users` WHERE email = ? AND password = ? LIMIT 1";
    try {
        const [rows] = await db.execute(selectUserQuery, [email, hashedPass]);
        
        if (rows.length > 0) {
            // Set cookie
            res.cookie('user_id', rows[0].id, { maxAge: 60 * 60 * 24 * 30 * 1000, httpOnly: true });
            return res.redirect('/home'); // Redirect to home after successful login
        } else {
            const message = 'incorrect email or password!';
            return res.render('login', { message }); // Render login.ejs with an error message
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
