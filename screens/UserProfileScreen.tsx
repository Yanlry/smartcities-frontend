import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import axios from "axios";
import { Linking } from "react-native";
import { useToken } from "../hooks/useToken";
import Icon from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/Sidebar";

type User = {
  id: string;
  firstName: string;
  ranking: number;
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
  nomCommune?: string;
  codePostal?: string;
};

export default function UserProfileScreen({ route, navigation }) {
  const { getToken, getUserId } = useToken();
  const { userId } = route.params; // ID de l'utilisateur à afficher
  const [user, setUser] = useState<User | null>(null); // Données de l'utilisateur
  const [loading, setLoading] = useState(true); // Chargement des données
  const [error, setError] = useState<string | null>(null); // Gestion des erreurs
  const [isFollowing, setIsFollowing] = useState(false); // État de suivi
  const [isSubmitting, setIsSubmitting] = useState(false); // Pour bloquer les clics pendant une requête
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // ID de l'utilisateur connecté
  const [stats, setStats] = useState<any>(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        const isCurrentlyFollowing: boolean =
          data.followers?.some(
            (follower: { id: number }) => follower.id === userIdFromToken
          ) || false;

        setIsFollowing(isCurrentlyFollowing);
      } catch (err) {
        console.error(
          "Erreur lors de la récupération des données :",
          err.message
        );
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

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const openReportModal = () => setReportModalVisible(true);

  const closeReportModal = () => {
    setReportModalVisible(false);
    setReportReason("");
  };

  const sendReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Erreur", "Veuillez saisir une raison pour le signalement.");
      return;
    }

    try {
      const reporterId = await getUserId(); // Récupération de l'ID de l'utilisateur actuel

      const response = await fetch(`${API_URL}/mails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          to: "yannleroy23@gmail.com", // Adresse mail du destinataire
          subject: "Signalement d'un profil utilisateur",
          text: `Un profil utilisateur a été signalé avec l'ID: ${userId}. 
                 Signalé par l'utilisateur avec l'ID: ${reporterId}. 
                 Raison: ${reportReason}`,
          html: `<p><strong>Un profil utilisateur a été signalé.</strong></p>
                 <p>ID du profil: ${userId}</p>
                 <p>Signalé par l'utilisateur avec l'ID: ${reporterId}</p>
                 <p>Raison: ${reportReason}</p>`,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du signalement du profil.");
      }

      const result = await response.json();
      console.log("Signalement envoyé :", result);
      Alert.alert("Succès", "Le signalement a été envoyé avec succès.");
      closeReportModal();
    } catch (error) {
      console.error("Erreur lors de l'envoi du signalement :", error.message);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'envoi du signalement."
      );
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
    <View>
      <View style={styles.header}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={28}
            color="#BEE5BF" // Couleur dorée
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadge}>
          <Text style={styles.headerTitle}>PROFIL</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
        <TouchableOpacity onPress={openReportModal}>
          <Icon
            name="error"
            size={28}
            color="#BEE5BF"
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Modal pour le signalement */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isReportModalVisible}
          onRequestClose={closeReportModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Signaler ce profil</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Quelle est la raison de votre signalement ?"
                value={reportReason}
                onChangeText={setReportReason}
                multiline={true}
              />
              <TouchableOpacity
                onPress={sendReport}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Envoyer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeReportModal}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Image de profil avec style basé sur le classement */}
        <View style={styles.profileContainer}>
          {/* Image avec bordure conditionnelle */}
          <View
            style={[
              styles.profileImageContainer,
              user?.ranking === 1
                ? styles.goldBorder
                : user?.ranking === 2
                ? styles.silverBorder
                : user?.ranking === 3
                ? styles.bronzeBorder
                : null, // Pas de bordure si classement > 3
            ]}
          >
            {user?.profilePhoto?.url ? (
              <Image
                source={{ uri: user.profilePhoto.url }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.noProfileImageText}>
                Pas de photo de profil
              </Text>
            )}
          </View>

          {/* Médaille au-dessus de l'image si classement <= 3 */}
          {user?.ranking && user.ranking <= 3 && (
            <View style={styles.medalContainer}>
              <Text style={styles.medalText}>
                {user.ranking === 1 ? "🥇" : user.ranking === 2 ? "🥈" : "🥉"}
              </Text>
            </View>
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
            <Icon name="person" size={22} style={styles.icon} />
            <Text style={styles.infoLabel}>Nom d'utilisateur :</Text>
            <Text style={styles.infoValueName}>
              {displayName || (
                <Text style={styles.placeholderValue}>Non renseigné</Text>
              )}
            </Text>
          </View>

          {/* Email */}

          <View style={styles.infoItem}>
            <Icon name="drafts" size={22} style={styles.icon} />
            <Text style={styles.infoLabel}>Email :</Text>
            {user?.showEmail ? (
              <Text
                style={styles.infoValueEmail}
                onPress={() => Linking.openURL(`mailto:${user.email}`)}
              >
                {user.email}
              </Text>
            ) : (
              <Text style={styles.placeholderValue}>
                {displayName} n'est pas joignable
              </Text>
            )}
          </View>
          {/* Nom d'utilisateur */}
          {currentUserId && userId && (
  <View style={styles.sendChatContainer}>
    <TouchableOpacity
      style={styles.sendChat}
      onPress={() =>
        navigation.navigate("ChatScreen", {
          receiverId: userId,
          senderId: currentUserId,
        })
      }
    >
      <Text style={styles.sendChatText}>Envoyer un message</Text>
    </TouchableOpacity>
  </View>
)}
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Ville de référence</Text>

          {/* Affichage de la ville actuelle */}
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.nomCommune || "Non disponible"}
              </Text>
              <Text style={styles.statLabel}>Ville</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.codePostal || "Non disponible"}
              </Text>
              <Text style={styles.statLabel}>Code postal</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>
            Statistiques de signalements
          </Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats?.numberOfComments || 0}
              </Text>
              <Text style={styles.statLabel}>Commentaires</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.numberOfVotes || 0}</Text>
              <Text style={styles.statLabel}>Votes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats?.numberOfReports || 0}
              </Text>
              <Text style={styles.statLabel}>Signalements</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Relations</Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.followers?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Abonnées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.following?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Abonnements</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Social</Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.numberOfPosts || 0}</Text>
              <Text style={styles.statLabel}>Publications{"\n"}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats?.numberOfEventsCreated || 0}
              </Text>
              <Text style={styles.statLabel}>Événements{"\n"}crées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats?.numberOfEventsAttended || 0}
              </Text>
              <Text style={styles.statLabel}>
                Participation{"\n"}aux événements
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.separator}></View>
      </ScrollView>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#29524A", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // Couleur blanche
    letterSpacing: 2, // Espacement pour un effet moderne
    textAlign: "center",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  
  modalBackdrop: {
    position: "absolute",
    top: 0, // Occupe toute la hauteur
    left: 0,
    right: 0,
    bottom: 0, // Occupe toute la hauteur
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // Toujours au-dessus
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10, // Ombre pour un effet surélevé
  },
  textInput: {
    borderWidth: 1,
    height: 90,
    width: "100%",
    borderColor: "#ccc", // Light gray border
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
    backgroundColor: "#f9f9f9", // Subtle off-white background
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700", // Titre plus bold
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  sendChatContainer: {
    alignItems: "center",
    marginTop: 5,
  },
  sendChat: {
    backgroundColor: "#57A773",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  sendChatText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#ff4d4f",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  profileImageContainer: {
    width: 150, // Taille de l'image de profil
    height: 150,
    borderRadius: 90, // Cercle parfait
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 90, // Cercle parfait
  },
  noProfileImageText: {
    fontSize: 14,
    color: "#888",
  },
  goldBorder: {
    borderWidth: 5,
    borderColor: "#FFD700", // Couleur or
  },
  silverBorder: {
    borderWidth: 5,
    borderColor: "#C0C0C0", // Couleur argent
  },
  bronzeBorder: {
    borderWidth: 5,
    borderColor: "#CD7F32", // Couleur bronze
  },
  medalContainer: {
    position: "absolute",
    top: -20, // Médaille au-dessus de l'image
    zIndex: 2, // Priorité d'affichage
    backgroundColor: "white", // Fond blanc pour contraste
    padding: 5,
    borderRadius: 50,
    elevation: 3, // Ombre pour l'effet de profondeur
  },
  medalText: {
    fontSize: 40, // Taille de la médaille (emoji)
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
  cardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
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
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    justifyContent: "center", // Centre verticalement le contenu de statItem
    alignItems: "center", // Centre horizontalement le contenu de statItem
    padding: 10, // Espacement interne
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center", // Centre le nombre horizontalement
    marginBottom: 5, // Espace entre le nombre et le texte
    color: "#376D62", // Couleur sombre pour le nombre
  },
  statLabel: {
    textAlign: "center", // Centre le texte horizontalement
    fontSize: 14,
    color: "#555", // Couleur du texte
    fontWeight: "bold", // Texte en gras
    lineHeight: 20, // Espacement entre les lignes
  },
  field: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    lineHeight: 20,
  },
  separator: {
    marginBottom: 70,
  },
});
