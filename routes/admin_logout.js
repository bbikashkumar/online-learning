const express = require('express'); const router = express.Router(); router.get('/admin_logout', (req, res) => { res.clearCookie('tutor_id', { path: '/' }); res.redirect('/login'); }); module.exports = router;