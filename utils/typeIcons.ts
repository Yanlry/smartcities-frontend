export const typeIcons = {
  events: {
    icon: require("../assets/icons/event.png"),
    label: "Événements",
  },
  danger: {
    icon: require("../assets/icons/danger.png"),
    label: "Danger",
  },
  travaux: {
    icon: require("../assets/icons/travaux.png"),
    label: "Travaux",
  },
  nuisance: {
    icon: require("../assets/icons/nuisance.png"),
    label: "Nuisance",
  },
  pollution: {
    icon: require("../assets/icons/pollution.png"),
    label: "Pollution",
  },
  reparation: {
    icon: require("../assets/icons/reparation.png"),
    label: "Réparation",
  },
} as const; // ✅ important : rend les clés littérales et immuables

export type TypeIconKey = keyof typeof typeIcons;
// => "events" | "danger" | "travaux" | "nuisance" | "pollution" | "reparation"

export const getTypeIcon = (type: string) => {
  const key = type.toLowerCase() as TypeIconKey;
  return typeIcons[key]?.icon || null;
};
