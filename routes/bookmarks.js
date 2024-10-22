const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Correct path for database connection, assuming db.js is in config directory

// Middleware to check if user is logged in
function checkUser(req, res, next) {
    if (req.cookies.user_id) {
        next();
    } else {
        res.redirect('/home'); // Redirect to home if not logged in
    }
}

// Get bookmarked playlists
router.get('/', checkUser, async (req, res) => { // Updated path to match '/bookmarks' prefix
    const user_id = req.cookies.user_id;

    try {
        const selectBookmarks = await db.query("SELECT * FROM `bookmark` WHERE user_id = ?", [user_id]);
        const bookmarks = [];

        if (selectBookmarks.length > 0) {
            for (const bookmark of selectBookmarks) {
                const selectCourse = await db.query("SELECT * FROM `playlist` WHERE id = ? AND status = ? ORDER BY date DESC", [bookmark.playlist_id, 'active']);
                if (selectCourse.length > 0) {
                    const course = selectCourse[0];
                    const selectTutor = await db.query("SELECT * FROM `tutors` WHERE id = ?", [course.tutor_id]);
                    if (selectTutor.length > 0) {
                        bookmarks.push({
                            course: course,
                            tutor: selectTutor[0]
                        });
                    }
                }
            }
        }

        res.render('bookmarks', { bookmarks }); // Render bookmarks page with the bookmarks array
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
