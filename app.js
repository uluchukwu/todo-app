require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const pageRoutes = require('./src/routes/pageRoutes');
const logger = require('./src/utils/logger');

const app = express();

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
}));

app.use('/', pageRoutes);
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).send('Something went wrong. Please try again.');
});

module.exports = app;
