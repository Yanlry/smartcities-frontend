import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import Icon from "react-native-vector-icons/FontAwesome";
import { getUserIdFromToken } from "../utils/tokenUtils";
import axios from "axios";
import { Linking } from 'react-native';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  useFullName?: boolean;
  vote?: { id: number; value: number }[];
  email?: string;
  trustRate?: number;
  followers?: { id: number; username: string; profilePhoto?: string }[];
  following?: { id: number; username: string; profilePhoto?: string }[];
  profilePhoto?: { url: string };
  showEmail?: boolean;
  latitude?: number;
  longitude?: number;
};

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params; // ID de l'utilisateur à afficher
  const [user, setUser] = useState<User | null>(null); // Données de l'utilisateur
  const [loading, setLoading] = useState(true); // Chargement des données
  const [error, setError] = useState<string | null>(null); // Gestion des erreurs
  const [isFollowing, setIsFollowing] = useState(false); // État de suivi
  const [isSubmitting, setIsSubmitting] = useState(false); // Pour bloquer les clics pendant une requête
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // ID de l'utilisateur connecté
  const [stats, setStats] = useState<any>(null);

  // Chargement des données utilisateur
  useEffect(() => {
    async function fetchData() {
      try {
        // Récupérer l'ID de l'utilisateur connecté
        const userIdFromToken = await getUserIdFromToken();
        setCurrentUserId(userIdFromToken);

        // Récupérer les données de l'utilisateur à afficher
        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des données utilisateur"
          );
        }

        const data = await response.json();
        setUser(data);

        // Vérifier si l'utilisateur connecté suit déjà cet utilisateur
        const isCurrentlyFollowing = data.followers?.some(
          (follower) => follower.id === userIdFromToken
        );
        setIsFollowing(isCurrentlyFollowing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
  
        // Utiliser l'ID du profil visité (userId)
        const response = await axios.get(`${API_URL}/users/stats/${userId}`);
        if (response.status !== 200) {
          throw new Error(`Erreur API : ${response.statusText}`);
        }
  
        const data = response.data;
        if (!data.votes) {
          data.votes = [];
        }
  
        setStats(data);
      } catch (error: any) {
        console.error("Erreur dans fetchStats :", error.message || error);
        setError("Impossible de récupérer les statistiques.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchStats();
  }, [userId]); // Ajout de userId comme dépendance
  

  // Gestion du suivi (Follow)
  const handleFollow = async () => {
    if (!currentUserId) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/users/${userId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUserId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du suivi de cet utilisateur.");
      }

      setIsFollowing(true);

      // Mettre à jour localement la liste des followers
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              followers: [
                ...(prevUser.followers || []),
                {
                  id: currentUserId,
                  username: "Vous",
                  profilePhoto: undefined, // Pas de photo locale pour "Vous"
                },
              ],
            }
          : prevUser
      );
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion du désuivi (Unfollow)
  const handleUnfollow = async () => {
    if (!currentUserId) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/users/${userId}/unfollow`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUserId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du désuivi de cet utilisateur.");
      }

      setIsFollowing(false);

      // Mettre à jour localement la liste des followers
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              followers: (prevUser.followers || []).filter(
                (follower) => follower.id !== currentUserId
              ),
            }
          : null
      );
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Chargement du profil utilisateur...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  const displayName = user?.useFullName
    ? `${user.firstName} ${user.lastName}`
    : user?.username;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="chevron-left"
            size={28}
            color="#333"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {displayName || "Cet utilisateur"}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Icon
            name="warning"
            size={28}
            color="#333"
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>

      {/* Image de profil */}
      <View style={styles.profileImageContainer}>
        {user?.profilePhoto?.url ? (
          <Image
            source={{ uri: user.profilePhoto.url }}
            style={styles.profileImage}
          />
        ) : (
          <Text style={styles.noProfileImageText}>Pas de photo de profil</Text>
        )}
      </View>

      {/* Bouton de suivi */}
      <View style={styles.followButtonContainer}>
        <TouchableOpacity
          style={[
            styles.followButton,
            { backgroundColor: isFollowing ? "#EE6352" : "#57A773" },
          ]}
          onPress={isFollowing ? handleUnfollow : handleFollow}
          disabled={isSubmitting} // Bloquer pendant la requête
        >
          <Text style={styles.followButtonText}>
            {isFollowing ? "Se désabonner" : "S'abonner"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Informations de base */}
      <View style={styles.infoCardContainer}>
  <Text style={styles.infoCardHeader}>Informations personnelles</Text>
  
  {/* Nom d'utilisateur */}
  <View style={styles.infoItem}>
    <Icon name="user" size={20} style={styles.icon} />
    <Text style={styles.infoLabel}>Nom d'utilisateur :</Text>
    <Text style={styles.infoValueName}>
      {displayName || <Text style={styles.placeholderValue}>Non renseigné</Text>}
    </Text>
  </View>
  
  {/* Email */}

<View style={styles.infoItem}>
  <Icon name="envelope" size={20} style={styles.icon} />
  <Text style={styles.infoLabel}>Email :</Text>
  {user?.showEmail ? (
    <Text
      style={styles.infoValueEmail}
      onPress={() => Linking.openURL(`mailto:${user.email}`)}
    >
      {user.email}
    </Text>
  ) : (
    <Text style={styles.placeholderValue}>{displayName} n'est pas joignable</Text>
  )}
</View>


</View>


      <View style={styles.cardContainer}>
  <Text style={styles.infoCardHeader}>Statistiques</Text>
  <View style={styles.cardContent}>
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{user?.followers?.length || 0}</Text>
      <Text style={styles.statLabel}>Followers</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{user?.following?.length || 0}</Text>
      <Text style={styles.statLabel}>Following</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{stats?.numberOfVotes || 0}</Text>
      <Text style={styles.statLabel}>Votes</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statNumber}>{stats?.numberOfReports || 0}</Text>
      <Text style={styles.statLabel}>Signalements</Text>
    </View>
  </View>
</View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    backgroundColor: "#F5F5F5",
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileImageContainer: {
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#D6D6D6",
    marginBottom: 10,
  },
  noProfileImageText: {
    color: "#999",
  },
  followButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  followButton: {
    backgroundColor: "#57A773",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  followButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  infoCardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  infoCardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginRight: 5, // Réduit l'espace entre "Email :" et la valeur
  },
  infoValueName: {
    fontSize: 17,
    color: "#333",
    fontWeight: "600", // Ajout d'une légère distinction entre le label et la valeur
  },
  infoValueEmail: {
    fontSize: 17,
    color: "#333",
    fontWeight: "600", // Ajout d'une légère distinction entre le label et la valeur
  },
  placeholderValue: {
    fontSize: 14,
    color: "#AAA",
    fontStyle: "italic",
  },
  icon: {
    marginRight: 10,
    color: "#57A773",
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#888",
  },
  field: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    lineHeight: 20,
  },
});

