declare namespace NodeJS {
  interface ProcessEnv {
    ORS_API_KEY: string;
    DATABASE_URL: string;
    OPEN_CAGE_API_KEY: string;
    SENDGRID_API_KEY: string;
    PULSE_API_KEY: string;
    MY_URL: string;
    // Ajoutez d'autres variables d'environnement si nécessaires
  }
}