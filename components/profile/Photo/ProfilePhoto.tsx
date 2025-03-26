// components/profile/Photo/ProfilePhoto.tsx

import React, { memo, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Animated, 
  Easing, 
  TouchableOpacity,
  Dimensions,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { profileStyles } from "../../../styles/profileStyles";
import { ProfilePhotoProps } from "./types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");
const PROFILE_SIZE = width * 0.30; // 30% de la largeur de l'écran

export const ProfilePhoto: React.FC<ProfilePhotoProps> = memo(({ 
  photoUrl, 
  ranking,
  username,
  bio,
  createdAt,
  isFollowing, 
  isSubmitting,
  onFollow, 
  onUnfollow, 
}) => {

  interface ActionButtonProps {
    label: string;
    onPress: () => void;
    isPrimary?: boolean;
    disabled?: boolean;
    icon?: string;
  }
  
  /**
   * Composant ActionButton modernisé avec animations avancées et design adaptatif
   */
  const ActionButton: React.FC<ActionButtonProps> = memo(({ 
    label, 
    onPress, 
    isPrimary = true, 
    disabled = false,
    icon
  }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const shadowOpacity = useRef(new Animated.Value(isPrimary ? 0.4 : 0.2)).current;
    
    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };
    
    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };
    
    // Couleurs selon le thème et l'état du bouton
    const getColors = () => {
      if (disabled) {
        return {
          bgStart: '#E5E5E5',
          bgEnd: '#D9D9D9',
          textColor: '#999999',
          borderColor: '#CCCCCC'
        };
      }
      
      if (isPrimary) {
        return {
          bgStart: '#0F84FE',  // Bleu iOS plus clair en haut
          bgEnd: '#0A64CE',    // Bleu iOS plus foncé en bas
          textColor: '#FFFFFF',
          borderColor: '#0960C0'
        };
      }
      
      return {
        bgStart: '#FFFFFF',
        bgEnd: '#F7F7F9',
        textColor: '#0F84FE',  // Texte en bleu iOS
        borderColor: '#E1E3E8'
      };
    };
    
    const colors = getColors();
    
    // Style d'ombre dynamique pour les animations
    const shadowStyle = {
      shadowColor: isPrimary ? '#0A64CE' : '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: shadowOpacity,
      shadowRadius: 6,
      elevation: isPrimary ? 5 : 3
    };
    
    return (
      <Animated.View 
        style={[
          buttonStyles.buttonContainer,
          { 
            transform: [{ scale }],
            opacity: disabled ? 0.7 : opacity
          },
          shadowStyle
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={disabled ? undefined : onPress}
          onPressIn={disabled ? undefined : handlePressIn}
          onPressOut={disabled ? undefined : handlePressOut}
          style={buttonStyles.touchableArea}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          accessibilityLabel={label}
        >
          <LinearGradient
            colors={[colors.bgStart, colors.bgEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              buttonStyles.gradientBackground,
              { borderColor: colors.borderColor }
            ]}
          >
            {icon && (
              <Icon 
                name={icon} 
                size={18} 
                color={colors.textColor} 
                style={buttonStyles.buttonIcon} 
              />
            )}
            <Text 
              style={[
                buttonStyles.buttonText,
                { color: colors.textColor }
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  });
  ActionButton.displayName = 'ActionButton';
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Badge dynamique selon le classement
  const getBadgeColors = (): [string, string, ...string[]] => {
    if (ranking === 1) return ["#FFD700", "#FFC400", "#E2B100"];     // Or
    if (ranking === 2) return ["#E0E0E0", "#C0C0C0", "#A9A9A9"];     // Argent
    if (ranking === 3) return ["#CD7F32", "#B87333", "#A0522D"];     // Bronze
    return ["#4B9CD3", "#3F87F5", "#1A73E8"];                        // Bleu par défaut
  };
  
  const getRankingEmoji = () => {
    if (ranking === 1) return "👑";        // Couronne pour le 1er
    if (ranking === 2) return "🥈";        // Médaille d'argent
    if (ranking === 3) return "🥉";        // Médaille de bronze
    if (ranking && ranking <= 10) return "⭐"; // Étoile pour top 10
    return "👤";                           // Utilisateur standard
  };
  
  const getRankingText = () => {
    if (ranking === 1) return "TOP 1";
    if (ranking === 2) return "TOP 2";
    if (ranking === 3) return "TOP 3";
    if (ranking && ranking <= 10) return `TOP ${ranking}`;
    if (ranking) return `#${ranking}`;
    return "";
  };

  // Gestion des actions d'abonnement/désabonnement
  const handleFollowAction = () => {
    if (isFollowing && onUnfollow) {
      onUnfollow();
    } else if (!isFollowing && onFollow) {
      onFollow();
    }
  };
  
  // Fonctions pour formater la date d'inscription
  const getMembershipText = () => {
    if (createdAt) {
      const date = new Date(createdAt);
      // Formatez selon la locale française
      const formattedDate = date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return `Membre depuis le ${formattedDate}`;
    }
    return bio || "Membre de la communauté";
  };

  // Lancer les animations au montage du composant
  useEffect(() => {
    // Animation d'entrée en séquence
    Animated.sequence([
      // Fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Scaling avec rebond
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    
    // Animation de rotation subtile pour les badges de top 3
    if (ranking && ranking <= 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, []);

  // Transformation pour la rotation
  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2deg', '0deg', '2deg']
  });
  
  return (
    <View style={styles.container}>
      {/* Fond stylisé */}
      <LinearGradient
        colors={['#F8F9FA', '#E9ECEF']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Effet décoratif pour le profile */}
        <View style={styles.decorativeBubble} />
        <View style={[styles.decorativeBubble, styles.decorativeBubbleAlt]} />
      </LinearGradient>
      
      {/* Profil principal */}
      <View style={styles.profileContent}>
        {/* Photo de profil avec animations */}
        <Animated.View 
          style={[
            styles.profileImageWrapper,
            { 
              transform: [
                { scale: scaleAnim },
                { rotate }
              ],
              opacity: opacityAnim 
            }
          ]}
        >
          {ranking && ranking <= 3 && (
            <LinearGradient
              colors={getBadgeColors()}
              style={styles.gradientBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.innerContainer}>
                {photoUrl ? (
                  <Image 
                    source={{ uri: photoUrl }} 
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="person" size={PROFILE_SIZE/2} color="#CED4DA" />
                  </View>
                )}
              </View>
            </LinearGradient>
          )}
          
          {(!ranking || ranking > 3) && (
            <View style={styles.regularProfileContainer}>
              {photoUrl ? (
                <Image 
                  source={{ uri: photoUrl }} 
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="person" size={PROFILE_SIZE/2} color="#CED4DA" />
                </View>
              )}
            </View>
          )}
          
          {/* Badge de classement */}
          {ranking && (
            <Animated.View style={[
              styles.rankingBadge,
              ranking <= 3 && styles.topRankingBadge
            ]}>
              <BlurView intensity={80} style={styles.badgeBlur}>
                <Text style={styles.rankingEmoji}>{getRankingEmoji()}</Text>
                <Text style={styles.rankingText}>{getRankingText()}</Text>
              </BlurView>
            </Animated.View>
          )}
        </Animated.View>
        
        {/* Infos utilisateur */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.bio}>{getMembershipText()}</Text>
        </View>
        
        {/* Bouton d'action */}
        <View style={styles.actionContainer}>
          <ActionButton
            label={isFollowing ? "Se désabonner" : "S'abonner"}
            icon={isFollowing ? "account-remove" : "account-plus"}
            onPress={handleFollowAction}
            disabled={isSubmitting}
            isPrimary={!isFollowing}
          />
        </View>
      </View>
    </View>
  );
});

// Styles pour le composant ActionButton
const buttonStyles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  touchableArea: {
    width: '100%',
  },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  }
});

// Styles pour le composant ProfilePhoto
const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerGradient: {
    height: PROFILE_SIZE * 0.65,
    width: "100%",
    position: "absolute",
    top: 0,
    overflow: "hidden",
  },
  decorativeBubble: {
    position: "absolute",
    width: PROFILE_SIZE * 1.5,
    height: PROFILE_SIZE * 1.5,
    borderRadius: PROFILE_SIZE * 0.75,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    top: -PROFILE_SIZE * 0.75,
    right: PROFILE_SIZE * 0.25,
  },
  decorativeBubbleAlt: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE * 0.5,
    left: -PROFILE_SIZE * 0.3,
    top: PROFILE_SIZE * 0.2,
  },
  profileContent: {
    alignItems: "center",
    paddingTop: PROFILE_SIZE * 0.25,
    paddingBottom: 20,
  },
  profileImageWrapper: {
    marginTop: 10,
    marginBottom: 16,
  },
  gradientBorder: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  innerContainer: {
    width: "93%",
    height: "93%",
    borderRadius: PROFILE_SIZE / 2,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  regularProfileContainer: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
    borderWidth: 3,
    borderColor: "#DEE2E6",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  rankingBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  topRankingBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.01)",
  },
  badgeBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rankingEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  rankingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#495057",
  },
  userInfoContainer: {
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  
  bio: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
  },
  actionContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});

ProfilePhoto.displayName = 'ProfilePhoto';