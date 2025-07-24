import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          await AsyncStorage.removeItem('currentUser');
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      // Vérifier d'abord la session Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        // Fallback : vérifier AsyncStorage
        const savedUser = await AsyncStorage.getItem('currentUser');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
        }
      }
    } catch (error) {
      console.log('Erreur lors de la vérification de l\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (userProfile) {
        const user: User = {
          id: userProfile.id,
          username: userProfile.username || userProfile.email.split('@')[0],
          fullName: userProfile.full_name || `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Utilisateur',
          email: userProfile.email,
          role: userProfile.role || 'user',
          createdAt: userProfile.created_at,
          stats: userProfile.stats || {
            listeningTime: 0,
            favoritePrayers: 0,
            lectioSessions: 0,
            intentionsSubmitted: 0,
            intentionsAnswered: 0,
          },
        };

        setCurrentUser(user);
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      }
    } catch (error) {
      console.log('Erreur lors du chargement du profil utilisateur:', error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Convertir le username en email
      const email = username.includes('@') ? username : `${username}@espaceruah.fr`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Erreur de connexion:', error.message);
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.log('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const register = async (fullName: string, username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Créer l'email automatiquement
      const email = `${username}@espaceruah.fr`;

      // Vérifier si l'utilisateur existe déjà (avec gestion d'erreur améliorée)
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle(); // Utiliser maybeSingle() pour éviter l'erreur si aucun résultat

      if (existingUser) {
        console.log('Nom d\'utilisateur déjà pris');
        return { success: false, error: 'Nom d\'utilisateur déjà pris' };
      }

      // Créer le compte Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
        },
      });

      if (error) {
        console.log('Erreur d\'inscription Supabase:', error.message);
        
        // Gestion des erreurs spécifiques
        if (error.message.includes('Email signups are disabled')) {
          return { success: false, error: 'Les inscriptions par email sont désactivées. Contactez l\'administrateur.' };
        }
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'Un compte existe déjà avec cette adresse email.' };
        }
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        // IMPORTANT: Utiliser l'ID de auth.users, pas un UUID généré
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id, // Ceci doit correspondre à l'ID dans auth.users
            username,
            full_name: fullName,
            email,
            first_name: fullName.split(' ')[0] || fullName,
            last_name: fullName.split(' ').slice(1).join(' ') || null,
            role: 'user',
            stats: {
              listeningTime: 0,
              favoritePrayers: 0,
              lectioSessions: 0,
              intentionsSubmitted: 0,
              intentionsAnswered: 0,
            },
          });

        if (profileError) {
          console.log('Erreur de création du profil:', profileError);
          return { success: false, error: `Erreur lors de la création du profil: ${profileError.message}` };
        }

        // Charger le profil utilisateur
        await loadUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Erreur inconnue lors de l\'inscription' };
    } catch (error) {
      console.log('Erreur lors de l\'inscription:', error);
      return { success: false, error: 'Erreur technique lors de l\'inscription' };
    }
  };

  // Version compatible avec l'interface précédente
  const registerLegacy = async (fullName: string, username: string, password: string): Promise<boolean> => {
    const result = await register(fullName, username, password);
    return result.success;
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log('Erreur lors de la déconnexion Supabase:', error.message);
      }

      // Nettoyer le state local
      setCurrentUser(null);
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.log('Erreur lors de la déconnexion:', error);
    }
  };

  const updateUserStats = async (stats: Partial<User['stats']>) => {
    if (!currentUser) return;

    try {
      const updatedStats = { ...currentUser.stats, ...stats };

      // Mettre à jour dans Supabase
      const { error } = await supabase
        .from('users')
        .update({ stats: updatedStats })
        .eq('id', currentUser.id);

      if (error) {
        console.log('Erreur de mise à jour des stats dans Supabase:', error.message);
        return;
      }

      // Mettre à jour le state local
      const updatedUser = {
        ...currentUser,
        stats: updatedStats,
      };

      setCurrentUser(updatedUser);
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Erreur lors de la mise à jour des stats:', error);
    }
  };

  const resetPassword = async (username: string): Promise<boolean> => {
    try {
      const email = username.includes('@') ? username : `${username}@espaceruah.fr`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password', // Configurez selon votre app
      });

      if (error) {
        console.log('Erreur de réinitialisation du mot de passe:', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.log('Erreur lors de la réinitialisation du mot de passe:', error);
      return false;
    }
  };

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register: registerLegacy, // Version compatible
    registerWithDetails: register, // Version avec détails d'erreur
    logout,
    updateUserStats,
    resetPassword,
  };
});