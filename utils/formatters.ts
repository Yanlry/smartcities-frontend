export const formatCity = (city: string): string => {
  return city
    .replace(/, France/g, '')
    .replace(/\b\d+\s+(?=(rue|avenue|allée|boulevard|place|route|chemin)\b)/gi, '')
    .replace(/\b(bis|ter|quater)\b/gi, '')
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