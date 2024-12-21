import { StyleSheet } from "react-native";

export default StyleSheet.create({
  //  ------------------------------------------------ STYLE GLOBAL

  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  //  ------------------------------------------------ LOADING

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",  
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#29524A",  
  },

  // ------------------------------------------------  MODAL PARTAGE DE POSITION

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",  
    paddingHorizontal: 20,   
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff", 
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#ddd",  
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,  
  },
  button: {
    backgroundColor: "#1E90FF",  
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",  
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // ------------------------------------------------  MODAL FOLLOWER

  containerFollower: {
    flex: 1,
    backgroundColor: "#f7f8fa",  
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  followerList: {
    paddingBottom: 20,  
  },
  backButton: {
    marginTop: 20,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#2c3e50",  
    borderRadius: 30,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",  
    textTransform: "uppercase",  
  },

  //  ------------------------------------------------ PROFILE CONTAINER

  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#ccc",
    marginRight: 16,
  },
  noProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  noProfileImageText: {
    color: "#888",
    fontSize: 12,
    fontStyle: "italic",
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#29524A",
  },
  dropdownButton: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",  
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainerName: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 10,  
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    alignItems: "center",
  },
  modalTitleName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  optionItem: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#29524A",
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#f9f9f9",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#d81b60",  
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  userDetails: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
  followerItem: {
    flexDirection: "row", 
    alignItems: "center",
    backgroundColor: "#fff",  
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 1,
    borderRadius: 90,  
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,  
  },
  followerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,  
    marginRight: 12,  
    borderWidth: 1,
    borderColor: "#ddd", 
  },
  followerName: {
    fontSize: 16,
    fontWeight: "600",  
    color: "#444", 
  },
  statistics: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    padding: 12,
    marginTop: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#408476",
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  separator: {
    height: 40,
    width: 1,
    backgroundColor: "#ddd",
  },
  voteSummary: {
    flexDirection: "row",
    gap: 20,
  },
  votes: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingTop: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#29524A",
    marginLeft: 8,
  },
  noVotesText: {
    marginTop: 20,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  modalContentRanking: {
    backgroundColor: "white",
    padding: 20,
    paddingVertical: 80,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,  
  },
  rankingItemModal: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 190,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,  
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
  },
  rankingTextModal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
    marginHorizontal: 8,
  },
  closeButtonModal: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#5a67d8",
    shadowColor: "#5a67d8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 30,
  },
  closeButtonTextModal: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },

  //  ------------------------------------------------ TOP 10 DES SMARTERS

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#29524A",
  },
  smarterItem: {
    alignItems: "center",
    padding: 10,
    width: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  ranking: {
    fontSize: 19,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  rankingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  smarterImage: {
    width: 100,
    height: 100,
    borderRadius: 90,
    marginBottom: 10,
    marginTop: 5,
    borderColor: "#ddd",
  },
  seeAllButton: {
    backgroundColor: "#29524A",  
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 90,
    margin: 35,
    width: 100,
    height: 100,
    marginHorizontal: 10,
  },
  seeAllText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  //  ------------------------------------------------ SIGNALEMENTS PROCHE

  noReportsText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
  },
  reportItem: {
    padding: 15,
    paddingLeft: 30,
    marginVertical: 5,
    borderRadius: 50,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#424242",  
  },
  reportTitle: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "500",
    color: "#424242", 
  },
  reportCity: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "500",
    color: "#424242",  
  },

  //  ------------------------------------------------ SELECTION DE CATEGORIE

  categoryButton: {
    width: 120,  
    height: 120,  
    marginTop: 10,
    justifyContent: "center",  
    alignItems: "center",  
    marginRight: 10,  
    borderRadius: 90, 
  },
  categoryIcon: {
    marginBottom: 5,  
  },
  categoryText: {
    color: "#fff", 
    fontSize: 16,  
    fontWeight: "bold", 
  },

  //  ------------------------------------------------ EVENT A LA UNE

  featuredItem: {
    width: 150,
    minHeight: 150, 
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  featuredImage: {
    width: "100%",
    height: "auto", 
    aspectRatio: 1.5,  
  },
  featuredTitle: {
    padding: 10,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },

  // ------------------------------------------------  CALENDRIER

  calendarContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#52A393",
  },
  eventDetails: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: "#888",
  },
  noEventsContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fce4ec",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f8bbd0",
    marginBottom: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: "#d81b60",
    fontWeight: "bold",
    textAlign: "center",
  },

  // ------------------------------------------------  PARTIE  MAIRIE

  // ------------------------------------------------ SIGNALEMENT RESOLUS

  infoCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#52A393",
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
    color: "#52A393",
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
    marginBottom: 90,
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
    color: "#52A393",
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
});
