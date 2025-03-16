import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FeaturedEvents from './FeaturedEvents';
import { FeaturedEvent } from './event.types';

interface EventsSectionProps {
  featuredEvents: FeaturedEvent[];
  loading: boolean;
  error: string | null;
  onEventPress: (id: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const EventsSection: React.FC<EventsSectionProps> = memo(({ 
  featuredEvents, 
  loading, 
  error, 
  onEventPress,
  isVisible,
  toggleVisibility
}) => {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleVisibility}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>🎉 Événements à venir</Text>
        <Text style={styles.arrow}>{isVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.sectionContent}>
          <FeaturedEvents
            events={featuredEvents}
            loading={loading}
            error={error}
            onEventPress={onEventPress}
          />
        </View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
  },
  sectionHeaderVisible: {
    backgroundColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  arrow: {
    fontSize: 16,
    color: '#333',
  },
  sectionContent: {
    marginTop: 10,
  },
});

export default EventsSection;