const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path to your database connection

// Route to get the user profile
router.get('/profile', (req, res) => {
    const user_id = req.cookies.user_id || '';

    if (!user_id) {
        return res.redirect('/login'); // Adjust the path to your login route
    }

    // Query to get likes
    db.query('SELECT * FROM `likes` WHERE user_id = ?', [user_id], (err, likesResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query error');
        }
        const totalLikes = likesResults.length;

        // Query to get comments
        db.query('SELECT * FROM `comments` WHERE user_id = ?', [user_id], (err, commentsResults) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database query error');
            }
            const totalComments = commentsResults.length;

            // Query to get bookmarks
            db.query('SELECT * FROM `bookmark` WHERE user_id = ?', [user_id], (err, bookmarksResults) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Database query error');
                }
                const totalBookmarked = bookmarksResults.length;

                // Query to get the user profile
                db.query('SELECT * FROM `users` WHERE id = ?', [user_id], (err, profileResults) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Database query error');
                    }
                    const fetchProfile = profileResults[0]; // Assuming the user profile is the first result

                    // Render the profile page with fetched data
                    res.render('profile', {
                        fetchProfile,
                        totalLikes,
                        totalComments,
                        totalBookmarked,
                    });
                });
            });
        });
    });
});

module.exports = router;
