import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import { useNavigation } from "@react-navigation/native";

interface MairieInfoCardProps {
  handlePressPhoneNumber: () => void;
}

export default function MairieInfoCard({
  handlePressPhoneNumber,
}: MairieInfoCardProps) {
  const navigation = useNavigation<any>();
  interface User {
    id: string;
    username: string;
    displayName: string;
    ranking: number;
    image: { uri: string };
  }

  const [smarterData, setSmarterData] = useState<User[]>([]);
  interface Event {
    title: string;
    // Add other properties if needed
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [ranking, setRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const city = "HAUBOURDIN";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingEvents(true);
        setError(null);

        const cityName = city; // Ville définie manuellement
        const userId = String(await getUserIdFromToken());
        if (!userId) {
          throw new Error("Impossible de récupérer l'ID utilisateur.");
        }

        const [eventsData, rankingData] = await Promise.all([
          fetchEvents(cityName),
          fetchRankingByCity(userId, cityName),
        ]);

        setEvents(eventsData);
        setSmarterData(
          rankingData.users.map((user: any) => ({
            id: user.id,
            displayName: user.useFullName
              ? `${user.firstName} ${user.lastName}`
              : user.username,
            ranking: user.ranking,
            image: { uri: user.photo || "https://via.placeholder.com/150" }, // Mapping correct
          }))
        );
        setRanking(rankingData.ranking);
        setTotalUsers(rankingData.totalUsers);
      } catch (error: any) {
        console.error("Erreur lors de la récupération des données de ranking :", error);
        setError(error.message || "Erreur inconnue.");
      } finally {
        setLoading(false);
        setLoadingEvents(false);
      }
    };

    fetchData();
  }, []);

  const fetchEvents = async (cityName: string) => {
    const eventsResponse = await fetch(
      `${API_URL}/events?cityName=${encodeURIComponent(cityName)}`
    );
    if (!eventsResponse.ok) {
      throw new Error("Erreur lors de la récupération des événements.");
    }
    return eventsResponse.json();
  };

  const fetchRankingByCity = async (userId: string, cityName: string) => {
    const rankingResponse = await fetch(
      `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(
        cityName
      )}`
    );
    if (!rankingResponse.ok) {
      throw new Error(
        "Erreur lors de la récupération des utilisateurs populaires."
      );
    }
    return rankingResponse.json();
  };

  return (
    <>
      <View style={styles.mayorCard}>
        <Image
          source={require("../assets/images/mayor.png")}
          style={styles.profileImageMayor}
        />
        <View style={styles.mayorContainer}>
          <Text style={styles.mayorInfo}>Maire actuel:</Text>
          <Text style={styles.mayorName}>Pierre BÉHARELLE</Text>
          <Text style={styles.mayorSubtitle}>
            Permanence en Mairie sur rendez-vous au :
          </Text>
          <TouchableOpacity onPress={handlePressPhoneNumber}>
            <Text style={styles.contactBold}>03 20 44 02 51</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.officeCard}>
        <Image
          source={require("../assets/images/mairie.png")}
          style={styles.officeImage}
        />
        <View style={styles.officeInfo}>
          <View style={styles.officeAddress}>
            <Text style={styles.Address}>Contactez-nous :{"\n"}</Text>
            <Text>11 rue Sadi Carnot, {"\n"}59320 Haubourdin</Text>
          </View>
          <Text style={styles.officeContact}>
            <Text style={styles.phone}>Téléphone :</Text>
            {"\n"}
            <TouchableOpacity onPress={handlePressPhoneNumber}>
              <Text style={styles.officeContact}>03 20 44 02 90</Text>
            </TouchableOpacity>
            {"\n"}
            <Text style={styles.hours}>Du lundi au vendredi :</Text>
            {"\n"}
            08:30 - 12:00, 13:30 - 17:00
          </Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>🏛️ Informations mairie</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Attention : Travaux !</Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 15 septembre 2024{"\n"}
          <Text style={styles.infoLabel}>Lieu :</Text> Avenue de la Liberté
          {"\n"}
          <Text style={styles.infoLabel}>Détail :</Text> Des travaux de
          réfection de la chaussée auront lieu du 25 au 30 septembre. La
          circulation sera déviée. Veuillez suivre les panneaux de
          signalisation.
        </Text>

        <Text style={styles.infoTitle}>Résolution de vos signalements</Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 20 septembre 2024{"\n"}
          <Text style={styles.infoLabel}>Lieu :</Text> Rue des Fleurs{"\n"}
          <Text style={styles.infoLabel}>Détail :</Text> La fuite d'eau signalée
          a été réparée. Merci de votre patience.
        </Text>

        <Text style={styles.infoTitle}>Alertes Importantes</Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 18 septembre 2024{"\n"}
          <Text style={styles.infoLabel}>Détail :</Text> En raison des fortes
          pluies prévues cette semaine, nous vous recommandons de limiter vos
          déplacements et de vérifier les alertes météo régulièrement.
        </Text>
      </View>
      <View style={styles.separator}></View>
      <View>
        {/* Section des utilisateurs populaires */}
        <View>
          <Text style={styles.sectionTitleTop10}>
            Top 10 des utilisateurs les plus actifs
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {smarterData.slice(0, 10).map((item, index) => {
              const borderColor =
                index + 1 === 1
                  ? "#FFD700" // Or
                  : index + 1 === 2
                  ? "#C0C0C0" // Argent
                  : index + 1 === 3
                  ? "#CD7F32" // Bronze
                  : "#fff"; // Couleur par défaut

              const medal =
                index + 1 === 1
                  ? "🥇" // Médaille d'or
                  : index + 1 === 2
                  ? "🥈" // Médaille d'argent
                  : index + 1 === 3
                  ? "🥉" // Médaille de bronze
                  : null; // Pas de médaille pour les autres

              console.log("URL d'image pour l'utilisateur :", item.image?.uri);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.smarterItem}
                  onPress={() =>
                    navigation.navigate("UserProfileScreen", {
                      userId: item.id,
                    })
                  }
                >
                  <View style={{ position: "relative" }}>
                    {medal && <Text style={styles.medal}>{medal}</Text>}
                    <Image
                      source={{
                        uri:
                          item.image?.uri || "https://via.placeholder.com/150",
                      }}
                      style={[
                        styles.smarterImage,
                        { borderColor: borderColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.rankingName}>
                    {item.displayName || "Nom indisponible"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section des événements */}
        <Text>Événements à {city}</Text>
        {events.length > 0 ? (
          events.map((event, index) => <Text key={index}>{event.title}</Text>)
        ) : (
          <Text>Aucun événement disponible.</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  //  ------------------------------------------------ STYLE GLOBAL

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 15,
    color: "#093A3E",
  },

  // ------------------------------------------------ SIGNALEMENT RESOLUS

  infoCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#093A3E",
    marginBottom: 10,
    marginTop: 15,
  },
  infoContent: {
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#666",
  },

  // ------------------------------------------------  FICHE INFORMATION MAIRE

  mayorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  profileImageMayor: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    marginRight: 15,
  },
  mayorContainer: {
    flex: 1,
  },
  mayorInfo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#093A3E",
    marginBottom: 5,
  },
  mayorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  mayorSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  mayorContact: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
  contactBold: {
    fontWeight: "bold",
    marginTop: 5,
  },

  // ------------------------------------------------ FICHE CONTACT MAIRIE

  officeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  officeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    marginRight: 15,
  },
  officeInfo: {
    flex: 1,
  },
  officeAddress: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  Address: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#093A3E",
  },
  officeContact: {
    fontSize: 14,
    color: "#666",
  },
  phone: {
    fontWeight: "bold",
  },
  hours: {
    fontWeight: "bold",
  },

  // ------------------------------------------------ FICHE CONTACT MAIRIE

  separator: {
    height: 20,
  },

  //  ------------------------------------------------ TOP 10 DES SMARTERS

  sectionTitleTop10: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#093A3E",
  },
  smarterItem: {
    alignItems: "center",
    padding: 10,
    width: 120,
  },
  smarterImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Assure l'image circulaire
    marginBottom: 10,
    marginTop: 5,
    borderWidth: 3, // Épaisseur du contour
    borderColor: "#ddd", // Couleur par défaut (changée dynamiquement)
  },
  rankingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  medal: {
    fontSize: 40, // Taille de la médaille
    position: "absolute",
    top: 0, // Position légèrement au-dessus de l'image
    left: 0, // Décalage vers la gauche
    zIndex: 1, // Assure que la médaille est au-dessus de l'image
  },
  seeAllButton: {
    backgroundColor: "#093A3E",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    width: 100,
    height: 100,
    marginTop: 18,
    marginHorizontal: 10,
  },
  seeAllText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
