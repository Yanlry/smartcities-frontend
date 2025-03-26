export const typeIcons = {
  events: {
    icon: require("../assets/icons/event.png"), // ✅ Ajout de l'image pour "events"
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
    label: "Reparation",
  },
  
};

export const getTypeIcon = (type: string) => {
  return typeIcons[type.toLowerCase()]?.icon || null;
};