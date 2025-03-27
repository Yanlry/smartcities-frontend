import { PhotoAsset } from '../../entities/photo.types';
import { ImagePickerAsset } from 'expo-image-picker';

/**
 * Props pour le composant PhotoManager
 */
export interface PhotoManagerProps {
  /** Liste des photos à gérer */
  photos: PhotoAsset[];
  /** Fonction pour mettre à jour les photos */
  setPhotos: (photos: PhotoAsset[]) => void;
  /** Nombre maximum de photos autorisé */
  maxPhotos?: number;
}

/**
 * Props pour le composant PhotoItem
 */
export interface PhotoItemProps {
  /** Photo à afficher */
  photo: ImagePickerAsset;
  /** Fonction pour supprimer la photo */
  onRemove: () => void;
}