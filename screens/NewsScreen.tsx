import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Clock, User, Heart, Share, Plus, Edit, Calendar, RefreshCw, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Article } from '@/types';
import { RichTextDisplay } from '@/components/RichTextDisplay';
import PublicationScheduler, { PublicationSchedule } from '@/components/PublicationScheduler';
import { RichTextEditor } from '@/components/RichTextEditor';

interface NewsScreenProps {
  onBack: () => void;
}

interface NewsData {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
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

export default function NewsScreen({ onBack }: NewsScreenProps) {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState<NewsData | null>(null);
  const [articles, setArticles] = useState<NewsData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsData | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<PublicationSchedule | null>(null);
  
  const [editorData, setEditorData] = useState({
    title: '',
    summary: '',
    content: '',
    category_id: '',
    coverImage: '',
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  // Charger les articles
  const loadArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('news')
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

      setArticles(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des articles:', error);
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
        .eq('type', 'news')
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
    loadArticles();
    loadCategories();
  }, []);

  const toggleFavorite = (id: string) => {
    // TODO: Implémenter la logique de favoris avec une table dédiée
    Alert.alert('Info', 'Fonctionnalité des favoris à venir !');
  };

  const handleCreateArticle = () => {
    setEditingArticle(null);
    setEditorData({
      title: '',
      summary: '',
      content: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      coverImage: '',
    });
    setCurrentSchedule({ status: 'draft' });
    setShowEditor(true);
  };

  const handleEditArticle = (article: NewsData) => {
    setEditingArticle(article);
    setEditorData({
      title: article.title,
      summary: article.excerpt || '',
      content: article.content,
      category_id: article.category_id || '',
      coverImage: article.image_url || '',
    });
    setCurrentSchedule({ 
      status: article.published ? 'published' : 'draft',
      scheduledDate: article.scheduled_date ? new Date(article.scheduled_date) : undefined
    });
    setShowEditor(true);
  };

  const handleDeleteArticle = async (id: string) => {
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('news')
                .delete()
                .eq('id', id);

              if (error) throw error;

              await loadArticles();
              Alert.alert('Succès', 'Article supprimé avec succès !');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  const handleSaveArticle = async () => {
    if (!editorData.title.trim() || !editorData.content.trim()) {
      Alert.alert('Erreur', 'Le titre et le contenu sont obligatoires.');
      return;
    }

    try {
      const articleData = {
        title: editorData.title,
        content: editorData.content,
        excerpt: editorData.summary || null,
        image_url: editorData.coverImage || null,
        category_id: editorData.category_id || null,
        author_id: currentUser?.id,
        published: currentSchedule?.status === 'published',
        scheduled_date: currentSchedule?.scheduledDate?.toISOString() || null,
        published_at: currentSchedule?.status === 'published' ? new Date().toISOString() : null,
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('news')
          .update({ ...articleData, updated_at: new Date().toISOString() })
          .eq('id', editingArticle.id);

        if (error) throw error;
        Alert.alert('Succès', 'Article mis à jour avec succès !');
      } else {
        const { error } = await supabase
          .from('news')
          .insert([articleData]);

        if (error) throw error;
        Alert.alert('Succès', 'Article créé avec succès !');
      }

      setShowEditor(false);
      await loadArticles();
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
    articlesList: {
      flex: 1,
    },
    articleCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginVertical: 8,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    articleImage: {
      width: '100%',
      height: 200,
      backgroundColor: colors.border,
    },
    articleContent: {
      padding: 16,
    },
    articleTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    articleExcerpt: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    articleMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    articleMetaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    articleMetaText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    articleActions: {
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
    detailContainer: {
      flex: 1,
    },
    detailHeader: {
      position: 'relative',
    },
    detailImage: {
      width: '100%',
      height: 250,
      backgroundColor: colors.border,
    },
    detailBackButton: {
      position: 'absolute',
      top: 60,
      left: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 8,
      zIndex: 1,
    },
    detailContent: {
      padding: 20,
    },
    detailTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    detailMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailMetaText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des articles...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadArticles}>
          <RefreshCw size={16} color="white" />
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Affichage détaillé d'un article
  if (selectedArticle) {
    return (
      <View style={styles.detailContainer}>
        <ScrollView>
          <View style={styles.detailHeader}>
            {selectedArticle.image_url && (
              <Image source={{ uri: selectedArticle.image_url }} style={styles.detailImage} />
            )}
            <TouchableOpacity
              style={styles.detailBackButton}
              onPress={() => setSelectedArticle(null)}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{selectedArticle.title}</Text>

            <View style={styles.detailMeta}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={styles.detailMetaText}>
                  {new Date(selectedArticle.created_at).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              {selectedArticle.users && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <User size={14} color={colors.textSecondary} />
                  <Text style={styles.detailMetaText}>
                    {selectedArticle.users.full_name}
                  </Text>
                </View>
              )}
            </View>

            <RichTextDisplay content={selectedArticle.content} />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Liste des articles
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Actualités</Text>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.adminHeader}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
            Gestion des articles
          </Text>
          <TouchableOpacity style={styles.adminButton} onPress={handleCreateArticle}>
            <Plus size={16} color="white" />
            <Text style={styles.adminButtonText}>Nouvel article</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.articlesList} showsVerticalScrollIndicator={false}>
        {articles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun article disponible</Text>
            <Text style={styles.emptySubtext}>
              {isAdmin ? 'Créez votre premier article !' : 'Revenez bientôt pour découvrir nos actualités.'}
            </Text>
          </View>
        ) : (
          articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => setSelectedArticle(article)}
            >
              {article.image_url && (
                <Image source={{ uri: article.image_url }} style={styles.articleImage} />
              )}
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                {article.excerpt && (
                  <Text style={styles.articleExcerpt} numberOfLines={3}>
                    {article.excerpt}
                  </Text>
                )}
                <View style={styles.articleMeta}>
                  <View style={styles.articleMetaLeft}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} color={colors.textSecondary} />
                      <Text style={styles.articleMetaText}>
                        {new Date(article.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    {article.users && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <User size={12} color={colors.textSecondary} />
                        <Text style={styles.articleMetaText}>
                          {article.users.full_name}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.articleActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleFavorite(article.id)}
                    >
                      <Heart size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {isAdmin && (
                      <>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditArticle(article)}
                        >
                          <Edit size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteArticle(article.id)}
                        >
                          <Trash2 size={16} color={colors.error || '#ff4444'} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modals */}
      {showEditor && (
        <RichTextEditor
          visible={showEditor}
          title={editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
          initialData={editorData}
          categories={categories}
          onSave={handleSaveArticle}
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
    </View>
  );
}