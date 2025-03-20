// components/interactions/CreateReport/AddressSuggestionModal.tsx

import React, { memo, useRef, useEffect, useMemo } from 'react';
import { 
  Modal, 
  View, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  Dimensions,
  StatusBar,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AddressSuggestion } from './types';

/**
 * Props d'interface pour le composant AddressSuggestionModal
 */
interface AddressSuggestionModalProps {
  /** Contrôle la visibilité du modal */
  visible: boolean;
  /** Liste des suggestions d'adresses à afficher */
  suggestions: AddressSuggestion[];
  /** Fonction appelée lorsqu'une suggestion est sélectionnée */
  onSelect: (suggestion: AddressSuggestion) => void;
  /** Fonction appelée pour fermer le modal */
  onClose: () => void;
  /** Adresse actuelle optionnelle */
  currentAddress?: string;
}

/**
 * Extrait l'adresse de rue à partir d'une adresse formatée
 * @param formatted L'adresse complète formatée
 * @returns La partie rue de l'adresse
 */
const extractStreetAddress = (formatted: string): string => {
  const parts = formatted.split(',');
  if (parts.length > 0) {
    return parts[0].trim().replace(/unnamed road/gi, 'Route inconnue');
  }
  return formatted.replace(/unnamed road/gi, 'Route inconnue');
};

/**
 * Extrait le code postal d'une adresse formatée
 * @param formatted L'adresse complète formatée
 * @returns Le code postal si trouvé, sinon une chaîne vide
 */
const extractPostalCode = (formatted: string): string => {
  const postalCodeMatch = formatted.match(/\b\d{5}\b/);
  return postalCodeMatch ? postalCodeMatch[0] : '';
};

/**
 * Extrait le pays d'une adresse formatée
 * @param formatted L'adresse complète formatée
 * @returns Le pays extrait ou 'France' par défaut
 */
/**
 * Extrait le pays d'une adresse formatée avec détection améliorée
 * @param formatted L'adresse complète formatée
 * @returns Le pays détecté ou undefined si indéterminé
 */
const extractCountry = (formatted: string): string => {
  // 1. Normalisation de l'entrée
  const normalizedAddress = formatted.trim().toLowerCase();
  
  // 2. Détection par mots-clés explicites
  const belgiumKeywords = ['belgique', 'belgium', 'belgië', 'belgien'];
  const franceKeywords = ['france', 'francia'];
  
  for (const keyword of belgiumKeywords) {
    if (normalizedAddress.includes(keyword)) {
      return 'Belgique';
    }
  }
  
  for (const keyword of franceKeywords) {
    if (normalizedAddress.includes(keyword)) {
      return 'France';
    }
  }
  
  // 3. Détection par code postal
  // Les codes postaux belges sont à 4 chiffres (1000-9999)
  const belgianPostalCodeMatch = formatted.match(/\b[1-9]\d{3}\b/);
  if (belgianPostalCodeMatch) {
    return 'Belgique';
  }
  
  // Les codes postaux français sont à 5 chiffres et commencent souvent par 0-9
  const frenchPostalCodeMatch = formatted.match(/\b[0-9]\d{4}\b/);
  if (frenchPostalCodeMatch) {
    return 'France';
  }
  
  // 4. Extraction traditionnelle basée sur la position (méthode de secours)
  const parts = formatted.split(',');
  if (parts.length > 2) {
    const lastPart = parts[parts.length - 1].trim().toLowerCase();
    
    // Vérifier si la dernière partie contient des mots-clés de pays
    for (const keyword of belgiumKeywords) {
      if (lastPart.includes(keyword)) {
        return 'Belgique';
      }
    }
    
    for (const keyword of franceKeywords) {
      if (lastPart.includes(keyword)) {
        return 'France';
      }
    }
    
    // Si c'est juste un mot, ça pourrait être le pays
    if (lastPart.length < 20) {
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
  }
  
  // 5. En cas d'échec de détection, retourner une valeur indéterminée
  return 'Pays indéterminé';
};

/**
 * Interface définissant les informations d'un pays avec ses couleurs
 */
interface CountryInfo {
  /** Nom du pays */
  name: string;
  /** Indique si le pays a un traitement spécial (drapeau) */
  isSpecial: boolean;
  /** Couleurs du drapeau pour le gradient */
  colors: string[];
}

/**
 * Détermine les informations de pays et les couleurs associées basées sur l'adresse
 * @param formatted L'adresse complète formatée
 * @returns Informations sur le pays avec couleurs du drapeau
 */
const getCountryInfo = (formatted: string): CountryInfo => {
  const country = extractCountry(formatted);
  
  switch(country) {
    case 'France':
      return {
        name: 'France',
        isSpecial: true,
        colors: ['#0055A4', '#FFFFFF', '#EF4135'] // Bleu, Blanc, Rouge
      };
    case 'Belgique':
    case 'Belgium':
    case 'België':
      return {
        name: 'Belgique',
        isSpecial: true,
        colors: ['#000000', '#FDDA24', '#EF3340'] // Noir, Jaune, Rouge
      };
    default:
      return {
        name: country,
        isSpecial: false,
        colors: ['#475569'] // Couleur par défaut pour les autres pays
      };
  }
};

/**
 * Extrait la ville d'une adresse formatée
 * @param formatted L'adresse complète formatée
 * @returns La ville extraite ou une chaîne vide si non trouvée
 */
const extractCity = (formatted: string): string => {
  const parts = formatted.split(',');
  const postalCode = extractPostalCode(formatted);
  
  // Si nous avons au moins l'adresse et une partie après
  if (parts.length > 1) {
    // Essayons de trouver la partie qui contient le code postal
    for (let i = 1; i < parts.length - 1; i++) {
      const part = parts[i].trim();
      if (part.includes(postalCode)) {
        // Retirer le code postal et nettoyer
        return part.replace(postalCode, '').trim().replace(/^[,\s]+|[,\s]+$/g, '');
      }
    }
    
    // Si on n'a pas trouvé la ville avec le code postal, essayons la partie juste après l'adresse
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }
  
  return '';
};

/**
 * Extrait et formate les informations de localisation
 * @param formatted L'adresse complète formatée
 * @returns Chaîne formatée "Ville, Code Postal - Pays"
 */
const extractLocationInfo = (formatted: string): string => {
  const postalCode = extractPostalCode(formatted);
  const city = extractCity(formatted);
  const country = extractCountry(formatted);
  
  // Formater comme demandé: "Ville, Code Postal - Pays"
  if (postalCode && city) {
    return `${city}, ${postalCode} - ${country}`;
  } else if (city) {
    return `${city} - ${country}`;
  }
  
  return 'Adresse non détaillée';
};

/**
 * Trie les suggestions d'adresse avec ordre de priorité: 
 * France d'abord, puis Belgique, puis par ordre alphabétique des villes
 * @param suggestions Liste de suggestions d'adresses à trier
 * @returns Liste triée avec ordre de priorité par pays et ville
 */
const sortSuggestions = (suggestions: AddressSuggestion[]): AddressSuggestion[] => {
  return [...suggestions].sort((a, b) => {
    // Extraction des informations pour le tri
    const countryInfoA = getCountryInfo(a.formatted);
    const countryInfoB = getCountryInfo(b.formatted);
    const cityA = extractCity(a.formatted);
    const cityB = extractCity(b.formatted);
    
    // 1. Tri par pays (France en premier, puis Belgique)
    if (countryInfoA.name === 'France' && countryInfoB.name !== 'France') {
      return -1; // A vient avant B
    }
    if (countryInfoA.name !== 'France' && countryInfoB.name === 'France') {
      return 1;  // B vient avant A
    }
    
    // 2. France déjà traitée, maintenant Belgique en second
    if (countryInfoA.name === 'Belgique' && countryInfoB.name !== 'Belgique') {
      return -1; // A vient avant B
    }
    if (countryInfoA.name !== 'Belgique' && countryInfoB.name === 'Belgique') {
      return 1;  // B vient avant A
    }
    
    // 3. Si même pays, tri par ville alphabétiquement
    if (countryInfoA.name === countryInfoB.name) {
      // Tri insensible à la casse pour plus de cohérence
      return cityA.toLowerCase().localeCompare(cityB.toLowerCase());
    }
    
    // 4. Sinon tri par pays alphabétiquement
    return countryInfoA.name.localeCompare(countryInfoB.name);
  });
};

/**
 * Composant qui affiche une icône avec couleur ou dégradé selon le pays d'origine
 */
const LocationIcon: React.FC<{ countryInfo: CountryInfo }> = memo(({ countryInfo }) => {
  if (!countryInfo.isSpecial) {
    return (
      <View style={styles.suggestionIconContainer}>
        <Ionicons name="location" size={24} color="#475569" />
      </View>
    );
  }

  return (
    <View style={[styles.suggestionIconContainer, styles.specialIconContainer]}>
      <LinearGradient
        colors={countryInfo.colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.iconGradient}
      >
        <Ionicons 
          name="location" 
          size={24} 
          color={countryInfo.name === 'France' ? '#C55' : countryInfo.colors[0]} 
        />
      </LinearGradient>
    </View>
  );
});

/**
 * Composant de suggestion d'adresse avec style conditionnel selon le pays
 */
interface AddressSuggestionItemProps {
  item: AddressSuggestion;
  index: number;
  onSelect: (suggestion: AddressSuggestion) => void;
}

const AddressSuggestionItem: React.FC<AddressSuggestionItemProps> = memo(({
  item,
  index,
  onSelect
}) => {
  const countryInfo = getCountryInfo(item.formatted);
  
  const handlePress = () => {
    onSelect(item);
  };

  return (
    <TouchableOpacity
      key={`${item.formatted}-${index}`}
      style={styles.suggestionItem}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {countryInfo.isSpecial ? (
        <LinearGradient
          colors={countryInfo.colors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBackground}
        >
          <View style={styles.suggestionContent}>
            <LocationIcon countryInfo={countryInfo} />
            <View style={styles.suggestionDetails}>
              <Text 
                style={[styles.suggestionText, styles.specialSuggestionText]} 
                numberOfLines={2}
              >
                {extractStreetAddress(item.formatted)}
              </Text>
              <Text 
                style={[
                  styles.suggestionCoords, 
                  { color: countryInfo.colors[0] }
                ]}
              >
                {extractLocationInfo(item.formatted)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.suggestionContent}>
          <LocationIcon countryInfo={countryInfo} />
          <View style={styles.suggestionDetails}>
            <Text style={styles.suggestionText} numberOfLines={2}>
              {extractStreetAddress(item.formatted)}
            </Text>
            <Text style={styles.suggestionCoords}>
              {extractLocationInfo(item.formatted)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </View>
      )}
    </TouchableOpacity>
  );
});

/**
 * Composant Modal pour l'affichage et la sélection de suggestions d'adresses
 * Inclut un tri intelligent (France d'abord) et un style spécial pour les adresses françaises
 */
const AddressSuggestionModal: React.FC<AddressSuggestionModalProps> = memo(({
  visible,
  suggestions,
  onSelect,
  onClose,
  currentAddress
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Tri des suggestions avec mémoïsation pour éviter les recalculs inutiles
  const sortedSuggestions = useMemo(() => 
    sortSuggestions(
      suggestions.map(suggestion =>
        suggestion.formatted === "Ma position" && currentAddress && currentAddress !== "Ma position"
          ? { ...suggestion, formatted: currentAddress }
          : suggestion
      )
    ),
    [suggestions, currentAddress]
  );

  // Gérer les animations d'apparition et de disparition
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      StatusBar.setBarStyle('dark-content');
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Rendu du contenu vide si aucune suggestion
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="map-outline" size={64} color="#94A3B8" />
      <Text style={styles.emptyStateTitle}>
        Aucune suggestion
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        Affinez votre recherche
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: opacityAnim }
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer, 
                { 
                  transform: [{ translateY: slideAnim }],
                  paddingBottom: insets.bottom 
                }
              ]}
            >
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Sélectionnez une adresse</Text>
                <TouchableOpacity 
                  onPress={onClose} 
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {sortedSuggestions.length === 0 
                  ? renderEmptyState()
                  : sortedSuggestions.map((item, index) => (
                      <AddressSuggestionItem
                        key={`${item.formatted}-${index}`}
                        item={item}
                        index={index}
                        onSelect={onSelect}
                      />
                    ))
                }
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  suggestionItem: {
    marginBottom: 1, // Espace minimal entre les éléments
    overflow: 'hidden', // Nécessaire pour le bon fonctionnement du LinearGradient
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  gradientBackground: {
    borderRadius: 0,
    padding: 0,
    margin: 0,
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  specialIconContainer: {
    backgroundColor: 'transparent',
  },
  iconGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  suggestionDetails: {
    flex: 1,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 4,
    fontWeight: '500',
  },
  specialSuggestionText: {
    fontWeight: '600',
  },
  suggestionCoords: {
    fontSize: 12,
    color: '#64748B',
  },
  // Note: Les styles spécifiques aux couleurs sont appliqués directement via le style inline
  // pour eviter de dupliquer les styles pour chaque pays
});

export default AddressSuggestionModal;