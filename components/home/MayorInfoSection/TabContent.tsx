// src/components/home/MayorInfoSection/components/TabContent.tsx
import React, { memo, ReactNode } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface TabContentProps {
  contentOpacity: Animated.Value;
  children: ReactNode;
}

/**
 * Conteneur pour le contenu des onglets avec animation de fondu
 */
export const TabContent = memo<TabContentProps>(({ 
  contentOpacity, 
  children 
}) => {
  return (
    <Animated.View 
      style={[
        styles.tabContent,
        { opacity: contentOpacity }
      ]}
    >
      {children}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
});