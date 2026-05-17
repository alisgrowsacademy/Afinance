import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  name: string;
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  calorieTarget: number;
  proteinTarget: number;
  sleepTarget: number;
  workoutStreak: number;
  scheduleStreak: number;
  nutritionStreak: number;
  totalWorkouts: number;
  appStartDate: string | null;
}

interface UserActions {
  setName(name: string): void;
  completeOnboarding(): void;
  setNotificationsEnabled(enabled: boolean): void;
  updateTargets(
    targets: Partial<{
      calorieTarget: number;
      proteinTarget: number;
      sleepTarget: number;
    }>
  ): void;
  incrementWorkoutStreak(): void;
  resetWorkoutStreak(): void;
  incrementScheduleStreak(): void;
  resetScheduleStreak(): void;
  incrementNutritionStreak(): void;
  resetNutritionStreak(): void;
  incrementTotalWorkouts(): void;
  setAppStartDate(date: string): void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: '',
      onboardingComplete: false,
      notificationsEnabled: false,
      calorieTarget: 2700,
      proteinTarget: 150,
      sleepTarget: 8,
      workoutStreak: 0,
      scheduleStreak: 0,
      nutritionStreak: 0,
      totalWorkouts: 0,
      appStartDate: null,

      setName(name) {
        set({ name });
      },

      completeOnboarding() {
        set({ onboardingComplete: true });
      },

      setNotificationsEnabled(enabled) {
        set({ notificationsEnabled: enabled });
      },

      updateTargets(targets) {
        set((state) => ({ ...state, ...targets }));
      },

      incrementWorkoutStreak() {
        set((state) => ({ workoutStreak: state.workoutStreak + 1 }));
      },

      resetWorkoutStreak() {
        set({ workoutStreak: 0 });
      },

      incrementScheduleStreak() {
        set((state) => ({ scheduleStreak: state.scheduleStreak + 1 }));
      },

      resetScheduleStreak() {
        set({ scheduleStreak: 0 });
      },

      incrementNutritionStreak() {
        set((state) => ({ nutritionStreak: state.nutritionStreak + 1 }));
      },

      resetNutritionStreak() {
        set({ nutritionStreak: 0 });
      },

      incrementTotalWorkouts() {
        set((state) => ({ totalWorkouts: state.totalWorkouts + 1 }));
      },

      setAppStartDate(date) {
        set({ appStartDate: date });
      },
    }),
    {
      name: '@blueprint/user-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
