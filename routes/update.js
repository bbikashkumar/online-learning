// routes/userRoutes.js
const express = require('express');
const db = require('../config/db'); // Assume you have a db.js for database connection
const fileUpload = require('express-fileupload');

const router = express.Router();

// Middleware to handle file uploads
router.use(fileUpload());

// Route to render the update profile form
router.get('/update', async (req, res) => {
    const user_id = req.cookies.user_id;
    if (!user_id) {
        return res.redirect('/login');
    }

    try {
        const [user] = await db.query("SELECT * FROM `users` WHERE id = ? LIMIT 1", [user_id]);
        res.render('updateProfile', { message: [], fetch_profile: user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to handle the profile update logic
router.post('/update', async (req, res) => {
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

        // Image upload handling
        if (req.files && req.files.image) {
            const image = req.files.image;
            const imageSize = image.size;
            const ext = image.name.split('.').pop();
            const rename = `${user_id}.${ext}`;
            const imageFolder = `uploaded_files/${rename}`;

            if (imageSize > 2000000) {
                message.push('Image size too large!');
            } else {
                await db.query("UPDATE `users` SET `image` = ? WHERE id = ?", [rename, user_id]);
                image.mv(imageFolder);
                message.push('Image updated successfully!');
            }
        }

        // Password update handling
        const { old_pass, new_pass, cpass } = req.body;
        const prev_pass = user.password;

        if (old_pass && new_pass && cpass) {
            if (old_pass !== prev_pass) {
                message.push('Old password not matched!');
            } else if (new_pass !== cpass) {
                message.push('Confirm password not matched!');
            } else {
                await db.query("UPDATE `users` SET password = ? WHERE id = ?", [new_pass, user_id]);
                message.push('Password updated successfully!');
            }
        }

        res.render('updateProfile', { message, fetch_profile: user });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
