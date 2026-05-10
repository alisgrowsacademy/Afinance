'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/calculations';

interface DataPoint {
  date: string;
  pnl: number;
  cumulative: number;
}

interface PnLChartProps {
  data: DataPoint[];
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
      <p className="text-gray-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className={p.value >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function PnLChart({ data }: PnLChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        Belum ada data trading untuk ditampilkan
      </div>
    );
  }

  const isPositive = data[data.length - 1]?.cumulative >= 0;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={isPositive ? '#10b981' : '#ef4444'}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={isPositive ? '#10b981' : '#ef4444'}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v >= 0 ? '' : '-'}Rp${Math.abs(v).toLocaleString('id-ID')}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#374151" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="cumulative"
          name="Kumulatif P&L"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          fill="url(#pnlGradient)"
          dot={false}
          activeDot={{ r: 4, fill: isPositive ? '#10b981' : '#ef4444' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
