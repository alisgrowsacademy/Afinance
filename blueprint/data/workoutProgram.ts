// Workout program data for Blueprint app

export type ExerciseType = 'compound' | 'isolation' | 'core';

export interface Exercise {
  name: string;
  sets: number;
  repsRange: string;
  rir: number;
  weight: number | null;
  type: ExerciseType;
}

export interface WorkoutSession {
  name: string;
  day: number; // JS day number: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  label: string;
  exercises: Exercise[];
}

export interface WorkoutDay {
  dayOfWeek: number;
  session: WorkoutSession | null;
  isRest: boolean;
}

// ─── PULL DAY — Monday (day 1) ───────────────────────────────────────────────
export const PULL_DAY: WorkoutSession = {
  name: 'PULL DAY',
  day: 1,
  label: 'Back & Biceps',
  exercises: [
    { name: 'Pull-Up / Negative',       sets: 4, repsRange: '6-8',    rir: 2, weight: null, type: 'compound' },
    { name: 'Barbell Bent-Over Row',     sets: 4, repsRange: '8-10',   rir: 2, weight: 17.5, type: 'compound' },
    { name: 'Chin-Up',                   sets: 3, repsRange: 'max',    rir: 2, weight: null, type: 'compound' },
    { name: '1-Arm DB Row',              sets: 3, repsRange: '10/sisi', rir: 1, weight: 22,  type: 'isolation' },
    { name: 'DB Curl (Supinated)',        sets: 3, repsRange: '10-12',  rir: 1, weight: 12,  type: 'isolation' },
    { name: 'Hammer Curl',               sets: 3, repsRange: '12',     rir: 1, weight: 12,  type: 'isolation' },
    { name: 'Hanging Knee Raise',        sets: 3, repsRange: '12',     rir: 0, weight: null, type: 'core' },
    { name: 'Plank',                     sets: 3, repsRange: '45 dtk', rir: 0, weight: null, type: 'core' },
  ],
};

// ─── PUSH DAY — Wednesday (day 3) ────────────────────────────────────────────
export const PUSH_DAY: WorkoutSession = {
  name: 'PUSH DAY',
  day: 3,
  label: 'Chest, Shoulders & Triceps',
  exercises: [
    { name: 'DB Shoulder Press',          sets: 4, repsRange: '8-10',  rir: 2, weight: 15,  type: 'compound' },
    { name: 'DB Floor Press',             sets: 4, repsRange: '8-10',  rir: 2, weight: 17,  type: 'compound' },
    { name: 'DB Lateral Raise',           sets: 4, repsRange: '12-15', rir: 1, weight: 6,   type: 'isolation' },
    { name: 'Decline Push-Up',            sets: 3, repsRange: '10-12', rir: 1, weight: null, type: 'isolation' },
    { name: 'DB Fly (Floor)',             sets: 3, repsRange: '12',    rir: 1, weight: 10,  type: 'isolation' },
    { name: 'Overhead DB Tricep Ext',     sets: 3, repsRange: '10-12', rir: 1, weight: 12,  type: 'isolation' },
    { name: 'Close-Grip Push-Up',         sets: 3, repsRange: '8-12',  rir: 1, weight: null, type: 'isolation' },
  ],
};

// ─── UPPER DAY — Friday (day 5) ──────────────────────────────────────────────
export const UPPER_DAY: WorkoutSession = {
  name: 'UPPER DAY',
  day: 5,
  label: 'Full Upper Body',
  exercises: [
    { name: 'Pike Push-Up',               sets: 4, repsRange: '8-10',  rir: 2, weight: null, type: 'compound' },
    { name: 'Wide-Grip Pull-Up',          sets: 4, repsRange: '6-8',   rir: 2, weight: null, type: 'compound' },
    { name: 'Barbell Pendlay Row',        sets: 3, repsRange: '8-10',  rir: 2, weight: 17.5, type: 'compound' },
    { name: 'DB Lateral Raise (Heavy)',   sets: 4, repsRange: '10-12', rir: 1, weight: 7,   type: 'isolation' },
    { name: 'Rear Delt Fly',             sets: 3, repsRange: '12-15', rir: 1, weight: 6,   type: 'isolation' },
    { name: 'Concentration Curl',         sets: 3, repsRange: '10-12', rir: 1, weight: 10,  type: 'isolation' },
    { name: 'DB Skull Crusher (Floor)',   sets: 3, repsRange: '10-12', rir: 1, weight: 8,   type: 'isolation' },
    { name: 'Reverse Curl',              sets: 2, repsRange: '12-15', rir: 1, weight: 8,   type: 'isolation' },
  ],
};

// ─── LEGS DAY — Saturday (day 6) ─────────────────────────────────────────────
export const LEGS_DAY: WorkoutSession = {
  name: 'LEGS DAY',
  day: 6,
  label: 'Legs & Core',
  exercises: [
    { name: 'Bulgarian Split Squat',      sets: 4, repsRange: '12/kaki',    rir: 2, weight: null, type: 'compound' },
    { name: 'Pistol Squat / Skater',      sets: 3, repsRange: '6-8/kaki',   rir: 2, weight: null, type: 'compound' },
    { name: 'Single-Leg Glute Bridge',    sets: 3, repsRange: '12/kaki',    rir: 2, weight: null, type: 'compound' },
    { name: 'Walking Lunge',              sets: 3, repsRange: '12/kaki',    rir: 1, weight: null, type: 'isolation' },
    { name: 'Single-Leg Calf Raise',      sets: 4, repsRange: '15/kaki',    rir: 1, weight: null, type: 'isolation' },
    { name: 'Wall Sit',                   sets: 3, repsRange: '45-60 dtk',  rir: 0, weight: null, type: 'isolation' },
    { name: 'Lying Leg Raise',            sets: 3, repsRange: '15',         rir: 0, weight: null, type: 'core' },
    { name: 'Russian Twist',              sets: 3, repsRange: '15/sisi',    rir: 0, weight: null, type: 'core' },
    { name: 'Plank',                      sets: 3, repsRange: '60 dtk',     rir: 0, weight: null, type: 'core' },
  ],
};

// ─── REST DAYS ────────────────────────────────────────────────────────────────
// Tuesday = 2, Thursday = 4, Sunday = 0 (JS getDay())
export const REST_DAYS: number[] = [2, 4, 0];

// ─── WORKOUT SCHEDULE ─────────────────────────────────────────────────────────
// Map from JS day number (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
export const WORKOUT_SCHEDULE: Map<number, WorkoutSession> = new Map([
  [1, PULL_DAY],
  [3, PUSH_DAY],
  [5, UPPER_DAY],
  [6, LEGS_DAY],
]);

/**
 * Returns the workout session for a given day of the week,
 * or null if it is a rest day.
 * @param dayOfWeek — JS Date.getDay() value (0 = Sunday … 6 = Saturday)
 */
export function getWorkoutForToday(dayOfWeek: number): WorkoutSession | null {
  return WORKOUT_SCHEDULE.get(dayOfWeek) ?? null;
}
