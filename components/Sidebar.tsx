import React, { useState } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [sidebarAnimation] = useState(new Animated.Value(-250)); // Position initiale hors de l'écran

  React.useEffect(() => {
    if (isOpen) {
      // Ouvrir la barre
      Animated.timing(sidebarAnimation, {
        toValue: 0, // Position visible
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Fermer la barre
      Animated.timing(sidebarAnimation, {
        toValue: -250, // Position hors de l'écran
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isOpen]);

  return (
    <>
      {/* Barre latérale */}
      <Animated.View style={[styles.sidebar, { left: sidebarAnimation }]}>
        <Text style={styles.sidebarTitle}>Menu</Text>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => alert('Home')}>
          <Text style={styles.sidebarText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => alert('Profile')}>
          <Text style={styles.sidebarText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => alert('Settings')}>
          <Text style={styles.sidebarText}>Settings</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleSidebar} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 250,
    height: Dimensions.get('window').height,
    backgroundColor: '#333',
    padding: 20,
    zIndex: 2,
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sidebarItem: {
    marginVertical: 10,
  },
  sidebarText: {
    color: '#fff',
    fontSize: 18,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
});

export default Sidebar;
