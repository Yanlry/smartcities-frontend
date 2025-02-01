export const formatCity = (city: string): string => {
  return city
    .replace(/, France/g, '') 
    .replace(/^\s*\d+\s*(bis|ter|quater|b|c|t|a|d|e|f)?\s+/gi, '')  
    .replace(/\b(bis|ter|quater|b|c|t|a|d|e|f)\b/gi, '')  
    .replace(/\s{2,}/g, ' ')  
    .trim();
};
  export const formatDate = (date: string | Date): string => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };