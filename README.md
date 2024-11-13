
frontend/
├── assets/                    # Images, icônes, et autres fichiers statiques
│   ├── icons/
│   ├── images/
│   └── fonts/
├── components/                # Composants réutilisables
│   ├── Button.tsx             # Composant Button
│   ├── Card.tsx               # Composant Card
│   ├── Header.tsx             # Composant Header
│   └── Modal.tsx              # Composant Modal
├── hooks/                     # Hooks personnalisés
│   ├── useLocation.ts         # Hook pour la géolocalisation
│   ├── useFetch.ts            # Hook pour les requêtes API
│   └── useAuth.ts             # Hook pour la gestion de l'authentification
├── navigation/                # Configuration de la navigation
│   ├── MainNavigator.tsx      # Navigation principale
│   └── AuthNavigator.tsx      # Navigation pour les écrans d'authentification
├── screens/                   # Écrans principaux
│   ├── HomeScreen.tsx         # Écran d'accueil
│   ├── ReportScreen.tsx       # Écran de signalement
│   ├── EventsScreen.tsx       # Écran des événements
│   ├── ProfileScreen.tsx      # Profil de l'utilisateur
│   └── Auth/                  # Sous-dossier pour l'authentification
│       ├── LoginScreen.tsx    # Page de login
│       └── RegisterScreen.tsx # Page d'enregistrement
├── services/                  # Logique d'interaction avec l'API backend
│   ├── api.ts                 # Configurer Axios
│   ├── authService.ts         # Authentification
│   ├── reportService.ts       # Signalements
│   └── eventService.ts        # Événements
├── store/                     # Gestion de l'état (Redux ou Context)
│   ├── actions/
│   ├── reducers/
│   └── store.ts               # Store Redux ou Context
├── utils/                     # Fonctions utilitaires
│   ├── formatDate.ts          # Fonction pour formater une date
│   ├── calculateDistance.ts   # Fonction pour la distance
│   └── constants.ts           # Constantes globales
├── App.tsx                    # Entrée principale
├── app.json                   # Configuration du projet Expo
└── package.json               # Dépendances et scripts
