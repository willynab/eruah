import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { usePopupForge } from '@/contexts/PopupForgeContext';
import { PopupForge } from '@/types';
import PopupForgeDisplay from './PopupForgeDisplay';

export default function PopupForgeManager() {
  const { getPopupsForPage } = usePopupForge();
  const pathname = usePathname();
  const [currentPopup, setCurrentPopup] = useState<PopupForge | null>(null);
  const [popupQueue, setPopupQueue] = useState<PopupForge[]>([]);

  useEffect(() => {
    // Convertir le pathname en nom de page
    const pageName = getPageName(pathname);
    const popups = getPopupsForPage(pageName);
    
    if (popups.length > 0) {
      setPopupQueue(popups);
      setCurrentPopup(popups[0]);
    }
  }, [pathname, getPopupsForPage]);

  const getPageName = (path: string): string => {
    if (path === '/' || path === '/(tabs)') return 'home';
    if (path.includes('/audio')) return 'audio';
    if (path.includes('/prayers')) return 'prayers';
    if (path.includes('/lectio')) return 'lectio';
    if (path.includes('/intentions')) return 'intentions';
    if (path.includes('/news')) return 'news';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/admin')) return 'admin';
    return 'home';
  };

  const handlePopupClose = () => {
    const remainingPopups = popupQueue.slice(1);
    setPopupQueue(remainingPopups);
    
    if (remainingPopups.length > 0) {
      // Délai avant d'afficher le popup suivant
      setTimeout(() => {
        setCurrentPopup(remainingPopups[0]);
      }, 500);
    } else {
      setCurrentPopup(null);
    }
  };

  if (!currentPopup) return null;

  return (
    <View>
      <PopupForgeDisplay
        popup={currentPopup}
        onClose={handlePopupClose}
      />
    </View>
  );
}