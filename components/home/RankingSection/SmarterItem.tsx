// Chemin : src/components/RankingSection/SmarterItem.tsx

import React, { memo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions,
} from "react-native";
import { SmarterUser } from "../../../types/entities/user.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Configuration pour Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Interface pour les propriétés du composant SmarterItem
 */
interface SmarterItemProps {
  user: SmarterUser;
  index: number;
  onPress: (id: string) => void;
  isActive?: boolean;
  isPodium?: boolean; // Indique si l'utilisateur est sur le podium (top 3)
  podiumPosition?: "left" | "center" | "right"; // Position sur le podium
}

/**
 * SmarterItem - Composant représentant un utilisateur dans le classement
 * Version premium avec design élégant et subtil
 */
const SmarterItem: React.FC<SmarterItemProps> = memo(
  ({
    user,
    index,
    onPress,
    isActive = false,
    isPodium = false,
    podiumPosition,
  }) => {
    // Animations
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(20)).current;
    const highlightAnim = useRef(new Animated.Value(0)).current;

    // Métriques relatives au classement
    const rank = index + 1;

    // Couleurs et styles selon le classement
    // Couleurs premium améliorées avec plus d'intensité et d'éclat

    const accentColor = (() => {
      switch (rank) {
        case 1:
          return "#FFD700"; // Or premium plus intense et brillant
        case 2:
          return "#D5D5D5"; // Argent premium plus métallique
        case 3:
          return "#CD7F32"; // Bronze premium plus riche
        default:
          return "#3A70E0"; // Bleu premium légèrement ajusté
      }
    })();

    // Animations d'entrée différées selon l'index
    useEffect(() => {
      const entryDelay = isPodium ? 400 + index * 100 : 600 + index * 80;

      Animated.sequence([
        Animated.delay(entryDelay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.elastic(1.1),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []);

    // Animation de mise en évidence pour les éléments actifs
    useEffect(() => {
      if (isActive) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(highlightAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
            Animated.timing(highlightAnim, {
              toValue: 0.3,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: false,
            }),
          ])
        ).start();
      } else {
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    }, [isActive]);

    // Interpolation pour la luminosité de la bordure
    const borderOpacity = highlightAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.8],
    });

    // Gestion des pressions
    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        friction: 8,
        useNativeDriver: true,
      }).start();

      LayoutAnimation.configureNext({
        duration: 200,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    // Style différent selon que l'élément soit sur le podium ou dans la liste
    if (isPodium) {
      return (
        <Animated.View
          style={[
            styles.podiumContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            },
            podiumPosition === "left" && styles.podiumLeft,
            podiumPosition === "center" && styles.podiumCenter,
            podiumPosition === "right" && styles.podiumRight,
          ]}
        >
          <Pressable
            onPress={() => onPress(user.id)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [
              styles.podiumCard,
              {
                backgroundColor: rank === 1 ? "#FFFAF0" : "#FFFFFF",
              },
              pressed && { opacity: 0.9 },
            ]}
          >
            {/* Effet d'ombre colorée */}
            <Animated.View
              style={[
                styles.podiumGlow,
                {
                  backgroundColor: accentColor,
                  opacity: isActive ? borderOpacity : 0.4,
                },
              ]}
            />

            {/* Badge de rang */}
            <View
              style={[styles.podiumBadge, { backgroundColor: accentColor }]}
            >
              <Text style={styles.podiumBadgeText}>{rank}</Text>
            </View>

            {/* Avatar */}
            <View style={styles.podiumAvatarContainer}>
              <View
                style={[
                  styles.podiumAvatarBorder,
                  { borderColor: accentColor },
                ]}
              >
                <Image
                  source={{
                    uri: user.image?.uri || "https://via.placeholder.com/100",
                  }}
                  style={styles.podiumAvatar}
                />
              </View>
            </View>

            {/* Informations utilisateur */}
            <Text
              style={styles.podiumName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.displayName || "Anonyme"}
            </Text>

            {user.points !== undefined && (
              <View style={styles.podiumScoreContainer}>
                <Text style={[styles.podiumScore, { color: accentColor }]}>
                  {user.points.toLocaleString()} pts
                </Text>
              </View>
            )}

            {rank === 1 && (
              <View style={styles.crownContainer}>
                <View
                  style={[
                    styles.crownContainer,
                    {
                      shadowColor: "#FFD700",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="crown"
                    size={24}
                    color="#FFD700"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.3,
                      shadowRadius: 2,
                    }}
                  />
                </View>
              </View>
            )}
          </Pressable>
        </Animated.View>
      );
    }

    // Rendu standard pour les éléments de liste (non podium)
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          },
        ]}
      >
        <Pressable
          onPress={() => onPress(user.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.card,
            isActive && styles.activeCard,
            pressed && styles.pressedCard,
          ]}
        >
          {/* Bordure animée pour les éléments actifs */}
          {isActive && (
            <Animated.View
              style={[
                styles.activeBorder,
                {
                  borderColor: accentColor,
                  opacity: borderOpacity,
                },
              ]}
            />
          )}

          {/* Rank indicator */}
          <View style={styles.rankContainer}>
            <View
              style={[
                styles.rankBadge,
                { backgroundColor: isActive ? accentColor : "#F0F2F5" },
              ]}
            >
              <Text
                style={[
                  styles.rankText,
                  { color: isActive ? "#FFFFFF" : "#1B5D85" },
                ]}
              >
                {rank}
              </Text>
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatarBorder,
                { borderColor: isActive ? accentColor : "transparent" },
              ]}
            >
              <Image
                source={{
                  uri: user.image?.uri || "https://via.placeholder.com/100",
                }}
                style={styles.avatar}
              />
            </View>
          </View>

          {/* Informations utilisateur */}
          <View style={styles.userInfo}>
            <Text
              style={styles.userName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.displayName || "Anonyme"}
            </Text>

            {user.points !== undefined && (
              <View style={styles.scoreContainer}>
                <Text
                  style={[
                    styles.score,
                    isActive && { color: accentColor, fontWeight: "600" },
                  ]}
                >
                  {user.points.toLocaleString()} pts
                </Text>
              </View>
            )}
          </View>

          {/* Indicateur de localisation */}
          {user.location && (
            <View style={styles.locationContainer}>
              <Text
                style={styles.location}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user.location}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  // Styles pour les éléments de podium (top 3)
  podiumContainer: {
    width: 100,
    alignItems: "center",
    marginHorizontal: 5,
  },
  podiumLeft: {
    marginTop: 40,
  },
  podiumCenter: {
    marginTop: 0,
    width: 110,
  },
  podiumRight: {
    marginTop: 60,
  },
  podiumCard: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  podiumGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    opacity: 0.2,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.15)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 20,
      },
      android: {
        // Android ne supporte pas les ombres comme iOS
      },
    }),
  },
  podiumBadge: {
    position: "absolute",
    top: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F2BD57",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  podiumBadgeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  podiumAvatarContainer: {
    marginBottom: 10,
  },
  podiumAvatarBorder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
    textAlign: "center",
  },
  podiumScoreContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  podiumScore: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F2BD57",
  },
  crownContainer: {
    position: "absolute",
    top: -15,
    left: "50%",
    marginLeft: -2,
  },
  crownIcon: {
    fontSize: 24,
  },

  // Styles pour les éléments de liste standard
  container: {
    width: "100%",
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.06)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeCard: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pressedCard: {
    backgroundColor: "#F9FAFC",
  },
  activeBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 16,
    borderColor: "#4A80F0",
  },
  rankContainer: {
    marginRight: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F566B",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  score: {
    fontSize: 14,
    color: "#6B7280",
  },
  locationContainer: {
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  location: {
    fontSize: 12,
    color: "#6B7280",
    maxWidth: 80,
  },
});

export default SmarterItem;
