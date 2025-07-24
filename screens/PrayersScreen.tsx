import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Heart, Share, Plus, Edit, Calendar, RefreshCw, Trash2, BookOpen, Clock, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Prayer } from '@/types';
import { RichTextDisplay } from '@/components/RichTextDisplay';
import PublicationScheduler, { PublicationSchedule } from '@/components/PublicationScheduler';
import { RichTextEditor } from '@/components/RichTextEditor';
import CategoryManager from '@/components/CategoryManager';

interface PrayerData {
  id: string;
  title: string;
  content: string;
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

export default function PrayersScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerData | null>(null);
  const [prayers, setPrayers] = useState<PrayerData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('Toutes');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<PrayerData | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<PublicationSchedule | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
  const [editorData, setEditorData] = useState({
    title: '',
    content: '',
    category_id: '',
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  // Charger les prières
  const loadPrayers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('prayers')
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

      setPrayers(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des prières:', error);
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
        .eq('type', 'prayers')
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
    loadPrayers();
    loadCategories();
  }, []);

  // Filtrer les prières
  const filteredPrayers = prayers.filter(prayer => {
    if (selectedFilter === 'Toutes') return true;
    return prayer.categories?.name === selectedFilter;
  });

  // Créer la liste des filtres
  const filterOptions = ['Toutes', ...categories.map(cat => cat.name)];

  const toggleFavorite = (id: string) => {
    // TODO: Implémenter la logique de favoris avec une table dédiée
    Alert.alert('Info', 'Fonctionnalité des favoris à venir !');
  };

  const sharePrayer = (prayer: PrayerData) => {
    // TODO: Implémenter le partage
    Alert.alert('Partage', `Partager "${prayer.title}"`);
  };

  const handleCreatePrayer = () => {
    setEditingPrayer(null);
    setEditorData({
      title: '',
      content: '',
      category_id: categories.length > 0 ? categories[0].id : '',
    });
    setCurrentSchedule({ status: 'draft' });
    setShowEditor(true);
  };

  const handleEditPrayer = (prayer: PrayerData) => {
    setEditingPrayer(prayer);
    setEditorData({
      title: prayer.title,
      content: prayer.content,
      category_id: prayer.category_id || '',
    });
    setCurrentSchedule({ 
      status: prayer.published ? 'published' : 'draft',
      scheduledDate: prayer.scheduled_date ? new Date(prayer.scheduled_date) : undefined
    });
    setShowEditor(true);
  };

  const handleDeletePrayer = async (id: string) => {
    Alert.alert(
      'Supprimer la prière',
      'Êtes-vous sûr de vouloir supprimer cette prière ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('prayers')
                .delete()
                .eq('id', id);

              if (error) throw error;

              await loadPrayers();
              Alert.alert('Succès', 'Prière supprimée avec succès !');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  const handleSavePrayer = async () => {
    if (!editorData.title.trim() || !editorData.content.trim()) {
      Alert.alert('Erreur', 'Le titre et le contenu sont obligatoires.');
      return;
    }

    try {
      const prayerData = {
        title: editorData.title,
        content: editorData.content,
        category_id: editorData.category_id || null,
        author_id: currentUser?.id,
        published: currentSchedule?.status === 'published',
        scheduled_date: currentSchedule?.scheduledDate?.toISOString() || null,
        published_at: currentSchedule?.status === 'published' ? new Date().toISOString() : null,
      };

      if (editingPrayer) {
        const { error } = await supabase
          .from('prayers')
          .update({ ...prayerData, updated_at: new Date().toISOString() })
          .eq('id', editingPrayer.id);

        if (error) throw error;
        Alert.alert('Succès', 'Prière mise à jour avec succès !');
      } else {
        const { error } = await supabase
          .from('prayers')
          .insert([prayerData]);

        if (error) throw error;
        Alert.alert('Succès', 'Prière créée avec succès !');
      }

      setShowEditor(false);
      await loadPrayers();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
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
    prayersList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    prayerCard: {
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
    prayerHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    prayerInfo: {
      flex: 1,
      marginRight: 12,
    },
    prayerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    prayerPreview: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    prayerCategory: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    prayerCategoryText: {
      fontSize: 12,
      fontWeight: '600',
      color: 'white',
    },
    prayerMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    prayerMetaText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    prayerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    userActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    adminActionsSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    adminActionButton: {
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
    // Styles pour l'affichage détaillé
    detailContainer: {
      flex: 1,
    },
    detailHeader: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailBackButton: {
      padding: 8,
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
    detailTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    detailMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    detailMetaText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    detailContent: {
      flex: 1,
      padding: 20,
    },
    detailActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    detailActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    detailActionButtonText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des prières...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPrayers}>
          <RefreshCw size={16} color="white" />
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Affichage détaillé d'une prière
  if (selectedPrayer) {
    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.detailBackButton}
            onPress={() => setSelectedPrayer(null)}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.detailTitle}>{selectedPrayer.title}</Text>
          
          <View style={styles.detailMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.detailMetaText}>
                {new Date(selectedPrayer.created_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            {selectedPrayer.users && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <User size={14} color={colors.textSecondary} />
                <Text style={styles.detailMetaText}>
                  {selectedPrayer.users.full_name}
                </Text>
              </View>
            )}
            {selectedPrayer.categories && (
              <View 
                style={[
                  styles.prayerCategory, 
                  { backgroundColor: selectedPrayer.categories.color }
                ]}
              >
                <Text style={styles.prayerCategoryText}>
                  {selectedPrayer.categories.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView style={styles.detailContent}>
          <RichTextDisplay content={selectedPrayer.content} />
        </ScrollView>

        <View style={styles.detailActions}>
          <TouchableOpacity
            style={styles.detailActionButton}
            onPress={() => toggleFavorite(selectedPrayer.id)}
          >
            <Heart size={20} color={colors.textSecondary} />
            <Text style={styles.detailActionButtonText}>Favoris</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.detailActionButton}
            onPress={() => sharePrayer(selectedPrayer)}
          >
            <Share size={20} color={colors.textSecondary} />
            <Text style={styles.detailActionButtonText}>Partager</Text>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              style={styles.detailActionButton}
              onPress={() => {
                setSelectedPrayer(null);
                handleEditPrayer(selectedPrayer);
              }}
            >
              <Edit size={20} color={colors.primary} />
              <Text style={[styles.detailActionButtonText, { color: colors.primary }]}>
                Modifier
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Liste des prières
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Prières</Text>
        </View>
      </View>

      {/* Admin header */}
      {isAdmin && (
        <View style={styles.adminHeader}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
            Gestion des prières
          </Text>
          <View style={styles.adminActions}>
            <TouchableOpacity 
              style={styles.adminButton} 
              onPress={() => setShowCategoryManager(true)}
            >
              <BookOpen size={16} color="white" />
              <Text style={styles.adminButtonText}>Catégories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminButton} onPress={handleCreatePrayer}>
              <Plus size={16} color="white" />
              <Text style={styles.adminButtonText}>Nouvelle prière</Text>
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

      {/* Liste des prières */}
      <ScrollView style={styles.prayersList} showsVerticalScrollIndicator={false}>
        {filteredPrayers.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {selectedFilter === 'Toutes' 
                ? 'Aucune prière disponible' 
                : `Aucune prière dans "${selectedFilter}"`}
            </Text>
            <Text style={styles.emptySubtext}>
              {isAdmin 
                ? 'Créez votre première prière !' 
                : 'Revenez bientôt pour découvrir nos prières.'}
            </Text>
          </View>
        ) : (
          filteredPrayers.map((prayer) => (
            <TouchableOpacity
              key={prayer.id}
              style={styles.prayerCard}
              onPress={() => setSelectedPrayer(prayer)}
            >
              <View style={styles.prayerHeader}>
                <View style={styles.prayerInfo}>
                  <Text style={styles.prayerTitle}>{prayer.title}</Text>
                  <Text style={styles.prayerPreview} numberOfLines={3}>
                    {prayer.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </Text>
                </View>
                {prayer.categories && (
                  <View 
                    style={[
                      styles.prayerCategory, 
                      { backgroundColor: prayer.categories.color }
                    ]}
                  >
                    <Text style={styles.prayerCategoryText}>
                      {prayer.categories.name}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.prayerMeta}>
                <Text style={styles.prayerMetaText}>
                  {new Date(prayer.created_at).toLocaleDateString('fr-FR')}
                </Text>
                {prayer.users && (
                  <Text style={styles.prayerMetaText}>
                    Par {prayer.users.full_name}
                  </Text>
                )}
              </View>

              <View style={styles.prayerActions}>
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(prayer.id);
                    }}
                  >
                    <Heart size={16} color={colors.textSecondary} />
                    <Text style={styles.actionButtonText}>Favoris</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      sharePrayer(prayer);
                    }}
                  >
                    <Share size={16} color={colors.textSecondary} />
                    <Text style={styles.actionButtonText}>Partager</Text>
                  </TouchableOpacity>
                </View>

                {isAdmin && (
                  <View style={styles.adminActionsSection}>
                    <TouchableOpacity
                      style={styles.adminActionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEditPrayer(prayer);
                      }}
                    >
                      <Edit size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.adminActionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeletePrayer(prayer.id);
                      }}
                    >
                      <Trash2 size={16} color={colors.error || '#ff4444'} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modals */}
      {showEditor && (
        <RichTextEditor
          visible={showEditor}
          title={editingPrayer ? 'Modifier la prière' : 'Nouvelle prière'}
          initialData={editorData}
          categories={categories}
          onSave={handleSavePrayer}
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
            icon: '🙏',
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