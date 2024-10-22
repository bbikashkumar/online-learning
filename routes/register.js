const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust this path based on your project structure
const multer = require('multer');
const path = require('path');

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploaded_files');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Unique ID function (implement your own logic)
function unique_id() {
    return 'user_' + Date.now(); // Example: you can use a better unique ID generator
}

// Registration route
router.post('/', upload.single('image'), (req, res) => {
    const user_id = req.cookies.user_id || '';

    const name = req.body.name;
    const email = req.body.email;
    const pass = req.body.pass;
    const cpass = req.body.cpass;
    const image = req.file.filename; // This will give you the file name of the uploaded image

    // Basic input sanitization (improve as needed)
    const sanitized_name = name.trim();
    const sanitized_email = email.trim();
    const sanitized_pass = pass.trim();
    const sanitized_cpass = cpass.trim();

    // Check for existing user
    db.query('SELECT * FROM `users` WHERE email = ?', [sanitized_email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query error');
        }

        if (results.length > 0) {
            return res.render('register', { message: 'Email already taken!' });
        } else {
            if (sanitized_pass !== sanitized_cpass) {
                return res.render('register', { message: 'Confirm password not matched!' });
            } else {
                // Hash password (you can use a library like bcrypt)
                const hashed_pass = sha1(sanitized_pass); // Using SHA1 as in original code; consider using bcrypt

                // Insert new user
                db.query('INSERT INTO `users` (id, name, email, password, image) VALUES (?, ?, ?, ?, ?)', 
                [unique_id(), sanitized_name, sanitized_email, hashed_pass, image], 
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error inserting user');
                    }

                    // Verify the user
                    db.query('SELECT * FROM `users` WHERE email = ? AND password = ?', 
                    [sanitized_email, hashed_pass], (err, verifyResults) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Database query error');
                        }

                        if (verifyResults.length > 0) {
                            res.cookie('user_id', verifyResults[0].id, { maxAge: 60 * 60 * 24 * 30 * 1000, httpOnly: true });
                            return res.redirect('/home'); // Adjust path as necessary
                        }
                    });
                });
            }
        }
    });
});

// Render register page
router.get('/', (req, res) => {
    res.render('register');
});

module.exports = router;
