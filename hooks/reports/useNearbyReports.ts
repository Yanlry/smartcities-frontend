// Chemin : frontend/src/hooks/reports/useNearbyReports.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Report, ReportCategory } from '../../types/features/reports/report.types';
import { processReports } from '../../services/reportService';
import { getTypeLabel, typeColors } from '../../utils/reportHelpers';
import { hexToRgba, calculateOpacity } from '../../utils/reductOpacity';
import { formatCity } from '../../utils/formatters';
import { formatDistance } from '../../utils/formatters';

/**
 * Interface de retour du hook avec fonction refetch
 */
interface UseNearbyReportsReturn {
  reports: Report[];
  allReports: Report[];
  categories: ReportCategory[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  loading: boolean;
  error: string | null;
  formatTime: (dateString: string) => string;
  formatDistance: typeof formatDistance;
  getTypeLabel: typeof getTypeLabel;
  typeColors: typeof typeColors;
  hexToRgba: typeof hexToRgba;
  calculateOpacity: typeof calculateOpacity;
  formatCity: typeof formatCity;
  refetch: () => Promise<void>; // 🎯 Fonction de rechargement
}

/**
 * Hook personnalisé pour récupérer et gérer les signalements à proximité
 * Optimisé avec fonction refetch et gestion d'erreurs améliorée
 */
export const useNearbyReports = (
  latitude: number | undefined, 
  longitude: number | undefined
): UseNearbyReportsReturn => {
  
  // ===== ÉTATS =====
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔄 Fonction principale de récupération des signalements
   * Extraite pour être réutilisable via refetch
   */
  const fetchReports = useCallback(async (): Promise<void> => {
    // Vérification des coordonnées
    if (!latitude || !longitude) {
      const errorMsg = "Position non disponible - coordonnées manquantes";
      console.warn("📍", errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📡 Récupération des signalements pour: ${latitude}, ${longitude}`);
      
      // Récupération des signalements via le service existant
      const fetchedReports = await processReports(latitude, longitude, "");
      
      // 🔧 Normalisation des données - conversion explicite pour respecter les types
      const normalizedReports: Report[] = fetchedReports.map(report => {
        // Convertir chaque photo au format attendu
        const normalizedPhotos = Array.isArray(report.photos) 
          ? report.photos.map(photo => ({
              // Préserver le type de l'ID tel qu'il est défini dans ReportPhoto
              id: String(photo.id),
              url: photo.url
            }))
          : [];
          
        return {
          ...report,
          photos: normalizedPhotos,
          // Utiliser undefined pour les distances invalides
          distance: report.distance === null || !isFinite(report.distance as number) 
            ? undefined 
            : report.distance,
        } as Report; // Assertion de type pour chaque élément
      });
      
      setReports(normalizedReports);
      console.log(`✅ ${normalizedReports.length} signalements récupérés avec succès`);
      
    } catch (error: any) {
      const errorMessage = error.message || "Erreur lors du chargement des signalements";
      console.error("❌ Erreur lors du chargement des signalements:", errorMessage);
      setError(errorMessage);
      setReports([]); // Reset en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  /**
   * 📅 Chargement initial des données
   */
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /**
   * 🕐 Formate une date en texte relatif (il y a X minutes/heures/jours)
   * Optimisé avec useCallback pour éviter les re-renders
   */
  const formatTime = useCallback((dateString: string): string => {
    try {
      const eventDate = new Date(dateString);
      
      // Validation de la date
      if (isNaN(eventDate.getTime())) {
        console.warn("Date invalide reçue:", dateString);
        return "Date inconnue";
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - eventDate.getTime();
      
      // Protection contre les dates futures
      if (diffInMs < 0) {
        return "À l'instant";
      }
      
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInSeconds < 60) {
        return diffInSeconds <= 5 ? "À l'instant" : `Il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? "s" : ""}`;
      } else if (diffInMinutes < 60) {
        return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
      } else if (diffInHours < 24) {
        return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
      } else if (diffInDays < 30) {
        return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
      } else {
        // Pour les dates plus anciennes, affichage de la date formatée
        return eventDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: eventDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "Date inconnue";
    }
  }, []);

  /**
   * 📂 Liste des catégories de signalements disponibles
   * Memoïzée pour éviter les re-créations inutiles
   */
  const categories: ReportCategory[] = useMemo(() => [
    {
      name: "danger",
      label: "Danger",
      icon: "alert-circle-outline",
      color: "#92281F",
    },
    {
      name: "travaux",
      label: "Travaux",
      icon: "construct-outline",
      color: "#DD8E31",
    },
    {
      name: "nuisance",
      label: "Nuisance",
      icon: "volume-high-outline",
      color: "#8655AB",
    },
    {
      name: "reparation",
      label: "Reparation",
      icon: "hammer-outline",
      color: "#345995",
    },
    {
      name: "pollution",
      label: "Pollution",
      icon: "leaf-outline",
      color: "#2E7D6E",
    },
  ], []);

  /**
   * 🔍 Filtre les signalements selon la catégorie sélectionnée
   * Optimisé avec useMemo pour éviter les recalculs inutiles
   */
  const filteredReports = useMemo(() => {
    if (selectedCategory === "Tous") {
      return reports;
    }
    
    return reports.filter((report) => report.type === selectedCategory);
  }, [reports, selectedCategory]);

  /**
   * 🎯 Mise à jour de la catégorie sélectionnée avec validation
   */
  const setSelectedCategoryWithValidation = useCallback((category: string) => {
    const validCategories = ["Tous", ...categories.map(cat => cat.name)];
    
    if (validCategories.includes(category)) {
      setSelectedCategory(category);
    } else {
      console.warn(`Catégorie invalide: ${category}. Utilisation de "Tous" par défaut.`);
      setSelectedCategory("Tous");
    }
  }, [categories]);

  // ===== RETOUR DU HOOK =====
  return {
    reports: filteredReports,
    allReports: reports,
    categories,
    selectedCategory,
    setSelectedCategory: setSelectedCategoryWithValidation,
    loading,
    error,
    formatTime,
    formatDistance,
    getTypeLabel,
    typeColors,
    hexToRgba,
    calculateOpacity,
    formatCity,
    refetch: fetchReports, // 🎯 Exposition de la fonction de rechargement
  };
};

export default useNearbyReports;