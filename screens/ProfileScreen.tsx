import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Switch 
} from 'react-native';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Settings, 
  Palette, 
  Bell, 
  Volume2, 
  Type,
  BarChart3,
  Clock,
  Heart,
  BookOpen,
  MessageCircle,
  LogOut,
  Lock,
  Info
} from 'lucide-react-native';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { themeInfo } from '@/constants/themes';
import { Theme } from '@/types';

interface ProfileScreenProps {
  onBack: () => void;
}

export default function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { colors, theme, changeTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  const handleThemeChange = (newTheme: Theme) => {
    changeTheme(newTheme);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors.text,
    },
    content: {
      flex: 1,
    },
    profileCard: {
      backgroundColor: colors.surface,
      margin: 20,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 32,
      color: 'white',
      fontWeight: 'bold' as const,
    },
    userName: {
      fontSize: 22,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    roleBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    roleText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
    section: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.text,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      gap: 16,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    themeSelector: {
      padding: 16,
      gap: 12,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    themeOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    themePreview: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: 12,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 2,
    },
    themeDescription: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    settingText: {
      fontSize: 16,
      color: colors.text,
    },
    settingSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    fontSizeButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    fontSizeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fontSizeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    fontSizeText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    fontSizeTextActive: {
      color: 'white',
    },
    logoutButton: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    logoutItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    logoutText: {
      fontSize: 16,
      color: '#ef4444',
      fontWeight: '600' as const,
    },
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser?.fullName}</Text>
          <Text style={styles.userEmail}>{currentUser?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {currentUser?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Statistiques</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.statValue}>
                {formatTime(currentUser?.stats.listeningTime || 0)}
              </Text>
              <Text style={styles.statLabel}>Temps d'écoute total</Text>
            </View>
            <View style={styles.statCard}>
              <Heart size={20} color={colors.primary} />
              <Text style={styles.statValue}>
                {currentUser?.stats.favoritePrayers || 0}
              </Text>
              <Text style={styles.statLabel}>Prières favorites</Text>
            </View>
            <View style={styles.statCard}>
              <BookOpen size={20} color={colors.primary} />
              <Text style={styles.statValue}>
                {currentUser?.stats.lectioSessions || 0}
              </Text>
              <Text style={styles.statLabel}>Sessions Lectio</Text>
            </View>
            <View style={styles.statCard}>
              <MessageCircle size={20} color={colors.primary} />
              <Text style={styles.statValue}>
                {currentUser?.stats.intentionsSubmitted || 0}
              </Text>
              <Text style={styles.statLabel}>Intentions soumises</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Palette size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Thème de l'Application</Text>
          </View>
          <View style={styles.themeSelector}>
            {Object.entries(themeInfo).map(([key, info]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeOption,
                  theme === key && styles.themeOptionActive
                ]}
                onPress={() => handleThemeChange(key as Theme)}
              >
                <View 
                  style={[styles.themePreview, { backgroundColor: info.preview }]} 
                />
                <View style={styles.themeInfo}>
                  <Text style={styles.themeName}>{info.name}</Text>
                  <Text style={styles.themeDescription}>{info.description}</Text>
                </View>
                <Text style={{ fontSize: 20 }}>{info.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Préférences</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.settingText}>Notifications</Text>
                <Text style={styles.settingSubtext}>
                  Recevoir les actualités et rappels
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notifications ? 'white' : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Volume2 size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.settingText}>Lecture automatique</Text>
                <Text style={styles.settingSubtext}>
                  Lancer automatiquement le contenu suivant
                </Text>
              </View>
            </View>
            <Switch
              value={autoPlay}
              onValueChange={setAutoPlay}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={autoPlay ? 'white' : colors.textSecondary}
            />
          </View>

          <View style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingLeft}>
              <Type size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.settingText}>Taille de police</Text>
                <Text style={styles.settingSubtext}>
                  Pour la lecture des prières et textes
                </Text>
              </View>
            </View>
            <View style={styles.fontSizeButtons}>
              {['small', 'medium', 'large'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontSizeButton,
                    fontSize === size && styles.fontSizeButtonActive
                  ]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[
                    styles.fontSizeText,
                    fontSize === size && styles.fontSizeTextActive
                  ]}>
                    {size === 'small' ? 'A-' : size === 'medium' ? 'A' : 'A+'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Sécurité</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.settingItemLast]}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <View style={styles.settingLeft}>
              <Lock size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.settingText}>Changer le mot de passe</Text>
                <Text style={styles.settingSubtext}>
                  Modifier votre mot de passe de connexion
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>À Propos</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Info size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.settingText}>Espace Ruah</Text>
                <Text style={styles.settingSubtext}>
                  Application de spiritualité chrétienne
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>v1.0.0</Text>
          </View>

          <View style={[styles.settingItem, styles.settingItemLast]}>
            <View style={styles.settingLeft}>
              <Mail size={20} color={colors.textSecondary} />
              <View>
                <Text style={styles.settingText}>Support</Text>
                <Text style={styles.settingSubtext}>
                  Contactez-nous pour toute question
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.primary, fontSize: 14 }}>contact@espaceruah.fr</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutItem}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </View>
  );
}