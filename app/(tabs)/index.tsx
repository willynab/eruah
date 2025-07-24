import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import LoadingSpinner from '@/components/LoadingSpinner';
import AuthScreen from '@/screens/AuthScreen';
import HomeScreen from '@/screens/HomeScreen';
import AudioScreen from '@/screens/AudioScreen';
import PrayersScreen from '@/screens/PrayersScreen';
import LectioScreen from '@/screens/LectioScreen';
import AboutScreen from '@/screens/AboutScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import NewsScreen from '@/screens/NewsScreen';
import IntentionsScreen from '@/screens/IntentionsScreen';
import AdminScreen from '@/screens/AdminScreen';

export default function MainApp() {
  const { colors, isLoading: themeLoading } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showIntentions, setShowIntentions] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  if (themeLoading || authLoading) {
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors?.background || '#ffffff'
      }}>
        <LoadingSpinner size={60} />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });



  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (showProfile) {
    return <ProfileScreen onBack={() => setShowProfile(false)} />;
  }

  if (showNews) {
    return <NewsScreen onBack={() => setShowNews(false)} />;
  }

  if (showIntentions) {
    return <IntentionsScreen onBack={() => setShowIntentions(false)} />;
  }

  if (showAdmin) {
    return <AdminScreen onBack={() => setShowAdmin(false)} />;
  }

  if (showAbout) {
    return <AboutScreen onBack={() => setShowAbout(false)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={(screen) => {
          if (screen === 'news') {
            setShowNews(true);
          } else if (screen === 'intentions') {
            setShowIntentions(true);
          } else if (screen === 'admin') {
            setShowAdmin(true);
          } else {
            setActiveTab(screen);
          }
        }} />;
      case 'audio':
        return <AudioScreen />;
      case 'prayers':
        return <PrayersScreen />;
      case 'lectio':
        return <LectioScreen />;
      default:
        return <HomeScreen onNavigate={(screen) => {
          if (screen === 'news') {
            setShowNews(true);
          } else if (screen === 'intentions') {
            setShowIntentions(true);
          } else if (screen === 'admin') {
            setShowAdmin(true);
          } else {
            setActiveTab(screen);
          }
        }} />;
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        onSearchPress={() => console.log('Recherche')}
        onNotificationPress={() => console.log('Notifications')}
        onProfilePress={() => setShowProfile(true)}
        onNewsPress={() => setShowNews(true)}
        onIntentionsPress={() => setShowIntentions(true)}
        onAdminPress={() => setShowAdmin(true)}
        onAboutPress={() => setShowAbout(true)}
      />
      
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      <AppFooter 
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  );
}