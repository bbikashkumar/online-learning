const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path based on your project structure

// Middleware to render courses page
router.get('/', async (req, res) => {
    let user_id = req.cookies.user_id || '';

    try {
        const [courses] = await db.query(`
            SELECT p.*, t.image, t.name
            FROM playlist p
            JOIN tutors t ON p.tutor_id = t.id
            WHERE p.status = ?
            ORDER BY p.date DESC
        `, ['active']);

        // Map the results to include tutor data
        const coursesWithTutors = courses.map(course => ({
            ...course,
            tutor: { image: course.image, name: course.name }
        }));

        res.render('courses', { courses: coursesWithTutors, user_id });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
