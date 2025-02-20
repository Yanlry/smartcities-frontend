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
  FlatList,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import axios from "axios";
import { Linking } from "react-native";
import { useToken } from "../hooks/useToken";
import Icon from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/Sidebar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

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

interface Post {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByUser: boolean;
  authorId: number;
  authorName: string;
  profilePhoto: string | null;
  nomCommune: string;
  photos: string[];
  comments: any[];
}

export default function UserProfileScreen({ route, navigation }) {
  const { getToken, getUserId } = useToken();
  const { userId } = route.params;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalOrnementVisible, setModalOrnementVisible] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsVisible, setCommentsVisible] = useState<{ [key: number]: boolean }>({});
  const [reports, setReports] = useState<
    {
      id: number;
      title: string;
      description: string;
      createdAt: string;
      photos?: { url: string }[];
      city: string;
      type: string;
    }[]
  >([]);
  const [events, setEvents] = useState<
    {
      id: number;
      title: string;
      description: string;
      createdAt: string;
      photos: { url: string }[];
    }[]
  >([]);
  const [selectedTab, setSelectedTab] = useState<
    "info" | "publications" | "signalement" | "evenement"
  >("info");

  useEffect(() => {
    async function fetchData() {
      try {
        const userIdFromToken = await getUserIdFromToken();

        setCurrentUserId(userIdFromToken);

        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des données utilisateur"
          );
        }

        const data = await response.json();

        setUser(data);

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
  }, [userId]);

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        if (!userId) {
          console.error("Impossible de récupérer l'ID utilisateur.");
          return;
        }

        console.log("ID utilisateur récupéré :", userId);
        const response = await fetch(`${API_URL}/reports?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des rapports :", error);
      }
    };

    fetchUserReports();
  }, []);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        if (!userId) {
          console.error("Impossible de récupérer l'ID utilisateur.");
          return;
        }

        console.log("ID utilisateur récupéré :", userId);
        const response = await fetch(`${API_URL}/events?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }

        const data = await response.json();
        console.log("Données des événements récupérées :", data);
        setEvents(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
      }
    };

    fetchUserEvents();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get<Post[]>(
          `${API_URL}/posts/author/${userId}`
        );
        setPosts(response.data);
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la récupération des publications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

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

      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              followers: [
                ...(prevUser.followers || []),
                {
                  id: currentUserId,
                  username: "Vous",
                  profilePhoto: undefined,
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
      const reporterId = await getUserId();

      console.log({
        to: "yannleroy23@gmail.com",
        subject: "Signalement d'un profil utilisateur",
        userId,
        reporterId,
        reportReason,
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
      closeReportModal();
    } catch (error) {
      console.error("Erreur lors de l'envoi du signalement :", error.message);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'envoi du signalement."
      );
    }
  };

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

  const getBadgeStyles = (votes: number) => {
    if (votes >= 1000) {
      return {
        title: "Légende urbaine",
        backgroundColor: "#997BBA",
        textColor: "#fff",
        borderColor: "#5B3F78",
        shadowColor: "#997BBA",
        starsColor: "#5B3F78",
        stars: 6,
        icon: null,
      };
    } else if (votes >= 500) {
      return {
        title: "Icône locale",
        backgroundColor: "#70B3B1",
        textColor: "#fff",
        borderColor: "#044745",
        shadowColor: "#70B3B1",
        starsColor: "#044745",
        stars: 5,
        icon: null,
      };
    } else if (votes >= 250) {
      return {
        title: "Héros du quotidien",
        backgroundColor: "#FAF3E3",
        textColor: "#856404",
        borderColor: "#856404",
        shadowColor: "#D4AF37",
        starsColor: "#D4AF37",
        stars: 4,
        icon: null,
      };
    } else if (votes >= 100) {
      return {
        title: "Ambassadeur du quartier",
        backgroundColor: "#E1E1E1",
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
        backgroundColor: "#CEA992",
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
        backgroundColor: "#9BD4A2",
        textColor: "#25562A",
        starsColor: "#54B65F",
        borderColor: "#54B65F",
        shadowColor: "#54B65F",

        stars: 1,
        icon: null,
      };
    } else {
      return {
        title: "Premiers pas",
        backgroundColor: "#062C41",
        textColor: "#fff",
        borderColor: "#fff",
        shadowColor: "#062C41",
        starsColor: "#0AAEA8",
        stars: 0,
        icon: <Ionicons name="school" size={24} color="#0AAEA8" />,
      };
    }
  };
  
  const toggleComments = (postId: number) => {
    setCommentsVisible(prevState => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const openReportModal = () => setReportModalVisible(true);

  const displayName = user?.useFullName
    ? `${user.firstName} ${user.lastName}`
    : user?.username;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#062C41" />
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
    <View>
      <View style={styles.header}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={24}
            color="#FFFFFC"
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
            color="#FFFFFC"
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>
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
            <TouchableOpacity onPress={sendReport} style={styles.confirmButton}>
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

      <ScrollView contentContainerStyle={styles.container}>
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
                : null,
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
                  color={getBadgeStyles(stats?.votes.length).starsColor}
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
                borderColor: getBadgeStyles(stats?.votes.length).borderColor,
                shadowColor: getBadgeStyles(stats?.votes.length).shadowColor,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeOrnement,
                {
                  color: getBadgeStyles(stats?.votes.length).textColor,
                },
              ]}
            >
              {getBadgeStyles(stats?.votes.length).title}
            </Text>
          </Pressable>
        </View>

        {/* MODAL DES PALIER */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalOrnementVisible}
          onRequestClose={() => setModalOrnementVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Icône informative */}
              <Ionicons
                name="medal-outline"
                size={60}
                color="#062C41"
                style={styles.icon}
              />

              {/* Titre principal */}
              <Text style={styles.modalTitle}>Découvrez les paliers</Text>

              {/* Description */}
              <Text style={styles.modalDescription}>
                Chaque badge symbolise votre engagement citoyen. Plus vous
                participez en votant sur les signalements, plus vous progressez
                et débloquez de nouveaux paliers.
                {"\n"}
                {"\n"}
                💡 Bon à savoir : Vous pouvez voter dans n’importe quelle ville,
                alors n’attendez plus ! 🚀
              </Text>

              {/* Corps scrollable */}
              <ScrollView contentContainerStyle={styles.modalBody}>
                {[
                  {
                    name: "Légende urbaine",
                    description: "Plus de 1000 votes",
                    votes: 1000,
                  },
                  {
                    name: "Icône locale",
                    description: "500 à 999 votes",
                    votes: 500,
                  },
                  {
                    name: "Héros du quotidien",
                    description: "250 à 499 votes",
                    votes: 250,
                  },
                  {
                    name: "Ambassadeur du quartier",
                    description: "100 à 249 votes",
                    votes: 100,
                  },
                  {
                    name: "Citoyen de confiance",
                    description: "50 à 99 votes",
                    votes: 50,
                  },
                  {
                    name: "Apprenti citoyen",
                    description: "5 à 49 votes",
                    votes: 5,
                  },
                  {
                    name: "Premiers pas",
                    description: "Moins de 5 votes",
                    votes: 0,
                  },
                ].map((tier, index) => {
                  const badgeStyles = getBadgeStyles(tier.votes);

                  return (
                    <View
                      key={index}
                      style={[
                        styles.tierCard,
                        { borderColor: badgeStyles.borderColor },
                      ]}
                    >
                      {/* Étoiles */}
                      <View style={styles.starsContainer}>
                        {Array.from({ length: badgeStyles.stars }).map(
                          (_, i) => (
                            <Ionicons
                              key={i}
                              name="star"
                              size={20}
                              color={badgeStyles.starsColor}
                            />
                          )
                        )}
                        {badgeStyles.stars === 0 && badgeStyles.icon}
                      </View>
                      {/* Titre avec le même fond et la même bordure que le badge */}
                      <Text
                        style={[
                          styles.tierTitle,
                          {
                            backgroundColor: badgeStyles.backgroundColor,
                            borderColor: badgeStyles.borderColor,
                            color: badgeStyles.textColor,
                          },
                        ]}
                      >
                        {tier.name}
                      </Text>
                      {/* Description */}
                      <Text style={styles.tierDescription}>
                        {tier.description}
                      </Text>
                    </View>
                  );
                })}
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "info" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("info")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "info" && styles.activeTabText,
              ]}
            >
              Info & Statistique
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "signalement" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("signalement")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "signalement" && styles.activeTabText,
              ]}
            >
              Signalement
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "publications" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("publications")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "publications" && styles.activeTabText,
              ]}
            >
              Publications
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "evenement" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("evenement")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "evenement" && styles.activeTabText,
              ]}
            >
              Événement
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Informations & statistiques */}
        {selectedTab === "info" && (
          <>
            <View style={styles.infoCardContainer}>
              <Text style={styles.infoCardHeader}>
                Informations personnelles
              </Text>

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
                    {displayName} ne partage pas son email
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
                  disabled={isSubmitting}
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

            <View style={styles.cardContainerCity}>
              <Text style={styles.infoCardHeaderCity}>Ville de référence</Text>

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
                  <Text style={styles.statNumber}>
                    {stats?.numberOfVotes || 0}
                  </Text>
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
                  <Text style={styles.statNumber}>
                    {stats?.numberOfPosts || 0}
                  </Text>
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
          </>
        )}

        {/* Signalements */}
        {selectedTab === "signalement" && (
          <>
            {reports.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  Aucun signalement trouvé.
                </Text>
              </View>
            ) : (
              <View>
                {reports.map((item) => (
                  <View key={item.id.toString()} style={styles.reportCard}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ReportDetailsScreen", {
                          reportId: item.id,
                        })
                      }
                    >
                      <View style={styles.reportTypeContainer}>
                        <Text style={styles.reportType}>{item.type}</Text>
                      </View>
                      <Text style={styles.reportTitle}>{item.title}</Text>

                      {/* Affichage de l'image */}
                      {Array.isArray(item.photos) && item.photos.length > 0 && (
                        <Image
                          source={{ uri: item.photos[0].url }}
                          style={styles.reportImage}
                        />
                      )}

                      {/* Description */}
                      <Text style={styles.reportDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <Text style={styles.reportCity}>{item.city}</Text>
                      <Text style={styles.reportDate}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.separator}></View>
              </View>
            )}
          </>
        )}

        {selectedTab === "publications" && (
          <>
            {posts.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  Aucune publication trouvée.
                </Text>
              </View>
            ) : (
              <View>
                {posts.map((item) => (
                  <TouchableOpacity
                  key={item.id.toString()}
                  onPress={() =>
                    navigation.navigate("PostDetailsScreen", { postId: item.id })
                  }
                >
                  <View key={item.id.toString()} style={styles.postCard}>
                    {/* En-tête du post : informations sur l'auteur */}
                    <View style={styles.postHeader}>
                      <Image
                        source={{
                          uri:
                            item.profilePhoto ||
                            "https://via.placeholder.com/150",
                        }}
                        style={styles.profilePhoto}
                      />
                      <View style={styles.authorInfo}>
                        <Text style={styles.authorName}>{item.authorName}</Text>
                        <Text style={styles.postDate}>
                          Publié le{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    {/* Contenu du post */}
                    <Text style={styles.postContent}>{item.content}</Text>

                    {/* Affichage des photos si disponibles */}
                    {item.photos && item.photos.length > 0 && (
                      <View style={styles.photosContainer}>
                        {item.photos.map((photo, index) => (
                          <Image
                            key={index.toString()}
                            source={{ uri: photo }}
                            style={styles.photo}
                          />
                        ))}
                      </View>
                    )}

                    {/* Métadonnées : date de création et likes */}
                    <View style={styles.metaInfo}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <MaterialCommunityIcons
                          name="thumb-up"
                          size={14}
                          color="#555"
                          style={{ marginRight: 5 }} 
                        />
                        <Text style={styles.likesCount}>
                          {item.likesCount} personnes ont liké
                        </Text>
                      </View>
                    </View>

                    {/* Section des commentaires */}
                 {/* Bouton pour afficher/masquer les commentaires */}
                    <TouchableOpacity onPress={() => toggleComments(item.id)}>
                      <Text style={styles.toggleCommentsButton}>
                        {commentsVisible[item.id]
                          ? "Masquer les commentaires"
                          : "Afficher les commentaires"}
                      </Text>
                    </TouchableOpacity>

                    {/* Section commentaires */}
                    {commentsVisible[item.id] && (
  <View style={styles.commentsContainer}>
    {item.comments && item.comments.length > 0 ? (
      <>
        <Text style={styles.commentsHeader}>Commentaires :</Text>
        {item.comments.map((comment) => (
          <View key={comment.id.toString()} style={styles.comment}>
            <Image
              source={{ uri: comment.userProfilePhoto }}
              style={styles.commentProfilePhoto}
            />
            <View style={styles.commentContent}>
              <Text style={styles.commentUserName}>
                {comment.userName}
              </Text>
              <Text style={styles.commentDate}>
                Publié le {new Date(comment.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.commentText}>
                {comment.text}
              </Text>
            </View>
          </View>
        ))}
      </>
    ) : (
      <Text style={styles.noCommentText}>Aucun commentaire pour le moment</Text>
    )}
  </View>
)}
                  </View>
                  </TouchableOpacity>
                ))}
                <View style={styles.separator}></View>
              </View>
            )}
          </>
        )}

        {/* Événement */}
        {selectedTab === "evenement" && (
          <>
            {events.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Aucun événement trouvé.</Text>
              </View>
            ) : (
              <View>
                {events.map((item) => {
                  const eventDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "Date non disponible";
                  return (
                    <View key={item.id.toString()} style={styles.eventCard}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("EventDetailsScreen", {
                            eventId: item.id,
                          })
                        }
                      >
                        {/* Image de l'événement */}
                        <Image
                          source={{
                            uri:
                              item.photos?.[0]?.url ||
                              "https://via.placeholder.com/150",
                          }}
                          style={styles.eventImage}
                          resizeMode="cover"
                        />

                        {/* Titre et description */}
                        <Text style={styles.eventTitle}>
                          {item.title || "Titre non disponible"}
                        </Text>
                        <Text style={styles.eventDescription} numberOfLines={2}>
                          {item.description || "Aucune description disponible"}
                        </Text>

                        {/* Pied de carte avec la date */}
                        <View style={styles.eventFooter}>
                          <Text style={styles.eventDate}>
                            L'événement est prévu pour le {eventDate}
                          </Text>
                          <Icon
                            name="chevron-right"
                            size={24}
                            color="#CBCBCB"
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <View style={styles.separator}></View>
              </View>
            )}
          </>
        )}
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
    backgroundColor: "#062C41",
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: "#FFFFFC",
    letterSpacing: 2,
    fontWeight: "bold",
    fontFamily: "Insanibc",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
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
    elevation: 10,
  },
  textInput: {
    borderWidth: 1,
    height: 90,
    width: "100%",
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
    backgroundColor: "#F2F4F7",
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "90%",
    backgroundColor: "#FFF",
    borderRadius: 20,
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
  modalDescription: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  modalBody: {
    width: "100%",
    paddingBottom: 10,
  },
  tierCard: {
    width: 280,
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    padding: 15,
    width: "100%",
    borderWidth: 2,
    borderRadius: 30,
  },

  tierDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: -8,
    zIndex: 1,
  },

  closeButton: {
    backgroundColor: "#062C41",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 25,
    marginTop: 20,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  badgeWrapper: {
    alignItems: "center",
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 1,
    marginBottom: -17,
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
    marginTop: 10,
    marginBottom: 10,
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
  },
  noProfileImageText: {
    fontSize: 14,
    color: "#888",
  },
  goldBorder: {
    borderWidth: 5,
    borderColor: "#FFD700",
  },
  silverBorder: {
    borderWidth: 5,
    borderColor: "#C0C0C0",
  },
  bronzeBorder: {
    borderWidth: 5,
    borderColor: "#CD7F32",
  },
  medalContainer: {
    position: "absolute",
    top: -20,
    zIndex: 2,
    padding: 5,
    borderRadius: 50,
    elevation: 3,
  },
  medalText: {
    fontSize: 65,
  },

  followButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  followButton: {
    width: "80%",
    backgroundColor: "#062C41",
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
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
    marginRight: 5,
  },
  infoValueName: {
    fontSize: 17,
    color: "#333",
    fontWeight: "600",
  },
  infoValueEmail: {
    fontSize: 17,
    color: "#333",
    fontWeight: "600",
  },
  placeholderValue: {
    fontSize: 14,
    color: "#AAA",
    fontStyle: "italic",
  },
  icon: {
    marginRight: 10,
    color: "#062C41",
  },
  sendChat: {
    width: "80%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#062C41",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  sendChatText: {
    color: "#062C41",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  infoCardHeaderCity: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingBottom: 20,
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
  cardContainerCity: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
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
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  statItem: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#062C41",
  },
  statLabel: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    fontWeight: "bold",
    lineHeight: 20,
  },

  cardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
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

  personalInfoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  personalInfoHeader: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 15,
  },
  personalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  personalInfoIcon: {
    marginRight: 10,
    color: "#57A773",
  },
  personalInfoLabel: {
    fontSize: 16,
    color: "#555555",
    width: 140,
  },
  personalInfoValue: {
    fontSize: 16,
    color: "#333333",
  },
  personalInfoPlaceholder: {
    fontSize: 16,
    color: "#999999",
    fontStyle: "italic",
  },
  personalInfoEmail: {
    fontSize: 16,
    color: "#333333",
    textDecorationLine: "underline",
  },
  followBtnContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  followBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
  },
  followBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chatBtnContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  chatBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#57A773",
    borderRadius: 25,
  },
  chatBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#57A773",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    gap: 20,
  },
  tabButton: {
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: "#555",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#57A773",
  },
  activeTabText: {
    color: "#57A773",
    fontWeight: "600",
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  reportImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666666",
    marginBottom: 10,
  },
  reportType: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    color: "#666666",
  },
  reportTypeContainer: {
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  reportDescription: {
    fontSize: 14,
    color: "#7A7A7A",
    marginBottom: 10,
  },
  reportCity: {
    fontSize: 10,
    color: "#666666",
    fontWeight: "bold",
    marginBottom: 10,
  },
  reportDate: {
    fontSize: 10,
    color: "#666666",
    fontWeight: "bold",
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 10,
  },
  eventImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingTop: 10,
  },
  eventDate: {
    fontSize: 12,
    color: "#999999",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  authorInfo: {
    marginLeft: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  authorCity: {
    fontSize: 14,
    color: "#777",
  },
  postContent: {
    fontSize: 16,
    color: "#444",
    marginBottom: 15,
  },
  photosContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  postDate: {
    marginTop: 3,
    fontSize: 12,
    color: "#777",
  },
  likesCount: {
    fontSize: 14,
    color: "#777",
  },
  commentsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  comment: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
    borderBottomWidth: 1,
    paddingBottom: 10,
    borderBottomColor: "#eee",
  },
  commentProfilePhoto: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentContent: {
    marginLeft: 8,
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  commentText: {
    fontSize: 18,
    color: "#555",
    
  },
  commentDate: {
    marginVertical: 2,
    fontSize: 12,
    color: "#999",
  },
  toggleCommentsButton: {
    fontSize: 14,
    color: '#57A773',
    marginTop: 5,
  },
  noCommentText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
