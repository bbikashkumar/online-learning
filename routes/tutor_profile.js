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

// Post request to fetch tutor profile
router.post('/tutor_profile', (req, res) => {
    const tutor_email = req.body.tutor_email;

    if (!tutor_email) {
        return res.redirect('/teachers');
    }

    const selectTutorQuery = 'SELECT * FROM `tutors` WHERE email = ?';
    db.query(selectTutorQuery, [tutor_email], (err, results) => {
        if (err || results.length === 0) {
            console.error(err);
            return res.redirect('/teachers');
        }

        const tutor = results[0];
        const tutor_id = tutor.id;

        const countsQueries = {
            playlists: 'SELECT COUNT(*) AS total FROM `playlist` WHERE tutor_id = ?',
            contents: 'SELECT COUNT(*) AS total FROM `content` WHERE tutor_id = ?',
            likes: 'SELECT COUNT(*) AS total FROM `likes` WHERE tutor_id = ?',
            comments: 'SELECT COUNT(*) AS total FROM `comments` WHERE tutor_id = ?',
        };

        const totalCounts = {};
        
        Promise.all([
            new Promise((resolve, reject) => db.query(countsQueries.playlists, [tutor_id], (err, result) => err ? reject(err) : resolve(result[0].total))),
            new Promise((resolve, reject) => db.query(countsQueries.contents, [tutor_id], (err, result) => err ? reject(err) : resolve(result[0].total))),
            new Promise((resolve, reject) => db.query(countsQueries.likes, [tutor_id], (err, result) => err ? reject(err) : resolve(result[0].total))),
            new Promise((resolve, reject) => db.query(countsQueries.comments, [tutor_id], (err, result) => err ? reject(err) : resolve(result[0].total))),
        ])
        .then(([total_playlists, total_contents, total_likes, total_comments]) => {
            totalCounts.total_playlists = total_playlists;
            totalCounts.total_contents = total_contents;
            totalCounts.total_likes = total_likes;
            totalCounts.total_comments = total_comments;

            const selectCoursesQuery = 'SELECT * FROM `playlist` WHERE tutor_id = ? AND status = ?';
            db.query(selectCoursesQuery, [tutor_id, 'active'], (err, courses) => {
                if (err) {
                    console.error(err);
                    return res.redirect('/teachers');
                }

                // Fetch the tutors for courses
                const coursePromises = courses.map(course => {
                    return new Promise((resolve, reject) => {
                        const selectTutorQuery = 'SELECT * FROM `tutors` WHERE id = ?';
                        db.query(selectTutorQuery, [course.tutor_id], (err, result) => {
                            if (err) return reject(err);
                            resolve({ ...course, tutor: result[0] });
                        });
                    });
                });

                Promise.all(coursePromises).then(coursesWithTutors => {
                    res.render('tutor_profile', {
                        tutor,
                        courses: coursesWithTutors,
                        ...totalCounts
                    });
                }).catch(err => {
                    console.error(err);
                    return res.redirect('/teachers');
                });
            });
        })
        .catch(err => {
            console.error(err);
            return res.redirect('/teachers');
        });
    });
});

module.exports = router;
