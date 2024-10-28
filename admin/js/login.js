const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const bcrypt = require('bcryptjs');
// const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.render('login', { message: [] });
});

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Query the database to find the user by email
        const [rows] = await db.query('SELECT * FROM tutors WHERE email = ?', [email]);

        if (rows.length > 0) {
            // Directly compare the input password with the stored password
            if (password === rows[0].password) {
                res.cookie('tutor_id', rows[0].id, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
                return res.redirect('/admin/dashboard');
            } else {
                res.render('login', { message: ['Incorrect email or password!'] });
            }
        } else {
            res.render('login', { message: ['Incorrect email or password!'] });
        }
    } catch (error) {
        console.error(error);
        res.render('login', { message: ['Something went wrong. Please try again.'] });
    }
});


module.exports = router;
