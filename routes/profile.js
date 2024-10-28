const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path to your database connection

// Route to get the user profile
router.get('/', async (req, res) => {
    const user_id = req.cookies.user_id || '';

    if (!user_id) {
        return res.redirect('/login'); // Adjust the path to your login route
    }

    try {
        console.log('User ID:', user_id); // Debugging line

        // Query to get likes
        const [likesResults] = await db.query('SELECT * FROM `likes` WHERE user_id = ?', [user_id]);
        const totalLikes = likesResults.length;

        // Query to get comments
        const [commentsResults] = await db.query('SELECT * FROM `comments` WHERE user_id = ?', [user_id]);
        const totalComments = commentsResults.length;

        // Query to get bookmarks
        const [bookmarksResults] = await db.query('SELECT * FROM `bookmark` WHERE user_id = ?', [user_id]);
        const totalBookmarked = bookmarksResults.length;

        // Query to get the user profile
        const [profileResults] = await db.query('SELECT * FROM `users` WHERE id = ?', [user_id]);
        const fetchProfile = profileResults[0];

        // Updated Query to get the playlist IDs
        const [playlistsResults] = await db.query('SELECT id FROM `playlist` WHERE tutor_id = ?', [user_id]);

        const playlistId = playlistsResults.length > 0 ? playlistsResults[0].id : null;

        // Render the profile page with fetched data
        res.render('profile', {
            fetchProfile,
            totalLikes,
            totalComments,
            totalBookmarked,
            playlistId,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database query error');
    }
});

module.exports = router;
