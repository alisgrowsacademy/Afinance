'use client';

import { useState } from 'react';
import { Trade } from '@/lib/types';
import {
  groupByDate,
  buildDailySummary,
  formatCurrency,
  formatDate,
} from '@/lib/calculations';
import { BarChart2, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DailyReportProps {
  trades: Trade[];
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs">
      <p className="text-gray-400">{label}</p>
      <p className={v >= 0 ? 'text-emerald-400' : 'text-red-400'}>{formatCurrency(v)}</p>
    </div>
  );
}

export default function DailyReport({ trades }: DailyReportProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const byDate = groupByDate(trades);
  const dates = Object.keys(byDate).sort().reverse();
  const summaries = dates.map((d) => buildDailySummary(d, byDate[d]));

  const barData = [...summaries].reverse().map((s) => ({
    date: s.date.slice(5),
    pnl: s.totalPnL,
  }));

  if (trades.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Belum ada laporan harian</h3>
        <p className="text-gray-400 text-sm">Tambahkan trade untuk melihat laporan per hari</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Laporan Harian</h1>
        <p className="text-gray-400 text-sm mt-0.5">Ringkasan performa per hari trading</p>
      </div>

      {/* Bar chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4 text-sm">P&L per Hari</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v >= 0 ? '' : '-'}Rp${Math.abs(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily cards */}
      <div className="space-y-3">
        {summaries.map((summary) => {
          const isExpanded = expandedDate === summary.date;
          return (
            <div
              key={summary.date}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedDate(isExpanded ? null : summary.date)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-1.5 h-10 rounded-full ${
                      summary.totalPnL > 0
                        ? 'bg-emerald-500'
                        : summary.totalPnL < 0
                        ? 'bg-red-500'
                        : 'bg-gray-600'
                    }`}
                  />
                  <div>
                    <p className="text-white font-medium text-sm">{formatDate(summary.date)}</p>
                    <p className="text-gray-400 text-xs">
                      {summary.trades.length} trade · {summary.wins}W {summary.losses}L{' '}
                      {summary.breakevens > 0 && `${summary.breakevens}BE`} · Win rate {summary.winRate}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold text-lg ${
                      summary.totalPnL > 0
                        ? 'text-emerald-400'
                        : summary.totalPnL < 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {summary.totalPnL > 0 ? '+' : ''}
                    {formatCurrency(summary.totalPnL)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-800 px-4 pb-4">
                  {/* Best/Worst */}
                  <div className="grid grid-cols-2 gap-3 py-3">
                    <div className="bg-emerald-500/10 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-emerald-400 text-xs mb-1">
                        <TrendingUp className="w-3 h-3" /> Trade Terbaik
                      </div>
                      {summary.bestTrade ? (
                        <>
                          <p className="text-white font-semibold text-sm">{summary.bestTrade.symbol}</p>
                          <p className="text-emerald-400 text-sm">+{formatCurrency(summary.bestTrade.pnl)}</p>
                        </>
                      ) : <p className="text-gray-500 text-xs">-</p>}
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-red-400 text-xs mb-1">
                        <TrendingDown className="w-3 h-3" /> Trade Terburuk
                      </div>
                      {summary.worstTrade ? (
                        <>
                          <p className="text-white font-semibold text-sm">{summary.worstTrade.symbol}</p>
                          <p className="text-red-400 text-sm">{formatCurrency(summary.worstTrade.pnl)}</p>
                        </>
                      ) : <p className="text-gray-500 text-xs">-</p>}
                    </div>
                  </div>

                  {/* Trade list */}
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="text-left py-2">Waktu</th>
                        <th className="text-left py-2">Simbol</th>
                        <th className="text-left py-2">Arah</th>
                        <th className="text-right py-2">Entry</th>
                        <th className="text-right py-2">Exit</th>
                        <th className="text-right py-2">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {summary.trades
                        .slice()
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((t) => (
                          <tr key={t.id} className="text-gray-300">
                            <td className="py-2 text-gray-500">{t.time}</td>
                            <td className="py-2 font-medium text-white">{t.symbol}</td>
                            <td className="py-2">
                              <span className={t.direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'}>
                                {t.direction}
                              </span>
                            </td>
                            <td className="py-2 text-right">{t.entryPrice.toLocaleString('id-ID')}</td>
                            <td className="py-2 text-right">{t.exitPrice.toLocaleString('id-ID')}</td>
                            <td className={`py-2 text-right font-semibold ${t.pnl > 0 ? 'text-emerald-400' : t.pnl < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                              {t.pnl > 0 ? '+' : ''}{formatCurrency(t.pnl)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {/* Notes */}
                  {summary.trades.some((t) => t.notes) && (
                    <div className="mt-3 space-y-2">
                      {summary.trades
                        .filter((t) => t.notes)
                        .map((t) => (
                          <div key={t.id} className="bg-gray-800 rounded-lg px-3 py-2">
                            <span className="text-gray-400 text-xs font-medium">{t.symbol} · </span>
                            <span className="text-gray-300 text-xs">{t.notes}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
