import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Animated,
} from 'react-native';
import { Search, Bell, User, ChevronDown, Newspaper, MessageCircle, Settings, Info } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onNewsPress?: () => void;
  onIntentionsPress?: () => void;
  onAdminPress?: () => void;
  onAboutPress?: () => void;
}

export default function AppHeader({ 
  onSearchPress, 
  onNotificationPress, 
  onProfilePress,
  onNewsPress,
  onIntentionsPress,
  onAdminPress,
  onAboutPress
}: AppHeaderProps) {
  const { colors } = useTheme();
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownAnimation] = useState(new Animated.Value(0));

  const toggleDropdown = () => {
    if (showDropdown) {
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowDropdown(false));
    } else {
      setShowDropdown(true);
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleProfilePress = () => {
    setShowDropdown(false);
    onProfilePress?.();
  };

  const handleAboutPress = () => {
    setShowDropdown(false);
    onAboutPress?.();
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  const styles = StyleSheet.create({
    header: {
      backgroundColor: colors.surface,
      paddingTop: 50,
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    logoPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold' as const,
    },
    appTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: colors.primary,
    },
    profileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      position: 'relative',
    },
    profileInfo: {
      alignItems: 'flex-end',
    },
    profileName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600' as const,
      maxWidth: 80,
    },
    profileRole: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 8,
    },
    actionButton: {
      alignItems: 'center',
      padding: 8,
      minWidth: 60,
    },
    actionIcon: {
      marginBottom: 4,
    },
    actionLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '500' as const,
    },
    notificationButton: {
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.secondary,
      borderRadius: 8,
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold' as const,
    },
    dropdownOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
    },
    dropdown: {
      position: 'absolute',
      top: 90,
      right: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      minWidth: 180,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownItemLast: {
      borderBottomWidth: 0,
    },
    dropdownItemText: {
      fontSize: 16,
      color: colors.text,
    },
    dropdownItemLogout: {
      color: '#ef4444',
    },
  });

  return (
    <>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>ER</Text>
            </View>
            <Text style={styles.appTitle}>Espace Ruah</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={toggleDropdown}
          >
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {currentUser?.fullName.split(' ')[0] || 'Utilisateur'}
              </Text>
              <Text style={styles.profileRole}>
                {currentUser?.role === 'admin' ? 'Admin' : 'Membre'}
              </Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser?.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <ChevronDown 
              size={14} 
              color={colors.textSecondary}
              style={{ 
                transform: [{ 
                  rotate: showDropdown ? '180deg' : '0deg' 
                }] 
              }}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onNewsPress}>
            <View style={styles.actionIcon}>
              <Newspaper size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Actualités</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onIntentionsPress}>
            <View style={styles.actionIcon}>
              <MessageCircle size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Intentions</Text>
          </TouchableOpacity>
          
          {currentUser?.role === 'admin' && (
            <TouchableOpacity style={styles.actionButton} onPress={onAdminPress}>
              <View style={styles.actionIcon}>
                <Settings size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButton} onPress={onNotificationPress}>
            <View style={[styles.actionIcon, styles.notificationButton]}>
              <Bell size={20} color={colors.primary} />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
            <Text style={styles.actionLabel}>Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onSearchPress}>
            <View style={styles.actionIcon}>
              <Search size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Recherche</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showDropdown}
        transparent
        animationType="none"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <Animated.View
            style={[
              styles.dropdown,
              {
                opacity: dropdownAnimation,
                transform: [
                  {
                    translateY: dropdownAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                  {
                    scale: dropdownAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={handleProfilePress}
            >
              <User size={20} color={colors.text} />
              <Text style={styles.dropdownItemText}>Mon Profil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={handleAboutPress}
            >
              <Info size={20} color={colors.text} />
              <Text style={styles.dropdownItemText}>À Propos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dropdownItem, styles.dropdownItemLast]}
              onPress={handleLogout}
            >
              <Text style={[styles.dropdownItemText, styles.dropdownItemLogout]}>
                Se déconnecter
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}