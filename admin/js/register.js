const express = require('express');
const router = express.Router();
const db = require('../../config/db');
// const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploaded_files/');
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + ext);
//     }
// });

// const upload = multer({ storage: storage });

// Unique ID generator function (simplified)
const unique_id = () => {
    return 'id-' + Math.random().toString(36).substr(2, 9);
};

// Register Route
router.get('/', (req, res) => {
    res.render('register', { messages: [] });
});

// Handle registration
router.post('/', async (req, res) => { // Make the callback async
    const { name, profession, email, pass, cpass } = req.body;
    const messages = [];

    const sanitized_name = name;
    const sanitized_profession = profession;
    const sanitized_email = email;
    const hashed_pass = pass;
    const hashed_cpass = cpass;
    
    try {
        // Await the database query and destructure the result
        const [existingTutor] = await db.execute("SELECT * FROM tutors WHERE email = ?", [sanitized_email]);

        if (existingTutor.length > 0) {
            messages.push('Email already taken!');
        } else {
            if (hashed_pass !== hashed_cpass) {
                messages.push('Confirm password does not match!');
            } else {
                const id = unique_id();
                const image = req.file ? req.file.filename : null;

                await db.execute("INSERT INTO tutors (id, name, profession, email, password) VALUES (?, ?, ?, ?, ?)", 
                    [id, sanitized_name, sanitized_profession, sanitized_email, hashed_cpass]);

                messages.push('New tutor registered! Please login now.');
            }
        }
    } catch (error) {
        console.error('Database error:', error);
        messages.push('An error occurred during registration.');
    }

    res.render('register', { messages });
});

module.exports = router;
