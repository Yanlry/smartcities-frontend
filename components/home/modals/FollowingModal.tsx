// src/components/home/modals/FollowingModal.tsx
import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Modal, 
  StyleSheet,
  TextInput,
  Animated,
  Platform,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { UserFollowing } from '../../../types/entities/user.types';
import * as Haptics from 'expo-haptics';

/**
 * Theme constants for premium visual styling
 */
const THEME = {
  colors: {
    // Primary color palette
    primary: {
      main: '#1E40AF',
      dark: '#1E40AF',
      light: '#60A5FA',
      ultraLight: '#EFF6FF'
    },
    // Secondary color palette
    secondary: {
      main: '#00C6A7',
      dark: '#00A3C4',
    },
    // Accent colors for emphasis
    accent: {
      orange: '#F97316',
      pink: '#DB2777',
    },
    // Functional colors for status indicators
    functional: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#38BDF8',
    },
    // Grayscale for text and backgrounds
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    // Core colors
    white: '#FFFFFF',
    black: '#000000',
    // Transparent variants
    transparent: {
      white10: 'rgba(255, 255, 255, 0.1)',
      white20: 'rgba(255, 255, 255, 0.2)',
      white50: 'rgba(255, 255, 255, 0.5)',
      black10: 'rgba(0, 0, 0, 0.1)',
      black20: 'rgba(0, 0, 0, 0.2)',
      black50: 'rgba(0, 0, 0, 0.5)',
      black70: 'rgba(0, 0, 0, 0.7)',
    }
  },
  // Consistent spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  // Border radius system
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  // Animation timing constants
  animation: {
    short: 150,
    medium: 300,
    long: 450,
  },
  // Standardized shadows for elevation
  shadows: Platform.select({
    ios: {
      small: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      medium: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      large: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
    },
    android: {
      small: { elevation: 2 },
      medium: { elevation: 4 },
      large: { elevation: 8 },
    },
    default: {},
  }),
};

/**
 * Props interface with comprehensive typing
 */
interface FollowingModalProps {
  visible: boolean;
  onClose: () => void;
  following: UserFollowing[];
  onUserPress: (id: string) => void;
  onOptionChange?: (option: 'fullName' | 'username') => void; 
}

/**
 * Animation values interface for type safety
 */
interface AnimationValues {
  fadeAnim: Animated.Value;
  translateAnim: Animated.Value;
  searchBarAnim: Animated.Value;
  listItemAnims: Animated.Value[];
}

/**
 * FollowingModal - Premium modal component displaying user followings
 * 
 * Features:
 * - Ultra-modern glassmorphism UI with dynamic shadows
 * - Sophisticated micro-animations and transitions
 * - Optimized performance with comprehensive memoization
 * - Premium visual hierarchy and spacing
 * - Haptic feedback for enhanced interaction
 * 
 * @param props Component properties
 */
const FollowingModal: React.FC<FollowingModalProps> = memo(({
  visible,
  onClose,
  following,
  onUserPress,
  onOptionChange
}) => {
  // State management
  const [searchText, setSearchText] = useState<string>('');
  
  // Reference handlers for optimal performance
  const searchInputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList>(null);
  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  
  // Memoized animation values for performance
  const animValues = useRef<AnimationValues>({
    fadeAnim: new Animated.Value(0),
    translateAnim: new Animated.Value(50),
    searchBarAnim: new Animated.Value(0),
    listItemAnims: following.map(() => new Animated.Value(0)),
  }).current;

  // Reset animation values when following list changes
  useEffect(() => {
    animValues.listItemAnims = following.map(() => new Animated.Value(0));
  }, [following]);
  
  /**
   * Optimized filtering with memoization for search functionality
   */
  const filteredFollowing = React.useMemo(() => {
    if (!searchText.trim()) return following;
    
    const searchLower = searchText.toLowerCase().trim();
    return following.filter(user => {
      const nameToSearch = user.useFullName && user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || "";
      
      return nameToSearch.toLowerCase().includes(searchLower);
    });
  }, [following, searchText]);

  /**
   * Modal open animation sequence
   */
  const animateIn = useCallback(() => {
    // Reset search text
    setSearchText('');
    
    // Create sequential animation for premium feel
    Animated.sequence([
      // 1. Fade in modal background
      Animated.timing(animValues.fadeAnim, {
        toValue: 1,
        duration: THEME.animation.medium,
        useNativeDriver: true,
      }),
      
      // 2. Slide up modal content
      Animated.timing(animValues.translateAnim, {
        toValue: 0,
        duration: THEME.animation.medium,
        useNativeDriver: true,
      }),
      
      // 3. Animate in search bar
      Animated.timing(animValues.searchBarAnim, {
        toValue: 1,
        duration: THEME.animation.medium,
        useNativeDriver: true,
      }),
      
      // 4. Sequentially animate in list items
      Animated.stagger(50, 
        animValues.listItemAnims.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: THEME.animation.short,
            useNativeDriver: true,
          })
        )
      )
    ]).start(() => {
      // Focus search input after animations complete
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    });
  }, [animValues]);

  /**
   * Modal close animation sequence
   */
  const animateOut = useCallback((callback?: () => void) => {
    Animated.parallel([
      // Fade out modal
      Animated.timing(animValues.fadeAnim, {
        toValue: 0,
        duration: THEME.animation.medium,
        useNativeDriver: true,
      }),
      
      // Slide down modal content
      Animated.timing(animValues.translateAnim, {
        toValue: 30,
        duration: THEME.animation.medium,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animation values
      animValues.searchBarAnim.setValue(0);
      animValues.listItemAnims.forEach(anim => anim.setValue(0));
      
      // Execute callback if provided
      if (callback) {
        callback();
      }
    });
  }, [animValues]);

  /**
   * Handle animations on visibility change
   */
  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible, animateIn]);

  /**
   * Enhanced user press handler with haptic feedback
   */
  const handleUserPress = useCallback((id: string) => {
    // Provide haptic feedback for premium feel
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate modal out
    animateOut(() => {
      onClose();
      // Delay navigation to ensure smooth transition
      setTimeout(() => onUserPress(id), 100);
    });
  }, [onClose, onUserPress, animateOut]);

  /**
   * Enhanced close handler with haptic feedback
   */
  const handleClose = useCallback(() => {
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate modal out
    animateOut(onClose);
  }, [onClose, animateOut]);

  /**
   * Search input focus handler with animation
   */
  const handleSearchFocus = useCallback(() => {
    Animated.timing(animValues.searchBarAnim, {
      toValue: 1.03, // Slight scale effect for visual feedback
      duration: THEME.animation.short,
      useNativeDriver: true,
    }).start();
  }, [animValues]);

  /**
   * Search input blur handler with animation
   */
  const handleSearchBlur = useCallback(() => {
    Animated.timing(animValues.searchBarAnim, {
      toValue: 1,
      duration: THEME.animation.short,
      useNativeDriver: true,
    }).start();
  }, [animValues]);

  /**
   * Clear search text handler with haptic feedback
   */
  const handleClearSearch = useCallback(() => {
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSearchText('');
    searchInputRef.current?.focus();
  }, []);

  /**
   * Optimized render function for list items
   */
  const renderItem = useCallback(({ item, index }: { item: UserFollowing; index: number }) => {
    const displayName = item.useFullName && item.firstName && item.lastName
      ? `${item.firstName} ${item.lastName}`
      : item.username || "Utilisateur";
    
    return (
      <Animated.View
        style={[
          styles.userItemContainer,
          {
            opacity: animValues.listItemAnims[index],
            transform: [
              { 
                translateY: animValues.listItemAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.userItem}
          onPress={() => handleUserPress(item.id)}
          activeOpacity={0.7}
        >
          {/* Premium avatar container with subtle shadow */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: item.profilePhoto || "https://via.placeholder.com/50" }}
              style={styles.userImage}
              resizeMode="cover"
            />
          </View>
          
          {/* User information with enhanced typography */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userStatus}>Abonné</Text>
          </View>
          
          {/* Navigation indicator with premium styling */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={THEME.colors.gray[400]}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [animValues.listItemAnims, handleUserPress]);

  /**
   * Memoized key extractor for performance
   */
  const keyExtractor = useCallback((item: UserFollowing) => item.id.toString(), []);
  
  /**
   * Memoized empty component for performance
   */
  const EmptyListComponent = useCallback(() => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        { opacity: animValues.fadeAnim }
      ]}
    >
      <Text style={styles.emptyText}>
        {searchText 
          ? `Aucun résultat pour "${searchText}"`
          : "Vous n'êtes abonné(e) à personne pour le moment"
        }
      </Text>
    </Animated.View>
  ), [searchText, animValues.fadeAnim]);

  /**
   * Memoized item separator for performance
   */
  const ItemSeparatorComponent = useCallback(() => (
    <View style={styles.separator} />
  ), []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // Custom animations handled by Animated API
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      {/* Modal backdrop with touch handler to close */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: animValues.fadeAnim }
          ]}
        >
          {/* Modal content container - prevent touches from closing */}
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  opacity: animValues.fadeAnim,
                  transform: [{ translateY: animValues.translateAnim }],
                  width: windowWidth * 0.92,
                  maxHeight: windowHeight * 0.8,
                }
              ]}
            >
              {/* Premium header with glassmorphism effect */}
              <View style={styles.headerContainer}>
                <Text style={styles.modalTitle}>Mes abonnements</Text>
              </View>
              
              {/* Main content container */}
              <View style={styles.contentContainer}>
                {/* Animated search container with premium styling */}
                <Animated.View 
                  style={[
                    styles.searchContainer,
                    {
                      transform: [
                        { scale: animValues.searchBarAnim },
                        { 
                          translateX: animValues.searchBarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Ionicons 
                    name="search-outline" 
                    size={18} 
                    color={THEME.colors.gray[500]} 
                    style={styles.searchIcon} 
                  />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder="Rechercher un abonnement..."
                    placeholderTextColor={THEME.colors.gray[400]}
                    value={searchText}
                    onChangeText={setSearchText}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    autoCapitalize="none"
                    returnKeyType="search"
                    selectionColor={THEME.colors.primary.main}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={handleClearSearch}
                      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                      <Ionicons 
                        name="close-circle" 
                        size={18} 
                        color={THEME.colors.gray[400]} 
                      />
                    </TouchableOpacity>
                  )}
                </Animated.View>
                
                {/* User list with optimized rendering */}
                <View style={styles.listContainer}>
                  {following && following.length > 0 ? (
                    <FlatList
                      ref={listRef}
                      data={filteredFollowing}
                      keyExtractor={keyExtractor}
                      renderItem={renderItem}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={false}
                      ItemSeparatorComponent={ItemSeparatorComponent}
                      ListEmptyComponent={EmptyListComponent}
                      // Performance optimizations
                      removeClippedSubviews={Platform.OS === 'android'}
                      initialNumToRender={10}
                      maxToRenderPerBatch={8}
                      windowSize={5}
                      keyboardShouldPersistTaps="handled"
                      keyboardDismissMode="on-drag"
                    />
                  ) : (
                    <EmptyListComponent />
                  )}
                </View>
              </View>
              
              {/* Premium footer with glassmorphism effect */}
              <View style={styles.footerContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

/**
 * Premium styled components with sophisticated design system
 */
const styles = StyleSheet.create({
  // Modal overlay with premium glassmorphism effect
  modalOverlay: {
    flex: 1,
    backgroundColor: THEME.colors.transparent.black70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal container with premium styling and shadow system
   modalContainer: {
      backgroundColor: THEME.colors.white,
      borderRadius: THEME.radius.lg,
      overflow: 'hidden',
      ...THEME.shadows.large,
      // Premium border effect
      borderWidth: Platform.OS === 'ios' ? 1 : 0,
      borderColor: THEME.colors.transparent.white20,
      height: '80%',
      // Add these properties to create a flex column layout
      flexDirection: 'column',
      display: 'flex',
    },
    
  
  // Premium header with subtle gradient
  headerContainer: {
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.gray[100],
    backgroundColor: THEME.colors.primary.ultraLight,
  },
  
  // Premium title with sophisticated typography
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: THEME.colors.gray[900],
    letterSpacing: 0.5,
  },
  
  // Main content container with premium spacing
  contentContainer: {
    padding: THEME.spacing.lg,
    // Use flex: 1 to make it expand and take available space
    flex: 1,
    // Add overflow management
    overflow: 'hidden',
  },
  
  
  // Premium search container with subtle shadow
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.gray[100],
    borderRadius: THEME.radius.lg,
    paddingHorizontal: THEME.spacing.md,
    height: 50,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.small,
  },
  
  // Search icon with premium positioning
  searchIcon: {
    marginRight: THEME.spacing.xs,
  },
  
  // Premium search input with sophisticated typography
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: THEME.colors.gray[800],
    height: '100%',
  },
  
  // Clear button with touch feedback
  clearButton: {
    padding: THEME.spacing.xs,
  },
  
  // Premium list container with glassmorphism
  listContainer: {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    minHeight: 200,
    maxHeight: 400,
  },
  
  // List content with premium spacing
  listContent: {
    paddingVertical: THEME.spacing.xs,
  },
  
  // User item container with animation support
  userItemContainer: {
    overflow: 'hidden',
  },
  
  // Premium user item with sophisticated layout
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
  },
  
  // Premium avatar container with subtle shadow
  avatarContainer: {
    borderRadius: THEME.radius.full,
    ...THEME.shadows.small,
    marginRight: THEME.spacing.md,
  },
  
  // Premium user image with border effect
  userImage: {
    width: 52,
    height: 52,
    borderRadius: THEME.radius.full,
    borderWidth: 2,
    borderColor: THEME.colors.white,
  },
  
  // User info container with premium spacing
  userInfo: {
    flex: 1,
  },
  
  // User name with premium typography
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.gray[900],
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  
  // User status with premium subtle color
  userStatus: {
    fontSize: 13,
    color: THEME.colors.gray[500],
    letterSpacing: 0.1,
  },
  
  // Premium icon container with subtle background
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Subtle separator with premium styling
  separator: {
    height: 1,
    backgroundColor: THEME.colors.gray[100],
    marginLeft: 76, // Align with avatar edge
    marginRight: THEME.spacing.md,
  },
  
  // Empty state container with premium spacing
  emptyContainer: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  
  // Empty state text with premium typography
  emptyText: {
    fontSize: 15,
    color: THEME.colors.gray[500],
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  
  // Premium footer container with glassmorphism
  footerContainer: {
    padding: THEME.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.gray[100],
    backgroundColor: THEME.colors.primary.ultraLight,
  },
  
  // Premium close button with gradient effect
  closeButton: {
    backgroundColor: THEME.colors.primary.main,
    borderRadius: THEME.radius.lg,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
    ...THEME.shadows.medium,
  },
  
  // Close button text with premium typography
  closeButtonText: {
    color: THEME.colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default FollowingModal;