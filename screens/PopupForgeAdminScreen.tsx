import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  BarChart3,
  Calendar,
  Users,
  Target,
  Settings,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePopupForge } from '@/contexts/PopupForgeContext';
import { PopupForge, PopupAction } from '@/types';
import RichTextEditor from '@/components/RichTextEditor';

export default function PopupForgeAdminScreen() {
  const { colors } = useTheme();
  const { popups, createPopup, updatePopup, deletePopup, getAnalytics } = usePopupForge();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupForge | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as PopupForge['type'],
    priority: 'medium' as PopupForge['priority'],
    targetAudience: 'all' as PopupForge['targetAudience'],
    displayConditions: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      maxDisplayCount: '',
      displayFrequency: 'once' as PopupForge['displayConditions']['displayFrequency'],
      pages: [] as string[],
      userRoles: [] as ('admin' | 'user' | 'moderator')[],
      minUserAge: '',
    },
    design: {
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      borderColor: '#2563eb',
      icon: '',
      position: 'center' as PopupForge['design']['position'],
      animation: 'fade' as PopupForge['design']['animation'],
      dismissible: true,
      autoClose: '',
    },
    actions: [] as PopupAction[],
    status: 'draft' as PopupForge['status'],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      priority: 'medium',
      targetAudience: 'all',
      displayConditions: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        maxDisplayCount: '',
        displayFrequency: 'once',
        pages: [],
        userRoles: [],
        minUserAge: '',
      },
      design: {
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        borderColor: '#2563eb',
        icon: '',
        position: 'center',
        animation: 'fade',
        dismissible: true,
        autoClose: '',
      },
      actions: [],
      status: 'draft',
    });
  };

  const handleCreate = () => {
    setEditingPopup(null);
    resetForm();
    setShowCreateModal(true);
  };

  const handleEdit = (popup: PopupForge) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title,
      content: popup.content,
      type: popup.type,
      priority: popup.priority,
      targetAudience: popup.targetAudience,
      displayConditions: {
        startDate: popup.displayConditions.startDate.split('T')[0],
        endDate: popup.displayConditions.endDate ? popup.displayConditions.endDate.split('T')[0] : '',
        maxDisplayCount: popup.displayConditions.maxDisplayCount?.toString() || '',
        displayFrequency: popup.displayConditions.displayFrequency,
        pages: popup.displayConditions.pages || [],
        userRoles: popup.displayConditions.userRoles || [],
        minUserAge: popup.displayConditions.minUserAge?.toString() || '',
      },
      design: {
        backgroundColor: popup.design.backgroundColor,
        textColor: popup.design.textColor,
        borderColor: popup.design.borderColor || popup.design.backgroundColor,
        icon: popup.design.icon || '',
        position: popup.design.position,
        animation: popup.design.animation,
        dismissible: popup.design.dismissible,
        autoClose: popup.design.autoClose?.toString() || '',
      },
      actions: popup.actions || [],
      status: popup.status,
    });
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('Erreur', 'Le titre et le contenu sont obligatoires');
      return;
    }

    const popupData = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      priority: formData.priority,
      targetAudience: formData.targetAudience,
      displayConditions: {
        startDate: new Date(formData.displayConditions.startDate).toISOString(),
        endDate: formData.displayConditions.endDate 
          ? new Date(formData.displayConditions.endDate).toISOString() 
          : undefined,
        maxDisplayCount: formData.displayConditions.maxDisplayCount 
          ? parseInt(formData.displayConditions.maxDisplayCount) 
          : undefined,
        displayFrequency: formData.displayConditions.displayFrequency,
        pages: formData.displayConditions.pages.length > 0 ? formData.displayConditions.pages : undefined,
        userRoles: formData.displayConditions.userRoles.length > 0 ? formData.displayConditions.userRoles : undefined,
        minUserAge: formData.displayConditions.minUserAge 
          ? parseInt(formData.displayConditions.minUserAge) 
          : undefined,
      },
      design: {
        backgroundColor: formData.design.backgroundColor,
        textColor: formData.design.textColor,
        borderColor: formData.design.borderColor,
        icon: formData.design.icon || undefined,
        position: formData.design.position,
        animation: formData.design.animation,
        dismissible: formData.design.dismissible,
        autoClose: formData.design.autoClose 
          ? parseInt(formData.design.autoClose) 
          : undefined,
      },
      actions: formData.actions.length > 0 ? formData.actions : undefined,
      status: formData.status,
      createdBy: 'admin',
    };

    try {
      if (editingPopup) {
        await updatePopup(editingPopup.id, popupData);
      } else {
        await createPopup(popupData);
      }
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le popup');
    }
  };

  const handleDelete = (popup: PopupForge) => {
    Alert.alert(
      'Supprimer le popup',
      `Êtes-vous sûr de vouloir supprimer "${popup.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deletePopup(popup.id),
        },
      ]
    );
  };

  const toggleStatus = (popup: PopupForge) => {
    const newStatus = popup.status === 'active' ? 'paused' : 'active';
    updatePopup(popup.id, { status: newStatus });
  };

  const getStatusColor = (status: PopupForge['status']) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'draft': return '#6b7280';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: PopupForge['type']) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'promotion': return '🎯';
      case 'announcement': return '📢';
      default: return 'ℹ️';
    }
  };

  const addAction = () => {
    const newAction: PopupAction = {
      id: Date.now().toString(),
      label: 'Nouvelle action',
      type: 'button',
      action: 'close',
      style: 'primary',
    };
    setFormData({
      ...formData,
      actions: [...formData.actions, newAction],
    });
  };

  const updateAction = (index: number, updates: Partial<PopupAction>) => {
    const updatedActions = formData.actions.map((action, i) =>
      i === index ? { ...action, ...updates } : action
    );
    setFormData({ ...formData, actions: updatedActions });
  };

  const removeAction = (index: number) => {
    const updatedActions = formData.actions.filter((_, i) => i !== index);
    setFormData({ ...formData, actions: updatedActions });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Gestion PopupForge
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={handleCreate}
          testID="create-popup-button"
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.createButtonText}>Créer</Text>
        </TouchableOpacity>
      </View>

      {/* Popup List */}
      <ScrollView style={styles.content}>
        {popups.map((popup) => {
          const analytics = getAnalytics(popup.id);
          
          return (
            <View key={popup.id} style={[styles.popupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.typeIcon}>{getTypeIcon(popup.type)}</Text>
                  <View style={styles.titleInfo}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {popup.title}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                      {popup.targetAudience} • {popup.priority}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(popup.status) }]}>
                  <Text style={styles.statusText}>{popup.status}</Text>
                </View>
              </View>

              {/* Card Content */}
              <Text style={[styles.cardContent, { color: colors.textSecondary }]} numberOfLines={2}>
                {popup.content}
              </Text>

              {/* Analytics */}
              {analytics && (
                <View style={styles.analytics}>
                  <View style={styles.analyticsItem}>
                    <Eye size={16} color={colors.textSecondary} />
                    <Text style={[styles.analyticsText, { color: colors.textSecondary }]}>
                      {analytics.impressions}
                    </Text>
                  </View>
                  <View style={styles.analyticsItem}>
                    <Target size={16} color={colors.textSecondary} />
                    <Text style={[styles.analyticsText, { color: colors.textSecondary }]}>
                      {analytics.clickRate}
                    </Text>
                  </View>
                  <View style={styles.analyticsItem}>
                    <BarChart3 size={16} color={colors.textSecondary} />
                    <Text style={[styles.analyticsText, { color: colors.textSecondary }]}>
                      {analytics.conversionRate}
                    </Text>
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleStatus(popup)}
                  testID={`toggle-status-${popup.id}`}
                >
                  {popup.status === 'active' ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowAnalytics(popup.id)}
                  testID={`analytics-${popup.id}`}
                >
                  <BarChart3 size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(popup)}
                  testID={`edit-${popup.id}`}
                >
                  <Edit3 size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(popup)}
                  testID={`delete-${popup.id}`}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={[styles.modalCancelButton, { color: colors.primary }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingPopup ? 'Modifier' : 'Créer'} un popup
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.modalSaveButton, { color: colors.primary }]}>
                Sauvegarder
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Informations de base
              </Text>
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="Titre du popup"
                placeholderTextColor={colors.textSecondary}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="Contenu du popup..."
                placeholderTextColor={colors.textSecondary}
                value={formData.content}
                onChangeText={(text) => setFormData({ ...formData, content: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Type and Priority */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Type et priorité
              </Text>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Type</Text>
                  {/* Type selector would go here */}
                </View>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Priorité</Text>
                  {/* Priority selector would go here */}
                </View>
              </View>
            </View>

            {/* Design */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Design
              </Text>
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Couleur de fond</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="#3b82f6"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.design.backgroundColor}
                    onChangeText={(text) => setFormData({
                      ...formData,
                      design: { ...formData.design, backgroundColor: text }
                    })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Couleur du texte</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="#ffffff"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.design.textColor}
                    onChangeText={(text) => setFormData({
                      ...formData,
                      design: { ...formData.design, textColor: text }
                    })}
                  />
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Peut être fermé
                </Text>
                <Switch
                  value={formData.design.dismissible}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    design: { ...formData.design, dismissible: value }
                  })}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Actions
                </Text>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.primary }]}
                  onPress={addAction}
                >
                  <Plus size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {formData.actions.map((action, index) => (
                <View key={action.id} style={[styles.actionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    placeholder="Libellé de l'action"
                    placeholderTextColor={colors.textSecondary}
                    value={action.label}
                    onChangeText={(text) => updateAction(index, { label: text })}
                  />
                  <TouchableOpacity
                    style={styles.removeActionButton}
                    onPress={() => removeAction(index)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  popupCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  titleInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  analytics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  analyticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  analyticsText: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalCancelButton: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  removeActionButton: {
    padding: 4,
  },
});