import React, { memo } from 'react';
import { ScrollView, TouchableOpacity, Image, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { FeaturedEvent } from './event.types';

interface FeaturedEventsProps {
  events: FeaturedEvent[];
  loading: boolean;
  error: string | null;
  onEventPress: (id: string) => void;
}

const FeaturedEvents: React.FC<FeaturedEventsProps> = memo(({ 
  events, 
  loading, 
  error, 
  onEventPress 
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.noEventsContainer}>
        <Text style={styles.noEventsText}>
          Pas d'événement prévu pour le moment dans votre ville.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollContainer}
    >
      {events.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.featuredItem}
          onPress={() => onEventPress(item.id)}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.featuredImage}
          />
          <Text style={styles.featuredTitle}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollContainer: {
    marginBottom: 5,
    marginLeft: 5,
  },
  featuredItem: {
    width: 200,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  featuredTitle: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  noEventsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default FeaturedEvents;