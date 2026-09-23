import React from 'react';
import { Metrics } from '../types';
import { Layers, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface Props {
  metrics: Metrics;
}

export const MetricsBar: React.FC<Props> = ({ metrics }) => {
  const cards = [
    {
      label: 'Active Tasks',
      value: metrics.activeTasks,
      subtext: 'In backlog & progress',
      icon: Layers,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20'
    },
    {
      label: 'High Priority Incidents',
      value: metrics.highPriorityIncidents,
      subtext: 'Requires immediate attention',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Completion Rate',
      value: `${metrics.completionRate}%`,
      subtext: 'Overall resolution ratio',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Team Velocity',
      value: `${metrics.velocity} pts`,
      subtext: 'Sprint throughput pace',
      icon: Zap,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group relative rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all duration-150 hover:border-zinc-700/80 hover:bg-zinc-900/90"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded-lg border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-zinc-100">{card.value}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{card.subtext}</p>
          </div>
        );
      })}
    </section>
  );
};
