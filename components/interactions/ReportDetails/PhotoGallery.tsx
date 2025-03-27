// src/components/interactions/ReportDetails/PhotoGallery.tsx

import React, { memo } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Photo } from "../../../types/report.types";

const { width, height } = Dimensions.get("window");

interface PhotoThumbnailsProps {
  photos: Photo[];
  onPhotoPress: (index: number) => void;
}

/**
 * Sous-composant pour afficher les miniatures des photos
 */
const PhotoThumbnails = memo(({ photos, onPhotoPress }: PhotoThumbnailsProps) => {
  return (
    <FlatList
      data={photos}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => onPhotoPress(index)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.url }}
            style={styles.photoThumbnail}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
    />
  );
});

interface PhotoViewerModalProps {
  visible: boolean;
  photos: Photo[];
  initialIndex: number | null;
  onClose: () => void;
}

/**
 * Sous-composant pour le modal de visualisation des photos
 */
const PhotoViewerModal = memo(({ visible, photos, initialIndex, onClose }: PhotoViewerModalProps) => {
  if (!visible || initialIndex === null || !photos.length) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeModalButton}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.modalPhotoContainer}>
              <Image
                source={{ uri: item.url }}
                style={styles.modalPhoto}
                resizeMode="contain"
              />
            </View>
          )}
        />
        
        <View style={styles.photoIndicator}>
          <Text style={styles.photoIndicatorText}>
            {initialIndex + 1}/{photos.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
});

interface PhotoGalleryProps {
  photos: Photo[];
  photoModalVisible: boolean;
  selectedPhotoIndex: number | null;
  openPhotoModal: (index: number) => void;
  closePhotoModal: () => void;
}

/**
 * Composant principal de galerie photo avec miniatures et visionneuse
 */
const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  photoModalVisible,
  selectedPhotoIndex,
  openPhotoModal,
  closePhotoModal,
}) => {
  if (!photos || photos.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Photos</Text>
      <PhotoThumbnails 
        photos={photos} 
        onPhotoPress={openPhotoModal} 
      />
      <PhotoViewerModal
        visible={photoModalVisible}
        photos={photos}
        initialIndex={selectedPhotoIndex}
        onClose={closePhotoModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 8,
  },
  photoContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  photoThumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPhotoContainer: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  modalPhoto: {
    width: width,
    height: height * 0.7,
  },
  photoIndicator: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoIndicatorText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default memo(PhotoGallery);