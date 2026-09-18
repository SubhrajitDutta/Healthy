import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Search, ChevronDown } from 'lucide-react-native';
import ShopCard from '../components/ShopCard';
import ThemeToggle from '../components/ThemeToggle';
import { DietGoalChip } from '../components/Badges';
import { useTheme } from '../context/ThemeContext';
import { shops, USER_LOCATION } from '../data/mockData';
import { DietGoal } from '../types';

const GOALS: DietGoal[] = ['high-protein', 'low-carb', 'keto', 'vegan', 'muscle-gain', 'weight-loss'];

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeGoal, setActiveGoal] = useState<DietGoal | null>(null);

  const healthyKitchens = useMemo(() => shops.filter((s) => s.type === 'healthy-kitchen'), []);
  const partnerRestaurants = useMemo(() => shops.filter((s) => s.type === 'partner-restaurant'), []);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <View style={styles.locationRow}>
          <MapPin size={18} color={colors.accent} strokeWidth={2.5} />
          <View>
            <Text style={[styles.locationLabel, { color: colors.textFaint }]}>Delivering to</Text>
            <View style={styles.locationValueRow}>
              <Text style={[styles.locationValue, { color: colors.text }]}>
                {USER_LOCATION.label.split(',')[0]}
              </Text>
              <ChevronDown size={14} strokeWidth={3} color={colors.text} />
            </View>
          </View>
        </View>
        <ThemeToggle />
      </View>

      <Text style={[styles.heading, { color: colors.text }]}>
        Eat for your <Text style={{ color: colors.accent }}>goals</Text>,{'\n'}not against them.
      </Text>

      <View style={[styles.searchBar, { borderColor: colors.text, backgroundColor: colors.surface }]}>
        <Search size={16} color={colors.textMuted} />
        <TextInput
          placeholder="Search high-protein bowls, kitchens…"
          placeholderTextColor={colors.textFaint}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalsRow}
      >
        {GOALS.map((g) => (
          <DietGoalChip
            key={g}
            goal={g}
            active={activeGoal === g}
            onPress={() => setActiveGoal(activeGoal === g ? null : g)}
          />
        ))}
      </ScrollView>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Healthy Kitchens</Text>
          <Text style={[styles.sectionNote, { color: colors.accent }]}>Our own · verified nutrition</Text>
        </View>
        <View style={styles.grid}>
          {healthyKitchens.map((shop) => (
            <View key={shop.id} style={styles.gridItem}>
              <ShopCard shop={shop} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Partner restaurants</Text>
        <View style={styles.grid}>
          {partnerRestaurants.map((shop) => (
            <View key={shop.id} style={styles.gridItem}>
              <ShopCard shop={shop} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationLabel: { fontSize: 11, lineHeight: 13 },
  locationValueRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  locationValue: { fontSize: 14, fontWeight: '700' },
  heading: { fontSize: 24, fontWeight: '800', lineHeight: 30, marginTop: 16, paddingHorizontal: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginHorizontal: 16,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13 },
  goalsRow: { gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionNote: { fontSize: 11, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  gridItem: { width: '47%' },
});

export default HomeScreen;
