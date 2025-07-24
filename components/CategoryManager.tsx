import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Plus, Edit3, Trash2, X, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategories: (categories: Category[]) => Promise<void>;
  title?: string;
  allowHierarchy?: boolean;
  allowColors?: boolean;
  allowIcons?: boolean;
  maxDepth?: number;
}

const PREDEFINED_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
];

const PREDEFINED_ICONS = [
  '🙏', '📖', '✝️', '🕊️', '💒', '🌟', '❤️', '🔥', '🌿', '⭐',
  '🎵', '📚', '💡', '🌅', '🌙', '🕯️', '👑', '🎯', '🌈', '💎'
];

export default function CategoryManager({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  title = 'Gestion des Catégories',
  allowHierarchy = true,
  allowColors = true,
  allowIcons = true,
  maxDepth = 3
}: CategoryManagerProps) {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PREDEFINED_COLORS[0],
    icon: PREDEFINED_ICONS[0],
    parentId: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: PREDEFINED_COLORS[0],
      icon: PREDEFINED_ICONS[0],
      parentId: '',
      isActive: true
    });
    setEditingCategory(null);
  };

  const openAddModal = (parentId?: string) => {
    resetForm();
    if (parentId) {
      setFormData(prev => ({ ...prev, parentId }));
    }
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon || PREDEFINED_ICONS[0],
      parentId: category.parentId || '',
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom de la catégorie est requis');
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        icon: allowIcons ? formData.icon : undefined,
        parentId: allowHierarchy && formData.parentId ? formData.parentId : undefined,
        isActive: formData.isActive,
        order: editingCategory ? editingCategory.order : categories.length
      };

      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, categoryData);
      } else {
        await onAddCategory(categoryData);
      }

      setShowModal(false);
      resetForm();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder la catégorie');
    }
  };

  const handleDelete = (category: Category) => {
    const childCategories = categories.filter(cat => cat.parentId === category.id);
    
    let message = `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`;
    if (childCategories.length > 0) {
      message += `\n\nAttention : ${childCategories.length} sous-catégorie(s) seront également supprimée(s).`;
    }

    Alert.alert(
      'Confirmer la suppression',
      message,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => onDeleteCategory(category.id)
        }
      ]
    );
  };

  const toggleActive = async (category: Category) => {
    await onUpdateCategory(category.id, { isActive: !category.isActive });
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const getChildCategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const getCategoryDepth = (category: Category): number => {
    if (!category.parentId) return 0;
    const parent = categories.find(cat => cat.id === category.parentId);
    return parent ? getCategoryDepth(parent) + 1 : 0;
  };

  const renderCategory = (category: Category, depth: number = 0) => {
    const childCategories = getChildCategories(category.id);
    const canAddChild = allowHierarchy && depth < maxDepth - 1;

    return (
      <View key={category.id} style={[styles.categoryItem, { marginLeft: depth * 20 }]}>
        <View style={[styles.categoryHeader, { borderLeftColor: category.color }]}>
          <View style={styles.categoryInfo}>
            {allowIcons && category.icon && (
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            )}
            <View style={styles.categoryText}>
              <Text style={[styles.categoryName, !category.isActive && styles.inactiveText]}>
                {category.name}
              </Text>
              {category.description && (
                <Text style={styles.categoryDescription}>{category.description}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.categoryActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.toggleButton]}
              onPress={() => toggleActive(category)}
            >
              <Text style={[styles.actionButtonText, { color: category.isActive ? '#10b981' : '#ef4444' }]}>
                {category.isActive ? '✓' : '✗'}
              </Text>
            </TouchableOpacity>
            
            {canAddChild && (
              <TouchableOpacity
                style={[styles.actionButton, styles.addChildButton]}
                onPress={() => openAddModal(category.id)}
              >
                <Plus size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openEditModal(category)}
            >
              <Edit3 size={16} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(category)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        {childCategories.length > 0 && (
          <View style={styles.childCategories}>
            {childCategories.map(child => renderCategory(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  const parentCategories = getParentCategories();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openAddModal()}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.categoriesList}>
        {parentCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune catégorie créée</Text>
            <Text style={styles.emptySubtext}>Commencez par ajouter votre première catégorie</Text>
          </View>
        ) : (
          parentCategories.map(category => renderCategory(category))
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Check size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Nom de la catégorie"
                maxLength={50}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Description optionnelle"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {allowHierarchy && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Catégorie parente</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => {
                      // Implement parent selection modal if needed
                    }}
                  >
                    <Text style={styles.pickerText}>
                      {formData.parentId 
                        ? categories.find(cat => cat.id === formData.parentId)?.name || 'Sélectionner'
                        : 'Aucune (catégorie principale)'
                      }
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {allowColors && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Couleur</Text>
                <View style={styles.colorGrid}>
                  {PREDEFINED_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        formData.color === color && styles.selectedColor
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </View>
              </View>
            )}

            {allowIcons && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Icône</Text>
                <View style={styles.iconGrid}>
                  {PREDEFINED_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        formData.icon === icon && styles.selectedIcon
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, icon }))}
                    >
                      <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>Catégorie active</Text>
                <TouchableOpacity
                  style={[styles.switch, formData.isActive && styles.switchActive]}
                  onPress={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                >
                  <View style={[styles.switchThumb, formData.isActive && styles.switchThumbActive]} />
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#f8faff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  categoriesList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  inactiveText: {
    opacity: 0.5,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    backgroundColor: '#f8faff',
  },
  addChildButton: {
    backgroundColor: '#dbeafe',
  },
  editButton: {
    backgroundColor: '#dbeafe',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  childCategories: {
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8faff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#1f2937',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#1f2937',
    borderWidth: 3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8faff',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIcon: {
    borderColor: '#1e3a8a',
    backgroundColor: '#dbeafe',
  },
  iconText: {
    fontSize: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: '#1e3a8a',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
});