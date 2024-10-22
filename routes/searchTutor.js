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

// Tutor search route
router.post('/search_tutor', (req, res) => {
    const searchTutor = req.body.search_tutor || '';
    const query = "SELECT * FROM `tutors` WHERE name LIKE ?";
    const params = [`%${searchTutor}%`];

    db.query(query, params, (err, tutors) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query error');
        }

        const tutorPromises = tutors.map(tutor => {
            return new Promise((resolve, reject) => {
                // Fetch counts for playlists, contents, likes, and comments
                const countsQuery = {
                    playlists: "SELECT COUNT(*) AS total FROM `playlist` WHERE tutor_id = ?",
                    contents: "SELECT COUNT(*) AS total FROM `content` WHERE tutor_id = ?",
                    likes: "SELECT COUNT(*) AS total FROM `likes` WHERE tutor_id = ?",
                    comments: "SELECT COUNT(*) AS total FROM `comments` WHERE tutor_id = ?"
                };

                Promise.all([
                    new Promise((resolve, reject) => db.query(countsQuery.playlists, [tutor.id], (err, result) => err ? reject(err) : resolve(result[0].total))),
                    new Promise((resolve, reject) => db.query(countsQuery.contents, [tutor.id], (err, result) => err ? reject(err) : resolve(result[0].total))),
                    new Promise((resolve, reject) => db.query(countsQuery.likes, [tutor.id], (err, result) => err ? reject(err) : resolve(result[0].total))),
                    new Promise((resolve, reject) => db.query(countsQuery.comments, [tutor.id], (err, result) => err ? reject(err) : resolve(result[0].total))),
                ])
                .then(([total_playlists, total_contents, total_likes, total_comments]) => {
                    resolve({
                        id: tutor.id,
                        name: tutor.name,
                        image: tutor.image,
                        profession: tutor.profession,
                        email: tutor.email,
                        total_playlists,
                        total_contents,
                        total_likes,
                        total_comments
                    });
                })
                .catch(err => reject(err));
            });
        });

        Promise.all(tutorPromises).then(tutorDetails => {
            res.render('search_tutor', {
                tutors: tutorDetails,
                message: tutorDetails.length > 0 ? '' : 'No results found!'
            });
        }).catch(err => {
            console.error(err);
            return res.status(500).send('Error fetching tutor data');
        });
    });
});

// Render the search tutor page
router.get('/search_tutor', (req, res) => {
    res.render('search_tutor', { tutors: [], message: 'Please search something!' });
});

module.exports = router;
