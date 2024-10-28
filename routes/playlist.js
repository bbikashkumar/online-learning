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
// Route to render the profile page
router.get('/', async (req, res) => {
    const user_id = req.cookies.user_id; // Get user ID from cookies/session

    try {
        // Fetch user's profile
        const [fetchProfile] = await db.query("SELECT * FROM `users` WHERE id = ? LIMIT 1", [user_id]);

        // Get total bookmarked playlists (example query)
        const [bookmarkedPlaylists] = await db.query("SELECT COUNT(*) as count FROM `bookmark` WHERE user_id = ?", [user_id]);

        // Get playlist IDs from bookmarks
        const [playlists] = await db.query("SELECT playlist_id FROM `bookmark` WHERE user_id = ?", [user_id]);

        // Check if playlists are available and get the first one if exists
        const playlistId = playlists.length > 0 ? playlists[0].playlist_id : null;

        // Pass the necessary data to the EJS template
        res.render('profile', {
            fetchProfile: fetchProfile[0], // User profile data
            totalBookmarked: bookmarkedPlaylists[0].count,
            totalLikes: 0, // Replace with actual count
            totalComments: 0, // Replace with actual count
            playlistId // This will be null if no playlists found
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});


// Route to handle saving/removing a bookmark
router.post('/:id/bookmark', async (req, res) => {
    const user_id = req.cookies.user_id;
    const playlistId = req.params.id; // Use playlistId directly from params

    if (!user_id) {
        req.flash('message', 'Please login first!');
        return res.redirect(`/playlist/${playlistId}`);
    }

    try {
        const [bookmarked] = await db.query("SELECT * FROM `bookmark` WHERE user_id = ? AND playlist_id = ?", [user_id, playlistId]);
        
        if (bookmarked.length > 0) {
            await db.query("DELETE FROM `bookmark` WHERE user_id = ? AND playlist_id = ?", [user_id, playlistId]);
            req.flash('message', 'Playlist removed!');
        } else {
            await db.query("INSERT INTO `bookmark`(user_id, playlist_id) VALUES(?, ?)", [user_id, playlistId]);
            req.flash('message', 'Playlist saved!');
        }

        res.redirect(`/playlist/${playlistId}`);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
