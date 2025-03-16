Ancienne couleur principale : 093A3E
Ancienne couleur secondaire : F7F2DE

Couleur principal : 062C41
Couleur secondaire : FFFFFC

components/
  home/
    ProfileSection/      # Informations du profil
    ReportsSection/      # Signalements à proximité 
    EventsSection/       # Événements et calendrier
    RankingSection/      # Top 10 des smarters
    CategoryReportsSection/  # Catégories de signalements
    MayorInfoSection/    # Informations de la mairie
    modals/              # Toutes les fenêtres modales
    index.ts             # Export centralisé

hooks/
  useUserProfile.ts      # Données et actions du profil
  useNearbyReports.ts    # Gestion des signalements
  useEvents.ts           # Gestion des événements
  useUserRanking.ts      # Classement des utilisateurs
  useBadge.ts            # Gestion des badges

types/
  user.types.ts          # Types des utilisateurs
  report.types.ts        # Types des signalements
  event.types.ts         # Types des événements

screens/
  HomeScreen/
    HomeScreen.tsx       # Composant principal refactorisé
    index.ts             # Point d'entrée