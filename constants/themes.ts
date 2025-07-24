import { ThemeColors } from '@/types';

export const themes: Record<string, ThemeColors> = {
  marial: {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    background: '#f8faff',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    accent: '#60a5fa',
    gradient: ['#dbeafe', '#bfdbfe'],
  },
  esprit: {
    primary: '#dc2626',
    secondary: '#ef4444',
    background: '#fef2f2',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#fecaca',
    accent: '#f87171',
    gradient: ['#fee2e2', '#fecaca'],
  },
  sombre: {
    primary: '#6b7280',
    secondary: '#9ca3af',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    accent: '#9ca3af',
    gradient: ['#1f2937', '#374151'],
  },
};

export const themeInfo = {
  marial: {
    name: 'Thème Marial',
    description: 'Bleu royal et ciel, inspiré de la Vierge Marie',
    icon: '🔵',
    preview: '#1e3a8a',
  },
  esprit: {
    name: 'Thème Esprit Saint',
    description: 'Rouge feu, symbole de l\'Esprit Saint',
    icon: '🔴',
    preview: '#dc2626',
  },
  sombre: {
    name: 'Thème Contemplation',
    description: 'Gris anthracite pour la méditation',
    icon: '🌑',
    preview: '#374151',
  },
};

export const getThemeColors = (theme: string): ThemeColors => {
  return themes[theme] || themes.marial;
};