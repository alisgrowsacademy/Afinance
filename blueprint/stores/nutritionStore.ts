import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CALORIE_TARGET = 2700;
export const PROTEIN_TARGET = 150;
export const CARBS_TARGET = 280;
export const FAT_TARGET = 72;
export const HYDRATION_TARGET = 3000;

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  mealTime: string;
  time: string;
}

export interface DailyNutritionLog {
  date: string;
  entries: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface SupplementLog {
  date: string;
  taken: Record<string, boolean>;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
}

interface NutritionState {
  dailyLogs: Record<string, DailyNutritionLog>;
  supplementLogs: Record<string, SupplementLog>;
  hydrationLogs: Record<string, number>;
  myFoods: FoodItem[];
  nutritionStreak: number;
}

interface NutritionActions {
  addFoodEntry(date: string, entry: FoodEntry): void;
  removeFoodEntry(date: string, entryId: string): void;
  getDailyLog(date: string): DailyNutritionLog | null;
  logSupplement(date: string, supplementId: string, taken: boolean): void;
  addHydration(date: string, ml: number): void;
  getHydration(date: string): number;
  addMyFood(food: FoodItem): void;
}

type NutritionStore = NutritionState & NutritionActions;

function recalcTotals(entries: FoodEntry[]): Pick<
  DailyNutritionLog,
  'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat'
> {
  return entries.reduce(
    (acc, e) => ({
      totalCalories: acc.totalCalories + e.calories,
      totalProtein: acc.totalProtein + e.protein,
      totalCarbs: acc.totalCarbs + e.carbs,
      totalFat: acc.totalFat + e.fat,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );
}

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      dailyLogs: {},
      supplementLogs: {},
      hydrationLogs: {},
      myFoods: [],
      nutritionStreak: 0,

      addFoodEntry(date, entry) {
        set((state) => {
          const existing = state.dailyLogs[date];
          const entries = existing ? [...existing.entries, entry] : [entry];
          const totals = recalcTotals(entries);
          const updatedLog: DailyNutritionLog = {
            date,
            entries,
            ...totals,
          };
          return {
            dailyLogs: { ...state.dailyLogs, [date]: updatedLog },
          };
        });
      },

      removeFoodEntry(date, entryId) {
        set((state) => {
          const existing = state.dailyLogs[date];
          if (!existing) return state;
          const entries = existing.entries.filter((e) => e.id !== entryId);
          const totals = recalcTotals(entries);
          const updatedLog: DailyNutritionLog = {
            date,
            entries,
            ...totals,
          };
          return {
            dailyLogs: { ...state.dailyLogs, [date]: updatedLog },
          };
        });
      },

      getDailyLog(date) {
        return get().dailyLogs[date] ?? null;
      },

      logSupplement(date, supplementId, taken) {
        set((state) => {
          const existing = state.supplementLogs[date];
          const updatedLog: SupplementLog = {
            date,
            taken: {
              ...(existing?.taken ?? {}),
              [supplementId]: taken,
            },
          };
          return {
            supplementLogs: { ...state.supplementLogs, [date]: updatedLog },
          };
        });
      },

      addHydration(date, ml) {
        set((state) => ({
          hydrationLogs: {
            ...state.hydrationLogs,
            [date]: (state.hydrationLogs[date] ?? 0) + ml,
          },
        }));
      },

      getHydration(date) {
        return get().hydrationLogs[date] ?? 0;
      },

      addMyFood(food) {
        set((state) => ({
          myFoods: [...state.myFoods, food],
        }));
      },
    }),
    {
      name: '@blueprint/nutrition-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useNutritionStore;
