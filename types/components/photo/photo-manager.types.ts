import { Photo } from '../../entities/photo.types'; // Modification d'import

/**
 * Props pour le composant PhotoManager
 */
export interface PhotoManagerProps {
  /** Liste des photos à gérer */
  photos: Photo[]; // Modification du type
  /** Fonction pour mettre à jour les photos */
  setPhotos: (photos: Photo[]) => void; // Modification du type des paramètres
  /** Nombre maximum de photos autorisé */
  maxPhotos?: number;
}

/**
 * Props pour le composant PhotoItem
 */
export interface PhotoItemProps {
  /** Photo à afficher */
  photo: Photo; // Modification du type
  /** Fonction pour supprimer la photo */
  onRemove: () => void;
}