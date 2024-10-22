// api.js (Mock for server response - would be replaced by backend logic)
const express = require('express');
const router = express.Router();

// Sample user profile data
const users = {
  1: { id: 1, name: 'John Doe', image: 'profile1.jpg', role: 'student' }
};

router.get('/getUserProfile', (req, res) => {
  const user_id = req.cookies['user_id']; // Assume user_id comes from cookies
  const user = users[user_id];
  
  if (user) {
    res.json(user);
  } else {
    res.json({}); // Empty object if user not found
  }
});

module.exports = router;
