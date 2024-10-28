const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET request for the dashboard
router.get('/', async (req, res) => {
    const tutor_id = req.cookies.tutor_id; // Get tutor_id from cookies
    if (!tutor_id) {
        return res.redirect('/admin/login'); // Redirect if no tutor_id
    }

    try {
        // Fetching data from the database
        const totalContents = await db.query('SELECT COUNT(*) AS count FROM content WHERE tutor_id = ?', [tutor_id]);
        const totalPlaylists = await db.query('SELECT COUNT(*) AS count FROM playlist WHERE tutor_id = ?', [tutor_id]);
        const totalLikes = await db.query('SELECT COUNT(*) AS count FROM likes WHERE tutor_id = ?', [tutor_id]);
        const totalComments = await db.query('SELECT COUNT(*) AS count FROM comments WHERE tutor_id = ?', [tutor_id]);
        
        // Fetching tutor profile (Assuming you have a 'tutors' table with 'id' and other profile fields)
        const profile = await db.query('SELECT * FROM tutors WHERE id = ?', [tutor_id]);

        // Render the EJS dashboard page with fetched data and message
        const message = []; // You can set this to whatever messages you want to show
        res.render('dashboard', {
            message, // Pass the message array
            totalContents: totalContents[0].count,
            totalPlaylists: totalPlaylists[0].count,
            totalLikes: totalLikes[0].count,
            totalComments: totalComments[0].count,
            profile: profile[0] // Pass the profile object (assuming profile has been fetched)
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/login'); // Redirect on error
    }
});

module.exports = router;
