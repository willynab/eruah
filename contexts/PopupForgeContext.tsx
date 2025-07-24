import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { PopupForge, PopupDisplay, User } from '@/types';
import { mockPopupForges, mockPopupDisplays } from '@/data/mockData';
import { useAuth } from './AuthContext';

export const [PopupForgeProvider, usePopupForge] = createContextHook(() => {
  const [popups, setPopups] = useState<PopupForge[]>(mockPopupForges);
  const [displays, setDisplays] = useState<PopupDisplay[]>(mockPopupDisplays);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedPopups = await AsyncStorage.getItem('popupForges');
      const savedDisplays = await AsyncStorage.getItem('popupDisplays');
      
      if (savedPopups) {
        setPopups(JSON.parse(savedPopups));
      }
      if (savedDisplays) {
        setDisplays(JSON.parse(savedDisplays));
      }
    } catch (error) {
      console.log('Erreur lors du chargement des popups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePopups = async (newPopups: PopupForge[]) => {
    try {
      await AsyncStorage.setItem('popupForges', JSON.stringify(newPopups));
      setPopups(newPopups);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des popups:', error);
    }
  };

  const saveDisplays = async (newDisplays: PopupDisplay[]) => {
    try {
      await AsyncStorage.setItem('popupDisplays', JSON.stringify(newDisplays));
      setDisplays(newDisplays);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des affichages:', error);
    }
  };

  const createPopup = async (popupData: Omit<PopupForge, 'id' | 'analytics' | 'createdAt' | 'updatedAt'>) => {
    const newPopup: PopupForge = {
      ...popupData,
      id: Date.now().toString(),
      analytics: {
        impressions: 0,
        clicks: 0,
        dismissals: 0,
        conversions: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPopups = [...popups, newPopup];
    await savePopups(updatedPopups);
    return newPopup;
  };

  const updatePopup = async (id: string, updates: Partial<PopupForge>) => {
    const updatedPopups = popups.map(popup =>
      popup.id === id
        ? { ...popup, ...updates, updatedAt: new Date().toISOString() }
        : popup
    );
    await savePopups(updatedPopups);
  };

  const deletePopup = async (id: string) => {
    const updatedPopups = popups.filter(popup => popup.id !== id);
    await savePopups(updatedPopups);
  };

  const shouldDisplayPopup = (popup: PopupForge, currentPage: string): boolean => {
    if (!currentUser || popup.status !== 'active') return false;

    const now = new Date();
    const startDate = new Date(popup.displayConditions.startDate);
    const endDate = popup.displayConditions.endDate ? new Date(popup.displayConditions.endDate) : null;

    // Vérifier les dates
    if (now < startDate || (endDate && now > endDate)) return false;

    // Vérifier les pages
    if (popup.displayConditions.pages && !popup.displayConditions.pages.includes(currentPage)) return false;

    // Vérifier les rôles
    if (popup.displayConditions.userRoles && !popup.displayConditions.userRoles.includes(currentUser.role)) return false;

    // Vérifier l'âge du compte
    if (popup.displayConditions.minUserAge) {
      const userAge = Math.floor((now.getTime() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (userAge < popup.displayConditions.minUserAge) return false;
    }

    // Vérifier l'audience cible
    const userAge = Math.floor((now.getTime() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    switch (popup.targetAudience) {
      case 'new_users':
        if (userAge > 7) return false;
        break;
      case 'active_users':
        if (userAge < 7) return false;
        break;
      case 'admins':
        if (currentUser.role !== 'admin') return false;
        break;
      case 'moderators':
        if (currentUser.role !== 'moderator') return false;
        break;
      case 'users':
        if (currentUser.role !== 'user') return false;
        break;
    }

    // Vérifier la fréquence d'affichage
    const userDisplays = displays.filter(d => d.popupId === popup.id && d.userId === currentUser.id);
    
    if (popup.displayConditions.displayFrequency === 'once' && userDisplays.length > 0) {
      return false;
    }

    if (popup.displayConditions.maxDisplayCount && userDisplays.length >= popup.displayConditions.maxDisplayCount) {
      return false;
    }

    if (popup.displayConditions.displayFrequency === 'daily') {
      const today = new Date().toDateString();
      const todayDisplays = userDisplays.filter(d => new Date(d.displayedAt).toDateString() === today);
      if (todayDisplays.length > 0) return false;
    }

    if (popup.displayConditions.displayFrequency === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentDisplays = userDisplays.filter(d => new Date(d.displayedAt) > weekAgo);
      if (recentDisplays.length > 0) return false;
    }

    return true;
  };

  const getPopupsForPage = (currentPage: string): PopupForge[] => {
    return popups
      .filter(popup => shouldDisplayPopup(popup, currentPage))
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  };

  const recordDisplay = async (popupId: string) => {
    if (!currentUser) return;

    const newDisplay: PopupDisplay = {
      id: Date.now().toString(),
      popupId,
      userId: currentUser.id,
      displayedAt: new Date().toISOString(),
      dismissed: false,
      clicked: false,
    };

    const updatedDisplays = [...displays, newDisplay];
    await saveDisplays(updatedDisplays);

    // Mettre à jour les analytics
    const updatedPopups = popups.map(popup =>
      popup.id === popupId
        ? {
            ...popup,
            analytics: {
              ...popup.analytics,
              impressions: popup.analytics.impressions + 1,
            },
          }
        : popup
    );
    await savePopups(updatedPopups);
  };

  const recordDismissal = async (popupId: string) => {
    if (!currentUser) return;

    const updatedDisplays = displays.map(display =>
      display.popupId === popupId && display.userId === currentUser.id && !display.dismissed
        ? {
            ...display,
            dismissed: true,
            dismissedAt: new Date().toISOString(),
          }
        : display
    );
    await saveDisplays(updatedDisplays);

    // Mettre à jour les analytics
    const updatedPopups = popups.map(popup =>
      popup.id === popupId
        ? {
            ...popup,
            analytics: {
              ...popup.analytics,
              dismissals: popup.analytics.dismissals + 1,
            },
          }
        : popup
    );
    await savePopups(updatedPopups);
  };

  const recordClick = async (popupId: string, action?: string) => {
    if (!currentUser) return;

    const updatedDisplays = displays.map(display =>
      display.popupId === popupId && display.userId === currentUser.id && !display.clicked
        ? {
            ...display,
            clicked: true,
            clickedAt: new Date().toISOString(),
            action,
          }
        : display
    );
    await saveDisplays(updatedDisplays);

    // Mettre à jour les analytics
    const updatedPopups = popups.map(popup =>
      popup.id === popupId
        ? {
            ...popup,
            analytics: {
              ...popup.analytics,
              clicks: popup.analytics.clicks + 1,
              conversions: action === 'navigate' || action === 'external_link' 
                ? popup.analytics.conversions + 1 
                : popup.analytics.conversions,
            },
          }
        : popup
    );
    await savePopups(updatedPopups);
  };

  const getAnalytics = (popupId: string) => {
    const popup = popups.find(p => p.id === popupId);
    if (!popup) return null;

    const popupDisplays = displays.filter(d => d.popupId === popupId);
    const clickRate = popup.analytics.impressions > 0 
      ? (popup.analytics.clicks / popup.analytics.impressions * 100).toFixed(1)
      : '0';
    const conversionRate = popup.analytics.clicks > 0
      ? (popup.analytics.conversions / popup.analytics.clicks * 100).toFixed(1)
      : '0';

    return {
      ...popup.analytics,
      clickRate: `${clickRate}%`,
      conversionRate: `${conversionRate}%`,
      totalDisplays: popupDisplays.length,
    };
  };

  return {
    popups,
    displays,
    isLoading,
    createPopup,
    updatePopup,
    deletePopup,
    getPopupsForPage,
    recordDisplay,
    recordDismissal,
    recordClick,
    getAnalytics,
  };
});