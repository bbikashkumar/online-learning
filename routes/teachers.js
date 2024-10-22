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

// Get teachers route
router.get('/', async (req, res) => {
    const tutorsQuery = "SELECT * FROM `tutors`";

    try {
        // Log start of query for tutors
        console.log("Fetching tutors...");

        // Fetch all tutors
        const [tutors] = await db.query(tutorsQuery);

        // Check if tutors are fetched correctly
        if (!tutors) {
            console.log('Error: No tutors data returned from the database.');
            return res.status(404).send('No tutors found');
        }

        // Log number of tutors fetched
        console.log(`Fetched ${tutors.length} tutors`);

        // Fetch additional data for each tutor (playlists, contents, likes, comments)
        const tutorPromises = tutors.map(async tutor => {
            const countsQuery = {
                playlists: "SELECT COUNT(*) AS total FROM `playlist` WHERE tutor_id = ?",
                contents: "SELECT COUNT(*) AS total FROM `content` WHERE tutor_id = ?",
                likes: "SELECT COUNT(*) AS total FROM `likes` WHERE tutor_id = ?",
                comments: "SELECT COUNT(*) AS total FROM `comments` WHERE tutor_id = ?"
            };

            try {
                // Log current tutor ID being processed
                console.log(`Fetching counts for tutor ID: ${tutor.id}`);

                // Fetch all count queries in parallel using Promise.all
                const [[{ total: total_playlists }], [{ total: total_contents }], [{ total: total_likes }], [{ total: total_comments }]] = await Promise.all([
                    db.query(countsQuery.playlists, [tutor.id]),
                    db.query(countsQuery.contents, [tutor.id]),
                    db.query(countsQuery.likes, [tutor.id]),
                    db.query(countsQuery.comments, [tutor.id])
                ]);

                // Log the results of the counts
                console.log(`Counts for tutor ID ${tutor.id} - Playlists: ${total_playlists}, Contents: ${total_contents}, Likes: ${total_likes}, Comments: ${total_comments}`);

                return {
                    id: tutor.id,
                    name: tutor.name,
                    image: tutor.image,
                    profession: tutor.profession,
                    email: tutor.email,
                    total_playlists,
                    total_contents,
                    total_likes,
                    total_comments
                };

            } catch (countsErr) {
                console.error(`Error fetching counts for tutor with ID ${tutor.id}:`, countsErr);
                throw countsErr;
            }
        });

        // Await for all tutor details to be fetched
        const tutorDetails = await Promise.all(tutorPromises);

        // Log success before rendering
        console.log("Successfully fetched all tutor details");

        // Render the page with the fetched tutor details
        res.render('teachers', {
            tutors: tutorDetails
        });

    } catch (err) {
        // Log error details
        console.error('Error fetching tutor data:', err);
        return res.status(500).send('Error fetching tutor data');
    }
});

module.exports = router;
