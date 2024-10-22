const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const reviews = [
        { text: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.", name: "John Doe", image: "images/pic-2.jpg", rating: 5 },
        { text: "Great courses and excellent instructors!", name: "Jane Smith", image: "images/pic-3.jpg", rating: 4.5 },
        { text: "I learned so much from this platform!", name: "Emily Johnson", image: "images/pic-4.jpg", rating: 4 },
        // Add more reviews as needed
    ];
    res.render('about', { reviews });
});

module.exports = router;
