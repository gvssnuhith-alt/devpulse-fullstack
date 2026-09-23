import React, { useState } from 'react';
import { Task, Status } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { ArrowUpDown, Trash2, Calendar, Tag } from 'lucide-react';

interface Props {
  tasks: Task[];
  onStatusChange: (id: string, status: Status) => void;
  onDeleteTask: (id: string) => void;
}

type SortField = 'id' | 'title' | 'priority' | 'status' | 'dueDate';

export const ListView: React.FC<Props> = ({ tasks, onStatusChange, onDeleteTask }) => {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const priorityWeight = { high: 3, medium: 2, low: 1 };
  const statusWeight = { 'todo': 1, 'in-progress': 2, 'completed': 3 };

  const sortedTasks = [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'id') cmp = a.id.localeCompare(b.id);
    else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortField === 'priority') cmp = priorityWeight[a.priority] - priorityWeight[b.priority];
    else if (sortField === 'status') cmp = statusWeight[a.status] - statusWeight[b.status];
    else if (sortField === 'dueDate') cmp = (a.dueDate || '').localeCompare(b.dueDate || '');
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-medium">
            <th
              onClick={() => handleSort('id')}
              className="py-3 px-4 cursor-pointer hover:text-zinc-200 select-none w-24"
            >
              <div className="flex items-center gap-1.5">
                <span>ID</span>
                <ArrowUpDown className="w-3 h-3 text-zinc-500" />
              </div>
            </th>
            <th
              onClick={() => handleSort('title')}
              className="py-3 px-4 cursor-pointer hover:text-zinc-200 select-none min-w-[280px]"
            >
              <div className="flex items-center gap-1.5">
                <span>Issue Title</span>
                <ArrowUpDown className="w-3 h-3 text-zinc-500" />
              </div>
            </th>
            <th
              onClick={() => handleSort('priority')}
              className="py-3 px-4 cursor-pointer hover:text-zinc-200 select-none w-28"
            >
              <div className="flex items-center gap-1.5">
                <span>Priority</span>
                <ArrowUpDown className="w-3 h-3 text-zinc-500" />
              </div>
            </th>
            <th
              onClick={() => handleSort('status')}
              className="py-3 px-4 cursor-pointer hover:text-zinc-200 select-none w-36"
            >
              <div className="flex items-center gap-1.5">
                <span>Status</span>
                <ArrowUpDown className="w-3 h-3 text-zinc-500" />
              </div>
            </th>
            <th
              onClick={() => handleSort('dueDate')}
              className="py-3 px-4 cursor-pointer hover:text-zinc-200 select-none w-32"
            >
              <div className="flex items-center gap-1.5">
                <span>Due Date</span>
                <ArrowUpDown className="w-3 h-3 text-zinc-500" />
              </div>
            </th>
            <th className="py-3 px-4 text-right w-16">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {sortedTasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-zinc-500">
                No matching tasks found.
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => (
              <tr
                key={task.id}
                className="group hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                  {task.id}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-zinc-200 mb-0.5">{task.title}</div>
                  <div className="text-[11px] text-zinc-500 line-clamp-1">{task.description}</div>
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {task.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400"
                        >
                          <Tag className="w-2 h-2 opacity-50" />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="py-3 px-4">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
                    className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-zinc-400 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span>{task.dueDate || '-'}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
