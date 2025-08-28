import { useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        } else {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user || null,
            loading: false,
            error: null,
          }));
        }
      } catch (error) {
        console.error('Erreur inattendue:', error);
        setAuthState(prev => ({ ...prev, error: 'Erreur de connexion', loading: false }));
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user || null,
          loading: false,
          error: null,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Inscription
  const signUp = async (email: string, password: string, userData?: { 
    firstName?: string; 
    lastName?: string; 
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.firstName || 'Utilisateur',
            last_name: userData?.lastName || 'Coureur',
          },
        },
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      const message = 'Erreur lors de l\'inscription';
      setAuthState(prev => ({ ...prev, error: message, loading: false }));
      return { data: null, error: { message } as AuthError };
    }
  };

  // Connexion
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      const message = 'Erreur lors de la connexion';
      setAuthState(prev => ({ ...prev, error: message, loading: false }));
      return { data: null, error: { message } as AuthError };
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        return { error };
      }

      return { error: null };
    } catch (error) {
      const message = 'Erreur lors de la déconnexion';
      setAuthState(prev => ({ ...prev, error: message, loading: false }));
      return { error: { message } as AuthError };
    }
  };

  // Réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password',
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'Erreur lors de la réinitialisation' } as AuthError };
    }
  };

  // Mise à jour du profil utilisateur
  const updateProfile = async (updates: { 
    email?: string; 
    password?: string; 
    data?: any; 
  }) => {
    try {
      const { error } = await supabase.auth.updateUser(updates);

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'Erreur lors de la mise à jour' } as AuthError };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!authState.session,
  };
};







