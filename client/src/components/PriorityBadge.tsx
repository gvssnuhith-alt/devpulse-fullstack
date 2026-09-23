import React from 'react';
import { Priority } from '../types';

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const map: Record<Priority, { label: string; dot: string; bg: string; text: string }> = {
    high: {
      label: 'High',
      dot: 'bg-rose-500',
      bg: 'bg-rose-500/10 border-rose-500/20',
      text: 'text-rose-400'
    },
    medium: {
      label: 'Med',
      dot: 'bg-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400'
    },
    low: {
      label: 'Low',
      dot: 'bg-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-400'
    }
  };

  const config = map[priority] || map.low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
