import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, CategoryColors, CategoryLabels } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { getScheduleForDay } from '../../data/scheduleTemplates';
import type { ScheduleActivity } from '../../data/scheduleTemplates';
import useScheduleStore from '../../stores/scheduleStore';
import { getTodayKey, formatDisplayDate, parseTimeToMinutes, formatDuration } from '../../utils/dateUtils';

type ActivityStatus = 'pending' | 'active' | 'done' | 'skip' | 'late';

const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: Colors.textMuted, icon: 'ellipse-outline' },
  active: { label: 'Aktif', color: Colors.blue, icon: 'play-circle-outline' },
  done: { label: 'Selesai', color: Colors.green, icon: 'checkmark-circle' },
  skip: { label: 'Skip', color: Colors.textFaint, icon: 'remove-circle-outline' },
  late: { label: 'Terlambat', color: Colors.red, icon: 'warning-outline' },
};

const COMPLETION_MESSAGES: Record<string, string> = {
  low: 'Ayo mulai! 🔥',
  mid: 'Setengah jalan 💪',
  good: 'Almost there! ⚡',
  great: 'Tinggal sedikit lagi 🚀',
  perfect: 'PERFECT DAY! 🏆',
};

function getCompletionMessage(rate: number): string {
  if (rate <= 0.3) return COMPLETION_MESSAGES.low;
  if (rate <= 0.6) return COMPLETION_MESSAGES.mid;
  if (rate <= 0.8) return COMPLETION_MESSAGES.good;
  if (rate < 1.0) return COMPLETION_MESSAGES.great;
  return COMPLETION_MESSAGES.perfect;
}

function ActivityCard({
  activity,
  status,
  isActive,
  isPast,
  onPress,
}: {
  activity: ScheduleActivity;
  status: ActivityStatus;
  isActive: boolean;
  isPast: boolean;
  onPress: () => void;
}) {
  const catColor = CategoryColors[activity.category] ?? Colors.textMuted;
  const statusCfg = STATUS_CONFIG[status];

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 2,
      }}
    >
      {/* Time column */}
      <View style={{ width: 52, alignItems: 'flex-end', paddingRight: 12, paddingTop: 14 }}>
        <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.textMuted, fontSize: 11 }}>
          {activity.time}
        </Text>
      </View>

      {/* Line + dot */}
      <View style={{ width: 20, alignItems: 'center' }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: status === 'done' ? catColor : Colors.bgCard2,
            borderWidth: 2,
            borderColor: isActive ? Colors.accent : catColor,
            marginTop: 13,
            zIndex: 1,
          }}
        />
        <View style={{ width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 2 }} />
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          marginLeft: 12,
          marginBottom: 8,
          backgroundColor: isActive ? Colors.bgCard2 : Colors.bgCard,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isActive ? catColor + '60' : Colors.border,
          padding: 12,
          opacity: status === 'skip' ? 0.5 : 1,
        }}
      >
        {/* Category badge */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <View
            style={{
              backgroundColor: catColor + '20',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontFamily: 'DMSans_700Bold', color: catColor, fontSize: 10 }}>
              {CategoryLabels[activity.category] ?? activity.category.toUpperCase()}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textFaint, fontSize: 11 }}>
              {formatDuration(activity.duration)}
            </Text>
            <Ionicons
              name={statusCfg.icon as any}
              size={16}
              color={statusCfg.color}
            />
          </View>
        </View>

        <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 14, marginBottom: 3 }}>
          {activity.title}
        </Text>
        <Text
          style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, lineHeight: 18 }}
          numberOfLines={2}
        >
          {activity.desc}
        </Text>

        {isActive && (
          <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent }} />
            <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.accent, fontSize: 11 }}>
              SEDANG BERJALAN
            </Text>
          </View>
        )}

        {status === 'late' && (
          <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="warning" size={12} color={Colors.red} />
            <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.red, fontSize: 11 }}>
              TERLAMBAT
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ActivityBottomSheet({
  activity,
  status,
  visible,
  onClose,
  onUpdateStatus,
}: {
  activity: ScheduleActivity | null;
  status: ActivityStatus;
  visible: boolean;
  onClose: () => void;
  onUpdateStatus: (s: ActivityStatus, note?: string) => void;
}) {
  const [note, setNote] = useState('');

  if (!activity) return null;
  const catColor = CategoryColors[activity.category] ?? Colors.textMuted;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: '#000000aa' }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: Colors.bgCard,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          padding: 24,
          paddingBottom: 40,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: catColor + '20',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 2,
                alignSelf: 'flex-start',
                marginBottom: 6,
              }}
            >
              <Text style={{ fontFamily: 'DMSans_700Bold', color: catColor, fontSize: 11 }}>
                {activity.time} · {formatDuration(activity.duration)}
              </Text>
            </View>
            <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 18 }}>
              {activity.title}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-circle-outline" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
          {activity.desc}
        </Text>

        <TextInput
          placeholder="Catatan (opsional)..."
          placeholderTextColor={Colors.textFaint}
          value={note}
          onChangeText={setNote}
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
            minHeight: 60,
            marginBottom: 16,
            textAlignVertical: 'top',
          }}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onUpdateStatus('done', note);
              onClose();
            }}
            style={{
              flex: 1,
              backgroundColor: Colors.green,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="checkmark" size={18} color={Colors.bgPrimary} />
            <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.bgPrimary, fontSize: 14 }}>Selesai</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onUpdateStatus('skip', note);
              onClose();
            }}
            style={{
              flex: 1,
              backgroundColor: Colors.bgCard2,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Ionicons name="remove-circle-outline" size={18} color={Colors.textMuted} />
            <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textMuted, fontSize: 14 }}>Skip</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onUpdateStatus('active', note);
            onClose();
          }}
          style={{
            marginTop: 10,
            backgroundColor: Colors.blue + '20',
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: Colors.blue + '40',
          }}
        >
          <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.blue, fontSize: 14 }}>Tandai Sedang Berjalan</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function ScheduleScreen() {
  const [selectedActivity, setSelectedActivity] = useState<ScheduleActivity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const todayKey = getTodayKey();
  const today = new Date();
  const dayOfWeek = today.getDay();

  const scheduleStore = useScheduleStore();
  const activities = getScheduleForDay(dayOfWeek);
  const dailyStatus = scheduleStore.getDailyStatus(todayKey);
  const completionRate = scheduleStore.calculateCompletionRate(todayKey);

  useEffect(() => {
    scheduleStore.initDayIfNeeded(todayKey, activities.map(a => ({ id: a.id })));
  }, [todayKey]);

  // Auto-detect current activity and late
  useEffect(() => {
    const interval = setInterval(() => {
      const nowMinutes = today.getHours() * 60 + today.getMinutes();
      activities.forEach(act => {
        const actMinutes = parseTimeToMinutes(act.time);
        const endMinutes = actMinutes + act.duration;
        const currentStatus = dailyStatus?.activities[act.id]?.status;

        if (
          nowMinutes >= actMinutes &&
          nowMinutes < endMinutes &&
          (!currentStatus || currentStatus === 'pending')
        ) {
          scheduleStore.updateActivityStatus(todayKey, act.id, 'active');
        } else if (
          nowMinutes > actMinutes + 15 &&
          (!currentStatus || currentStatus === 'pending')
        ) {
          scheduleStore.updateActivityStatus(todayKey, act.id, 'late');
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [dailyStatus, activities, todayKey]);

  const getActivityStatus = (id: string): ActivityStatus =>
    (dailyStatus?.activities[id]?.status as ActivityStatus) ?? 'pending';

  const getCurrentActivityId = (): string | null => {
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    for (const act of activities) {
      const startMin = parseTimeToMinutes(act.time);
      const endMin = startMin + act.duration;
      if (nowMinutes >= startMin && nowMinutes < endMin) return act.id;
    }
    return null;
  };

  const currentActivityId = getCurrentActivityId();
  const doneCount = activities.filter(a => getActivityStatus(a.id) === 'done').length;
  const completionPct = Math.round(completionRate * 100);

  const progressBarColor = completionPct >= 80 ? Colors.accent : completionPct >= 50 ? Colors.orange : Colors.red;

  const handleUpdateStatus = (status: ActivityStatus, note?: string) => {
    if (!selectedActivity) return;
    scheduleStore.updateActivityStatus(todayKey, selectedActivity.id, status, note);
  };

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
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 24, marginBottom: 4 }}>
          Jadwal Harian
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 13, marginBottom: 12 }}>
          {formatDisplayDate(today)}
        </Text>

        {/* Progress bar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 13 }}>
            {doneCount} / {activities.length} selesai
          </Text>
          <Text style={{ fontFamily: 'Syne_700Bold', color: progressBarColor, fontSize: 18 }}>
            {completionPct}%
          </Text>
        </View>

        <View style={{ height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' }}>
          <View
            style={{
              height: 6,
              backgroundColor: progressBarColor,
              borderRadius: 3,
              width: `${completionPct}%` as any,
            }}
          />
        </View>

        <Text style={{ fontFamily: 'DMSans_700Bold', color: progressBarColor, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
          {getCompletionMessage(completionRate)}
        </Text>
      </View>

      {/* Timeline */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40, paddingRight: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {activities.map((activity) => {
          const status = getActivityStatus(activity.id);
          const isActive = activity.id === currentActivityId || status === 'active';
          const nowMin = today.getHours() * 60 + today.getMinutes();
          const actMin = parseTimeToMinutes(activity.time);
          const isPast = nowMin >= actMin;

          return (
            <ActivityCard
              key={activity.id}
              activity={activity}
              status={status}
              isActive={isActive}
              isPast={isPast}
              onPress={() => {
                setSelectedActivity(activity);
                setSheetVisible(true);
              }}
            />
          );
        })}

        {/* Quick Stats */}
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <Card variant="card2">
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.accent, fontSize: 24 }}>
                  {doneCount}
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11 }}>Selesai</Text>
              </View>
              <View style={{ width: 1, backgroundColor: Colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.orange, fontSize: 24 }}>
                  {activities.filter(a => getActivityStatus(a.id) === 'skip').length}
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11 }}>Skip</Text>
              </View>
              <View style={{ width: 1, backgroundColor: Colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.blue, fontSize: 24 }}>
                  {activities.filter(a => ['pending', 'active'].includes(getActivityStatus(a.id))).length}
                </Text>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11 }}>Tersisa</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <ActivityBottomSheet
        activity={selectedActivity}
        status={selectedActivity ? getActivityStatus(selectedActivity.id) : 'pending'}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </View>
  );
}
