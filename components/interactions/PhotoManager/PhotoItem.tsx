import React, { memo } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PhotoItemProps } from '../../../types/components/photo/photo-manager.types';

const PhotoItem: React.FC<PhotoItemProps> = memo(({ photo, onRemove }) => {
  return (
    <View style={styles.photoWrapper}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onRemove}
      >
        <Ionicons name="close-circle" size={24} color="red" />
      </TouchableOpacity>
      <Image source={{ uri: photo.uri }} style={styles.photo} />
    </View>
  );
});

const styles = StyleSheet.create({
  photoWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
});

export default PhotoItem;