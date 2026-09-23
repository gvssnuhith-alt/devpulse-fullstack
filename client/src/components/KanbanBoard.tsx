import React from 'react';
import { Task, Status } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { Calendar, Tag, ChevronRight, CheckCircle2, Clock, CircleDot } from 'lucide-react';

interface Props {
  tasks: Task[];
  onStatusChange: (id: string, status: Status) => void;
  onDeleteTask: (id: string) => void;
}

const COLUMNS: { status: Status; title: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'todo', title: 'To Do', icon: CircleDot },
  { status: 'in-progress', title: 'In Progress', icon: Clock },
  { status: 'completed', title: 'Completed', icon: CheckCircle2 }
];

export const KanbanBoard: React.FC<Props> = ({ tasks, onStatusChange, onDeleteTask }) => {
  const getTasksByStatus = (status: Status) => tasks.filter((t) => t.status === status);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {COLUMNS.map((col) => {
        const colTasks = getTasksByStatus(col.status);
        const Icon = col.icon;

        return (
          <div
            key={col.status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.status)}
            className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1.5 py-2 mb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  {col.title}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-zinc-800 text-zinc-400">
                {colTasks.length}
              </span>
            </div>

            {/* Task Card List */}
            <div className="flex flex-col gap-2.5 flex-1">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-zinc-800/60 rounded-lg p-6 text-center text-xs text-zinc-600">
                  Drop items here
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="group relative rounded-lg border border-zinc-800/80 bg-zinc-900/90 p-3.5 hover:border-zinc-700 hover:bg-zinc-900 transition-all cursor-grab active:cursor-grabbing shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[11px] text-zinc-500">{task.id}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <h4 className="text-sm font-medium text-zinc-200 line-clamp-2 leading-snug mb-1.5 group-hover:text-white">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/70 text-zinc-400"
                          >
                            <Tag className="w-2.5 h-2.5 opacity-60" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer / Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs text-zinc-500">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate || 'No date'}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Quick state cycle button */}
                        {col.status !== 'completed' && (
                          <button
                            type="button"
                            title="Move forward"
                            onClick={() =>
                              onStatusChange(
                                task.id,
                                col.status === 'todo' ? 'in-progress' : 'completed'
                              )
                            }
                            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-rose-400 hover:text-rose-300 px-1 py-0.5 rounded hover:bg-rose-500/10 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
