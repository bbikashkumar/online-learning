const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');

// Setup storage for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploaded_files'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware to verify if the tutor is logged in
router.use((req, res, next) => {
    if (!req.cookies.tutor_id) {
        return res.redirect('/login');
    }
    next();
});

// Render the update profile page
router.get('/update_profile', async (req, res) => {
    try {
        const tutor_id = req.cookies.tutor_id;
        const [rows] = await db.execute('SELECT * FROM tutors WHERE id = ?', [tutor_id]);
        const tutor = rows[0];
        res.render('admin/update_profile', { tutor });
    } catch (error) {
        console.error(error);
        res.send('Error loading profile');
    }
});

// Update profile information
router.post('/update_profile', upload.single('image'), async (req, res) => {
    const tutor_id = req.cookies.tutor_id;
    const { name, profession, email, old_pass, new_pass, cpass } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM tutors WHERE id = ?', [tutor_id]);
        const tutor = rows[0];
        const messages = [];

        if (name) {
            await db.execute('UPDATE tutors SET name = ? WHERE id = ?', [name, tutor_id]);
            messages.push('Username updated successfully!');
        }

        if (profession) {
            await db.execute('UPDATE tutors SET profession = ? WHERE id = ?', [profession, tutor_id]);
            messages.push('Profession updated successfully!');
        }

        if (email) {
            const [emailCheck] = await db.execute('SELECT email FROM tutors WHERE id != ? AND email = ?', [tutor_id, email]);
            if (emailCheck.length > 0) {
                messages.push('Email already taken!');
            } else {
                await db.execute('UPDATE tutors SET email = ? WHERE id = ?', [email, tutor_id]);
                messages.push('Email updated successfully!');
            }
        }

        if (req.file) {
            const image = req.file.filename;
            await db.execute('UPDATE tutors SET image = ? WHERE id = ?', [image, tutor_id]);
            messages.push('Image updated successfully!');
        }

        if (old_pass && new_pass && cpass) {
            const prev_pass = tutor.password; // hashed password from DB
            if (old_pass !== prev_pass) {
                messages.push('Old password not matched!');
            } else if (new_pass !== cpass) {
                messages.push('Confirm password not matched!');
            } else {
                const hashedNewPass = sha1(new_pass);
                await db.execute('UPDATE tutors SET password = ? WHERE id = ?', [hashedNewPass, tutor_id]);
                messages.push('Password updated successfully!');
            }
        }

        // Redirect with messages
        req.flash('messages', messages);
        res.redirect('/update_profile');
    } catch (error) {
        console.error(error);
        res.send('Error updating profile');
    }
});

module.exports = router;
