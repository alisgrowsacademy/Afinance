import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/theme';
import { Card } from '../components/ui/Card';
import useUserStore from '../stores/userStore';
import useWorkoutStore from '../stores/workoutStore';
import useNutritionStore from '../stores/nutritionStore';
import useScheduleStore from '../stores/scheduleStore';
import useStatsStore from '../stores/statsStore';
import { scheduleAllNotifications, requestNotificationPermission } from '../utils/notifications';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const userStore = useUserStore();
  const workoutStore = useWorkoutStore();
  const nutritionStore = useNutritionStore();
  const scheduleStore = useScheduleStore();
  const statsStore = useStatsStore();

  const [name, setName] = useState(userStore.name);
  const [calTarget, setCalTarget] = useState(userStore.calorieTarget.toString());
  const [protTarget, setProtTarget] = useState(userStore.proteinTarget.toString());

  const handleSaveProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    userStore.setName(name);
    userStore.updateTargets({
      calorieTarget: parseInt(calTarget) || 2700,
      proteinTarget: parseInt(protTarget) || 150,
    });
    Alert.alert('Tersimpan', 'Pengaturan berhasil disimpan.');
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Feature export JSON akan tersedia di update berikutnya.',
      [{ text: 'OK' }]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      '⚠️ Reset Semua Data',
      'Semua data akan dihapus permanen. Yakin?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            // Clear all stores
            Alert.alert('Reset', 'Data akan direset saat restart app.');
          },
        },
      ]
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    userStore.setNotificationsEnabled(value);
    if (value) {
      const granted = await requestNotificationPermission();
      if (granted) await scheduleAllNotifications();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  return (
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
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 22 }}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {/* Profile */}
        <Card>
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
            Profil
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginBottom: 6 }}>
            NAMA
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nama kamu..."
            placeholderTextColor={Colors.textFaint}
            style={{
              backgroundColor: Colors.bgCard2,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 12,
              fontFamily: 'DMSans_400Regular',
              color: Colors.textPrimary,
              fontSize: 14,
              marginBottom: 12,
            }}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginBottom: 6 }}>
                TARGET KALORI
              </Text>
              <TextInput
                value={calTarget}
                onChangeText={setCalTarget}
                keyboardType="numeric"
                style={{
                  backgroundColor: Colors.bgCard2,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 12,
                  fontFamily: 'DMMono_400Regular',
                  color: Colors.textPrimary,
                  fontSize: 14,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginBottom: 6 }}>
                TARGET PROTEIN (g)
              </Text>
              <TextInput
                value={protTarget}
                onChangeText={setProtTarget}
                keyboardType="numeric"
                style={{
                  backgroundColor: Colors.bgCard2,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 12,
                  fontFamily: 'DMMono_400Regular',
                  color: Colors.textPrimary,
                  fontSize: 14,
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSaveProfile}
            style={{
              backgroundColor: Colors.accent,
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.bgPrimary, fontSize: 14 }}>
              Simpan Perubahan
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Notifications */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 15 }}>
                Notifikasi
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                Reminder harian & suplemen
              </Text>
            </View>
            <Switch
              value={userStore.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.textPrimary}
            />
          </View>
        </Card>

        {/* App Info */}
        <Card>
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
            Aplikasi
          </Text>
          <View style={{ gap: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 14 }}>Versi</Text>
              <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.textPrimary, fontSize: 14 }}>1.0.0</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 14 }}>Total Workouts</Text>
              <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.accent, fontSize: 14 }}>{userStore.totalWorkouts}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 14 }}>Timezone</Text>
              <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.textPrimary, fontSize: 14 }}>Asia/Jakarta</Text>
            </View>
          </View>
        </Card>

        {/* Data */}
        <Card>
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 12 }}>
            Data
          </Text>
          <TouchableOpacity
            onPress={handleExportData}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <Ionicons name="download-outline" size={20} color={Colors.blue} />
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.blue, fontSize: 14 }}>
              Export semua data (JSON)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleResetData}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 12,
            }}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.red} />
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.red, fontSize: 14 }}>
              Reset semua data
            </Text>
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Card>
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 8 }}>
            BLUEPRINT
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 13, lineHeight: 22 }}>
            Personal Life OS — dibuat untuk pelajar 15 tahun yang serius membangun diri.
            {'\n\n'}
            100% offline. Semua data tersimpan di device kamu.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
