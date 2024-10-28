const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Middleware to verify if the tutor is logged in
router.use((req, res, next) => {
    if (!req.cookies.tutor_id) {
        return res.redirect('/login');
    }
    next();
});

// Fetch comments for the logged-in tutor
// Fetch comments for the logged-in tutor
router.get('/', async (req, res) => {
    try {
        const tutor_id = req.cookies.tutor_id;
        const [comments] = await db.execute('SELECT * FROM comments WHERE tutor_id = ?', [tutor_id]);

        for (const comment of comments) {
            const [content] = await db.execute('SELECT * FROM content WHERE id = ?', [comment.content_id]);
            comment.content_title = content[0] ? content[0].title : 'Unknown';
        }

        // Add default values for `message` and `profile` if they are needed in the template
        const message = []; // Define any messages you need to display
       // Assuming profile data is also needed for header or other components
       const [profileData] = await db.execute('SELECT * FROM tutors WHERE id = ?', [tutor_id]);
       const profile = profileData[0] || {};

        res.render('comments', { comments, tutor_id, message , profile});
    } catch (error) {
        console.error(error);
        res.send('Error loading comments');
    }
});


// Delete a comment
router.post('/delete_comment', async (req, res) => {
    const { comment_id } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM comments WHERE id = ?', [comment_id]);
        if (rows.length > 0) {
            await db.execute('DELETE FROM comments WHERE id = ?', [comment_id]);
            res.redirect('/comments');
        } else {
            res.redirect('/comments');
        }
    } catch (error) {
        console.error(error);
        res.send('Error deleting comment');
    }
});

module.exports = router;
