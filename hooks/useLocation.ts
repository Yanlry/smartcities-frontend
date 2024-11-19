import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', "La permission de localisation est nécessaire pour afficher la carte.");
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (error) {
        console.error("Erreur lors de la récupération de la localisation :", error);
        Alert.alert('Erreur', "Impossible de récupérer votre localisation.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, loading };
}
