import { User } from '@/types';

export const mockUsers: User[] = [];

// Fonction pour vérifier les identifiants - maintenant gérée par Supabase
export const validateCredentials = (username: string, password: string): User | null => {
  // Cette fonction est maintenant obsolète - l'authentification se fait via Supabase
  return null;
};

// Fonction pour changer le mot de passe - maintenant gérée par Supabase
export const changePassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
  // Cette fonction est maintenant obsolète - le changement de mot de passe se fait via Supabase
  return false;
};

// Fonction pour créer un nouvel utilisateur
export const createUser = (userData: { fullName: string; username: string; role: 'admin' | 'user' | 'moderator' }): User => {
  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    username: userData.username,
    fullName: userData.fullName,
    email: `${userData.username}@espaceruah.fr`,
    role: userData.role,
    isActive: true,
    createdAt: new Date().toISOString(),
    stats: {
      listeningTime: 0,
      favoritePrayers: 0,
      lectioSessions: 0,
      intentionsSubmitted: 0,
      intentionsAnswered: 0,
    },
  };
  
  mockUsers.push(newUser);
  return newUser;
};

// Fonction pour mettre à jour un utilisateur
export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;
  
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
  return mockUsers[userIndex];
};

// Fonction pour supprimer un utilisateur
export const deleteUser = (userId: string): boolean => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) return false;
  
  mockUsers.splice(userIndex, 1);
  return true;
};

// Fonction pour réinitialiser le mot de passe
export const resetPassword = (userId: string): string => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return '';
  
  const tempPassword = `temp${Math.random().toString(36).substring(2, 8)}`;
  console.log(`Mot de passe temporaire généré pour ${user.username}: ${tempPassword}`);
  return tempPassword;
};