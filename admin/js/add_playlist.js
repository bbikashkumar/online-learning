const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const connection = require('../../config/db'); // Database connection

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploaded_files'); // Directory to store uploaded files
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext); // Unique file name using UUID
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 } // Limit file size to 2MB
}).single('image');

// Helper function for sanitizing input
const sanitizeString = (str) => str.replace(/[^a-z0-9 .,?!]/gi, '');

router.get('/add_playlist', (req, res) => {
    if (req.cookies.tutor_id) {
        res.render('admin/ejs/add_playlist', { tutor_id: req.cookies.tutor_id });
    } else {
        res.redirect('/login');
    }
});

router.post('/add_playlist', (req, res) => {
    if (!req.cookies.tutor_id) {
        return res.redirect('/login');
    }

    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send({ message: 'File upload error!' });
        }

        const { title, description, status } = req.body;
        const tutor_id = req.cookies.tutor_id;
        const id = uuidv4();

        const sanitizedTitle = sanitizeString(title);
        const sanitizedDescription = sanitizeString(description);
        const sanitizedStatus = sanitizeString(status);

        const image = req.file ? req.file.filename : null;

        if (image) {
            const query = `INSERT INTO playlist (id, tutor_id, title, description, thumb, status) 
                           VALUES (?, ?, ?, ?, ?, ?)`;

            connection.query(query, [id, tutor_id, sanitizedTitle, sanitizedDescription, image, sanitizedStatus], (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).send({ message: 'Database error' });
                } else {
                    res.redirect('/admin/add_playlist');
                }
            });
        } else {
            res.status(400).send({ message: 'Please upload an image!' });
        }
    });
});

module.exports = router;
