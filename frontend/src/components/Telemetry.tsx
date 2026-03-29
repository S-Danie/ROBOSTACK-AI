import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

const MOCK_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  value: 15 + Math.sin(i / 2) * 5
}));

const Telemetry: React.FC = () => {
  return (
    <div className="glass-panel p-6">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">System Telemetry</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_DATA}>
            <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Telemetry;
