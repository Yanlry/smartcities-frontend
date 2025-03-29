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

// Interface for user stats
interface UserStats {
  numberOfReports: number;
  trustRate: number;
  numberOfVotes: number;
  numberOfComments: number;
  numberOfEventsCreated: number;
  numberOfPosts: number;
  numberOfEventsAttended: number;
  votes: {
    type: 'up' | 'down';
    reportId: number;
    createdAt: string;
  }[];
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

  // Transform votes array to voteSummary format
  const transformVotes = (votes: UserStats['votes']): VoteSummary => {
    const summary = { up: 0, down: 0 };
    
    if (!votes || !Array.isArray(votes)) {
      return summary;
    }
    
    // Count up and down votes
    votes.forEach(vote => {
      if (vote.type === 'up') summary.up += 1;
      if (vote.type === 'down') summary.down += 1;
    });
    
    return summary;
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

      // Fetch user stats which includes votes
      try {
        console.log(`Fetching user stats from ${API_URL}/users/stats/${userId}`);
        const statsResponse = await axios.get<UserStats>(`${API_URL}/users/stats/${userId}`);
        
        if (statsResponse.data && statsResponse.data.votes) {
          // Transform votes to summary format
          const summary = transformVotes(statsResponse.data.votes);
          console.log('Transformed vote summary:', summary);
          setVoteSummary(summary);
        } else {
          console.log('No votes data in stats response, using defaults');
          setVoteSummary({ up: 0, down: 0 });
        }
      } catch (statsError: any) {
        console.error('Error fetching user stats:', statsError);
        
        if (statsError.response && statsError.response.status === 404) {
          console.log('Stats endpoint not found, using default votes');
          setVoteSummary({ up: 0, down: 0 });
        } else {
          // Keep existing vote summary in case of other errors
          console.error('Unexpected error fetching stats:', statsError);
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
    if (!user) return;
    
    try {
      const response = await fetch(`${API_URL}/users/display-preference`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          useFullName
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la préférence.");
      }

      setUser((prevUser) => ({
        ...prevUser!,
        useFullName
      }));
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la préférence", error);
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