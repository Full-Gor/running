import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RunData {
  id: string;
  date: string; // ISO string
  distance: number; // en kilomètres
  duration: number; // en secondes
  pace: string; // format "mm:ss"
  calories: number;
  type: 'easy' | 'interval' | 'long' | 'tempo';
  coordinates: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
  }>;
  startLocation?: {
    latitude: number;
    longitude: number;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface PeriodStats {
  totalDistance: number;
  totalRuns: number;
  totalDuration: number; // en secondes
  averagePace: string;
  totalCalories: number;
}

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

const STORAGE_KEY = 'running_app_data';

export const useRunData = () => {
  const [runs, setRuns] = useState<RunData[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedRuns = JSON.parse(storedData);
        setRuns(parsedRuns);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRun = async (runData: Omit<RunData, 'id'>) => {
    try {
      const newRun: RunData = {
        ...runData,
        id: Date.now().toString(),
      };
      
      const updatedRuns = [newRun, ...runs];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRuns));
      setRuns(updatedRuns);
      
      return newRun;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const deleteRun = async (runId: string) => {
    try {
      const updatedRuns = runs.filter(run => run.id !== runId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRuns));
      setRuns(updatedRuns);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
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
    const options: Intl.DateTimeFormatOptions = { locale: 'fr-FR' };
    
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
    saveRun,
    deleteRun,
    getStatsForPeriod,
    getRunsForPeriod,
    formatDuration,
    formatPace,
    getPeriodLabel,
  };
};


