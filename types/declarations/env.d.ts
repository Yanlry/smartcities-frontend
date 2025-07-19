// types/declarations/env.d.ts

/**
 * Interface pour les variables d'environnement SmartCities
 * Garantit la type-safety et documente toutes les clés d'API requises
 */
interface SmartCitiesEnvironment {
  /** URL de base de l'API backend SmartCities */
  readonly API_URL: string;
  
  /** Clé API Pulse pour les services de données en temps réel */
  readonly PULSE_API_KEY: string;
  
  /** Clé API SendGrid pour l'envoi d'emails transactionnels */
  readonly SENDGRID_API_KEY: string;
  
  /** Clé API OpenCage pour le géocodage des adresses */
  readonly OPEN_CAGE_API_KEY: string;
  
  /** URL de connexion à la base de données PostgreSQL */
  readonly DATABASE_URL: string;
  
  /** Clé API OpenRouteService pour le calcul d'itinéraires */
  readonly ORS_API_KEY: string;
  
  /** Identifiant d'accès AWS pour le stockage S3 */
  readonly AWS_ACCESS_KEY_ID: string;
  
  /** Clé secrète AWS pour l'authentification S3 */
  readonly AWS_SECRET_ACCESS_KEY: string;
  
  /** Région AWS pour les services de stockage */
  readonly AWS_REGION: string;
  
  /** Nom du bucket S3 pour le stockage des médias */
  readonly AWS_BUCKET_NAME: string;
}

/**
 * Module @env - Configuration Babel pour react-native-dotenv
 * Permet l'importation type-safe des variables d'environnement
 */
declare module '@env' {
  const API_URL: SmartCitiesEnvironment['API_URL'];
  const PULSE_API_KEY: SmartCitiesEnvironment['PULSE_API_KEY'];
  const SENDGRID_API_KEY: SmartCitiesEnvironment['SENDGRID_API_KEY'];
  const OPEN_CAGE_API_KEY: SmartCitiesEnvironment['OPEN_CAGE_API_KEY'];
  const DATABASE_URL: SmartCitiesEnvironment['DATABASE_URL'];
  const ORS_API_KEY: SmartCitiesEnvironment['ORS_API_KEY'];
  const AWS_ACCESS_KEY_ID: SmartCitiesEnvironment['AWS_ACCESS_KEY_ID'];
  const AWS_SECRET_ACCESS_KEY: SmartCitiesEnvironment['AWS_SECRET_ACCESS_KEY'];
  const AWS_REGION: SmartCitiesEnvironment['AWS_REGION'];
  const AWS_BUCKET_NAME: SmartCitiesEnvironment['AWS_BUCKET_NAME'];

  export {
    API_URL,
    PULSE_API_KEY,
    SENDGRID_API_KEY,
    OPEN_CAGE_API_KEY,
    DATABASE_URL,
    ORS_API_KEY,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_BUCKET_NAME,
  };
}

/**
 * Module react-native-dotenv - Support direct du package
 * Évite les erreurs TypeScript lors de l'importation directe
 */
declare module 'react-native-dotenv' {
  const API_URL: SmartCitiesEnvironment['API_URL'];
  const PULSE_API_KEY: SmartCitiesEnvironment['PULSE_API_KEY'];
  const SENDGRID_API_KEY: SmartCitiesEnvironment['SENDGRID_API_KEY'];
  const OPEN_CAGE_API_KEY: SmartCitiesEnvironment['OPEN_CAGE_API_KEY'];
  const DATABASE_URL: SmartCitiesEnvironment['DATABASE_URL'];
  const ORS_API_KEY: SmartCitiesEnvironment['ORS_API_KEY'];
  const AWS_ACCESS_KEY_ID: SmartCitiesEnvironment['AWS_ACCESS_KEY_ID'];
  const AWS_SECRET_ACCESS_KEY: SmartCitiesEnvironment['AWS_SECRET_ACCESS_KEY'];
  const AWS_REGION: SmartCitiesEnvironment['AWS_REGION'];
  const AWS_BUCKET_NAME: SmartCitiesEnvironment['AWS_BUCKET_NAME'];

  export {
    API_URL,
    PULSE_API_KEY,
    SENDGRID_API_KEY,
    OPEN_CAGE_API_KEY,
    DATABASE_URL,
    ORS_API_KEY,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,
    AWS_BUCKET_NAME,
  };
}