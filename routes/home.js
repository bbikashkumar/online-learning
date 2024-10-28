const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Route to fetch home page data
router.get('/home', async (req, res) => {
    // Retrieve user_id from the session if logged in, else check cookies as a fallback
    const user_id = req.session.user_id || req.cookies['user_id'] || ''; 
    let total_likes = 0, total_comments = 0, total_bookmarked = 0;
    let courses = [], tutors = [];

    try {
        if (user_id) {
            // Retrieve counts for likes, comments, and bookmarks for the logged-in user
            const [likesResult] = await db.query('SELECT COUNT(*) AS total_likes FROM `likes` WHERE user_id = ?', [user_id]);
            const [commentsResult] = await db.query('SELECT COUNT(*) AS total_comments FROM `comments` WHERE user_id = ?', [user_id]);
            const [bookmarkResult] = await db.query('SELECT COUNT(*) AS total_bookmarked FROM `bookmark` WHERE user_id = ?', [user_id]);

            total_likes = likesResult.total_likes;
            total_comments = commentsResult.total_comments;
            total_bookmarked = bookmarkResult.total_bookmarked;
        }

        // Fetch active courses, limited to the latest 6
        const sqlCourses = "SELECT * FROM `playlist` WHERE status = 'active' ORDER BY date DESC LIMIT 6";
        const [activeCourses] = await db.query(sqlCourses);
        courses = activeCourses || []; // Set an empty array if no active courses are found

        // Retrieve tutor information for each course
        const fetchTutorsPromises = courses.map(course => 
            db.query('SELECT * FROM `tutors` WHERE id = ?', [course.tutor_id])
                .then(tutorResult => tutorResult[0] || null) // Set to null if no tutor is found
        );

        tutors = await Promise.all(fetchTutorsPromises);

        // Render the home page with the fetched data
        res.render('home', { 
            courses, 
            user_id, 
            total_likes, 
            total_comments, 
            total_bookmarked, 
            tutors 
        });
        
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send("An error occurred while fetching data.");
    }
});

module.exports = router;
