export const hexToRgba = (hex: string, alpha: number): string => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
  
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  export const calculateOpacity = (createdAt: string, intensityFactor: number = 1): number => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  
    let baseOpacity;
    if (diffInDays < 1) baseOpacity = 0.8; // Signalement récent
    else if (diffInDays < 7) baseOpacity = 0.6; // Signalement de moins d'une semaine
    else baseOpacity = 0.4; // Signalement plus ancien
  
    // Renforce l'opacité avec un facteur d'intensité et limite à 1
    return Math.min(baseOpacity * intensityFactor, 1);
  };
  