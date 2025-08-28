import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, TrendingUp, MapPin, Clock, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { useRunData, TimePeriod } from '../../hooks/useRunData';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const { 
    runs, 
    loading, 
    getStatsForPeriod, 
    getRunsForPeriod, 
    formatDuration, 
    getPeriodLabel 
  } = useRunData();
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);

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

  // Obtenir les statistiques pour la période sélectionnée
  const currentStats = getStatsForPeriod(selectedPeriod, currentDate);
  const currentRuns = getRunsForPeriod(selectedPeriod, currentDate);

  const periodStats = [
    { 
      label: 'Distance totale', 
      value: `${currentStats.totalDistance.toFixed(1)} km`, 
      icon: MapPin, 
      color: '#3B82F6' 
    },
    { 
      label: 'Nombre de courses', 
      value: `${currentStats.totalRuns}`, 
      icon: TrendingUp, 
      color: '#F97316' 
    },
    { 
      label: 'Allure moyenne', 
      value: `${currentStats.averagePace} min/km`, 
      icon: Clock, 
      color: '#10B981' 
    },
  ];

  // Fonctions de navigation dans le temps
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (selectedPeriod) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const periodOptions: Array<{key: TimePeriod, label: string}> = [
    { key: 'day', label: 'Jour' },
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
    { key: 'year', label: 'Année' },
  ];

  // Formater la date d'affichage pour les courses
  const formatRunDate = (dateString: string) => {
    const runDate = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - runDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return runDate.toLocaleDateString('fr-FR', { weekday: 'long' });
    
    return runDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Historique</Text>
            <TouchableOpacity 
              style={styles.periodSelector}
              onPress={() => setShowPeriodSelector(!showPeriodSelector)}
            >
              <Text style={styles.periodText}>
                {periodOptions.find(p => p.key === selectedPeriod)?.label}
              </Text>
              <ChevronDown size={16} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Period Selector Dropdown */}
        {showPeriodSelector && (
          <View style={styles.periodDropdown}>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.periodOption,
                  selectedPeriod === option.key && styles.periodOptionSelected
                ]}
                onPress={() => {
                  setSelectedPeriod(option.key);
                  setShowPeriodSelector(false);
                }}
              >
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === option.key && styles.periodOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Period Navigation */}
        <View style={styles.periodNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigatePeriod('prev')}
          >
            <ChevronLeft size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.periodLabel}>
            <Text style={styles.periodLabelText}>
              {getPeriodLabel(selectedPeriod, currentDate)}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigatePeriod('next')}
          >
            <ChevronRight size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Period Stats */}
        <View style={styles.statsContainer}>
          {periodStats.map((stat, index) => (
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
          <Text style={styles.sectionTitle}>
            Courses de la {periodOptions.find(p => p.key === selectedPeriod)?.label.toLowerCase()}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : currentRuns.length === 0 ? (
            <View style={styles.emptyContainer}>
              <TrendingUp size={48} color="#94A3B8" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Aucune course</Text>
              <Text style={styles.emptyText}>
                Pas de courses pour cette {periodOptions.find(p => p.key === selectedPeriod)?.label.toLowerCase()}
              </Text>
            </View>
          ) : (
            currentRuns.map((run) => (
              <TouchableOpacity key={run.id} style={styles.runCard}>
                <View style={styles.runHeader}>
                  <View style={styles.runTypeContainer}>
                    <View style={[styles.runTypeDot, { backgroundColor: getRunTypeColor(run.type) }]} />
                    <Text style={styles.runType}>{getRunTypeLabel(run.type)}</Text>
                  </View>
                  <Text style={styles.runDate}>{formatRunDate(run.date)}</Text>
                </View>
                
                <View style={styles.runContent}>
                  <View style={styles.runMainStats}>
                    <Text style={styles.runDistance}>{run.distance.toFixed(1)} km</Text>
                    <View style={styles.runDivider} />
                    <View style={styles.runTimeInfo}>
                      <Clock size={16} color="#6B7280" strokeWidth={2} />
                      <Text style={styles.runDuration}>{formatDuration(run.duration)}</Text>
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
            ))
          )}
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 6,
  },
  periodDropdown: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1000,
  },
  periodOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  periodOptionSelected: {
    backgroundColor: '#EBF4FF',
  },
  periodOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  periodOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  periodNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodLabel: {
    flex: 1,
    alignItems: 'center',
  },
  periodLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});