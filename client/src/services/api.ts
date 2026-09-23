import { Task, ActivityEvent } from '../types';

const API_BASE = 'http://localhost:5000/api';
const STORAGE_KEY = 'devpulse_tasks';
const ACTIVITY_KEY = 'devpulse_activity';

const INITIAL_TASKS: Task[] = [
  {
    id: 'dp-101',
    title: 'Migrate DB cluster to multi-region replication',
    description: 'Zero-downtime cutover for PostgreSQL primary in us-east-1 to eu-west-1 failover.',
    priority: 'high',
    status: 'in-progress',
    tags: ['infra', 'database', 'p1'],
    dueDate: '2026-09-28',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'dp-102',
    title: 'Refactor OAuth token rotation middleware',
    description: 'Enforce PKCE and shorten refresh token lifetime to 45 mins.',
    priority: 'medium',
    status: 'todo',
    tags: ['auth', 'security'],
    dueDate: '2026-10-02',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'dp-103',
    title: 'Production egress memory leak in telemetry pipeline',
    description: 'Vector agent buffer filling OOM kill on worker nodes under sustained 80k rps.',
    priority: 'high',
    status: 'todo',
    tags: ['incident', 'observability'],
    dueDate: '2026-09-25',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'dp-104',
    title: 'Optimize cold start latency in edge workers',
    description: 'Tree-shake unreferenced crypto bundles, dropping bundle footprint from 1.8MB to 420KB.',
    priority: 'low',
    status: 'completed',
    tags: ['perf', 'edge'],
    dueDate: '2026-09-20',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'dp-105',
    title: 'Implement rate limiting for GraphQL public gateway',
    description: 'Sliding window Redis algorithm: limit 120 calls per minute per IP.',
    priority: 'medium',
    status: 'in-progress',
    tags: ['api', 'rate-limit'],
    dueDate: '2026-09-30',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'status_change',
    taskId: 'dp-104',
    taskTitle: 'Optimize cold start latency in edge workers',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    detail: 'Marked completed'
  },
  {
    id: 'act-2',
    type: 'created',
    taskId: 'dp-103',
    taskTitle: 'Production egress memory leak in telemetry pipeline',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    detail: 'Triaged as high priority'
  },
  {
    id: 'act-3',
    type: 'status_change',
    taskId: 'dp-101',
    taskTitle: 'Migrate DB cluster to multi-region replication',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    detail: 'Moved to in-progress'
  }
];

function getStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
}

function saveStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export function getStoredActivities(): ActivityEvent[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITIES;
  }
}

export function logActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): ActivityEvent {
  const newEv: ActivityEvent = {
    ...event,
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  const list = [newEv, ...getStoredActivities()].slice(0, 30);
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  return newEv;
}

export const api = {
  async getTasks(): Promise<Task[]> {
    try {
      const res = await fetch(`${API_BASE}/tasks`, { signal: AbortSignal.timeout(1500) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      saveStoredTasks(data);
      return data;
    } catch {
      // Fallback
      return getStoredTasks();
    }
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: `dp-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString()
    };
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const saved = await res.json();
        logActivity({ type: 'created', taskId: saved.id, taskTitle: saved.title, detail: `Created with ${saved.priority} priority` });
        return saved;
      }
    } catch {
      // Offline fallback
    }

    const current = getStoredTasks();
    const updated = [newTask, ...current];
    saveStoredTasks(updated);
    logActivity({ type: 'created', taskId: newTask.id, taskTitle: newTask.title, detail: `Created with ${newTask.priority} priority` });
    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const updated = await res.json();
        return updated;
      }
    } catch {
      // Offline fallback
    }

    const current = getStoredTasks();
    const idx = current.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    const updated: Task = { ...current[idx], ...updates };
    current[idx] = updated;
    saveStoredTasks(current);

    if (updates.status) {
      logActivity({ type: 'status_change', taskId: updated.id, taskTitle: updated.title, detail: `Status -> ${updates.status}` });
    } else {
      logActivity({ type: 'updated', taskId: updated.id, taskTitle: updated.title, detail: 'Updated task details' });
    }
    return updated;
  },

  async deleteTask(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(1500) });
    } catch {
      // Offline fallback
    }
    const current = getStoredTasks();
    const target = current.find(t => t.id === id);
    const updated = current.filter(t => t.id !== id);
    saveStoredTasks(updated);
    if (target) {
      logActivity({ type: 'deleted', taskId: target.id, taskTitle: target.title, detail: 'Deleted task' });
    }
  }
};
