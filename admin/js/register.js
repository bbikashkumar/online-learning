const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploaded_files/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Unique ID generator function (simplified)
const unique_id = () => {
    return 'id-' + Math.random().toString(36).substr(2, 9);
};

// Register Route
router.get('/register', (req, res) => {
    res.render('admin/register', { messages: [] });
});

// Handle registration
router.post('/register', upload.single('image'), async (req, res) => {
    const { name, profession, email, pass, cpass } = req.body;
    const messages = [];

    const sanitized_name = name.trim();
    const sanitized_profession = profession.trim();
    const sanitized_email = email.trim();
    const hashed_pass = sha1(pass);
    const hashed_cpass = sha1(cpass);
    
    const [existingTutor] = await db.execute("SELECT * FROM tutors WHERE email = ?", [sanitized_email]);

    if (existingTutor.length > 0) {
        messages.push('Email already taken!');
    } else {
        if (hashed_pass !== hashed_cpass) {
            messages.push('Confirm password does not match!');
        } else {
            const id = unique_id();
            const image = req.file.filename;

            await db.execute("INSERT INTO tutors (id, name, profession, email, password, image) VALUES (?, ?, ?, ?, ?, ?)", 
            [id, sanitized_name, sanitized_profession, sanitized_email, hashed_cpass, image]);

            messages.push('New tutor registered! Please login now.');
        }
    }

    res.render('admin/register', { messages });
});

module.exports = router;
