const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust this path based on your project structure

// Middleware to check if user is logged in
function checkUser(req, res, next) {
    const userId = req.cookies.user_id || '';
    req.user_id = userId;
    next();
}

router.use(checkUser);

// Course search route
router.post('/search_course', (req, res) => {
    const searchCourse = req.body.search_course || '';
    const query = "SELECT * FROM `playlist` WHERE title LIKE ? AND status = ?";
    const params = [`%${searchCourse}%`, 'active'];

    db.query(query, params, (err, courses) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query error');
        }

        // Fetch tutor information for each course
        const coursePromises = courses.map(course => {
            return new Promise((resolve, reject) => {
                db.query('SELECT * FROM `tutors` WHERE id = ?', [course.tutor_id], (err, tutors) => {
                    if (err) {
                        return reject(err);
                    }
                    if (tutors.length > 0) {
                        resolve({
                            id: course.id,
                            title: course.title,
                            thumb: course.thumb,
                            date: course.date,
                            tutorName: tutors[0].name,
                            tutorImage: tutors[0].image
                        });
                    } else {
                        resolve(null); // No tutor found
                    }
                });
            });
        });

        Promise.all(coursePromises).then(courseDetails => {
            const filteredCourses = courseDetails.filter(course => course !== null); // Filter out nulls

            res.render('search_course', {
                courses: filteredCourses,
                message: filteredCourses.length > 0 ? '' : 'No courses found!'
            });
        }).catch(err => {
            console.error(err);
            return res.status(500).send('Error fetching tutor data');
        });
    });
});

// Render search course page
router.get('/search_course', (req, res) => {
    res.render('search_course', { courses: [], message: 'Please search something!' });
});

module.exports = router;
