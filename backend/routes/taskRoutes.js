const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { validateTask } = require('../middleware/validation');

// Fetch department list for dropdowns
router.get('/departments', taskController.getDepartments);

// Task CRUD routes
router.get('/', taskController.getAllTasks);
router.post('/', validateTask, taskController.createTask);
router.put('/:id', validateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;