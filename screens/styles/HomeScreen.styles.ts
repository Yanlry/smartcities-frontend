import { StyleSheet } from "react-native";

export default StyleSheet.create({
  //  ------------------------------------------------ STYLE GLOBAL

  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 90,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#093A3E",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 10,
  },
  sectionHeaderVisible: {
    backgroundColor: "#f5f5f5",
  },
  sectionContent: {
    backgroundColor: "#fff",
  },
  arrow: {
    fontSize: 18,
    color: "#666",
  },
  globalToggleButton: {
    padding: 3,
    backgroundColor: "#ccc",
  },
  globalToggleButtonText: {
    color: "#555",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "600",
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
    color: "#093A3E",
  },

  // ------------------------------------------------  MODAL PALIER

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
  badgeImage: {
    width: 400,
    marginBottom: 10,
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
    backgroundColor: "#418074",
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
  // ------------------------------------------------  MODAL LIKE

  modalOverlayLike: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentLike: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    backgroundColor: "#E7F3EF",
    borderRadius: 50,
    padding: 15,
    marginBottom: 20,
  },
  titleModalLike: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  instructions: {
    width: "100%",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 10,
  },
  instructionText: {
    fontSize: 15,
    color: "#444",
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
  },
  closeButtonModalLike: {
    backgroundColor: "#418074",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 25,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  closeButtonTextModalLike: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  // ------------------------------------------------  MODAL PARTAGE DE POSITION

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
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
    backgroundColor: "#fff",
    paddingTop: 110,
    
  },
  followerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 9,
    borderBottomWidth: 1,
borderColor: "#ddd",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#093A3E",
    marginBottom: 20,
    textAlign: "center",
  },
  followerList: {
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 90,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#093A3E",
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
    padding: 10,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#ccc",
    marginBottom: 10,
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
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  nameContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#093A3E",
    marginRight: 5,
  },
  dropdownButton: {
    position: "absolute",
    right: 0,
    top: 1,
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
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#F2F4F7",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    color: "#111",
  },
  containerBande: {
    alignItems: "center",
    flexDirection: "row",
  },
  bandeUp: {
    backgroundColor: "#E8F5E9",
    height: 70,
    width: "38%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative", 
  },
  bandeDown: {
    backgroundColor: "#FDECEA",
    height: 70,
    width: "38%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative", 
  },
  voteContainer: {
    position: "absolute", 
    flexDirection: "row",
    alignItems: "center",
  },
  voteCount: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  bandeUpVote: {
    left: 20,  
  },
  bandeDownVote: {
    right: 20,  
  },
  displayName: {
    fontSize: 10,
    color: "#333",
    marginBottom: 10,
  },
  userCity: {
    fontSize: 12,
    color: "#777",
    marginVertical: 5,
    marginBottom: 10,
    marginRight: 2,
    textAlign: "center",
  },
  cityNameUser: {
    color: "#093A3E",
    fontWeight: "bold",
  },
  userDetails: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    textAlign: "center",
  },

  badgeWrapper: {
    width: "65%",
    alignItems: "center",
    marginTop:15,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 1,
    marginBottom: -12,
  },

  badgeContainer: {
    marginTop: 5,
    width: "100%",
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  badgeOrnement: {
    position: "absolute",
    top: 11,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
 
  statistics: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    borderRadius: 30,
    padding: 12,
  },
  relationFollowers: {
    flexDirection: "row",
    position: "absolute",
    bottom: -8,
    left:55,
  },
  relationFollowing: {
    flexDirection: "row",
    position: "absolute",
    bottom: -8,
    right: 30,
  },
  rankingItem: {
    flexDirection: "row",
    position: "absolute",
    bottom: 60,
  },
  statNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#093A3E",
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    marginLeft: 2,
  },
  separator: {
    height: 40,
    width: 1,
    backgroundColor: "#ddd",
  },

  voteSummary: {
    flexDirection: "row",
    paddingTop: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: "50%",
  },
  positiveVote: {
    borderStartStartRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: "#E8F5E9",
  },
  negativeVote: {
    borderEndEndRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#FDECEA",
  },
  noVotesText: {
    marginTop: 20,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },

  modalContentRanking: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  rankingTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#093A3E",
    textAlign: "center",
  },
  titleModal: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
    color: "#333",
  },
  rankingItemModal: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#FFF",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  topThreeImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  rankingTextModal: {
    fontSize: 16,
    color: "#333",
  },
  topThreeText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  badgeText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
  closeButtonModal: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#093A3E",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  closeButtonTextModal: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  nonTopThreeItem: {
    backgroundColor: "#EFEFEF",
    borderWidth: 0,
    borderRadius: 60,
    paddingLeft: 10,
  },
  nonTopThreeText: {
    color: "#666",
    fontWeight: "normal",
  },
  cityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
  },

  //  ------------------------------------------------ TOP 10 DES SMARTERS

  sectionTitleTop10: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#093A3E",
  },
  smarterItem: {
    alignItems: "center",
    width: 120,
    marginTop: 20,
    marginBottom: 10,
  },
  smarterImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    marginTop: 5,
    borderWidth: 3,
    borderColor: "#ddd",
  },
  rankingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  medal: {
    fontSize: 40,
    position: "absolute",
    top: -10,
    left: 30,
    zIndex: 1,
  },
  seeAllButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    width: 100,
    height: 100,
    marginTop: 25,
    marginHorizontal: 10,
    position: "relative",
  },
  bar: {
    position: "absolute",
    padding: 10,
    backgroundColor: "#093A3E",
  },
  horizontalBar: {
    width: 100,
    borderRadius: 5,
  },
  verticalBar: {
    height: 100,
    borderRadius: 5,
  },
  seeAllText: {
    position: "absolute",
    color: "#555",
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },

  //  ------------------------------------------------ SIGNALEMENTS PROCHE

  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  noReportsText: {
    fontSize: 18,
    color: "#A0A0A0",
    textAlign: "center",
    fontStyle: "italic",
  },
  timelineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  timelinePointContainer: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  photoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  singlePhoto: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  multiPhoto: {
    width: "48%",
    height: 200,
    borderRadius: 8,
  },
  noPhotoContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    width: "100%",
  },
  noPhotoText: {
    color: "#888",
    fontSize: 16,
    fontStyle: "italic",
  },
  timelineLabel: {
    width: 180,
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    textAlign: "center",
  },
  timelineBlock: {
    width: 230,
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  reportType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 10,
  },
  reportDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    fontWeight: "bold",
  },
  voteSummaryReport: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  voteButtonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  voteButtonReport: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  voteCountReports: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#093A3E",
    marginLeft: 3,
  },
  reportTime: {
    fontSize: 11,
    color: "#666",
  },
  //  ------------------------------------------------ SELECTION DE CATEGORIE

  categoryButton: {
    width: 120,
    height: 120,
    marginTop: 20,
    marginLeft: 5,
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
    marginTop: 20,
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
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#fff",
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },

  // ------------------------------------------------  CALENDRIER

  calendarContainer: {
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 20,
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
    marginHorizontal: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#093A3E",
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
    marginHorizontal: 10,
    padding: 20,
    backgroundColor: "#fce4ec",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f8bbd0",
    marginVertical: 10,
  },
  noEventsText: {
    fontSize: 16,
    color: "#d81b60",
    fontWeight: "bold",
    textAlign: "center",
  },
  noEventsTextOne: {
    fontSize: 16,
    color: "#d81b60",
    marginTop: 30,
    marginBottom: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  // ------------------------------------------------  PARTIE  MAIRIE

  // ------------------------------------------------ SIGNALEMENT RESOLUS

  infoCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 20,
    marginHorizontal: 10,

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
    marginHorizontal: 10,
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
    marginBottom: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginHorizontal: 10,
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

  // ------------------------------------------------  FOOTER

  footerCopyrightText: {
    textAlign: "center",
    marginTop: 40,
    marginBottom: 80,
    color: "#888",
    fontSize: 12,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
});

// import { StyleSheet } from "react-native";

// export default StyleSheet.create({
//   //  ------------------------------------------------ STYLE GLOBAL

//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingHorizontal: 5,
//     paddingTop: 90,
//   },
//   sectionTitle: {
//     fontSize: 17,
//     fontWeight: "bold",
//     color: "#093A3E",
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   sectionHeaderVisible: {
//     backgroundColor: "#f5f5f5",
//   },
//   sectionContent: {
//     backgroundColor: "#fff",
//   },
//   arrow: {
//     fontSize: 18,
//     color: "#666",
//   },
//   globalToggleButton: {
//     padding: 5,
//     backgroundColor: "#093A3E",
//     borderRadius: 8,
//   },
//   globalToggleButtonText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//     textAlign: "center",
//   },

//   //  ------------------------------------------------ LOADING

//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//   },
//   loadingText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#093A3E",
//   },

//   // ------------------------------------------------  MODAL PALIER

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: "90%",
//     height: "80%",
//     backgroundColor: "#FFF",
//     borderRadius: 20,
//     padding: 20,
//     alignItems: "center",
//     elevation: 5,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#333",
//     textAlign: "center",
//   },
//   modalBody: {
//     width: "100%",
//     paddingBottom: 20,
//   },
//   tierCard: {
//     width: 280,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 30,
//     backgroundColor: "#F9F9F9",
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 4,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#DDD",
//     alignItems: "center",
//   },
//   tierTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 5,
//     textAlign: "center",
//   },
//   tierDescription: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//   },
//   starsContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginBottom: 10,
//   },
//   closeButton: {
//     marginTop: 20,
//     backgroundColor: "#418074",
//     paddingHorizontal: 25,
//     paddingVertical: 10,
//     borderRadius: 50,
//     borderWidth: 2,
//     borderColor: "#FFF",
//   },
//   closeButtonText: {
//     fontSize: 16,
//     color: "#FFF",
//     fontWeight: "600",
//     textAlign: "center",
//   },

//   // ------------------------------------------------  MODAL LIKE

//   modalOverlayLike: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContentLike: {
//     width: "85%",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 20,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   icon: {
//     backgroundColor: "#E7F3EF",
//     borderRadius: 50,
//     padding: 15,
//     marginBottom: 20,
//   },
//   titleModalLike: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#222",
//     textAlign: "center",
//     marginBottom: 15,
//   },
//   description: {
//     fontSize: 16,
//     color: "#555",
//     textAlign: "center",
//     marginBottom: 20,
//     lineHeight: 24,
//   },
//   instructions: {
//     width: "100%",
//     marginBottom: 25,
//     paddingHorizontal: 10,
//   },
//   instructionItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//     backgroundColor: "#F9F9F9",
//     borderRadius: 10,
//     padding: 10,
//   },
//   instructionText: {
//     fontSize: 15,
//     color: "#444",
//     marginLeft: 10,
//     flex: 1,
//     lineHeight: 22,
//   },
//   closeButtonModalLike: {
//     backgroundColor: "#418074",
//     borderRadius: 20,
//     paddingVertical: 14,
//     paddingHorizontal: 25,
//     alignItems: "center",
//     width: "80%",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   closeButtonTextModalLike: {
//     fontSize: 16,
//     color: "#fff",
//     fontWeight: "bold",
//     textAlign: "center",
//   },

//   // ------------------------------------------------  MODAL PARTAGE DE POSITION

//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     paddingHorizontal: 20,
//   },

//   modalText: {
//     fontSize: 16,
//     color: "#ddd",
//     textAlign: "center",
//     marginBottom: 20,
//     lineHeight: 24,
//   },
//   button: {
//     backgroundColor: "#1E90FF",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//     textAlign: "center",
//   },

//   // ------------------------------------------------  MODAL FOLLOWER

//   containerFollower: {
//     flex: 1,
//     backgroundColor: "#f7f8fa",
//     padding: 20,
//     paddingTop: 110,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   followerList: {
//     paddingBottom: 20,
//   },
//   backButton: {
//     marginBottom: 70,
//     alignSelf: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 40,
//     backgroundColor: "#093A3E",
//     borderRadius: 30,
//   },
//   backButtonText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//     textTransform: "uppercase",
//   },

//   //  ------------------------------------------------ PROFILE CONTAINER

//   cardContainer: {
//     backgroundColor: "#ffffff",
//     borderRadius: 20,
//     padding: 10,
//     marginBottom: 5,
//     marginTop: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 5,
//   },
//   profileImage: {
//     width: 100,
//     height: 160,
//     borderRadius: 40,
//     borderWidth: 4,
//     borderColor: "#ccc",
//     marginRight: 16,
//   },
//   noProfileImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#e0e0e0",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   noProfileImageText: {
//     color: "#888",
//     fontSize: 12,
//     fontStyle: "italic",
//   },
//   userInfo: {
//     flex: 1,
//   },
//   nameContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   userName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#093A3E",
//   },
//   dropdownButton: {
//     position: "absolute",
//     right: 0,
//   },

//   modalContainerName: {
//     width: "80%",
//     backgroundColor: "#fff",
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     alignItems: "center",
//   },
//   optionContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   modalTitleName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   optionItem: {
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     backgroundColor: "#F2F4F7",
//     borderRadius: 10,
//     marginBottom: 10,
//     alignItems: "center",
//   },
//   optionText: {
//     fontSize: 14,
//     color: "#111",
//   },

//   userCity: {
//     fontSize: 12,
//     color: "#777",
//     paddingTop: 4,
//     marginRight: 2,
//   },
//   cityNameUser: {
//     color: "#093A3E",
//     fontWeight: "bold",
//   },
//   userDetails: {
//     fontSize: 12,
//     color: "#777",
//     marginTop: 4,
//     textAlign: "center",
//   },

//   badgeWrapper: {
//     alignItems: "center",
//     marginTop: 10,
//   },
//   iconsContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     zIndex: 1,
//     marginBottom: -17,
//   },
//   badgeContainer: {
//     marginTop: 5,
//     width: "100%",
//     paddingHorizontal: 20,
//     height: 40,
//     borderRadius: 55,
//     borderWidth: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowOpacity: 0.8,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   badgeOrnement: {
//     position: "absolute",
//     top: 14,
//     fontSize: 14,
//     fontWeight: "600",
//     textAlign: "center",
//   },
//   followerItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 12,
//     marginBottom: 12,
//     marginHorizontal: 1,
//     borderRadius: 90,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   followerImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   followerName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#444",
//   },
//   statistics: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     backgroundColor: "#F2F4F7",
//     borderRadius: 15,
//     padding: 12,
//   },
//   statItem: {
//     alignItems: "center",
//   },
//   statNumber: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#093A3E",
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#777",
//     marginTop: 4,
//   },
//   separator: {
//     height: 40,
//     width: 1,
//     backgroundColor: "#ddd",
//   },

//   voteSummary: {
//     flexDirection: "row",
//     paddingTop: 10,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 2,
//   },
//   voteButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//     width: "50%",
//   },
//   positiveVote: {
//     borderStartStartRadius: 20,
//     borderBottomLeftRadius: 20,
//     backgroundColor: "#E8F5E9",
//   },
//   negativeVote: {
//     borderEndEndRadius: 20,
// borderTopRightRadius: 20,
//     backgroundColor: "#FDECEA",
//   },
//   voteCount: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#093A3E",
//     marginLeft: 8,
//   },
//   noVotesText: {
//     marginTop: 20,
//     fontSize: 16,
//     color: "#999",
//     textAlign: "center",
//   },

//   modalContentRanking: {
//     flex: 1,
//     backgroundColor: "#F5F5F5",
//     padding: 20,
//   },
//   titleModal: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginTop: 40,
//     marginBottom: 40,
//     color: "#333",
//   },
//   rankingItemModal: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//     backgroundColor: "#FFF",
//     padding: 10,
//     marginHorizontal: 5,
//     borderRadius: 30,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   userImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 10,
//   },
//   topThreeImage: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//   },
//   rankingTextModal: {
//     fontSize: 16,
//     color: "#333",
//   },
//   topThreeText: {
//     fontWeight: "bold",
//     fontSize: 18,
//   },
//   badge: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1,
//   },
//   badgeText: {
//     fontSize: 18,
//     color: "#FFF",
//     fontWeight: "bold",
//   },
//   closeButtonModal: {
//     alignSelf: "center",
//     marginTop: 20,
//     marginBottom: 10,
//     backgroundColor: "#093A3E",
//     paddingVertical: 15,
//     paddingHorizontal: 50,
//     borderRadius: 30,
//   },
//   closeButtonTextModal: {
//     color: "#FFF",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   nonTopThreeItem: {
//     backgroundColor: "#EFEFEF",
//     borderWidth: 0,
//     borderRadius: 60,
//     paddingLeft: 10,
//   },
//   nonTopThreeText: {
//     color: "#666",
//     fontWeight: "normal",
//   },
//   cityName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#007BFF",
//   },

//   //  ------------------------------------------------ TOP 10 DES SMARTERS

//   sectionTitleTop10: {
//     fontSize: 17,
//     fontWeight: "bold",
//     color: "#093A3E",
//   },
//   smarterItem: {
//     alignItems: "center",
//     width: 120,
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   smarterImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 10,
//     marginTop: 5,
//     borderWidth: 3,
//     borderColor: "#ddd",
//   },
//   rankingName: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#555",
//     textAlign: "center",
//   },
//   medal: {
//     fontSize: 40,
//     position: "absolute",
//     top: -10,
//     left: 30,
//     zIndex: 1,
//   },
//   seeAllButton: {
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 50,
//     width: 100,
//     height: 100,
//     marginTop: 25,
//     marginHorizontal: 10,
//     position: "relative",
//   },
//   bar: {
//     position: "absolute",
//     padding: 10,
//     backgroundColor: "#093A3E",
//   },
//   horizontalBar: {
//     width: 100,
//     borderRadius: 5,
//   },
//   verticalBar: {
//     height: 100,
//     borderRadius: 5,
//   },
//   seeAllText: {
//     position: "absolute",
//     color: "#fff",
//     letterSpacing: 2,
//     fontSize: 12,
//     fontWeight: "bold",
//     textAlign: "center",
//   },

//   //  ------------------------------------------------ SIGNALEMENTS PROCHE

//   emptyStateContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 30,
//   },
//   noReportsText: {
//     fontSize: 18,
//     color: "#A0A0A0",
//     textAlign: "center",
//     fontStyle: "italic",
//   },
//   timelineContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 20,
//   },
//   timelinePointContainer: {
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   photoContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   singlePhoto: {
//     width: "100%",
//     height: 200,
//     borderRadius: 8,
//   },
//   multiPhoto: {
//     width: "48%",
//     height: 200,
//     borderRadius: 8,
//   },
//   noPhotoContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     height: 200,
//     width: "100%",
//   },
//   noPhotoText: {
//     color: "#888",
//     fontSize: 16,
//     fontStyle: "italic",
//   },
//   timelineLabel: {
//     width: 180,
//     marginTop: 5,
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//     marginBottom: 10,
//   },
//   labelText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#FFF",
//     textAlign: "center",
//   },
//   timelineBlock: {
//     width: 230,
//     backgroundColor: "#FFF",
//     borderRadius: 15,
//     padding: 15,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 5,
//     elevation: 3,
//     marginBottom: 10,
//   },
//   reportTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 10,
//   },
//   reportType: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#555",
//     marginBottom: 10,
//   },
//   reportDetails: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 5,
//     fontWeight: "bold",
//   },
//   voteSummaryReport: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     marginTop: 10,
//   },
//   voteButtonsContainer: {
//     flexDirection: "row",
//     gap: 10,
//   },
//   voteButtonReport: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 25,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 2,
//   },
//   voteCountReports: {
//     fontSize: 10,
//     fontWeight: "bold",
//     color: "#093A3E",
//     marginLeft: 3,
//   },
//   reportTime: {
//     fontSize: 11,
//     color: "#666",
//   },
//   //  ------------------------------------------------ SELECTION DE CATEGORIE

//   categoryButton: {
//     width: 120,
//     height: 120,
//     marginTop: 20,
//     marginLeft: 5,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 10,
//     borderRadius: 90,
//   },
//   categoryIcon: {
//     marginBottom: 5,
//   },
//   categoryText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },

//   //  ------------------------------------------------ EVENT A LA UNE

//   featuredItem: {
//     width: 150,
//     minHeight: 150,
//     marginRight: 15,
//     borderRadius: 10,
//     overflow: "hidden",
//     backgroundColor: "#fff",
//     marginTop: 20,
//   },
//   featuredImage: {
//     width: "100%",
//     height: "auto",
//     aspectRatio: 1.5,
//   },
//   featuredTitle: {
//     padding: 10,
//     fontSize: 14,
//     color: "#333",
//     fontWeight: "bold",
//     textAlign: "center",
//     backgroundColor: "#fff",
//     borderBottomEndRadius: 10,
//     borderBottomStartRadius: 10,
//   },
//   errorText: {
//     color: "red",
//     fontSize: 16,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginTop: 10,
//     marginHorizontal: 20,
//   },

//   // ------------------------------------------------  CALENDRIER

//   calendarContainer: {
//     marginBottom: 20,
//     marginHorizontal: 10,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     marginTop: 20,
//   },
//   eventItem: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#e3e3e3",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     marginBottom: 20,
//     marginHorizontal: 10,
//   },
//   eventTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 5,
//     color: "#093A3E",
//   },
//   eventDetails: {
//     fontSize: 14,
//     color: "#555",
//     marginBottom: 5,
//   },
//   eventLocation: {
//     fontSize: 14,
//     color: "#888",
//   },
//   noEventsContainer: {
//     alignItems: "center",
//     marginHorizontal: 10,
//     padding: 20,
//     backgroundColor: "#fce4ec",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#f8bbd0",
//     marginBottom: 20,
//   },
//   noEventsText: {
//     fontSize: 16,
//     color: "#d81b60",
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   noEventsTextOne: {
//     fontSize: 16,
//     color: "#d81b60",
//     marginTop: 30,
//     marginBottom: 40,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   // ------------------------------------------------  PARTIE  MAIRIE

//   // ------------------------------------------------ SIGNALEMENT RESOLUS

//   infoCard: {
//     backgroundColor: "#fff",
//     paddingHorizontal: 15,
//     borderRadius: 15,
//     marginTop: 20,
//     marginHorizontal: 10,

//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 4,
//   },
//   infoTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#093A3E",
//     marginBottom: 10,
//     marginTop: 15,
//   },
//   infoContent: {
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 15,
//     lineHeight: 20,
//   },
//   infoLabel: {
//     fontWeight: "bold",
//     color: "#666",
//   },

//   // ------------------------------------------------  FICHE INFORMATION MAIRE

//   mayorCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 15,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 4,
//     marginHorizontal: 10,
//   },
//   profileImageMayor: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 15,
//     marginRight: 15,
//   },
//   mayorContainer: {
//     flex: 1,
//   },
//   mayorInfo: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#093A3E",
//     marginBottom: 5,
//   },
//   mayorName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   mayorSubtitle: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 5,
//   },
//   mayorContact: {
//     fontSize: 16,
//     color: "#333",
//     marginTop: 10,
//   },
//   contactBold: {
//     fontWeight: "bold",
//     marginTop: 5,
//   },

//   // ------------------------------------------------ FICHE CONTACT MAIRIE

//   officeCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 15,
//     marginBottom: 90,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 4,
//     marginHorizontal: 10,
//   },
//   officeImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 15,
//     marginRight: 15,
//   },
//   officeInfo: {
//     flex: 1,
//   },
//   officeAddress: {
//     fontSize: 16,
//     color: "#333",
//     marginBottom: 10,
//   },
//   Address: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#093A3E",
//   },
//   officeContact: {
//     fontSize: 14,
//     color: "#666",
//   },
//   phone: {
//     fontWeight: "bold",
//   },
//   hours: {
//     fontWeight: "bold",
//   },

//   // ------------------------------------------------  FOOTER

//   footerCopyrightText: {
//     textAlign: "center",
//     marginTop: 40,
//     marginBottom: 80,
//     color: "#888",
//     fontSize: 12,
//     fontStyle: "italic",
//     letterSpacing: 0.5,
//   },
// });


// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   Switch,
//   Pressable,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import CalendarPicker from "react-native-calendar-picker";
// import styles from "./styles/HomeScreen.styles";
// import axios from "axios";
// import { useLocation } from "../hooks/useLocation";
// import { processReports, Report } from "../services/reportService";
// import { formatCity } from "../utils/formatters";
// import { getTypeLabel, typeColors } from "../utils/reportHelpers";
// import { hexToRgba, calculateOpacity } from "../utils/reductOpacity";
// import { getUserIdFromToken } from "../utils/tokenUtils";
// import Chart from "../components/Chart";
// import { useFetchStatistics } from "../hooks/useFetchStatistics";
// // @ts-ignore
// import { API_URL } from "@env";
// import { Linking } from "react-native";
// import * as ImagePicker from "expo-image-picker";

// type User = {
//   id: string;
//   createdAt: string;
//   ranking: string;
//   firstName: string;
//   lastName: string;
//   username?: string;
//   useFullName: boolean;
//   nomCommune: string;
//   email: string;
//   trustRate?: number;
//   followers?: any[];
//   following?: any[];
//   reports?: any[];
//   comments?: any[];
//   posts?: any[];
//   organizedEvents?: any[];
//   attendedEvents?: any[];
//   latitude?: number;
//   longitude?: number;
//   profilePhoto?: { url: string };
//   isSubscribed: boolean;
//   isMunicipality: boolean;
//   votes: any[];
// };

// interface TopUser {
//   id: string;
//   username: string;
//   photo: string | null;
//   ranking: number;
//   useFullName: boolean;
//   firstName: string;
//   lastName: string;
// }

// interface Event {
//   id: string;
//   title: string;
//   date: string;
//   location: string;
// }

// export default function HomeScreen({ navigation, handleScroll }) {
//   const { location, loading: locationLoading } = useLocation();
//   const [reports, setReports] = useState<Report[]>([]);
//   const [loadingReports, setLoadingReports] = useState(true);
//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [user, setUser] = useState<User | null>(null);
//   const isLoading = locationLoading || loadingReports || loadingUsers;
//   const [smarterData, setSmarterData] = useState<
//     {
//       id: string;
//       username: string;
//       displayName: string;
//       image: { uri: string };
//     }[]
//   >([]);
//   const [showFollowers, setShowFollowers] = useState(false);
//   const [ranking, setRanking] = useState<number | null>(null);
//   const [totalUsers, setTotalUsers] = useState<number | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [stats, setStats] = useState<any>(null);
//   const [featuredEvents, setFeaturedEvents] = useState<
//     { id: string; title: string; image: string }[]
//   >([]);
//   const [events, setEvents] = useState<Event[]>([]);
//   const [modalNameVisible, setModalNameVisible] = useState(false);
//   const nomCommune = user?.nomCommune || "";
//   const { data } = useFetchStatistics(
//     `${API_URL}/reports/statistics`,
//     nomCommune
//   );
//   const userCity = user?.nomCommune || "Commune non définie";
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [isSectionVisible, setSectionVisible] = useState(true);
//   const [isReportsVisible, setReportsVisible] = useState(true);
//   const [isEventsVisible, setEventsVisible] = useState(true);
//   const [isCalendarVisible, setCalendarVisible] = useState(true);
//   const [isCategoryReportsVisible, setCategoryReportsVisible] = useState(true);
//   const [isMayorInfoVisible, setMayorInfoVisible] = useState(true);
//   const [areAllSectionsVisible, setAllSectionsVisible] = useState(true);
//   const [modalOrnementVisible, setModalOrnementVisible] = useState(false);
//   const [modalLikeVisible, setModalLikeVisible] = useState(false);

//   useEffect(() => {
//     const fetchRanking = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const userId = await getUserIdFromToken();
//         if (!userId) {
//           throw new Error("Impossible de récupérer l'ID utilisateur.");
//         }

//         const userResponse = await fetch(`${API_URL}/users/${userId}`);
//         if (!userResponse.ok) {
//           throw new Error("Impossible de récupérer les données utilisateur.");
//         }
//         const userData = await userResponse.json();

//         const cityName = userData.nomCommune;
//         if (!cityName) {
//           throw new Error("La ville de l'utilisateur est introuvable.");
//         }

//         const rankingResponse = await fetch(
//           `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(
//             cityName
//           )}`
//         );
//         if (!rankingResponse.ok) {
//           throw new Error(`Erreur serveur : ${rankingResponse.statusText}`);
//         }

//         const rankingData = await rankingResponse.json();
//         setRanking(rankingData.ranking);
//         setTotalUsers(rankingData.totalUsers);
//       } catch (error) {
//         console.error("Erreur lors de la récupération du classement :", error);
//         setError(error.message || "Erreur inconnue.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRanking();
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const userId = await getUserIdFromToken();
//         if (!userId) {
//           console.warn("ID utilisateur non trouvé");
//           return;
//         }

//         const userResponse = await fetch(`${API_URL}/users/${userId}`);
//         if (!userResponse.ok) {
//           console.error(
//             "Erreur lors de la récupération des données utilisateur"
//           );
//           return;
//         }
//         const userData = await userResponse.json();
//         setUser(userData);

//         const cityName = userData.nomCommune;
//         if (!cityName) {
//           throw new Error("La ville de l'utilisateur est introuvable.");
//         }

//         const topUsersResponse = await fetch(
//           `${API_URL}/users/top10?cityName=${encodeURIComponent(cityName)}`
//         );
//         if (!topUsersResponse.ok) {
//           console.error(
//             "Erreur lors de la récupération des utilisateurs populaires"
//           );
//           return;
//         }

//         const topUsersData: TopUser[] = await topUsersResponse.json();

//         const formattedData = topUsersData.map((user) => ({
//           id: user.id,
//           username: user.username,
//           displayName: user.useFullName
//             ? `${user.firstName} ${user.lastName}`
//             : user.username,
//           ranking: user.ranking,
//           image: { uri: user.photo || "default-image-url" },
//         }));

//         formattedData.sort((a, b) => a.ranking - b.ranking);
//         setSmarterData(formattedData);

//         if (location) {
//           setLoadingReports(true);
//           const reports = await processReports(
//             location.latitude,
//             location.longitude
//           );
//           setReports(reports);
//         }
//       } catch (err: any) {
//         console.error(
//           "Erreur lors de la récupération des données :",
//           err.message
//         );
//       } finally {
//         setLoadingUsers(false);
//         setLoadingReports(false);
//       }
//     };

//     fetchData();
//   }, [location]);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const userId = await getUserIdFromToken();
//         if (!userId) {
//           throw new Error("Utilisateur non connecté ou ID introuvable.");
//         }

//         const response = await axios.get(`${API_URL}/users/stats/${userId}`);
//         if (response.status !== 200) {
//           throw new Error(`Erreur API : ${response.statusText}`);
//         }

//         const data = response.data;
//         if (!data.votes) {
//           data.votes = [];
//         }

//         setStats(data);
//       } catch (error: any) {
//         console.error("Erreur dans fetchStats :", error.message || error);
//         setError("Impossible de récupérer les statistiques.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, []);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await axios.get(`${API_URL}/events`);
//         if (response.status !== 200) {
//           throw new Error(`Erreur API : ${response.statusText}`);
//         }

//         const userCityNormalized = normalizeCityName(userCity);

//         const filteredEvents = response.data
//           .filter((event: any) => {
//             const eventCity = extractCityAfterPostalCode(event.location);
//             const eventCityNormalized = normalizeCityName(eventCity);

//             return eventCityNormalized === userCityNormalized;
//           })
//           .map((event: any) => ({
//             id: event.id,
//             title: event.title,
//             image:
//               event.photos.find((photo: any) => photo.isProfile)?.url ||
//               event.photos[0]?.url ||
//               "https://via.placeholder.com/300",
//           }));

//         setFeaturedEvents(filteredEvents);
//       } catch (error: any) {
//         console.error("Erreur dans fetchEvents :", error.message || error);
//         setError("Impossible de récupérer les événements.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (userCity) {
//       fetchEvents();
//     }
//   }, [userCity]);

//   const extractCityAfterPostalCode = (location: string) => {
//     if (!location) return "";
//     const match = location.match(/\d{5}\s+([^,]+)/);
//     return match ? match[1].trim() : "";
//   };

//   const normalizeCityName = (cityName: string) => {
//     if (!cityName) return "";
//     return cityName
//       .toLowerCase()
//       .replace(/[-_]/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#102542" />
//         <Text style={styles.loadingText}>Chargement en cours...</Text>
//       </View>
//     );
//   }

//   if (!location) {
//     console.error("Localisation non disponible");
//     return (
//       <Modal transparent animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Partagez votre position</Text>
//           <Text style={styles.modalText}>
//             La permission de localisation est nécessaire pour utiliser
//             l'application.
//           </Text>
//           <TouchableOpacity style={styles.button} onPress={() => useLocation()}>
//             <Text style={styles.buttonText}>Réessayer</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     );
//   }

//   if (loadingReports) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#102542" />
//         <Text style={{ color: "#102542" }}>Chargement en cours...</Text>
//       </View>
//     );
//   }

//   if (!reports || reports.length === 0) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#102542" />
//         <Text style={styles.loadingText}>Chargement des signalements...</Text>
//       </View>
//     );
//   }

//   if (!stats || !stats.votes) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#102542" />
//         <Text style={styles.loadingText}>Chargement des votes...</Text>
//       </View>
//     );
//   }

//   const fetchEventsByDate = async (date: string): Promise<void> => {
//     try {
//       const response = await axios.get<
//         { id: string; title: string; date: string; location: string }[]
//       >(`${API_URL}/events/by-date`, {
//         params: { date },
//       });
//       setEvents(response.data);
//     } catch (error) {
//       console.error("Erreur lors de la récupération des événements :", error);
//       alert("Impossible de charger les événements pour cette date.");
//     }
//   };

//   const calculateYearsSince = (dateString: string): string => {
//     const date = new Date(dateString);
//     const now = new Date();

//     let years = now.getFullYear() - date.getFullYear();
//     let months = now.getMonth() - date.getMonth();
//     let days = now.getDate() - date.getDate();

//     if (days < 0) {
//       months -= 1;
//       const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
//       days += previousMonth.getDate();
//     }

//     if (months < 0) {
//       years -= 1;
//       months += 12;
//     }

//     if (years > 1) {
//       return `${years} ans`;
//     } else if (years === 1) {
//       return `1 an et ${months} mois`;
//     } else if (months > 1) {
//       return `${months} mois`;
//     } else if (months === 1) {
//       return `1 mois et ${days} jours`;
//     } else if (days > 1) {
//       return `${days} jours`;
//     } else {
//       return "moins d'un jour";
//     }
//   };

//   const handlePressReport = (id: number) => {
//     navigation.navigate("ReportDetailsScreen", { reportId: id });
//   };

//   const handleCategoryClick = (category: string) => {
//     navigation.navigate("CategoryReportsScreen", { category });
//   };

//   const toggleFollowersList = () => {
//     setShowFollowers((prev) => !prev);
//   };

//   const handlePressPhoneNumber = () => {
//     Linking.openURL("tel:0320440251");
//   };

//   const renderFollower = ({ item }) => (
//     <TouchableOpacity
//       style={styles.followerItem}
//       onPress={() =>
//         navigation.navigate("UserProfileScreen", { userId: item.id })
//       }
//     >
//       <Image
//         source={{ uri: item.profilePhoto || "https://via.placeholder.com/50" }}
//         style={styles.followerImage}
//       />
//       {/* Encapsulation du texte */}
//       <Text style={styles.followerName}>{item.username || "Utilisateur"}</Text>
//     </TouchableOpacity>
//   );

//   const getRankingSuffix = (rank) => {
//     if (!rank) return "";
//     return rank === 1 ? "er" : "ème";
//   };

//   const displayName = user?.useFullName
//     ? `${user.firstName} ${user.lastName}`
//     : user?.username;

//   const handleOptionChange = async (option: "fullName" | "username") => {
//     setModalNameVisible(false);

//     try {
//       const response = await fetch(`${API_URL}/users/display-preference`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: user?.id,
//           useFullName: option === "fullName",
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Erreur lors de la mise à jour de la préférence.");
//       }

//       setUser((prevUser) => ({
//         ...prevUser!,
//         useFullName: option === "fullName",
//       }));
//     } catch (error) {
//       console.error("Erreur lors de la mise à jour de la préférence", error);
//     }
//   };

//   const formatTime = (dateString) => {
//     const eventDate = new Date(dateString);
//     const now = new Date();

//     const diffInMs = now.getTime() - eventDate.getTime();
//     const diffInSeconds = Math.floor(diffInMs / 1000);
//     const diffInMinutes = Math.floor(diffInSeconds / 60);
//     const diffInHours = Math.floor(diffInMinutes / 60);
//     const diffInDays = Math.floor(diffInHours / 24);

//     if (diffInSeconds < 60) {
//       return `Il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? "s" : ""}`;
//     } else if (diffInMinutes < 60) {
//       return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
//     } else if (diffInHours < 24) {
//       return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
//     } else {
//       return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
//     }
//   };

//   if (showFollowers) {
//     return (
//       <View style={styles.containerFollower}>
//         <Text style={styles.title}>Mes followers</Text>
//         <FlatList
//           data={user?.followers || []}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderFollower}
//           contentContainerStyle={styles.followerList}
//         />
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={toggleFollowersList}
//         >
//           <Text style={styles.backButtonText}>Retour</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const categories = [
//     {
//       name: "danger",
//       label: "Danger",
//       icon: "alert-circle-outline",
//       color: "#FF4C4C",
//     },
//     {
//       name: "travaux",
//       label: "Travaux",
//       icon: "construct-outline",
//       color: "#FFA500",
//     },
//     {
//       name: "nuisance",
//       label: "Nuisance",
//       icon: "volume-high-outline",
//       color: "#B4A0E5",
//     },
//     {
//       name: "reparation",
//       label: "Réparation",
//       icon: "hammer-outline",
//       color: "#33C2FF",
//     },
//     {
//       name: "pollution",
//       label: "Pollution",
//       icon: "leaf-outline",
//       color: "#32CD32",
//     },
//   ];

//   const onRefresh = async () => {
//     setRefreshing(true);

//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     setRefreshing(false);

//     navigation.replace("Main");
//   };

//   const handleProfileImageClick = async () => {
//     try {
//       setIsSubmitting(true);

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         quality: 1,
//         aspect: [1, 1],
//       });

//       if (result.canceled) {
//         setIsSubmitting(false);
//         return;
//       }

//       const photoUri = result.assets?.[0]?.uri;

//       if (!photoUri) {
//         throw new Error("Aucune image sélectionnée");
//       }

//       const formData = new FormData();
//       formData.append("profileImage", {
//         uri: photoUri,
//         type: "image/jpeg",
//         name: "profile.jpg",
//       } as any);

//       console.log("FormData clé et valeur:", formData);

//       const userId = await getUserIdFromToken();
//       if (!userId) throw new Error("ID utilisateur non trouvé");

//       const responsePost = await fetch(
//         `${API_URL}/users/${userId}/profile-image`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       console.log("Response status:", responsePost.status);

//       if (!responsePost.ok) {
//         const errorBody = await responsePost.text();
//         console.error("Response body:", errorBody);
//         throw new Error("Échec de la mise à jour de la photo de profil");
//       }

//       const updatedUser = await responsePost.json();
//       console.log("Response body:", updatedUser);

//       navigation.replace("Main");
//     } catch (err: any) {
//       console.error("Erreur lors de l'upload :", err.message);
//       setError(err.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const toggleSection = () => {
//     setSectionVisible((prevState) => !prevState);
//   };

//   const toggleReports = () => {
//     setReportsVisible((prevState) => !prevState);
//   };

//   const toggleEvents = () => {
//     setEventsVisible((prevState) => !prevState);
//   };

//   const toggleCalendar = () => {
//     setCalendarVisible((prevState) => !prevState);
//   };

//   const toggleCategoryReports = () => {
//     setCategoryReportsVisible((prevState) => !prevState);
//   };

//   const toggleMayorInfo = () => {
//     setMayorInfoVisible((prevState) => !prevState);
//   };

//   const toggleAllSections = () => {
//     const newVisibility = !areAllSectionsVisible;
//     setAllSectionsVisible(newVisibility);
//     setSectionVisible(newVisibility);
//     setReportsVisible(newVisibility);
//     setEventsVisible(newVisibility);
//     setCalendarVisible(newVisibility);
//     setCategoryReportsVisible(newVisibility);
//     setMayorInfoVisible(newVisibility);
//   };

//   const getBadgeStyles = (votes: number) => {
//     if (votes >= 1000) {
//       return {
//         title: "Légende urbaine",
//         backgroundColor: "#70B3B1",
//         textColor: "#fff",
//         borderColor: "#044745",
//         shadowColor: "#70B3B1",
//         starsColor: "#044745",
//         stars: 6,
//         icon: null,
//       };
//     } else if (votes >= 500) {
//       return {
//         title: "Icône locale",
//         backgroundColor: "#FAF3E3",
//         textColor: "#856404",
//         borderColor: "#856404",
//         shadowColor: "#D4AF37",
//         starsColor: "#D4AF37",
//         stars: 5,
//         icon: null,
//       };
//     } else if (votes >= 250) {
//       return {
//         title: "Pilier de la communauté",
//         backgroundColor: "#E1E1E1",
//         textColor: "#6A6A6A",
//         borderColor: "#919191",
//         shadowColor: "#6A6A6A",
//         starsColor: "#919191",
//         stars: 4,
//         icon: null,
//       };
//     } else if (votes >= 100) {
//       return {
//         title: "Ambassadeur citoyen",
//         backgroundColor: "#E1E1E1",
//         textColor: "#6A6A6A",
//         starsColor: "#919191",
//         shadowColor: "#6A6A6A",
//         borderColor: "#919191",
//         stars: 3,
//         icon: null,
//       };
//     } else if (votes >= 50) {
//       return {
//         title: "Citoyen de confiance",
//         backgroundColor: "#CEA992",
//         textColor: "#853104",
//         starsColor: "#853104",
//         shadowColor: "#853104",
//         borderColor: "#D47637",
//         stars: 2,
//         icon: null,
//       };
//     } else if (votes >= 5) {
//       return {
//         title: "Apprenti citoyen",
//         backgroundColor: "#CEA992",
//         textColor: "#853104",
//         starsColor: "#853104",
//         borderColor: "#D47637",
//         shadowColor: "#853104",

//         stars: 1,
//         icon: null,
//       };
//     } else {
//       return {
//         title: "Premiers pas",
//         backgroundColor: "#093A3E",
//         textColor: "#fff",
//         borderColor: "#fff",
//         shadowColor: "#093A3E",
//         starsColor: "#0AAEA8",
//         stars: 0,
//         icon: <Ionicons name="school" size={24} color="#fff" />,
//       };
//     }
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//       }
//       onScroll={handleScroll}
//       scrollEventThrottle={16}
//     >
//       <View style={styles.cardContainer}>
//         <View style={styles.header}>

//           {/** IMAGE PROFIL */}
//           {user?.profilePhoto?.url ? (
//             <TouchableOpacity onPress={handleProfileImageClick}>
//               <Image
//                 source={{ uri: user.profilePhoto.url }}
//                 style={styles.profileImage}
//               />
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity onPress={handleProfileImageClick}>
//               <View style={styles.noProfileImage}>
//                 <Text style={styles.noProfileImageText}>
//                   Pas de photo de profil
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           )}

//           <View style={styles.userInfo}>
//             {/** NOM ET ICONE */}
//             <View>
//               <View style={styles.nameContainer}>
//                 <Text
//                   onPress={() => setModalNameVisible(true)}
//                   style={styles.userName}
//                 >
//                   {displayName}
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => setModalNameVisible(true)}
//                   style={styles.dropdownButton}
//                 >
//                   <Ionicons name="settings-outline" size={18} color="#102542" />
//                 </TouchableOpacity>
//               </View>

//               <Modal
//                 visible={modalNameVisible}
//                 transparent={true}
//                 animationType="fade"
//                 onRequestClose={() => setModalNameVisible(false)}
//               >
//                 <View style={styles.modalOverlay}>
//                   <View style={styles.modalContainerName}>
//                     <Text style={styles.modalTitleName}>
//                       Indiquez votre préférence pour votre identité visible
//                     </Text>
//                     <FlatList
//                       data={[
//                         {
//                           label: "Mon nom et prénom",
//                           value: true,
//                         },
//                         {
//                           label: "Mon nom d'utilisateur",
//                           value: false,
//                         },
//                       ]}
//                       keyExtractor={(item) => item.value.toString()}
//                       renderItem={({ item }) => (
//                         <View style={styles.optionItem}>
//                           <Text style={styles.optionText}>{item.label}</Text>
//                           <Switch
//                             value={user?.useFullName === item.value}
//                             onValueChange={() =>
//                               handleOptionChange(
//                                 item.value ? "fullName" : "username"
//                               )
//                             }
//                             trackColor={{ false: "#CCCCCC", true: "#4CAF50" }}
//                             thumbColor="#FFF"
//                           />
//                         </View>
//                       )}
//                     />
//                     <TouchableOpacity
//                       style={styles.closeButton}
//                       onPress={() => setModalNameVisible(false)}
//                     >
//                       <Text style={styles.closeButtonText}>Fermer</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </Modal>
//             </View>

//             {/** VILLE ET INSCRIPTION */}
//             <Text style={styles.userCity}>
//               Engagé pour{" "}
//               <Text
//                 style={styles.cityNameUser}
//                 onPress={() => navigation.navigate("CityScreen")}
//               >
//                 {user?.nomCommune || "une commune non définie"}
//               </Text>
//               <Text style={styles.userDetails}>
//                 {" "}
//                 depuis{" "}
//                 {user?.createdAt
//                   ? `${calculateYearsSince(user.createdAt)}`
//                   : "depuis un certain temps"}
//               </Text>
//             </Text>

//             {/** BADGE */}
//             <View style={styles.badgeWrapper}>
//               {/* Conteneur des icônes (au-dessus du badge) */}
//               <View style={styles.iconsContainer}>
//                 {getBadgeStyles(stats.votes.length).stars === 0 ? (
//                   <Ionicons
//                     name="school"
//                     size={24}
//                     color={getBadgeStyles(stats.votes.length).starsColor}
//                   />
//                 ) : (
//                   Array.from({
//                     length: getBadgeStyles(stats.votes.length).stars,
//                   }).map((_, index) => (
//                     <Ionicons
//                       key={index}
//                       name="star"
//                       size={20}
//                       color={getBadgeStyles(stats.votes.length).starsColor}
//                     />
//                   ))
//                 )}
//               </View>

//               {/* Badge */}
//               <Pressable
//                 onPress={() => setModalOrnementVisible(true)}
//                 style={[
//                   styles.badgeContainer,
//                   {
//                     backgroundColor: getBadgeStyles(stats.votes.length)
//                       .backgroundColor,
//                     borderColor: getBadgeStyles(stats.votes.length).borderColor,
//                     shadowColor: getBadgeStyles(stats.votes.length).shadowColor,
//                   },
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.badgeOrnement,
//                     { color: getBadgeStyles(stats.votes.length).textColor },
//                   ]}
//                 >
//                   {getBadgeStyles(stats.votes.length).title}
//                 </Text>
//               </Pressable>
//             </View>

//             {/* MODAL DES PALIER */}
//             <Modal
//               animationType="slide"
//               transparent={true}
//               visible={modalOrnementVisible}
//               onRequestClose={() => setModalOrnementVisible(false)}
//             >
//               <View style={styles.modalOverlay}>
//                 <View style={styles.modalContent}>
//                   {/* Titre principal */}
//                   <Text style={styles.modalTitle}>Paliers</Text>

//                   {/* Corps scrollable */}
//                   <ScrollView contentContainerStyle={styles.modalBody}>
//                     {[
//                       {
//                         name: "Légende urbaine",
//                         description: "Plus de 1000 votes",
//                         stars: 6,
//                         starsColor: "#70B3B1",
//                       },
//                       {
//                         name: "Icône locale",
//                         description: "500 à 999 votes",
//                         stars: 5,
//                         starsColor: "#D4AF37",
//                       },
//                       {
//                         name: "Pilier de la communauté",
//                         description: "250 à 499 votes",
//                         stars: 4,
//                         starsColor: "#919191",
//                       },
//                       {
//                         name: "Ambassadeur citoyen",
//                         description: "100 à 249 votes",
//                         stars: 3,
//                         starsColor: "#919191",
//                       },
//                       {
//                         name: "Citoyen de confiance",
//                         description: "50 à 99 votes",
//                         stars: 2,
//                         starsColor: "#853104",
//                       },
//                       {
//                         name: "Apprenti citoyen",
//                         description: "5 à 49 votes",
//                         stars: 1,
//                         starsColor: "#853104",
//                       },
//                       {
//                         name: "Premiers pas",
//                         description: "Moins de 5 votes",
//                         stars: 0,
//                         starsColor: "#6A6A6A",
//                       },
//                     ].map((tier, index) => (
//                       <View key={index} style={styles.tierCard}>
//                         {/* Étoiles */}
//                         <View style={styles.starsContainer}>
//                           {Array.from({ length: tier.stars }).map((_, i) => (
//                             <Ionicons
//                               key={i}
//                               name="star"
//                               size={20}
//                               color={tier.starsColor}
//                             />
//                           ))}
//                           {tier.stars === 0 && (
//                             <Ionicons
//                               name="school"
//                               size={24}
//                               color={tier.starsColor}
//                             />
//                           )}
//                         </View>
//                         {/* Titre */}
//                         <Text
//                           style={[styles.tierTitle, { color: tier.starsColor }]}
//                         >
//                           {tier.name}
//                         </Text>
//                         {/* Description */}
//                         <Text style={styles.tierDescription}>
//                           {tier.description}
//                         </Text>
//                       </View>
//                     ))}
//                   </ScrollView>

//                   {/* Bouton de fermeture */}
//                   <Pressable
//                     style={styles.closeButton}
//                     onPress={() => setModalOrnementVisible(false)}
//                   >
//                     <Text style={styles.closeButtonText}>Fermer</Text>
//                   </Pressable>
//                 </View>
//               </View>
//             </Modal>

//             {/* VOTES */}
//             <TouchableOpacity onPress={() => setModalLikeVisible(true)}>
//               <View>
//                 {stats && stats.votes ? (
//                   stats.votes.length > 0 ? (
//                     (() => {
//                       interface Vote {
//                         type: "up" | "down";
//                       }

//                       interface VoteSummary {
//                         up: number;
//                         down: number;
//                       }

//                       const voteSummary: VoteSummary = stats.votes.reduce(
//                         (acc: VoteSummary, vote: Vote) => {
//                           if (vote.type === "up") acc.up++;
//                           else acc.down++;
//                           return acc;
//                         },
//                         { up: 0, down: 0 }
//                       );

//                       return (
//                         <View style={styles.voteSummary}>
//                           {/* Bouton pour votes positifs */}
//                           <View
//                             style={[styles.voteButton, styles.positiveVote]}
//                           >
//                             <Ionicons
//                               name="thumbs-up-outline"
//                               size={23}
//                               color="#418074"
//                             />
//                             <Text style={styles.voteCount}>
//                               {voteSummary.up}
//                             </Text>
//                           </View>

//                           {/* Bouton pour votes négatifs */}
//                           <View
//                             style={[styles.voteButton, styles.negativeVote]}
//                           >
//                             <Ionicons
//                               name="thumbs-down-outline"
//                               size={23}
//                               color="#A73830"
//                             />
//                             <Text style={styles.voteCount}>
//                               {voteSummary.down}
//                             </Text>
//                           </View>
//                         </View>
//                       );
//                     })()
//                   ) : (
//                     <Text style={styles.noVotesText}>
//                       Pas encore de votes. Votez pour monter dans le classement
//                     </Text>
//                   )
//                 ) : (
//                   <Text style={styles.loadingText}>
//                     Chargement des votes...
//                   </Text>
//                 )}
//               </View>
//             </TouchableOpacity>

//             {/* MODAL DES VOTES */}
//             <Modal
//               animationType="fade"
//               transparent={true}
//               visible={modalLikeVisible}
//               onRequestClose={() => setModalLikeVisible(false)}
//             >
//               <View style={styles.modalOverlayLike}>
//                 <View style={styles.modalContentLike}>
//                   {/* Icone informative */}
//                   <Ionicons
//                     name="information-circle-outline"
//                     size={60}
//                     color="#418074"
//                     style={styles.icon}
//                   />

//                   {/* Titre principal */}
//                   <Text style={styles.titleModalLike}>
//                     Montez dans le classement !
//                   </Text>

//                   {/* Description */}
//                   <Text style={styles.description}>
//                     Pour monter dans le classement, il vous suffit de :
//                   </Text>

//                   {/* Instructions */}
//                   <View style={styles.instructions}>
//                     <View style={styles.instructionItem}>
//                       <Ionicons name="eye-outline" size={24} color="#555" />
//                       <Text style={styles.instructionText}>
//                         Constatez le maximum de signalements possibles.
//                       </Text>
//                     </View>
//                     <View style={styles.instructionItem}>
//                       <Ionicons
//                         name="thumbs-up-outline"
//                         size={24}
//                         color="#418074"
//                       />
//                       <Text style={styles.instructionText}>
//                         Votez "Oui" si le signalement est encore d'actualité.
//                       </Text>
//                     </View>
//                     <View style={styles.instructionItem}>
//                       <Ionicons
//                         name="thumbs-down-outline"
//                         size={24}
//                         color="#A73830"
//                       />
//                       <Text style={styles.instructionText}>
//                         Votez "Non" si le signalement n'est plus valide.
//                       </Text>
//                     </View>
//                   </View>

//                   {/* Bouton pour fermer */}
//                   <TouchableOpacity
//                     style={styles.closeButtonModalLike}
//                     onPress={() => setModalLikeVisible(false)}
//                   >
//                     <Text style={styles.closeButtonTextModalLike}>
//                       OK, j'ai compris
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </Modal>
//           </View>
//         </View>

//         <View style={styles.statistics}>
//           {/** BOUTTON RELATION */}
//           <TouchableOpacity
//             style={styles.statItem}
//             onPress={toggleFollowersList}
//           >
//             <Text style={styles.statNumber}>
//               {user?.followers?.length || 0}
//             </Text>
//             <Text style={styles.statLabel}>Relations</Text>
//           </TouchableOpacity>

//           <View style={styles.separator} />

//           {/** BOUTTON RANKING */}
//           <TouchableOpacity
//             style={styles.statItem}
//             onPress={() => navigation.navigate("RankingScreen")}
//           >
//             <Text style={styles.statNumber}>
//               {ranking && totalUsers
//                 ? `${ranking}${getRankingSuffix(ranking)}`
//                 : "?"}
//             </Text>
//             {ranking && totalUsers && (
//               <Text style={styles.statLabel}>
//                 du classement sur {totalUsers}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>

//       <TouchableOpacity
//         style={styles.globalToggleButton}
//         onPress={toggleAllSections}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.globalToggleButtonText}>
//           {areAllSectionsVisible ? "Fermer toutes les sections" : "Ouvrir tout"}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[
//           styles.sectionHeader,
//           isSectionVisible && styles.sectionHeaderVisible,
//         ]}
//         onPress={toggleSection}
//         activeOpacity={0.8}
//       >
//         <Text
//           style={[
//             styles.sectionTitleTop10,
//             // Applique le fond gris si isStatsVisible est true
//           ]}
//         >
//           🏆 Top 10 des Smarter
//         </Text>
//         <Text style={styles.arrow}>{isSectionVisible ? "▲" : "▼"}</Text>
//       </TouchableOpacity>

//       {/* Contenu de la section */}
//       {isSectionVisible && (
//         <View style={styles.sectionContent}>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             {smarterData.slice(0, 10).map((item, index) => {
//               const borderColor =
//                 index + 1 === 1
//                   ? "#FFD700"
//                   : index + 1 === 2
//                   ? "#C0C0C0"
//                   : index + 1 === 3
//                   ? "#CD7F32"
//                   : "#fff";

//               const medal =
//                 index + 1 === 1
//                   ? "🥇"
//                   : index + 1 === 2
//                   ? "🥈"
//                   : index + 1 === 3
//                   ? "🥉"
//                   : null;

//               return (
//                 <TouchableOpacity
//                   key={item.id}
//                   style={styles.smarterItem}
//                   onPress={() =>
//                     navigation.navigate("UserProfileScreen", {
//                       userId: item.id,
//                     })
//                   }
//                 >
//                   <View style={{ position: "relative" }}>
//                     {medal && <Text style={styles.medal}>{medal}</Text>}
//                     <Image
//                       source={{ uri: item.image.uri || "default-image-url" }}
//                       style={[
//                         styles.smarterImage,
//                         { borderColor: borderColor },
//                       ]}
//                     />
//                   </View>
//                   <Text style={styles.rankingName}>
//                     {item.displayName || "Nom indisponible"}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}

//             {/* Bouton Voir Tout */}
//             <TouchableOpacity
//               key="seeAll"
//               style={styles.seeAllButton}
//               onPress={() => navigation.navigate("RankingScreen")}
//             >
//               {/* Barre horizontale */}
//               <View style={[styles.bar, styles.horizontalBar]} />
//               {/* Barre verticale */}
//               <View style={[styles.bar, styles.verticalBar]} />
//               {/* Texte "VOIR TOUT" */}
//               <Text style={styles.seeAllText}>VOIR TOUT</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>
//       )}

//       <TouchableOpacity
//         style={[
//           styles.sectionHeader,
//           isReportsVisible && styles.sectionHeaderVisible,
//         ]}
//         onPress={toggleReports}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.sectionTitle}>🚨 Signalements à proximité</Text>
//         <Text style={styles.arrow}>{isReportsVisible ? "▲" : "▼"}</Text>
//       </TouchableOpacity>

//       {/* Contenu de la section */}
//       {isReportsVisible && (
//         <>
//           <View style={styles.sectionContent}>
//             {reports.length === 0 ? (
//               <View style={styles.emptyStateContainer}>
//                 <Text style={styles.noReportsText}>
//                   Aucun signalement pour l'instant.
//                 </Text>
//               </View>
//             ) : (
//               <ScrollView
//                 contentContainerStyle={styles.timelineContainer}
//                 horizontal={true}
//                 showsHorizontalScrollIndicator={false}
//               >
//                 {reports.map((report, index) => (
//                   <View key={report.id} style={styles.timelinePointContainer}>
//                     {/* Étiquette au-dessus de la timeline */}
//                     <View
//                       style={[
//                         styles.timelineLabel,
//                         {
//                           backgroundColor: typeColors[report.type] || "#F5F5F5",
//                         },
//                       ]}
//                     >
//                       <Text style={styles.labelText}>
//                         {getTypeLabel(report.type)} à{" "}
//                         {report.distance ? report.distance.toFixed(2) : "N/A"}{" "}
//                         km
//                       </Text>
//                     </View>

//                     {/* Bloc signalement */}
//                     <TouchableOpacity
//                       style={[
//                         styles.timelineBlock,
//                         {
//                           backgroundColor: hexToRgba(
//                             typeColors[report.type] || "#F5F5F5",
//                             calculateOpacity(report.createdAt, 0.2)
//                           ),
//                         },
//                       ]}
//                       onPress={() => handlePressReport(report.id)}
//                       activeOpacity={0.9}
//                     >
//                       <Text numberOfLines={1} style={styles.reportTitle}>
//                         {report.title}
//                       </Text>

//                       {/* Photos */}
//                       <View style={styles.photoContainer}>
//                         {report.photos && report.photos.length > 0 ? (
//                           report.photos.length === 1 ? (
//                             <Image
//                               key={report.photos[0].id}
//                               source={{ uri: report.photos[0].url }}
//                               style={styles.singlePhoto}
//                               resizeMode="cover"
//                             />
//                           ) : (
//                             report.photos
//                               .slice(0, 2)
//                               .map((photo) => (
//                                 <Image
//                                   key={photo.id}
//                                   source={{ uri: photo.url }}
//                                   style={styles.multiPhoto}
//                                   resizeMode="cover"
//                                 />
//                               ))
//                           )
//                         ) : (
//                           <View style={styles.noPhotoContainer}>
//                             <Text style={styles.noPhotoText}>
//                               Aucune photo disponible
//                             </Text>
//                           </View>
//                         )}
//                       </View>

//                       <Text style={styles.reportDetails}>
//                         {formatCity(report.city)}
//                       </Text>
//                       <View style={styles.voteSummaryReport}>
//                         <View style={styles.voteButtonsContainer}>
//                           {/* Affichage des votes positifs */}
//                           <View style={styles.voteButtonReport}>
//                             <Ionicons
//                               name="thumbs-up-outline"
//                               size={16}
//                               color="#418074"
//                             />
//                             <Text style={styles.voteCountReports}>
//                               {report.upVotes || 0}{" "}
//                               {/* Affiche 0 si upVotes est indéfini */}
//                             </Text>
//                           </View>
//                           {/* Affichage des votes négatifs */}
//                           <View style={styles.voteButtonReport}>
//                             <Ionicons
//                               name="thumbs-down-outline"
//                               size={16}
//                               color="#A73830"
//                             />
//                             <Text style={styles.voteCountReports}>
//                               {report.downVotes || 0}{" "}
//                               {/* Affiche 0 si downVotes est indéfini */}
//                             </Text>
//                           </View>
//                         </View>
//                         {/* Affichage de la date */}
//                         <Text style={styles.reportTime}>
//                           {formatTime(report.createdAt)}
//                         </Text>
//                       </View>
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//               </ScrollView>
//             )}
//           </View>
//         </>
//       )}

//       <TouchableOpacity
//         style={[
//           styles.sectionHeader,
//           isEventsVisible && styles.sectionHeaderVisible,
//         ]}
//         onPress={toggleEvents}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.sectionTitle}>🎉 Événements à venir</Text>
//         <Text style={styles.arrow}>{isEventsVisible ? "▲" : "▼"}</Text>
//       </TouchableOpacity>

//       {/* Contenu de la section */}
//       {isEventsVisible && (
//         <>
//           <View style={styles.sectionContent}>
//             {loading ? (
//               <ActivityIndicator size="large" color="#3498db" />
//             ) : error ? (
//               <Text style={styles.errorText}>{error}</Text>
//             ) : featuredEvents.length > 0 ? (
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 style={{ marginBottom: 5, marginLeft: 5 }}
//               >
//                 {featuredEvents.map((item) => (
//                   <TouchableOpacity
//                     key={item.id}
//                     style={styles.featuredItem}
//                     onPress={() => {
//                       console.log(
//                         "Navigating to EventDetailsScreen with ID:",
//                         item.id
//                       );
//                       navigation.navigate("EventDetailsScreen", {
//                         eventId: item.id,
//                       });
//                     }}
//                   >
//                     <Image
//                       source={{ uri: item.image }}
//                       style={styles.featuredImage}
//                     />
//                     <Text style={styles.featuredTitle}>{item.title}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             ) : (
//               <View style={styles.noEventsContainer}>
//                 <Text style={styles.noEventsText}>
//                   Pas d’événement prévu pour le moment dans votre ville.
//                 </Text>
//               </View>
//             )}
//           </View>
//         </>
//       )}

//       {/* Section Statistiques du Mois */}
//       <Chart
//         data={data}
//         loading={loading}
//         nomCommune={nomCommune}
//         controlStatsVisibility={areAllSectionsVisible}
//       />

//       <TouchableOpacity
//         style={[
//           styles.sectionHeader,
//           isCalendarVisible && styles.sectionHeaderVisible,
//         ]}
//         onPress={toggleCalendar}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.sectionTitle}>📅 Tous les événements</Text>
//         <Text style={styles.arrow}>{isCalendarVisible ? "▲" : "▼"}</Text>
//       </TouchableOpacity>

//       {/* Affichage conditionnel du calendrier et des événements */}
//       {isCalendarVisible && (
//         <>
//           <View style={styles.sectionContent}>
//             {/* Calendrier */}
//             <View style={styles.calendarContainer}>
//               <CalendarPicker
//                 onDateChange={(date) => {
//                   const formattedDate = date.toISOString().split("T")[0];
//                   console.log("Date sélectionnée :", formattedDate);
//                   fetchEventsByDate(formattedDate);
//                 }}
//                 previousTitle="<"
//                 nextTitle=">"
//                 weekdays={["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]}
//                 months={[
//                   "Janvier",
//                   "Février",
//                   "Mars",
//                   "Avril",
//                   "Mai",
//                   "Juin",
//                   "Juillet",
//                   "Août",
//                   "Septembre",
//                   "Octobre",
//                   "Novembre",
//                   "Décembre",
//                 ]}
//                 startFromMonday={true}
//                 textStyle={{
//                   fontSize: 16,
//                 }}
//                 width={330}
//                 selectedDayColor="#11998e"
//                 selectedDayTextColor="#FFFFFF"
//               />
//             </View>

//             {/* Liste des événements */}
//             {events.length > 0 ? (
//               events.map((event) => (
//                 <TouchableOpacity
//                   key={event.id}
//                   style={styles.eventItem}
//                   onPress={() =>
//                     navigation.navigate("EventDetailsScreen", {
//                       eventId: event.id,
//                     })
//                   }
//                 >
//                   <Text style={styles.eventTitle}>{event.title}</Text>
//                   <Text style={styles.eventDetails}>
//                     {new Date(event.date).toLocaleDateString("fr-FR")}
//                   </Text>
//                   <Text style={styles.eventLocation}>📍 {event.location}</Text>
//                 </TouchableOpacity>
//               ))
//             ) : (
//               <View style={styles.noEventsContainer}>
//                 <Text style={styles.noEventsText}>
//                   Aucun événement prévu pour cette date.
//                 </Text>
//               </View>
//             )}
//           </View>
//         </>
//       )}

//       <TouchableOpacity
//         style={[
//           styles.sectionHeader,
//           isCategoryReportsVisible && styles.sectionHeaderVisible,
//         ]}
//         onPress={toggleCategoryReports}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.sectionTitle}>🗂️ Tous les signalements</Text>
//         <Text style={styles.arrow}>{isCategoryReportsVisible ? "▲" : "▼"}</Text>
//       </TouchableOpacity>

//       {/* Affichage conditionnel du contenu */}
//       {isCategoryReportsVisible && (
//         <View style={styles.sectionContent}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={{ marginBottom: 25 }}
//           >
//             {categories.map((category) => (
//               <TouchableOpacity
//                 key={category.name}
//                 onPress={() => handleCategoryClick(category.name)}
//                 style={[
//                   styles.categoryButton,
//                   {
//                     backgroundColor: hexToRgba(category.color, 0.5),
//                   },
//                 ]}
//               >
//                 <Ionicons
//                   name={category.icon as keyof typeof Ionicons.glyphMap}
//                   size={40}
//                   color="#fff"
//                   style={styles.categoryIcon}
//                 />
//                 <Text style={styles.categoryText}>{category.label}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       )}

//       <TouchableOpacity
//         style={[
//           styles.sectionHeader,
//           isMayorInfoVisible && styles.sectionHeaderVisible,
//         ]}
//         onPress={toggleMayorInfo}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.sectionTitle}>🏛️ Informations mairie</Text>
//         <Text style={styles.arrow}>{isMayorInfoVisible ? "▲" : "▼"}</Text>
//       </TouchableOpacity>

//       {/* Affichage conditionnel du contenu */}
//       {isMayorInfoVisible && (
//         <>
//           <View style={styles.sectionContent}>
//             {/* Informations mairie */}
//             <View style={styles.infoCard}>
//               <Text style={styles.infoTitle}>Attention : Travaux ! </Text>
//               <Text style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Date :</Text> 15 septembre 2024
//                 {"\n"}
//                 <Text style={styles.infoLabel}>Lieu :</Text> Avenue de la
//                 Liberté {"\n"}
//                 <Text style={styles.infoLabel}>Détail :</Text> Des travaux de
//                 réfection de la chaussée auront lieu du 25 au 30 septembre. La
//                 circulation sera déviée. Veuillez suivre les panneaux de
//                 signalisation.
//               </Text>

//               <Text style={styles.infoTitle}>
//                 Résolution de vos signalements
//               </Text>
//               <Text style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Date :</Text> 20 septembre 2024
//                 {"\n"}
//                 <Text style={styles.infoLabel}>Lieu :</Text> Rue des Fleurs
//                 {"\n"}
//                 <Text style={styles.infoLabel}>Détail :</Text> La fuite d'eau
//                 signalée a été réparée. Merci de votre patience.
//               </Text>

//               <Text style={styles.infoTitle}>Alertes Importantes</Text>
//               <Text style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Date :</Text> 18 septembre 2024
//                 {"\n"}
//                 <Text style={styles.infoLabel}>Détail :</Text> En raison des
//                 fortes pluies prévues cette semaine, nous vous recommandons de
//                 limiter vos déplacements et de vérifier les alertes météo
//                 régulièrement.
//               </Text>
//             </View>

//             {/* Carte du maire */}
//             <View style={styles.mayorCard}>
//               <Image
//                 source={require("../assets/images/mayor.png")}
//                 style={styles.profileImageMayor}
//               />
//               <View style={styles.mayorContainer}>
//                 <Text style={styles.mayorInfo}>Maire actuel:</Text>
//                 <Text style={styles.mayorName}>Pierre BÉHARELLE</Text>
//                 <Text style={styles.mayorSubtitle}>
//                   Permanence en Mairie sur rendez-vous au :
//                 </Text>
//                 <TouchableOpacity onPress={handlePressPhoneNumber}>
//                   <Text style={styles.contactBold}>03 20 44 02 51</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Carte des bureaux */}
//             <View style={styles.officeCard}>
//               <Image
//                 source={require("../assets/images/mairie.png")}
//                 style={styles.officeImage}
//               />
//               <View style={styles.officeInfo}>
//                 <View style={styles.officeAddress}>
//                   <Text style={styles.Address}>Contactez-nous :{"\n"}</Text>
//                   <Text>11 rue Sadi Carnot, {"\n"}59320 Haubourdin</Text>
//                 </View>
//                 <Text style={styles.officeContact}>
//                   <Text style={styles.phone}>Téléphone :</Text>
//                   {"\n"}
//                   <TouchableOpacity onPress={handlePressPhoneNumber}>
//                     <Text style={styles.officeContact}>03 20 44 02 90</Text>
//                   </TouchableOpacity>
//                   {"\n"}
//                   <Text style={styles.hours}>Du lundi au vendredi :</Text>
//                   {"\n"}
//                   08:30 - 12:00, 13:30 - 17:00
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </>
//       )}
//       <Text style={styles.footerCopyrightText}>
//         © 2025 SmartCities. Tous droits réservés.
//       </Text>
//     </ScrollView>
//   );
// }