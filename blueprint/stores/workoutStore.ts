import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SetLog {
  reps: number;
  weight: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseName: string;
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutSessionLog {
  date: string;
  sessionName: string;
  exercises: ExerciseLog[];
  duration: number;
  completed: boolean;
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number | null;
  maxReps: number;
  date: string;
}

interface WorkoutState {
  sessions: Record<string, WorkoutSessionLog>;
  personalRecords: Record<string, PersonalRecord>;
  workoutStreak: number;
  lastWorkoutDate: string | null;
}

interface WorkoutActions {
  logWorkoutSession(date: string, session: WorkoutSessionLog): void;
  updatePersonalRecord(exerciseName: string, pr: PersonalRecord): void;
  getSessionByDate(date: string): WorkoutSessionLog | null;
  calculateStreak(): void;
}

type WorkoutStore = WorkoutState & WorkoutActions;

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      personalRecords: {},
      workoutStreak: 0,
      lastWorkoutDate: null,

      logWorkoutSession(date, session) {
        set((state) => ({
          sessions: { ...state.sessions, [date]: session },
          lastWorkoutDate: date,
        }));
        get().calculateStreak();
      },

      updatePersonalRecord(exerciseName, pr) {
        set((state) => ({
          personalRecords: { ...state.personalRecords, [exerciseName]: pr },
        }));
      },

      getSessionByDate(date) {
        return get().sessions[date] ?? null;
      },

      calculateStreak() {
        const { sessions } = get();
        const sortedDates = Object.keys(sessions)
          .filter((d) => sessions[d].completed)
          .sort((a, b) => (a > b ? -1 : 1));

        if (sortedDates.length === 0) {
          set({ workoutStreak: 0 });
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        let cursor = new Date(today);

        for (const dateStr of sortedDates) {
          const cursorStr = cursor.toISOString().split('T')[0];
          if (dateStr === cursorStr) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
          } else if (dateStr < cursorStr) {
            break;
          }
        }

        set({ workoutStreak: streak });
      },
    }),
    {
      name: '@blueprint/workout-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useWorkoutStore;
