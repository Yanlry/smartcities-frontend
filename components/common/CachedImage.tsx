import React, { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

interface CachedImageProps {
  uri: string | null;
  style: any;
  placeholder?: string;
}

/**
 * Composant de chargement d'image avec cache
 */
const CachedImage: React.FC<CachedImageProps> = ({ uri, style, placeholder = "https://via.placeholder.com/150" }) => {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!uri) {
      setCachedUri(placeholder);
      setIsLoading(false);
      return;
    }

    const cacheImage = async () => {
      try {
        // Générer un nom de fichier unique basé sur l'URI
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const cacheDirectory = FileSystem.cacheDirectory;
        const cacheFilePath = cacheDirectory + filename;

        // Vérifier si l'image est déjà en cache
        const fileInfo = await FileSystem.getInfoAsync(cacheFilePath);
        
        if (fileInfo.exists) {
          // Utiliser l'image en cache
          setCachedUri(fileInfo.uri);
          setIsLoading(false);
        } else {
          // Télécharger et mettre en cache
          const downloadResult = await FileSystem.downloadAsync(uri, cacheFilePath);
          setCachedUri(downloadResult.uri);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur de mise en cache de l\'image:', error);
        setCachedUri(uri); // Fallback à l'URI original
        setIsLoading(false);
      }
    };

    cacheImage();
  }, [uri]);

  if (isLoading) {
    return <Image source={{ uri: placeholder }} style={style} />;
  }

  return <Image source={{ uri: cachedUri || placeholder }} style={style} />;
};

export default CachedImage;