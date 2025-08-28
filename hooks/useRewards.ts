import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRunData } from './useRunData';
import { usePersonalRecords } from './usePersonalRecords';
import { recordCategories, timeToSeconds } from '../data/records';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'personal' | 'france' | 'europe' | 'world';
  distance: string;
  targetTime?: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progress?: number; // 0-100
}

export interface RewardNotification {
  id: string;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  type: 'achievement' | 'personal_record' | 'milestone';
}

const ACHIEVEMENTS_STORAGE_KEY = 'user_achievements';
const NOTIFICATIONS_STORAGE_KEY = 'reward_notifications';

export const useRewards = () => {
  const { runs } = useRunData();
  const { personalRecords, compareWithRecord } = usePersonalRecords();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<RewardNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (runs.length > 0) {
      checkForNewAchievements();
    }
  }, [runs, personalRecords]);

  const loadAchievements = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      if (stored) {
        setAchievements(JSON.parse(stored));
      } else {
        // Initialiser les achievements par défaut
        const defaultAchievements = createDefaultAchievements();
        setAchievements(defaultAchievements);
        await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(defaultAchievements));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const allNotifications = JSON.parse(stored);
        // Garder seulement les 10 plus récentes
        setNotifications(allNotifications.slice(0, 10));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const createDefaultAchievements = (): Achievement[] => {
    const achievements: Achievement[] = [];
    const distances = ['100m', '400m', '800m'];
    
    // Achievements pour records personnels
    distances.forEach(distance => {
      achievements.push({
        id: `personal_${distance}`,
        title: `Premier record ${distance}`,
        description: `Établir votre premier record personnel sur ${distance}`,
        icon: '🏃‍♂️',
        category: 'personal',
        distance,
        isUnlocked: false,
        progress: 0
      });
    });

    // Achievements pour records de France
    recordCategories.forEach(category => {
      if (category.key === 'france') {
        category.men.forEach(record => {
          achievements.push({
            id: `france_men_${record.distance}`,
            title: `Record de France ${record.distance} (H)`,
            description: `Égaler ou battre le record de France masculin sur ${record.distance}`,
            icon: '🇫🇷',
            category: 'france',
            distance: record.distance,
            targetTime: record.time,
            isUnlocked: false,
            progress: 0
          });
        });
        
        category.women.forEach(record => {
          achievements.push({
            id: `france_women_${record.distance}`,
            title: `Record de France ${record.distance} (F)`,
            description: `Égaler ou battre le record de France féminin sur ${record.distance}`,
            icon: '🇫🇷',
            category: 'france',
            distance: record.distance,
            targetTime: record.time,
            isUnlocked: false,
            progress: 0
          });
        });
      }
    });

    // Achievements pour records d'Europe
    recordCategories.forEach(category => {
      if (category.key === 'europe') {
        category.men.forEach(record => {
          achievements.push({
            id: `europe_men_${record.distance}`,
            title: `Record d'Europe ${record.distance} (H)`,
            description: `Égaler ou battre le record d'Europe masculin sur ${record.distance}`,
            icon: '🇪🇺',
            category: 'europe',
            distance: record.distance,
            targetTime: record.time,
            isUnlocked: false,
            progress: 0
          });
        });
      }
    });

    // Achievements pour records du monde
    recordCategories.forEach(category => {
      if (category.key === 'world') {
        category.men.forEach(record => {
          achievements.push({
            id: `world_men_${record.distance}`,
            title: `Record du monde ${record.distance} (H)`,
            description: `Égaler ou battre le record du monde masculin sur ${record.distance}`,
            icon: '🌍',
            category: 'world',
            distance: record.distance,
            targetTime: record.time,
            isUnlocked: false,
            progress: 0
          });
        });
      }
    });

    return achievements;
  };

  const checkForNewAchievements = async () => {
    const updatedAchievements = [...achievements];
    const newNotifications: RewardNotification[] = [];
    let hasUpdates = false;

    // Vérifier les records personnels
    personalRecords.forEach(personalRecord => {
      const achievementId = `personal_${personalRecord.distance}`;
      const achievement = updatedAchievements.find(a => a.id === achievementId);
      
      if (achievement && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        achievement.progress = 100;
        hasUpdates = true;

        newNotifications.push({
          id: `notif_${achievementId}_${Date.now()}`,
          title: 'Nouveau record personnel !',
          description: `${personalRecord.distance}: ${personalRecord.time}`,
          icon: '🏆',
          timestamp: new Date().toISOString(),
          type: 'personal_record'
        });
      }
    });

    // Vérifier les records officiels
    recordCategories.forEach(category => {
      [...category.men, ...category.women].forEach(officialRecord => {
        const comparison = compareWithRecord(officialRecord.distance, officialRecord.time);
        
        if (comparison.personalTime) {
          const achievementId = `${category.key}_men_${officialRecord.distance}`;
          const achievement = updatedAchievements.find(a => a.id === achievementId);
          
          if (achievement) {
            // Calculer le progrès (plus on est proche, plus le progrès est élevé)
            const personalSeconds = timeToSeconds(comparison.personalTime);
            const targetSeconds = timeToSeconds(officialRecord.time);
            const progress = Math.min(100, Math.max(0, 100 - ((personalSeconds - targetSeconds) / targetSeconds * 100)));
            
            achievement.progress = Math.round(progress);
            
            // Débloquer si on a égalé ou battu le record
            if (comparison.isPersonalBetter && !achievement.isUnlocked) {
              achievement.isUnlocked = true;
              achievement.unlockedAt = new Date().toISOString();
              hasUpdates = true;

              newNotifications.push({
                id: `notif_${achievementId}_${Date.now()}`,
                title: `Record ${category.label} battu !`,
                description: `${officialRecord.distance}: ${comparison.personalTime} (vs ${officialRecord.time})`,
                icon: achievement.icon,
                timestamp: new Date().toISOString(),
                type: 'achievement'
              });
            }
          }
        }
      });
    });

    if (hasUpdates || newNotifications.length > 0) {
      setAchievements(updatedAchievements);
      await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(updatedAchievements));
      
      if (newNotifications.length > 0) {
        const allNotifications = [...newNotifications, ...notifications].slice(0, 10);
        setNotifications(allNotifications);
        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(allNotifications));
      }
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
  };

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(a => a.category === category);
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(a => a.isUnlocked);
  };

  const getAchievementProgress = () => {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.isUnlocked).length;
    return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
  };

  return {
    achievements,
    notifications,
    loading,
    markNotificationAsRead,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getAchievementProgress,
    checkForNewAchievements,
  };
};


