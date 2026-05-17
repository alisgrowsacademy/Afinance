import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import useStatsStore from '../../stores/statsStore';
import { getTodayKey, formatDisplayDate } from '../../utils/dateUtils';

const MOODS = ['😫', '😕', '😐', '🙂', '😄'];

export default function JournalModal() {
  const [accomplished, setAccomplished] = useState('');
  const [improve, setImprove] = useState('');
  const [target, setTarget] = useState('');
  const [mood, setMood] = useState(3);

  const statsStore = useStatsStore();
  const todayKey = getTodayKey();

  const handleSave = () => {
    if (!accomplished && !improve && !target) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    statsStore.addTradingEntry({
      id: `j_${Date.now()}`,
      date: todayKey,
      content: `[JURNAL HARIAN]\nAchieved: ${accomplished}\nImprove: ${improve}\nTarget besok: ${target}\nMood: ${MOODS[mood - 1]}`,
    });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      {/* Handle bar */}
      <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border }} />
      </View>

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 22 }}>
            Refleksi Harian
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 13 }}>
            {formatDisplayDate(new Date())}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 4 }}
        >
          <Ionicons name="close-circle-outline" size={24} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 60 }}>
        {/* Mood */}
        <View
          style={{
            backgroundColor: Colors.bgCard,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 16,
          }}
        >
          <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textMuted, fontSize: 12, marginBottom: 12 }}>
            MOOD HARI INI
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {MOODS.map((emoji, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  Haptics.selectionAsync();
                  setMood(i + 1);
                }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: mood === i + 1 ? Colors.accent + '20' : Colors.bgCard2,
                  borderWidth: 2,
                  borderColor: mood === i + 1 ? Colors.accent : Colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {[
          { label: '✅ Yang berhasil hari ini:', value: accomplished, setter: setAccomplished, placeholder: 'Apa yang kamu capai hari ini?' },
          { label: '🔧 Yang bisa lebih baik:', value: improve, setter: setImprove, placeholder: 'Apa yang perlu diperbaiki?' },
          { label: '🎯 Target konkret besok:', value: target, setter: setTarget, placeholder: 'Satu hal yang wajib diselesaikan besok...' },
        ].map((item) => (
          <View
            key={item.label}
            style={{
              backgroundColor: Colors.bgCard,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 16,
            }}
          >
            <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 14, marginBottom: 10 }}>
              {item.label}
            </Text>
            <TextInput
              value={item.value}
              onChangeText={item.setter}
              placeholder={item.placeholder}
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
                fontSize: 14,
                minHeight: 80,
                textAlignVertical: 'top',
                lineHeight: 22,
              }}
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: Colors.accent,
            borderRadius: 14,
            paddingVertical: 18,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Ionicons name="save-outline" size={20} color={Colors.bgPrimary} />
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.bgPrimary, fontSize: 16 }}>
            Simpan Jurnal
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
