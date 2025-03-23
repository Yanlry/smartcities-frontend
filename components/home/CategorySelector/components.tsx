
// // src/components/home/CategoryReportsSection/components.tsx
// import React, { memo, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Platform,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { SectionHeaderProps, CategoryItemProps, InfoPanelProps } from './types';
// import { hexToRgba } from '../../../utils/reductOpacity';
// import { BlurView } from 'expo-blur';

// // Constantes
// const { width } = Dimensions.get('window');
// const ITEM_SIZE = 88;
// const ITEM_SPACING = 12;
// const INDICATOR_SIZE = 8;

// /**
//  * En-tête du sélecteur de catégories
//  * Affiche le titre et gère l'expansion/contraction
//  */
// export const SectionHeader = memo<SectionHeaderProps>(({ onToggle, rotationAnimation }) => {
//   // Animation de rotation pour l'icône
//   const rotationInterpolated = rotationAnimation.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '180deg']
//   });

//   return (
//     <TouchableOpacity
//       activeOpacity={0.8}
//       onPress={onToggle}
//       style={styles.headerContainer}
//     >
//       <View style={styles.headerGradient} />
//       <View style={styles.headerContent}>
//         <View style={styles.titleContainer}>
//           <Ionicons name="layers-outline" size={18} color="#fff" style={styles.titleIcon} />
//           <Text style={styles.headerTitle}>Catégories de signalement</Text>
//         </View>
        
//         <Animated.View 
//           style={[
//             styles.headerIcon, 
//             { transform: [{ rotate: rotationInterpolated }] }
//           ]}
//         >
//           <View style={styles.iconCircle}>
//             <Ionicons name="chevron-down" size={18} color="#fff" />
//           </View>
//         </Animated.View>
//       </View>
//     </TouchableOpacity>
//   );
// });

// /**
//  * Item individuel représentant une catégorie dans le carrousel
//  * Gère l'affichage, l'animation et la sélection
//  */
// export const CategoryItem = memo<CategoryItemProps>(({ 
//   category, 
//   isSelected, 
//   index,
//   totalItems,
//   onSelect 
// }) => {
//   // Gérer la sélection de la catégorie
//   const handlePress = useCallback(() => {
//     onSelect(category.name);
//   }, [category.name, onSelect]);
  
//   // Calculer une couleur de départ et d'arrivée pour le dégradé
//   const startColor = category.color;
//   const endColor = hexToRgba(category.color, 0.7);
  
//   return (
//     <TouchableOpacity
//       style={[
//         styles.categoryItem,
//         isSelected && styles.categoryItemSelected
//       ]}
//       activeOpacity={0.9}
//       onPress={handlePress}
//     >
//       {/* Arrière-plan avec effet de dégradé */}
//       <View 
//         style={[
//           styles.categoryBackground,
//           { 
//             backgroundColor: category.color,
//             borderColor: isSelected ? '#fff' : 'transparent',
//           }
//         ]} 
//       />
      
//       {/* Effet de brillance au sommet */}
//       <View style={styles.categoryShine} />
      
//       {/* Icône de catégorie */}
//       <View style={styles.categoryIconContainer}>
//         <Ionicons
//           name={category.icon as keyof typeof Ionicons.glyphMap}
//           size={isSelected ? 36 : 32}
//           color="#fff"
//           style={styles.categoryIcon}
//         />
//       </View>
      
//       {/* Libellé de la catégorie */}
//       <View style={styles.labelContainer}>
//         <Text 
//           style={styles.categoryLabel} 
//           numberOfLines={1}
//           ellipsizeMode="tail"
//         >
//           {category.label}
//         </Text>
//       </View>
      
//       {/* Indicateur de sélection */}
//       {isSelected && (
//         <View style={styles.selectionRing}>
//           <View style={[styles.checkmark, { backgroundColor: category.color }]}>
//             <Ionicons name="checkmark" size={14} color="#fff" />
//           </View>
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// });

// /**
//  * Panneau d'information affiché sous le carrousel
//  * Affiche les détails de la catégorie sélectionnée et le bouton de confirmation
//  */
// export const InfoPanel = memo<InfoPanelProps>(({ selectedCategory, onConfirm }) => {
//   // Si aucune catégorie n'est sélectionnée
//   if (!selectedCategory) {
//     return (
//       <View style={styles.infoPanelEmpty}>
//         <Ionicons name="information-circle-outline" size={30} color="#8e8e93" />
//         <Text style={styles.placeholderText}>
//           Sélectionnez une catégorie pour continuer
//         </Text>
//       </View>
//     );
//   }
  
//   return (
//     <View style={styles.infoPanel}>
//       {/* En-tête avec couleur et titre */}
//       <View style={styles.infoPanelHeader}>
//         <View 
//           style={[
//             styles.colorIndicator, 
//             { backgroundColor: selectedCategory.color }
//           ]} 
//         />
        
//         <Text style={styles.categoryTitle}>{selectedCategory.label}</Text>
        
//         <TouchableOpacity 
//           style={[styles.confirmButton, { backgroundColor: selectedCategory.color }]}
//           onPress={onConfirm}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.confirmText}>Sélectionner</Text>
//           <Ionicons name="chevron-forward" size={16} color="#fff" style={styles.confirmIcon} />
//         </TouchableOpacity>
//       </View>
      
//       {/* Description de la catégorie */}
//       <Text style={styles.categoryDescription}>
//         Utilisez cette catégorie pour signaler des problèmes liés à {selectedCategory.label.toLowerCase()}.
//       </Text>
//     </View>
//   );
// });

// /**
//  * Indicateurs de progression en bas du carrousel
//  */
// export const ProgressIndicators = memo(({ 
//   count, 
//   scrollX,
//   itemWidth 
// }: { 
//   count: number;
//   scrollX: Animated.Value;
//   itemWidth: number;
// }) => {
//   return (
//     <View style={styles.indicators}>
//       {Array.from({ length: count }).map((_, i) => {
//         // Calcul de l'opacité et de la taille de l'indicateur en fonction du défilement
//         const inputRange = [
//           (i - 1) * itemWidth,
//           i * itemWidth,
//           (i + 1) * itemWidth
//         ];
        
//         // Animation de l'opacité
//         const opacity = scrollX.interpolate({
//           inputRange,
//           outputRange: [0.4, 1, 0.4],
//           extrapolate: 'clamp'
//         });
        
//         // Animation de la taille
//         const scale = scrollX.interpolate({
//           inputRange,
//           outputRange: [1, 1.3, 1],
//           extrapolate: 'clamp'
//         });
        
//         return (
//           <Animated.View
//             key={`indicator-${i}`}
//             style={[
//               styles.indicator,
//               { 
//                 opacity,
//                 transform: [{ scale }]
//               }
//             ]}
//           />
//         );
//       })}
//     </View>
//   );
// });

// // Styles
// const styles = StyleSheet.create({
//   // Header Styles
//   headerContainer: {
//     marginHorizontal: 16,
//     borderRadius: 16,
//     overflow: 'hidden',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   headerGradient: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: '#3d4a5d',
//   },
//   headerContent: {
//     height: 58,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//   },
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   titleIcon: {
//     marginRight: 8,
//   },
//   headerTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   headerIcon: {
//     width: 30,
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   iconCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
  
//   // Category Item Styles
//   categoryItem: {
//     width: ITEM_SIZE,
//     height: ITEM_SIZE + 30, // Extra height for the label
//     marginRight: ITEM_SPACING,
//     marginTop: 8,
//     marginBottom: 8,
//     borderRadius: ITEM_SIZE / 2,
//     overflow: 'visible',
//   },
//   categoryItemSelected: {
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 6 },
//         shadowOpacity: 0.3,
//         shadowRadius: 10,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   categoryBackground: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: ITEM_SIZE,
//     height: ITEM_SIZE,
//     borderRadius: ITEM_SIZE / 2,
//     borderWidth: 3,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.2,
//         shadowRadius: 5,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   categoryShine: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: ITEM_SIZE,
//     height: ITEM_SIZE * 0.5,
//     borderTopLeftRadius: ITEM_SIZE / 2,
//     borderTopRightRadius: ITEM_SIZE / 2,
//     backgroundColor: 'rgba(255, 255, 255, 0.25)',
//   },
//   categoryIconContainer: {
//     width: ITEM_SIZE,
//     height: ITEM_SIZE,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   categoryIcon: {
//     textShadowColor: 'rgba(0, 0, 0, 0.2)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 3,
//   },
//   labelContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     paddingTop: 4,
//   },
//   categoryLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'center',
//     maxWidth: ITEM_SIZE,
//   },
//   selectionRing: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   checkmark: {
//     width: 22,
//     height: 22,
//     borderRadius: 11,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
  
//   // Info Panel Styles
//   infoPanel: {
//     marginHorizontal: 16,
//     borderRadius: 16,
//     backgroundColor: '#fff',
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   infoPanelEmpty: {
//     marginHorizontal: 16,
//     borderRadius: 16,
//     backgroundColor: '#f9f9f9',
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   infoPanelHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   colorIndicator: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   categoryTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#333',
//     flex: 1,
//   },
//   categoryDescription: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 18,
//   },
//   placeholderText: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#8e8e93',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   confirmButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//   },
//   confirmText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   confirmIcon: {
//     marginLeft: 4,
//   },
  
//   // Indicators Styles
//   indicators: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   indicator: {
//     width: INDICATOR_SIZE,
//     height: INDICATOR_SIZE,
//     borderRadius: INDICATOR_SIZE / 2,
//     backgroundColor: '#3d4a5d',
//     marginHorizontal: 4,
//   },
// });