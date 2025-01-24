// @ts-ignore
import { API_URL } from '@env';

export const fetchReportsByCategory = async (category: string) => {
  try {
    const response = await fetch(`${API_URL}/reports?type=${encodeURIComponent(category)}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des signalements');
    }
    return await response.json();  
  } catch (error) {
    console.error('Erreur dans fetchReportsByCategory:', error);
    throw error;  
  }
};
