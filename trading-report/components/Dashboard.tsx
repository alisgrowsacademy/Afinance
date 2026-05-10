'use client';

import { TrendingUp, TrendingDown, BarChart2, Target, Calendar, Activity } from 'lucide-react';
import { Trade } from '@/lib/types';
import {
  buildPortfolioStats,
  buildCumulativePnLData,
  buildDailySummary,
  groupByDate,
  formatCurrency,
  formatDate,
} from '@/lib/calculations';
import StatCard from './StatCard';
import PnLChart from './PnLChart';

interface DashboardProps {
  trades: Trade[];
  onAddTrade: () => void;
}

export default function Dashboard({ trades, onAddTrade }: DashboardProps) {
  const stats = buildPortfolioStats(trades);
  const chartData = buildCumulativePnLData(trades);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter((t) => t.date === todayStr);
  const todaySummary = buildDailySummary(todayStr, todayTrades);

  const byDate = groupByDate(trades);
  const recentDates = Object.keys(byDate).sort().reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Ringkasan performa trading Anda</p>
        </div>
        <button
          onClick={onAddTrade}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Tambah Trade
        </button>
      </div>

      {/* Today banner */}
      {todayTrades.length > 0 && (
        <div
          className={`rounded-xl p-4 border ${
            todaySummary.totalPnL >= 0
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Hari Ini — {formatDate(todayStr)}</p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  todaySummary.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {formatCurrency(todaySummary.totalPnL)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">{todaySummary.trades.length} trade</p>
              <p className="text-gray-300 text-sm">
                Win rate:{' '}
                <span className="text-white font-medium">{todaySummary.winRate}%</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overall stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total P&L"
          value={formatCurrency(stats.totalPnL)}
          sub={`${stats.tradingDays} hari trading`}
          icon={<TrendingUp className="w-5 h-5" />}
          color={stats.totalPnL >= 0 ? 'emerald' : 'red'}
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          sub={`${stats.wins}W / ${stats.losses}L`}
          icon={<Target className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Total Trade"
          value={stats.totalTrades.toString()}
          sub="keseluruhan"
          icon={<BarChart2 className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Rata-rata P&L"
          value={formatCurrency(stats.averagePnL)}
          sub="per trade"
          icon={<Activity className="w-5 h-5" />}
          color={stats.averagePnL >= 0 ? 'emerald' : 'red'}
        />
        <StatCard
          title="Trade Terbaik"
          value={stats.bestTrade ? formatCurrency(stats.bestTrade.pnl) : '-'}
          sub={stats.bestTrade?.symbol ?? ''}
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Trade Terburuk"
          value={stats.worstTrade ? formatCurrency(stats.worstTrade.pnl) : '-'}
          sub={stats.worstTrade?.symbol ?? ''}
          icon={<TrendingDown className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Kurva P&L Kumulatif
        </h2>
        <PnLChart data={chartData} />
      </div>

      {/* Recent days */}
      {recentDates.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            5 Hari Terakhir
          </h2>
          <div className="space-y-2">
            {recentDates.map((date) => {
              const summary = buildDailySummary(date, byDate[date]);
              return (
                <div
                  key={date}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{formatDate(date)}</p>
                    <p className="text-gray-400 text-xs">
                      {summary.trades.length} trade · {summary.wins}W {summary.losses}L
                    </p>
                  </div>
                  <span
                    className={`font-bold ${
                      summary.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {summary.totalPnL >= 0 ? '+' : ''}
                    {formatCurrency(summary.totalPnL)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {trades.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Belum ada data trading</h3>
          <p className="text-gray-400 text-sm mb-6">Mulai catat trade Anda untuk melihat laporan</p>
          <button
            onClick={onAddTrade}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            + Tambah Trade Pertama
          </button>
        </div>
      )}
    </div>
  );
}
