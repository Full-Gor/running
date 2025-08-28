import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Créer le client Supabase avec AsyncStorage pour la persistance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types pour les tables Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string;
          age?: number;
          weight?: number;
          height?: number;
          level?: string;
          profile_image_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string;
          age?: number;
          weight?: number;
          height?: number;
          level?: string;
          profile_image_url?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          age?: number;
          weight?: number;
          height?: number;
          level?: string;
          profile_image_url?: string;
        };
      };
      runs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          distance: number;
          duration: number;
          pace: string;
          calories: number;
          type: 'easy' | 'interval' | 'long' | 'tempo';
          coordinates: any;
          start_location?: any;
          end_location?: any;
          created_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          distance: number;
          duration: number;
          pace: string;
          calories: number;
          type: 'easy' | 'interval' | 'long' | 'tempo';
          coordinates: any;
          start_location?: any;
          end_location?: any;
        };
        Update: {
          date?: string;
          distance?: number;
          duration?: number;
          pace?: string;
          calories?: number;
          type?: 'easy' | 'interval' | 'long' | 'tempo';
          coordinates?: any;
          start_location?: any;
          end_location?: any;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          title: string;
          description: string;
          icon: string;
          category: string;
          distance?: string;
          target_time?: string;
          unlocked_at: string;
          progress: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          title: string;
          description: string;
          icon: string;
          category: string;
          distance?: string;
          target_time?: string;
          unlocked_at: string;
          progress: number;
        };
        Update: {
          progress?: number;
          unlocked_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          icon: string;
          type: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description: string;
          icon: string;
          type: string;
          read?: boolean;
        };
        Update: {
          read?: boolean;
        };
      };
    };
  };
}

// Helper pour vérifier la connexion
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Erreur de connexion Supabase:', error);
      return false;
    }
    console.log('Connexion Supabase OK');
    return true;
  } catch (error) {
    console.error('Erreur de connexion Supabase:', error);
    return false;
  }
};







