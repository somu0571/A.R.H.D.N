import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';

interface HazardChartProps {
  typeData?: { _id: string; count: number }[];
  severityData?: { _id: string; count: number }[];
  sourceData?: { _id: string; count: number }[];
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#F59E0B',
  LOW: '#10B981',
};

const HAZARD_COLORS = ['#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

export const HazardChart: React.FC<HazardChartProps> = ({
  typeData = [],
  severityData = [],
  sourceData = [],
}) => {
  const formattedTypeData = typeData.map((d) => ({
    name: d._id?.toUpperCase() || 'UNKNOWN',
    count: d.count,
  }));

  const formattedSeverityData = severityData.map((d) => ({
    name: d._id || 'LOW',
    count: d.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Hazards by Classification */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 flex flex-col">
        <h4 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider mb-4">
          Detections by Hazard Category
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0E1424', borderColor: '#1F293D', borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]}>
                {formattedTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={HAZARD_COLORS[index % HAZARD_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 flex flex-col">
        <h4 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider mb-4">
          Severity Spectrum Distribution
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedSeverityData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {formattedSeverityData.map((entry) => (
                  <Cell
                    key={`sev-${entry.name}`}
                    fill={SEVERITY_COLORS[entry.name] || '#3B82F6'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0E1424', borderColor: '#1F293D', borderRadius: 8, fontSize: 11 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: 10 }}
                formatter={(val) => <span className="text-slate-300 font-mono text-xs">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HazardChart;
