// src/components/home/MayorInfoSection/components/TabBar.tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabType } from './MayorInfoSection';

const { width } = Dimensions.get('window');
const TAB_HEIGHT = 48;
const INDICATOR_WIDTH = 30;

interface TabBarProps {
  activeTab: TabType;
  handleTabChange: (tab: TabType) => void;
  indicatorTranslate: Animated.AnimatedInterpolation<string | number>;
  tabsFadeAnim: Animated.Value;
}

/**
 * Barre d'onglets avec animation pour la navigation
 */
export const TabBar = memo<TabBarProps>(({
  activeTab,
  handleTabChange,
  indicatorTranslate,
  tabsFadeAnim
}) => {
  return (
    <Animated.View style={[styles.tabsContainer, { opacity: tabsFadeAnim }]}>
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => handleTabChange('news')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="newspaper-outline" 
            size={20} 
            color={activeTab === 'news' ? "#444" : '#8E8E93'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'news' && styles.activeTabText
            ]}
          >
            Actualités
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => handleTabChange('mayor')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={activeTab === 'mayor' ? "#444" : '#8E8E93'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'mayor' && styles.activeTabText
            ]}
          >
            Maire
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => handleTabChange('contact')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="call-outline" 
            size={20} 
            color={activeTab === 'contact' ? "#444" : '#8E8E93'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'contact' && styles.activeTabText
            ]}
          >
            Contact
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Indicateur d'onglet actif */}
      <Animated.View 
        style={[
          styles.activeIndicator,
          { transform: [{ translateX: indicatorTranslate }] }
        ]}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  tabsContainer: {
    height: TAB_HEIGHT,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabs: {
    flexDirection: 'row',
    height: '100%',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  activeTabText: {
    color: "#444",
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    width: INDICATOR_WIDTH,
    height: 3,
    backgroundColor: "#444",
    borderRadius: 1.5,
    marginLeft: ((width / 3) - INDICATOR_WIDTH) / 2,
  },
});