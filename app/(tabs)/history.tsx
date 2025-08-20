import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, TrendingUp, MapPin, Clock, Filter } from 'lucide-react-native';
import { useState } from 'react';

const { width } = Dimensions.get('window');

interface RunData {
  id: string;
  date: string;
  distance: number;
  duration: string;
  pace: string;
  calories: number;
  type: 'easy' | 'interval' | 'long' | 'tempo';
}

const mockRuns: RunData[] = [
  {
    id: '1',
    date: 'Aujourd\'hui',
    distance: 5.2,
    duration: '24:38',
    pace: '4:45',
    calories: 312,
    type: 'easy',
  },
  {
    id: '2',
    date: 'Hier',
    distance: 7.8,
    duration: '32:54',
    pace: '4:12',
    calories: 468,
    type: 'interval',
  },
  {
    id: '3',
    date: 'Lundi',
    distance: 10.5,
    duration: '52:30',
    pace: '5:00',
    calories: 630,
    type: 'long',
  },
  {
    id: '4',
    date: 'Samedi',
    distance: 6.2,
    duration: '28:45',
    pace: '4:38',
    calories: 372,
    type: 'tempo',
  },
  {
    id: '5',
    date: 'Vendredi',
    distance: 4.8,
    duration: '22:16',
    pace: '4:38',
    calories: 288,
    type: 'easy',
  },
];

export default function HistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const getRunTypeColor = (type: string) => {
    switch (type) {
      case 'easy': return '#10B981';
      case 'interval': return '#F97316';
      case 'long': return '#3B82F6';
      case 'tempo': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getRunTypeLabel = (type: string) => {
    switch (type) {
      case 'easy': return 'Facile';
      case 'interval': return 'Fractionné';
      case 'long': return 'Longue';
      case 'tempo': return 'Tempo';
      default: return 'Course';
    }
  };

  const totalDistance = mockRuns.reduce((acc, run) => acc + run.distance, 0);
  const totalRuns = mockRuns.length;
  const averagePace = '4:42';

  const weeklyStats = [
    { label: 'Distance totale', value: `${totalDistance.toFixed(1)} km`, icon: MapPin, color: '#3B82F6' },
    { label: 'Nombre de courses', value: `${totalRuns}`, icon: TrendingUp, color: '#F97316' },
    { label: 'Allure moyenne', value: `${averagePace} min/km`, icon: Clock, color: '#10B981' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Historique</Text>
            <Text style={styles.headerSubtitle}>Cette semaine</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        <View style={styles.statsContainer}>
          {weeklyStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
                <stat.icon size={20} color={stat.color} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress Chart Placeholder */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Progression hebdomadaire</Text>
            <TouchableOpacity>
              <Text style={styles.viewDetailsText}>Détails</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartPlaceholder}>
            <TrendingUp size={48} color="#64748B" strokeWidth={1.5} />
            <Text style={styles.chartText}>Graphique de progression</Text>
            <Text style={styles.chartSubtext}>Visualisez vos performances au fil du temps</Text>
          </View>
        </View>

        {/* Run History List */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Courses récentes</Text>
          
          {mockRuns.map((run) => (
            <TouchableOpacity key={run.id} style={styles.runCard}>
              <View style={styles.runHeader}>
                <View style={styles.runTypeContainer}>
                  <View style={[styles.runTypeDot, { backgroundColor: getRunTypeColor(run.type) }]} />
                  <Text style={styles.runType}>{getRunTypeLabel(run.type)}</Text>
                </View>
                <Text style={styles.runDate}>{run.date}</Text>
              </View>
              
              <View style={styles.runContent}>
                <View style={styles.runMainStats}>
                  <Text style={styles.runDistance}>{run.distance} km</Text>
                  <View style={styles.runDivider} />
                  <View style={styles.runTimeInfo}>
                    <Clock size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.runDuration}>{run.duration}</Text>
                  </View>
                </View>
                
                <View style={styles.runSecondaryStats}>
                  <View style={styles.runStatItem}>
                    <Text style={styles.runStatLabel}>Allure</Text>
                    <Text style={styles.runStatValue}>{run.pace} min/km</Text>
                  </View>
                  <View style={styles.runStatItem}>
                    <Text style={styles.runStatLabel}>Calories</Text>
                    <Text style={styles.runStatValue}>{run.calories} cal</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Load More Button */}
        <TouchableOpacity style={styles.loadMoreButton}>
          <Text style={styles.loadMoreText}>Voir plus de courses</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  historySection: {
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  runCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  runHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  runTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  runType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  runDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  runContent: {
    gap: 12,
  },
  runMainStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runDistance: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  runDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  runTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  runDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  runSecondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  runStatItem: {
    flex: 1,
  },
  runStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  runStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  loadMoreButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});