const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const session = require('express-session');
// const flash = require('connect-flash'); 



const app = express();
const port = 8111;

// Set view engine to EJS
app.set('view engine', 'ejs');

// Middleware for switching views directory based on route
app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        app.set('views', path.join(__dirname, 'admin/ejs')); // Set admin views directory
    } else {
        app.set('views', path.join(__dirname, 'views')); // Set default views directory
    }
    next();
});

// Serve CSS files for admin
app.use('/admin/css', express.static(path.join(__dirname, 'admin/css')));
app.use(express.static(path.join(__dirname, 'public'))); // Static files

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


app.use(session({
    secret: 's3cReT!Key@123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true when using HTTPS
}));
// app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

// Importing Routes
const homeRoutes = require('./routes/home');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const aboutRoutes = require('./routes/about');
const bookmarksRoutes = require('./routes/bookmarks');
const commentsRoutes = require('./routes/comments');
const contactRoutes = require('./routes/contact');
const coursesRoutes = require('./routes/courses');
const likesRoutes = require('./routes/likes');
const loginRoutes = require('./routes/login');
const playlistRoutes = require('./routes/playlist');
const profileRoutes = require('./routes/profile');
const registerRoutes = require('./routes/register');
const searchCourseRoutes = require('./routes/searchCourse');
const searchTutorRoutes = require('./routes/searchTutor');
const teachersRoutes = require('./routes/teachers');
const tutorProfileRoutes = require('./routes/tutor_profile');
const updateRoutes = require('./routes/update');
const watchVideoRoutes = require('./routes/watch_video');

// Admin Section Routes
const addContentRoutes = require('./admin/js/add_content');
const addPlaylistRoutes = require('./admin/js/add_playlist');
const adminCommentsRoutes = require('./admin/js/comments');
const contentsRoutes = require('./admin/js/contents');
const dashboardRoutes = require('./admin/js/dashboard');
const adminLoginRoutes = require('./admin/js/login');
const playlistsRoutes = require('./admin/js/playlists');
const adminProfileRoutes = require('./admin/js/profile');
const adminRegisterRoutes = require('./admin/js/register');
const searchPageRoutes = require('./admin/js/search_page');
const updateContentRoutes = require('./admin/js/update_content');
const updatePlaylistRoutes = require('./admin/js/update_playlist');
const viewContentRoutes = require('./admin/js/view_content');
const viewPlaylistRoutes = require('./admin/js/view_playlist');
const adminHeaderRoutes = require('./routes/admin_header');
const adminLogoutRoutes = require('./routes/admin_logout');

// User-facing routes
app.use('/', homeRoutes); 
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/about', aboutRoutes);
app.use('/bookmarks', bookmarksRoutes);
app.use('/comments', commentsRoutes);
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
app.use('/update', updateRoutes);
app.use('/watch', watchVideoRoutes);

// Admin-facing routes (use /admin prefix to avoid route clashes)
app.use('/admin/add-content', addContentRoutes);
app.use('/admin/add-playlist', addPlaylistRoutes);
app.use('/admin/comments', adminCommentsRoutes);
app.use('/admin/contents', contentsRoutes);
app.use('/admin/dashboard', dashboardRoutes);
app.use('/admin/login', adminLoginRoutes);
app.use('/admin/playlists', playlistsRoutes);
app.use('/admin/profile', adminProfileRoutes);
app.use('/admin/register', adminRegisterRoutes);
app.use('/admin/search', searchPageRoutes);
app.use('/admin/update-content', updateContentRoutes);
app.use('/admin/update-playlist', updatePlaylistRoutes);
app.use('/admin/view-content', viewContentRoutes);
app.use('/admin/view-playlist', viewPlaylistRoutes);
app.use('/admin-header', adminHeaderRoutes);
app.use('/admin-logout', adminLogoutRoutes);

// Default route for home page
app.get('/', (req, res) => {
    res.render('home'); 
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});