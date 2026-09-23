export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  tags: string[];
  dueDate: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'status_change';
  taskId: string;
  taskTitle: string;
  timestamp: string;
  detail: string;
}

export interface Metrics {
  activeTasks: number;
  highPriorityIncidents: number;
  completionRate: number;
  velocity: number;
}
