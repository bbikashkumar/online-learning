const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust path based on your project structure
const cookieParser = require('cookie-parser'); // Include cookie parser
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Middleware to check for logged-in users
// const checkUserLoggedIn = (req, res, next) => {
//     if (req.cookies.user_id) {
//         return res.redirect('/home');
//     }
//     next();
// };

// Ensure cookie parsing middleware is applied globally
router.use(cookieParser());
// router.use(checkUserLoggedIn);

console.log("i am in the get");
// Route to render the login page
router.get('/', (req, res) => {
    res.render('login', { message: null }); // Render without messages initially
});

// Route to handle login form submission
router.post('/', async (req, res) => {
    console.log("Form submitted:", req.body);
    const email = req.body.email.trim();
    const password = req.body.pass; 

    try {
        const [rows] = await db.query("SELECT * FROM `users` WHERE email = ? LIMIT 1", [email]);

        console.log("User found:", rows);
        
        if (rows.length > 0) {
            const user = rows[0];
            // const isMatch = await bcrypt.compare(password, user.password);
            if(password == user.password){
                console.log('Redirecting to home...');
                res.cookie('user_id', user.id, {
                    maxAge: 60 * 60 * 24 * 30 * 1000,
                    httpOnly: true,
                    secure: true 
                });
                return res.redirect('/home'); // Redirect to home page
            }

            // console.log("Password match:", isMatch);

            // if (isMatch) {
            //     console.log('Login successful, attempting to redirect...');
                
            //     res.cookie('user_id', user.id, {
            //         maxAge: 60 * 60 * 24 * 30 * 1000,
            //         httpOnly: true,
            //         secure: true 
            //     });
                
            //     console.log('Redirecting to home...');
            //     return res.redirect('/home'); // Redirect to home page
            // }
        }

        console.log('Incorrect email or password');
        return res.render('login', { message: 'Incorrect email or password!' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});



module.exports = router;
