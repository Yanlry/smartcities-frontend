export const formatCity = (city: string): string => {
    return city
      .replace(/, France/g, '')
      .replace(/\d+/g, '')
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