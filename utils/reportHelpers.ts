import axios from "axios";
const MY_URL = process.env.MY_URL;

export const typeLabels: { [key: string]: string } = {
    danger: 'Danger  ⚠️',
    travaux: 'Travaux  🚧',
    nuisance: 'Nuisance 😡',
    pollution: 'Pollution  🌍',
    reparation: 'Réparation  ⚙️',
  };
  
  export const typeColors: { [key: string]: string } = {
    danger: '#FF4C4C',
    travaux: '#FFA500',
    nuisance: '#B4A0E5',
    pollution: '#32CD32',
    reparation: '#1E90FF',
  };
  
  export const getTypeLabel = (type: string): string => {
    return typeLabels[type] || type;
  };
  
  export  const categories = [
    {
      name: 'Danger',
      icon: 'skull-outline' as const,
      value: 'danger',
      article: 'un danger',
      description: `Signalez tout danger pouvant affecter la sécurité des habitants :

  - Objets dangereux sur la voie publique (ex. câbles tombés, verre brisé)

  - Zones instables ou dangereuses (ex. glissements de terrain, structures menaçant de s'effondrer)

  - Situations à haut risque (ex. incendies, inondations, zones non sécurisées)`,
    },
    {
      name: 'Travaux',
      icon: 'warning-outline' as const,
      value: 'travaux',
      article: 'des travaux',
      description: `Informez sur les travaux publics ou privés susceptibles d'impacter la ville :

  - Fermetures de routes ou rues (ex. travaux de réfection, pose de réseaux souterrains)

  - Perturbations des transports ou déviations (ex. encombrements liés aux chantiers)

  - Travaux générant du bruit ou des nuisances (ex. chantiers de nuit, vibrations excessives)`,
    },
    {
      name: 'Nuisance',
      icon: 'sad-outline' as const,
      value: 'nuisance',
      article: 'une nuisance',

      description: `Rapportez toute nuisance perturbant la tranquillité de la ville :

  - Bruit excessif (ex. travaux nocturnes, fêtes bruyantes)

  - Pollution olfactive ou visuelle (ex. odeurs nauséabondes, graffiti non autorisé)

  - Comportements inappropriés (ex. regroupements bruyants, dégradations dans les espaces publics)`,
    },
    {
      name: 'Pollution',
      icon: 'leaf-outline' as const,
      value: 'pollution',
      article: 'de la pollution',
      description: `Identifiez les sources de pollution affectant l’environnement ou la santé publique :

  - Dépôts sauvages ou décharges illégales (ex. déchets abandonnés, encombrants non ramassés)

  - Émissions toxiques (ex. fumées industrielles, odeurs chimiques)

  - Pollution des ressources naturelles (ex. cours d'eau contaminés, sols pollués)`,
    },
    {
      name: 'Réparation',
      icon: 'construct-outline' as const,
      value: 'reparation',
      article: 'une réparation',
      description: `Déclarez tout problème technique ou infrastructurel nécessitant une réparation ou une maintenance urgente :

  - Pannes d'éclairage public (ex. lampadaires non fonctionnels)

  - Équipements défectueux (ex. feux tricolores en panne, mobiliers urbains endommagés)

  - Infrastructures abîmées (ex. trottoirs fissurés, routes avec nids-de-poule)

  - Espaces publics détériorés (ex. bancs cassés, panneaux de signalisation dégradés)`,
    },
  ];

  export const handleVote = async (
    reportId: number,
    userId: number,
    type: string,
    latitude: number,
    longitude: number,
    currentVotes: number | undefined,
    setVotes: React.Dispatch<React.SetStateAction<number | undefined>>
  ) => {
    try {
      // Mise à jour optimiste : mettre à jour les votes immédiatement
      const newVotes = type === "up" ? (currentVotes || 0) + 1 : (currentVotes || 0) - 1;
      setVotes(newVotes);
  
      // Appel API
      const payload = {
        reportId,
        userId,
        type,
        latitude,
        longitude,
      };
      console.log("Payload envoyé au backend :", payload);
  
      const response = await axios.post(`${MY_URL}/reports/vote`, payload);
      console.log("Réponse du backend :", response.data);
  
      // Synchroniser avec le backend si la réponse contient des votes mis à jour
      if (response.data.updatedVotes !== undefined) {
        setVotes(response.data.updatedVotes);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du vote :", error.response?.data || error);
  
      // Revenir à l'état précédent en cas d'erreur
      setVotes(currentVotes);
    }
  };
  
  
  
  
  
  
  
  
  