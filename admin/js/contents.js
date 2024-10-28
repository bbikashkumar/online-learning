const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Import your db connection
const fs = require('fs'); // Import fs module if needed for file handling

// Middleware to check if tutor is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.cookies.tutor_id) {
        return res.redirect('/login');
    }
    next();
};

// Route to display contents
router.get('/', isLoggedIn, async (req, res) => {
    const tutor_id = req.cookies.tutor_id;
    const message = []; // Initialize message variable
    try {
        const [contents] = await db.execute("SELECT * FROM `content` WHERE tutor_id = ? ORDER BY date DESC", [tutor_id]);

        // Assuming profile data is also needed for header or other components
        const [profileData] = await db.execute('SELECT * FROM tutors WHERE id = ?', [tutor_id]);
        const profile = profileData[0] || {};

        res.render('contents', { contents, message, profile });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Route to delete a video
router.post('/delete_video', isLoggedIn, async (req, res) => {
    const video_id = req.body.video_id;
    try {
        const [video] = await db.execute("SELECT * FROM `content` WHERE id = ? LIMIT 1", [video_id]);
        if (video.length > 0) {
            const videoData = video[0];
            
            // Delete files if they exist
            if (videoData.thumb) {
                fs.unlinkSync(`./uploaded_files/${videoData.thumb}`);
            }
            if (videoData.video) {
                fs.unlinkSync(`./uploaded_files/${videoData.video}`);
            }

            // Delete associated likes and comments
            await db.execute("DELETE FROM `likes` WHERE content_id = ?", [video_id]);
            await db.execute("DELETE FROM `comments` WHERE content_id = ?", [video_id]);

            // Delete the content itself
            await db.execute("DELETE FROM `content` WHERE id = ?", [video_id]);

            res.redirect('/admin/contents');
        } else {
            res.redirect('/admin/contents');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
