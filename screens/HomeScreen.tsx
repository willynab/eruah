import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { 
  Heart, 
  Play,
  Clock,
  TrendingUp,
  Edit3,
  Trash2,
  ArrowRight,
  BookOpen,
  Volume2,
  Newspaper,
  RefreshCw
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

interface ContentData {
  id: string;
  title: string;
  content?: string;
  description?: string;
  excerpt?: string;
  image_url?: string;
  audio_url?: string;
  duration?: number;
  published: boolean;
  created_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
  };
  users?: {
    id: string;
    full_name: string;
  };
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  
  const [recentAudio, setRecentAudio] = useState<ContentData[]>([]);
  const [recentPrayers, setRecentPrayers] = useState<ContentData[]>([]);
  const [recentNews, setRecentNews] = useState<ContentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données récentes
  const loadRecentContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fonction helper pour gérer les erreurs individuelles
      const safeQuery = async (queryFn: () => Promise<any>, fallback: any[] = []) => {
        try {
          const result = await queryFn();
          if (result.error) {
            console.warn('Erreur de requête:', result.error.message);
            return fallback;
          }
          return result.data || fallback;
        } catch (error: any) {
          console.warn('Erreur lors de l\'exécution de la requête:', error.message);
          return fallback;
        }
      };

      // Charger les enseignements audio récents
      const audioData = await safeQuery(() => 
        supabase
          .from('audio_teachings')
          .select(`
            id,
            title,
            description,
            audio_url,
            duration,
            published,
            created_at,
            categories (id, name, color),
            users (id, full_name)
          `)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3)
      );
      setRecentAudio(audioData);

      // Charger les prières récentes
      const prayersData = await safeQuery(() =>
        supabase
          .from('prayers')
          .select(`
            id,
            title,
            content,
            published,
            created_at,
            categories (id, name, color),
            users (id, full_name)
          `)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(2)
      );
      setRecentPrayers(prayersData);

      // Charger les actualités récentes
      const newsData = await safeQuery(() =>
        supabase
          .from('news')
          .select(`
            id,
            title,
            content,
            excerpt,
            image_url,
            published,
            created_at,
            categories (id, name, color),
            users (id, full_name)
          `)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(2)
      );
      setRecentNews(newsData);

    } catch (error: any) {
      console.error('Erreur générale lors du chargement du contenu:', error);
      setError('Problème de connexion à la base de données');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadRecentContent();
  }, []);

  // Calculer les statistiques utilisateur
  const userStats = {
    listeningTime: currentUser?.stats?.listeningTime || 0,
    favoritePrayers: currentUser?.stats?.favoritePrayers || 0,
    lectioSessions: currentUser?.stats?.lectioSessions || 0,
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Durée inconnue';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const formatListeningTime = (totalMinutes: number) => {
    if (totalMinutes < 60) {
      return `${totalMinutes}min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text,
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      color: colors.error || '#ff4444',
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
      backgroundColor: colors.primary,
    },
    retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    scrollContent: {
      paddingBottom: 20,
    },
    welcomeCard: {
      backgroundColor: colors.surface,
      margin: 20,
      padding: 20,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    welcomeSubtext: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    statsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 20,
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 16,
    },
    sectionTitleText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    viewAllText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
      marginRight: 4,
    },
    contentList: {
      paddingHorizontal: 20,
    },
    contentItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    contentHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    contentIcon: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 8,
      marginRight: 12,
    },
    contentInfo: {
      flex: 1,
    },
    contentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    contentSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    contentMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    contentMetaText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    contentCategory: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    contentCategoryText: {
      fontSize: 10,
      fontWeight: '600',
      color: 'white',
    },
    actionButtons: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    playButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 6,
    },
    actionButton: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: colors.background,
    },
    // Styles spécifiques pour les actualités
    newsCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginHorizontal: 20,
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    newsImage: {
      width: '100%',
      height: 120,
      backgroundColor: colors.border,
    },
    newsContent: {
      padding: 16,
    },
    newsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    newsExcerpt: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    newsMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    newsMetaText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    emptySection: {
      alignItems: 'center',
      padding: 40,
      marginHorizontal: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du contenu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRecentContent}>
          <RefreshCw size={16} color="white" />
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Carte de bienvenue */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            Bonjour {currentUser?.fullName || 'Ami(e)'} 👋
          </Text>
          <Text style={styles.welcomeSubtext}>
            Que la paix du Seigneur soit avec vous aujourd'hui. Découvrez nos derniers contenus spirituels.
          </Text>
          
          {/* Statistiques utilisateur */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {formatListeningTime(userStats.listeningTime)}
              </Text>
              <Text style={styles.statLabel}>Temps d'écoute</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{userStats.favoritePrayers}</Text>
              <Text style={styles.statLabel}>Prières favorites</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{userStats.lectioSessions}</Text>
              <Text style={styles.statLabel}>Sessions Lectio</Text>
            </View>
          </View>
        </View>

        {/* Section Actualités */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleText}>Actualités</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => onNavigate('news')}
          >
            <Text style={styles.viewAllText}>Voir tout</Text>
            <ArrowRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {recentNews.length === 0 ? (
          <View style={styles.emptySection}>
            <Newspaper size={32} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Aucune actualité récente</Text>
            <Text style={styles.emptySubtext}>Les dernières nouvelles apparaîtront ici</Text>
          </View>
        ) : (
          recentNews.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.newsCard}
              onPress={() => onNavigate('news')}
            >
              {article.image_url && (
                <Image source={{ uri: article.image_url }} style={styles.newsImage} />
              )}
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{article.title}</Text>
                {article.excerpt && (
                  <Text style={styles.newsExcerpt} numberOfLines={2}>
                    {article.excerpt}
                  </Text>
                )}
                <View style={styles.newsMeta}>
                  <Text style={styles.newsMetaText}>
                    {new Date(article.created_at).toLocaleDateString('fr-FR')}
                  </Text>
                  {article.users && (
                    <Text style={styles.newsMetaText}>
                      Par {article.users.full_name}
                    </Text>
                  )}
                  {article.categories && (
                    <View style={[styles.contentCategory, { backgroundColor: article.categories.color }]}>
                      <Text style={styles.contentCategoryText}>
                        {article.categories.name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Section Enseignements Audio */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleText}>Enseignements Audio</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => onNavigate('audio')}
          >
            <Text style={styles.viewAllText}>Voir tout</Text>
            <ArrowRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentList}>
          {recentAudio.length === 0 ? (
            <View style={styles.emptySection}>
              <Volume2 size={32} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun enseignement récent</Text>
              <Text style={styles.emptySubtext}>Les derniers audios apparaîtront ici</Text>
            </View>
          ) : (
            recentAudio.map((audio) => (
              <View key={audio.id} style={styles.contentItem}>
                <View style={styles.contentHeader}>
                  <View style={styles.contentIcon}>
                    <Volume2 size={20} color="white" />
                  </View>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle}>{audio.title}</Text>
                    {audio.description && (
                      <Text style={styles.contentSubtitle} numberOfLines={2}>
                        {audio.description}
                      </Text>
                    )}
                    <View style={styles.contentMeta}>
                      <Text style={styles.contentMetaText}>
                        {formatDuration(audio.duration)}
                      </Text>
                      <Text style={styles.contentMetaText}>
                        {new Date(audio.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                      {audio.users && (
                        <Text style={styles.contentMetaText}>
                          {audio.users.full_name}
                        </Text>
                      )}
                      {audio.categories && (
                        <View style={[styles.contentCategory, { backgroundColor: audio.categories.color }]}>
                          <Text style={styles.contentCategoryText}>
                            {audio.categories.name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.playButton}>
                    <Play size={16} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Heart size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Section Prières */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleText}>Prières</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => onNavigate('prayers')}
          >
            <Text style={styles.viewAllText}>Voir tout</Text>
            <ArrowRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentList}>
          {recentPrayers.length === 0 ? (
            <View style={styles.emptySection}>
              <BookOpen size={32} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Aucune prière récente</Text>
              <Text style={styles.emptySubtext}>Les dernières prières apparaîtront ici</Text>
            </View>
          ) : (
            recentPrayers.map((prayer) => (
              <TouchableOpacity
                key={prayer.id}
                style={styles.contentItem}
                onPress={() => onNavigate('prayers')}
              >
                <View style={styles.contentHeader}>
                  <View style={styles.contentIcon}>
                    <BookOpen size={20} color="white" />
                  </View>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle}>{prayer.title}</Text>
                    <Text style={styles.contentSubtitle} numberOfLines={2}>
                      {prayer.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </Text>
                    <View style={styles.contentMeta}>
                      <Text style={styles.contentMetaText}>
                        {new Date(prayer.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                      {prayer.users && (
                        <Text style={styles.contentMetaText}>
                          {prayer.users.full_name}
                        </Text>
                      )}
                      {prayer.categories && (
                        <View style={[styles.contentCategory, { backgroundColor: prayer.categories.color }]}>
                          <Text style={styles.contentCategoryText}>
                            {prayer.categories.name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Heart size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}