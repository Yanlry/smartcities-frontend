export const formatCity = (city: string): string => {
  return city
    // Supprime ", France" si présent
    .replace(/, France/g, '')
    // Supprime les numéros uniquement lorsqu'ils précèdent des mots comme "rue", "avenue", etc.
    .replace(/\b\d+\s+(?=(rue|avenue|allée|boulevard|place|route|chemin)\b)/gi, '')
    // Supprime "bis", "ter", "quater", insensible à la casse
    .replace(/\b(bis|ter|quater)\b/gi, '')
    // Remplace les espaces multiples par un seul espace
    .replace(/\s{2,}/g, ' ')
    // Supprime les espaces inutiles en début et fin
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