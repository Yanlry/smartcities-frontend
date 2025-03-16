import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SidebarItemProps } from './types';

const SidebarItem: React.FC<SidebarItemProps> = memo(({ 
  icon, 
  label, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      style={styles.sidebarItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={styles.sidebarText}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  sidebarText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 15,
  },
});

export default SidebarItem;