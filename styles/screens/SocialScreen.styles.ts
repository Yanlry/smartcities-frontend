import { StyleSheet, Dimensions } from "react-native";
const { width: screenWidth } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F5F7FA",
    },
    headerContainer: {
      paddingTop: 100, // Space for header
      paddingBottom: 8,
    },
    feedContainer: {
      paddingBottom: 80, // Space for bottom navigation
    },
    // Create Post Card
    createPostContainer: {
      marginTop: 10,
      padding: 16,
      backgroundColor: "#ffffff",
      marginHorizontal: 16,
      marginBottom: 10,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    createPostInput: {
      width: "100%",
      backgroundColor: "#F5F7FA",
      borderRadius: 24,
      padding: 16,
      fontSize: 15,
      color: "#333",
      marginBottom: 16,
      minHeight: 48,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
    },
    selectedImagesContainer: {
      marginTop: 8,
      marginBottom: 16,
    },
    selectedImagesScroll: {
      paddingRight: 16,
    },
    selectedImageWrapper: {
      position: "relative",
      marginRight: 12,
    },
    selectedImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    removeImageButton: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 12,
      padding: 0,
    },
    mediaButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
    },
    mediaButtonText: {
      marginLeft: 8,
      fontSize: 14,
      color: "#1976D2",
    },
    postButton: {
      backgroundColor: "#1976D2",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      minWidth: 80,
      alignItems: "center",
    },
    postButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 14,
    },
  
    // Filter Section
    filterContainer: {
      paddingHorizontal: 16,
      marginBottom: 2,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    filterText: {
      fontSize: 13,
      color: "#656765",
      marginHorizontal: 8,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    blurView: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "80%",
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    filterOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#F0F2F5",
    },
    activeFilter: {
      backgroundColor: "#1976D2",
    },
    filterOptionText: {
      fontSize: 16,
      color: "#333",
    },
    activeFilterText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
  
    // Post Item
    postContainer: {
      backgroundColor: "#FFFFFF",
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    postHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontWeight: "600",
      fontSize: 15,
      color: "#333",
    },
    timestamp: {
      fontSize: 12,
      color: "#666",
      marginTop: 2,
    },
    deleteIcon: {
      padding: 10,
    },
    postContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    postText: {
      fontSize: 15,
      lineHeight: 22,
      color: "#333",
    },
    readMoreButton: {
      marginTop: 4,
    },
    readMoreText: {
      color: "#1976D2",
      fontWeight: "500",
      fontSize: 14,
    },
    carouselContainer: {
      width: "100%",
    },
    carouselContent: {
      // No specific style needed
    },
    photoTouchable: {
      width: Dimensions.get("window").width - 32, // Account for margins
    },
    photoCarouselItem: {
      width: Dimensions.get("window").width - 32,
      height: (Dimensions.get("window").width - 32) * 0.75, // 4:3 aspect ratio
      borderRadius: 8,
  paddingHorizontal: 16,
    },
    indicatorsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 10,
      marginBottom: 8,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#E0E0E0",
      marginHorizontal: 4,
    },
    activeIndicator: {
      backgroundColor: "#1976D2",
      width: 16,
    },
    postActions: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: "#F0F2F5",
      paddingVertical: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: 8,
    },
    actionButtonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionIcon: {
      marginRight: 6,
    },
    actionText: {
      fontSize: 14,
      color: "#656765",
    },
    likedText: {
      color: "#E53935",
    },
    activeCommentText: {
      color: "#1976D2",
    },
  
    // Comments Section
    addCommentContainer: {
      padding: 16,
      width: "100%",
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: "#F0F2F5",
    },
    commentRow: {
      alignItems: "flex-start",
    },
    userAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    inputWrapper: {
      width: "73%",
      flexDirection: "row",
      backgroundColor: "#F0F2F5",
      borderRadius: 20,
    },
    addCommentInput: {
      width: "100%",
      paddingVertical: 10,
      backgroundColor: "#F0F2F5",
      borderRadius: 20,
      fontSize: 14,
      color: "#333",
      minHeight: 40,
    },
    addCommentButton: {
    marginLeft: 8,
      backgroundColor: "#1877F2", // Facebook blue when active
      borderRadius: 50,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    disabledButton: {
      backgroundColor: "#D8DADF", // Light gray when disabled
    },
    commentsSection: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      borderTopWidth: 1,
      borderTopColor: "#F0F2F5",
    },
    commentWrapper: {
      marginTop: 12,
    },
    commentBloc: {
      flexDirection: "row",
    },
    commentContainer: {
      flex: 1,
      backgroundColor: "#F5F7FA",
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginLeft: 8,
    },
    commentHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    commentUserName: {
      fontWeight: "600",
      fontSize: 14,
      color: "#333",
    },
    commentTimestamp: {
      fontSize: 10,
      color: "#888",
    },
    commentText: {
      paddingVertical: 5,
      fontSize: 14,
      lineHeight: 20,
      color: "#333",
    },
    commentActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    commentAction: {
      flexDirection: "row",
      alignItems: "center",
    },
    commentActionText: {
      fontSize: 12,
      color: "#656765",
      marginLeft: 4,
    },
    replyActionText: {
      fontSize: 12,
      color: "#656765",
      fontWeight: "500",
    },
    deleteCommentIcon: {
      alignSelf: "flex-start",
  
    },
  
    // Reply Section
    replyInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginLeft: 40,
    },
    replyAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 8,
    },
    replyInput: {
      flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: "#F5F7FA",
      borderRadius: 16,
      fontSize: 13,
      color: "#333",
      marginRight: 8,
    },
    replyButton: {
      backgroundColor: "#1976D2",
      borderRadius: 16,
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    showRepliesButton: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 40,
      marginTop: 8,
      paddingVertical: 4,
    },
    showRepliesText: {
      fontSize: 12,
      color: "#1976D2",
      fontWeight: "500",
      marginLeft: 4,
    },
    repliesSection: {
      marginLeft: 20,
      marginTop: 8,
    },
    replyWrapper: {
      flexDirection: "row",
      marginTop: 8,
      marginBottom: 4,
    },
    replyContent: {
      flex: 1,
      backgroundColor: "#F0F8FF",
      borderRadius: 16,
      padding: 10,
      marginLeft: 8,
    },
    replyHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    replyUserName: {
      fontWeight: "600",
      fontSize: 13,
      color: "#333",
    },
    replyTimestamp: {
      fontSize: 10,
      color: "#888",
    },
    replyText: {
      fontSize: 13,
      lineHeight: 18,
      color: "#333",
    },
    deleteReplyIcon: {
      position: "absolute",
      top: 8,
      right: 8,
    },
  
    // Modals and Overlays
    modalBackground: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    fullscreenPhoto: {
      width: "90%",
      height: "70%",
    },
    closeButton: {
      position: "absolute",
      top: 40,
      right: 20,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 20,
      padding: 8,
      zIndex: 10,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255,255,255,0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 100,
    },
  });