import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

export function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 p-6" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">{title}</p>
          <p className="text-3xl mb-1">{value}</p>
          <p className={`text-sm ${trend === 'up' ? 'text-[#007B8A]' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#e6f4f6] flex items-center justify-center">
          <Icon size={22} strokeWidth={1.5} className="text-[#007B8A]" />
        </div>
      </div>
    </div>
  );
}
