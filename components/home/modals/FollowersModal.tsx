// src/components/home/modals/FollowersModal.tsx
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
import { Ionicons } from "@expo/vector-icons";
import { UserFollower } from '../ProfileSection/user.types';

interface FollowersModalProps {
  visible: boolean;
  onClose: () => void;
  followers: UserFollower[];
  onUserPress: (id: string) => void;
}

/**
 * Modal affichant la liste des abonnés avec navigation optimisée vers les profils
 */
const FollowersModal: React.FC<FollowersModalProps> = memo(({
  visible,
  onClose,
  followers,
  onUserPress
}) => {
  const [searchText, setSearchText] = useState('');
  
  // Filtrage optimisé avec support multi-champs
  const filteredFollowers = followers.filter(user => {
    if (!searchText.trim()) return true;
    
    const searchLower = searchText.toLowerCase();
    const displayName = user.useFullName && user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || "";
      
    return displayName.toLowerCase().includes(searchLower);
  });

  // Gestion unifiée de la navigation avec fermeture priorisée
  const handleUserPress = useCallback((id: string) => {
    onClose();
    setTimeout(() => onUserPress(id), 300);
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
          {/* Header du modal avec titre */}
          <Text style={styles.modalTitle}>Mes abonnés</Text>
          
          {/* Contenu principal avec layout flex */}
          <View style={styles.contentContainer}>
            {/* Barre de recherche optimisée */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un abonné..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
              />
            </View>
            
            {/* Liste d'abonnés avec scroll intégré */}
            <View style={styles.listContainer}>
              {followers && followers.length > 0 ? (
                <FlatList
                  data={filteredFollowers}
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
                        <Text style={styles.userStatus}>Vous suit</Text>
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
                    Vous n'avez pas encore d'abonnés
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Footer avec bouton fermer fixé en bas */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
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
    // Structure flex pour organiser header, contenu et footer
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#062C41',
  },
  // Conteneur principal pour le contenu avec flex
  contentContainer: {
    flex: 1,
    marginBottom: 15,
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
  // Conteneur pour la liste avec flex
  listContainer: {
    flex: 1,
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
  navigationIcon: {
    marginLeft: 10,
    opacity: 0.7,
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
  emptyResultContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyResultText: {
    fontSize: 15,
    color: '#8E8E8E',
    textAlign: 'center',
  },
  // Conteneur dédié pour le footer avec le bouton
  footerContainer: {
    width: '100%',
    marginTop: 'auto', // Pousse le footer vers le bas quand il y a de l'espace
  },
  closeButton: {
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

export default FollowersModal;