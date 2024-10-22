const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/dashboard', async (req, res) => {
    const tutor_id = req.cookies.tutor_id;
    if (!tutor_id) {
        return res.redirect('/login'); // Redirect if no tutor_id
    }

    try {
        const totalContents = await db.query('SELECT COUNT(*) AS count FROM content WHERE tutor_id = ?', [tutor_id]);
        const totalPlaylists = await db.query('SELECT COUNT(*) AS count FROM playlist WHERE tutor_id = ?', [tutor_id]);
        const totalLikes = await db.query('SELECT COUNT(*) AS count FROM likes WHERE tutor_id = ?', [tutor_id]);
        const totalComments = await db.query('SELECT COUNT(*) AS count FROM comments WHERE tutor_id = ?', [tutor_id]);

        // Render the EJS dashboard page with fetched data
        res.render('admin/ejs/dashboard', {
            totalContents: totalContents[0].count,
            totalPlaylists: totalPlaylists[0].count,
            totalLikes: totalLikes[0].count,
            totalComments: totalComments[0].count
        });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});
module.exports = router;