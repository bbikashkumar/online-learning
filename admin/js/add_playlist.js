const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db'); // Import your db connection

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
    limits: { fileSize: 5000000 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: File upload only supports the following filetypes - ' + filetypes);
        }
    }
}).single('image');


// Helper function for sanitizing input
const sanitizeString = (str) => str.replace(/[^a-z0-9 .,?!]/gi, '');

router.get('/', async (req, res) => {
    const tutor_id = req.cookies.tutor_id; // Move inside the route
    if (tutor_id) {
        const [profileData] = await db.execute('SELECT * FROM tutors WHERE id = ?', [tutor_id]);
        const profile = profileData[0] || {};
        const message = [];

        res.render('add_playlist', { tutor_id, message, profile });
    } else {
        res.redirect('/admin/login');
    }
});

router.post('/', async (req, res) => {
    const tutor_id = req.cookies.tutor_id;

    if (!tutor_id) {
        return res.redirect('/login');
    }

    // Use a promise to handle multer file upload
    const uploadPromise = (req, res) => {
        return new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) {
                    console.error('File upload error:', err);
                    return reject(err);
                }
                resolve(req.file);
            });
        });
    };

    try {
        const file = await uploadPromise(req, res); // Await the file upload

        console.log('Request body:', req.body); // Log the request body
        console.log('Uploaded file:', file); // Log the uploaded file

        const { title, description, status } = req.body;

        const sanitizedTitle = sanitizeString(title);
        const sanitizedDescription = sanitizeString(description);
        const sanitizedStatus = sanitizeString(status);
        const image = file ? file.filename : null; // Use the file from the resolved promise

        if (image) {
            const id = uuidv4();
            const query = `INSERT INTO playlist (id, tutor_id, title, description, thumb, status) 
                           VALUES (?, ?, ?, ?, ?, ?)`;

            // Use a promise for the database query
            await new Promise((resolve, reject) => {
                db.query(query, [id, tutor_id, sanitizedTitle, sanitizedDescription, image, sanitizedStatus], (err, results) => {
                    if (err) {
                        console.error(err);
                        return reject(err); // Reject on database error
                    }
                    resolve(results); // Resolve on success
                });
            });

            res.redirect('/admin/add-playlist');
        } else {
            res.status(400).send({ message: 'Please upload an image!' });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(400).send({ message: 'File upload error!', error: err });
    }
});



module.exports = router;
