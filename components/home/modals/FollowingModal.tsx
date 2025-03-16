import React, { memo, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Modal, 
  StyleSheet,
  TextInput
} from 'react-native';
import { UserFollowing } from '../ProfileSection/user.types';
import { Ionicons } from "@expo/vector-icons";

interface FollowingModalProps {
  visible: boolean;
  onClose: () => void;
  following: UserFollowing[];
  onUserPress: (id: string) => void;
  onOptionChange?: (option: 'fullName' | 'username') => void; // Pour compatibilité
}

const FollowingModal: React.FC<FollowingModalProps> = memo(({
  visible,
  onClose,
  following,
  onUserPress
}) => {
  // État pour la recherche
  const [searchText, setSearchText] = useState('');
  
  // Filtre selon le texte de recherche (chercher dans le nom complet ou le username)
  const filteredFollowing = following.filter(user => {
    const nameToSearch = user.useFullName && user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || "";
    return !searchText.trim() || nameToSearch.toLowerCase().includes(searchText.toLowerCase());
  });

  // Gestion du clic sur un utilisateur avec fermeture automatique
  const handleUserPress = useCallback((id: string) => {
    onClose(); // Ferme d'abord le modal
    setTimeout(() => {
      onUserPress(id); // Puis navigue vers le profil
    }, 300);
  }, [onClose, onUserPress]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Mes abonnements</Text>
          
          {/* Barre de recherche */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un abonnement..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
          </View>
          
          {/* Liste des abonnements */}
          {following && following.length > 0 ? (
            <FlatList
              data={filteredFollowing}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => handleUserPress(item.id)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: item.profilePhoto || "https://via.placeholder.com/50" }}
                    style={styles.userImage}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {item.useFullName && item.firstName && item.lastName
                        ? `${item.firstName} ${item.lastName}`
                        : item.username || "Utilisateur"}
                    </Text>
                    <Text style={styles.userStatus}>Abonné</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#CCC"
                    style={styles.navigationIcon}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                searchText ? (
                  <View style={styles.emptyResultContainer}>
                    <Text style={styles.emptyResultText}>
                      Aucun résultat pour "{searchText}"
                    </Text>
                  </View>
                ) : null
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Vous n'êtes abonné(e) à personne pour le moment
              </Text>
            </View>
          )}
          
          {/* Bouton de fermeture */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#062C41',
  },
  searchContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 46,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  userStatus: {
    fontSize: 13,
    color: '#8E8E8E',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  navigationIcon: {
    marginLeft: 10,
    opacity: 0.7,
  },
  emptyResultContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyResultText: {
    fontSize: 15,
    color: '#8E8E8E',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#062C41',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FollowingModal;
