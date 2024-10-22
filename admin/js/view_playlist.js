const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Middleware to check authentication
function checkAuth(req, res, next) {
    if (req.cookies.tutor_id) {
        next();
    } else {
        res.redirect('login');
    }
}

// Get playlist details and videos
router.get('/view_playlist', checkAuth, async (req, res) => {
    const tutor_id = req.cookies.tutor_id;
    const get_id = req.query.get_id;

    // Fetch playlist details
    const [playlist] = await db.query('SELECT * FROM `playlist` WHERE id = ? AND tutor_id = ?', [get_id, tutor_id]);
    
    // Fetch videos for the playlist
    const videos = await db.query('SELECT * FROM `content` WHERE tutor_id = ? AND playlist_id = ?', [tutor_id, get_id]);

    // Render EJS file
    res.render('admin/ejs/view_playlist', {
        playlist: playlist[0] ? { ...playlist[0], totalVideos: videos.length } : null,
        videos: videos
    });
});

// Delete playlist
router.post('/view_playlist', checkAuth, async (req, res) => {
    const { delete_playlist, delete_video, playlist_id, video_id } = req.body;

    if (delete_playlist) {
        // Delete the playlist and its associated content
        const [playlist] = await db.query('SELECT * FROM `playlist` WHERE id = ?', [playlist_id]);
        if (playlist.length) {
            unlink(`../uploaded_files/${playlist[0].thumb}`);
            await db.query('DELETE FROM `bookmark` WHERE playlist_id = ?', [playlist_id]);
            await db.query('DELETE FROM `playlist` WHERE id = ?', [playlist_id]);
            res.redirect('playlists');
        }
    }

    if (delete_video) {
        // Delete the video
        const [video] = await db.query('SELECT * FROM `content` WHERE id = ?', [video_id]);
        if (video.length) {
            unlink(`../uploaded_files/${video[0].thumb}`);
            unlink(`../uploaded_files/${video[0].video}`);
            await db.query('DELETE FROM `likes` WHERE content_id = ?', [video_id]);
            await db.query('DELETE FROM `comments` WHERE content_id = ?', [video_id]);
            await db.query('DELETE FROM `content` WHERE id = ?', [video_id]);
            res.redirect(`view_playlist?get_id=${playlist_id}`);
        }
    }
});

module.exports = router;
