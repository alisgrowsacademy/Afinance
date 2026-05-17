import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import {
  getWorkoutForToday,
  WORKOUT_SCHEDULE,
  WorkoutSession,
  Exercise,
} from '../../data/workoutProgram';
import useWorkoutStore from '../../stores/workoutStore';
import { getTodayKey, formatDate } from '../../utils/dateUtils';

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

type ExerciseSetInput = {
  reps: string;
  weight: string;
  completed: boolean;
};

type ActiveWorkoutState = {
  session: WorkoutSession;
  currentExerciseIdx: number;
  setInputs: ExerciseSetInput[][];
  startTime: Date;
  elapsed: number;
  restTimer: number | null;
  restDuration: number;
};

function RestTimer({
  seconds,
  onSkip,
  onExtend,
  exerciseType,
}: {
  seconds: number;
  onSkip: () => void;
  onExtend: () => void;
  exerciseType: string;
}) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: Colors.bgCard,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.blue + '60',
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 100,
      }}
    >
      <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginBottom: 4 }}>
        Rest Timer ({exerciseType === 'compound' ? '2 menit' : '75 detik'})
      </Text>
      <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.blue, fontSize: 48, marginBottom: 12 }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSkip();
          }}
          style={{
            flex: 1,
            backgroundColor: Colors.accent,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.bgPrimary, fontSize: 13 }}>Skip Rest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onExtend();
          }}
          style={{
            flex: 1,
            backgroundColor: Colors.bgCard2,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textMuted, fontSize: 13 }}>+30 dtk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ActiveWorkoutModal({
  state,
  onSetComplete,
  onNextExercise,
  onSkipExercise,
  onFinish,
  onCancel,
  onTimerSkip,
  onTimerExtend,
  onInputChange,
}: {
  state: ActiveWorkoutState;
  onSetComplete: (exerciseIdx: number, setIdx: number) => void;
  onNextExercise: () => void;
  onSkipExercise: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onTimerSkip: () => void;
  onTimerExtend: () => void;
  onInputChange: (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => void;
}) {
  const exercise = state.session.exercises[state.currentExerciseIdx];
  const sets = state.setInputs[state.currentExerciseIdx] ?? [];
  const totalExercises = state.session.exercises.length;
  const progress = (state.currentExerciseIdx + 1) / totalExercises;

  const elapsedMins = Math.floor(state.elapsed / 60);
  const elapsedSecs = state.elapsed % 60;

  return (
    <Modal visible animationType="slide" onRequestClose={() => {}}>
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
        {/* Header */}
        <View
          style={{
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: Colors.bgCard,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 18 }}>
              {state.session.name}
            </Text>
            <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.accent, fontSize: 20 }}>
              {elapsedMins}:{elapsedSecs.toString().padStart(2, '0')}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>
              Latihan {state.currentExerciseIdx + 1} dari {totalExercises}
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.red, fontSize: 12 }}>Batalkan</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 4, backgroundColor: Colors.border, borderRadius: 2 }}>
            <View
              style={{
                height: 4,
                backgroundColor: Colors.accent,
                borderRadius: 2,
                width: `${progress * 100}%` as any,
              }}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
          {/* Exercise Info */}
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 22 }}>
                  {exercise.name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  <View style={{ backgroundColor: Colors.accent + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.accent, fontSize: 12 }}>
                      {exercise.sets} sets × {exercise.repsRange}
                    </Text>
                  </View>
                  {exercise.weight && (
                    <View style={{ backgroundColor: Colors.blue + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.blue, fontSize: 12 }}>
                        {exercise.weight}kg
                      </Text>
                    </View>
                  )}
                  <View style={{ backgroundColor: Colors.purple + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.purple, fontSize: 12 }}>
                      RIR {exercise.rir}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {/* Sets Input */}
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 10 }}>
            Log Set
          </Text>
          {sets.map((set, setIdx) => (
            <View
              key={setIdx}
              style={{
                backgroundColor: set.completed ? Colors.green + '10' : Colors.bgCard,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: set.completed ? Colors.green + '40' : Colors.border,
                padding: 12,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Syne_700Bold',
                  color: set.completed ? Colors.green : Colors.textMuted,
                  fontSize: 18,
                  width: 32,
                  textAlign: 'center',
                }}
              >
                {setIdx + 1}
              </Text>

              <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 10, marginBottom: 3 }}>
                    REPS
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    value={set.reps}
                    onChangeText={(v) => onInputChange(state.currentExerciseIdx, setIdx, 'reps', v)}
                    placeholder={exercise.repsRange}
                    placeholderTextColor={Colors.textFaint}
                    style={{
                      backgroundColor: Colors.bgCard2,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      padding: 8,
                      fontFamily: 'DMMono_400Regular',
                      color: Colors.textPrimary,
                      fontSize: 16,
                      textAlign: 'center',
                    }}
                  />
                </View>
                {exercise.weight !== null && (
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 10, marginBottom: 3 }}>
                      KG
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={set.weight}
                      onChangeText={(v) => onInputChange(state.currentExerciseIdx, setIdx, 'weight', v)}
                      placeholder={exercise.weight?.toString() ?? '-'}
                      placeholderTextColor={Colors.textFaint}
                      style={{
                        backgroundColor: Colors.bgCard2,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.border,
                        padding: 8,
                        fontFamily: 'DMMono_400Regular',
                        color: Colors.textPrimary,
                        fontSize: 16,
                        textAlign: 'center',
                      }}
                    />
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  onSetComplete(state.currentExerciseIdx, setIdx);
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: set.completed ? Colors.green : Colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={set.completed ? 'checkmark-done' : 'checkmark'} size={20} color={Colors.bgPrimary} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Navigation buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSkipExercise();
              }}
              style={{
                flex: 1,
                backgroundColor: Colors.bgCard2,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textMuted, fontSize: 14 }}>Skip</Text>
            </TouchableOpacity>

            {state.currentExerciseIdx < totalExercises - 1 ? (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onNextExercise();
                }}
                style={{
                  flex: 2,
                  backgroundColor: Colors.accent,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.bgPrimary, fontSize: 14 }}>Latihan Berikutnya</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.bgPrimary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  onFinish();
                }}
                style={{
                  flex: 2,
                  backgroundColor: Colors.green,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.bgPrimary, fontSize: 14 }}>Selesai Workout!</Text>
                <Ionicons name="trophy" size={16} color={Colors.bgPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Rest Timer overlay */}
        {state.restTimer !== null && state.restTimer > 0 && (
          <RestTimer
            seconds={state.restTimer}
            exerciseType={exercise.type}
            onSkip={onTimerSkip}
            onExtend={onTimerExtend}
          />
        )}
      </View>
    </Modal>
  );
}

export default function WorkoutScreen() {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayKey = getTodayKey();
  const workoutStore = useWorkoutStore();

  const todayWorkout = getWorkoutForToday(dayOfWeek);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  const startWorkout = (session: WorkoutSession) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const inputs: ExerciseSetInput[][] = session.exercises.map(ex =>
      Array.from({ length: ex.sets }, () => ({
        reps: '',
        weight: ex.weight?.toString() ?? '',
        completed: false,
      }))
    );

    setActiveWorkout({
      session,
      currentExerciseIdx: 0,
      setInputs: inputs,
      startTime: new Date(),
      elapsed: 0,
      restTimer: null,
      restDuration: 0,
    });

    timerRef.current = setInterval(() => {
      setActiveWorkout(prev =>
        prev ? { ...prev, elapsed: prev.elapsed + 1 } : null
      );
    }, 1000);
  };

  const handleSetComplete = (exerciseIdx: number, setIdx: number) => {
    if (!activeWorkout) return;

    const newInputs = activeWorkout.setInputs.map((ex, ei) =>
      ei === exerciseIdx
        ? ex.map((s, si) => (si === setIdx ? { ...s, completed: !s.completed } : s))
        : ex
    );

    const exercise = activeWorkout.session.exercises[exerciseIdx];
    const isNowCompleted = !newInputs[exerciseIdx][setIdx].completed;
    const restDuration = exercise.type === 'compound' ? 120 : 75;

    const allSetsCompleted = newInputs[exerciseIdx].every(s => s.completed);

    let restTimer: number | null = null;
    if (!activeWorkout.setInputs[exerciseIdx][setIdx].completed) {
      restTimer = restDuration;
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      restTimerRef.current = setInterval(() => {
        setActiveWorkout(prev => {
          if (!prev || prev.restTimer === null) return prev;
          if (prev.restTimer <= 1) {
            clearInterval(restTimerRef.current!);
            return { ...prev, restTimer: null };
          }
          return { ...prev, restTimer: prev.restTimer - 1 };
        });
      }, 1000);
    }

    setActiveWorkout(prev =>
      prev
        ? {
            ...prev,
            setInputs: newInputs,
            restTimer: isNowCompleted === false ? restTimer : prev.restTimer,
            restDuration,
          }
        : null
    );
  };

  const handleNextExercise = () => {
    if (!activeWorkout) return;
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setActiveWorkout(prev =>
      prev
        ? {
            ...prev,
            currentExerciseIdx: prev.currentExerciseIdx + 1,
            restTimer: null,
          }
        : null
    );
  };

  const handleSkipExercise = () => {
    if (!activeWorkout) return;
    const next = activeWorkout.currentExerciseIdx + 1;
    if (next >= activeWorkout.session.exercises.length) {
      handleFinishWorkout();
    } else {
      handleNextExercise();
    }
  };

  const handleFinishWorkout = () => {
    if (!activeWorkout) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (restTimerRef.current) clearInterval(restTimerRef.current);

    const exerciseLogs = activeWorkout.session.exercises.map((ex, ei) => ({
      exerciseName: ex.name,
      sets: activeWorkout.setInputs[ei].map(s => ({
        reps: parseInt(s.reps) || 0,
        weight: parseFloat(s.weight) || null,
        completed: s.completed,
      })),
    }));

    workoutStore.logWorkoutSession(todayKey, {
      date: todayKey,
      sessionName: activeWorkout.session.name,
      exercises: exerciseLogs,
      duration: activeWorkout.elapsed,
      completed: true,
    });

    setActiveWorkout(null);
    Alert.alert(
      '🏆 Workout Selesai!',
      `Durasi: ${Math.floor(activeWorkout.elapsed / 60)} menit\nSemua latihan tercatat.`,
      [{ text: 'Keren!', style: 'default' }]
    );
  };

  const handleTimerSkip = () => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setActiveWorkout(prev => (prev ? { ...prev, restTimer: null } : null));
  };

  const handleTimerExtend = () => {
    setActiveWorkout(prev =>
      prev ? { ...prev, restTimer: (prev.restTimer ?? 0) + 30 } : null
    );
  };

  const handleInputChange = (
    exIdx: number,
    setIdx: number,
    field: 'reps' | 'weight',
    value: string
  ) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newInputs = prev.setInputs.map((ex, ei) =>
        ei === exIdx
          ? ex.map((s, si) => (si === setIdx ? { ...s, [field]: value } : s))
          : ex
      );
      return { ...prev, setInputs: newInputs };
    });
  };

  const todaySession = workoutStore.getSessionByDate(todayKey);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: Colors.bgCard,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 24 }}>
          Workout
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 13, marginTop: 2 }}>
          Program recomp — {DAY_NAMES_FULL[dayOfWeek]}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
        {/* Weekly Split */}
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16 }}>
          Split Mingguan
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[1, 2, 3, 4, 5, 6, 0].map(day => {
            const session = WORKOUT_SCHEDULE.get(day);
            const isToday = day === dayOfWeek;
            const isRest = !session;

            return (
              <View
                key={day}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  backgroundColor: isToday ? Colors.accent + '20' : Colors.bgCard,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isToday ? Colors.accent : Colors.border,
                  padding: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'DMSans_700Bold',
                    color: isToday ? Colors.accent : Colors.textMuted,
                    fontSize: 10,
                    marginBottom: 4,
                  }}
                >
                  {DAY_NAMES[day]}
                </Text>
                <Text style={{ fontSize: 14 }}>
                  {isRest ? '😴' : session.name.includes('Pull') ? '💪' : session.name.includes('Push') ? '🔥' : session.name.includes('Upper') ? '⚡' : '🦵'}
                </Text>
                <Text
                  style={{
                    fontFamily: 'DMSans_400Regular',
                    color: Colors.textFaint,
                    fontSize: 9,
                    marginTop: 3,
                    textAlign: 'center',
                  }}
                  numberOfLines={1}
                >
                  {isRest ? 'REST' : session.name.split(' ')[0]}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Today's Workout */}
        {todayWorkout ? (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginBottom: 4 }}>
                  HARI INI
                </Text>
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 22 }}>
                  {todayWorkout.name}
                </Text>
              </View>
              {todaySession?.completed && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.green + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
                  <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.green, fontSize: 12 }}>Done</Text>
                </View>
              )}
            </View>

            {todayWorkout.exercises.map((ex, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderBottomWidth: i < todayWorkout.exercises.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor:
                      ex.type === 'compound'
                        ? Colors.red + '20'
                        : ex.type === 'core'
                        ? Colors.blue + '20'
                        : Colors.orange + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <Text style={{ fontSize: 12 }}>
                    {ex.type === 'compound' ? '💥' : ex.type === 'core' ? '🎯' : '💪'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 13 }}>
                    {ex.name}
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11 }}>
                    {ex.sets} sets × {ex.repsRange}{ex.weight ? ` · ${ex.weight}kg` : ''} · RIR {ex.rir}
                  </Text>
                </View>
              </View>
            ))}

            {!todaySession?.completed && (
              <TouchableOpacity
                onPress={() => startWorkout(todayWorkout)}
                style={{
                  marginTop: 16,
                  backgroundColor: Colors.accent,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="play" size={20} color={Colors.bgPrimary} />
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.bgPrimary, fontSize: 16 }}>
                  Mulai Workout
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        ) : (
          <Card>
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 48 }}>😴</Text>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 20, marginTop: 12 }}>
                REST DAY
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 6 }}>
                Istirahat & recovery hari ini. Tubuh tumbuh saat istirahat!
              </Text>
            </View>
          </Card>
        )}

        {/* Recent Sessions */}
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginTop: 4 }}>
          Riwayat Terakhir
        </Text>
        {[...Array(3)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i - 1);
          const key = formatDate(d);
          const session = workoutStore.getSessionByDate(key);
          if (!session) return (
            <Card key={key} style={{ opacity: 0.5 }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 13 }}>
                {d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })} — Tidak ada log
              </Text>
            </Card>
          );
          return (
            <Card key={key}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 14 }}>
                  {session.sessionName}
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>
                  {Math.floor(session.duration / 60)} mnt
                </Text>
              </View>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
              </Text>
            </Card>
          );
        })}
      </ScrollView>

      {activeWorkout && (
        <ActiveWorkoutModal
          state={activeWorkout}
          onSetComplete={handleSetComplete}
          onNextExercise={handleNextExercise}
          onSkipExercise={handleSkipExercise}
          onFinish={handleFinishWorkout}
          onCancel={() => {
            Alert.alert('Batalkan Workout?', 'Progress akan hilang.', [
              { text: 'Lanjutkan', style: 'cancel' },
              {
                text: 'Batalkan',
                style: 'destructive',
                onPress: () => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  if (restTimerRef.current) clearInterval(restTimerRef.current);
                  setActiveWorkout(null);
                },
              },
            ]);
          }}
          onTimerSkip={handleTimerSkip}
          onTimerExtend={handleTimerExtend}
          onInputChange={handleInputChange}
        />
      )}
    </View>
  );
}
