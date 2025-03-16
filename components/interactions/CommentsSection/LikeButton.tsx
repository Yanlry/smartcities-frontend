import React, { memo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LikeButtonProps } from './types';


const LikeButton: React.FC<LikeButtonProps> = memo(({ 
  count, 
  isLiked, 
  onPress, 
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.likeButton, isLiked && styles.likedButton]}
      disabled={disabled}
    >
      <View style={styles.likeButtonContent}>
        <Ionicons
          name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
          size={22}
          color={isLiked ? "#007bff" : "#656765"}
        />
        <Text
          style={[
            styles.likeButtonText,
            { color: isLiked ? "#007bff" : "#656765" },
          ]}
        >
          {count || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  likeButton: {
    marginTop: 2,
  },
  likedButton: {},
  likeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeButtonText: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
});

export default LikeButton;