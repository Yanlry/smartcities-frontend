import { useState, useEffect } from "react";

const categoryLabelsMap: { [key: string]: string } = {
  pollution: "Pollution",
  danger: "Danger",
  travaux: "Travaux",
  reparation: "Reparation",
  nuisance: "Nuisance",
};

export const useFetchStatistics = (apiUrl: string, nomCommune: string) => {
  const [data, setData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}?nomCommune=${nomCommune}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const result = await response.json();


        const labels = result.map((item: { label: string }) => categoryLabelsMap[item.label] || item.label);
        const values = result.map((item: { count: number }) =>
          typeof item.count === "number" && !isNaN(item.count) ? item.count : 0
        );

        setData({
          labels,
          datasets: [{ data: values }],
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (nomCommune) {
      fetchStatistics();
    }
  }, [apiUrl, nomCommune]);

  return { data, loading, error };
};
