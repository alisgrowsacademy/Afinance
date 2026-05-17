import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/theme';
import useUserStore from '../stores/userStore';
import { requestNotificationPermission, scheduleAllNotifications } from '../utils/notifications';
import { getTodayKey } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🔥',
    title: 'Selamat datang di BLUEPRINT',
    desc: 'Personal Life OS kamu — satu app untuk semua: workout, nutrisi, jadwal, saham, dan bisnis.',
  },
  {
    emoji: '💪',
    title: 'Program Body Recomp',
    desc: 'Pull, Push, Legs, dan Upper split sudah pre-loaded. Tinggal mulai, log, dan pantau progressmu.',
  },
  {
    emoji: '🥗',
    title: 'Target 150g Protein/Hari',
    desc: 'Track kalori dan makromu setiap hari. Database makanan Indonesia sudah tersedia.',
  },
  {
    emoji: '📅',
    title: 'Jadwal Harian Disiplin',
    desc: 'Dari jam 05:00 sampai 22:00 — setiap menit terencana. Tinggal eksekusi.',
  },
  {
    emoji: '📈',
    title: 'Saham & Bisnis',
    desc: 'Jurnal trading, milestone bisnis, dan idea bank. Build your empire dari sekarang.',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const { setName: saveName, completeOnboarding, setAppStartDate } = useUserStore();

  const isLastSlide = step === SLIDES.length - 1;
  const isNameStep = step === SLIDES.length;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLastSlide) {
      setStep(SLIDES.length);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (name) saveName(name);
    setAppStartDate(getTodayKey());
    completeOnboarding();
    const granted = await requestNotificationPermission();
    if (granted) await scheduleAllNotifications();
    router.replace('/(tabs)');
  };

  const slide = SLIDES[step];

  if (isNameStep) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary, padding: 32, justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.accent, fontSize: 32, marginBottom: 8 }}>
          Siapa namamu?
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 15, marginBottom: 32, lineHeight: 24 }}>
          Opsional — tapi biar greetingnya lebih personal.
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nama kamu..."
          placeholderTextColor={Colors.textFaint}
          style={{
            backgroundColor: Colors.bgCard,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 16,
            fontFamily: 'DMSans_400Regular',
            color: Colors.textPrimary,
            fontSize: 18,
            marginBottom: 24,
          }}
          autoFocus
        />
        <TouchableOpacity
          onPress={handleFinish}
          style={{
            backgroundColor: Colors.accent,
            borderRadius: 14,
            paddingVertical: 18,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.bgPrimary, fontSize: 18 }}>
            Mulai Blueprint! 🚀
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleFinish}
          style={{ alignItems: 'center', padding: 16 }}
        >
          <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 14 }}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ fontSize: 80, marginBottom: 32 }}>{slide.emoji}</Text>
        <Text
          style={{
            fontFamily: 'Syne_800ExtraBold',
            color: Colors.textPrimary,
            fontSize: 28,
            textAlign: 'center',
            marginBottom: 16,
            lineHeight: 36,
          }}
        >
          {slide.title}
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans_400Regular',
            color: Colors.textMuted,
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 26,
          }}
        >
          {slide.desc}
        </Text>
      </View>

      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === step ? 24 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === step ? Colors.accent : Colors.border,
            }}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 48, flexDirection: 'row', gap: 12 }}>
        {step > 0 && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setStep(prev => prev - 1);
            }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: Colors.bgCard,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            flex: 1,
            backgroundColor: Colors.accent,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.bgPrimary, fontSize: 16 }}>
            {isLastSlide ? 'Siap!' : 'Lanjut'}
          </Text>
          {!isLastSlide && <Ionicons name="arrow-forward" size={18} color={Colors.bgPrimary} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
