const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getAllUsers,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const { taskValidator } = require('../validators');


// Admin-only routes
router.get('/admin/users', protect, authorize('admin'), getAllUsers);

// Task CRUD
router.route('/tasks').get(protect, getTasks).post(protect, taskValidator, createTask);

router
  .route('/tasks/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
