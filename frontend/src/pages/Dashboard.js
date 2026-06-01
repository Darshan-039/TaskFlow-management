import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const STATUS_LABELS = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Done' };

const emptyForm = { title: '', description: '', status: 'pending', priority: 'medium' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');

  const notify = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch {
      notify('Failed to load tasks.', 'error');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (user.role !== 'admin') return;
    try {
      const res = await api.get('/admin/users');
      setAdminUsers(res.data.data);
    } catch {
      notify('Failed to load users.', 'error');
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
    if (user.role === 'admin') fetchUsers();
  }, [fetchTasks, fetchUsers, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return notify('Title is required.', 'error');
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/tasks/${editId}`, form);
        notify('Task updated!');
      } else {
        await api.post('/tasks', form);
        notify('Task created!');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to save task.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
    });
    setEditId(task._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      notify('Task deleted.');
      fetchTasks();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete.', 'error');
    }
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-title">
          <span className="logo">TaskFlow</span>
          <span className="role-badge">{user.role}</span>
        </div>
        <div className="dash-user">
          <span>Hello, {user.name}</span>
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Tabs (admin only) */}
      {user.role === 'admin' && (
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            All Users ({adminUsers.length})
          </button>
        </div>
      )}

      {/* TASK VIEW */}
      {activeTab === 'tasks' && (
        <>
          <div className="section-header">
            <h2>
              {user.role === 'admin' ? 'All Tasks' : 'My Tasks'} ({tasks.length})
            </h2>
            <button
              className="btn btn-primary"
              onClick={() => { cancelForm(); setShowForm(!showForm); }}
            >
              {showForm ? 'Cancel' : '+ New Task'}
            </button>
          </div>

          {/* Task Form */}
          {showForm && (
            <div className="card form-card">
              <h3>{editId ? 'Edit Task' : 'New Task'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      placeholder="Task title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Optional description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : editId ? 'Update Task' : 'Create Task'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={cancelForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Task List */}
          {tasks.length === 0 ? (
            <div className="empty-state">No tasks yet. Create one!</div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <div className="card task-card" key={task._id}>
                  <div className="task-top">
                    <span
                      className="priority-dot"
                      style={{ background: PRIORITY_COLORS[task.priority] }}
                      title={task.priority}
                    />
                    <span className={`status-badge status-${task.status}`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                  <h4 className="task-title">{task.title}</h4>
                  {task.description && (
                    <p className="task-desc">{task.description}</p>
                  )}
                  {user.role === 'admin' && task.owner && (
                    <p className="task-owner">👤 {task.owner.name}</p>
                  )}
                  <div className="task-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => handleEdit(task)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* USER VIEW (admin only) */}
      {activeTab === 'users' && user.role === 'admin' && (
        <div className="users-section">
          <h2>Registered Users</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
