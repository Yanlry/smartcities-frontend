import { ImagePickerAsset } from 'expo-image-picker';

export type PhotoAsset = ImagePickerAsset | { uri: string; [key: string]: any };

export interface PhotoManagerProps {
  photos: PhotoAsset[];
  setPhotos: (photos: PhotoAsset[]) => void;
  maxPhotos?: number;
}

export interface PhotoItemProps {
  photo: ImagePickerAsset;
  onRemove: () => void;
}