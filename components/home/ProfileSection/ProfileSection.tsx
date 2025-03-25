// Chemin: components/home/ProfileSection/ProfileSection.tsx

import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { User, UserStats as UserStatsType } from "./user.types";
import { useBadge } from "../../../hooks/ui/useBadge";
import RankBadge from "./RankBadge";

// Constantes pour le dimensionnement adaptatif
const SCREEN_WIDTH = Dimensions.get("window").width;

interface ProfileSectionProps {
  user: User | null;
  stats: UserStatsType | null;
  displayName: string;
  memberSince: string;
  voteSummary: { up: number; down: number };
  ranking: number | null;
  totalUsers: number | null;
  rankingSuffix: string;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  onShowNameModal: () => void;
  onShowBadgeModal: () => void;
  onShowVoteInfoModal: () => void;
  onNavigateToRanking: () => void;
  onNavigateToCity: () => void;
  updateProfileImage: (uri: string) => Promise<boolean>;
}

/**
 * ProfileSection: Composant optimisé pour l'affichage d'un profil de type réseau social
 * - Design moderne et immersif avec intégration fluide des métriques
 * - Avis communautaires intégrés directement dans le profil pour une meilleure cohérence visuelle
 * - Performance améliorée avec mémoïsation des calculs et optimisations de rendu
 */
const ProfileSection: React.FC<ProfileSectionProps> = memo(
  ({
    user,
    stats,
    displayName,
    memberSince,
    voteSummary,
    ranking,
    totalUsers,
    rankingSuffix,
    onShowFollowers,
    onShowFollowing,
    onShowNameModal,
    onShowBadgeModal,
    onShowVoteInfoModal,
    onNavigateToRanking,
    onNavigateToCity,
    updateProfileImage,
  }) => {
    const { getBadgeStyles } = useBadge();
    const badgeStyle = getBadgeStyles(stats?.votes?.length || 0);

    const totalFeedback = voteSummary.up + voteSummary.down;
    // Remplacez la déclaration des variables positiveFlex et negativeFlex par :
    const positiveFlex = totalFeedback === 0 ? 0.5 : voteSummary.up;
    const negativeFlex = totalFeedback === 0 ? 0.5 : voteSummary.down;

   const formattedData = useMemo(() => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const total = voteSummary.up + voteSummary.down;
  // Calcul précis du ratio
  const voteRatio = total === 0 ? 50 : Math.round((voteSummary.up / total) * 100);
  const negativeRatio = total === 0 ? 50 : 100 - voteRatio;

  return {
    formattedUpVotes: formatNumber(voteSummary.up),
    formattedDownVotes: formatNumber(voteSummary.down),
    voteRatio,
    negativeRatio,
    formattedFollowers: formatNumber(user?.followers?.length || 0),
    formattedFollowing: formatNumber(user?.following?.length || 0),
  };
}, [voteSummary, user?.followers?.length, user?.following?.length]);

    // Couleur dynamique basée sur le ratio de votes
    // Modification de la variable ratingColor
    const ratingColor = useMemo(() => {
      if (totalFeedback === 0) return "#4CAF50"; // Vert par défaut si aucun feedback
      if (formattedData.voteRatio >= 85) return "#4CAF50";
      if (formattedData.voteRatio >= 60) return "#8BC34A";
      if (formattedData.voteRatio >= 50) return "#FF9800";
      return "#FF9800";
    }, [formattedData.voteRatio, totalFeedback]);

    return (
      <View style={styles.container}>
        {/* Header avec fond dégradé */}
        <LinearGradient
          colors={["#062C41", "#041E2D"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Actions rapides: localisation et paramètres */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={onNavigateToCity}
              activeOpacity={0.8}
            >
              <Ionicons name="location" size={16} color="#FFF" />
              <Text style={styles.locationText} numberOfLines={1}>
                Ma ville : {user?.nomCommune || "HAUBOURDIN"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={onShowNameModal}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Informations principales de l'utilisateur */}
          <View style={styles.profileMainRow}>
            {/* Photo de profil */}
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={() => updateProfileImage("")}
              activeOpacity={0.85}
            >
              {user?.profilePhoto?.url ? (
                <Image
                  source={{ uri: user.profilePhoto.url }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={32} color="#9EAEBB" />
                </View>
              )}
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>

            {/* Infos utilisateur */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#4CAF50"
                  style={styles.verifiedIcon}
                />
              </View>
              <Text style={styles.memberInfo}>Membre depuis {memberSince}</Text>

              {/* Section d'engagement social - Nouveau design type pill */}
              <View style={styles.socialEngagementContainer}>
                <TouchableOpacity
                  style={styles.followPill}
                  onPress={onShowFollowers}
                  activeOpacity={0.75}
                >
                  <View style={styles.followPillInner}>
                    <Text style={styles.followCount}>
                      {formattedData.formattedFollowers}
                    </Text>
                    <Text style={styles.followType}>abonnés</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.followSeparator} />

                <TouchableOpacity
                  style={styles.followPill}
                  onPress={onShowFollowing}
                  activeOpacity={0.75}
                >
                  <View style={styles.followPillInner}>
                    <Text style={styles.followCount}>
                      {formattedData.formattedFollowing}
                    </Text>
                    <Text style={styles.followType}>abonnements</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Intégration de l'avis de la communauté */}
              <TouchableOpacity
                style={styles.communityRatingContainer}
                onPress={onShowVoteInfoModal}
                activeOpacity={0.8}
              >
                <View style={styles.ratingLabelsContainer}>
                  <View style={styles.positiveRatingLabel}>
                    <Text style={styles.ratingPercentage}>
                      {formattedData.voteRatio}% feedback positif
                    </Text>
                    <Text style={styles.voteCount}>
                      ({voteSummary.up} {voteSummary.up > 1 ? "votes" : "vote"})
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBarMini}>
                  <View
                    style={[
                      styles.positiveProgressMini,
                      {
                        flex: positiveFlex,
                        backgroundColor: ratingColor,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.negativeProgressMini,
                      { flex: negativeFlex },
                    ]}
                  />
                </View>

                <View style={styles.ratingLabelsContainer}>
                  <View style={{ flex: 1 }} />
                  <View style={styles.negativeRatingLabel}>
                    <Text style={styles.ratingPercentage}>
                      {formattedData.negativeRatio}% feedback négatif
                    </Text>
                    <Text style={styles.voteCount}>
                      ({voteSummary.down}{" "}
                      {voteSummary.down > 1 ? "votes" : "vote"})
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section du badge de classement avec le badge utilisateur dynamique */}
          <View style={styles.rankingSection}>
            <RankBadge
              ranking={ranking}
              rankingSuffix={rankingSuffix}
              totalUsers={totalUsers}
              onNavigateToRanking={onNavigateToRanking}
              // Passer le badgeStyle pour tous les utilisateurs, pas seulement le premier
              badgeStyle={badgeStyle}
              onShowBadgeModal={onShowBadgeModal}
            />
          </View>
        </LinearGradient>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F7FA",
    marginBottom: 6,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 100 : 110, // Ajustement pour le header natif
    paddingBottom: 8,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 20,
    maxWidth: SCREEN_WIDTH * 0.5,
  },
  locationText: {
    color: "#FFF",
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "500",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileMainRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "flex-start",
  },
  profileImageContainer: {
    width: 90,
    height: 110,
    borderRadius: 20,
    marginRight: 16,
  },
  profileImage: {
    width: 90,
    height: 100,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileImagePlaceholder: {
    width: 90,
    height: 100,
    borderRadius: 20,
    backgroundColor: "#E0E5EB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4C92DD",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 4,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 5,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  memberInfo: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Nouveaux styles pour l'avis de la communauté intégré
  communityRatingContainer: {
    marginTop: 5,
  },
  ratingLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    marginTop: 2,
  },
  positiveRatingLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  negativeRatingLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  ratingPercentage: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 4,
  },
  voteCount: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
  },
  progressBarMini: {
    height: 6,
    flexDirection: "row",
    borderRadius: 3,
    overflow: "hidden",
    width: "100%",
    marginVertical: 3,
  },
  positiveProgressMini: {
    height: "100%",
  },
  negativeProgressMini: {
    backgroundColor: "#F44336",
    height: "100%",
  },
  // Styles pour la nouvelle section d'engagement social
  socialEngagementContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  followPill: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.13)",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  followPillInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  followCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 6,
  },
  followType: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
  },
  followSeparator: {
    width: 16,
  },
  // Section du badge de classement
  rankingSection: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default ProfileSection;
