import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// List with filtering & search
router.get('/', (req, res) => {
  const { status, priority, search } = req.query;
  const tasks = db.getTasks({ status, priority, search });
  res.json({ tasks, count: tasks.length });
});

// Single task
router.get('/:id', (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ task });
});

// Create task (auth required)
router.post('/', authenticate, (req, res) => {
  const { title, description, status, priority, assignedTo } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const validStatuses = ['todo', 'in_progress', 'completed'];
  const validPriorities = ['low', 'medium', 'high'];

  const newTask = {
    id: `tsk-${Date.now()}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    status: validStatuses.includes(status) ? status : 'todo',
    priority: validPriorities.includes(priority) ? priority : 'medium',
    assignedTo: assignedTo || req.user.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createTask(newTask);
  db.logActivity({
    action: 'CREATE',
    entity: 'task',
    entityId: newTask.id,
    details: `Created task "${newTask.title}" [${newTask.priority}/${newTask.status}]`,
    user: req.user.email
  });

  res.status(201).json({ task: newTask });
});

// Update task (auth required)
router.put('/:id', authenticate, (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, status, priority, assignedTo } = req.body;
  const patch = {};

  if (title !== undefined) patch.title = title.trim();
  if (description !== undefined) patch.description = description.trim();
  if (status !== undefined) patch.status = status;
  if (priority !== undefined) patch.priority = priority;
  if (assignedTo !== undefined) patch.assignedTo = assignedTo;

  const updated = db.updateTask(req.params.id, patch);
  db.logActivity({
    action: 'UPDATE',
    entity: 'task',
    entityId: updated.id,
    details: `Updated task "${updated.title}"`,
    user: req.user.email
  });

  res.json({ task: updated });
});

// Delete task (auth required)
router.delete('/:id', authenticate, (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  db.deleteTask(req.params.id);
  db.logActivity({
    action: 'DELETE',
    entity: 'task',
    entityId: req.params.id,
    details: `Deleted task "${task.title}"`,
    user: req.user.email
  });

  res.json({ success: true, deletedId: req.params.id });
});

export default router;
