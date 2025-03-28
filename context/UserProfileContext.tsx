import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// @ts-ignore
import { API_URL } from '@env';

// Define User Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePhoto?: {
    url: string;
  };
  nomCommune?: string;
  codePostal?: string;
  useFullName?: boolean;
  showEmail: boolean;
  followers?: any[];
  following?: any[];
  reports?: any[];
  comments?: any[];
  posts?: any[];
  organizedEvents?: any[];
  attendedEvents?: any[];
  isSubscribed?: boolean;
  isMunicipality?: boolean;
}

interface VoteSummary {
  up: number;
  down: number;
}

interface UserProfileContextType {
  user: User | null;
  displayName: string;
  voteSummary: VoteSummary;
  loading: boolean;
  error: string | null;
  updateProfileImage: (imageUrl: string) => Promise<void>;
  updateUserDisplayPreference: (useFullName: boolean) => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserCity: (nomCommune: string, codePostal: string) => Promise<void>;
}

// Create context with default values
const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  displayName: '',
  voteSummary: { up: 0, down: 0 },
  loading: false,
  error: null,
  updateProfileImage: async () => {},
  updateUserDisplayPreference: async () => {},
  refreshUserData: async () => {},
  updateUserCity: async () => {},
});

// Custom hook to use the context
export const useUserProfile = () => useContext(UserProfileContext);

// Provider component
export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [voteSummary, setVoteSummary] = useState<VoteSummary>({ up: 0, down: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Compute display name from user data
  const displayName = user 
    ? user.useFullName 
      ? `${user.firstName} ${user.lastName}` 
      : user.username
    : '';

  // Get user ID from storage
  const getUserIdFromToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  };

  // Function to refresh user data
  const refreshUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await getUserIdFromToken();
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Fetch user data
      const response = await axios.get(`${API_URL}/users/${userId}`);
      setUser(response.data);

      // Fetch vote summary
      try {
        const voteResponse = await axios.get(`${API_URL}/users/votes/${userId}`);
        setVoteSummary(voteResponse.data);
      } catch (voteError: any) {
        if (voteError.response && voteError.response.status === 404) {
          // 没 de résumé, initialiser par défaut
          setVoteSummary({ up: 0, down: 0 });
        } else {
          console.error('Error fetching vote summary:', voteError);
          setVoteSummary({ up: 0, down: 0 });
        }
      }

    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile image
  const updateProfileImage = async (imageUrl: string) => {
    try {
      if (!user?.id) return;

      // This is a placeholder - you'll need to implement the actual image upload logic
      // For now, just refreshing the user data
      await refreshUserData();
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  // Update user display preference
  const updateUserDisplayPreference = async (useFullName: boolean) => {
    try {
      if (!user?.id) return;

      await axios.put(`${API_URL}/users/${user.id}`, {
        useFullName,
      });

      setUser(prev => prev ? { ...prev, useFullName } : null);
    } catch (error) {
      console.error('Error updating display preference:', error);
    }
  };

  // Update user city - key function for fixing the city update issue
  const updateUserCity = async (nomCommune: string, codePostal: string) => {
    try {
      if (!user?.id) return;

      await axios.put(`${API_URL}/users/${user.id}`, {
        nomCommune,
        codePostal,
      });

      // Update local state immediately to reflect changes across the app
      setUser(prev => prev ? { ...prev, nomCommune, codePostal } : null);
    } catch (error) {
      console.error('Error updating city:', error);
      throw new Error('Failed to update city');
    }
  };

  // Initial data load
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Context value
  const value = {
    user,
    displayName,
    voteSummary,
    loading,
    error,
    updateProfileImage,
    updateUserDisplayPreference,
    refreshUserData,
    updateUserCity,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};