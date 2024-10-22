const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Assuming this is your DB connection file

// Middleware to check user login
function checkUser(req, res, next) {
    if (!req.cookies.user_id) {
        return res.redirect('/login'); // Redirect if not logged in
    }
    next();
}

// Function to handle like content
async function likeContent(req, res) {
    const user_id = req.cookies.user_id;
    const content_id = req.body.content_id;

    if (user_id) {
        const [fetchContent] = await db.query("SELECT * FROM `content` WHERE id = ? LIMIT 1", [content_id]);
        const tutor_id = fetchContent.tutor_id;

        const [selectLikes] = await db.query("SELECT * FROM `likes` WHERE user_id = ? AND content_id = ?", [user_id, content_id]);

        if (selectLikes.length > 0) {
            await db.query("DELETE FROM `likes` WHERE user_id = ? AND content_id = ?", [user_id, content_id]);
            req.flash('message', 'removed from likes!');
        } else {
            await db.query("INSERT INTO `likes` (user_id, tutor_id, content_id) VALUES (?, ?, ?)", [user_id, tutor_id, content_id]);
            req.flash('message', 'added to likes!');
        }
    } else {
        req.flash('message', 'please login first!');
    }
}

// Function to add comment
async function addComment(req, res) {
    const user_id = req.cookies.user_id;
    const comment_box = req.body.comment_box;
    const content_id = req.body.content_id;

    if (user_id) {
        const id = unique_id(); // Assuming you have a function to generate unique IDs
        const sanitizedComment = filter_var(comment_box, 'string');

        const [fetchContent] = await db.query("SELECT * FROM `content` WHERE id = ? LIMIT 1", [content_id]);

        if (fetchContent) {
            const tutor_id = fetchContent.tutor_id;

            const [selectComment] = await db.query("SELECT * FROM `comments` WHERE content_id = ? AND user_id = ? AND tutor_id = ? AND comment = ?", [content_id, user_id, tutor_id, sanitizedComment]);

            if (selectComment.length > 0) {
                req.flash('message', 'comment already added!');
            } else {
                await db.query("INSERT INTO `comments` (id, content_id, user_id, tutor_id, comment) VALUES (?, ?, ?, ?, ?)", [id, content_id, user_id, tutor_id, sanitizedComment]);
                req.flash('message', 'new comment added!');
            }
        } else {
            req.flash('message', 'something went wrong!');
        }
    } else {
        req.flash('message', 'please login first!');
    }
}

// Function to delete comment
async function deleteComment(req, res) {
    const delete_id = req.body.comment_id;

    const [verifyComment] = await db.query("SELECT * FROM `comments` WHERE id = ?", [delete_id]);

    if (verifyComment.length > 0) {
        await db.query("DELETE FROM `comments` WHERE id = ?", [delete_id]);
        req.flash('message', 'comment deleted successfully!');
    } else {
        req.flash('message', 'comment already deleted!');
    }
}

// Function to update comment
async function updateComment(req, res) {
    const update_id = req.body.update_id;
    const update_box = req.body.update_box;

    const [verifyComment] = await db.query("SELECT * FROM `comments` WHERE id = ? AND comment = ?", [update_id, update_box]);

    if (verifyComment.length > 0) {
        req.flash('message', 'comment already added!');
    } else {
        await db.query("UPDATE `comments` SET comment = ? WHERE id = ?", [update_box, update_id]);
        req.flash('message', 'comment edited successfully!');
    }
}

// Route to watch video
router.get('/watch_video', async (req, res) => {
    const get_id = req.query.get_id;

    if (!get_id) {
        return res.redirect('/home');
    }

    const [fetchContent] = await db.query("SELECT * FROM `content` WHERE id = ? AND status = ?", [get_id, 'active']);
    const content = fetchContent[0] || null;

    res.render('update', { content, message: req.flash('message') });
});

// Route to like content
router.post('/like_content', checkUser, likeContent);

// Route to add comment
router.post('/add_comment', checkUser, addComment);

// Route to delete comment
router.post('/delete_comment', checkUser, deleteComment);

// Route to update comment
router.post('/update_comment', checkUser, updateComment);

module.exports = router;
