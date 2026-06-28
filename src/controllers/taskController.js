const Task = require('../models/Task');
const User = require('../models/User');
const { notifyUser } = require('../utils/websocket');
const { sendCompletedEmail } = require('../utils/email');
const logger = require('../utils/logger');

const createTask = async (req, res) => {
  const { title, dueDate } = req.body;
  const task = await Task.create({
    title,
    dueDate: dueDate || null,
    userId: req.session.userId,
  });
  logger.info('Task created', { taskId: task._id, userId: req.session.userId });
  res.redirect('/dashboard');
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: id, userId: req.session.userId },
    { status },
    { new: true }
  );

  if (!task) {
    logger.warn('Task not found or unauthorized', { taskId: id });
    return res.redirect('/dashboard');
  }

  if (status === 'completed') {
    const user = await User.findById(req.session.userId);

    notifyUser(req.session.userId, {
      type: 'TASK_COMPLETED',
      taskId: task._id,
      taskTitle: task.title,
      message: `Task "${task.title}" marked as completed!`,
    });

    if (user?.email) {
      await sendCompletedEmail(user.email, task.title);
    }

    logger.info('Task completed', { taskId: id });
  }

  res.redirect('/dashboard');
};

module.exports = { createTask, updateTask };
