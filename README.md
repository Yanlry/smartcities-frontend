
__________________________________________________________LES TYPES_________________________________________________________

types/
│
├── 📁 entities/                  // Les bases de notre application
│   ├── user.types.ts             // Qui sont nos utilisateurs
│   ├── report.types.ts           // Comment on décrit un signalement
│   ├── event.types.ts            // Comment on organise un événement
│   ├── comment.types.ts          // Comment on gère un commentaire
│   ├── photo.types.ts            // Comment on stocke une photo
│   └── index.ts                  // Liste tous nos types principaux
│
│   // Info : C'est ici qu'on définit les éléments de base
│   // Conseil : Nouveau type ? Créez un nouveau fichier ici
│
├── 📁 features/                  // Détails spécifiques à chaque partie
│   ├── profile/                  // Tout ce qui concerne le profil
│   │   ├── tabs.types.ts         // Comment sont les onglets du profil
│   │   ├── modals.types.ts       // Comment fonctionnent les fenêtres du profil
│   │   └── user.types.ts         // Détails supplémentaires sur l'utilisateur
│   ├── reports/                  // Tout sur les signalements
│   │   ├── category.types.ts     // Comment on classe les signalements
│   │   └── report.types.ts       // Détails supplémentaires sur les signalements
│   ├── events/                   // Tout sur les événements
│   │   └── creation.types.ts     // Comment on crée un événement
│   └── conversations/            // Tout sur les conversations
│       └── item.types.ts         // Comment sont les messages
│
│   // Info : Chaque fonctionnalité a ses propres détails
│   // Conseil : Nouvelle fonctionnalité ? Créez un nouveau dossier ici
│
├── 📁 components/                // Comment nos composants visuels sont construits
│   ├── common/                   // Composants utilisés partout
│   │   ├── keyboard-wrapper.types.ts
│   │   └── sidebar.types.ts
│   ├── charts/                   // Graphiques
│   │   └── chart.types.ts
│   ├── photo/                    // Gestion des photos
│   │   └── photo-manager.types.ts
│   └── index.ts                  // Liste tous nos composants
│
│   // Info : Définit l'apparence de nos éléments
│   // Conseil : Nouveau composant ? Décrivez-le ici
│
├── 📁 ui/                        // Style général de l'application
│   ├── theme.types.ts            // Couleurs et design
│   ├── animation.types.ts        // Mouvements et transitions
│   └── index.ts                  // Résume nos styles
│
│   // Info : Comment notre app va ressembler
│   // Conseil : Nouveau style ? Ajoutez-le ici
│
├── 📁 navigation/                // Comment on se déplace dans l'app
│   ├── routes.types.ts           // Liste des écrans
│   ├── params.types.ts           // Comment on passe des informations entre écrans
│   └── index.ts                  // Résume nos routes
│
│   // Info : Définit les chemins dans l'application
│   // Conseil : Nouvel écran ? Ajoutez-le ici
│
└── 📁 declarations/              // Informations techniques supplémentaires
    ├── env.d.ts                  // Paramètres secrets de l'application
    ├── maps.d.ts                 // Types pour les cartes
    ├── icons.d.ts                // Types pour les icônes
    ├── global.d.ts               // Réglages généraux
    └── index.ts                  // Résume nos paramètres techniques
    
    // Info : Configurations avancées
    // Conseil : Nouvelle librairie ? Configurez-la ici


L'idée générale est de créer une structure claire où chaque dossier a un rôle précis :

- 🏠 `entities/` : Les bases
- 🧩 `features/` : Les détails de chaque partie
- 🎨 `components/` : L'apparence visuelle
- 🌈 `ui/` : Le style général
- 🗺️ `navigation/` : Les chemins
- ⚙️ `declarations/` : Les réglages techniques

