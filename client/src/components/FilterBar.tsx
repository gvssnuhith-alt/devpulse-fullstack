import React from 'react';
import { Priority, Status } from '../types';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: Status | 'all';
  onStatusFilterChange: (s: Status | 'all') => void;
  priorityFilter: Priority | 'all';
  onPriorityFilterChange: (p: Priority | 'all') => void;
  viewMode: 'kanban' | 'list';
  onViewModeChange: (m: 'kanban' | 'list') => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
      <div className="flex flex-1 items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter issues by title, tag, or ID..."
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 hidden sm:inline" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as Status | 'all')}
            className="bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as Priority | 'all')}
            className="bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Right controls: view mode toggle & count */}
      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
        <span className="text-xs text-zinc-500">
          Showing <strong className="text-zinc-300">{filteredCount}</strong> of {totalCount}
        </span>

        <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('kanban')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'kanban'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>
    </div>
  );
};
