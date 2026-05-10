'use client';

import { useState } from 'react';
import { Trade } from '@/lib/types';
import { deleteTrade } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/calculations';
import { Trash2, Search, ArrowUpDown } from 'lucide-react';

interface TradeHistoryProps {
  trades: Trade[];
  onTradeDeleted: (id: string) => void;
}

type SortKey = 'date' | 'symbol' | 'pnl';
type SortDir = 'asc' | 'desc';

export default function TradeHistory({ trades, onTradeDeleted }: TradeHistoryProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'WIN' | 'LOSS' | 'BREAKEVEN'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  function handleDelete(id: string) {
    deleteTrade(id);
    onTradeDeleted(id);
    setDeleteId(null);
  }

  const filtered = trades
    .filter((t) => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.symbol.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
      else if (sortKey === 'symbol') cmp = a.symbol.localeCompare(b.symbol);
      else cmp = a.pnl - b.pnl;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalFiltered = filtered.reduce((s, t) => s + t.pnl, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Riwayat Trade</h1>
          <p className="text-gray-400 text-sm mt-0.5">{trades.length} trade tercatat</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari simbol atau catatan..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'WIN', 'LOSS', 'BREAKEVEN'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                filterStatus === s
                  ? s === 'WIN'
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : s === 'LOSS'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      {filtered.length > 0 && (
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">{filtered.length} hasil</span>
          <span className={totalFiltered >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            Total: {formatCurrency(totalFiltered)}
          </span>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          {trades.length === 0 ? 'Belum ada trade yang dicatat' : 'Tidak ada trade yang cocok dengan filter'}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-white select-none"
                    onClick={() => toggleSort('date')}
                  >
                    <span className="flex items-center gap-1">
                      Tanggal <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="text-left px-4 py-3 cursor-pointer hover:text-white select-none"
                    onClick={() => toggleSort('symbol')}
                  >
                    <span className="flex items-center gap-1">
                      Simbol <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3">Arah</th>
                  <th className="text-right px-4 py-3">Entry</th>
                  <th className="text-right px-4 py-3">Exit</th>
                  <th className="text-right px-4 py-3">Lot</th>
                  <th
                    className="text-right px-4 py-3 cursor-pointer hover:text-white select-none"
                    onClick={() => toggleSort('pnl')}
                  >
                    <span className="flex items-center justify-end gap-1">
                      P&L <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      <div>{formatDate(trade.date).split(',')[0]}, {trade.date}</div>
                      <div className="text-gray-500 text-xs">{trade.time}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{trade.symbol}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          trade.direction === 'LONG'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {trade.entryPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {trade.exitPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">{trade.quantity}</td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}
                    >
                      {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          trade.status === 'WIN'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : trade.status === 'LOSS'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {deleteId === trade.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(trade.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-medium"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="text-xs text-gray-500 hover:text-gray-300"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(trade.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
