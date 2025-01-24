export const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "danger":
      return require("../assets/icons/danger.png");
    case "travaux":
      return require("../assets/icons/travaux.png");
    case "nuisance":
      return require("../assets/icons/nuisance.png");
    case "pollution":
      return require("../assets/icons/pollution.png");
    case "reparation":
      return require("../assets/icons/reparation.png");
    default:
      return null;  
  }
};
