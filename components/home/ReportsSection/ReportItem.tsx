// components/home/ReportsSection/ReportItem.tsx

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Report } from './report.types';
import { formatDistance } from '../../../utils/formatters';

interface ReportItemProps {
  report: Report;
  onPress: (id: number) => void;
  typeLabel: string;
  typeColor: string;
  backgroundColor: string;
  formattedCity: string;
  formattedTime: string;
}

const ReportItem: React.FC<ReportItemProps> = memo(({
  report,
  onPress,
  typeLabel,
  typeColor,
  backgroundColor,
  formattedCity,
  formattedTime
}) => {
  // Utilisation de formatDistance pour un affichage optimisé
  const distanceText = formatDistance(report.distance);

  return (
    <View key={report.id} style={styles.timelinePointContainer}>
      {/* Étiquette */}
      <View
        style={[
          styles.timelineLabel,
          {
            backgroundColor: typeColor,
          },
        ]}
      >
        <Text style={styles.labelText}>
          {typeLabel} à {distanceText}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.timelineBlock,
          { backgroundColor }
        ]}
        onPress={() => onPress(report.id)}
        activeOpacity={0.9}
      >
        <Text numberOfLines={1} style={styles.reportTitle}>
          {report.title}
        </Text>
        <View style={styles.photoContainer}>
          {report.photos &&
          Array.isArray(report.photos) &&
          report.photos.length > 0 ? (
            <Image
              source={{ uri: report.photos[0].url }}
              style={styles.fullWidthPhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noPhotoContainer}>
              <Text style={styles.noPhotoText}>
                Aucune photo disponible
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.reportDetails}>
          {formattedCity}
        </Text>
        <View style={styles.dateContainer}>
          <Text style={styles.createdAt}>
            {formattedTime}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});


const styles = StyleSheet.create({
  // Styles inchangés...
  timelinePointContainer: {
    marginHorizontal: 10,
    width: 250,
    marginBottom: 10,
  },
  timelineLabel: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 5,
    zIndex: 1,
  },
  labelText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  timelineBlock: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginTop: -10,
    paddingTop: 15,
  },
  reportTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  photoContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
  },
  fullWidthPhoto: {
    width: '100%',
    height: '100%',
  },
  noPhotoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
  },
  noPhotoText: {
    color: '#888',
    textAlign: 'center',
  },
  reportDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  createdAt: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default ReportItem;