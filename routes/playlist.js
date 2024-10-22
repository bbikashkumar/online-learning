const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path based on your project structure
const { check, validationResult } = require('express-validator');

// Middleware to check for logged-in users
const checkUserLoggedIn = (req, res, next) => {
    if (!req.cookies.user_id) {
        return res.redirect('/home');
    }
    next();
};

// Use the checkUserLoggedIn middleware for this route
router.use(checkUserLoggedIn);

// Route to render the playlist page
router.get('/:id', async (req, res) => {
    const user_id = req.cookies.user_id;
    const playlistId = req.params.id;

    try {
        const [playlist] = await db.query("SELECT * FROM `playlist` WHERE id = ? AND status = ? LIMIT 1", [playlistId, 'active']);
        
        if (playlist.length === 0) {
            return res.render('playlist', { playlist: null, videos: [], isBookmarked: false });
        }

        const totalVideos = await db.query("SELECT COUNT(*) as count FROM `content` WHERE playlist_id = ?", [playlistId]);
        const [tutor] = await db.query("SELECT * FROM `tutors` WHERE id = ? LIMIT 1", [playlist[0].tutor_id]);
        const [bookmarked] = await db.query("SELECT * FROM `bookmark` WHERE user_id = ? AND playlist_id = ?", [user_id, playlistId]);
        
        const videos = await db.query("SELECT * FROM `content` WHERE playlist_id = ? AND status = ? ORDER BY date DESC", [playlistId, 'active']);

        res.render('playlist', {
            playlist: playlist[0],
            totalVideos: totalVideos[0].count,
            tutor: tutor[0],
            videos,
            isBookmarked: bookmarked.length > 0,
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});

// Route to handle saving/removing a bookmark
router.post('/:id', async (req, res) => {
    const user_id = req.cookies.user_id;
    const playlistId = req.params.id;

    if (!user_id) {
        req.flash('message', 'Please login first!');
        return res.redirect(`/playlist/${playlistId}`);
    }

    const list_id = req.body.list_id;

    try {
        const [bookmarked] = await db.query("SELECT * FROM `bookmark` WHERE user_id = ? AND playlist_id = ?", [user_id, list_id]);
        
        if (bookmarked.length > 0) {
            await db.query("DELETE FROM `bookmark` WHERE user_id = ? AND playlist_id = ?", [user_id, list_id]);
            req.flash('message', 'Playlist removed!');
        } else {
            await db.query("INSERT INTO `bookmark`(user_id, playlist_id) VALUES(?, ?)", [user_id, list_id]);
            req.flash('message', 'Playlist saved!');
        }

        res.redirect(`/playlist/${playlistId}`);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
