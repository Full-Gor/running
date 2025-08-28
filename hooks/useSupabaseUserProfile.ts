import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

export type UserProfile = Database['public']['Tables']['profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const useSupabaseUserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le profil utilisateur
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProfile();
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Erreur lors du chargement du profil:', fetchError);
        setError(fetchError.message);
        return;
      }

      setUserProfile(data);
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const saveUserProfile = async (profileData: UserProfileUpdate) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la sauvegarde du profil:', updateError);
        throw new Error(updateError.message);
      }

      setUserProfile(data);
      return data;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du profil:', err);
      throw err;
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      // Créer un nom de fichier unique
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      // Convertir l'URI en blob (pour React Native)
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, blob);

      if (uploadError) {
        console.error('Erreur lors de l\'upload:', uploadError);
        throw new Error(uploadError.message);
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Mettre à jour le profil avec la nouvelle URL
      await saveUserProfile({ profile_image_url: publicUrl });

      return publicUrl;
    } catch (err) {
      console.error('Erreur lors de l\'upload de l\'image:', err);
      throw err;
    }
  };

  // Calculer l'IMC (Indice de Masse Corporelle)
  const calculateBMI = (): number => {
    if (!userProfile || !userProfile.weight || !userProfile.height) {
      return 0;
    }

    const weightKg = userProfile.weight;
    const heightM = userProfile.height / 100;
    
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

  // Calculer le poids idéal (formule de Lorentz)
  const calculateIdealWeight = (): number => {
    if (!userProfile || !userProfile.height) {
      return 0;
    }

    const heightCm = userProfile.height;
    
    if (heightCm > 0) {
      // Formule simplifiée pour homme (ajustable selon le sexe)
      const idealWeight = heightCm - 100 - ((heightCm - 150) / 4);
      return Math.round(idealWeight * 10) / 10;
    }
    return 0;
  };

  return {
    userProfile,
    loading,
    error,
    saveUserProfile,
    uploadProfileImage,
    calculateBMI,
    getBMICategory,
    calculateIdealWeight,
    refreshProfile: loadUserProfile,
  };
};







