import { useState, useEffect } from 'react';
import { useRunData } from './useRunData';
import { PersonalRecord, timeToSeconds, secondsToTime } from '../data/records';

export const usePersonalRecords = () => {
  const { runs } = useRunData();
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);

  useEffect(() => {
    calculatePersonalRecords();
  }, [runs]);

  const calculatePersonalRecords = () => {
    if (runs.length === 0) {
      setPersonalRecords([]);
      return;
    }

    // Distances standards pour les records
    const standardDistances = [
      { distance: '100m', minDistance: 0.09, maxDistance: 0.11 },
      { distance: '400m', minDistance: 0.39, maxDistance: 0.41 },
      { distance: '800m', minDistance: 0.79, maxDistance: 0.81 },
      { distance: '1500m', minDistance: 1.49, maxDistance: 1.51 },
      { distance: '5000m', minDistance: 4.9, maxDistance: 5.1 },
      { distance: '10000m', minDistance: 9.9, maxDistance: 10.1 },
      { distance: '21097m', minDistance: 21.0, maxDistance: 21.2 }, // Semi-marathon
      { distance: '42195m', minDistance: 42.0, maxDistance: 42.3 }, // Marathon
    ];

    const records: PersonalRecord[] = [];

    standardDistances.forEach(({ distance, minDistance, maxDistance }) => {
      // Trouver toutes les courses dans cette gamme de distance
      const relevantRuns = runs.filter(run => 
        run.distance >= minDistance && run.distance <= maxDistance
      );

      if (relevantRuns.length > 0) {
        // Trouver la course la plus rapide (meilleure allure)
        const bestRun = relevantRuns.reduce((best, current) => {
          const currentPaceSeconds = current.duration / current.distance;
          const bestPaceSeconds = best.duration / best.distance;
          return currentPaceSeconds < bestPaceSeconds ? current : best;
        });

        // Calculer le temps projeté pour la distance standard
        const pacePerKm = bestRun.duration / bestRun.distance;
        const standardDistanceKm = parseFloat(distance.replace('m', '')) / 1000;
        const projectedTime = pacePerKm * standardDistanceKm;

        records.push({
          distance: distance,
          time: secondsToTime(projectedTime),
          date: new Date(bestRun.date).toLocaleDateString('fr-FR'),
          location: 'Course personnelle'
        });
      }
    });

    setPersonalRecords(records);
  };

  // Obtenir le record personnel pour une distance spécifique
  const getPersonalRecord = (distance: string): PersonalRecord | null => {
    return personalRecords.find(record => record.distance === distance) || null;
  };

  // Comparer avec un record officiel
  const compareWithRecord = (distance: string, officialTime: string): {
    personalTime: string | null;
    difference: number | null;
    isPersonalBetter: boolean;
  } => {
    const personalRecord = getPersonalRecord(distance);
    
    if (!personalRecord) {
      return {
        personalTime: null,
        difference: null,
        isPersonalBetter: false
      };
    }

    const personalSeconds = timeToSeconds(personalRecord.time);
    const officialSeconds = timeToSeconds(officialTime);
    const difference = personalSeconds - officialSeconds;

    return {
      personalTime: personalRecord.time,
      difference: Math.abs(difference),
      isPersonalBetter: difference < 0
    };
  };

  return {
    personalRecords,
    getPersonalRecord,
    compareWithRecord,
  };
};


