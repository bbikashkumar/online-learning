const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Middleware to check if tutor is logged in
const checkTutor = (req, res, next) => {
    if (req.cookies.tutor_id) {
        next();
    } else {
        res.redirect('/login');
    }
};

// GET search page
router.get('/search', checkTutor, async (req, res) => {
    const tutor_id = req.cookies.tutor_id;
    const search = req.query.search || '';

    try {
        // Fetch videos
        const selectVideos = await db.query("SELECT * FROM `content` WHERE title LIKE ? AND tutor_id = ? ORDER BY date DESC", [`%${search}%`, tutor_id]);
        const searchResults = selectVideos[0];

        // Fetch playlists
        const selectPlaylists = await db.query("SELECT * FROM `playlist` WHERE title LIKE ? AND tutor_id = ? ORDER BY date DESC", [`%${search}%`, tutor_id]);
        const playlistResults = selectPlaylists[0].map(async playlist => {
            const countVideos = await db.query("SELECT COUNT(*) AS total_videos FROM `content` WHERE playlist_id = ?", [playlist.id]);
            return {
                ...playlist,
                total_videos: countVideos[0][0].total_videos
            };
        });

        res.render('search_page', {
            searchResults,
            playlistResults: await Promise.all(playlistResults)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// POST delete video or playlist
router.post('/delete', async (req, res) => {
    const { video_id, playlist_id } = req.body;

    // Handle deleting video
    if (video_id) {
        // Logic to delete video goes here
    }

    // Handle deleting playlist
    if (playlist_id) {
        // Logic to delete playlist goes here
    }

    res.redirect('/search');
});

module.exports = router;
