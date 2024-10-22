const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const bcrypt = require('bcryptjs');

router.get('/login', (req, res) => {
    res.render('admin/ejs/login', { message: [] });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const tutor = await db.query('SELECT * FROM tutors WHERE email = ?', [email]);

        if (tutor.length > 0) {
            const isPasswordCorrect = bcrypt.compareSync(password, tutor[0].password);
            if (isPasswordCorrect) {
                res.cookie('tutor_id', tutor[0].id, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
                return res.redirect('/dashboard');
            } else {
                res.render('admin/ejs/login', { message: ['Incorrect email or password!'] });
            }
        } else {
            res.render('admin/ejs/login', { message: ['Incorrect email or password!'] });
        }
    } catch (error) {
        console.error(error);
        res.render('admin/ejs/login', { message: ['Something went wrong. Please try again.'] });
    }
});

module.exports = router;
