const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Import your db connection

// Middleware to check if tutor is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.cookies.tutor_id) {
        return res.redirect('/login');
    }
    next();
};

// Route to display contents
router.get('/contents', isLoggedIn, async (req, res) => {
    const tutor_id = req.cookies.tutor_id;
    try {
        const [contents] = await db.execute("SELECT * FROM `content` WHERE tutor_id = ? ORDER BY date DESC", [tutor_id]);
        res.render('admin/contents', { contents });
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
            
            // Delete files
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

            res.redirect('/contents');
        } else {
            res.redirect('/contents');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
