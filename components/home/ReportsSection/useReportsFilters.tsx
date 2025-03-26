import { useMemo, useState, useCallback } from 'react';
import { Report } from './report.types';

/**
 * Options de filtrage pour les signalements
 */
interface FilterOptions {
  category: string;
  city: string | null;
  sortOrder: 'date' | 'distance'; // 'date' = par date, 'distance' = par proximité
}

/**
 * Hook personnalisé pour gérer le filtrage et le tri des signalements
 * @param reports Liste complète des signalements
 * @returns Signalements filtrés et méthodes de gestion des filtres
 */
export function useReportsFilters(reports: Report[]) {
  // État de filtrage avec valeurs par défaut
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'Tous',
    city: null,
    sortOrder: 'distance', // modifié de 'date' à 'distance'
  });

  /**
   * Met à jour un filtre spécifique
   */
  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = useCallback(() => {
    setFilters({
      category: 'Tous',
      city: null,
      sortOrder: 'distance', // modifié de 'date' à 'distance'
    });
  }, []);

  /**
   * Calcule les signalements filtrés en fonction des filtres actifs
   */
  const filteredReports = useMemo(() => {

    // Clone pour éviter de modifier l'original
    let result = [...reports];

    // 1. Filtrer par catégorie si une catégorie spécifique est sélectionnée
    if (filters.category !== 'Tous') {
      result = result.filter(report => 
        report.type.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // 2. Filtrer par ville si une ville est sélectionnée
    if (filters.city !== null) {
      
      // Vérifier si la ville existe et qu'elle est non nulle
      result = result.filter(report => {
        // Si la ville sélectionnée est 'utilisateur', on ne filtre pas
        if (filters.city === 'utilisateur') {
          return true;
        }
        
        const reportCityFull = report.city || '';
        const filterCity = filters.city || '';
        
        // Extraction du nom de la ville à partir de l'adresse complète
        // Format français typique: "Rue X, 59320 Haubourdin, France"
        let reportCity = '';
        
        // Méthode 1: Chercher le format "code postal Ville"
        const postalCodeCityMatch = reportCityFull.match(/\d{5}\s+([^,]+)/);
        if (postalCodeCityMatch && postalCodeCityMatch[1]) {
          reportCity = postalCodeCityMatch[1].trim();
        } else {
          // Méthode 2: Prendre la dernière partie avant ", France"
          const parts = reportCityFull.split(',');
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            if (part.includes('France') && i > 0) {
              reportCity = parts[i-1].trim();
              // Si cette partie contient un code postal, l'extraire
              const cityWithPostalCode = reportCity.match(/\d{5}\s+(.+)/);
              if (cityWithPostalCode && cityWithPostalCode[1]) {
                reportCity = cityWithPostalCode[1].trim();
              }
              break;
            }
          }
          
          // Si toujours pas trouvé, utiliser l'approche simple
          if (!reportCity) {
            reportCity = reportCityFull;
          }
        }
        
        // Comparaison exacte des noms de ville (insensible à la casse)
        const match = reportCity.toLowerCase() === filterCity.toLowerCase();
        
        return match;
      });
    }

    // 3. Trier selon le mode de tri sélectionné
    if (filters.sortOrder === 'distance') {
      result.sort((a, b) => {
        const distanceA = a.distance || Number.MAX_VALUE;
        const distanceB = b.distance || Number.MAX_VALUE;
        return distanceA - distanceB; // Tri croissant (plus proche au plus loin)
      });
    } 
    // Tri par date (plus récent en premier)
    else {
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Toujours du plus récent au plus ancien
      });
    }

    return result;
  }, [reports, filters.category, filters.city, filters.sortOrder]);

  // Nombre de filtres actifs (pour l'affichage d'un badge)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'Tous') count++;
    if (filters.city !== null) count++;
    // Ne considérer le tri que comme filtre actif si "Plus récent" est sélectionné (et pas le tri par défaut "Plus proche")
    if (filters.sortOrder !== 'distance') count++;
    return count;
  }, [filters.category, filters.city, filters.sortOrder]);

  return {
    filters,
    filteredReports,
    updateFilter,
    resetFilters,
    activeFiltersCount
  };
}