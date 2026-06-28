const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

router.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.redirect('/login');
});

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { error: null });
});

router.get('/dashboard', requireAuth, async (req, res) => {
  const { status } = req.query;
  const filter = { userId: req.session.userId };

  if (['pending', 'completed', 'overdue'].includes(status)) {
    filter.status = status;
  } else {
    filter.status = { $ne: 'deleted' };
  }

  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  const user = await User.findById(req.session.userId);

  res.render('dashboard', {
    tasks,
    username: user.username,
    currentStatus: status || 'all',
    token: req.session.token,
  });
});

module.exports = router;
