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

// Configuration des couleurs pour le thème
const THEME = {
  primary: "#3498db",
  primaryDark: "#2980b9",
  secondary: "#A1869E",
  secondaryTransparent: "rgba(161, 134, 158, 0.2)",
  background: "rgba(255, 255, 255, 0.7)",
  backgroundDark: "rgba(239, 241, 245, 0.85)",
  text: "#2c3e50",
  textLight: "#7f8c8d",
  success: "#27ae60",
  warning: "#f39c12",
  danger: "#e74c3c",
  border: "rgba(255, 255, 255, 0.3)",
  shadow: "rgba(0, 0, 0, 0.1)",
  accent: "#6366F1",
};

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
        {/* En-tête de section avec design moderne */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              backgroundColor: isVisible
                ? THEME.secondaryTransparent
                : '#FFFFFF',
              borderBottomLeftRadius: isVisible ? 0 : 20,
              borderBottomRightRadius: isVisible ? 0 : 20,
              transform: [{ scale: headerScaleAnim }],
              borderBottomWidth: isVisible ? 1 : 0,
              borderBottomColor: isVisible
                ? THEME.secondaryTransparent
                : "transparent",
            },
          ]}
        >
          <Pressable
            onPress={toggleVisibility}
            onPressIn={handleHeaderPressIn}
            onPressOut={handleHeaderPressOut}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              {/* Icône et titre */}
              <View style={styles.titleContainer}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="location-city"
                    size={24}
                    color={THEME.secondary}
                  />
                </View>
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
                    <Text style={styles.countText}>{newsCount}</Text>
                  </Animated.View>
                )}

                <Animated.View
                  style={[
                    styles.arrowContainer,
                    { transform: [{ rotate: isVisible ? '180deg' : '0deg' }] },
                  ]}
                >
                  <Text style={styles.arrowIcon}>⌄</Text>
                </Animated.View>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Contenu avec navigation par onglets */}
        {isVisible && (
          <Animated.View 
            style={[
              styles.expandableContainer,
              { 
                height: contentHeight,
                marginTop: -1, // Chevauchement léger pour éliminer toute ligne visible
                borderTopWidth: 0,
                zIndex: 0
              }
            ]}
          >
            <LinearGradient
              colors={[THEME.secondaryTransparent, "rgba(255, 255, 255, 0.7)"]}
              style={[
                styles.expandableContent,
                {
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  ...Platform.select({
                    ios: {
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.1,
                    },
                    android: {
                      elevation: 2,
                    },
                  }),
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
            </LinearGradient>
          </Animated.View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    overflow: 'hidden',
  },
  relativeContainer: {
    position: "relative", 
    zIndex: 1
  },
  // Styles du header
  headerContainer: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: THEME.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  countText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#4F566B',
    fontWeight: 'bold',
  },
  
  // Styles du contenu
  expandableContainer: {
    overflow: 'hidden',
  },
  expandableContent: {
    borderRadius: 20,
    flex: 1,
    overflow: 'hidden',
  },
  // Styles pour le contenu des onglets
  contentScroll: {
    flex: 1,
  },
  newsContainer: {
    padding: 16,
  },
});

export default MayorInfoSection;