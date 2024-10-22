const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path based on your project structure

// Middleware to check for logged-in users
const checkUser = (req, res, next) => {
    if (req.cookies.user_id) {
        next();
    } else {
        res.redirect('/home');
    }
};

// Use the checkUser middleware for this route
router.use(checkUser);

// Route to render liked videos and handle removal
router.get('/', async (req, res) => {
    const user_id = req.cookies.user_id;

    try {
        const [likes] = await db.query(`
            SELECT l.*, c.*, t.name AS tutor_name, t.image AS tutor_image
            FROM likes l
            JOIN content c ON l.content_id = c.id
            JOIN tutors t ON c.tutor_id = t.id
            WHERE l.user_id = ?
        `, [user_id]);

        const likedVideos = likes.map(like => ({
            ...like,
            tutor: { name: like.tutor_name, image: like.tutor_image },
            content: { id: like.content_id, date: like.date, thumb: like.thumb, title: like.title }
        }));

        res.render('likes', { likes: likedVideos });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});

// Route to handle removing likes
router.post('/', async (req, res) => {
    const user_id = req.cookies.user_id;
    const content_id = req.body.content_id;

    try {
        const [verifyLikes] = await db.query("SELECT * FROM `likes` WHERE user_id = ? AND content_id = ?", [user_id, content_id]);

        if (verifyLikes.length > 0) {
            await db.query("DELETE FROM `likes` WHERE user_id = ? AND content_id = ?", [user_id, content_id]);
            req.flash('message', 'Removed from likes!');
        }

        res.redirect('/likes'); // Redirect back to the likes page
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
