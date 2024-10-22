const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Middleware to verify if the tutor is logged in
router.use((req, res, next) => {
    if (!req.cookies.tutor_id) {
        return res.redirect('/login');
    }
    next();
});

// Fetch profile details for the logged-in tutor
router.get('/profile', async (req, res) => {
    const tutor_id = req.cookies.tutor_id;
    try {
        // Fetch playlists, contents, likes, and comments counts
        const [playlists] = await db.execute('SELECT * FROM playlist WHERE tutor_id = ?', [tutor_id]);
        const [contents] = await db.execute('SELECT * FROM content WHERE tutor_id = ?', [tutor_id]);
        const [likes] = await db.execute('SELECT * FROM likes WHERE tutor_id = ?', [tutor_id]);
        const [comments] = await db.execute('SELECT * FROM comments WHERE tutor_id = ?', [tutor_id]);

        const total_playlists = playlists.length;
        const total_contents = contents.length;
        const total_likes = likes.length;
        const total_comments = comments.length;

        // Assuming a fetch for profile details (you may need to adjust the query)
        const [profile] = await db.execute('SELECT * FROM tutors WHERE id = ?', [tutor_id]);

        res.render('admin/profile', { profile: profile[0], total_playlists, total_contents, total_likes, total_comments });
    } catch (error) {
        console.error(error);
        res.send('Error loading profile');
    }
});

module.exports = router;
