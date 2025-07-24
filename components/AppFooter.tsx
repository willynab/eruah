import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, Headphones, Heart, BookOpen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AppFooterProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function AppFooter({ activeTab, onTabPress }: AppFooterProps) {
  const { colors } = useTheme();

  const tabs = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'audio', label: 'Audio', icon: Headphones },
    { id: 'prayers', label: 'Prières', icon: Heart },
    { id: 'lectio', label: 'Lectio', icon: BookOpen },
  ];

  const styles = StyleSheet.create({
    footer: {
      backgroundColor: colors.surface,
      flexDirection: 'row',
      paddingVertical: 10,
      paddingBottom: 25,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    tabLabel: {
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500' as const,
    },
    activeTab: {
      color: colors.primary,
    },
    inactiveTab: {
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}
          >
            <Icon 
              size={24} 
              color={isActive ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.tabLabel, 
                isActive ? styles.activeTab : styles.inactiveTab
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}