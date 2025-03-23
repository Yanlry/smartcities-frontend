// src/components/home/MayorInfoSection/MayorInfoSection.tsx
import React, { memo, useRef, useCallback, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Animated, 
  Easing, 
  Platform, 
  UIManager, 
  LayoutAnimation, 
  Pressable,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTabNavigation } from './useTabNavigation';
import { useAnimatedVisibility } from './useAnimatedVisibility';
import { TabContent } from './TabContent';
import { NewsItem, NewsItemProps } from './NewsItem';
import { MayorProfile } from './MayorProfile';
import { ContactInfo } from './ContactInfo';
import { TabBar } from './TabBar';

// Configuration de LayoutAnimation pour Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Constants
const { width } = Dimensions.get('window');
const ANIMATION_DURATION = 300;

// Configuration des couleurs pour le thème - Style harmonisé avec teinte mauve/violette
const THEME = {
  primary: "#3B82F6",    // Bleu vif
  primaryDark: "#1E40AF", // Bleu foncé
  secondary: "#1E40AF",
  secondaryTransparent: "rgba(161, 134, 158, 0.2)",
  background: "#F9FAFE", // Fond très légèrement bleuté
  backgroundDark: "#ECF0F7", // Fond légèrement plus sombre
  cardBackground: "#FFFFFF", // Blanc pur pour les cartes
  text: "#2D3748", // Texte principal presque noir
  textLight: "#718096", // Texte secondaire gris
  textMuted: "#A0AEC0", // Texte tertiaire gris clair
  success: "#27ae60",
  warning: "#f39c12",
  danger: "#e74c3c",
  border: "#E2E8F0", // Bordures légères
  shadow: "rgba(0, 0, 0, 0.1)", // Ombres avec teinte bleuâtre
};

// Couleur de fond optimisées pour l'état ouvert/fermé
const EXPANDED_BACKGROUND = "rgba(250, 251, 255, 0.97)";
const COLLAPSED_BACKGROUND = "#FFFFFF";

// Définition des types d'onglets
export type TabType = 'news' | 'mayor' | 'contact';

/**
 * Interface pour les props du composant MayorInfoSection
 */
interface MayorInfoSectionProps {
  /** État de visibilité de la section */
  isVisible: boolean;
  /** Fonction pour basculer la visibilité */
  toggleVisibility: () => void;
  /** Callback appelé lors du clic sur un numéro de téléphone */
  onPhonePress: () => void;
}

/**
 * Données des actualités (extraites pour éviter les recreations inutiles)
 */
const NEWS_ITEMS: NewsItemProps[] = [
  { 
    icon: "warning-outline",
    color: THEME.warning,
    title: "Attention : Travaux",
    date: "15 septembre 2024",
    location: "Avenue de la Liberté",
    details: "Des travaux de réfection de la chaussée auront lieu du 25 au 30 septembre. La circulation sera déviée. Veuillez suivre les panneaux de signalisation."
  },
  { 
    icon: "checkmark-circle-outline",
    color: THEME.success,
    title: "Résolution de signalements",
    date: "20 septembre 2024",
    location: "Rue des Fleurs",
    details: "La fuite d'eau signalée a été réparée. Merci de votre patience."
  },
  { 
    icon: "alert-circle-outline",
    color: THEME.danger,
    title: "Alertes Importantes",
    date: "18 septembre 2024",
    details: "En raison des fortes pluies prévues cette semaine, nous vous recommandons de limiter vos déplacements et de vérifier les alertes météo régulièrement."
  }
];

/**
 * Fonction utilitaire pour ajuster les couleurs
 */
function adjustColor(color: string, amount: number): string {
  // Si c'est un code hexadécimal, convertir en RGB
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    // Convertir 3 chiffres en 6 chiffres
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // Convertir en RGB
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Ajuster les valeurs RGB
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    // Reconvertir en hexa
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  }
  
  // Si ce n'est pas un hexa, retourner la couleur d'origine
  return color;
}

/**
 * MayorInfoSection - Affiche les informations de la mairie avec un design moderne
 * 
 * Ce composant présente les actualités de la mairie, les informations du maire,
 * et les coordonnées de contact dans un format élégant et interactif avec une 
 * navigation par onglets pour une meilleure organisation du contenu.
 */
const MayorInfoSection: React.FC<MayorInfoSectionProps> = memo(({
  isVisible,
  toggleVisibility,
  onPhonePress
}) => {
  // État local pour le nombre d'actualités importantes
  const [newsCount] = useState(3);
  
  // Hook personnalisé pour gérer la navigation par onglets
  const { 
    activeTab, 
    indicatorTranslate, 
    handleTabChange 
  } = useTabNavigation();
  
  // Hook personnalisé pour gérer les animations de visibilité
  const {
    contentHeight,
    contentOpacity,
    headerScaleAnim,
    badgePulse,
    tabsFadeAnim,
    handleHeaderPressIn,
    handleHeaderPressOut
  } = useAnimatedVisibility({
    isVisible,
    newsCount,
    animationDuration: ANIMATION_DURATION
  });

  // Animation de rotation pour la flèche
  const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const contentTranslateY = useRef(new Animated.Value(isVisible ? 0 : 50)).current;

  // Animation lors du changement de visibilité
  React.useEffect(() => {
    // Animation de rotation de la flèche
    Animated.timing(rotateAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animation de glissement du contenu
    Animated.timing(contentTranslateY, {
      toValue: isVisible ? 0 : 30,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [isVisible, rotateAnim, contentTranslateY]);

  // Animation de rotation pour l'icône de flèche
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  // Rendu du contenu en fonction de l'onglet actif
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'news':
        return (
          <ScrollView 
            style={styles.contentScroll}
            contentContainerStyle={styles.newsContainer}
            showsVerticalScrollIndicator={false}
          >
            {NEWS_ITEMS.map((item, index) => (
              <NewsItem key={`news-${index}`} {...item} />
            ))}
          </ScrollView>
        );
      case 'mayor':
        return <MayorProfile onPhonePress={onPhonePress} />;
      case 'contact':
        return <ContactInfo onPhonePress={onPhonePress} />;
      default:
        return null;
    }
  }, [activeTab, onPhonePress]);

  return (
    <View style={styles.container}>
      {/* Conteneur principal avec position relative pour le z-index */}
      <View style={styles.relativeContainer}>
        {/* En-tête de section avec design harmonisé */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              backgroundColor: isVisible ? EXPANDED_BACKGROUND : COLLAPSED_BACKGROUND,
              borderBottomLeftRadius: isVisible ? 0 : 20,
              borderBottomRightRadius: isVisible ? 0 : 20,
              transform: [{ scale: headerScaleAnim }],
              borderBottomWidth: isVisible ? 1 : 0,
              borderBottomColor: isVisible ? THEME.border : "transparent",
              elevation: isVisible ? 5 : 2,
              shadowOpacity: isVisible ? 0.06 : 0.08,
            },
          ]}
        >
          <Pressable
            onPress={toggleVisibility}
            onPressIn={handleHeaderPressIn}
            onPressOut={handleHeaderPressOut}
            style={styles.header}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.05)', borderless: true }}
          >
            <View style={styles.headerContent}>
              {/* Icône et titre */}
              <View style={styles.titleContainer}>
                <LinearGradient
                  colors={[THEME.primary, THEME.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconContainer}
                >
                  <MaterialIcons
                    name="location-city"
                    size={24}
                    color="#FFFFFF"
                  />
                </LinearGradient>
                <View>
                  <Text style={styles.title}>Informations mairie</Text>
                  <Text style={styles.subtitle}>
                    Actualités et contacts
                  </Text>
                </View>
              </View>

              {/* Badge de nombre d'actualités et flèche */}
              <View style={styles.headerControls}>
                {newsCount > 0 && (
                  <Animated.View
                    style={[
                      styles.countBadge,
                      { transform: [{ scale: badgePulse }] },
                    ]}
                  >
                    <LinearGradient
                      colors={[THEME.secondary, THEME.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.countBadgeGradient}
                    >
                      <Text style={styles.countText}>{newsCount}</Text>
                    </LinearGradient>
                  </Animated.View>
                )}

                <Animated.View
                  style={[
                    styles.arrowContainer,
                    {
                      transform: [
                        { rotate: arrowRotation },
                        { scale: isVisible ? 1.1 : 1 }
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={isVisible ? 
                      [THEME.primary, THEME.primaryDark] : 
                      ['#A0AEC0', '#718096']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.arrowIndicator}
                  >
                    <Text style={styles.arrowIcon}>⌄</Text>
                  </LinearGradient>
                </Animated.View>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Contenu avec navigation par onglets */}
        {isVisible && (
          <View
            style={styles.sectionContentContainer}
          >
            <LinearGradient
              colors={[EXPANDED_BACKGROUND, "#FFFFFF"]}
              style={styles.sectionContent}
            >
              <Animated.View
                style={[
                  styles.contentInner,
                  {
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslateY }],
                  },
                ]}
              >
                {/* Barre d'onglets */}
                <TabBar 
                  activeTab={activeTab}
                  handleTabChange={handleTabChange}
                  indicatorTranslate={indicatorTranslate}
                  tabsFadeAnim={tabsFadeAnim}
                />
                
                {/* Contenu des onglets */}
                <TabContent contentOpacity={contentOpacity}>
                  {renderTabContent()}
                </TabContent>
              </Animated.View>
            </LinearGradient>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    overflow: "hidden",
    borderRadius: 24,
    marginHorizontal: 10,
  },
  relativeContainer: {
    position: "relative", 
    zIndex: 1
  },
  // Styles du header harmonisés avec les autres composants
  headerContainer: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    borderRadius: 20,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textLight,
    letterSpacing: -0.2,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Badge de comptage avec animation de pulsation et dégradé
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: THEME.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  countBadgeGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  arrowContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  arrowIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: -10,
  },
  
  // Styles du contenu
  sectionContentContainer: {
    overflow: "hidden",
    marginTop: -1, // Chevauchement léger pour éliminer toute ligne visible
    borderTopWidth: 0,
    zIndex: 0,
  },
  sectionContent: {
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contentInner: {
    paddingHorizontal: 15,
  },
  contentScroll: {
    flex: 1,
  },
  newsContainer: {
    padding: 16,
  },
  // Conservé pour le TabBar et le TabContent
  expandableContainer: {
    overflow: 'hidden',
  },
  expandableContent: {
    borderRadius: 20,
    flex: 1,
    overflow: 'hidden',
  },
});

export default MayorInfoSection;