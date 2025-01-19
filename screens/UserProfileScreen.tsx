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
  Pressable,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import axios from "axios";
import { Linking } from "react-native";
import { useToken } from "../hooks/useToken";
import Icon from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/Sidebar";
import { Ionicons } from "@expo/vector-icons";

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
  isSubscribed?: boolean;
  votes: any[];
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
  const [modalOrnementVisible, setModalOrnementVisible] = useState(false);

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

      console.log({
        to: "yannleroy23@gmail.com",
        subject: "Signalement d'un profil utilisateur",
        userId, // Vérifiez que cette valeur est définie
        reporterId, // Vérifiez que cette valeur est définie
        reportReason, // Vérifiez que cette valeur est définie
      });

      const response = await fetch(`${API_URL}/mails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          to: "yannleroy23@gmail.com",
          subject: "Signalement d'un profil utilisateur",
          userId,
          reporterId,
          reportReason,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du signalement du profil.");
      }

      const result = await response.json();
      console.log("Signalement envoyé :", result);
      Alert.alert("Succès", "Le signalement a été envoyé avec succès.");
      closeReportModal(); // Ferme le modal après succès
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
        <ActivityIndicator size="large" color="#093A3E" />
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

  const getBadgeStyles = (votes: number) => {
    if (votes >= 1000) {
      return {
        title: "Légende urbaine",
        backgroundColor: "#70B3B1", // Diamant
        textColor: "#fff",
        borderColor: "#044745",
        shadowColor: "#70B3B1",
        starsColor: "#044745",
        stars: 6,
        icon: null,
      };
    } else if (votes >= 500) {
      return {
        title: "Icône locale",
        backgroundColor: "#FAF3E3", // Or
        textColor: "#856404",
        borderColor: "#856404",
        shadowColor: "#D4AF37",
        starsColor: "#D4AF37",
        stars: 5,
        icon: null,
      };
    } else if (votes >= 250) {
      return {
        title: "Pilier de la communauté",
        backgroundColor: "#E1E1E1", // Argent
        textColor: "#6A6A6A",
        borderColor: "#919191",
        shadowColor: "#6A6A6A",
        starsColor: "#919191",
        stars: 4,
        icon: null,
      };
    } else if (votes >= 100) {
      return {
        title: "Ambassadeur citoyen",
        backgroundColor: "#E1E1E1", // Bronze
        textColor: "#6A6A6A",
        starsColor: "#919191",
        shadowColor: "#6A6A6A",
        borderColor: "#919191",
        stars: 3,
        icon: null,
      };
    } else if (votes >= 50) {
      return {
        title: "Citoyen de confiance",
        backgroundColor: "#CEA992", // Bronze
        textColor: "#853104",
        starsColor: "#853104",
        shadowColor: "#853104",
        borderColor: "#D47637",
        stars: 2,
        icon: null,
      };
    } else if (votes >= 5) {
      return {
        title: "Apprenti citoyen",
        backgroundColor: "#CEA992", // Bronze
        textColor: "#853104",
        starsColor: "#853104",
        borderColor: "#D47637",
        shadowColor: "#853104",

        stars: 1,
        icon: null,
      };
    } else {
      return {
        title: "Premiers pas",
        backgroundColor: "#093A3E", // Blanc pour début
        textColor: "#fff",
        borderColor: "#fff",
        shadowColor: "#093A3E",
        starsColor: "#0AAEA8",
        stars: 0,
        icon: <Ionicons name="school" size={24} color="#fff" />,
      };
    }
  };

  return (
    <View>
      <View style={styles.header}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={24}
            color="#F7F2DE" // Couleur dorée
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
            size={24}
            color="#F7F2DE"
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
                placeholder="Indiquez la raison ainsi que le maximum d'informations (ex: profil douteux, dates, etc...)"
                value={reportReason}
                placeholderTextColor="#777777"
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

        <View style={styles.badgeWrapper}>
          {/* Conteneur des icônes (au-dessus du badge) */}
          <View style={styles.iconsContainer}>
            {getBadgeStyles(stats?.votes.length).stars === 0 ? (
              <Ionicons
                name="school"
                size={24}
                color={getBadgeStyles(stats?.votes.length).starsColor}
              />
            ) : (
              Array.from({
                length: getBadgeStyles(stats?.votes.length).stars,
              }).map((_, index) => (
                <Ionicons
                  key={index}
                  name="star"
                  size={20}
                  color={
                    getBadgeStyles(stats?.votes.length).starsColor
                  }
                />
              ))
            )}
          </View>

          {/* Badge */}
          <Pressable
            onPress={() => setModalOrnementVisible(true)}
            style={[
              styles.badgeContainer,
              {
                backgroundColor: getBadgeStyles(stats?.votes.length)
                  .backgroundColor,
                borderColor: getBadgeStyles(stats?.votes.length)
                  .borderColor,
                shadowColor: getBadgeStyles(stats?.votes.length)
                  .shadowColor,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeOrnement,
                {
                  color: getBadgeStyles(stats?.votes.length)
                    .textColor,
                },
              ]}
            >
              {getBadgeStyles(stats?.votes.length).title}
            </Text>
          </Pressable>
        </View>

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalOrnementVisible}
          onRequestClose={() => setModalOrnementVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Titre principal */}
              <Text style={styles.modalTitle}>Paliers</Text>

              {/* Corps scrollable */}
              <ScrollView contentContainerStyle={styles.modalBody}>
                {[
                  {
                    name: "Légende urbaine",
                    description: "Plus de 1000 votes",
                    stars: 6,
                    starsColor: "#70B3B1",
                  },
                  {
                    name: "Icône locale",
                    description: "500 à 999 votes",
                    stars: 5,
                    starsColor: "#D4AF37",
                  },
                  {
                    name: "Pilier de la communauté",
                    description: "250 à 499 votes",
                    stars: 4,
                    starsColor: "#919191",
                  },
                  {
                    name: "Ambassadeur citoyen",
                    description: "100 à 249 votes",
                    stars: 3,
                    starsColor: "#919191",
                  },
                  {
                    name: "Citoyen de confiance",
                    description: "50 à 99 votes",
                    stars: 2,
                    starsColor: "#853104",
                  },
                  {
                    name: "Apprenti citoyen",
                    description: "5 à 49 votes",
                    stars: 1,
                    starsColor: "#853104",
                  },
                  {
                    name: "Premiers pas",
                    description: "Moins de 5 votes",
                    stars: 0,
                    starsColor: "#6A6A6A",
                  },
                ].map((tier, index) => (
                  <View key={index} style={styles.tierCard}>
                    {/* Étoiles */}
                    <View style={styles.starsContainer}>
                      {Array.from({ length: tier.stars }).map((_, i) => (
                        <Ionicons
                          key={i}
                          name="star"
                          size={20}
                          color={tier.starsColor}
                        />
                      ))}
                      {tier.stars === 0 && (
                        <Ionicons
                          name="school"
                          size={24}
                          color={tier.starsColor}
                        />
                      )}
                    </View>
                    {/* Titre */}
                    <Text
                      style={[styles.tierTitle, { color: tier.starsColor }]}
                    >
                      {tier.name}
                    </Text>
                    {/* Description */}
                    <Text style={styles.tierDescription}>
                      {tier.description}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              {/* Bouton de fermeture */}
              <Pressable
                style={styles.closeButton}
                onPress={() => setModalOrnementVisible(false)}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

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

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Options</Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.isSubscribed ? "Oui" : "Non"}
              </Text>
              <Text style={styles.statLabel}> SMART+</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.isSubscribed ? "Oui" : "Non"}
              </Text>
              <Text style={styles.statLabel}>Affiliation mairie</Text>
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
    backgroundColor: "#093A3E", // Couleur sombre
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: "#093A3E", // Couleur dorée ou autre
    backgroundColor: "#F7F2DE",
    letterSpacing: 2,
    fontWeight: "bold",
    fontFamily: "Insanibc", // Utilisez le nom de la police que vous avez défini
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
    backgroundColor: "#F2F4F7", // Subtle off-white background
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fond sombre semi-transparent
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%", // Hauteur limitée pour permettre le défilement
    backgroundColor: "#FFF", // Fond blanc
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  modalBody: {
    width: "100%",
    paddingBottom: 20,
  },
  tierCard: {
    width: 280,
    marginBottom: 15,
    padding: 20,
    borderRadius: 150,
    backgroundColor: "#F9F9F9", // Fond légèrement gris
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    textAlign: "center",
  },
  tierDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#FF4500", // Rouge intense
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
    textAlign: "center",
  },

  badgeWrapper: {
    alignItems: "center", // Centre les icônes et le badge horizontalement
  },
  iconsContainer: {
    flexDirection: "row", // Aligne les icônes horizontalement
    justifyContent: "center",
    zIndex: 1, // Assure que les icônes sont au-dessus
    marginBottom: -17, // Espace en bas pour séparer les badges du reste
  },
  badgeContainer: {
    marginTop: 5,
    marginBottom: 20,
    width: "90%",
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 55,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  badgeOrnement: {
    position: "absolute",
    top: 14,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  sendChatContainer: {
    alignItems: "center",
    marginTop: 5,
  },
  sendChat: {
    width : "80%",
    backgroundColor: "#093A3E",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  sendChatText: {
    color: "#FFF",
    textAlign : "center",
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
    padding: 5,
    borderRadius: 50,
    elevation: 3, // Ombre pour l'effet de profondeur
  },
  medalText: {
    fontSize: 65, // Taille de la médaille (emoji)
  },

  followButtonContainer: {
    width : "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  followButton: {
    width : "80%",
    backgroundColor: "#093A3E",
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
    textAlign: "center",
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
    color: "#093A3E",
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
    color: "#093A3E", // Couleur sombre pour le nombre
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
