// src/hooks/reports/useNearbyReports.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Report, ReportCategory } from '../../components/home/ReportsSection/report.types';
import { processReports } from '../../services/reportService';
import { getTypeLabel, typeColors } from '../../utils/reportHelpers';
import { hexToRgba, calculateOpacity } from '../../utils/reductOpacity';
import { formatCity } from '../../utils/formatters';
import { formatDistance } from '../../utils/formatters';

/**
 * Hook personnalisé pour récupérer et gérer les signalements à proximité
 */
export const useNearbyReports = (latitude: number | undefined, longitude: number | undefined) => {
  // États
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère les signalements depuis l'API et normalise les données
   */
  useEffect(() => {
    const fetchReports = async () => {
      // Vérification des coordonnées
      if (!latitude || !longitude) {
        setError("Position non disponible");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Récupération des signalements
        const fetchedReports = await processReports(latitude, longitude, "");
        
        // Normalisation des données - conversion explicite pour respecter les types
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
      } catch (error: any) {
        console.error("❌ Erreur lors du chargement des signalements :", error);
        setError(error.message || "Erreur lors du chargement des signalements");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [latitude, longitude]);

  /**
   * Formate une date en texte relatif (il y a X minutes/heures/jours)
   */
  const formatTime = useCallback((dateString: string): string => {
    const eventDate = new Date(dateString);
    const now = new Date();

    const diffInMs = now.getTime() - eventDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `Il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? "s" : ""}`;
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
    } else {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
    }
  }, []);

  /**
   * Liste des catégories de signalements disponibles
   */
  const categories: ReportCategory[] = useMemo(() => [
    {
      name: "danger",
      label: "Danger",
      icon: "alert-circle-outline",
      color: "#FF4C4C",
    },
    {
      name: "travaux",
      label: "Travaux",
      icon: "construct-outline",
      color: "#FFA500",
    },
    {
      name: "nuisance",
      label: "Nuisance",
      icon: "volume-high-outline",
      color: "#B4A0E5",
    },
    {
      name: "reparation",
      label: "Réparation",
      icon: "hammer-outline",
      color: "#33C2FF",
    },
    {
      name: "pollution",
      label: "Pollution",
      icon: "leaf-outline",
      color: "#32CD32",
    },
  ], []);

  /**
   * Filtre les signalements selon la catégorie sélectionnée
   */
  const filteredReports = useMemo(() => 
    reports.filter((report) =>
      selectedCategory === "Tous" ? true : report.type === selectedCategory
    ),
    [reports, selectedCategory]
  );

  // Retour des valeurs et méthodes du hook
  return {
    reports: filteredReports,
    allReports: reports,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    formatTime,
    formatDistance: formatDistance,
    getTypeLabel,
    typeColors,
    hexToRgba,
    calculateOpacity,
    formatCity
  };
};

export default useNearbyReports;