import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Card } from '../../components/ui/Card';
import { getGreeting, formatDisplayDate, getTodayKey, getWeekDays, getDayCompletionColor, getProgressColor } from '../../utils/dateUtils';
import { getTodayQuote } from '../../data/quotes';
import { getWorkoutForToday } from '../../data/workoutProgram';
import { getScheduleForDay } from '../../data/scheduleTemplates';
import useScheduleStore from '../../stores/scheduleStore';
import useNutritionStore, { PROTEIN_TARGET, CALORIE_TARGET } from '../../stores/nutritionStore';
import useUserStore from '../../stores/userStore';

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const todayKey = getTodayKey();
  const today = new Date();
  const dayOfWeek = today.getDay();

  const scheduleStore = useScheduleStore();
  const nutritionStore = useNutritionStore();
  const { name, workoutStreak, scheduleStreak } = useUserStore();

  const weekDays = getWeekDays();
  const todaySchedule = getScheduleForDay(dayOfWeek);
  const todayWorkout = getWorkoutForToday(dayOfWeek);
  const todayNutrition = nutritionStore.getDailyLog(todayKey);
  const todayScheduleStatus = scheduleStore.getDailyStatus(todayKey);
  const completionRate = scheduleStore.calculateCompletionRate(todayKey);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    scheduleStore.initDayIfNeeded(todayKey, todaySchedule.map(a => ({ id: a.id })));
  }, [todayKey]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const protein = todayNutrition?.totalProtein ?? 0;
  const calories = todayNutrition?.totalCalories ?? 0;
  const proteinPct = protein / PROTEIN_TARGET;
  const calPct = calories / CALORIE_TARGET;
  const schedulePct = completionRate;

  const ringColor = (pct: number) => {
    if (pct >= 0.8) return Colors.accent;
    if (pct >= 0.5) return Colors.orange;
    return Colors.red;
  };

  const formatClock = (d: Date) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const getDoneCount = () => {
    if (!todayScheduleStatus) return 0;
    return Object.values(todayScheduleStatus.activities).filter(a => a.status === 'done').length;
  };

  const nextActivity = todaySchedule.find(act => {
    const status = todayScheduleStatus?.activities[act.id]?.status;
    return status === 'pending' || status === 'late' || !status;
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bgPrimary }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
      }
    >
      {/* HEADER */}
      <LinearGradient
        colors={['#1a1a1c', '#0e0e0f']}
        style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.accent, fontSize: 26 }}>
              {getGreeting()}
            </Text>
            {name ? (
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 14, marginTop: 2 }}>
                {name}
              </Text>
            ) : null}
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 13, marginTop: 4 }}>
              {formatDisplayDate(today)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.textPrimary, fontSize: 20 }}>
              {formatClock(currentTime)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.accent, fontSize: 18 }}>
                {scheduleStreak}
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>
                streak
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* DAILY PROGRESS RINGS */}
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Card>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <ProgressRing
              size={140}
              strokeWidth={12}
              progress={schedulePct}
              color={ringColor(schedulePct)}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 32 }}>
                  {Math.round(schedulePct * 100)}
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11 }}>
                  hari ini
                </Text>
              </View>
            </ProgressRing>
            <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 14, marginTop: 8 }}>
              {getDoneCount()} / {todaySchedule.length} aktivitas selesai
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <ProgressRing
                size={56}
                strokeWidth={6}
                progress={todayWorkout ? 0 : 0}
                color={Colors.red}
                label="Workout"
              >
                <Ionicons name="barbell-outline" size={18} color={Colors.red} />
              </ProgressRing>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <ProgressRing
                size={56}
                strokeWidth={6}
                progress={proteinPct}
                color={ringColor(proteinPct)}
                label="Protein"
              >
                <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.textPrimary, fontSize: 9 }}>
                  {Math.round(proteinPct * 100)}%
                </Text>
              </ProgressRing>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <ProgressRing
                size={56}
                strokeWidth={6}
                progress={schedulePct}
                color={ringColor(schedulePct)}
                label="Jadwal"
              >
                <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.textPrimary, fontSize: 9 }}>
                  {Math.round(schedulePct * 100)}%
                </Text>
              </ProgressRing>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <ProgressRing
                size={56}
                strokeWidth={6}
                progress={calPct}
                color={ringColor(calPct)}
                label="Kalori"
              >
                <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.textPrimary, fontSize: 9 }}>
                  {Math.round(calPct * 100)}%
                </Text>
              </ProgressRing>
            </View>
          </View>
        </Card>
      </View>

      {/* PRIORITY CARDS */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, paddingHorizontal: 20, marginBottom: 10 }}>
          Prioritas Hari Ini
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {/* Workout Card */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/workout');
            }}
            style={{
              backgroundColor: Colors.bgCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 16,
              width: 180,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.red + '20', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="barbell-outline" size={16} color={Colors.red} />
              </View>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 13 }}>Workout</Text>
            </View>
            <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 4 }}>
              {todayWorkout ? todayWorkout.name : 'REST DAY'}
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginBottom: 12 }}>
              {todayWorkout ? `${todayWorkout.exercises.length} latihan` : 'Istirahat & recovery'}
            </Text>
            {todayWorkout && (
              <View style={{ backgroundColor: Colors.accent, borderRadius: 8, paddingVertical: 6, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.bgPrimary, fontSize: 12 }}>Mulai</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Nutrition Card */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/nutrition');
            }}
            style={{
              backgroundColor: Colors.bgCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 16,
              width: 180,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.orange + '20', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="nutrition-outline" size={16} color={Colors.orange} />
              </View>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 13 }}>Nutrisi</Text>
            </View>
            <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 4 }}>
              {Math.round(calories)} kkal
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>Protein</Text>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: protein >= PROTEIN_TARGET ? Colors.green : Colors.orange, fontSize: 12 }}>
                {Math.round(protein)}g
              </Text>
            </View>
            <View style={{ height: 4, backgroundColor: Colors.border, borderRadius: 2 }}>
              <View style={{ height: 4, backgroundColor: ringColor(calPct), borderRadius: 2, width: `${Math.min(calPct * 100, 100)}%` as any }} />
            </View>
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11, marginTop: 4 }}>
              Sisa {Math.max(0, CALORIE_TARGET - calories)} kkal
            </Text>
          </TouchableOpacity>

          {/* Next Activity Card */}
          {nextActivity && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/schedule');
              }}
              style={{
                backgroundColor: Colors.bgCard,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Colors.border,
                padding: 16,
                width: 180,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.blue + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="time-outline" size={16} color={Colors.blue} />
                </View>
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 13 }}>Berikutnya</Text>
              </View>
              <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.accent, fontSize: 20, marginBottom: 4 }}>
                {nextActivity.time}
              </Text>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 14 }} numberOfLines={2}>
                {nextActivity.title}
              </Text>
            </TouchableOpacity>
          )}

          {/* Saham Card */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/stats');
            }}
            style={{
              backgroundColor: Colors.bgCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 16,
              width: 180,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.purple + '20', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-up-outline" size={16} color={Colors.purple} />
              </View>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 13 }}>Saham IDX</Text>
            </View>
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, lineHeight: 18 }}>
              Analisa hari ini?
            </Text>
            <TouchableOpacity
              style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/modals/journal');
              }}
            >
              <Ionicons name="journal-outline" size={14} color={Colors.purple} />
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.purple, fontSize: 12 }}>
                Buka Jurnal
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* QUICK LOG BAR */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <Card style={{ padding: 12 }}>
          <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginBottom: 10 }}>
            QUICK LOG
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {[
              { icon: 'restaurant-outline' as const, label: 'Makan', color: Colors.orange, route: '/modals/quick-log' as const },
              { icon: 'barbell-outline' as const, label: 'Workout', color: Colors.red, route: '/(tabs)/workout' as const },
              { icon: 'journal-outline' as const, label: 'Jurnal', color: Colors.purple, route: '/modals/journal' as const },
              { icon: 'checkmark-circle-outline' as const, label: 'Task', color: Colors.green, route: '/(tabs)/schedule' as const },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push(item.route);
                }}
                style={{ alignItems: 'center', gap: 6 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: item.color + '15',
                    borderWidth: 1,
                    borderColor: item.color + '40',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11 }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </View>

      {/* WEEKLY SNAPSHOT */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 10 }}>
          Minggu Ini
        </Text>
        <Card style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {weekDays.map((day) => {
              const isPast = day.date <= today;
              const isToday = day.key === todayKey;
              const rate = scheduleStore.getDailyStatus(day.key)?.completionRate;
              const dotColor = isPast ? getDayCompletionColor(rate) : Colors.border;

              return (
                <TouchableOpacity
                  key={day.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push('/(tabs)/schedule');
                  }}
                  style={{ alignItems: 'center', gap: 6 }}
                >
                  <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11 }}>
                    {day.label.toUpperCase()}
                  </Text>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: dotColor + (isToday ? 'ff' : '40'),
                      borderWidth: isToday ? 2 : 1,
                      borderColor: isToday ? Colors.accent : dotColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isPast && rate !== undefined ? (
                      <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.bgPrimary, fontSize: 11 }}>
                        {Math.round(rate * 100)}
                      </Text>
                    ) : (
                      <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textFaint, fontSize: 12 }}>
                        {day.date.getDate()}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </View>

      {/* MOTIVATIONAL QUOTE */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <Card style={{ padding: 20, borderColor: Colors.accent + '30' }}>
          <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.accent, fontSize: 11, marginBottom: 8 }}>
            QUOTE HARI INI
          </Text>
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, lineHeight: 24 }}>
            "{getTodayQuote()}"
          </Text>
        </Card>
      </View>

      {/* SETTINGS BUTTON */}
      <View style={{ paddingHorizontal: 20, marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Ionicons name="settings-outline" size={16} color={Colors.textFaint} />
          <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textFaint, fontSize: 13 }}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
