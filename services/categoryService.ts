const API_URL = 'http://192.168.1.100:3000'; // Remplace avec ton URL

export const fetchReportsByCategory = async (category: string) => {
  try {
    const response = await fetch(`${API_URL}/reports?type=${encodeURIComponent(category)}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des signalements');
    }
    return await response.json(); // Retourne la liste des signalements filtrée
  } catch (error) {
    console.error('Erreur dans fetchReportsByCategory:', error);
    throw error; // Relance l'erreur pour la gérer dans le frontend
  }
};
