import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Filter, Search, Plus, Edit, Calendar, ArrowLeft, Settings, Play, Pause, RefreshCw, Trash2, Volume2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AudioTeaching } from '@/types';
import ContentCard from '@/components/ContentCard';
import { RichTextEditor } from '@/components/RichTextEditor';
import PublicationScheduler, { PublicationSchedule } from '@/components/PublicationScheduler';
import CategoryManager, { Category } from '@/components/CategoryManager';

interface AudioData {
  id: string;
  title: string;
  description?: string;
  audio_url: string;
  duration?: number;
  category_id?: string;
  author_id?: string;
  published: boolean;
  scheduled_date?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
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

export default function AudioScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [teachings, setTeachings] = useState<AudioData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingTeaching, setEditingTeaching] = useState<AudioData | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<PublicationSchedule | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
  const [editorData, setEditorData] = useState({
    title: '',
    description: '',
    audioUrl: '',
    category_id: '',
    duration: 0,
  });

  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  // Charger les enseignements audio
  const loadTeachings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('audio_teachings')
        .select(`
          *,
          categories (
            id,
            name,
            color
          ),
          users (
            id,
            full_name
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTeachings(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des enseignements:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les catégories
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'audio')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadTeachings();
    loadCategories();
  }, []);

  // Filtrer les enseignements
  const filteredTeachings = teachings.filter(teaching => {
    if (selectedFilter === 'Tous') return true;
    return teaching.categories?.name === selectedFilter;
  });

  // Créer la liste des filtres
  const filterOptions = ['Tous', ...categories.map(cat => cat.name)];

  const handleCreateTeaching = () => {
    setEditingTeaching(null);
    setEditorData({
      title: '',
      description: '',
      audioUrl: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      duration: 0,
    });
    setCurrentSchedule({ status: 'draft' });
    setShowEditor(true);
  };

  const handleEditTeaching = (teaching: AudioData) => {
    setEditingTeaching(teaching);
    setEditorData({
      title: teaching.title,
      description: teaching.description || '',
      audioUrl: teaching.audio_url,
      category_id: teaching.category_id || '',
      duration: teaching.duration || 0,
    });
    setCurrentSchedule({ 
      status: teaching.published ? 'published' : 'draft',
      scheduledDate: teaching.scheduled_date ? new Date(teaching.scheduled_date) : undefined
    });
    setShowEditor(true);
  };

  const handleDeleteTeaching = async (id: string) => {
    Alert.alert(
      'Supprimer l\'enseignement',
      'Êtes-vous sûr de vouloir supprimer cet enseignement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('audio_teachings')
                .delete()
                .eq('id', id);

              if (error) throw error;

              await loadTeachings();
              Alert.alert('Succès', 'Enseignement supprimé avec succès !');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  const handleSaveTeaching = async () => {
    if (!editorData.title.trim() || !editorData.audioUrl.trim()) {
      Alert.alert('Erreur', 'Le titre et l\'URL audio sont obligatoires.');
      return;
    }

    try {
      const teachingData = {
        title: editorData.title,
        description: editorData.description || null,
        audio_url: editorData.audioUrl,
        duration: editorData.duration || null,
        category_id: editorData.category_id || null,
        author_id: currentUser?.id,
        published: currentSchedule?.status === 'published',
        scheduled_date: currentSchedule?.scheduledDate?.toISOString() || null,
        published_at: currentSchedule?.status === 'published' ? new Date().toISOString() : null,
      };

      if (editingTeaching) {
        const { error } = await supabase
          .from('audio_teachings')
          .update({ ...teachingData, updated_at: new Date().toISOString() })
          .eq('id', editingTeaching.id);

        if (error) throw error;
        Alert.alert('Succès', 'Enseignement mis à jour avec succès !');
      } else {
        const { error } = await supabase
          .from('audio_teachings')
          .insert([teachingData]);

        if (error) throw error;
        Alert.alert('Succès', 'Enseignement créé avec succès !');
      }

      setShowEditor(false);
      await loadTeachings();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const togglePlayPause = (teachingId: string) => {
    if (currentlyPlaying === teachingId) {
      setCurrentlyPlaying(null);
      // TODO: Arrêter la lecture audio
    } else {
      setCurrentlyPlaying(teachingId);
      // TODO: Démarrer la lecture audio
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Durée inconnue';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    header: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      marginLeft: 16,
    },
    adminHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    adminActions: {
      flexDirection: 'row',
      gap: 8,
    },
    adminButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
      gap: 6,
    },
    adminButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '500',
    },
    filtersContainer: {
      paddingVertical: 16,
    },
    filtersScroll: {
      paddingHorizontal: 20,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 12,
      borderWidth: 1,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
    },
    filterTextActive: {
      color: 'white',
      fontWeight: '600',
    },
    filterTextInactive: {
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
    },
    teachingsList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    teachingCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    teachingHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    teachingInfo: {
      flex: 1,
      marginRight: 12,
    },
    teachingTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    teachingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    teachingMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    teachingMetaText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    teachingCategory: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    teachingCategoryText: {
      fontSize: 12,
      fontWeight: '600',
      color: 'white',
    },
    teachingActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    playSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    playButton: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      padding: 12,
    },
    playInfo: {
      flex: 1,
    },
    durationText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    authorText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    adminActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des enseignements...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTeachings}>
          <RefreshCw size={16} color="white" />
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Enseignements Audio</Text>
        </View>
      </View>

      {/* Admin header */}
      {isAdmin && (
        <View style={styles.adminHeader}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
            Gestion des enseignements
          </Text>
          <View style={styles.adminActions}>
            <TouchableOpacity style={styles.adminButton} onPress={() => setShowCategoryManager(true)}>
              <Settings size={16} color="white" />
              <Text style={styles.adminButtonText}>Catégories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminButton} onPress={handleCreateTeaching}>
              <Plus size={16} color="white" />
              <Text style={styles.adminButtonText}>Nouvel enseignement</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter 
                  ? styles.filterButtonActive 
                  : styles.filterButtonInactive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  selectedFilter === filter 
                    ? styles.filterTextActive 
                    : styles.filterTextInactive
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste des enseignements */}
      <ScrollView style={styles.teachingsList} showsVerticalScrollIndicator={false}>
        {filteredTeachings.length === 0 ? (
          <View style={styles.emptyState}>
            <Volume2 size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {selectedFilter === 'Tous' 
                ? 'Aucun enseignement disponible' 
                : `Aucun enseignement dans "${selectedFilter}"`}
            </Text>
            <Text style={styles.emptySubtext}>
              {isAdmin 
                ? 'Créez votre premier enseignement audio !' 
                : 'Revenez bientôt pour découvrir nos enseignements.'}
            </Text>
          </View>
        ) : (
          filteredTeachings.map((teaching) => (
            <View key={teaching.id} style={styles.teachingCard}>
              <View style={styles.teachingHeader}>
                <View style={styles.teachingInfo}>
                  <Text style={styles.teachingTitle}>{teaching.title}</Text>
                  {teaching.description && (
                    <Text style={styles.teachingDescription} numberOfLines={2}>
                      {teaching.description}
                    </Text>
                  )}
                </View>
                {teaching.categories && (
                  <View 
                    style={[
                      styles.teachingCategory, 
                      { backgroundColor: teaching.categories.color }
                    ]}
                  >
                    <Text style={styles.teachingCategoryText}>
                      {teaching.categories.name}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.teachingMeta}>
                <Text style={styles.teachingMetaText}>
                  {new Date(teaching.created_at).toLocaleDateString('fr-FR')}
                </Text>
                {teaching.users && (
                  <Text style={styles.teachingMetaText}>
                    Par {teaching.users.full_name}
                  </Text>
                )}
                <Text style={styles.teachingMetaText}>
                  {formatDuration(teaching.duration)}
                </Text>
              </View>

              <View style={styles.teachingActions}>
                <View style={styles.playSection}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => togglePlayPause(teaching.id)}
                  >
                    {currentlyPlaying === teaching.id ? (
                      <Pause size={24} color="white" />
                    ) : (
                      <Play size={24} color="white" />
                    )}
                  </TouchableOpacity>
                  <View style={styles.playInfo}>
                    <Text style={styles.durationText}>
                      {currentlyPlaying === teaching.id ? 'En cours...' : 'À écouter'}
                    </Text>
                    <Text style={styles.authorText}>
                      {formatDuration(teaching.duration)}
                    </Text>
                  </View>
                </View>

                {isAdmin && (
                  <View style={styles.adminActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditTeaching(teaching)}
                    >
                      <Edit size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteTeaching(teaching.id)}
                    >
                      <Trash2 size={16} color={colors.error || '#ff4444'} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modals */}
      {showEditor && (
        <RichTextEditor
          visible={showEditor}
          title={editingTeaching ? 'Modifier l\'enseignement' : 'Nouvel enseignement'}
          initialData={editorData}
          categories={categories}
          onSave={handleSaveTeaching}
          onCancel={() => setShowEditor(false)}
          onDataChange={setEditorData}
        />
      )}

      {showScheduler && (
        <PublicationScheduler
          visible={showScheduler}
          initialSchedule={currentSchedule}
          onSave={(schedule) => {
            setCurrentSchedule(schedule);
            setShowScheduler(false);
          }}
          onCancel={() => setShowScheduler(false)}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          visible={showCategoryManager}
          categories={categories.map(cat => ({
            ...cat,
            icon: '🎵',
            order: 0,
            isActive: cat.is_active,
            createdAt: new Date(cat.created_at),
            updatedAt: new Date(cat.updated_at)
          }))}
          onSave={() => {
            setShowCategoryManager(false);
            loadCategories();
          }}
          onCancel={() => setShowCategoryManager(false)}
        />
      )}
    </View>
  );
}