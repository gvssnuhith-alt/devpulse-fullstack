import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from '../utils/auth.js';

// ponytail: single-file atomic JSON persistence. Zero native binaries; swap to sqlite3/better-sqlite3 if write contention requires WAL.
const DB_PATH = process.env.DATA_FILE
  ? path.resolve(process.cwd(), process.env.DATA_FILE)
  : path.resolve(process.cwd(), 'data/devpulse.json');

const INITIAL_TASKS = [
  {
    id: 'tsk-001',
    title: 'Migrate auth service to JWT stateless tokens',
    description: 'Replace legacy session cookies with signed HS256 JWT tokens for API gateway compat.',
    status: 'completed',
    priority: 'high',
    assignedTo: 'alex.chen@devpulse.io',
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-19T14:30:00.000Z'
  },
  {
    id: 'tsk-002',
    title: 'Investigate Redis cache eviction spikes on cluster-us-east',
    description: 'Memory usage exceeding 85% high watermark during 09:00 UTC batch job cycles.',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'sarah.k@devpulse.io',
    createdAt: '2026-09-20T08:15:00.000Z',
    updatedAt: '2026-09-22T11:00:00.000Z'
  },
  {
    id: 'tsk-003',
    title: 'Implement rate limiting on /api/v1/auth/login',
    description: 'Enforce 5 attempts per IP per 15 minute sliding window to mitigate credential stuffing.',
    status: 'todo',
    priority: 'high',
    assignedTo: 'alex.chen@devpulse.io',
    createdAt: '2026-09-21T09:30:00.000Z',
    updatedAt: '2026-09-21T09:30:00.000Z'
  },
  {
    id: 'tsk-004',
    title: 'Optimize Postgres query latency on audit_logs table',
    description: 'Add composite B-tree index on (tenant_id, created_at DESC) to speed up compliance exporter.',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'marcus.v@devpulse.io',
    createdAt: '2026-09-21T11:45:00.000Z',
    updatedAt: '2026-09-22T16:20:00.000Z'
  },
  {
    id: 'tsk-005',
    title: 'Deploy Prometheus Blackbox exporter for edge probe checks',
    description: 'Monitor DNS resolution, TLS handshake latencies, and HTTP response codes across 4 regions.',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'elena.r@devpulse.io',
    createdAt: '2026-09-17T13:00:00.000Z',
    updatedAt: '2026-09-20T17:10:00.000Z'
  },
  {
    id: 'tsk-006',
    title: 'Fix race condition in webhooks retry worker queue',
    description: 'Exponential backoff schedule drops message acknowledgements when pod gracefully terminates.',
    status: 'todo',
    priority: 'high',
    assignedTo: 'sarah.k@devpulse.io',
    createdAt: '2026-09-22T10:00:00.000Z',
    updatedAt: '2026-09-22T10:00:00.000Z'
  },
  {
    id: 'tsk-007',
    title: 'Update Docker base images to Node 22-alpine',
    description: 'Resolve CVE-2026-2189 and CVE-2026-2190 by bumping base images across all microservices.',
    status: 'completed',
    priority: 'low',
    assignedTo: 'elena.r@devpulse.io',
    createdAt: '2026-09-15T09:00:00.000Z',
    updatedAt: '2026-09-16T12:00:00.000Z'
  },
  {
    id: 'tsk-008',
    title: 'Draft incident post-mortem for INC-2026-09-14 outage',
    description: 'Root cause analysis on ingress controller crashloop backoff following Helm rollback.',
    status: 'todo',
    priority: 'medium',
    assignedTo: 'marcus.v@devpulse.io',
    createdAt: '2026-09-22T14:30:00.000Z',
    updatedAt: '2026-09-22T14:30:00.000Z'
  }
];

class Database {
  constructor() {
    this.data = { users: [], tasks: [], activity: [] };
    this.init();
  }

  init() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(DB_PATH)) {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(raw);
        if (!this.data.tasks || this.data.tasks.length === 0) {
          this.data.tasks = INITIAL_TASKS;
          this.save();
        }
      } catch {
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  seed() {
    this.data = {
      users: [
        {
          id: 'usr-admin',
          name: 'DevPulse Admin',
          email: 'admin@devpulse.io',
          password: hashPassword('admin123456'),
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ],
      tasks: INITIAL_TASKS,
      activity: [
        {
          id: 'act-init',
          action: 'SEED',
          entity: 'task',
          details: 'Initialized DevPulse database with 8 core engineering tasks',
          user: 'system',
          timestamp: new Date().toISOString()
        }
      ]
    };
    this.save();
  }

  save() {
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
    fs.renameSync(tempPath, DB_PATH);
  }

  // Users
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Tasks
  getTasks({ status, priority, search } = {}) {
    let list = [...this.data.tasks];
    if (status) {
      list = list.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }
    if (priority) {
      list = list.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getTaskById(id) {
    return this.data.tasks.find((t) => t.id === id);
  }

  createTask(task) {
    this.data.tasks.unshift(task);
    this.save();
    return task;
  }

  updateTask(id, patch) {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.tasks[idx];
  }

  deleteTask(id) {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    const [deleted] = this.data.tasks.splice(idx, 1);
    this.save();
    return deleted;
  }

  // Activity Log
  logActivity({ action, entity, entityId, details, user }) {
    const entry = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      entity,
      entityId,
      details,
      user: user || 'system',
      timestamp: new Date().toISOString()
    };
    this.data.activity.unshift(entry);
    if (this.data.activity.length > 200) this.data.activity.length = 200;
    this.save();
    return entry;
  }

  getActivityLogs(limit = 50) {
    return this.data.activity.slice(0, limit);
  }

  // Analytics
  getAnalytics() {
    const total = this.data.tasks.length;
    const completed = this.data.tasks.filter((t) => t.status === 'completed').length;
    const in_progress = this.data.tasks.filter((t) => t.status === 'in_progress').length;
    const todo = this.data.tasks.filter((t) => t.status === 'todo').length;
    const high_priority = this.data.tasks.filter((t) => t.priority === 'high').length;
    const completion_rate = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0;

    return {
      total,
      completed,
      in_progress,
      todo,
      high_priority,
      completion_rate
    };
  }
}

export const db = new Database();
