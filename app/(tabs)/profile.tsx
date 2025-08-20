import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Award, Target, TrendingUp, Calendar, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const achievements = [
    { id: 1, title: 'Premier 5K', description: 'Première course de 5km complétée', completed: true, icon: '🏃‍♂️' },
    { id: 2, title: '100km ce mois', description: 'Total de 100km parcourus ce mois', completed: true, icon: '🎯' },
    { id: 3, title: 'Régularité', description: '7 jours consécutifs de course', completed: false, icon: '🔥' },
    { id: 4, title: 'Vitesse', description: 'Allure sous 4 min/km', completed: false, icon: '⚡' },
  ];

  const profileStats = [
    { label: 'Distance totale', value: '1,247 km', color: '#3B82F6' },
    { label: 'Temps total', value: '156h 23m', color: '#F97316' },
    { label: 'Courses', value: '127', color: '#10B981' },
    { label: 'Calories', value: '78,439', color: '#8B5CF6' },
  ];

  const menuItems = [
    { title: 'Objectifs et défis', icon: Target, color: '#3B82F6' },
    { title: 'Notifications', icon: Bell, color: '#F97316' },
    { title: 'Confidentialité', icon: Shield, color: '#10B981' },
    { title: 'Aide et support', icon: HelpCircle, color: '#8B5CF6' },
    { title: 'Paramètres', icon: Settings, color: '#6B7280' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.profileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <User size={40} color="#FFFFFF" strokeWidth={2} />
                </View>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Alex Martin</Text>
                <Text style={styles.userLevel}>Coureur Intermédiaire</Text>
                <Text style={styles.memberSince}>Membre depuis Mars 2024</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Profile Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statColorBar, { backgroundColor: stat.color }]} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.goalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Objectif du mois</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>Modifier</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <Target size={24} color="#3B82F6" strokeWidth={2} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>150 km ce mois</Text>
                <Text style={styles.goalProgress}>127 km complétés (85%)</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '85%' }]} />
            </View>
            
            <Text style={styles.goalRemaining}>Il reste 23 km pour atteindre votre objectif</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Récompenses</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard, 
                achievement.completed ? styles.achievementCompleted : styles.achievementIncomplete
              ]}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[
                  styles.achievementTitle, 
                  achievement.completed ? styles.achievementTitleCompleted : styles.achievementTitleIncomplete
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  achievement.completed ? styles.achievementDescriptionCompleted : styles.achievementDescriptionIncomplete
                ]}>
                  {achievement.description}
                </Text>
                {achievement.completed && (
                  <View style={styles.completedBadge}>
                    <Award size={16} color="#FFFFFF" strokeWidth={2} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}20` }]}>
                  <item.icon size={20} color={item.color} strokeWidth={2} />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.logoutItem}>
            <View style={styles.menuItemContent}>
              <View style={styles.logoutIconContainer}>
                <LogOut size={20} color="#EF4444" strokeWidth={2} />
              </View>
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
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
  profileHeader: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  profileGradient: {
    padding: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 16,
    color: '#BFDBFE',
    fontWeight: '600',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 14,
    color: '#93C5FD',
    fontWeight: '500',
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statColorBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  goalsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  editText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  goalRemaining: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsScroll: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  achievementCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    position: 'relative',
  },
  achievementCompleted: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementIncomplete: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  achievementIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementTitleCompleted: {
    color: '#1F2937',
  },
  achievementTitleIncomplete: {
    color: '#6B7280',
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  achievementDescriptionCompleted: {
    color: '#6B7280',
  },
  achievementDescriptionIncomplete: {
    color: '#9CA3AF',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSection: {
    marginHorizontal: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  logoutItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});