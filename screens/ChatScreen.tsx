import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    orderBy, 
    serverTimestamp, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc 
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";

type Message = {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    timestamp: any;
    isRead: boolean;
};

const ChatScreen = ({ route, navigation }: any) => {
    const { receiverId, senderId } = route.params;
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    // Variable d'état pour suivre l'ID du dernier message envoyé
    const [lastSentMessage, setLastSentMessage] = useState<Message | null>(null);

    useEffect(() => {
        const messagesRef = collection(db, "messages");
        const q = query(
            messagesRef,
            where("senderId", "in", [senderId, receiverId]),
            where("receiverId", "in", [receiverId, senderId]),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];

            setMessages(fetchedMessages);

            // Identifier et mettre à jour le dernier message envoyé
            const lastMessageSent = fetchedMessages
                .filter((msg) => msg.senderId === senderId)
                .slice(-1)[0];

            if (lastMessageSent) {
                setLastSentMessage(lastMessageSent);
            }

            // Marquer les messages non lus comme "lus" pour le destinataire
            const unreadMessages = snapshot.docs.filter(
                (doc) => doc.data().receiverId === senderId && !doc.data().isRead
            );

            unreadMessages.forEach((doc) => {
                updateDoc(doc.ref, { isRead: true });
            });
        });

        return () => unsubscribe();
    }, [receiverId, senderId]);

    const sendMessage = async () => {
        if (newMessage.trim().length === 0) return;

        const messagesRef = collection(db, "messages");
        const conversationsRef = collection(db, "conversations");

        const conversationId = [senderId, receiverId].sort().join("_");

        try {
            // Ajouter le message à la collection "messages"
            const docRef = await addDoc(messagesRef, {
                senderId,
                receiverId,
                message: newMessage.trim(),
                timestamp: serverTimestamp(),
                isRead: false,
            });

            // Mettre à jour le dernier message envoyé
            setLastSentMessage({
                id: docRef.id,
                senderId,
                receiverId,
                message: newMessage.trim(),
                timestamp: serverTimestamp(),
                isRead: false,
            });

            // Vérifier si une conversation existe déjà
            const conversationDocRef = doc(conversationsRef, conversationId);
            const conversationDoc = await getDoc(conversationDocRef);

            if (!conversationDoc.exists()) {
                // Créer une nouvelle conversation si elle n'existe pas
                await setDoc(conversationDocRef, {
                    conversationId,
                    participants: [senderId, receiverId],
                    lastMessage: newMessage.trim(),
                    lastMessageTimestamp: serverTimestamp(),
                });
            } else {
                // Mettre à jour la conversation existante
                await setDoc(
                    conversationDocRef,
                    {
                        lastMessage: newMessage.trim(),
                        lastMessageTimestamp: serverTimestamp(),
                    },
                    { merge: true }
                );
            }

            setNewMessage(""); // Réinitialiser le champ de saisie
        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={28} color="#BEE5BF" style={{ marginLeft: 10 }} />
                </TouchableOpacity>

                <View style={styles.typeBadge}>
                    <Text style={styles.headerTitle}>CHAT</Text>
                </View>

                <TouchableOpacity onPress={() => Alert.alert("Signaler")}>
                    <Icon name="warning" size={28} color="#BEE5BF" style={{ marginRight: 10, marginTop:2 }} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
            style={{ padding: 10 }}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.messageBubble,
                            item.senderId === senderId ? styles.sentMessage : styles.receivedMessage,
                        ]}
                    >
                        <Text style={styles.messageText}>{item.message}</Text>
                        {lastSentMessage && item.id === lastSentMessage.id && (
                            <Text style={styles.messageStatus}>
                                {lastSentMessage.isRead ? "Lu" : "En attente de lecture"}
                            </Text>
                        )}
                    </View>
                )}
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Tapez un message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Envoyer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
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
    messageBubble: { padding: 10, borderRadius: 10, marginVertical: 5 },
    sentMessage: { backgroundColor: "#e1ffc7", alignSelf: "flex-end" },
    receivedMessage: { backgroundColor: "#f1f1f1", alignSelf: "flex-start" },
    messageText: { fontSize: 19 },
    messageStatus: { fontSize: 12, color: "#666", marginTop: 5 },
    inputContainer: { flexDirection: "row", alignItems: "center", padding: 10, marginBottom: 10 },
    input: { flex: 1, borderColor: "#ccc", borderWidth: 1, borderRadius: 30, padding: 10 },
    sendButton: { backgroundColor: "#4BAB57", padding: 10, borderRadius: 30, marginLeft: 10 },
    sendButtonText: { color: "#fff", fontWeight: "bold" },
});

export default ChatScreen;