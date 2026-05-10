'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trade } from '@/lib/types';
import { getTrades } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import TradeForm from '@/components/TradeForm';
import TradeHistory from '@/components/TradeHistory';
import DailyReport from '@/components/DailyReport';

type Tab = 'dashboard' | 'add-trade' | 'history' | 'daily-report';

export default function Home() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTrades(getTrades());
    setMounted(true);
  }, []);

  const handleTradeAdded = useCallback((trade: Trade) => {
    setTrades((prev) => [trade, ...prev]);
    setActiveTab('dashboard');
  }, []);

  const handleTradeDeleted = useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard trades={trades} onAddTrade={() => setActiveTab('add-trade')} />
        )}
        {activeTab === 'add-trade' && (
          <TradeForm onTradeAdded={handleTradeAdded} />
        )}
        {activeTab === 'history' && (
          <TradeHistory trades={trades} onTradeDeleted={handleTradeDeleted} />
        )}
        {activeTab === 'daily-report' && (
          <DailyReport trades={trades} />
        )}
      </main>
    </div>
  );
}
