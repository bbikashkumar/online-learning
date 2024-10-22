const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // adjust according to your db connection
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploaded_files/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Middleware to check for tutor_id in cookies
router.use((req, res, next) => {
  if (req.cookies.tutor_id) {
    req.tutor_id = req.cookies.tutor_id;
    next();
  } else {
    res.redirect('/login');
  }
});

// Route to get the update content page
router.get('/update-content', async (req, res) => {
  const get_id = req.query.get_id;

  if (!get_id) return res.redirect('/dashboard');

  try {
    const selectVideos = await db.query("SELECT * FROM content WHERE id = ? AND tutor_id = ?", [get_id, req.tutor_id]);
    const video = selectVideos[0];

    const selectPlaylists = await db.query("SELECT * FROM playlist WHERE tutor_id = ?", [req.tutor_id]);
    
    res.render('admin/ejs/update_content', {
      video,
      playlists: selectPlaylists
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Route to handle form submission
router.post('/update-content', upload.fields([{ name: 'thumb' }, { name: 'video' }]), async (req, res) => {
  const { video_id, old_thumb, old_video, status, title, description, playlist } = req.body;
  
  // Update content logic
  try {
    await db.query("UPDATE content SET title = ?, description = ?, status = ? WHERE id = ?", [title, description, status, video_id]);

    if (playlist) {
      await db.query("UPDATE content SET playlist_id = ? WHERE id = ?", [playlist, video_id]);
    }

    if (req.files['thumb']) {
      const newThumb = req.files['thumb'][0].filename;
      await db.query("UPDATE content SET thumb = ? WHERE id = ?", [newThumb, video_id]);
      // Optionally delete old thumb
    }

    if (req.files['video']) {
      const newVideo = req.files['video'][0].filename;
      await db.query("UPDATE content SET video = ? WHERE id = ?", [newVideo, video_id]);
      // Optionally delete old video
    }

    res.redirect(`/view-content?get_id=${video_id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Route to delete video content
router.post('/delete-video', async (req, res) => {
  const delete_id = req.body.video_id;

  // Deletion logic
  try {
    const [thumbResult] = await db.query("SELECT thumb FROM content WHERE id = ? LIMIT 1", [delete_id]);
    if (thumbResult) {
      fs.unlinkSync(path.join(__dirname, '../uploaded_files/', thumbResult.thumb));
    }

    const [videoResult] = await db.query("SELECT video FROM content WHERE id = ? LIMIT 1", [delete_id]);
    if (videoResult) {
      fs.unlinkSync(path.join(__dirname, '../uploaded_files/', videoResult.video));
    }

    await db.query("DELETE FROM likes WHERE content_id = ?", [delete_id]);
    await db.query("DELETE FROM comments WHERE content_id = ?", [delete_id]);
    await db.query("DELETE FROM content WHERE id = ?", [delete_id]);

    res.redirect('/contents');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
