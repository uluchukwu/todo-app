const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

const register = async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.render('register', { error: 'Username already taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashedPassword });

  req.session.userId = user._id;
  req.session.token = generateToken(user._id);
  logger.info('User registered', { username });
  res.redirect('/dashboard');
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.render('login', { error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render('login', { error: 'Invalid credentials' });
  }

  req.session.userId = user._id;
  req.session.token = generateToken(user._id);
  logger.info('User logged in', { username });
  res.redirect('/dashboard');
};

const logout = (req, res) => {
  logger.info('User logged out', { userId: req.session.userId });
  req.session.destroy();
  res.redirect('/login');
};

module.exports = { register, login, logout };
