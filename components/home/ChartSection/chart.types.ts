export interface ChartProps {
    data: {
      labels: string[];
      datasets: { data: number[] }[];
    };
    loading: boolean;
    nomCommune: string;
    controlStatsVisibility?: boolean;
  }