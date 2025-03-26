// // Chemin: components/home/ProfileSection/BadgeDisplay.tsx

// import React, { memo, useMemo } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useBadgeAnimation } from '../../../hooks/ui/useBadgeAnimation';
// import { BadgeStyle } from './user.types';

// interface BadgeDisplayProps {
//   badgeStyle: BadgeStyle;
//   onPress: () => void;
//   ranking: number | null;
//   totalUsers: number | null;
//   rankingSuffix: string;
//   onRankingPress: () => void;
// }

// /**
//  * BadgeDisplay: Affiche le badge de niveau de l'utilisateur avec animations
//  * - Redesigné avec une apparence moderne de réseau social
//  * - Animations subtiles pour améliorer l'engagement
//  * - Optimisé pour l'accessibilité et la lisibilité
//  */
// const BadgeDisplay: React.FC<BadgeDisplayProps> = memo(({
//   badgeStyle,
//   onPress,
//   ranking,
//   totalUsers,
//   rankingSuffix,
//   onRankingPress
// }) => {
//   const { scale, shine, triggerBadgeAnimation } = useBadgeAnimation();
  
//   // Optimisation du rendu des étoiles
//   const starsDisplay = useMemo(() => {
//     if (badgeStyle.stars === 0) {
//       return [
//         <Ionicons
//           key="school-outline"
//           name="school-outline"
//           size={16}
//           color={badgeStyle.starsColor}
//           style={styles.badgeIcon}
//         />
//       ];
//     }

//     return Array.from({ length: badgeStyle.stars }).map((_, index) => (
//       <Ionicons
//         key={index}
//         name="star"
//         size={14}
//         color={badgeStyle.starsColor}
//         style={styles.starIcon}
//       />
//     ));
//   }, [badgeStyle.stars, badgeStyle.starsColor]);

//   // Effet de brillance animé
//   const shineStyle = {
//     transform: [
//       {
//         translateX: shine.interpolate({
//           inputRange: [0, 1],
//           outputRange: [-50, 100]
//         })
//       }
//     ]
//   };

//   return (
//     <Animated.View 
//       style={[
//         styles.container,
//         { transform: [{ scale }] }
//       ]}
//     >
//       <TouchableOpacity
//         onPress={() => {
//           triggerBadgeAnimation();
//           onPress();
//         }}
//         activeOpacity={0.85}
//         style={[
//           styles.badgeContainer,
//           {
//             backgroundColor: badgeStyle.backgroundColor,
//             borderColor: badgeStyle.borderColor,
//           }
//         ]}
//       >
//         {/* Effet de brillance */}
//         <Animated.View style={[styles.shineEffect, shineStyle]} />
        
//         {/* Contenu du badge */}
//         <View style={styles.badgeContent}>
//           {starsDisplay.length > 0 ? (
//             <View style={styles.starsContainer}>
//               {starsDisplay}
//             </View>
//           ) : (
//             <Ionicons
//               name="school-outline"
//               size={16}
//               color={badgeStyle.starsColor}
//               style={styles.badgeIcon}
//             />
//           )}
          
//           <Text
//             style={[
//               styles.badgeText,
//               { color: badgeStyle.textColor }
//             ]}
//             numberOfLines={1}
//           >
//             {badgeStyle.title}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// });

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     overflow: 'hidden',
//     marginVertical: 6,
//   },
//   badgeContainer: {
//     borderRadius: 16,
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderWidth: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     overflow: 'hidden',
//   },
//   badgeContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   badgeIcon: {
//     marginRight: 6,
//   },
//   starsContainer: {
//     flexDirection: 'row',
//     marginRight: 6,
//   },
//   starIcon: {
//     marginRight: 2,
//   },
//   badgeText: {
//     fontSize: 13,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   shineEffect: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: 30,
//     height: '100%',
//     backgroundColor: 'rgba(255, 255, 255, 0.4)',
//     transform: [{ skewX: '-20deg' }],
//   },
// });

// export default BadgeDisplay;