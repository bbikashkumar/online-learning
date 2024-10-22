const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const bodyParser = require('body-parser');


const homeRoutes = require('./routes/home');
const apiRoutes = require('./routes/api'); // Assuming the path
const authRoutes = require('./routes/auth'); // Import the auth routes
const aboutRoutes = require('./routes/about'); // Import the about routes
const bookmarksRoutes = require('./routes/bookmarks'); // Import the bookmarks routes
const commentsRoutes = require('./routes/comments'); // Import the comments routes
const contactRoutes = require('./routes/contact');
const coursesRoutes = require('./routes/courses');
// const flash = require('connect-flash');
const likesRoutes = require('./routes/likes');
const loginRoutes = require('./routes/login');
const playlistRoutes = require('./routes/playlist');
const profileRoutes = require('./routes/profile');
const registerRoutes = require('./routes/register');
const searchCourseRoutes = require('./routes/searchCourse');
const searchTutorRoutes = require('./routes/searchTutor');
const teachersRoutes = require('./routes/teachers');
const tutorProfileRoutes = require('./routes/tutor_profile');
const userRoutes = require('./routes/update');
const watchVideo = require('./routes/watch_video');
const adminHeaderRoutes = require('./routes/admin_header');
const adminLogout = require('./routes/admin_logout'); 
const fileUpload = require('express-fileupload');
const session = require('express-session'); // Add this line
// res.render('login', { async: true });
// const addContentRoutes = require('js/add_content');
const addContent = require('./admin/js/add_content');
const addPlaylistRoutes = require('./admin/js/add_playlist');
const adminCommentsRoutes = require('./admin/js/comments');
const contentsRoutes = require('./admin/js/contents');
const dashboardRoutes = require('./admin/js/dashboard');
const adminLoginRoutes = require('./admin/js/login');
const playlistsRoutes = require('./admin/js/playlists');
const adminProfileRoutes = require('./admin/js/profile');
const adminRegisterRoutes = require('./admin/js/register');
const searchPageRouter = require('./admin/js/search_page');
const updateContentRoutes = require('./admin/js/update_content');
const updatePlaylistRoutes = require('./admin/js/update_playlist');
const updateProfileRoutes = require('./admin/js/update');
const viewContentRoutes = require('./admin/js/view_content');
const viewPlaylistRoutes = require('./admin/js/view_playlist');






const app = express();
const port = 8111;

// Import routes

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
// app.set('views', path.join(__dirname, './admin/ejs'));
// app.set('views', path.join(__dirname, 'admin', 'ejs'));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // For serving static files
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true })); // Initialize session------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use routes
app.use('/api', apiRoutes); // API routes
app.use('/', homeRoutes); // Home routes
app.use('/auth', authRoutes); // Authentication routes
app.use('/about', aboutRoutes); // About routes
app.use('/bookmarks', bookmarksRoutes); // Bookmarks routes
app.use('/comments', commentsRoutes); // Comments routes
app.use('/contact', contactRoutes);
app.use('/courses', coursesRoutes);
app.use('/likes', likesRoutes);
app.use('/login', loginRoutes);
app.use('/playlist', playlistRoutes);
app.use('/profile', profileRoutes);
app.use('/register', registerRoutes);
app.use('/search/course', searchCourseRoutes);
app.use('/search/tutor', searchTutorRoutes);
app.use('/teachers', teachersRoutes);
app.use('/tutor-profile', tutorProfileRoutes);
app.use('/update', userRoutes);
app.use('/watch', watchVideo); // Renamed variable
app.use('/admin-header', adminHeaderRoutes);
app.use('/admin-logout', adminLogout); // Renamed variable
app.use('/', addContent);
app.use('/admin', addPlaylistRoutes); 
app.use('/', adminCommentsRoutes);
app.use('/',contentsRoutes);
app.use('/',dashboardRoutes);
app.use('/',adminLoginRoutes);
app.use('/', playlistsRoutes);
app.use('/', adminProfileRoutes);
app.use('/register', adminRegisterRoutes);
app.use('/', searchPageRouter);
app.use('/', updateContentRoutes);
app.use('/', updatePlaylistRoutes);
app.use('/', updateProfileRoutes);
app.use('/', viewContentRoutes);
app.use('/admin', viewPlaylistRoutes);


// Default route
app.get('/', (req, res) => {
    res.render('home'); // Render home page (if you're using EJS) or serve HTML directly
});



// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
