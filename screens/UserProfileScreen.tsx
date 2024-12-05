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

type User = {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email?: string;
  trustRate?: number;
  followers?: { id: number; username: string; profilePhoto?: string }[];
  following?: { id: number; username: string; profilePhoto?: string }[];
  profilePhoto?: { url: string };
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
          throw new Error("Erreur lors de la récupération des données utilisateur");
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="chevron-left"
            size={28}
            color="#333"
            style={{ marginLeft: 10, marginRight: 80 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Profil de {user?.username || "Utilisateur"}
        </Text>
        <Text style={styles.headerTitle}> </Text>
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
            { backgroundColor: isFollowing ? "red" : "green" },
          ]}
          onPress={isFollowing ? handleUnfollow : handleFollow}
          disabled={isSubmitting} // Bloquer pendant la requête
        >
          <Text style={styles.followButtonText}>
            {isFollowing ? "Se désabonner" : "Suivre"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Informations de base */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <Text style={styles.field}>
          Prénom : {user?.firstName || "Non renseigné"}
        </Text>
        <Text style={styles.field}>
          Nom : {user?.lastName || "Non renseigné"}
        </Text>
        <Text style={styles.field}>
          Nom d'utilisateur : {user?.username || "Non renseigné"}
        </Text>
        <Text style={styles.field}>
          Email : {user?.email || "Non disponible"}
        </Text>
      </View>

      {/* Statistiques */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <Text style={styles.field}>
          Followers : {user?.followers?.length || 0}
        </Text>
        <Text style={styles.field}>
          Following : {user?.following?.length || 0}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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
    alignItems: "center",
    marginBottom: 20,
    marginTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 50,
  },
  noProfileImageText: {
    color: "#999",
  },
  followButtonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  followButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  followButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  field: {
    fontSize: 14,
    marginBottom: 5,
  },
});