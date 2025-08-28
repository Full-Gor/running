import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  weight: string; // en kg
  height: string; // en cm
  level: string;
  profileImage?: string;
}

const STORAGE_KEY = 'user_profile_data';

const defaultProfile: UserProfile = {
  firstName: 'Alex',
  lastName: 'Martin',
  email: 'alex.martin@email.com',
  phone: '+33 6 12 34 56 78',
  age: '28',
  weight: '75',
  height: '175',
  level: 'Coureur Intermédiaire'
};

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(STORAGE_KEY);
      const storedImage = await AsyncStorage.getItem('user_profile_image');
      
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfile(parsedProfile);
      }
      
      if (storedImage) {
        setProfileImage(storedImage);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      throw error;
    }
  };

  const saveProfileImage = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem('user_profile_image', imageUri);
      setProfileImage(imageUri);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'image:', error);
      throw error;
    }
  };

  // Calculer l'IMC (Indice de Masse Corporelle)
  const calculateBMI = (): number => {
    const weightKg = parseFloat(userProfile.weight);
    const heightM = parseFloat(userProfile.height) / 100;
    
    if (weightKg > 0 && heightM > 0) {
      return Math.round(weightKg / Math.pow(heightM, 2) * 10) / 10;
    }
    return 0;
  };

  // Interpréter l'IMC
  const getBMICategory = (): string => {
    const bmi = calculateBMI();
    
    if (bmi < 18.5) return 'Sous-poids';
    if (bmi < 25) return 'Poids normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
  };

  // Calculer l'âge en années à partir de la date de naissance
  const getAge = (): number => {
    return parseInt(userProfile.age) || 0;
  };

  // Calculer le poids idéal (formule de Lorentz)
  const calculateIdealWeight = (): number => {
    const heightCm = parseFloat(userProfile.height);
    const age = getAge();
    
    if (heightCm > 0) {
      // Formule simplifiée pour homme (ajustable selon le sexe)
      const idealWeight = heightCm - 100 - ((heightCm - 150) / 4);
      return Math.round(idealWeight * 10) / 10;
    }
    return 0;
  };

  return {
    userProfile,
    profileImage,
    loading,
    saveUserProfile,
    saveProfileImage,
    calculateBMI,
    getBMICategory,
    getAge,
    calculateIdealWeight,
  };
};


