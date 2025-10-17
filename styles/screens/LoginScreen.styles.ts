import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

const BORDER_RADIUS = 24;
const NEON_PRIMARY = '#FF3A8D';
const NEON_SECONDARY = '#00DFFF';
const NEON_TERTIARY = '#00FFB3';
const ACCENT_COLOR = '#1a759f';


export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B5D85',
      },
      background: {
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      },
      backgroundImage: {
        opacity: 0.7,
      },
      overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
      },
      backgroundEffects: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
      },
      bgCircle1: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        top: -width * 0.5,
        left: -width * 0.25,
        overflow: 'hidden',
        shadowColor: NEON_SECONDARY,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 25,
        elevation: 15,
      },
      bgCircle2: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        bottom: -width * 0.3,
        right: -width * 0.2,
        overflow: 'hidden',
        shadowColor: NEON_PRIMARY,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 25,
        elevation: 15,
      },
      bgGradient: {
        width: '100%',
        height: '100%',
      },
      headerContainer: {
        alignItems: 'center',
        width: '100%',
      },
      logoContainer: {
        marginBottom: 15,
        borderRadius: 20,
        overflow: 'hidden',
      },
      logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
      },
      appName: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      appTagline: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.9)",
        textAlign: "center",
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      headerLogo: {
        width: 230, // ajuste selon la taille du header
        height: 180,
      },
      mainContainer: {
        width: '90%',
        maxWidth: 400,
        alignSelf: 'center',
        borderRadius: BORDER_RADIUS,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      },
      blurContainer: {
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS,
        padding: 30,
      },
      gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: BORDER_RADIUS,
      },
      welcomeTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 8,
        textAlign: "center",
      },
      welcomeSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        marginBottom: 30,
        textAlign: "center",
      },
      inputGroup: {
        marginBottom: 16,
      },
      inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
      inputContainerError: {
        borderColor: "#e11d48",
        backgroundColor: "rgba(225, 29, 72, 0.1)",
      },
      inputIcon: {
        marginRight: 12,
      },
      input: {
        flex: 1,
        height: 56,
        color: "#fff",
        fontSize: 16,
      },
      errorText: {
        color: "#e11d48",
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4,
        marginLeft: 12,
      },
      visibilityIcon: {
        padding: 8,
      },
      forgotPasswordButton: {
        alignSelf: "flex-end",
        marginBottom: 20,
      },
      forgotPasswordText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
      },
      loginButtonContainer: {
        width: "100%",
        height: 56,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
        shadowColor: "#1a759f",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
      },
      loginButton: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      },
      loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 1,
      },
      buttonClicked: {
        opacity: 0.9,
      },
      separator: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
      },
      separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
      },
      separatorText: {
        color: "rgba(255, 255, 255, 0.7)",
        paddingHorizontal: 10,
        fontSize: 14,
      },
      socialButtonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
      },
      socialButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ea4335",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
      socialButtonTwitter: {
        backgroundColor: "#1da1f2",
      },
      socialButtonFacebook: {
        backgroundColor: "#1877f2",
      },
      registerButton: {
        marginTop: 10,
      },
      registerText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        textAlign: "center",
      },
      registerTextBold: {
        fontWeight: "bold",
        color: "#fff",
      },
      
      // Styles du bouton de fermeture du clavier
      keyboardCloseButton: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 1000,
      },
      keyboardCloseButtonTouchable: {
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
      },
      keyboardCloseButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
      },
      keyboardCloseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
      },
      
      // Modal styles
      modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
      },
      modalContainer: {
        width: "90%",
        maxWidth: 400,
        backgroundColor: "#fff",
        borderRadius: BORDER_RADIUS,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      },
      modalHeader: {
        padding: 20,
        borderTopLeftRadius: BORDER_RADIUS,
        borderTopRightRadius: BORDER_RADIUS,
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 4,
      },
      modalSubtitle: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
      },
      modalBody: {
        padding: 20,
        backgroundColor: "#fff",
      },
      modalText: {
        fontSize: 16,
        color: "#333",
        marginBottom: 20,
      },
      inputModalWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f7fa",
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: "#e0e7ff",
      },
      inputModal: {
        flex: 1,
        height: 56,
        color: "#333",
        fontSize: 16,
      },
      modalButtonsContainer: {
        marginTop: 10,
      },
      modalButtonSubmit: {
        marginBottom: 10,
        borderRadius: 12,
        overflow: "hidden",
        height: 56,
      },
      modalButtonDisabled: {
        opacity: 0.5,
      },
      gradientButton: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      },
      gradientButtonDisabled: {
        opacity: 0.5,
      },
      modalButtonTextSubmit: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
      },
      modalCloseButton: {
        borderRadius: 12,
        overflow: "hidden",
        height: 56,
      },
      modalCloseButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
      },
    });
    
    