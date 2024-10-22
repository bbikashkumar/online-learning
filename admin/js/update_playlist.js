const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const fs = require('fs');
const path = require('path');

// Middleware to verify if the tutor is logged in
router.use((req, res, next) => {
    if (!req.cookies.tutor_id) {
        return res.redirect('/login');
    }
    next();
});

// Update playlist route
router.post('/update_playlist/:id', async (req, res) => {
    const playlistId = req.params.id;
    const { title, description, status, old_image } = req.body;
    const image = req.files ? req.files.image : null;

    try {
        // Update playlist details
        await db.execute("UPDATE `playlist` SET title = ?, description = ?, status = ? WHERE id = ?", [title, description, status, playlistId]);

        // Handle image upload
        if (image && image.size > 0) {
            const imagePath = path.join(__dirname, '../uploaded_files', old_image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Remove old image
            }
            const rename = `${Date.now()}.${image.name.split('.').pop()}`;
            const uploadPath = path.join(__dirname, '../uploaded_files', rename);
            await image.mv(uploadPath);
            await db.execute("UPDATE `playlist` SET thumb = ? WHERE id = ?", [rename, playlistId]);
        }

        res.redirect('/playlists'); // Redirect to playlists page
    } catch (error) {
        console.error(error);
        res.send('Error updating playlist');
    }
});

// Delete playlist route
router.post('/delete_playlist', async (req, res) => {
    const { playlist_id, old_image } = req.body;
    try {
        const playlistPath = path.join(__dirname, '../uploaded_files', old_image);
        if (fs.existsSync(playlistPath)) {
            fs.unlinkSync(playlistPath); // Remove playlist image
        }
        await db.execute("DELETE FROM `bookmark` WHERE playlist_id = ?", [playlist_id]);
        await db.execute("DELETE FROM `playlist` WHERE id = ?", [playlist_id]);
        res.redirect('/playlists'); // Redirect to playlists page
    } catch (error) {
        console.error(error);
        res.send('Error deleting playlist');
    }
});

// Get playlist for updating
router.get('/update_playlist/:id', async (req, res) => {
    const playlistId = req.params.id;
    try {
        const [playlists] = await db.execute("SELECT * FROM `playlist` WHERE id = ?", [playlistId]);
        if (playlists.length > 0) {
            const playlist = playlists[0];
            const [content] = await db.execute("SELECT * FROM `content` WHERE playlist_id = ?", [playlist.id]);
            const totalVideos = content.length;

            res.render('admin/update_playlist', { playlist, totalVideos });
        } else {
            res.redirect('/playlists');
        }
    } catch (error) {
        console.error(error);
        res.send('Error fetching playlist');
    }
});

module.exports = router;
