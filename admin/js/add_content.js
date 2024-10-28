const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db'); // DB connection

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploaded_files');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext); // Rename file with unique ID
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 } // Limit file size to 2MB
}).fields([
    { name: 'thumb', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);

router.get('/', async (req, res) => {
    const tutor_id = req.cookies.tutor_id; // Move inside the route
    if (tutor_id) {
        const message = [];
        const [profileData] = await db.execute('SELECT * FROM tutors WHERE id = ?', [tutor_id]);
        const profile = profileData[0] || {};

        // Fetch playlists associated with the tutor
        const [playlistData] = await db.execute('SELECT * FROM playlist WHERE tutor_id = ?', [tutor_id]);
        const playlists = playlistData || [];

        res.render('add_content', { tutor_id, message, profile, playlists });
    } else {
        res.redirect('/admin/login');
    }
});
// Route to handle content upload
router.post('/add_content', (req, res) => {
    const tutor_id = req.cookies.tutor_id || '';

    if (!tutor_id) {
        return res.redirect('/login');
    }

    upload(req, res, (err) => {
        if (err) {
            return res.render('admin/ejs/add_content', { message: 'File upload error!' });
        }

        const { status, title, description, playlist } = req.body;
        const thumb = req.files['thumb'][0].filename;
        const video = req.files['video'][0].filename;

        // Insert data into the database
        const sql = `INSERT INTO content (id, tutor_id, playlist_id, title, description, video, thumb, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [uuidv4(), tutor_id, playlist, title, description, video, thumb, status];

        connection.query(sql, values, (err, result) => {
            if (err) {
                return res.render('admin/ejs/add_content', { message: 'Database error!' });
            }
            res.render('admin/ejs/add_content', { message: 'New course uploaded successfully!' });
        });
    });
});

module.exports = router;
