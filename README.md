# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.



smartcities-frontend/
├── assets/                  # Images, icônes, et autres fichiers statiques
│   ├── icons/
│   ├── images/
│   └── fonts/
├── components/              # Composants réutilisables dans toute l'application
│   ├── Button.js
│   ├── Card.js
│   ├── Header.js
│   └── Modal.js
├── hooks/                   # Hooks personnalisés pour la logique réutilisable
│   ├── useLocation.js       # Exemple : Hook pour gérer la géolocalisation
│   ├── useFetch.js          # Exemple : Hook pour les requêtes API
│   └── useAuth.js           # Exemple : Hook pour la gestion de l'authentification
├── navigation/              # Configuration de la navigation
│   ├── MainNavigator.js     # Navigation principale de l'application
│   └── AuthNavigator.js     # Navigation pour les écrans d'authentification
├── screens/                 # Écrans principaux de l'application
│   ├── HomeScreen.js
│   ├── ReportScreen.js      # Écran de signalement d’un problème
│   ├── EventsScreen.js      # Écran pour consulter les événements
│   ├── ProfileScreen.js     # Profil de l'utilisateur
│   └── Auth/                # Sous-dossier pour les écrans d'authentification
│       ├── LoginScreen.js
│       └── RegisterScreen.js
├── services/                # Logique d'interaction avec l'API backend
│   ├── api.js               # Configurer Axios pour les appels API
│   ├── authService.js       # Gestion des requêtes liées à l'authentification
│   ├── reportService.js     # Gestion des requêtes liées aux signalements
│   └── eventService.js      # Gestion des requêtes liées aux événements
├── store/                   # Gestion globale de l'état (si nécessaire, ex : Redux ou Context)
│   ├── actions/
│   ├── reducers/
│   └── store.js
├── utils/                   # Fonctions utilitaires
│   ├── formatDate.js
│   ├── calculateDistance.js # Fonction pour calculer la distance entre deux points GPS
│   └── constants.js         # Constantes globales de l'application
├── App.js                   # Entrée principale de l'application
├── app.json                 # Configuration du projet Expo
└── package.json             # Dépendances et scripts du projet
