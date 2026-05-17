import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActivityStatus = 'pending' | 'active' | 'done' | 'skip' | 'late';

export interface ActivityLog {
  activityId: string;
  status: ActivityStatus;
  actualStartTime?: string;
  actualEndTime?: string;
  note?: string;
}

export interface DailyScheduleStatus {
  date: string;
  activities: Record<string, ActivityLog>;
  completionRate: number;
  moodRating?: number;
  productiveHours?: number;
}

interface ScheduleState {
  dailyStatus: Record<string, DailyScheduleStatus>;
  scheduleStreak: number;
  lastCompletedDate: string | null;
}

interface ScheduleActions {
  updateActivityStatus(
    date: string,
    activityId: string,
    status: ActivityStatus,
    note?: string
  ): void;
  getDailyStatus(date: string): DailyScheduleStatus | null;
  calculateCompletionRate(date: string): number;
  logMood(date: string, rating: number): void;
  calculateStreak(): void;
  initDayIfNeeded(date: string, activities: { id: string }[]): void;
}

type ScheduleStore = ScheduleState & ScheduleActions;

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      dailyStatus: {},
      scheduleStreak: 0,
      lastCompletedDate: null,

      updateActivityStatus(date, activityId, status, note) {
        set((state) => {
          const day = state.dailyStatus[date];
          if (!day) return state;

          const updatedActivity: ActivityLog = {
            ...day.activities[activityId],
            activityId,
            status,
            ...(note !== undefined ? { note } : {}),
          };

          const updatedActivities = {
            ...day.activities,
            [activityId]: updatedActivity,
          };

          const completionRate = computeCompletionRate(updatedActivities);

          return {
            dailyStatus: {
              ...state.dailyStatus,
              [date]: {
                ...day,
                activities: updatedActivities,
                completionRate,
              },
            },
          };
        });
      },

      getDailyStatus(date) {
        return get().dailyStatus[date] ?? null;
      },

      calculateCompletionRate(date) {
        const day = get().dailyStatus[date];
        if (!day) return 0;
        return computeCompletionRate(day.activities);
      },

      logMood(date, rating) {
        set((state) => {
          const day = state.dailyStatus[date];
          if (!day) return state;
          return {
            dailyStatus: {
              ...state.dailyStatus,
              [date]: { ...day, moodRating: rating },
            },
          };
        });
      },

      calculateStreak() {
        const { dailyStatus } = get();
        const completedDates = Object.entries(dailyStatus)
          .filter(([, day]) => day.completionRate >= 0.8)
          .map(([date]) => date)
          .sort((a, b) => (a > b ? -1 : 1));

        if (completedDates.length === 0) {
          set({ scheduleStreak: 0 });
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        let cursor = new Date(today);

        for (const dateStr of completedDates) {
          const cursorStr = cursor.toISOString().split('T')[0];
          if (dateStr === cursorStr) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
          } else if (dateStr < cursorStr) {
            break;
          }
        }

        const lastCompleted = completedDates[0];
        set({ scheduleStreak: streak, lastCompletedDate: lastCompleted });
      },

      initDayIfNeeded(date, activities) {
        set((state) => {
          if (state.dailyStatus[date]) return state;

          const initialActivities: Record<string, ActivityLog> = {};
          for (const { id } of activities) {
            initialActivities[id] = { activityId: id, status: 'pending' };
          }

          const newDay: DailyScheduleStatus = {
            date,
            activities: initialActivities,
            completionRate: 0,
          };

          return {
            dailyStatus: { ...state.dailyStatus, [date]: newDay },
          };
        });
      },
    }),
    {
      name: '@blueprint/schedule-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function computeCompletionRate(
  activities: Record<string, ActivityLog>
): number {
  const all = Object.values(activities);
  if (all.length === 0) return 0;
  const done = all.filter((a) => a.status === 'done').length;
  return done / all.length;
}

export default useScheduleStore;
