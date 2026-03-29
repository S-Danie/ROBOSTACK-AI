import React from 'react';
import { Activity, Zap, Cpu, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthMonitorProps {
  rosConnected: boolean;
  hardwareStatus: {
    label: string;
    status: string;
    type: string;
  }[];
}

export const HealthMonitor: React.FC<HealthMonitorProps> = ({ rosConnected, hardwareStatus }) => {
  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Health</h3>
        <div className={cn(
          "px-2 py-1 rounded text-[10px] font-bold uppercase",
          rosConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        )}>
          {rosConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="space-y-4">
        {hardwareStatus.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center">
                {item.type === 'perception' && <Camera className="w-4 h-4 text-cyan-500" />}
                {item.type === 'manipulation' && <Activity className="w-4 h-4 text-emerald-500" />}
                {item.type === 'navigation' && <Zap className="w-4 h-4 text-amber-500" />}
                {item.type === 'compute' && <Cpu className="w-4 h-4 text-purple-500" />}
              </div>
              <div>
                <p className="text-xs font-medium text-white">{item.label}</p>
                <p className="text-[10px] text-zinc-500 uppercase">{item.type}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
