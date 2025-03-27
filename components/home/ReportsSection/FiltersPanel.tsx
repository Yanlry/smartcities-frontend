import React, { memo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ReportCategory } from "../../../types/entities/report.types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Configuration des couleurs (correspondant au thème existant)
const THEME = {
  primary: "#FF4D4F", // Rouge principal
  primaryDark: "#E73A3C", // Rouge foncé
  secondary: "#FF7875", // Rouge clair
  background: "#F9FAFE", // Fond très légèrement bleuté
  text: "#2D3748", // Texte principal presque noir
  textLight: "#718096", // Texte secondaire gris
  border: "#E2E8F0", // Bordures légères
};

/**
 * Interface des props pour le panneau de filtres
 */
interface FiltersPanelProps {
  categories: ReportCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  userCity: string | null;
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  sortOrder: 'date' | 'distance';
  onChangeSortOrder: (order: 'date' | 'distance') => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
}

// Définir l'interface pour les styles
interface FiltersPanelStyles {
  container: ViewStyle;
  filtersContent: ViewStyle;
  filterSectionHeader: ViewStyle;
  filterSectionTitle: TextStyle;
  filtersHeader: ViewStyle;
  filtersHeaderLeft: ViewStyle;
  filtersHeaderText: TextStyle;
  activeFiltersHeaderText: TextStyle;
  filtersHeaderRight: ViewStyle;
  filtersBadge: ViewStyle;
  filtersBadgeText: TextStyle;
  resetButton: ViewStyle;
  resetButtonText: TextStyle;
  categoriesContainer: ViewStyle;
  categoryButton: ViewStyle;
  selectedCategoryButton: ViewStyle;
  categoryText: TextStyle;
  selectedCategoryText: TextStyle;
  sortingOptionsContainer: ViewStyle;
  sortingSection: ViewStyle;
  sortingSectionTitle: TextStyle;
  sortingButtonsContainer: ViewStyle;
  sortingButton: ViewStyle;
  activeSortingButton: ViewStyle;
  sortingButtonText: TextStyle;
  activeSortingButtonText: TextStyle;
  distanceContainer: ViewStyle;
  distanceButton: ViewStyle;
  activeDistanceButton: ViewStyle;
  distanceButtonInner: ViewStyle;
  distanceButtonText: TextStyle;
  activeDistanceButtonText: TextStyle;
  expandedFiltersContainer: ViewStyle;
  filterGroupsContainer: ViewStyle;
  filterGroup: ViewStyle;
  filterGroupTitle: TextStyle;
  filterOptions: ViewStyle;
  filterOptionButton: ViewStyle;
  activeFilterOptionButton: ViewStyle;
  filterOptionText: TextStyle;
  activeFilterOptionText: TextStyle;
}

/**
 * Panneau de filtres pour la section des signalements
 * Permet de filtrer par catégorie, ville et de trier par date ou distance
 */
const FiltersPanel: React.FC<FiltersPanelProps> = memo(({
  categories,
  selectedCategory,
  onSelectCategory,
  userCity,
  selectedCity,
  onSelectCity,
  sortOrder,
  onChangeSortOrder,
  activeFiltersCount,
  onResetFilters
}) => {
  // État pour l'expansion/réduction du panneau complet
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* En-tête du panneau de filtres avec nombre de filtres actifs */}
      <TouchableOpacity
        style={[
          styles.filtersHeader, 
          isExpanded ? { borderBottomWidth: 1, borderBottomColor: "rgba(0, 0, 0, 0.05)" } : {}
        ]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <View style={styles.filtersHeaderLeft}>
          <MaterialIcons
            name="filter-list"
            size={18}
            color={activeFiltersCount > 0 ? THEME.primary : "#666"}
          />
          <Text style={[
            styles.filtersHeaderText,
            activeFiltersCount > 0 && styles.activeFiltersHeaderText
          ]}>
            Filtres
          </Text>
          
          {/* Badge de nombre de filtres actifs */}
          {activeFiltersCount > 0 && (
            <View style={styles.filtersBadge}>
              <Text style={styles.filtersBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.filtersHeaderRight}>
          {/* Bouton de réinitialisation des filtres */}
          {activeFiltersCount > 0 && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={onResetFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}
          
          {/* Icône d'expansion/réduction */}
          <MaterialIcons
            name={isExpanded ? "expand-less" : "expand-more"}
            size={20}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {/* Contenu du filtre - affiché uniquement si isExpanded = true */}
      {isExpanded && (
        <View style={styles.filtersContent}>
          {/* Filtres par catégorie */}
          <View style={styles.filterSectionHeader}>
            <MaterialIcons
              name="category"
              size={16}
              color="#666"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.filterSectionTitle}>Catégorie</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {/* Option "Tous" */}
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === 'Tous' && styles.selectedCategoryButton,
              ]}
              onPress={() => onSelectCategory('Tous')}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="view-list"
                size={16}
                color={selectedCategory === 'Tous' ? THEME.primary : "#666"}
                style={{ marginRight: 4 }}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === 'Tous' && styles.selectedCategoryText,
              ]}>
                Tous
              </Text>
            </TouchableOpacity>
            
            {/* Catégories spécifiques */}
            {categories.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.name && styles.selectedCategoryButton,
                  { 
                    backgroundColor: selectedCategory === category.name
                      ? `${category.color}20`
                      : "rgba(0, 0, 0, 0.05)" 
                  },
                ]}
                onPress={() => onSelectCategory(category.name)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.name && styles.selectedCategoryText,
                  { color: selectedCategory === category.name ? category.color : "#666" },
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Options de tri et filtres avancés */}
          <View style={styles.sortingOptionsContainer}>
            {/* Section Tri par Pertinence */}
            <View style={styles.sortingSection}>
              <Text style={styles.sortingSectionTitle}>Pertinence</Text>
              
              <View style={styles.sortingButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortingButton,
                    sortOrder === 'distance' && styles.activeSortingButton,
                  ]}
                  onPress={() => onChangeSortOrder('distance')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="location-searching"
                    size={16}
                    color={sortOrder === 'distance' ? "#FFFFFF" : "#666"}
                  />
                  <Text style={[
                    styles.sortingButtonText,
                    sortOrder === 'distance' && styles.activeSortingButtonText,
                  ]}>
                    Plus proche
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortingButton,
                    sortOrder === 'date' && styles.activeSortingButton,
                  ]}
                  onPress={() => onChangeSortOrder('date')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="schedule"
                    size={16}
                    color={sortOrder === 'date' ? "#FFFFFF" : "#666"}
                  />
                  <Text style={[
                    styles.sortingButtonText,
                    sortOrder === 'date' && styles.activeSortingButtonText,
                  ]}>
                    Plus récent
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section Trier par lieux */}
            <View style={styles.sortingSection}>
              <Text style={styles.sortingSectionTitle}>Trier par lieux</Text>
              
              <View style={styles.sortingButtonsContainer}>
                {/* Option "Toutes les villes" */}
                <TouchableOpacity
                  style={[
                    styles.sortingButton,
                    selectedCity === null && styles.activeSortingButton,
                  ]}
                  onPress={() => {
                    onSelectCity(null);
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="public"
                    size={16}
                    color={selectedCity === null ? "#FFFFFF" : "#666"}
                  />
                  <Text style={[
                    styles.sortingButtonText,
                    selectedCity === null && styles.activeSortingButtonText,
                  ]}>
                    Toutes les villes
                  </Text>
                </TouchableOpacity>
                
                {/* Option "Ma ville" - toujours visible */}
                <TouchableOpacity
                  style={[
                    styles.sortingButton,
                    selectedCity !== null && styles.activeSortingButton,
                  ]}
                  onPress={() => {
                    // Si userCity est défini, l'utiliser, sinon utiliser 'utilisateur'
                    const cityValue = userCity || 'utilisateur';
                    onSelectCity(cityValue);
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="home"
                    size={16}
                    color={selectedCity !== null ? "#FFFFFF" : "#666"}
                  />
                  <Text style={[
                    styles.sortingButtonText,
                    selectedCity !== null && styles.activeSortingButtonText,
                  ]}>
                    Ma ville
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

// Créer les styles avec le bon type
const styles = StyleSheet.create<FiltersPanelStyles>({
  container: {
    marginBottom: 16,
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filtersContent: {
    // Conteneur de contenu des filtres
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  filterSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filtersHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  filtersHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginLeft: 8,
  },
  activeFiltersHeaderText: {
    color: THEME.primary,
  },
  filtersHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  filtersBadge: {
    backgroundColor: THEME.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  filtersBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  resetButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: "600",
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  selectedCategoryButton: {
    backgroundColor: `${THEME.primary}20`,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  selectedCategoryText: {
    color: THEME.primary,
    fontWeight: "600",
  },
  
  // Styles pour les sections de tri
  sortingOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sortingSection: {
    flex: 1,
    marginHorizontal: 4,
  },
  sortingSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sortingButtonsContainer: {
    flexDirection: "column",
  },
  sortingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
    backgroundColor: "#F5F5F5",
  },
  activeSortingButton: {
    backgroundColor: THEME.primary,
  },
  sortingButtonText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  activeSortingButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  // Styles pour le tri par distance
  distanceContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  distanceButton: {
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    padding: 1,
    overflow: 'hidden',
  },
  activeDistanceButton: {
    backgroundColor: THEME.primary,
  },
  distanceButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  distanceButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: 'center',
  },
  activeDistanceButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  // Autres styles existants
  expandedFiltersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  filterGroupsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterGroup: {
    width: "48%",
    marginBottom: 16,
  },
  filterGroupTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "column",
  },
  filterOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  activeFilterOptionButton: {
    backgroundColor: `${THEME.primary}15`,
  },
  filterOptionText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  activeFilterOptionText: {
    color: THEME.primary,
    fontWeight: "600",
  },
});

export default FiltersPanel;