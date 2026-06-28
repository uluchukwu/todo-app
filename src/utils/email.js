const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const send = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('Email not configured, skipping notification', { to, subject });
    return;
  }
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    logger.info('Email sent', { to, subject });
  } catch (err) {
    logger.error('Email failed', { error: err.message });
  }
};

const sendOverdueEmail = (to, taskTitle) =>
  send(to, 'Task Overdue', `Your task "${taskTitle}" is now overdue. Please complete or reschedule it.`);

const sendCompletedEmail = (to, taskTitle) =>
  send(to, 'Task Completed', `You completed the task "${taskTitle}". Great work!`);

module.exports = { sendOverdueEmail, sendCompletedEmail };
