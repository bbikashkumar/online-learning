const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the DB connection

// Home route
router.get('/', (req, res) => {
  let user_id = req.cookies['user_id'] || '';
  let total_likes = 0, total_comments = 0, total_bookmarked = 0;
  let courses = [], tutors = [];

  if (user_id !== '') {
    // Fetch likes, comments, bookmarks if user is logged in
    db.query('SELECT COUNT(*) AS total_likes FROM `likes` WHERE user_id = ?', [user_id], (err, result) => {
      if (err) throw err;
      total_likes = result[0].total_likes;

      db.query('SELECT COUNT(*) AS total_comments FROM `comments` WHERE user_id = ?', [user_id], (err, result) => {
        if (err) throw err;
        total_comments = result[0].total_comments;

        db.query('SELECT COUNT(*) AS total_bookmarked FROM `bookmark` WHERE user_id = ?', [user_id], (err, result) => {
          if (err) throw err;
          total_bookmarked = result[0].total_bookmarked;

          // Fetch latest courses
          db.query('SELECT * FROM `playlist` WHERE status = ? ORDER BY date DESC LIMIT 6', ['active'], (err, coursesResult) => {
            if (err) throw err;
            courses = coursesResult;

            const fetchTutorsPromises = courses.map(course =>
              new Promise((resolve, reject) => {
                db.query('SELECT * FROM `tutors` WHERE id = ?', [course.tutor_id], (err, tutorResult) => {
                  if (err) reject(err);
                  resolve(tutorResult[0]);
                });
              })
            );

            Promise.all(fetchTutorsPromises).then(tutorsResult => {
              tutors = tutorsResult;
              res.render('home', { user_id, total_likes, total_comments, total_bookmarked, courses, tutors });
            }).catch(err => console.error(err));
          });
        });
      });
    });
  } else {
    res.render('home', { user_id, total_likes, total_comments, total_bookmarked, courses, tutors });
  }
});

module.exports = router;
