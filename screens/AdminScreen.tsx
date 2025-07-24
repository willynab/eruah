import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { 
  ArrowLeft, 
  Users, 
  Headphones, 
  MessageCircle, 
  Newspaper,
  BarChart3,
  Plus,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Heart,
  BookOpen,
  Upload,
  Image as ImageIcon,
  Volume2,
  FileText,
  Download,
  Zap
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { useQueryClient } from '@tanstack/react-query';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Intention, Article, AudioTeaching, Prayer, LectioPassage } from '@/types';
import MembersManagementScreen from './MembersManagementScreen';
import PopupForgeAdminScreen from './PopupForgeAdminScreen';

interface AdminScreenProps {
  onBack: () => void;
}

export default function AdminScreen({ onBack }: AdminScreenProps) {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'statistics' | 'intentions' | 'articles' | 'teachings' | 'prayers' | 'lectio' | 'users' | 'popups'>('dashboard');
const queryClient = useQueryClient();

// Queries tRPC
const { data: intentions = [], refetch: refetchIntentions } = trpc.intentions.list.useQuery({
  status: 'pending'
});

const { data: articles = [], refetch: refetchArticles } = trpc.articles.list.useQuery({
  published: true
});

const { data: teachings = [], refetch: refetchTeachings } = trpc.audio.list.useQuery({
  published: true
});

const { data: prayers = [], refetch: refetchPrayers } = trpc.prayers.list.useQuery({
  published: true
});

const { data: lectioPassages = [], refetch: refetchLectio } = trpc.lectio.list.useQuery();

// Mutations
const createArticleMutation = trpc.articles.create.useMutation();
const createTeachingMutation = trpc.audio.create.useMutation();
const createPrayerMutation = trpc.prayers.create.useMutation();
const createLectioMutation = trpc.lectio.create.useMutation();
const approveIntentionMutation = trpc.intentions.approve.useMutation();
const rejectIntentionMutation = trpc.intentions.reject.useMutation();
  
  // Modals
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [showTeachingForm, setShowTeachingForm] = useState(false);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [showLectioForm, setShowLectioForm] = useState(false);
  const [showLectioImport, setShowLectioImport] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  
  // Forms
// Charger les catégories depuis la DB
const { data: categories = [] } = trpc.categories.list.useQuery({
  type: 'news'
});

const [articleForm, setArticleForm] = useState({
  title: '',
  summary: '',
  content: '',
  categoryId: '', // Utiliser l'ID de la catégorie au lieu du nom
  coverImage: '',
});
  
  const [teachingForm, setTeachingForm] = useState({
    title: '',
    author: '',
    category: 'Enseignement' as AudioTeaching['category'],
    level: 1 as AudioTeaching['level'],
    description: '',
    audioUrl: '',
    coverImage: '',
  });

  const [prayerForm, setPrayerForm] = useState({
    title: '',
    author: '',
    category: '',
    content: '',
    difficulty: 1,
  });

  const [lectioForm, setLectioForm] = useState({
    title: '',
    reference: '',
    content: '',
    theme: 'Paix' as LectioPassage['theme'],
    liturgicalSeason: undefined as LectioPassage['liturgicalSeason'],
    context: '',
    questions: ['', '', ''],
  });

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
    adminBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    adminBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold' as const,
    },

    content: {
      flex: 1,
    },
    // Dashboard
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    quickActionButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    quickActionText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600' as const,
    },
    modulesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 20,
      gap: 16,
    },
    moduleCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      width: '47%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      position: 'relative',
    },
    moduleTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginTop: 12,
      textAlign: 'center',
    },
    moduleDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    moduleBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      minWidth: 20,
      alignItems: 'center',
    },
    moduleBadgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold' as const,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 20,
      gap: 16,
    },
    statCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      width: '47%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    actionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    actionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    actionText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500' as const,
    },
    actionBadge: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 20,
      alignItems: 'center',
    },
    actionBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
    // Lists
    listItem: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginVertical: 6,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    itemContent: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    itemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    itemActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    approveButton: {
      backgroundColor: '#10b981',
    },
    rejectButton: {
      backgroundColor: '#ef4444',
    },
    editButton: {
      backgroundColor: colors.accent,
    },
    deleteButton: {
      backgroundColor: '#ef4444',
    },
    actionButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600' as const,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      padding: 12,
      position: 'absolute',
      bottom: 20,
      right: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    categorySelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryOption: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryOptionText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    categoryOptionTextActive: {
      color: 'white',
    },
    uploadButton: {
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 8,
      paddingVertical: 20,
      alignItems: 'center',
      gap: 8,
    },
    uploadText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submitButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600' as const,
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    submitButtonText: {
      color: 'white',
    },
    errorText: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 100,
    },
    questionInput: {
      marginBottom: 8,
    },
    importSection: {
      backgroundColor: colors.surface,
      margin: 20,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    importTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 12,
    },
    importDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    csvInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      fontFamily: 'monospace',
      height: 120,
      textAlignVertical: 'top',
    },
    previewContainer: {
      marginTop: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      maxHeight: 200,
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 8,
    },
    previewItem: {
      backgroundColor: colors.surface,
      borderRadius: 6,
      padding: 8,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    previewItemTitle: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text,
    },
    previewItemMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    importActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    importButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    previewButton: {
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    importButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600' as const,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    statsText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  if (currentUser?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Accès non autorisé</Text>
      </View>
    );
  }

const pendingIntentions = intentions.filter(i => i.status === 'pending');
const { data: stats } = trpc.admin.getStats.useQuery();

const approveIntention = async (id: string) => {
  try {
    await approveIntentionMutation.mutateAsync({ id });
    await refetchIntentions();
    Alert.alert('Succès', 'Intention approuvée avec succès.');
  } catch (error) {
    Alert.alert('Erreur', 'Impossible d\'approuver l\'intention.');
  }
};


  const rejectIntention = (id: string) => {
    Alert.alert(
      'Rejeter l\'intention',
      'Êtes-vous sûr de vouloir rejeter cette intention ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Rejeter', 
          style: 'destructive',
          onPress: () => {
            setIntentions(prev => prev.map(intention => 
              intention.id === id 
                ? { ...intention, status: 'rejected' as const, rejectionReason: 'Non conforme aux directives' }
                : intention
            ));
          }
        },
      ]
    );
  };

const createArticle = async () => {
  if (!articleForm.title.trim() || !articleForm.content.trim()) {
    Alert.alert('Erreur', 'Veuillez remplir tous les champs requis.');
    return;
  }

  try {
    await createArticleMutation.mutateAsync({
      title: articleForm.title,
      summary: articleForm.summary,
      content: articleForm.content,
      categoryId: categoryIds[articleForm.category], // Mapper vers category_id
      published: true,
    });
    
    await refetchArticles();
    setArticleForm({ title: '', summary: '', content: '', category: 'Enseignements', coverImage: '' });
    setShowArticleForm(false);
    Alert.alert('Succès', 'Article publié avec succès.');
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de créer l\'article.');
  }
};
  const createTeaching = () => {
    if (!teachingForm.title.trim() || !teachingForm.description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis.');
      return;
    }

    const newTeaching: AudioTeaching = {
      id: Date.now().toString(),
      title: teachingForm.title,
      author: teachingForm.author || currentUser.fullName,
      category: teachingForm.category,
      level: teachingForm.level,
      duration: 1800, // 30 minutes par défaut
      coverImage: teachingForm.coverImage || undefined,
      audioUrl: teachingForm.audioUrl || 'https://example.com/audio.mp3',
      description: teachingForm.description,
      playCount: 0,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    setTeachings(prev => [newTeaching, ...prev]);

    // Créer automatiquement une actualité
    const autoArticle: Article = {
      id: (Date.now() + 1).toString(),
      title: `Nouvel Enseignement: ${newTeaching.title}`,
      summary: `Découvrez le nouvel enseignement "${newTeaching.title}" par ${newTeaching.author}.`,
      content: `Nous avons le plaisir de vous annoncer la publication d'un nouvel enseignement spirituel : "${newTeaching.title}" par ${newTeaching.author}.\n\n${newTeaching.description}\n\nCet enseignement de niveau ${newTeaching.level === 1 ? 'débutant' : newTeaching.level === 2 ? 'intermédiaire' : 'avancé'} est maintenant disponible dans la section Audio de l'application.`,
      author: 'Équipe Espace Ruah',
      category: 'Enseignements',

      publishedAt: new Date().toISOString(),
      isFavorite: false,
    };

    setArticles(prev => [autoArticle, ...prev]);

    setTeachingForm({ title: '', author: '', category: 'Enseignement', level: 1, description: '', audioUrl: '', coverImage: '' });
    setShowTeachingForm(false);
    Alert.alert('Succès', 'Enseignement ajouté et actualité créée automatiquement.');
  };

  const createPrayer = () => {
    if (!prayerForm.title.trim() || !prayerForm.content.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis.');
      return;
    }

    const newPrayer: Prayer = {
      id: Date.now().toString(),
      title: prayerForm.title,
      author: prayerForm.author,
      category: prayerForm.category,
      content: prayerForm.content,
      difficulty: prayerForm.difficulty as 1 | 2 | 3 | 4 | 5,
      isFavorite: false,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPrayers(prev => [newPrayer, ...prev]);
    setPrayerForm({ title: '', author: '', category: '', content: '', difficulty: 1 });
    setShowPrayerForm(false);
    Alert.alert('Succès', 'Prière ajoutée avec succès.');
  };

  const createLectio = () => {
    if (!lectioForm.title.trim() || !lectioForm.content.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis.');
      return;
    }

    const newLectio: LectioPassage = {
      id: Date.now().toString(),
      title: lectioForm.title,
      reference: lectioForm.reference,
      content: lectioForm.content,
      theme: lectioForm.theme,
      liturgicalSeason: lectioForm.liturgicalSeason,
      context: lectioForm.context,
      questions: lectioForm.questions.filter(q => q.trim() !== ''),
      createdAt: new Date().toISOString(),
    };

    setLectioPassages(prev => [newLectio, ...prev]);
    setLectioForm({ title: '', reference: '', content: '', theme: 'Paix', liturgicalSeason: undefined, context: '', questions: ['', '', ''] });
    setShowLectioForm(false);
    Alert.alert('Succès', 'Passage Lectio Divina ajouté avec succès.');
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const parsed = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(';');
      if (columns.length >= 4) {
        parsed.push({
          title: columns[0]?.trim() || '',
          reference: columns[1]?.trim() || '',
          theme: columns[2]?.trim() || 'Paix',
          content: columns[3]?.trim() || '',
          context: columns[4]?.trim() || '',
          question1: columns[5]?.trim() || '',
          question2: columns[6]?.trim() || '',
          question3: columns[7]?.trim() || '',
        });
      }
    }
    
    return parsed;
  };

  const previewCsvData = () => {
    if (!csvData.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir des données CSV.');
      return;
    }
    
    try {
      const parsed = parseCsvData(csvData);
      if (parsed.length === 0) {
        Alert.alert('Erreur', 'Aucune donnée valide trouvée dans le CSV.');
        return;
      }
      
      setCsvPreview(parsed);
    } catch (error) {
      Alert.alert('Erreur', 'Format CSV invalide. Vérifiez la structure de vos données.');
    }
  };

  const importCsvData = async () => {
	  if (csvPreview.length === 0) {
		Alert.alert('Erreur', 'Aucune donnée à importer.');
		return;
	  }
      try {
    await trpc.lectio.batchCreate.useMutation().mutateAsync({
      passages: csvPreview.map(item => ({
        title: item.title,
        reference: item.reference,
        content: item.content,
        theme: item.theme,
        context: item.context,
        questions: [item.question1, item.question2, item.question3].filter(q => q.trim() !== ''),
      }))
    });
    
    await refetchLectio();
	
    const newPassages: LectioPassage[] = csvPreview.map((item, index) => ({
      id: (Date.now() + index).toString(),
      title: item.title,
      reference: item.reference,
      content: item.content,
      theme: ['Paix', 'Amour', 'Espérance', 'Pardon', 'Joie'].includes(item.theme) 
        ? item.theme as LectioPassage['theme'] 
        : 'Paix',
      context: item.context,
      questions: [item.question1, item.question2, item.question3].filter(q => q.trim() !== ''),
      createdAt: new Date().toISOString(),
    }));
    
    setLectioPassages(prev => [...newPassages, ...prev]);
    setCsvData('');
    setCsvPreview([]);
    setShowLectioImport(false);
    
    Alert.alert(
      'Succès', 
      `${newPassages.length} passage(s) Lectio Divina importé(s) avec succès.`
    );
	} catch (error) {
	Alert.alert('Erreur', 'Impossible d\'importer les données CSV.');
	}  
  };



  const deleteItem = (id: string, type: string, setter: any) => {
    Alert.alert(
      `Supprimer ${type}`,
      `Êtes-vous sûr de vouloir supprimer cet élément ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setter((prev: any[]) => prev.filter((item: any) => item.id !== id));
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

const isLoading = createArticleMutation.isPending || 
                  createTeachingMutation.isPending || 
                  createPrayerMutation.isPending || 
                  createLectioMutation.isPending;

// Dans les boutons////////////////////////
<TouchableOpacity 
  style={[styles.modalButton, styles.submitButton]}
  onPress={createArticle}
  disabled={isLoading}
>
  <Text style={[styles.buttonText, styles.submitButtonText]}>
    {isLoading ? 'Création...' : 'Publier'}
  </Text>
</TouchableOpacity>
////////////////////////////////////
const renderDashboard = () => {
  // Vérification que stats existe avant de l'utiliser
  const safeStats = stats || { pendingIntentions: 0 };
  
  return (
    <ScrollView>
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setShowTeachingForm(true)}
        >
          <Plus size={16} color="white" />
          <Text style={styles.quickActionText}>Enseignement</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setShowArticleForm(true)}
        >
          <Plus size={16} color="white" />
          <Text style={styles.quickActionText}>Actualité</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modulesGrid}>
        <TouchableOpacity 
          style={styles.moduleCard}
          onPress={() => setActiveSection('statistics')}
        >
          <BarChart3 size={32} color={colors.primary} />
          <Text style={styles.moduleTitle}>Statistiques</Text>
          <Text style={styles.moduleDescription}>Voir les métriques</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moduleCard}
          onPress={() => setActiveSection('intentions')}
        >
          <MessageCircle size={32} color={colors.primary} />
          <Text style={styles.moduleTitle}>Intentions</Text>
          <Text style={styles.moduleDescription}>Gérer les demandes</Text>
          {safeStats.pendingIntentions > 0 && (
            <View style={styles.moduleBadge}>
              <Text style={styles.moduleBadgeText}>{safeStats.pendingIntentions}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moduleCard}
          onPress={() => setActiveSection('articles')}
        >
          <Newspaper size={32} color={colors.primary} />
          <Text style={styles.moduleTitle}>Actualités</Text>
          <Text style={styles.moduleDescription}>Gérer les articles</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moduleCard}
          onPress={() => setActiveSection('teachings')}
        >
          <Headphones size={32} color={colors.primary} />
          <Text style={styles.moduleTitle}>Enseignements</Text>
          <Text style={styles.moduleDescription}>Gérer l'audio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moduleCard}
          onPress={() => setActiveSection('prayers')}
        >
          <Heart size={32} color={colors.primary} />
          <Text style={styles.moduleTitle}>Prières</Text>
          <Text style={styles.moduleDescription}>Gérer le recueil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moduleCard}
          onPress={() => setActiveSection('lectio')}
        >
          <BookOpen size={32} color={colors.primary} />
          <Text style={styles.moduleTitle}>Lectio Divina</Text>
          <Text style={styles.moduleDescription}>Gérer les passages</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moduleCard}
          onPress={() => setActiveSection('users')}
        >
          <Users size={32} color={colors.primary} />
          <Text style={styles.moduleTitle}>Utilisateurs</Text>
          <Text style={styles.moduleDescription}>Gérer les membres</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moduleCard}
          onPress={() => setActiveSection('popups')}
        >
          <Zap size={32} color={colors.primary} />
          <Text style={styles.moduleTitle}>PopupForge</Text>
          <Text style={styles.moduleDescription}>Gérer les popups</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
  const renderIntentions = () => (
    <ScrollView>
      {pendingIntentions.map((intention) => (
        <View key={intention.id} style={styles.listItem}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{intention.title}</Text>
          </View>
          <Text style={styles.itemContent} numberOfLines={3}>
            {intention.content}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={styles.metaText}>
              Par {intention.isAnonymous ? 'Anonyme' : intention.authorName} • {formatDate(intention.createdAt)}
            </Text>
            <View style={styles.itemActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => approveIntention(intention.id)}
              >
                <CheckCircle size={12} color="white" />
                <Text style={styles.actionButtonText}>Approuver</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => rejectIntention(intention.id)}
              >
                <XCircle size={12} color="white" />
                <Text style={styles.actionButtonText}>Rejeter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderArticles = () => (
    <>
      <ScrollView>
        {articles.map((article) => (
          <View key={article.id} style={styles.listItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{article.title}</Text>
            </View>
            <Text style={styles.itemContent} numberOfLines={2}>
              {article.summary}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={styles.metaText}>
                {article.category} • {formatDate(article.publishedAt)}
              </Text>
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                >
                  <Edit size={12} color="white" />
                  <Text style={styles.actionButtonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteItem(article.id, 'l\'article', setArticles)}
                >
                  <Trash2 size={12} color="white" />
                  <Text style={styles.actionButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowArticleForm(true)}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </>
  );

  const renderTeachings = () => (
    <>
      <ScrollView>
        {teachings.map((teaching) => (
          <View key={teaching.id} style={styles.listItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{teaching.title}</Text>
            </View>
            <Text style={styles.itemContent} numberOfLines={2}>
              {teaching.description}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={styles.metaText}>
                {teaching.author} • {teaching.category} • {Math.floor(teaching.duration / 60)}min
              </Text>
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                >
                  <Edit size={12} color="white" />
                  <Text style={styles.actionButtonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteItem(teaching.id, 'l\'enseignement', setTeachings)}
                >
                  <Trash2 size={12} color="white" />
                  <Text style={styles.actionButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowTeachingForm(true)}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </>
  );

  const renderPrayers = () => (
    <>
      <ScrollView>
        {prayers.map((prayer) => (
          <View key={prayer.id} style={styles.listItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{prayer.title}</Text>
            </View>
            <Text style={styles.itemContent} numberOfLines={2}>
              {prayer.content}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={styles.metaText}>
                {prayer.category} • {prayer.viewCount} vues
              </Text>
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                >
                  <Edit size={12} color="white" />
                  <Text style={styles.actionButtonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteItem(prayer.id, 'la prière', setPrayers)}
                >
                  <Trash2 size={12} color="white" />
                  <Text style={styles.actionButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowPrayerForm(true)}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </>
  );

  const renderLectio = () => (
    <>
      <ScrollView>
        {/* Section Import CSV */}
        <View style={styles.importSection}>
          <Text style={styles.importTitle}>📥 Import CSV</Text>
          <Text style={styles.importDescription}>
            Format attendu : Titre;Référence biblique;Thème;Contenu;Contexte;Question 1;Question 2;Question 3
          </Text>
          
          <View style={styles.importActions}>
            <TouchableOpacity 
              style={styles.previewButton}
              onPress={() => setShowLectioImport(true)}
            >
              <Upload size={16} color="white" />
              <Text style={styles.importButtonText}>Importer CSV</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.importButton}
              onPress={() => setShowLectioForm(true)}
            >
              <Plus size={16} color="white" />
              <Text style={styles.importButtonText}>Ajouter Manuel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.importSection}>
          <View style={styles.statsRow}>
            <Text style={styles.importTitle}>📊 Statistiques</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { width: '30%' }]}>
              <Text style={styles.statValue}>{lectioPassages.length}</Text>
              <Text style={styles.statLabel}>Total passages</Text>
            </View>
            <View style={[styles.statCard, { width: '30%' }]}>
              <Text style={styles.statValue}>
                {lectioPassages.filter(p => p.theme === 'Paix').length}
              </Text>
              <Text style={styles.statLabel}>Thème Paix</Text>
            </View>
            <View style={[styles.statCard, { width: '30%' }]}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Sessions actives</Text>
            </View>
          </View>
        </View>

        {/* Liste des passages */}
        {lectioPassages.map((passage) => (
          <View key={passage.id} style={styles.listItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{passage.title}</Text>
            </View>
            <Text style={styles.itemContent} numberOfLines={2}>
              {passage.reference} - {passage.content}
            </Text>
            <View style={styles.itemMeta}>
              <Text style={styles.metaText}>
                {passage.theme} • {passage.questions.length} questions
                {passage.liturgicalSeason && ` • ${passage.liturgicalSeason}`}
              </Text>
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                >
                  <Edit size={12} color="white" />
                  <Text style={styles.actionButtonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteItem(passage.id, 'le passage', setLectioPassages)}
                >
                  <Trash2 size={12} color="white" />
                  <Text style={styles.actionButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );

  const renderStatistics = () => (
    <ScrollView>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Utilisateurs totaux</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeUsers}</Text>
          <Text style={styles.statLabel}>Utilisateurs actifs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalTeachings}</Text>
          <Text style={styles.statLabel}>Enseignements</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalArticles}</Text>
          <Text style={styles.statLabel}>Actualités</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalPrayers}</Text>
          <Text style={styles.statLabel}>Prières</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalLectio}</Text>
          <Text style={styles.statLabel}>Lectio Divina</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingIntentions}</Text>
          <Text style={styles.statLabel}>Intentions en attente</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>42</Text>
          <Text style={styles.statLabel}>Sessions cette semaine</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'statistics':
        return renderStatistics();
      case 'intentions':
        return renderIntentions();
      case 'articles':
        return renderArticles();
      case 'teachings':
        return renderTeachings();
      case 'prayers':
        return renderPrayers();
      case 'lectio':
        return renderLectio();
      case 'users':
        return <MembersManagementScreen onBack={() => setActiveSection('dashboard')} />;
      case 'popups':
        return <PopupForgeAdminScreen />;
      default:
        return renderDashboard();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Espace d'Administration</Text>
          </View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>


      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Modal Article */}
      <Modal
        visible={showArticleForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowArticleForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle Actualité</Text>
            
            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titre *</Text>
                <TextInput
                  style={styles.input}
                  value={articleForm.title}
                  onChangeText={(text) => setArticleForm(prev => ({ ...prev, title: text }))}
                  placeholder="Titre de l'actualité..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Catégorie</Text>
                <View style={styles.categorySelector}>
					{categories.map((category) => (
  <TouchableOpacity
    key={category.id}
    style={[
      styles.categoryOption,
      articleForm.categoryId === category.id && styles.categoryOptionActive
    ]}
    onPress={() => setArticleForm(prev => ({ ...prev, categoryId: category.id }))}
  >
    <Text style={[
      styles.categoryOptionText,
      articleForm.categoryId === category.id && styles.categoryOptionTextActive
    ]}>
      {category.name}
    </Text>
  </TouchableOpacity>
))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Image de couverture</Text>
                <TouchableOpacity style={styles.uploadButton}>
                  <ImageIcon size={24} color={colors.textSecondary} />
                  <Text style={styles.uploadText}>Télécharger une image</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Résumé</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={articleForm.summary}
                  onChangeText={(text) => setArticleForm(prev => ({ ...prev, summary: text }))}
                  placeholder="Résumé de l'actualité..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Contenu *</Text>
                <RichTextEditor
                  value={articleForm.content}
                  onChangeText={(text) => setArticleForm(prev => ({ ...prev, content: text }))}
                  placeholder="Contenu complet de l'actualité..."
                  height={200}
                  showToolbar={true}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowArticleForm(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={createArticle}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>Publier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Enseignement */}
      <Modal
        visible={showTeachingForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeachingForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvel Enseignement</Text>
            
            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titre *</Text>
                <TextInput
                  style={styles.input}
                  value={teachingForm.title}
                  onChangeText={(text) => setTeachingForm(prev => ({ ...prev, title: text }))}
                  placeholder="Titre de l'enseignement..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Auteur</Text>
                <TextInput
                  style={styles.input}
                  value={teachingForm.author}
                  onChangeText={(text) => setTeachingForm(prev => ({ ...prev, author: text }))}
                  placeholder="Nom de l'auteur..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Catégorie</Text>
                <View style={styles.categorySelector}>
                  {(['Enseignement', 'Prédication', 'Témoignage', 'Méditation'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        teachingForm.category === cat && styles.categoryOptionActive
                      ]}
                      onPress={() => setTeachingForm(prev => ({ ...prev, category: cat }))}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        teachingForm.category === cat && styles.categoryOptionTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Niveau</Text>
                <View style={styles.categorySelector}>
                  {[1, 2, 3].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.categoryOption,
                        teachingForm.level === level && styles.categoryOptionActive
                      ]}
                      onPress={() => setTeachingForm(prev => ({ ...prev, level: level as AudioTeaching['level'] }))}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        teachingForm.level === level && styles.categoryOptionTextActive
                      ]}>
                        {level === 1 ? 'Débutant' : level === 2 ? 'Intermédiaire' : 'Avancé'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Fichier Audio</Text>
                <TouchableOpacity style={styles.uploadButton}>
                  <Volume2 size={24} color={colors.textSecondary} />
                  <Text style={styles.uploadText}>Télécharger un fichier audio</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Image de couverture</Text>
                <TouchableOpacity style={styles.uploadButton}>
                  <ImageIcon size={24} color={colors.textSecondary} />
                  <Text style={styles.uploadText}>Télécharger une image</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, { height: 100 }]}
                  value={teachingForm.description}
                  onChangeText={(text) => setTeachingForm(prev => ({ ...prev, description: text }))}
                  placeholder="Description de l'enseignement..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTeachingForm(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={createTeaching}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Prière */}
      <Modal
        visible={showPrayerForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrayerForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle Prière</Text>
            
            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titre *</Text>
                <TextInput
                  style={styles.input}
                  value={prayerForm.title}
                  onChangeText={(text) => setPrayerForm(prev => ({ ...prev, title: text }))}
                  placeholder="Titre de la prière..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Auteur</Text>
                <TextInput
                  style={styles.input}
                  value={prayerForm.author}
                  onChangeText={(text) => setPrayerForm(prev => ({ ...prev, author: text }))}
                  placeholder="Auteur de la prière..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Catégorie</Text>
                <TextInput
                  style={styles.input}
                  value={prayerForm.category}
                  onChangeText={(text) => setPrayerForm(prev => ({ ...prev, category: text }))}
                  placeholder="Catégorie de la prière..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>



              <View style={styles.formGroup}>
                <Text style={styles.label}>Contenu *</Text>
                <RichTextEditor
                  value={prayerForm.content}
                  onChangeText={(text) => setPrayerForm(prev => ({ ...prev, content: text }))}
                  placeholder="Contenu de la prière..."
                  height={200}
                  showToolbar={true}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPrayerForm(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={createPrayer}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Lectio */}
      <Modal
        visible={showLectioForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLectioForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau Passage Lectio</Text>
            
            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titre *</Text>
                <TextInput
                  style={styles.input}
                  value={lectioForm.title}
                  onChangeText={(text) => setLectioForm(prev => ({ ...prev, title: text }))}
                  placeholder="Titre du passage..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Référence biblique</Text>
                <TextInput
                  style={styles.input}
                  value={lectioForm.reference}
                  onChangeText={(text) => setLectioForm(prev => ({ ...prev, reference: text }))}
                  placeholder="Ex: Matthieu 5, 3-12"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Thème</Text>
                <View style={styles.categorySelector}>
                  {(['Paix', 'Amour', 'Espérance', 'Pardon', 'Joie'] as const).map((theme) => (
                    <TouchableOpacity
                      key={theme}
                      style={[
                        styles.categoryOption,
                        lectioForm.theme === theme && styles.categoryOptionActive
                      ]}
                      onPress={() => setLectioForm(prev => ({ ...prev, theme }))}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        lectioForm.theme === theme && styles.categoryOptionTextActive
                      ]}>
                        {theme}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Temps liturgique (optionnel)</Text>
                <View style={styles.categorySelector}>
                  {(['Avent', 'Carême', 'Pâques', 'Temps ordinaire'] as const).map((season) => (
                    <TouchableOpacity
                      key={season}
                      style={[
                        styles.categoryOption,
                        lectioForm.liturgicalSeason === season && styles.categoryOptionActive
                      ]}
                      onPress={() => setLectioForm(prev => ({ 
                        ...prev, 
                        liturgicalSeason: prev.liturgicalSeason === season ? undefined : season 
                      }))}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        lectioForm.liturgicalSeason === season && styles.categoryOptionTextActive
                      ]}>
                        {season}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>



              <View style={styles.formGroup}>
                <Text style={styles.label}>Contenu *</Text>
                <TextInput
                  style={[styles.input, { height: 100 }]}
                  value={lectioForm.content}
                  onChangeText={(text) => setLectioForm(prev => ({ ...prev, content: text }))}
                  placeholder="Texte du passage biblique..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Contexte</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={lectioForm.context}
                  onChangeText={(text) => setLectioForm(prev => ({ ...prev, context: text }))}
                  placeholder="Contexte historique ou spirituel..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Questions de méditation</Text>
                {lectioForm.questions.map((question, index) => (
                  <TextInput
                    key={index}
                    style={[styles.input, styles.questionInput]}
                    value={question}
                    onChangeText={(text) => {
                      const newQuestions = [...lectioForm.questions];
                      newQuestions[index] = text;
                      setLectioForm(prev => ({ ...prev, questions: newQuestions }));
                    }}
                    placeholder={`Question ${index + 1}...`}
                    placeholderTextColor={colors.textSecondary}
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLectioForm(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={createLectio}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Import CSV Lectio */}
      <Modal
        visible={showLectioImport}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLectioImport(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import CSV - Lectio Divina</Text>
            
            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Format CSV attendu :</Text>
                <Text style={styles.importDescription}>
                  Titre;Référence biblique;Thème;Contenu;Contexte;Question 1;Question 2;Question 3
                </Text>
                <Text style={styles.importDescription}>
                  Exemple :
                  Les Béatitudes;Matthieu 5,3-12;Paix;Heureux les pauvres de cœur...;Sermon sur la montagne;Que signifie être pauvre de cœur ?;Comment vivre cette béatitude ?;Quel fruit pour ma vie ?
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Données CSV *</Text>
                <TextInput
                  style={styles.csvInput}
                  value={csvData}
                  onChangeText={setCsvData}
                  placeholder="Collez vos données CSV ici...\nTitre1;Référence1;Thème1;Contenu1;Contexte1;Q1;Q2;Q3\nTitre2;Référence2;Thème2;Contenu2;Contexte2;Q1;Q2;Q3"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />
              </View>

              {csvPreview.length > 0 && (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewTitle}>
                    Prévisualisation ({csvPreview.length} passage(s))
                  </Text>
                  <ScrollView style={{ maxHeight: 150 }}>
                    {csvPreview.slice(0, 3).map((item, index) => (
                      <View key={index} style={styles.previewItem}>
                        <Text style={styles.previewItemTitle}>{item.title}</Text>
                        <Text style={styles.previewItemMeta}>
                          {item.reference} • {item.theme}
                        </Text>
                      </View>
                    ))}
                    {csvPreview.length > 3 && (
                      <Text style={styles.statsText}>
                        ... et {csvPreview.length - 3} autre(s) passage(s)
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowLectioImport(false);
                  setCsvData('');
                  setCsvPreview([]);
                }}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
              </TouchableOpacity>
              
              {csvPreview.length === 0 ? (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={previewCsvData}
                >
                  <Text style={[styles.buttonText, styles.submitButtonText]}>Prévisualiser</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={importCsvData}
                >
                  <Text style={[styles.buttonText, styles.submitButtonText]}>Importer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}