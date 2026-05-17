import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import useNutritionStore, {
  CALORIE_TARGET,
  PROTEIN_TARGET,
  CARBS_TARGET,
  FAT_TARGET,
  HYDRATION_TARGET,
} from '../../stores/nutritionStore';
import { SUPPLEMENTS } from '../../data/supplements';
import { FOOD_DATABASE } from '../../data/foodDatabase';
import type { FoodItem } from '../../stores/nutritionStore';
import { getTodayKey } from '../../utils/dateUtils';

const MEAL_TIMES = [
  { id: 'sarapan', label: '🌅 Sarapan', time: '05:15', target: 620 },
  { id: 'snack_pagi', label: '☕ Snack Pagi', time: '10:00', target: 320 },
  { id: 'makan_siang', label: '🍽️ Makan Siang', time: '12:30', target: 680 },
  { id: 'pre_workout', label: '⚡ Pre-Workout', time: '16:00', target: 380 },
  { id: 'post_workout', label: '💪 Post-Workout', time: '18:30', target: 700 },
  { id: 'makan_malam', label: '🌙 Makan Malam', time: '19:30', target: 0 },
];

function MacroRing({
  label,
  current,
  target,
  unit,
  color,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}) {
  const progress = Math.min(current / target, 1.2);
  const ringColor =
    progress >= 0.8 ? Colors.accent : progress >= 0.5 ? Colors.orange : Colors.red;

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <ProgressRing size={68} strokeWidth={7} progress={progress} color={ringColor}>
        <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.textPrimary, fontSize: 11 }}>
          {Math.round(current)}
        </Text>
      </ProgressRing>
      <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 12 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 10 }}>
        /{target}{unit}
      </Text>
    </View>
  );
}

function FoodSearchModal({
  visible,
  mealTime,
  onClose,
  onAdd,
}: {
  visible: boolean;
  mealTime: string;
  onClose: () => void;
  onAdd: (food: FoodItem, qty: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [qty, setQty] = useState('1');
  const [selected, setSelected] = useState<FoodItem | null>(null);

  const filtered = FOOD_DATABASE.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 30);

  const handleAdd = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAdd(selected, parseFloat(qty) || 1);
    setQuery('');
    setQty('1');
    setSelected(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }}>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 20 }}>
              Tambah Makanan
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari makanan..."
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
            }}
            autoFocus
          />
        </View>

        {selected ? (
          <View style={{ padding: 20 }}>
            <Card style={{ marginBottom: 16 }}>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 18, marginBottom: 4 }}>
                {selected.name}
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 13, marginBottom: 12 }}>
                {selected.calories} kkal · P:{selected.protein}g · K:{selected.carbs}g · L:{selected.fat}g
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 14 }}>
                  Porsi ({selected.unit}):
                </Text>
                <TextInput
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
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
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setSelected(null)}
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
                  <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textMuted, fontSize: 14 }}>Kembali</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAdd}
                  style={{
                    flex: 2,
                    backgroundColor: Colors.accent,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.bgPrimary, fontSize: 14 }}>Tambahkan</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelected(item);
                  setQty('1');
                }}
                style={{
                  backgroundColor: Colors.bgCard,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  padding: 12,
                  marginBottom: 6,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 14 }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>
                    {item.unit} · P: {item.protein}g
                  </Text>
                </View>
                <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.accent, fontSize: 14 }}>
                  {item.calories} kkal
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

export default function NutritionScreen() {
  const [activeTab, setActiveTab] = useState<'makro' | 'makan' | 'suplemen' | 'hidrasi'>('makro');
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [selectedMealTime, setSelectedMealTime] = useState('sarapan');
  const todayKey = getTodayKey();

  const nutritionStore = useNutritionStore();
  const dailyLog = nutritionStore.getDailyLog(todayKey);
  const hydration = nutritionStore.getHydration(todayKey);
  const supplementLog = nutritionStore.supplementLogs[todayKey];

  const calories = dailyLog?.totalCalories ?? 0;
  const protein = dailyLog?.totalProtein ?? 0;
  const carbs = dailyLog?.totalCarbs ?? 0;
  const fat = dailyLog?.totalFat ?? 0;

  const handleAddFood = (food: FoodItem, qty: number) => {
    nutritionStore.addFoodEntry(todayKey, {
      id: `${food.id}_${Date.now()}`,
      name: food.name,
      calories: Math.round(food.calories * qty),
      protein: Math.round(food.protein * qty * 10) / 10,
      carbs: Math.round(food.carbs * qty * 10) / 10,
      fat: Math.round(food.fat * qty * 10) / 10,
      quantity: qty,
      unit: food.unit,
      mealTime: selectedMealTime,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const calPct = calories / CALORIE_TARGET;
  const proteinPct = protein / PROTEIN_TARGET;
  const hydrationPct = hydration / HYDRATION_TARGET;

  const hydrationColor =
    hydrationPct >= 0.8 ? Colors.blue : hydrationPct >= 0.5 ? Colors.orange : Colors.red;

  const tabs = [
    { id: 'makro', label: 'Makro' },
    { id: 'makan', label: 'Makan' },
    { id: 'suplemen', label: 'Suplemen' },
    { id: 'hidrasi', label: 'Hidrasi' },
  ] as const;

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
          Nutrisi
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab(tab.id);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeTab === tab.id ? Colors.accent : Colors.bgCard2,
                borderWidth: 1,
                borderColor: activeTab === tab.id ? Colors.accent : Colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans_700Bold',
                  color: activeTab === tab.id ? Colors.bgPrimary : Colors.textMuted,
                  fontSize: 13,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'makro' && (
          <>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 18 }}>
                  Kalori Hari Ini
                </Text>
                <Text
                  style={{
                    fontFamily: 'Syne_700Bold',
                    color: calPct >= 0.8 ? Colors.accent : calPct >= 0.5 ? Colors.orange : Colors.red,
                    fontSize: 22,
                  }}
                >
                  {Math.round(calories)}
                </Text>
              </View>

              <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 4, marginBottom: 6 }}>
                <View
                  style={{
                    height: 8,
                    backgroundColor: calPct >= 0.8 ? Colors.accent : calPct >= 0.5 ? Colors.orange : Colors.red,
                    borderRadius: 4,
                    width: `${Math.min(calPct * 100, 100)}%` as any,
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>
                  {Math.round(calories)} dari {CALORIE_TARGET} kkal
                </Text>
                <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textMuted, fontSize: 12 }}>
                  Sisa: {Math.max(0, CALORIE_TARGET - Math.round(calories))} kkal
                </Text>
              </View>
            </Card>

            <Card>
              <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 16, marginBottom: 16 }}>
                Makronutrisi
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <MacroRing label="Protein" current={protein} target={PROTEIN_TARGET} unit="g" color={Colors.red} />
                <MacroRing label="Karbo" current={carbs} target={CARBS_TARGET} unit="g" color={Colors.orange} />
                <MacroRing label="Lemak" current={fat} target={FAT_TARGET} unit="g" color={Colors.purple} />
              </View>
            </Card>
          </>
        )}

        {activeTab === 'makan' && (
          <>
            {MEAL_TIMES.map((meal) => {
              const entries = dailyLog?.entries.filter(e => e.mealTime === meal.id) ?? [];
              const mealCals = entries.reduce((sum, e) => sum + e.calories, 0);

              return (
                <Card key={meal.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View>
                      <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 15 }}>
                        {meal.label}
                      </Text>
                      <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }}>
                        {meal.time} · Target ~{meal.target > 0 ? meal.target : 'flex'} kkal
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.accent, fontSize: 16 }}>
                        {mealCals} kkal
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedMealTime(meal.id);
                          setFoodModalVisible(true);
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
                      >
                        <Ionicons name="add-circle-outline" size={14} color={Colors.blue} />
                        <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.blue, fontSize: 12 }}>
                          Tambah
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {entries.map(entry => (
                    <View
                      key={entry.id}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingVertical: 6,
                        borderTopWidth: 1,
                        borderTopColor: Colors.border,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textPrimary, fontSize: 13 }}>
                          {entry.name} ({entry.quantity}{entry.unit})
                        </Text>
                        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 11 }}>
                          P:{entry.protein}g K:{entry.carbs}g L:{entry.fat}g
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontFamily: 'DMMono_400Regular', color: Colors.textPrimary, fontSize: 13 }}>
                          {entry.calories} kkal
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            nutritionStore.removeFoodEntry(todayKey, entry.id);
                          }}
                        >
                          <Ionicons name="trash-outline" size={14} color={Colors.red} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </Card>
              );
            })}
          </>
        )}

        {activeTab === 'suplemen' && (
          <>
            <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 13 }}>
              Tap suplemen untuk tandai sudah minum
            </Text>
            {SUPPLEMENTS.map((supp) => {
              const taken = supplementLog?.taken[supp.id] ?? false;
              const statusColors = {
                punya: Colors.green,
                restock: Colors.red,
                beli: Colors.orange,
                nanti: Colors.textFaint,
              };

              return (
                <TouchableOpacity
                  key={supp.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    nutritionStore.logSupplement(todayKey, supp.id, !taken);
                  }}
                >
                  <Card
                    style={{
                      borderColor: taken ? Colors.green + '60' : Colors.border,
                      backgroundColor: taken ? Colors.green + '08' : Colors.bgCard,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: taken ? Colors.green + '20' : Colors.bgCard2,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name={taken ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={taken ? Colors.green : Colors.textMuted}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 14 }}>
                            {supp.name}
                          </Text>
                          <View
                            style={{
                              backgroundColor: statusColors[supp.status] + '20',
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: 'DMSans_700Bold',
                                color: statusColors[supp.status],
                                fontSize: 10,
                              }}
                            >
                              {supp.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
                          {supp.dose} · {supp.times.join(', ')}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {activeTab === 'hidrasi' && (
          <>
            <Card style={{ alignItems: 'center', padding: 24 }}>
              <ProgressRing
                size={120}
                strokeWidth={12}
                progress={hydrationPct}
                color={hydrationColor}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 22 }}>
                    {(hydration / 1000).toFixed(1)}L
                  </Text>
                  <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 10 }}>
                    dari 3L
                  </Text>
                </View>
              </ProgressRing>
              <Text style={{ fontFamily: 'DMSans_700Bold', color: hydrationColor, fontSize: 14, marginTop: 12 }}>
                {hydrationPct >= 1 ? 'Target tercapai! 🎉' : `Kurang ${((HYDRATION_TARGET - hydration) / 1000).toFixed(1)}L lagi`}
              </Text>
            </Card>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[250, 500, 750].map((ml) => (
                <TouchableOpacity
                  key={ml}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    nutritionStore.addHydration(todayKey, ml);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: Colors.bgCard,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: Colors.blue + '40',
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>💧</Text>
                  <Text style={{ fontFamily: 'DMSans_700Bold', color: Colors.blue, fontSize: 14, marginTop: 4 }}>
                    +{ml}ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {hydration > 0 && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  nutritionStore.addHydration(todayKey, -250);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8 }}
              >
                <Ionicons name="remove-circle-outline" size={16} color={Colors.textFaint} />
                <Text style={{ fontFamily: 'DMSans_400Regular', color: Colors.textFaint, fontSize: 12 }}>
                  Koreksi -250ml
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      <FoodSearchModal
        visible={foodModalVisible}
        mealTime={selectedMealTime}
        onClose={() => setFoodModalVisible(false)}
        onAdd={handleAddFood}
      />
    </View>
  );
}
