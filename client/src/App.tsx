import React, { useState, useEffect, useMemo } from 'react';
import { Task, Status, Priority, Metrics, ActivityEvent } from './types';
import { api, getStoredActivities } from './services/api';
import { MetricsBar } from './components/MetricsBar';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { NewTaskModal } from './components/NewTaskModal';
import { ActivitySidebar } from './components/ActivitySidebar';
import { Plus, Activity, Terminal, ShieldCheck, GitBranch } from 'lucide-react';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Load data
  const loadData = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
      setActivities(getStoredActivities());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const created = await api.createTask(taskData);
    setTasks((prev) => [created, ...prev]);
    setActivities(getStoredActivities());
  };

  const handleStatusChange = async (id: string, status: Status) => {
    // optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    await api.updateTask(id, { status });
    setActivities(getStoredActivities());
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTask(id);
    setActivities(getStoredActivities());
  };

  // Metrics computation
  const metrics: Metrics = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status !== 'completed').length;
    const highPriorityIncidents = tasks.filter(
      (t) => t.priority === 'high' && t.status !== 'completed'
    ).length;
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
    // arbitrary deterministic velocity based on completed & in-prog
    const velocity = completed * 8 + tasks.filter((t) => t.status === 'in-progress').length * 4;

    return {
      activeTasks,
      highPriorityIncidents,
      completionRate,
      velocity: velocity || 48
    };
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchId = task.id.toLowerCase().includes(q);
        const matchTag = task.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchId && !matchTag) return false;
      }

      // Status
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      // Priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Header / Nav */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-black shadow-lg shadow-sky-500/20">
                <Activity className="w-4 h-4 text-black" />
              </div>
              <span className="font-semibold tracking-tight text-sm text-zinc-100">DevPulse</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 font-mono text-zinc-400">
                ENGINEERING OPS
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-zinc-400">
              <span className="text-zinc-100 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-sky-400" />
                Sprint Workspace
              </span>
              <span className="hover:text-zinc-200 cursor-pointer flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Service Health
              </span>
              <span className="hover:text-zinc-200 cursor-pointer flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Incidents
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-zinc-950 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Issue</span>
            </button>

            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-mono text-zinc-300">
              SN
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left Section: Metrics, Filters, Board/List */}
        <section className="flex-1 min-w-0">
          <MetricsBar metrics={metrics} />

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalCount={tasks.length}
            filteredCount={filteredTasks.length}
          />

          {loading ? (
            <div className="py-24 text-center text-xs text-zinc-500">Loading operations...</div>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={filteredTasks}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
            />
          ) : (
            <ListView
              tasks={filteredTasks}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </section>

        {/* Right Section: Real-time Activity Logs */}
        <ActivitySidebar activities={activities} />
      </main>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};
export default App;
