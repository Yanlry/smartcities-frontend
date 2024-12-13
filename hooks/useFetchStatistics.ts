import { useState, useEffect } from "react";

const categoryLabelsMap: { [key: string]: string } = {
  pollution: "Pollution",
  danger: "Danger",
  travaux: "Travaux",
  reparation: "Réparation",
  nuisance: "Nuisance",
};

export const useFetchStatistics = (apiUrl: string) => {
  const [data, setData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données");
          }
          const result = await response.json();
      
          const labels = result.map((item: { label: string }) => categoryLabelsMap[item.label] || item.label);
          const values = result.map((item: { count: number }) => item.count);
      
          console.log("Labels :", labels);
          console.log("Values :", values);
      
          setData({
            labels, // Les noms des catégories
            datasets: [{ data: values }], // Les valeurs des catégories
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      

    fetchStatistics();
  }, [apiUrl]);

  return { data, loading, error };
};
