const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/response');

// Get tasks (own tasks for user, all tasks for admin)
// GET /api/v1/tasks
const getTasks = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };

    const tasks = await Task.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Tasks fetched.', tasks);

  } catch (error) {
    next(error);
  }
};



// Get single task
// GET /api/v1/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('owner', 'name email');

    if (!task) return errorResponse(res, 404, 'Task not found.');

    // Users can only view their own tasks
    if (req.user.role !== 'admin' && task.owner._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to view this task.');
    }

    return successResponse(res, 200, 'Task fetched.', task);

  } catch (error) {
    next(error);
  }
};

// Create task
// POST /api/v1/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      owner: req.user._id,
    });

    return successResponse(res, 201, 'Task created.', task);
  } catch (error) {
    next(error);
  }
};

// Update task
// PUT /api/v1/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) return errorResponse(res, 404, 'Task not found.');

    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to update this task.');
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, 'Task updated.', task);

  } catch (error) {
    next(error);
  }
};

// Delete task
// DELETE /api/v1/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return errorResponse(res, 404, 'Task not found.');

    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to delete this task.');
    }

    await task.deleteOne();

    return successResponse(res, 200, 'Task deleted.');

  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
// GET /api/v1/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const User = require('../models/User');

    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return successResponse(res, 200, 'Users fetched.', users);

  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getAllUsers };
