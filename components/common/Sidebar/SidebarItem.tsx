import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SidebarItemProps } from './types';

// Updated interface to include active state and secondary styling
interface EnhancedSidebarItemProps extends SidebarItemProps {
  isActive?: boolean;
  isSecondary?: boolean;
}

const SidebarItem: React.FC<EnhancedSidebarItemProps> = memo(({ 
  icon, 
  label, 
  onPress,
  isActive = false,
  isSecondary = false
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.sidebarItem,
        isActive && styles.sidebarItemActive
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isActive && (
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.activeBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
      
      {/* Active indicator */}
      {isActive && (
        <View style={styles.activeIndicator} />
      )}
      
      {/* Icon and label */}
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={[
        styles.sidebarText,
        isSecondary && styles.secondaryText,
        isActive && styles.activeText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    backgroundColor: '#2A93D5',
    borderRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sidebarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  secondaryText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  }
});

export default SidebarItem;