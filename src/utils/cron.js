const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { notifyUser } = require('./websocket');
const { sendOverdueEmail } = require('./email');
const logger = require('./logger');

const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const overdueTasks = await Task.find({
        status: 'pending',
        dueDate: { $lt: new Date() },
      });

      for (const task of overdueTasks) {
        task.status = 'overdue';
        await task.save();

        const user = await User.findById(task.userId);

        notifyUser(task.userId, {
          type: 'TASK_OVERDUE',
          taskId: task._id,
          taskTitle: task.title,
          message: `Your task "${task.title}" is overdue!`,
        });

        if (user?.email) {
          await sendOverdueEmail(user.email, task.title);
        }

        logger.info('Task marked overdue', { taskId: task._id, userId: task.userId });
      }
    } catch (err) {
      logger.error('Cron error', { error: err.message });
    }
  });

  logger.info('Cron jobs started');
};

module.exports = { startCronJobs };
