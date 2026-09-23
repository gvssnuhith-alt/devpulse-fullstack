import React from 'react';
import { ActivityEvent } from '../types';
import { Radio, PlusCircle, CheckCircle, RefreshCw, Trash, Sparkles } from 'lucide-react';

interface Props {
  activities: ActivityEvent[];
}

export const ActivitySidebar: React.FC<Props> = ({ activities }) => {
  const getIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'created':
        return <PlusCircle className="w-3.5 h-3.5 text-sky-400" />;
      case 'status_change':
        return <RefreshCw className="w-3.5 h-3.5 text-amber-400" />;
      case 'deleted':
        return <Trash className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return 'recently';
    }
  };

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Realtime Audit Log
          </h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-600">No recent activity</div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700/80 transition-colors"
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getIcon(act.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[11px] font-mono text-zinc-400">{act.taskId}</span>
                    <span className="text-[10px] text-zinc-500">{formatTime(act.timestamp)}</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200 truncate">{act.taskTitle}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                    <span>{act.detail}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom hint badge */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" />
          Synced with local state
        </span>
        <span className="font-mono text-[10px]">v1.0</span>
      </div>
    </aside>
  );
};
