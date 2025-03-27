import { ImagePickerAsset } from 'expo-image-picker';

/**
 * Interface unifiée pour les photos dans l'application
 */
export interface Photo {
  /** Identifiant unique de la photo (serveur) */
  id: string;
  /** URL de la photo sur le serveur */
  url?: string;
  /** URI local de la photo */
  uri?: string;
  /** Type MIME de la photo */
  type?: string;
  /** Si la photo est une photo de profil */
  isProfile?: boolean;
  /** Nom du fichier */
  fileName?: string;
  /** Taille du fichier en octets */
  fileSize?: number;
  /** Largeur de l'image en pixels */
  width?: number;
  /** Hauteur de l'image en pixels */
  height?: number;
  
}

/**
 * Type pour gérer les assets photo provenant de l'image picker
 */
export type PhotoAsset = ImagePickerAsset | { uri: string; [key: string]: any };