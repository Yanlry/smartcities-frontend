/**
 * Props pour le composant Chart
 */
export interface ChartProps {
    /** Données du graphique */
    data: {
      labels: string[];
      datasets: { data: number[] }[];
    };
    /** État de chargement */
    loading: boolean;
    /** Nom de la commune concernée */
    nomCommune: string;
    /** Contrôle la visibilité des statistiques */
    controlStatsVisibility?: boolean;
  }