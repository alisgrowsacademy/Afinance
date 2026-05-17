import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import useNutritionStore from '../../stores/nutritionStore';
import { FOOD_DATABASE } from '../../data/foodDatabase';
import { getTodayKey } from '../../utils/dateUtils';

export default function QuickLogModal() {
  const [query, setQuery] = useState('');
  const [qty, setQty] = useState('1');
  const nutritionStore = useNutritionStore();
  const todayKey = getTodayKey();

  const filtered = FOOD_DATABASE.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
      <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border }} />
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 22 }}>
          Quick Log Makan
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle-outline" size={24} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cari makanan..."
          placeholderTextColor={Colors.textFaint}
          autoFocus
          style={{
            backgroundColor: Colors.bgCard,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 14,
            fontFamily: 'DMSans_400Regular',
            color: Colors.textPrimary,
            fontSize: 14,
          }}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {filtered.map((food) => (
          <TouchableOpacity
            key={food.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              nutritionStore.addFoodEntry(todayKey, {
                id: `${food.id}_${Date.now()}`,
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                quantity: 1,
                unit: food.unit,
                mealTime: 'snack_pagi',
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              });
              router.back();
            }}
            style={{
              backgroundColor: Colors.bgCard,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 14,
              marginBottom: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 14 }}>
                {food.name}
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                P: {food.protein}g · {food.unit}
              </Text>
            </View>
            <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.accent, fontSize: 16 }}>
              {food.calories} kkal
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
