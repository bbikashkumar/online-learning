// routes/userRoutes.js
const express = require('express');
const db = require('../config/db'); // Assume you have a db.js for database connection
const fileUpload = require('express-fileupload');

const router = express.Router();

// Middleware to handle file uploads
router.use(fileUpload()); // You can remove this line if you don't need file uploads at all

// Route to render the update profile form
router.get('/', async (req, res) => {
    const user_id = req.cookies.user_id;
    if (!user_id) {
        return res.redirect('/login');
    }

    try {
        const [user] = await db.query("SELECT * FROM `users` WHERE id = ? LIMIT 1", [user_id]);
        res.render('update', { message: [], fetch_profile: user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to handle the profile update logic
router.post('/', async (req, res) => {
    const user_id = req.cookies.user_id;

    if (!user_id) {
        return res.redirect('/login');
    }

    try {
        const [user] = await db.query("SELECT * FROM `users` WHERE id = ? LIMIT 1", [user_id]);
        if (!user) {
            return res.redirect('/login');
        }

        const { name, email } = req.body;
        let message = [];

        // Update name
        if (name) {
            await db.query("UPDATE `users` SET name = ? WHERE id = ?", [name, user_id]);
            message.push('Username updated successfully!');
        }

        // Update email
        if (email) {
            const [emailCheck] = await db.query("SELECT email FROM `users` WHERE email = ?", [email]);
            if (emailCheck.length > 0) {
                message.push('Email already taken!');
            } else {
                await db.query("UPDATE `users` SET email = ? WHERE id = ?", [email, user_id]);
                message.push('Email updated successfully!');
            }
        }

        // Password update handling
        const { old_pass, new_pass, cpass } = req.body;

        // Compare the old password directly
        const prev_pass = user.password;

        if (old_pass && new_pass && cpass) {
            if (old_pass !== prev_pass) {
                message.push('Old password not matched!');
            } else if (new_pass !== cpass) {
                message.push('Confirm password not matched!');
            } else {
                // Update the password directly
                await db.query("UPDATE `users` SET password = ? WHERE id = ?", [new_pass, user_id]);
                message.push('Password updated successfully!');
            }
        }

        res.render('update', { message, fetch_profile: user });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
