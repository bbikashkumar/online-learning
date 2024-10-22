const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const fs = require('fs');
const path = require('path');

// Middleware to check if tutor is logged in
router.use((req, res, next) => {
    if (!req.cookies.tutor_id) {
        return res.redirect('/login');
    }
    next();
});

// Fetch playlists for the logged-in tutor
router.get('/playlists', async (req, res) => {
    const tutor_id = req.cookies.tutor_id;
    try {
        const [playlists] = await db.execute('SELECT * FROM playlist WHERE tutor_id = ? ORDER BY date DESC', [tutor_id]);
        
        // Count videos for each playlist
        for (const playlist of playlists) {
            const [videos] = await db.execute('SELECT * FROM content WHERE playlist_id = ?', [playlist.id]);
            playlist.videoCount = videos.length;
        }

        res.render('admin/playlists', { playlists });
    } catch (error) {
        console.error(error);
        res.send('Error loading playlists');
    }
});

// Delete a playlist
router.post('/delete_playlist', async (req, res) => {
    const { playlist_id } = req.body;
    const tutor_id = req.cookies.tutor_id;
    try {
        const [playlist] = await db.execute('SELECT * FROM playlist WHERE id = ? AND tutor_id = ? LIMIT 1', [playlist_id, tutor_id]);
        if (playlist.length > 0) {
            const playlistData = playlist[0];
            const thumbPath = path.join(__dirname, '../uploaded_files/', playlistData.thumb);
            // Delete thumbnail from the file system
            if (fs.existsSync(thumbPath)) {
                fs.unlinkSync(thumbPath);
            }
            // Delete associated bookmarks and the playlist
            await db.execute('DELETE FROM bookmark WHERE playlist_id = ?', [playlist_id]);
            await db.execute('DELETE FROM playlist WHERE id = ?', [playlist_id]);
            res.redirect('/playlists');
        } else {
            res.redirect('/playlists');
        }
    } catch (error) {
        console.error(error);
        res.send('Error deleting playlist');
    }
});

module.exports = router;
