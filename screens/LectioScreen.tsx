import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Shuffle, 
  Play,
  Save,
  Download,
  ArrowLeft,
  Timer,
  Volume2,
  Edit3,
  Heart,
  Search,
  CheckCircle,
  Calendar,
  Plus,
  Edit
} from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockLectioPassages } from '@/data/mockData';
import { LectioPassage } from '@/types';
import PublicationScheduler, { PublicationSchedule } from '@/components/PublicationScheduler';
import { RichTextEditor } from '@/components/RichTextEditor';

interface LectioSession {
  id: string;
  passageId: string;
  userId: string;
  step: 1 | 2 | 3 | 4;
  notes: {
    meditation?: string;
    prayer?: string;
    contemplation?: string;
  };
  startedAt: string;
  lastSavedAt: string;
  completed: boolean;
  duration?: number;
}

export default function LectioScreen() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [selectedPassage, setSelectedPassage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [sessions, setSessions] = useState<LectioSession[]>([]);
  const [currentSession, setCurrentSession] = useState<LectioSession | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<PublicationSchedule | null>(null);
  const [passages, setPassages] = useState(mockLectioPassages);
  const [editingPassage, setEditingPassage] = useState<LectioPassage | null>(null);
  
  const [editorData, setEditorData] = useState({
    title: '',
    reference: '',
    content: '',
    theme: 'Paix' as keyof typeof themeColors,
    context: '',
    questions: ['', '', ''],
  });

  const themeColors = {
    'Paix': '#3b82f6',
    'Amour': '#ec4899',
    'Espérance': '#f59e0b',
    'Pardon': '#8b5cf6',
    'Joie': '#eab308',
  };

  const steps = [
    { id: 1, name: 'Lectio', title: 'Lecture', color: '#3b82f6', icon: '📖' },
    { id: 2, name: 'Meditatio', title: 'Méditation', color: '#10b981', icon: '🤔' },
    { id: 3, name: 'Oratio', title: 'Prière', color: '#f59e0b', icon: '🙏' },
    { id: 4, name: 'Contemplatio', title: 'Contemplation', color: '#8b5cf6', icon: '✨' },
  ];

  const selectedPassageData = mockLectioPassages.find(p => p.id === selectedPassage);
  const filteredPassages = mockLectioPassages.filter(passage =>
    passage.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    passage.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    passage.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            Alert.alert('Temps écoulé', 'Votre temps de contemplation est terminé.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startSession = (passageId: string) => {
    const newSession: LectioSession = {
      id: Date.now().toString(),
      passageId,
      userId: currentUser?.id || '',
      step: 1,
      notes: {},
      startedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
      completed: false,
    };
    
    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);
    setSelectedPassage(passageId);
    setCurrentStep(1);
  };

  const saveNotes = (step: number, content: string) => {
    if (!currentSession) return;

    const noteKey = step === 2 ? 'meditation' : step === 3 ? 'prayer' : 'contemplation';
    const updatedSession = {
      ...currentSession,
      notes: {
        ...currentSession.notes,
        [noteKey]: content,
      },
      lastSavedAt: new Date().toISOString(),
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const completeSession = () => {
    if (!currentSession) return;

    const completedSession = {
      ...currentSession,
      completed: true,
      duration: Math.floor((Date.now() - new Date(currentSession.startedAt).getTime()) / 60000),
    };

    setCurrentSession(completedSession);
    setSessions(prev => prev.map(s => s.id === completedSession.id ? completedSession : s));
    
    Alert.alert(
      'Session terminée',
      'Félicitations ! Vous avez terminé cette session de Lectio Divina.',
      [
        { text: 'Nouvelle session', onPress: () => backToSelection() },
        { text: 'Exporter mes réflexions', onPress: () => setShowExportModal(true) },
      ]
    );
  };

  const backToSelection = () => {
    setSelectedPassage(null);
    setCurrentStep(1);
    setCurrentSession(null);
    setIsTimerRunning(false);
    setTimeLeft(0);
  };

  const startTimer = (minutes: number) => {
    setTimeLeft(minutes * 60);
    setIsTimerRunning(true);
    setShowTimer(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportReflections = () => {
    if (!currentSession || !selectedPassageData) return;

    const exportText = `
LECTIO DIVINA - ${selectedPassageData.title}
${selectedPassageData.reference}
Date: ${new Date().toLocaleDateString('fr-FR')}

PASSAGE:
${selectedPassageData.content}

MES RÉFLEXIONS:

MÉDITATION:
${currentSession.notes.meditation || 'Aucune note'}

PRIÈRE:
${currentSession.notes.prayer || 'Aucune note'}

CONTEMPLATION:
${currentSession.notes.contemplation || 'Aucune note'}
    `.trim();

    Alert.alert(
      'Réflexions exportées',
      'Vos réflexions ont été préparées pour l\'export.',
      [{ text: 'OK', onPress: () => setShowExportModal(false) }]
    );
  };

  const getRandomPassage = () => {
    const randomIndex = Math.floor(Math.random() * mockLectioPassages.length);
    startSession(mockLectioPassages[randomIndex].id);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.text,
      flex: 1,
      marginLeft: 16,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginTop: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    content: {
      flex: 1,
    },
    suggestionCard: {
      backgroundColor: colors.surface,
      margin: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    suggestionBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    suggestionBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
    passageTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 8,
    },
    passageReference: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600' as const,
      marginBottom: 12,
    },
    passagePreview: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    passageMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    themeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    themeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600' as const,
    },
    startButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    startButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600' as const,
    },
    passagesList: {
      padding: 20,
      gap: 16,
    },
    passageCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    randomButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      padding: 16,
      margin: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    randomButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold' as const,
    },
    // Lectio Interface
    lectioInterface: {
      flex: 1,
    },
    lectioHeader: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    lectioTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.text,
      flex: 1,
      marginLeft: 16,
    },
    timerDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    timerText: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      color: isTimerRunning ? colors.secondary : colors.textSecondary,
    },
    stepsHeader: {
      backgroundColor: colors.surface,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stepTab: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    stepTabActive: {
      borderBottomColor: colors.primary,
    },
    stepIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    stepTitle: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.textSecondary,
    },
    stepTitleActive: {
      color: colors.primary,
    },
    stepContent: {
      flex: 1,
      padding: 20,
    },
    stepHeader: {
      marginBottom: 20,
    },
    stepName: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 8,
    },
    stepDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    passageContent: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    passageText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      fontStyle: 'italic' as const,
    },
    contextSection: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    contextTitle: {
      fontSize: 14,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 8,
    },
    contextText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    questionsContainer: {
      gap: 12,
    },
    questionCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    questionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    notesSection: {
      marginTop: 20,
    },
    notesTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    notesInput: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      textAlignVertical: 'top',
      minHeight: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignSelf: 'flex-end',
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600' as const,
    },
    contemplationActions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    actionButtonText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500' as const,
    },
    actionButtonTextPrimary: {
      color: 'white',
    },
    completeButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      margin: 20,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    completeButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold' as const,
    },
    // Modal styles
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
      width: '80%',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 16,
    },
    timerOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    timerOption: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    timerOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    timerOptionText: {
      fontSize: 14,
      color: colors.text,
    },
    timerOptionTextActive: {
      color: 'white',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
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
    confirmButton: {
      backgroundColor: colors.primary,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    confirmButtonText: {
      color: 'white',
    },
  });

  const renderStepContent = () => {
    if (!selectedPassageData || !currentSession) return null;

    switch (currentStep) {
      case 1: // Lectio
        return (
          <View>
            <View style={styles.stepHeader}>
              <Text style={styles.stepName}>📖 Lectio - Lecture</Text>
              <Text style={styles.stepDescription}>
                Lisez lentement le passage biblique. Laissez les mots résonner en vous.
              </Text>
            </View>
            
            <View style={styles.passageContent}>
              <Text style={styles.passageReference}>
                {selectedPassageData.reference}
              </Text>
              <Text style={styles.passageText}>
                {selectedPassageData.content}
              </Text>
              
              {selectedPassageData.context && (
                <View style={styles.contextSection}>
                  <Text style={styles.contextTitle}>Contexte</Text>
                  <Text style={styles.contextText}>
                    {selectedPassageData.context}
                  </Text>
                </View>
              )}
            </View>

            {selectedPassageData.audioUrl && (
              <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
                <Volume2 size={16} color="white" />
                <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                  Écouter le passage
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 2: // Meditatio
        return (
          <View>
            <View style={styles.stepHeader}>
              <Text style={styles.stepName}>🤔 Meditatio - Méditation</Text>
              <Text style={styles.stepDescription}>
                Réfléchissez sur le passage. Que vous dit-il aujourd'hui ?
              </Text>
            </View>

            <View style={styles.questionsContainer}>
              {selectedPassageData.questions.map((question, index) => (
                <View key={index} style={styles.questionCard}>
                  <Text style={styles.questionText}>{question}</Text>
                </View>
              ))}
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>
                <Edit3 size={16} color={colors.text} />
                Notes de réflexion personnelles
              </Text>
              <TextInput
                style={styles.notesInput}
                value={currentSession.notes.meditation || ''}
                onChangeText={(text) => saveNotes(2, text)}
                placeholder="Notez vos réflexions sur ce passage..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => Alert.alert('Sauvegardé', 'Vos notes ont été sauvegardées automatiquement.')}
              >
                <Save size={12} color="white" />
                <Text style={styles.saveButtonText}>Auto-sauvegarde</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3: // Oratio
        return (
          <View>
            <View style={styles.stepHeader}>
              <Text style={styles.stepName}>🙏 Oratio - Prière</Text>
              <Text style={styles.stepDescription}>
                Parlez à Dieu de ce qui vous touche dans ce passage.
              </Text>
            </View>

            <View style={styles.passageContent}>
              <Text style={styles.contextText}>
                Prenez un moment pour dialoguer avec Dieu. Partagez vos pensées, 
                vos questions, vos émotions suscitées par cette lecture.
              </Text>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>
                <Heart size={16} color={colors.text} />
                Prières fruits de ma méditation
              </Text>
              <TextInput
                style={styles.notesInput}
                value={currentSession.notes.prayer || ''}
                onChangeText={(text) => saveNotes(3, text)}
                placeholder="Exprimez votre prière à Dieu..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            </View>
          </View>
        );

      case 4: // Contemplatio
        return (
          <View>
            <View style={styles.stepHeader}>
              <Text style={styles.stepName}>✨ Contemplatio - Contemplation</Text>
              <Text style={styles.stepDescription}>
                Restez en silence devant Dieu. Laissez-vous aimer.
              </Text>
            </View>

            <View style={styles.contemplationActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowTimer(true)}
              >
                <Timer size={16} color={colors.text} />
                <Text style={styles.actionButtonText}>Minuteur</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Volume2 size={16} color={colors.text} />
                <Text style={styles.actionButtonText}>Sons nature</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passageContent}>
              <Text style={styles.contextText}>
                Entrez dans un temps de silence contemplatif. 
                Laissez Dieu agir en vous sans chercher à comprendre ou analyser.
              </Text>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>
                <Star size={16} color={colors.text} />
                Fruits de ma lectio et résolutions prises
              </Text>
              <TextInput
                style={styles.notesInput}
                value={currentSession.notes.contemplation || ''}
                onChangeText={(text) => saveNotes(4, text)}
                placeholder="Quels fruits tirez-vous de cette lectio ? Quelles résolutions prenez-vous ?"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (selectedPassage) {
    return (
      <View style={styles.container}>
        <View style={styles.lectioHeader}>
          <TouchableOpacity style={styles.backButton} onPress={backToSelection}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.lectioTitle} numberOfLines={1}>
            {selectedPassageData?.title}
          </Text>
          
          {isTimerRunning && (
            <View style={styles.timerDisplay}>
              <Clock size={16} color={isTimerRunning ? colors.secondary : colors.textSecondary} />
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          )}
        </View>

        <View style={styles.lectioInterface}>
          <View style={styles.stepsHeader}>
            {steps.map((step) => (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.stepTab,
                  currentStep === step.id && styles.stepTabActive
                ]}
                onPress={() => setCurrentStep(step.id)}
              >
                <Text style={styles.stepIcon}>{step.icon}</Text>
                <Text style={[
                  styles.stepTitle,
                  currentStep === step.id && styles.stepTitleActive
                ]}>
                  {step.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.stepContent}>
            {renderStepContent()}
          </ScrollView>
        </View>

        {currentStep === 4 && (
          <TouchableOpacity style={styles.completeButton} onPress={completeSession}>
            <CheckCircle size={20} color="white" />
            <Text style={styles.completeButtonText}>Terminer la session</Text>
          </TouchableOpacity>
        )}

        {/* Timer Modal */}
        <Modal
          visible={showTimer}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTimer(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Minuteur de contemplation</Text>
              
              <View style={styles.timerOptions}>
                {[5, 10, 15, 20].map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.timerOption,
                      timerMinutes === minutes && styles.timerOptionActive
                    ]}
                    onPress={() => setTimerMinutes(minutes)}
                  >
                    <Text style={[
                      styles.timerOptionText,
                      timerMinutes === minutes && styles.timerOptionTextActive
                    ]}>
                      {minutes} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowTimer(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => startTimer(timerMinutes)}
                >
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>Démarrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Export Modal */}
        <Modal
          visible={showExportModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowExportModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Exporter mes réflexions</Text>
              
              <Text style={[styles.stepDescription, { textAlign: 'center', marginBottom: 20 }]}>
                Vos notes de méditation, prière et contemplation seront exportées au format texte.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowExportModal(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={exportReflections}
                >
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>Exporter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lectio Divina</Text>
        <Text style={styles.subtitle}>
          Découvrez la lecture priante des Écritures en 4 étapes traditionnelles
        </Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un passage..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionBadge}>
            <Text style={styles.suggestionBadgeText}>SUGGESTION DU JOUR</Text>
          </View>
          
          <Text style={styles.passageTitle}>
            {mockLectioPassages[0].title}
          </Text>
          <Text style={styles.passageReference}>
            {mockLectioPassages[0].reference}
          </Text>
          <Text style={styles.passagePreview} numberOfLines={3}>
            {mockLectioPassages[0].content}
          </Text>
          
          <View style={styles.passageMeta}>
            <View style={styles.metaLeft}>
              <View style={[
                styles.themeBadge, 
                { backgroundColor: themeColors[mockLectioPassages[0].theme] }
              ]}>
                <Text style={styles.themeText}>
                  {mockLectioPassages[0].theme}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => startSession(mockLectioPassages[0].id)}
            >
              <Play size={14} color="white" />
              <Text style={styles.startButtonText}>Commencer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.randomButton} onPress={getRandomPassage}>
          <Shuffle size={20} color="white" />
          <Text style={styles.randomButtonText}>Passage au hasard</Text>
        </TouchableOpacity>

        <View style={styles.passagesList}>
          {filteredPassages.slice(1).map((passage) => (
            <View key={passage.id} style={styles.passageCard}>
              <Text style={styles.passageTitle}>{passage.title}</Text>
              <Text style={styles.passageReference}>{passage.reference}</Text>
              <Text style={styles.passagePreview} numberOfLines={2}>
                {passage.content}
              </Text>
              
              <View style={styles.passageMeta}>
                <View style={styles.metaLeft}>
                  <View style={[
                    styles.themeBadge, 
                    { backgroundColor: themeColors[passage.theme] }
                  ]}>
                    <Text style={styles.themeText}>{passage.theme}</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={() => startSession(passage.id)}
                >
                  <Play size={14} color="white" />
                  <Text style={styles.startButtonText}>Commencer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}