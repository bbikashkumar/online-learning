const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Database connection

// Middleware to fetch admin profile data
router.get('/admin-header', async (req, res) => {
    const tutor_id = req.cookies.tutor_id; // Assuming tutor_id is stored in cookies

    try {
        let profileData = null;
        if (tutor_id) {
            const [profile] = await db.query("SELECT * FROM `tutors` WHERE id = ?", [tutor_id]);
            if (profile.length > 0) {
                profileData = profile[0];
            }
        }
        res.render('admin_header', { profile: profileData, message: req.flash('message') });
    } catch (error) {
        console.log(error);
        req.flash('message', 'An error occurred');
        res.render('admin_header', { profile: null, message: req.flash('message') });
    }
});

module.exports = router;
