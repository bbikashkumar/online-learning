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

// Fetch and display content and comments
router.get('/view_content/:id', async (req, res) => {
    const tutor_id = req.cookies.tutor_id;
    const get_id = req.params.id;

    try {
        const [contentRows] = await db.execute('SELECT * FROM content WHERE id = ? AND tutor_id = ?', [get_id, tutor_id]);
        const content = contentRows[0];

        if (content) {
            const [likes] = await db.execute('SELECT * FROM likes WHERE content_id = ? AND tutor_id = ?', [content.id, tutor_id]);
            const totalLikes = likes.length;

            const [comments] = await db.execute('SELECT * FROM comments WHERE content_id = ?', [content.id]);
            const commentDetails = await Promise.all(comments.map(async comment => {
                const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [comment.user_id]);
                return {
                    ...comment,
                    user_name: user[0] ? user[0].name : 'Unknown',
                    user_image: user[0] ? user[0].image : 'default.jpg'
                };
            }));

            res.render('admin/view_content', { content, totalLikes, comments: commentDetails });
        } else {
            res.render('admin/view_content', { content: null, totalLikes: 0, comments: [] });
        }
    } catch (error) {
        console.error(error);
        res.send('Error loading content');
    }
});

// Delete a video and its associated comments and likes
router.post('/view_content/:id', async (req, res) => {
    const { video_id } = req.body;

    try {
        const [thumbRow] = await db.execute('SELECT thumb FROM content WHERE id = ?', [video_id]);
        const [videoRow] = await db.execute('SELECT video FROM content WHERE id = ?', [video_id]);

        if (thumbRow.length > 0 && videoRow.length > 0) {
            // Delete video and thumbnail files
            const thumbPath = path.join(__dirname, '../uploaded_files', thumbRow[0].thumb);
            const videoPath = path.join(__dirname, '../uploaded_files', videoRow[0].video);

            fs.unlinkSync(thumbPath);
            fs.unlinkSync(videoPath);

            // Delete likes and comments
            await db.execute('DELETE FROM likes WHERE content_id = ?', [video_id]);
            await db.execute('DELETE FROM comments WHERE content_id = ?', [video_id]);
            await db.execute('DELETE FROM content WHERE id = ?', [video_id]);

            return res.redirect('/contents');
        } else {
            return res.redirect('/contents');
        }
    } catch (error) {
        console.error(error);
        res.send('Error deleting content');
    }
});

// Delete a comment
router.post('/view_content/:id', async (req, res) => {
    const { comment_id } = req.body;

    try {
        const [commentRows] = await db.execute('SELECT * FROM comments WHERE id = ?', [comment_id]);

        if (commentRows.length > 0) {
            await db.execute('DELETE FROM comments WHERE id = ?', [comment_id]);
            return res.redirect(`/view_content/${req.params.id}`);
        } else {
            return res.redirect(`/view_content/${req.params.id}`);
        }
    } catch (error) {
        console.error(error);
        res.send('Error deleting comment');
    }
});

module.exports = router;
