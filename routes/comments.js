const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import your database connection

// Middleware to check if user is logged in
function checkUser(req, res, next) {
    if (req.cookies.user_id) {
        next();
    } else {
        res.redirect('/home'); // Redirect to home if not logged in
    }
}

// Get user comments
router.get('/comments', checkUser, async (req, res) => {
    const user_id = req.cookies.user_id;
    let editComment = null;
    const comments = [];

    try {
        const selectComments = await db.query("SELECT * FROM `comments` WHERE user_id = ?", [user_id]);
        
        if (selectComments.length > 0) {
            for (const comment of selectComments) {
                const selectContent = await db.query("SELECT * FROM `content` WHERE id = ?", [comment.content_id]);
                const content = selectContent[0] || {}; // Assuming there will be one content item
                comments.push({ ...comment, content });
            }
        }

        res.render('comments', { comments, editComment, user_id });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Handle comment deletion
router.post('/comments', checkUser, async (req, res) => {
    if (req.body.delete_comment) {
        const delete_id = req.body.comment_id;
        
        try {
            const verifyComment = await db.query("SELECT * FROM `comments` WHERE id = ?", [delete_id]);
            
            if (verifyComment.length > 0) {
                await db.query("DELETE FROM `comments` WHERE id = ?", [delete_id]);
                req.flash('message', 'Comment deleted successfully!');
            } else {
                req.flash('message', 'Comment already deleted!');
            }
        } catch (error) {
            console.error(error);
            req.flash('message', 'Error deleting comment.');
        }
    }

    res.redirect('/comments');
});

// Handle comment update
router.post('/comments/edit', checkUser, async (req, res) => {
    if (req.body.update_now) {
        const update_id = req.body.update_id;
        const update_box = req.body.update_box;

        try {
            const verifyComment = await db.query("SELECT * FROM `comments` WHERE id = ? AND comment = ?", [update_id, update_box]);

            if (verifyComment.length > 0) {
                req.flash('message', 'Comment already added!');
            } else {
                await db.query("UPDATE `comments` SET comment = ? WHERE id = ?", [update_box, update_id]);
                req.flash('message', 'Comment edited successfully!');
            }
        } catch (error) {
            console.error(error);
            req.flash('message', 'Error updating comment.');
        }
    }

    res.redirect('/comments');
});

// Handle edit comment action
router.post('/comments/edit-comment', checkUser, async (req, res) => {
    const edit_id = req.body.comment_id;
    
    try {
        const verifyComment = await db.query("SELECT * FROM `comments` WHERE id = ? LIMIT 1", [edit_id]);
        
        if (verifyComment.length > 0) {
            const editComment = verifyComment[0];
            res.render('comments', { comments: [], editComment });
        } else {
            req.flash('message', 'Comment was not found!');
            res.redirect('/comments');
        }
    } catch (error) {
        console.error(error);
        req.flash('message', 'Error finding comment.');
        res.redirect('/comments');
    }
});

module.exports = router;
