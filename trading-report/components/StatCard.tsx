import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  color: 'emerald' | 'red' | 'blue' | 'yellow' | 'purple';
}

const colorMap = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'bg-emerald-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', icon: 'bg-red-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: 'bg-blue-500/20' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: 'bg-yellow-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: 'bg-purple-500/20' },
};

export default function StatCard({ title, value, sub, icon, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl p-5 ${c.bg} border border-gray-800`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
          {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${c.icon}`}>
          <span className={c.text}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
