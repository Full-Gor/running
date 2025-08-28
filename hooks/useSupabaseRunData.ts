import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

export type RunData = Database['public']['Tables']['runs']['Row'];
export type RunInsert = Database['public']['Tables']['runs']['Insert'];
export type RunUpdate = Database['public']['Tables']['runs']['Update'];

export interface PeriodStats {
  totalDistance: number;
  totalRuns: number;
  totalDuration: number; // en secondes
  averagePace: string;
  totalCalories: number;
}

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

export const useSupabaseRunData = () => {
  const { user, isAuthenticated } = useAuth();
  const [runs, setRuns] = useState<RunData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les courses de l'utilisateur
  useEffect(() => {
    if (isAuthenticated && user) {
      loadRuns();
    } else {
      setRuns([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadRuns = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('runs')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) {
        console.error('Erreur lors du chargement des courses:', fetchError);
        setError(fetchError.message);
        return;
      }

      setRuns(data || []);
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const saveRun = async (runData: Omit<RunInsert, 'user_id'>) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('runs')
        .insert({
          ...runData,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erreur lors de la sauvegarde:', insertError);
        throw new Error(insertError.message);
      }

      // Mettre à jour la liste locale
      setRuns(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      throw err;
    }
  };

  const updateRun = async (runId: string, updates: RunUpdate) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('runs')
        .update(updates)
        .eq('id', runId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour:', updateError);
        throw new Error(updateError.message);
      }

      // Mettre à jour la liste locale
      setRuns(prev => prev.map(run => run.id === runId ? data : run));
      return data;
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      throw err;
    }
  };

  const deleteRun = async (runId: string) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { error: deleteError } = await supabase
        .from('runs')
        .delete()
        .eq('id', runId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Erreur lors de la suppression:', deleteError);
        throw new Error(deleteError.message);
      }

      // Mettre à jour la liste locale
      setRuns(prev => prev.filter(run => run.id !== runId));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      throw err;
    }
  };

  // Calculer les statistiques pour une période donnée
  const getStatsForPeriod = (period: TimePeriod, date: Date = new Date()): PeriodStats => {
    const filteredRuns = getRunsForPeriod(period, date);
    
    if (filteredRuns.length === 0) {
      return {
        totalDistance: 0,
        totalRuns: 0,
        totalDuration: 0,
        averagePace: '0:00',
        totalCalories: 0,
      };
    }

    const totalDistance = filteredRuns.reduce((sum, run) => sum + run.distance, 0);
    const totalDuration = filteredRuns.reduce((sum, run) => sum + run.duration, 0);
    const totalCalories = filteredRuns.reduce((sum, run) => sum + run.calories, 0);
    
    // Calculer l'allure moyenne
    const averagePaceInSeconds = totalDistance > 0 ? totalDuration / totalDistance : 0;
    const averagePace = formatPace(averagePaceInSeconds);

    return {
      totalDistance,
      totalRuns: filteredRuns.length,
      totalDuration,
      averagePace,
      totalCalories,
    };
  };

  // Obtenir les courses pour une période spécifique
  const getRunsForPeriod = (period: TimePeriod, date: Date = new Date()): RunData[] => {
    const startOfPeriod = getStartOfPeriod(period, date);
    const endOfPeriod = getEndOfPeriod(period, date);

    return runs.filter(run => {
      const runDate = new Date(run.date);
      return runDate >= startOfPeriod && runDate <= endOfPeriod;
    });
  };

  // Obtenir le début de la période
  const getStartOfPeriod = (period: TimePeriod, date: Date): Date => {
    const result = new Date(date);
    
    switch (period) {
      case 'day':
        result.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const dayOfWeek = result.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        result.setDate(result.getDate() + diffToMonday);
        result.setHours(0, 0, 0, 0);
        break;
      case 'month':
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'year':
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
    }
    
    return result;
  };

  // Obtenir la fin de la période
  const getEndOfPeriod = (period: TimePeriod, date: Date): Date => {
    const result = new Date(date);
    
    switch (period) {
      case 'day':
        result.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = result.getDay();
        const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        result.setDate(result.getDate() + diffToSunday);
        result.setHours(23, 59, 59, 999);
        break;
      case 'month':
        result.setMonth(result.getMonth() + 1, 0);
        result.setHours(23, 59, 59, 999);
        break;
      case 'year':
        result.setMonth(11, 31);
        result.setHours(23, 59, 59, 999);
        break;
    }
    
    return result;
  };

  // Formater l'allure
  const formatPace = (paceInSeconds: number): string => {
    if (paceInSeconds === 0) return '0:00';
    
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.floor(paceInSeconds % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Formater la durée
  const formatDuration = (durationInSeconds: number): string => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Obtenir le label de la période
  const getPeriodLabel = (period: TimePeriod, date: Date = new Date()): string => {
    switch (period) {
      case 'day':
        return date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        });
      case 'week':
        const startOfWeek = getStartOfPeriod('week', date);
        const endOfWeek = getEndOfPeriod('week', date);
        return `Semaine du ${startOfWeek.getDate()} au ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString('fr-FR', { month: 'long' })}`;
      case 'month':
        return date.toLocaleDateString('fr-FR', { 
          month: 'long', 
          year: 'numeric' 
        });
      case 'year':
        return date.getFullYear().toString();
    }
  };

  return {
    runs,
    loading,
    error,
    saveRun,
    updateRun,
    deleteRun,
    getStatsForPeriod,
    getRunsForPeriod,
    formatDuration,
    formatPace,
    getPeriodLabel,
    refreshRuns: loadRuns,
  };
};







