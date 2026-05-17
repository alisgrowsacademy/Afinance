import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BodyMeasurement {
  date: string;
  weight?: number;
  waist?: number;
  pullupMax?: number;
  notes?: string;
}

export interface SleepLog {
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: number;
  duration: number;
}

export interface TradingEntry {
  id: string;
  date: string;
  content: string;
  profitable?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  createdAt: string;
  completedAt?: string;
}

export interface WeeklyGoal {
  id: string;
  week: string;
  goal: string;
  completed: boolean;
}

export interface RevenueEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  notes?: string;
}

export interface IdeaEntry {
  id: string;
  date: string;
  content: string;
  category: string;
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  ratings: {
    workout: number;
    nutrition: number;
    schedule: number;
    saham: number;
    bisnis: number;
    sleep: number;
  };
  wins: string[];
  improvement: string;
  nextTarget: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  unlocked: boolean;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-blood',
    title: 'First Blood',
    description: 'Selesaikan workout pertama',
    unlocked: false,
  },
  {
    id: 'week1',
    title: 'Week 1 Done',
    description: '7 hari streak pertama',
    unlocked: false,
  },
  {
    id: 'protein-king',
    title: 'Protein King',
    description: '150g protein 7 hari berturut',
    unlocked: false,
  },
  {
    id: 'pullup-progress',
    title: 'Pull-Up Progress',
    description: 'Tambah 3 rep pull-up dari baseline',
    unlocked: false,
  },
  {
    id: 'analyst',
    title: 'Analyst',
    description: '10 hari jurnal saham',
    unlocked: false,
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'Input first revenue',
    unlocked: false,
  },
  {
    id: 'iron-will',
    title: 'Iron Will',
    description: '30 hari streak',
    unlocked: false,
  },
  {
    id: 'blueprint-master',
    title: 'Blueprint Master',
    description: 'Perfect week (semua area 80%+)',
    unlocked: false,
  },
];

interface StatsState {
  bodyMeasurements: BodyMeasurement[];
  sleepLogs: SleepLog[];
  tradingJournal: TradingEntry[];
  businessMilestones: Milestone[];
  businessGoals: WeeklyGoal[];
  revenueEntries: RevenueEntry[];
  ideaBank: IdeaEntry[];
  weeklyReviews: WeeklyReview[];
  achievements: Achievement[];
}

interface StatsActions {
  addBodyMeasurement(m: BodyMeasurement): void;
  logSleep(s: SleepLog): void;
  addTradingEntry(e: TradingEntry): void;
  addMilestone(m: Milestone): void;
  updateMilestoneStatus(id: string, status: Milestone['status']): void;
  addWeeklyGoal(g: WeeklyGoal): void;
  toggleWeeklyGoal(id: string): void;
  addRevenue(e: RevenueEntry): void;
  addIdea(e: IdeaEntry): void;
  saveWeeklyReview(r: WeeklyReview): void;
  unlockAchievement(id: string): void;
  getLatestMeasurement(): BodyMeasurement | null;
  getAverageSleep(days: number): number;
}

type StatsStore = StatsState & StatsActions;

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      bodyMeasurements: [],
      sleepLogs: [],
      tradingJournal: [],
      businessMilestones: [],
      businessGoals: [],
      revenueEntries: [],
      ideaBank: [],
      weeklyReviews: [],
      achievements: INITIAL_ACHIEVEMENTS,

      addBodyMeasurement(m) {
        set((state) => ({
          bodyMeasurements: [...state.bodyMeasurements, m],
        }));
      },

      logSleep(s) {
        set((state) => ({
          sleepLogs: [...state.sleepLogs, s],
        }));
      },

      addTradingEntry(e) {
        set((state) => ({
          tradingJournal: [...state.tradingJournal, e],
        }));
      },

      addMilestone(m) {
        set((state) => ({
          businessMilestones: [...state.businessMilestones, m],
        }));
      },

      updateMilestoneStatus(id, status) {
        set((state) => ({
          businessMilestones: state.businessMilestones.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status,
                  ...(status === 'done'
                    ? { completedAt: new Date().toISOString() }
                    : {}),
                }
              : m
          ),
        }));
      },

      addWeeklyGoal(g) {
        set((state) => ({
          businessGoals: [...state.businessGoals, g],
        }));
      },

      toggleWeeklyGoal(id) {
        set((state) => ({
          businessGoals: state.businessGoals.map((g) =>
            g.id === id ? { ...g, completed: !g.completed } : g
          ),
        }));
      },

      addRevenue(e) {
        set((state) => ({
          revenueEntries: [...state.revenueEntries, e],
        }));
      },

      addIdea(e) {
        set((state) => ({
          ideaBank: [...state.ideaBank, e],
        }));
      },

      saveWeeklyReview(r) {
        set((state) => {
          const exists = state.weeklyReviews.some((w) => w.id === r.id);
          return {
            weeklyReviews: exists
              ? state.weeklyReviews.map((w) => (w.id === r.id ? r : w))
              : [...state.weeklyReviews, r],
          };
        });
      },

      unlockAchievement(id) {
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id && !a.unlocked
              ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
              : a
          ),
        }));
      },

      getLatestMeasurement() {
        const { bodyMeasurements } = get();
        if (bodyMeasurements.length === 0) return null;
        return [...bodyMeasurements].sort((a, b) =>
          a.date > b.date ? -1 : 1
        )[0];
      },

      getAverageSleep(days) {
        const { sleepLogs } = get();
        if (sleepLogs.length === 0) return 0;
        const sorted = [...sleepLogs]
          .sort((a, b) => (a.date > b.date ? -1 : 1))
          .slice(0, days);
        const total = sorted.reduce((sum, s) => sum + s.duration, 0);
        return total / sorted.length;
      },
    }),
    {
      name: '@blueprint/stats-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useStatsStore;
