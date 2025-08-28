import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Award, Target, TrendingUp, Calendar, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Edit, X, Save, Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useRunData } from '../../hooks/useRunData';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useRewards } from '../../hooks/useRewards';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { runs, getStatsForPeriod } = useRunData();
  const { 
    userProfile, 
    profileImage, 
    loading: profileLoading, 
    saveUserProfile, 
    saveProfileImage, 
    calculateBMI 
  } = useUserProfile();
  const {
    achievements,
    notifications,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getAchievementProgress,
    markNotificationAsRead
  } = useRewards();
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    phone: userProfile.phone,
    age: userProfile.age,
    weight: userProfile.weight,
    height: userProfile.height,
    level: userProfile.level
  });

  // Mettre à jour le formulaire quand le profil change
  React.useEffect(() => {
    setEditForm({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phone,
      age: userProfile.age,
      weight: userProfile.weight,
      height: userProfile.height,
      level: userProfile.level
    });
  }, [userProfile]);

  // Calculer les vraies statistiques
  const monthlyStats = getStatsForPeriod('month');
  const weeklyStats = getStatsForPeriod('week');

  // Obtenir les statistiques des achievements
  const achievementProgress = getAchievementProgress();
  const unlockedAchievements = getUnlockedAchievements();
  const recentNotifications = notifications.slice(0, 3);

  // Objectif mensuel (50km)
  const monthlyGoal = 50;
  const monthlyProgress = monthlyStats.totalDistance;
  const monthlyPercentage = Math.min(Math.round((monthlyProgress / monthlyGoal) * 100), 100);
  const remainingDistance = Math.max(monthlyGoal - monthlyProgress, 0);

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

  const pickImage = async () => {
    try {
      // Demander les permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à votre galerie.');
        return;
      }

      // Ouvrir le sélecteur d'images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await saveProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection d\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image.');
    }
  };

  const takePhoto = async () => {
    try {
      // Demander les permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de votre permission pour accéder à votre caméra.');
        return;
      }

      // Ouvrir la caméra
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await saveProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre une photo.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Choisir une photo',
      'Comment souhaitez-vous ajouter votre photo de profil ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Prendre une photo',
          onPress: takePhoto,
        },
        {
          text: 'Choisir dans la galerie',
          onPress: pickImage,
        },
      ]
    );
  };

  const openEditModal = () => {
    setEditForm({
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phone,
      age: userProfile.age,
      weight: userProfile.weight,
      height: userProfile.height,
      level: userProfile.level
    });
    setIsEditModalVisible(true);
  };

  const saveUserInfo = async () => {
    try {
      await saveUserProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        age: editForm.age,
        weight: editForm.weight,
        height: editForm.height,
        level: editForm.level
      });
      setIsEditModalVisible(false);
      Alert.alert('Succès', 'Informations personnelles mises à jour !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil.');
    }
  };

  const cancelEdit = () => {
    setIsEditModalVisible(false);
  };

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
                <TouchableOpacity style={styles.avatar} onPress={showImagePickerOptions}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                  ) : (
                    <User size={40} color="#FFFFFF" strokeWidth={2} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.editAvatarButton} onPress={showImagePickerOptions}>
                  <Camera size={16} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userProfile.firstName} {userProfile.lastName}</Text>
                <Text style={styles.userLevel}>{userProfile.level}</Text>
                <Text style={styles.memberSince}>Membre depuis Mars 2024</Text>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                <Edit size={20} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
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

        {/* Personal Info Section */}
        <View style={styles.personalInfoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            <TouchableOpacity onPress={openEditModal}>
              <Text style={styles.editText}>Modifier</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.personalInfoGrid}>
            <View style={styles.personalInfoCard}>
              <View style={styles.personalInfoIconContainer}>
                <User size={20} color="#3B82F6" strokeWidth={2} />
              </View>
              <Text style={styles.personalInfoValue}>{userProfile.weight} kg</Text>
              <Text style={styles.personalInfoLabel}>Poids</Text>
            </View>
            
            <View style={styles.personalInfoCard}>
              <View style={styles.personalInfoIconContainer}>
                <TrendingUp size={20} color="#F97316" strokeWidth={2} />
              </View>
              <Text style={styles.personalInfoValue}>{userProfile.height} cm</Text>
              <Text style={styles.personalInfoLabel}>Taille</Text>
            </View>
            
            <View style={styles.personalInfoCard}>
              <View style={styles.personalInfoIconContainer}>
                <Calendar size={20} color="#10B981" strokeWidth={2} />
              </View>
              <Text style={styles.personalInfoValue}>{userProfile.age} ans</Text>
              <Text style={styles.personalInfoLabel}>Âge</Text>
            </View>
            
            <View style={styles.personalInfoCard}>
              <View style={styles.personalInfoIconContainer}>
                <Award size={20} color="#8B5CF6" strokeWidth={2} />
              </View>
              <Text style={styles.personalInfoValue}>
                {calculateBMI()}
              </Text>
              <Text style={styles.personalInfoLabel}>IMC</Text>
            </View>
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
                <Text style={styles.goalTitle}>{monthlyGoal} km ce mois</Text>
                <Text style={styles.goalProgress}>{monthlyProgress.toFixed(1)} km complétés ({monthlyPercentage}%)</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${monthlyPercentage}%` }]} />
            </View>
            
            <Text style={styles.goalRemaining}>
              {remainingDistance > 0 
                ? `Il reste ${remainingDistance.toFixed(1)} km pour atteindre votre objectif`
                : 'Objectif atteint ! Félicitations ! 🎉'
              }
            </Text>
          </View>
        </View>

        {/* Rewards Progress */}
        <View style={styles.rewardsProgressSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Récompenses</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {achievementProgress.unlocked}/{achievementProgress.total}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressOverview}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${achievementProgress.percentage}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {achievementProgress.percentage}% des récompenses débloquées
            </Text>
          </View>
        </View>

        {/* Recent Notifications */}
        {recentNotifications.length > 0 && (
          <View style={styles.notificationsSection}>
            <Text style={styles.sectionTitle}>Dernières récompenses</Text>
            
            {recentNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={styles.notificationCard}
                onPress={() => markNotificationAsRead(notification.id)}
              >
                <View style={styles.notificationIcon}>
                  <Text style={styles.notificationIconText}>{notification.icon}</Text>
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationDescription}>{notification.description}</Text>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.timestamp).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Achievement Categories */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Catégories de récompenses</Text>
          
          <View style={styles.categoryGrid}>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🏃‍♂️</Text>
              <Text style={styles.categoryTitle}>Records personnels</Text>
              <Text style={styles.categoryProgress}>
                {getAchievementsByCategory('personal').filter(a => a.isUnlocked).length}/
                {getAchievementsByCategory('personal').length}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🇫🇷</Text>
              <Text style={styles.categoryTitle}>Records France</Text>
              <Text style={styles.categoryProgress}>
                {getAchievementsByCategory('france').filter(a => a.isUnlocked).length}/
                {getAchievementsByCategory('france').length}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🇪🇺</Text>
              <Text style={styles.categoryTitle}>Records Europe</Text>
              <Text style={styles.categoryProgress}>
                {getAchievementsByCategory('europe').filter(a => a.isUnlocked).length}/
                {getAchievementsByCategory('europe').length}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🌍</Text>
              <Text style={styles.categoryTitle}>Records Monde</Text>
              <Text style={styles.categoryProgress}>
                {getAchievementsByCategory('world').filter(a => a.isUnlocked).length}/
                {getAchievementsByCategory('world').length}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <View style={styles.recentAchievementsSection}>
            <Text style={styles.sectionTitle}>Récompenses récentes</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
              {unlockedAchievements.slice(0, 5).map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.completedBadge}>
                    <Award size={16} color="#FFFFFF" strokeWidth={2} />
                  </View>
                  {achievement.unlockedAt && (
                    <Text style={styles.achievementDate}>
                      {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

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

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={cancelEdit} style={styles.modalCloseButton}>
              <X size={24} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TouchableOpacity onPress={saveUserInfo} style={styles.modalSaveButton}>
              <Save size={24} color="#3B82F6" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Photo de profil</Text>
              
              <View style={styles.photoSection}>
                <TouchableOpacity style={styles.photoContainer} onPress={showImagePickerOptions}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.photoPreview} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Camera size={32} color="#6B7280" strokeWidth={2} />
                      <Text style={styles.photoPlaceholderText}>Ajouter une photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.changePhotoButton} onPress={showImagePickerOptions}>
                  <Text style={styles.changePhotoText}>Changer la photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Informations personnelles</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Prénom</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.firstName}
                    onChangeText={(text) => setEditForm({...editForm, firstName: text})}
                    placeholder="Votre prénom"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nom</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.lastName}
                    onChangeText={(text) => setEditForm({...editForm, lastName: text})}
                    placeholder="Votre nom"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  placeholder="votre.email@exemple.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Téléphone</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  placeholder="+33 6 12 34 56 78"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Informations physiques</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Âge</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.age}
                    onChangeText={(text) => setEditForm({...editForm, age: text})}
                    placeholder="28"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Poids (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.weight}
                    onChangeText={(text) => setEditForm({...editForm, weight: text})}
                    placeholder="75"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Taille (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.height}
                  onChangeText={(text) => setEditForm({...editForm, height: text})}
                  placeholder="175"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Niveau</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.level}
                  onChangeText={(text) => setEditForm({...editForm, level: text})}
                  placeholder="Coureur Intermédiaire"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    position: 'relative',
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  personalInfoSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  personalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  personalInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 52) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  personalInfoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  personalInfoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  personalInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  rewardsProgressSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  progressBadge: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressOverview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  notificationsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  notificationBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 52) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  recentAchievementsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  achievementDate: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 4,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 32,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 57,
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  changePhotoButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});