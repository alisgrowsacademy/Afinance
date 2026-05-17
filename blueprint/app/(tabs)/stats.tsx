import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import useStatsStore from '../../stores/statsStore';
import useNutritionStore, { PROTEIN_TARGET } from '../../stores/nutritionStore';
import useWorkoutStore from '../../stores/workoutStore';
import useScheduleStore from '../../stores/scheduleStore';
import useUserStore from '../../stores/userStore';
import { getTodayKey, formatDate, getWeekDays, getDayCompletionColor } from '../../utils/dateUtils';

const TABS = ['Overview', 'Body', 'Saham', 'Bisnis', 'Review'] as const;
type Tab = typeof TABS[number];

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.bgCard,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 14,
      }}
    >
      <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11, marginBottom: 4 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ fontFamily: 'Syne_700Bold', color: color ?? Colors.textPrimary, fontSize: 22 }}>
        {value}
      </Text>
      {sub && (
        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11, marginTop: 2 }}>
          {sub}
        </Text>
      )}
    </View>
  );
}

function SimpleBarChart({
  data,
  max,
  color,
  labels,
}: {
  data: number[];
  max: number;
  color: string;
  labels?: string[];
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 80 }}>
      {data.map((val, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={{
              width: '100%',
              height: max > 0 ? (val / max) * 64 : 0,
              backgroundColor: val >= max * 0.8 ? color : Colors.bgCard2,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: color + '40',
              minHeight: val > 0 ? 4 : 0,
            }}
          />
          {labels && (
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textFaint, fontSize: 9, marginTop: 4 }}>
              {labels[i]}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    ratings: { workout: 5, nutrition: 5, schedule: 5, saham: 5, bisnis: 5, sleep: 5 },
    wins: ['', '', ''],
    improvement: '',
    nextTarget: '',
  });
  const [newMilestone, setNewMilestone] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newIdea, setNewIdea] = useState('');
  const [journalEntry, setJournalEntry] = useState('');

  const statsStore = useStatsStore();
  const nutritionStore = useNutritionStore();
  const workoutStore = useWorkoutStore();
  const scheduleStore = useScheduleStore();
  const { workoutStreak, scheduleStreak, nutritionStreak } = useUserStore();

  const weekDays = getWeekDays();
  const todayKey = getTodayKey();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return formatDate(d);
  });

  const proteinData = last7Days.map(key => nutritionStore.getDailyLog(key)?.totalProtein ?? 0);
  const calorieData = last7Days.map(key => nutritionStore.getDailyLog(key)?.totalCalories ?? 0);
  const scheduleData = last7Days.map(key => (scheduleStore.getDailyStatus(key)?.completionRate ?? 0) * 100);

  const weeklyWorkouts = last7Days.filter(key => workoutStore.getSessionByDate(key)?.completed).length;
  const avgProtein = proteinData.reduce((s, v) => s + v, 0) / 7;
  const avgSchedule = scheduleData.reduce((s, v) => s + v, 0) / 7;

  const dayLabels = weekDays.map(d => d.label.substring(0, 2));

  const achievements = statsStore.achievements;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 0,
          backgroundColor: Colors.bgCard,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 24, marginBottom: 16 }}>
          Statistics
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab(tab);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeTab === tab ? Colors.accent : Colors.bgCard2,
                borderWidth: 1,
                borderColor: activeTab === tab ? Colors.accent : Colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  color: activeTab === tab ? Colors.bgPrimary : Colors.textMuted,
                  fontSize: 13,
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'Overview' && (
          <>
            {/* Streak Cards */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <StatCard label="Workout" value={`${workoutStreak} 🔥`} sub="hari streak" color={Colors.red} />
              <StatCard label="Schedule" value={`${scheduleStreak} 🔥`} sub="hari streak" color={Colors.accent} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <StatCard label="Workout/Minggu" value={`${weeklyWorkouts}/4`} sub="sesi" />
              <StatCard label="Avg Protein" value={`${Math.round(avgProtein)}g`} sub={`target ${PROTEIN_TARGET}g`} color={Colors.orange} />
            </View>
            <StatCard label="Schedule Adherence" value={`${Math.round(avgSchedule)}%`} sub="rata-rata 7 hari" color={Colors.blue} />

            {/* 7-day schedule chart */}
            <Card>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
                Jadwal 7 Hari
              </Text>
              <SimpleBarChart
                data={scheduleData}
                max={100}
                color={Colors.accent}
                labels={dayLabels}
              />
            </Card>

            {/* Protein 7-day chart */}
            <Card>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
                Protein 7 Hari
              </Text>
              <SimpleBarChart
                data={proteinData}
                max={PROTEIN_TARGET}
                color={Colors.orange}
                labels={dayLabels}
              />
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11, marginTop: 6 }}>
                Target garis: {PROTEIN_TARGET}g
              </Text>
            </Card>

            {/* Achievements */}
            <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16 }}>
              Achievements
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {achievements.map((ach) => (
                <View
                  key={ach.id}
                  style={{
                    backgroundColor: ach.unlocked ? Colors.accent + '15' : Colors.bgCard,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: ach.unlocked ? Colors.accent + '50' : Colors.border,
                    padding: 12,
                    width: '47%',
                    opacity: ach.unlocked ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontSize: 20, marginBottom: 4 }}>
                    {ach.unlocked ? '🏆' : '🔒'}
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_700Bold', color: ach.unlocked ? Colors.accent : Colors.textMuted, fontSize: 13 }}>
                    {ach.title}
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textFaint, fontSize: 11, marginTop: 2 }}>
                    {ach.description}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'Body' && (
          <>
            <Card>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
                Input Measurement
              </Text>
              <BodyMeasurementForm statsStore={statsStore} />
            </Card>

            {statsStore.bodyMeasurements.length > 0 && (
              <Card>
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
                  Riwayat
                </Text>
                {statsStore.bodyMeasurements.slice(-5).reverse().map((m, i) => (
                  <View
                    key={i}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: i < 4 ? 1 : 0,
                      borderBottomColor: Colors.border,
                    }}
                  >
                    <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 13 }}>
                      {new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                      {m.weight && (
                        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>
                          ⚖️ {m.weight}kg
                        </Text>
                      )}
                      {m.waist && (
                        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>
                          📏 {m.waist}cm
                        </Text>
                      )}
                      {m.pullupMax && (
                        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>
                          💪 {m.pullupMax} pull-ups
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </Card>
            )}
          </>
        )}

        {activeTab === 'Saham' && (
          <>
            <Card>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
                Jurnal Trading Hari Ini
              </Text>
              <TextInput
                value={journalEntry}
                onChangeText={setJournalEntry}
                placeholder="Analisa, entry, exit, lesson learned..."
                placeholderTextColor={Colors.textFaint}
                multiline
                style={{
                  backgroundColor: Colors.bgCard2,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 12,
                  fontFamily: 'DMSans_400Regular',
                  color: Colors.textPrimary,
                  fontSize: 13,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  marginBottom: 10,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  if (!journalEntry.trim()) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  statsStore.addTradingEntry({
                    id: `te_${Date.now()}`,
                    date: getTodayKey(),
                    content: journalEntry,
                  });
                  setJournalEntry('');
                }}
                style={{
                  backgroundColor: Colors.accent,
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.bgPrimary, fontSize: 14 }}>
                  Simpan Jurnal
                </Text>
              </TouchableOpacity>
            </Card>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <StatCard
                label="Total Hari Analisa"
                value={`${new Set(statsStore.tradingJournal.map(e => e.date)).size}`}
                sub="hari"
                color={Colors.purple}
              />
              <StatCard
                label="Total Entri"
                value={`${statsStore.tradingJournal.length}`}
                sub="jurnal"
              />
            </View>

            {statsStore.tradingJournal.slice(-5).reverse().map((entry) => (
              <Card key={entry.id} variant="card2">
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textMuted, fontSize: 11, marginBottom: 4 }}>
                  {new Date(entry.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textPrimary, fontSize: 13, lineHeight: 20 }}>
                  {entry.content}
                </Text>
              </Card>
            ))}
          </>
        )}

        {activeTab === 'Bisnis' && (
          <>
            {/* Milestones */}
            <Card>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
                Milestones
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <TextInput
                  value={newMilestone}
                  onChangeText={setNewMilestone}
                  placeholder="Tambah milestone..."
                  placeholderTextColor={Colors.textFaint}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.bgCard2,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 10,
                    fontFamily: 'DMSans_400Regular',
                    color: Colors.textPrimary,
                    fontSize: 13,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (!newMilestone.trim()) return;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    statsStore.addMilestone({
                      id: `m_${Date.now()}`,
                      title: newMilestone,
                      status: 'todo',
                      createdAt: getTodayKey(),
                    });
                    setNewMilestone('');
                  }}
                  style={{
                    backgroundColor: Colors.accent,
                    borderRadius: 8,
                    width: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="add" size={20} color={Colors.bgPrimary} />
                </TouchableOpacity>
              </View>

              {(['todo', 'doing', 'done'] as const).map((status) => {
                const items = statsStore.businessMilestones.filter(m => m.status === status);
                if (items.length === 0) return null;
                const statusColors = { todo: Colors.textMuted, doing: Colors.blue, done: Colors.green };
                const statusLabels = { todo: 'TODO', doing: 'DOING', done: 'DONE' };

                return (
                  <View key={status} style={{ marginBottom: 10 }}>
                    <Text style={{ fontFamily: 'DMSans_700Bold', color: statusColors[status], fontSize: 11, marginBottom: 6 }}>
                      {statusLabels[status]}
                    </Text>
                    {items.map((m) => (
                      <View
                        key={m.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            const next = status === 'todo' ? 'doing' : status === 'doing' ? 'done' : 'todo';
                            statsStore.updateMilestoneStatus(m.id, next);
                          }}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            backgroundColor: statusColors[status] + '20',
                            borderWidth: 1,
                            borderColor: statusColors[status],
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Ionicons
                            name={status === 'done' ? 'checkmark' : 'arrow-forward'}
                            size={12}
                            color={statusColors[status]}
                          />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textPrimary, fontSize: 13, flex: 1 }}>
                          {m.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </Card>

            {/* Idea Bank */}
            <Card>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
                💡 Idea Bank
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <TextInput
                  value={newIdea}
                  onChangeText={setNewIdea}
                  placeholder="Tulis ide bisnis..."
                  placeholderTextColor={Colors.textFaint}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.bgCard2,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 10,
                    fontFamily: 'DMSans_400Regular',
                    color: Colors.textPrimary,
                    fontSize: 13,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (!newIdea.trim()) return;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    statsStore.addIdea({
                      id: `idea_${Date.now()}`,
                      date: getTodayKey(),
                      content: newIdea,
                      category: 'bisnis',
                    });
                    setNewIdea('');
                  }}
                  style={{
                    backgroundColor: Colors.purple,
                    borderRadius: 8,
                    width: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="bulb" size={18} color={Colors.bgPrimary} />
                </TouchableOpacity>
              </View>
              {statsStore.ideaBank.slice(-5).reverse().map((idea) => (
                <View
                  key={idea.id}
                  style={{
                    paddingVertical: 8,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                  }}
                >
                  <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textPrimary, fontSize: 13 }}>
                    {idea.content}
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textFaint, fontSize: 11, marginTop: 2 }}>
                    {new Date(idea.date).toLocaleDateString('id-ID')}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {activeTab === 'Review' && (
          <>
            <TouchableOpacity
              onPress={() => setShowWeeklyReview(true)}
              style={{
                backgroundColor: Colors.accent,
                borderRadius: 14,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.bgPrimary, fontSize: 18 }}>
                  Weekly Review
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.bgPrimary + 'cc', fontSize: 13 }}>
                  Evaluasi minggu ini sekarang
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.bgPrimary} />
            </TouchableOpacity>

            {statsStore.weeklyReviews.slice(-3).reverse().map((review, i) => (
              <Card key={review.id}>
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textMuted, fontSize: 11, marginBottom: 8 }}>
                  Minggu {new Date(review.weekStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {Object.entries(review.ratings).map(([key, val]) => (
                    <View
                      key={key}
                      style={{
                        backgroundColor: Colors.bgCard2,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 10 }}>
                        {key}
                      </Text>
                      <Text style={{ fontFamily: 'Syne_700Bold', color: val >= 7 ? Colors.accent : val >= 5 ? Colors.orange : Colors.red, fontSize: 16 }}>
                        {val}/10
                      </Text>
                    </View>
                  ))}
                </View>
                {review.wins.filter(Boolean).length > 0 && (
                  <View>
                    <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.green, fontSize: 12, marginBottom: 4 }}>
                      ✅ Wins
                    </Text>
                    {review.wins.filter(Boolean).map((win, wi) => (
                      <Text key={wi} style={{ fontFamily: 'DMSans_400Regular', color: Colors.textPrimary, fontSize: 13 }}>
                        • {win}
                      </Text>
                    ))}
                  </View>
                )}
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {/* Weekly Review Modal */}
      <Modal visible={showWeeklyReview} animationType="slide" onRequestClose={() => setShowWeeklyReview(false)}>
        <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
          <View
            style={{
              paddingTop: 56,
              paddingHorizontal: 20,
              paddingBottom: 16,
              backgroundColor: Colors.bgCard,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 22 }}>
              Weekly Review
            </Text>
            <TouchableOpacity onPress={() => setShowWeeklyReview(false)}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 60 }}>
            <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16 }}>
              Rating 1-10 untuk area ini:
            </Text>

            {Object.keys(reviewForm.ratings).map((key) => {
              const val = reviewForm.ratings[key as keyof typeof reviewForm.ratings];
              return (
                <View key={key}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 14 }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.accent, fontSize: 18 }}>
                      {val}/10
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <TouchableOpacity
                        key={n}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setReviewForm(prev => ({
                            ...prev,
                            ratings: { ...prev.ratings, [key]: n },
                          }));
                        }}
                        style={{
                          flex: 1,
                          height: 28,
                          borderRadius: 6,
                          backgroundColor: n <= val ? Colors.accent : Colors.bgCard2,
                          borderWidth: 1,
                          borderColor: n <= val ? Colors.accent : Colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'DMMono_400Regular',
                            color: n <= val ? Colors.bgPrimary : Colors.textFaint,
                            fontSize: 10,
                          }}
                        >
                          {n}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}

            <View>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.green, fontSize: 14, marginBottom: 8 }}>
                3 Hal yang berhasil minggu ini:
              </Text>
              {[0, 1, 2].map((i) => (
                <TextInput
                  key={i}
                  value={reviewForm.wins[i]}
                  onChangeText={(v) => {
                    const wins = [...reviewForm.wins];
                    wins[i] = v;
                    setReviewForm(prev => ({ ...prev, wins }));
                  }}
                  placeholder={`Win #${i + 1}...`}
                  placeholderTextColor={Colors.textFaint}
                  style={{
                    backgroundColor: Colors.bgCard,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 12,
                    fontFamily: 'DMSans_400Regular',
                    color: Colors.textPrimary,
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                />
              ))}
            </View>

            <View>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.orange, fontSize: 14, marginBottom: 8 }}>
                1 hal yang perlu diperbaiki:
              </Text>
              <TextInput
                value={reviewForm.improvement}
                onChangeText={(v) => setReviewForm(prev => ({ ...prev, improvement: v }))}
                placeholder="Yang bisa lebih baik..."
                placeholderTextColor={Colors.textFaint}
                style={{
                  backgroundColor: Colors.bgCard,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 12,
                  fontFamily: 'DMSans_400Regular',
                  color: Colors.textPrimary,
                  fontSize: 13,
                }}
              />
            </View>

            <View>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.blue, fontSize: 14, marginBottom: 8 }}>
                Target utama minggu depan:
              </Text>
              <TextInput
                value={reviewForm.nextTarget}
                onChangeText={(v) => setReviewForm(prev => ({ ...prev, nextTarget: v }))}
                placeholder="Satu target konkret..."
                placeholderTextColor={Colors.textFaint}
                style={{
                  backgroundColor: Colors.bgCard,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 12,
                  fontFamily: 'DMSans_400Regular',
                  color: Colors.textPrimary,
                  fontSize: 13,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                const weekStart = getWeekDays()[0].key;
                statsStore.saveWeeklyReview({
                  id: `wr_${Date.now()}`,
                  weekStart,
                  ratings: reviewForm.ratings,
                  wins: reviewForm.wins.filter(Boolean),
                  improvement: reviewForm.improvement,
                  nextTarget: reviewForm.nextTarget,
                });
                setShowWeeklyReview(false);
                setReviewForm({
                  ratings: { workout: 5, nutrition: 5, schedule: 5, saham: 5, bisnis: 5, sleep: 5 },
                  wins: ['', '', ''],
                  improvement: '',
                  nextTarget: '',
                });
              }}
              style={{
                backgroundColor: Colors.accent,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.bgPrimary, fontSize: 16 }}>
                Simpan Review
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function BodyMeasurementForm({ statsStore }: { statsStore: any }) {
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [pullups, setPullups] = useState('');

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11, marginBottom: 4 }}>
            BERAT (kg)
          </Text>
          <TextInput
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 65.5"
            placeholderTextColor={Colors.textFaint}
            style={{
              backgroundColor: Colors.bgCard2,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 10,
              fontFamily: 'DMMono_400Regular',
              color: Colors.textPrimary,
              fontSize: 16,
              textAlign: 'center',
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11, marginBottom: 4 }}>
            PINGGANG (cm)
          </Text>
          <TextInput
            keyboardType="numeric"
            value={waist}
            onChangeText={setWaist}
            placeholder="e.g. 80"
            placeholderTextColor={Colors.textFaint}
            style={{
              backgroundColor: Colors.bgCard2,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 10,
              fontFamily: 'DMMono_400Regular',
              color: Colors.textPrimary,
              fontSize: 16,
              textAlign: 'center',
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11, marginBottom: 4 }}>
            PULL-UP (rep)
          </Text>
          <TextInput
            keyboardType="numeric"
            value={pullups}
            onChangeText={setPullups}
            placeholder="e.g. 8"
            placeholderTextColor={Colors.textFaint}
            style={{
              backgroundColor: Colors.bgCard2,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 10,
              fontFamily: 'DMMono_400Regular',
              color: Colors.textPrimary,
              fontSize: 16,
              textAlign: 'center',
            }}
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          if (!weight && !waist && !pullups) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          statsStore.addBodyMeasurement({
            date: getTodayKey(),
            weight: parseFloat(weight) || undefined,
            waist: parseFloat(waist) || undefined,
            pullupMax: parseInt(pullups) || undefined,
          });
          setWeight('');
          setWaist('');
          setPullups('');
        }}
        style={{
          backgroundColor: Colors.accent,
          borderRadius: 10,
          paddingVertical: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.bgPrimary, fontSize: 14 }}>
          Simpan Measurement
        </Text>
      </TouchableOpacity>
    </View>
  );
}
