import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, TrendingUp, Target, Award, Activity, Trophy, Medal, Flag } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useRunData } from '../../hooks/useRunData';
import { usePersonalRecords } from '../../hooks/usePersonalRecords';
import { recordCategories, Record } from '../../data/records';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { runs, getStatsForPeriod, formatDuration, loading } = useRunData();
  const { personalRecords, compareWithRecord } = usePersonalRecords();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRecordCategory, setSelectedRecordCategory] = useState('world');
  const [selectedGender, setSelectedGender] = useState<'men' | 'women'>('men');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStartRun = () => {
    router.push('/(tabs)/activity');
  };

  // Calculer les vraies statistiques
  const weeklyStats = getStatsForPeriod('week');
  const monthlyStats = getStatsForPeriod('month');
  
  // Trouver le record personnel (course la plus rapide)
  const personalBest = runs.length > 0 
    ? runs.reduce((best, run) => {
        const currentPaceSeconds = run.duration / run.distance;
        const bestPaceSeconds = best ? best.duration / best.distance : Infinity;
        return currentPaceSeconds < bestPaceSeconds ? run : best;
      }, null)
    : null;

  // Calculer le pourcentage d'objectif mensuel (objectif: 50km par mois)
  const monthlyGoal = 50; // km
  const monthlyProgress = monthlyStats.totalDistance;
  const monthlyPercentage = Math.min(Math.round((monthlyProgress / monthlyGoal) * 100), 100);

  const quickStats = [
    { 
      label: 'Cette semaine', 
      value: `${weeklyStats.totalDistance.toFixed(1)} km`, 
      icon: TrendingUp, 
      color: '#3B82F6' 
    },
    { 
      label: 'Objectif mensuel', 
      value: `${monthlyPercentage}%`, 
      icon: Target, 
      color: '#F97316' 
    },
    { 
      label: 'Record personnel', 
      value: personalBest ? personalBest.pace : '0:00', 
      icon: Award, 
      color: '#10B981' 
    },
  ];

  // Obtenir les 2 courses les plus récentes
  const recentRuns = runs.slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, Coureur!</Text>
            <Text style={styles.date}>
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>
              {currentTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>

        {/* Quick Start Button */}
        <TouchableOpacity style={styles.quickStartContainer} onPress={handleStartRun}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.quickStartGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quickStartContent}>
              <View style={styles.quickStartText}>
                <Text style={styles.quickStartTitle}>Démarrer une course</Text>
                <Text style={styles.quickStartSubtitle}>Prêt à battre vos records?</Text>
              </View>
              <View style={styles.playButtonContainer}>
                <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Vos statistiques</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
                  <stat.icon size={24} color={stat.color} strokeWidth={2} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activité récente</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.viewAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : recentRuns.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Activity size={48} color="#94A3B8" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Aucune course récente</Text>
              <Text style={styles.emptyText}>
                Commencez votre première course pour voir vos activités ici
              </Text>
            </View>
          ) : (
            recentRuns.map((run) => {
              // Fonction pour obtenir le type de course en français
              const getRunTypeLabel = (type: string) => {
                switch (type) {
                  case 'easy': return 'Course facile';
                  case 'interval': return 'Fractionné';
                  case 'long': return 'Course longue';
                  case 'tempo': return 'Course tempo';
                  default: return 'Course';
                }
              };

              // Formater la date de la course
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

              const formatTime = (dateString: string) => {
                const runDate = new Date(dateString);
                return runDate.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
              };

              return (
                <View key={run.id} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <View style={styles.activityIconContainer}>
                      <Activity size={20} color="#3B82F6" strokeWidth={2} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{getRunTypeLabel(run.type)}</Text>
                      <Text style={styles.activityDate}>
                        {formatRunDate(run.date)}, {formatTime(run.date)}
                      </Text>
                    </View>
                    <View style={styles.activityStats}>
                      <Text style={styles.activityDistance}>{run.distance.toFixed(1)} km</Text>
                      <Text style={styles.activityPace}>{run.pace} min/km</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Records Section */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>Records</Text>
          
          {/* Personal Records */}
          <View style={styles.recordsSubSection}>
            <View style={styles.recordsHeader}>
              <View style={styles.recordsHeaderLeft}>
                <Trophy size={20} color="#FFD700" strokeWidth={2} />
                <Text style={styles.recordsSubTitle}>Mes records personnels</Text>
              </View>
            </View>
            
            {personalRecords.length === 0 ? (
              <View style={styles.noRecordsContainer}>
                <Medal size={32} color="#94A3B8" strokeWidth={1.5} />
                <Text style={styles.noRecordsText}>
                  Effectuez des courses pour établir vos records personnels
                </Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.recordsScroll}
              >
                {personalRecords.slice(0, 4).map((record, index) => (
                  <View key={index} style={styles.personalRecordCard}>
                    <Text style={styles.recordDistance}>{record.distance}</Text>
                    <Text style={styles.recordTime}>{record.time}</Text>
                    <Text style={styles.recordDate}>{record.date}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Official Records */}
          <View style={styles.recordsSubSection}>
            <View style={styles.recordsHeader}>
              <View style={styles.recordsHeaderLeft}>
                <Flag size={20} color="#3B82F6" strokeWidth={2} />
                <Text style={styles.recordsSubTitle}>Records officiels</Text>
              </View>
              <View style={styles.recordsFilters}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    selectedGender === 'men' && styles.genderButtonActive
                  ]}
                  onPress={() => setSelectedGender('men')}
                >
                  <Text style={[
                    styles.genderButtonText,
                    selectedGender === 'men' && styles.genderButtonTextActive
                  ]}>
                    Hommes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    selectedGender === 'women' && styles.genderButtonActive
                  ]}
                  onPress={() => setSelectedGender('women')}
                >
                  <Text style={[
                    styles.genderButtonText,
                    selectedGender === 'women' && styles.genderButtonTextActive
                  ]}>
                    Femmes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.categorySelector}>
              {recordCategories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    selectedRecordCategory === category.key && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedRecordCategory(category.key)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedRecordCategory === category.key && styles.categoryButtonTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Records List */}
            <View style={styles.officialRecordsList}>
              {(() => {
                const currentCategory = recordCategories.find(cat => cat.key === selectedRecordCategory);
                const records = selectedGender === 'men' ? currentCategory?.men : currentCategory?.women;
                
                return records?.map((record, index) => {
                  const comparison = compareWithRecord(record.distance, record.time);
                  
                  return (
                    <View key={index} style={styles.officialRecordCard}>
                      <View style={styles.recordCardHeader}>
                        <Text style={styles.officialRecordDistance}>{record.distance}</Text>
                        <Text style={styles.officialRecordTime}>{record.time}</Text>
                      </View>
                      <Text style={styles.recordAthlete}>{record.athlete}</Text>
                      <Text style={styles.recordDetails}>
                        {record.location} • {record.year}
                      </Text>
                      {comparison.personalTime && (
                        <View style={styles.comparisonContainer}>
                          <Text style={[
                            styles.comparisonText,
                            comparison.isPersonalBetter ? styles.comparisonBetter : styles.comparisonWorse
                          ]}>
                            Votre record: {comparison.personalTime}
                            {comparison.difference && (
                              ` (${comparison.isPersonalBetter ? '-' : '+'}${comparison.difference.toFixed(2)}s)`
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                });
              })()}
            </View>
          </View>
        </View>
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  time: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
  quickStartContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  quickStartGradient: {
    padding: 24,
  },
  quickStartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStartText: {
    flex: 1,
  },
  quickStartTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quickStartSubtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  playButtonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  recentSection: {
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  activityCard: {
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
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityDistance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  activityPace: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
  recordsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  recordsSubSection: {
    marginBottom: 24,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordsSubTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  recordsFilters: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  genderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  genderButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  genderButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  genderButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  noRecordsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  noRecordsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  recordsScroll: {
    paddingRight: 20,
  },
  personalRecordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  recordDistance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  officialRecordsList: {
    gap: 12,
  },
  officialRecordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recordCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  officialRecordDistance: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  officialRecordTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
  },
  recordAthlete: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  recordDetails: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  comparisonContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  comparisonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  comparisonBetter: {
    color: '#10B981',
  },
  comparisonWorse: {
    color: '#F59E0B',
  },
});