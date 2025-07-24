import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Plus, 
  Send,
  Clock,
  User,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface IntentionsScreenProps {
  onBack: () => void;
}

interface IntentionData {
  id: string;
  title: string;
  content: string;
  author_id: string;
  is_anonymous: boolean;
  status: 'pending' | 'approved' | 'answered';
  prayer_count: number;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    full_name: string;
  };
  comments?: IntentionCommentData[];
}

interface IntentionCommentData {
  id: string;
  content: string;
  author_id: string;
  intention_id: string;
  created_at: string;
  users?: {
    id: string;
    full_name: string;
  };
}

export default function IntentionsScreen({ onBack }: IntentionsScreenProps) {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  
  const [intentions, setIntentions] = useState<IntentionData[]>([]);
  const [selectedIntention, setSelectedIntention] = useState<IntentionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'my' | 'pending' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // États pour la création d'intention
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIntention, setNewIntention] = useState({
    title: '',
    content: '',
    isAnonymous: false,
  });
  
  // État pour les commentaires
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  // Créer la table intentions si elle n'existe pas
  const createIntentionsTable = async () => {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.intentions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title VARCHAR NOT NULL,
            content TEXT NOT NULL,
            author_id UUID REFERENCES public.users(id),
            is_anonymous BOOLEAN DEFAULT false,
            status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'answered')),
            prayer_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          CREATE TABLE IF NOT EXISTS public.intention_comments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            content TEXT NOT NULL,
            author_id UUID REFERENCES public.users(id),
            intention_id UUID REFERENCES public.intentions(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          CREATE INDEX IF NOT EXISTS idx_intentions_status ON public.intentions(status);
          CREATE INDEX IF NOT EXISTS idx_intentions_author ON public.intentions(author_id);
          CREATE INDEX IF NOT EXISTS idx_intention_comments_intention ON public.intention_comments(intention_id);
        `
      });
      
      if (error) {
        console.warn('Erreur lors de la création des tables:', error);
      }
    } catch (error) {
      console.warn('Tables intentions peuvent déjà exister');
    }
  };

  // Charger les intentions
  const loadIntentions = async () => {
    try {
      setError(null);

      let query = supabase
        .from('intentions')
        .select(`
          *,
          users (id, full_name),
          intention_comments (
            id,
            content,
            author_id,
            created_at,
            users (id, full_name)
          )
        `)
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filter === 'my' && currentUser?.id) {
        query = query.eq('author_id', currentUser.id);
      } else if (filter === 'pending') {
        query = query.eq('status', 'pending');
      } else if (filter === 'answered') {
        query = query.eq('status', 'answered');
      }

      // Filtrer par statut approuvé pour les non-admins
      if (!isAdmin) {
        query = query.in('status', ['approved', 'answered']);
      }

      const { data, error } = await query;

      if (error) {
        // Si la table n'existe pas, essayer de la créer
        if (error.code === '42P01') {
          await createIntentionsTable();
          // Réessayer la requête
          const { data: retryData, error: retryError } = await query;
          if (retryError) throw retryError;
          setIntentions(retryData || []);
        } else {
          throw error;
        }
      } else {
        setIntentions(data || []);
      }

    } catch (error: any) {
      console.error('Erreur lors du chargement des intentions:', error);
      setError(error.message);
    }
  };

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadIntentions();
      setIsLoading(false);
    };
    
    loadData();
  }, [filter]);

  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await loadIntentions();
    setRefreshing(false);
  };

  // Créer une nouvelle intention
  const createIntention = async () => {
    if (!newIntention.title.trim() || !newIntention.content.trim()) {
      Alert.alert('Erreur', 'Le titre et le contenu sont obligatoires.');
      return;
    }

    try {
      const { error } = await supabase
        .from('intentions')
        .insert([{
          title: newIntention.title,
          content: newIntention.content,
          author_id: currentUser?.id,
          is_anonymous: newIntention.isAnonymous,
          status: 'pending'
        }]);

      if (error) throw error;

      setNewIntention({ title: '', content: '', isAnonymous: false });
      setShowCreateForm(false);
      await loadIntentions();
      
      Alert.alert(
        'Succès', 
        'Votre intention de prière a été soumise. Elle sera visible après modération.'
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Ajouter un commentaire (réponse de prière)
  const addComment = async (intentionId: string) => {
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      
      const { error } = await supabase
        .from('intention_comments')
        .insert([{
          content: newComment,
          author_id: currentUser?.id,
          intention_id: intentionId
        }]);

      if (error) throw error;

      setNewComment('');
      await loadIntentions();
      
      // Incrémenter le compteur de prières
      await supabase
        .from('intentions')
        .update({ 
          prayer_count: supabase.raw('prayer_count + 1')
        })
        .eq('id', intentionId);

    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Modérer une intention (admin)
  const moderateIntention = async (id: string, status: 'approved' | 'answered') => {
    try {
      const { error } = await supabase
        .from('intentions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await loadIntentions();
      Alert.alert('Succès', `Intention ${status === 'approved' ? 'approuvée' : 'marquée comme répondue'} !`);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Filtrer les intentions selon la recherche
  const filteredIntentions = intentions.filter(intention => {
    if (!searchQuery) return true;
    return intention.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           intention.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
      marginBottom: 16,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    createButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 8,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
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
    intentionsList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    intentionCard: {
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
    intentionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    intentionInfo: {
      flex: 1,
      marginRight: 12,
    },
    intentionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    intentionContent: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    intentionMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    intentionMetaText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    intentionStatus: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    intentionStatusText: {
      fontSize: 10,
      fontWeight: '600',
      color: 'white',
    },
    intentionActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    prayerSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    prayerCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    prayerCountText: {
      fontSize: 14,
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
    commentsSection: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    commentsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    comment: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    commentContent: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 4,
    },
    commentMeta: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    commentInput: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    commentTextInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: colors.text,
    },
    sendButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 8,
    },
    // Styles pour le formulaire de création
    createForm: {
      backgroundColor: colors.surface,
      margin: 20,
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    formInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    formTextArea: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    formActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    formButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    submitButton: {
      backgroundColor: colors.primary,
      marginLeft: 8,
    },
    formButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    submitButtonText: {
      color: 'white',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
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
        <Text style={styles.loadingText}>Chargement des intentions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadIntentions}>
          <RefreshCw size={16} color="white" />
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filterOptions = [
    { key: 'all', label: 'Toutes' },
    { key: 'my', label: 'Mes intentions' },
    ...(isAdmin ? [
      { key: 'pending', label: 'En attente' },
      { key: 'answered', label: 'Répondues' }
    ] : [])
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'approved': return '#34C759';
      case 'answered': return '#007AFF';
      default: return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'answered': return 'Répondue';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Intentions de Prière</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Search size={16} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une intention..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                filter === option.key 
                  ? styles.filterButtonActive 
                  : styles.filterButtonInactive
              ]}
              onPress={() => setFilter(option.key as any)}
            >
              <Text
                style={[
                  filter === option.key 
                    ? styles.filterTextActive 
                    : styles.filterTextInactive
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Formulaire de création */}
      {showCreateForm && (
        <ScrollView>
          <View style={styles.createForm}>
            <Text style={styles.formTitle}>Nouvelle Intention de Prière</Text>
            
            <TextInput
              style={styles.formInput}
              placeholder="Titre de votre intention"
              placeholderTextColor={colors.textSecondary}
              value={newIntention.title}
              onChangeText={(text) => setNewIntention(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={styles.formTextArea}
              placeholder="Décrivez votre intention de prière..."
              placeholderTextColor={colors.textSecondary}
              value={newIntention.content}
              onChangeText={(text) => setNewIntention(prev => ({ ...prev, content: text }))}
              multiline
            />

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => setShowCreateForm(false)}
              >
                <Text style={[styles.formButtonText, styles.cancelButtonText]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.formButton, styles.submitButton]}
                onPress={createIntention}
              >
                <Text style={[styles.formButtonText, styles.submitButtonText]}>
                  Soumettre
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Liste des intentions */}
      {!showCreateForm && (
        <ScrollView 
          style={styles.intentionsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredIntentions.length === 0 ? (
            <View style={styles.emptyState}>
              <Heart size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Aucune intention trouvée</Text>
              <Text style={styles.emptySubtext}>
                {filter === 'my' 
                  ? 'Vous n\'avez pas encore soumis d\'intention'
                  : 'Soyez le premier à partager une intention de prière'}
              </Text>
            </View>
          ) : (
            filteredIntentions.map((intention) => (
              <View key={intention.id} style={styles.intentionCard}>
                <View style={styles.intentionHeader}>
                  <View style={styles.intentionInfo}>
                    <Text style={styles.intentionTitle}>{intention.title}</Text>
                    <Text style={styles.intentionContent} numberOfLines={3}>
                      {intention.content}
                    </Text>
                    
                    <View style={styles.intentionMeta}>
                      <Text style={styles.intentionMetaText}>
                        {new Date(intention.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                      {!intention.is_anonymous && intention.users && (
                        <Text style={styles.intentionMetaText}>
                          Par {intention.users.full_name}
                        </Text>
                      )}
                      {intention.is_anonymous && (
                        <Text style={styles.intentionMetaText}>
                          Anonyme
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View 
                    style={[
                      styles.intentionStatus, 
                      { backgroundColor: getStatusColor(intention.status) }
                    ]}
                  >
                    <Text style={styles.intentionStatusText}>
                      {getStatusLabel(intention.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.intentionActions}>
                  <View style={styles.prayerSection}>
                    <View style={styles.prayerCount}>
                      <Heart size={16} color={colors.primary} />
                      <Text style={styles.prayerCountText}>
                        {intention.prayer_count} prière{intention.prayer_count > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>

                  {isAdmin && intention.status === 'pending' && (
                    <View style={styles.adminActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => moderateIntention(intention.id, 'approved')}
                      >
                        <CheckCircle size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => moderateIntention(intention.id, 'answered')}
                      >
                        <XCircle size={16} color={colors.error || '#ff4444'} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Section des commentaires */}
                {intention.status === 'approved' && (
                  <View style={styles.commentsSection}>
                    {intention.comments && intention.comments.length > 0 && (
                      <>
                        <Text style={styles.commentsTitle}>
                          Prières partagées ({intention.comments.length})
                        </Text>
                        {intention.comments.slice(0, 3).map((comment) => (
                          <View key={comment.id} style={styles.comment}>
                            <Text style={styles.commentContent}>{comment.content}</Text>
                            <Text style={styles.commentMeta}>
                              {comment.users?.full_name} • {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                            </Text>
                          </View>
                        ))}
                      </>
                    )}

                    {/* Formulaire d'ajout de commentaire */}
                    <View style={styles.commentInput}>
                      <TextInput
                        style={styles.commentTextInput}
                        placeholder="Partagez une prière ou un encouragement..."
                        placeholderTextColor={colors.textSecondary}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => addComment(intention.id)}
                        disabled={isSubmittingComment || !newComment.trim()}
                      >
                        {isSubmittingComment ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Send size={16} color="white" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}