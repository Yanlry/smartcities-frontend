import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {register, login} from '../services/authService';
import { useToken } from './useToken';

export function useAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState(''); 
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isRegisterClicked, setIsRegisterClicked] = useState(false);
  const { setToken, clearToken } = useToken();

    // Efface le token au démarrage, utile pour le développement
    useEffect(() => {
        clearToken();
    }, []);

    const handleLogin = async (onLogin: () => void) => {
        if (!email || !password) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs');
          return;
        }
    
        try {
          setIsLoginClicked(true);
          const lowerCaseEmail = email.toLowerCase();
          const response = await login(lowerCaseEmail, password);
    
          if (response.status === 200 || response.status === 201) {
            const { accessToken } = response.data;
            await setToken(accessToken);
            onLogin(); // Met à jour l'état de connexion
          }
        } catch (error) {
          console.error('Erreur lors de la connexion:', error);
          Alert.alert('Erreur', 'Email ou mot de passe incorrect');
        } finally {
          setIsLoginClicked(false);
        }
      };

    const handleRegister = async (onSuccess: () => void) => {
        if (!email || !password || !username|| !firstName|| !lastName) {
        Alert.alert('Erreur', 'Tous les champs doivent être remplis pour continuer');
        return;
        }

        try {
        setIsRegisterClicked(true);
        const response = await register(email, password, username, firstName, lastName);

        if (response.status === 201) {
            Alert.alert('Succès', 'Inscription réussie');
            onSuccess();
        }
        } catch (error: any) {
        if (__DEV__) {
            console.error("Erreur lors de l'inscription:", error);
        }

        if (error.response) {
            if (error.response.status === 409) {
            Alert.alert('Erreur', error.response.data.message);
            } else {
            Alert.alert('Erreur', error.response.data.message || "Une erreur est survenue lors de l'inscription");
            }
        } else {
            Alert.alert('Erreur', "Une erreur réseau est survenue, veuillez vérifier votre connexion");
        }
        } finally {
        setIsRegisterClicked(false);
        }
    };

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    lastName,
    setLastName,
    firstName,
    setFirstName,
    isLoginClicked,
    isRegisterClicked,
    handleLogin,
    handleRegister,
  };
}
