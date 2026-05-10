'use client';

import { useState } from 'react';
import { Trade, TradeDirection } from '@/lib/types';
import { calculatePnL, getTradeStatus } from '@/lib/calculations';
import { saveTrade, generateId } from '@/lib/storage';
import { CheckCircle } from 'lucide-react';

interface TradeFormProps {
  onTradeAdded: (trade: Trade) => void;
}

const POPULAR_SYMBOLS = [
  'BBCA', 'BBRI', 'TLKM', 'ASII', 'UNVR', 'GOTO', 'BMRI', 'ACES',
  'BTCUSDT', 'ETHUSDT', 'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY',
];

export default function TradeForm({ onTradeAdded }: TradeFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [form, setForm] = useState({
    date: today,
    time: nowTime,
    symbol: '',
    direction: 'LONG' as TradeDirection,
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    notes: '',
  });
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const previewPnL =
    form.entryPrice && form.exitPrice && form.quantity
      ? calculatePnL(
          form.direction,
          parseFloat(form.entryPrice),
          parseFloat(form.exitPrice),
          parseFloat(form.quantity)
        )
      : null;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.symbol.trim()) e.symbol = 'Simbol wajib diisi';
    if (!form.entryPrice || isNaN(parseFloat(form.entryPrice)))
      e.entryPrice = 'Harga masuk tidak valid';
    if (!form.exitPrice || isNaN(parseFloat(form.exitPrice)))
      e.exitPrice = 'Harga keluar tidak valid';
    if (!form.quantity || isNaN(parseFloat(form.quantity)) || parseFloat(form.quantity) <= 0)
      e.quantity = 'Jumlah lot tidak valid';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const entry = parseFloat(form.entryPrice);
    const exit = parseFloat(form.exitPrice);
    const qty = parseFloat(form.quantity);
    const pnl = calculatePnL(form.direction, entry, exit, qty);

    const trade: Trade = {
      id: generateId(),
      date: form.date,
      time: form.time,
      symbol: form.symbol.toUpperCase().trim(),
      direction: form.direction,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      pnl,
      status: getTradeStatus(pnl),
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    saveTrade(trade);
    onTradeAdded(trade);

    setForm({ date: today, time: nowTime, symbol: '', direction: 'LONG', entryPrice: '', exitPrice: '', quantity: '', notes: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Tambah Trade</h1>
        <p className="text-gray-400 text-sm mt-0.5">Catat hasil trade yang sudah selesai</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg mb-5 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Trade berhasil disimpan!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => field('date', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Waktu</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => field('time', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Symbol */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Simbol / Instrumen</label>
          <input
            type="text"
            value={form.symbol}
            onChange={(e) => field('symbol', e.target.value)}
            placeholder="cth: BBCA, BTCUSDT, XAUUSD"
            className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 ${errors.symbol ? 'border-red-500' : 'border-gray-700'}`}
          />
          {errors.symbol && <p className="text-red-400 text-xs mt-1">{errors.symbol}</p>}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {POPULAR_SYMBOLS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => field('symbol', s)}
                className="px-2 py-0.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded border border-gray-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Arah Posisi</label>
          <div className="grid grid-cols-2 gap-3">
            {(['LONG', 'SHORT'] as TradeDirection[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => field('direction', d)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.direction === d
                    ? d === 'LONG'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {d === 'LONG' ? 'Long (Beli)' : 'Short (Jual)'}
              </button>
            ))}
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Harga Masuk (Entry)</label>
            <input
              type="number"
              step="any"
              value={form.entryPrice}
              onChange={(e) => field('entryPrice', e.target.value)}
              placeholder="0"
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 ${errors.entryPrice ? 'border-red-500' : 'border-gray-700'}`}
            />
            {errors.entryPrice && <p className="text-red-400 text-xs mt-1">{errors.entryPrice}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Harga Keluar (Exit)</label>
            <input
              type="number"
              step="any"
              value={form.exitPrice}
              onChange={(e) => field('exitPrice', e.target.value)}
              placeholder="0"
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 ${errors.exitPrice ? 'border-red-500' : 'border-gray-700'}`}
            />
            {errors.exitPrice && <p className="text-red-400 text-xs mt-1">{errors.exitPrice}</p>}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Jumlah Lot / Volume</label>
          <input
            type="number"
            step="any"
            value={form.quantity}
            onChange={(e) => field('quantity', e.target.value)}
            placeholder="1"
            className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 ${errors.quantity ? 'border-red-500' : 'border-gray-700'}`}
          />
          {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
        </div>

        {/* P&L Preview */}
        {previewPnL !== null && (
          <div
            className={`rounded-lg px-4 py-3 border text-sm font-medium ${
              previewPnL >= 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            Estimasi P&L:{' '}
            {previewPnL >= 0 ? '+' : ''}
            {previewPnL.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Catatan (opsional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => field('notes', e.target.value)}
            placeholder="Setup, alasan entry, pelajaran dari trade ini..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Simpan Trade
        </button>
      </form>
    </div>
  );
}
