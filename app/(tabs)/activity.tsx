import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Play, Pause, Square, MapPin, Clock, Activity as ActivityIcon, Zap } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

export default function ActivityScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Location.LocationObject[]>([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Demander les permissions GPS au chargement
  useEffect(() => {
    requestLocationPermission();
    
    // Nettoyage lors du démontage
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Timer pour le chronomètre
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Fonction pour demander les permissions GPS
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        // Obtenir la position initiale
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);
        
        // Initialiser la carte avec la position actuelle
        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la localisation est nécessaire pour tracker votre course.'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
    }
  };

  // Fonction pour calculer la distance entre deux points GPS
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePace = () => {
    if (distance === 0 || time === 0) return '0:00';
    
    // Formule correcte : allure = temps total / distance
    const paceInSeconds = time / distance;
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.floor(paceInSeconds % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateSpeed = () => {
    if (distance === 0 || time === 0) return 0;
    
    // Vitesse en km/h = (distance / temps) * 3600
    const speedKmh = (distance / time) * 3600;
    return speedKmh;
  };

  const handleStart = async () => {
    if (!locationPermission) {
      await requestLocationPermission();
      return;
    }

    try {
      // Démarrer le tracking GPS
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Mise à jour toutes les secondes
          distanceInterval: 5, // Mise à jour tous les 5 mètres
        },
        (location) => {
          setCurrentLocation(location);
          
          // Ajouter la nouvelle position au parcours
          setRouteCoordinates(prev => [...prev, location]);
          
          // Mettre à jour la région de la carte pour suivre la position
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          
          // Calculer la distance si on a au moins 2 points
          if (routeCoordinates.length > 0) {
            const lastLocation = routeCoordinates[routeCoordinates.length - 1];
            const newDistance = calculateDistance(
              lastLocation.coords.latitude,
              lastLocation.coords.longitude,
              location.coords.latitude,
              location.coords.longitude
            );
            setDistance(prev => prev + newDistance);
          }
        }
      );
      
      setLocationSubscription(subscription);
      setIsRunning(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Erreur lors du démarrage du tracking:', error);
      Alert.alert('Erreur', 'Impossible de démarrer le tracking GPS');
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    // Arrêter le tracking GPS
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
    setDistance(0);
    setRouteCoordinates([]);
    
    // Réinitialiser la carte à la position actuelle
    if (currentLocation) {
      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const stats = [
    { 
      label: 'Distance', 
      value: `${distance.toFixed(2)} km`, 
      icon: MapPin, 
      color: '#3B82F6' 
    },
    { 
      label: 'Allure', 
      value: distance > 0 ? `${calculatePace()} min/km` : '0:00 min/km', 
      icon: Zap, 
      color: '#F97316' 
    },
    { 
      label: 'Vitesse', 
      value: distance > 0 ? `${calculateSpeed().toFixed(1)} km/h` : '0.0 km/h', 
      icon: ActivityIcon, 
      color: '#10B981' 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Course en cours</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isRunning && !isPaused ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.statusText}>
              {isRunning ? (isPaused ? 'En pause' : 'Active') : 'Arrêtée'}
            </Text>
          </View>
          <View style={styles.gpsIndicator}>
            <View style={[styles.gpsDot, { backgroundColor: locationPermission ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.gpsText}>
              GPS {locationPermission ? 'Connecté' : 'Non connecté'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Timer */}
      <View style={styles.timerContainer}>
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          style={styles.timerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.timerText}>{formatTime(time)}</Text>
          <Text style={styles.timerLabel}>Temps écoulé</Text>
        </LinearGradient>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
              <stat.icon size={24} color={stat.color} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {locationPermission && Platform.OS !== 'web' ? (
          <MapView
            style={styles.map}
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={isRunning}
            provider={PROVIDER_GOOGLE}
          >
            {/* Marqueur de position actuelle */}
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,
                }}
                title="Votre position"
                description="Position actuelle"
                pinColor="#3B82F6"
              />
            )}
            
            {/* Ligne du parcours */}
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates.map(loc => ({
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                }))}
                strokeColor="#3B82F6"
                strokeWidth={3}
                lineDashPattern={[1]}
              />
            )}
          </MapView>
        ) : (
          <LinearGradient
            colors={['#F1F5F9', '#E2E8F0']}
            style={styles.mapGradient}
          >
            <MapPin size={48} color="#64748B" strokeWidth={1.5} />
            <Text style={styles.mapText}>Carte GPS</Text>
            <Text style={styles.mapSubtext}>Autorisez la localisation pour voir la carte</Text>
          </LinearGradient>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
            >
              <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startButtonText}>Démarrer</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControlsContainer}>
            <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
              <View style={styles.secondaryButton}>
                {isPaused ? (
                  <Play size={28} color="#3B82F6" fill="#3B82F6" />
                ) : (
                  <Pause size={28} color="#3B82F6" />
                )}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.stopButtonGradient}
              >
                <Square size={28} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.stopButtonText}>Arrêter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  gpsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  gpsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  timerContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  timerGradient: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
  },
  map: {
    flex: 1,
    borderRadius: 20,
  },
  mapGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  startButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  activeControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pauseButton: {
    flex: 0.4,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stopButton: {
    flex: 0.55,
    marginLeft: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  stopButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});