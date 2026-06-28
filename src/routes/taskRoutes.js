const express = require('express');
const router = express.Router();
const { createTask, updateTask } = require('../controllers/taskController');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.post('/', createTask);
router.post('/:id', updateTask);

module.exports = router;
