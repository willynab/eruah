import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Theme } from '@/types';
import { getThemeColors } from '@/constants/themes';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [theme, setTheme] = useState<Theme>('marial');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && ['marial', 'esprit', 'sombre'].includes(savedTheme)) {
        setTheme(savedTheme as Theme);
      }
    } catch (error) {
      console.log('Erreur lors du chargement du thème:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const colors = getThemeColors(theme);

  return {
    theme,
    colors,
    changeTheme,
    isLoading,
  };
});