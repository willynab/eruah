import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Users, Plus, Search, Edit, Trash2, RotateCcw, Shield, ShieldCheck, Eye, UserX, UserCheck } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { User, UserCreationData } from '@/types';
import { mockUsers, createUser, updateUser, deleteUser, resetPassword } from '@/data/mockUsers';

interface MembersManagementScreenProps {
  onBack: () => void;
}

export default function MembersManagementScreen({ onBack }: MembersManagementScreenProps) {
  const { colors } = useTheme();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'user' | 'moderator'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState<UserCreationData>({
    fullName: '',
    username: '',
    role: 'user',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && user.isActive) ||
                         (selectedStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    if (!newUserData.fullName.trim() || !newUserData.username.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (users.some(u => u.username === newUserData.username)) {
      Alert.alert('Erreur', 'Ce nom d\'utilisateur existe déjà.');
      return;
    }

    try {
      const newUser = createUser(newUserData);
      setUsers([...users, newUser]);
      setShowCreateModal(false);
      setNewUserData({ fullName: '', username: '', role: 'user' });
      
      const tempPassword = 'password123';
      Alert.alert(
        'Utilisateur créé',
        `Nouvel utilisateur créé avec succès.\n\nNom d'utilisateur: ${newUser.username}\nMot de passe temporaire: ${tempPassword}\n\nVeuillez communiquer ces informations à l'utilisateur.`
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer l\'utilisateur.');
    }
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    try {
      const updatedUser = updateUser(selectedUser.id, selectedUser);
      if (updatedUser) {
        setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
        setShowEditModal(false);
        setSelectedUser(null);
        Alert.alert('Succès', 'Utilisateur mis à jour avec succès.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'utilisateur.');
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user.role === 'admin') {
      Alert.alert('Erreur', 'Impossible de supprimer un administrateur.');
      return;
    }

    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.fullName}" ?\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            if (deleteUser(user.id)) {
              setUsers(users.filter(u => u.id !== user.id));
              Alert.alert('Succès', 'Utilisateur supprimé avec succès.');
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = (user: User) => {
    Alert.alert(
      'Réinitialiser le mot de passe',
      `Voulez-vous réinitialiser le mot de passe de "${user.fullName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          onPress: () => {
            const tempPassword = resetPassword(user.id);
            Alert.alert(
              'Mot de passe réinitialisé',
              `Nouveau mot de passe temporaire pour ${user.username}:\n\n${tempPassword}\n\nVeuillez communiquer ce mot de passe à l'utilisateur.`
            );
          },
        },
      ]
    );
  };

  const toggleUserStatus = (user: User) => {
    const newStatus = !user.isActive;
    const updatedUser = updateUser(user.id, { isActive: newStatus });
    if (updatedUser) {
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      Alert.alert(
        'Succès',
        `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès.`
      );
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck size={16} color={colors.accent} />;
      case 'moderator':
        return <Shield size={16} color={colors.secondary} />;
      default:
        return <Users size={16} color={colors.textSecondary} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Modérateur';
      default:
        return 'Utilisateur';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    backButton: {
      padding: 8,
    },
    addButton: {
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 8,
    },
    filtersContainer: {
      padding: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      paddingLeft: 8,
      color: colors.text,
      fontSize: 16,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 12,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    filterButtonTextActive: {
      color: 'white',
      fontWeight: '600',
    },
    usersList: {
      flex: 1,
    },
    userCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
    },
    userUsername: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    userMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    roleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    roleText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      gap: 4,
    },
    editButton: {
      backgroundColor: colors.primary + '20',
    },
    deleteButton: {
      backgroundColor: '#ef4444' + '20',
    },
    resetButton: {
      backgroundColor: colors.secondary + '20',
    },
    toggleButton: {
      backgroundColor: colors.accent + '20',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    picker: {
      color: colors.text,
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
      backgroundColor: colors.border,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    confirmButtonText: {
      color: 'white',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Membres</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un membre..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {['all', 'admin', 'moderator', 'user'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterButton,
                    selectedRole === role && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedRole(role as any)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedRole === role && styles.filterButtonTextActive,
                    ]}
                  >
                    {role === 'all' ? 'Tous' : getRoleLabel(role)}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {['all', 'active', 'inactive'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    selectedStatus === status && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedStatus(status as any)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedStatus === status && styles.filterButtonTextActive,
                    ]}
                  >
                    {status === 'all' ? 'Tous' : status === 'active' ? 'Actifs' : 'Inactifs'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.usersList}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              Aucun membre trouvé avec ces critères
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userUsername}>@{user.username}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.userMeta}>
                <View style={styles.roleContainer}>
                  {getRoleIcon(user.role)}
                  <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
                </View>

                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: user.isActive ? '#10b981' : '#ef4444' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: user.isActive ? '#10b981' : '#ef4444' },
                    ]}
                  >
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => {
                    setSelectedUser(user);
                    setShowEditModal(true);
                  }}
                >
                  <Edit size={14} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    Modifier
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.resetButton]}
                  onPress={() => handleResetPassword(user)}
                >
                  <RotateCcw size={14} color={colors.secondary} />
                  <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
                    Reset MDP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.toggleButton]}
                  onPress={() => toggleUserStatus(user)}
                >
                  {user.isActive ? (
                    <UserX size={14} color={colors.accent} />
                  ) : (
                    <UserCheck size={14} color={colors.accent} />
                  )}
                  <Text style={[styles.actionButtonText, { color: colors.accent }]}>
                    {user.isActive ? 'Désactiver' : 'Activer'}
                  </Text>
                </TouchableOpacity>

                {user.role !== 'admin' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(user)}
                  >
                    <Trash2 size={14} color="#ef4444" />
                    <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  Inscrit le {formatDate(user.createdAt)}
                  {user.lastLoginAt && ` • Dernière connexion: ${formatDate(user.lastLoginAt)}`}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de création */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Créer un nouveau membre</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom complet *</Text>
              <TextInput
                style={styles.input}
                value={newUserData.fullName}
                onChangeText={(text) => setNewUserData({ ...newUserData, fullName: text })}
                placeholder="Nom et prénom"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom d'utilisateur *</Text>
              <TextInput
                style={styles.input}
                value={newUserData.username}
                onChangeText={(text) => setNewUserData({ ...newUserData, username: text.toLowerCase() })}
                placeholder="nom_utilisateur"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rôle</Text>
              <View style={styles.pickerContainer}>
                {Platform.OS === 'web' ? (
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: 12,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: colors.text,
                      fontSize: 16,
                    }}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="moderator">Modérateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                ) : (
                  <View style={{ padding: 12 }}>
                    <Text style={{ color: colors.text, fontSize: 16 }}>
                      {getRoleLabel(newUserData.role)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewUserData({ fullName: '', username: '', role: 'user' });
                }}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateUser}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>
                  Créer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le membre</Text>

            {selectedUser && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nom complet</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedUser.fullName}
                    onChangeText={(text) => setSelectedUser({ ...selectedUser, fullName: text })}
                    placeholder="Nom et prénom"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={selectedUser.email}
                    onChangeText={(text) => setSelectedUser({ ...selectedUser, email: text })}
                    placeholder="email@exemple.com"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Rôle</Text>
                  <View style={styles.pickerContainer}>
                    {Platform.OS === 'web' ? (
                      <select
                        value={selectedUser.role}
                        onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })}
                        style={{
                          width: '100%',
                          padding: 12,
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: colors.text,
                          fontSize: 16,
                        }}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="moderator">Modérateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    ) : (
                      <View style={{ padding: 12 }}>
                        <Text style={{ color: colors.text, fontSize: 16 }}>
                          {getRoleLabel(selectedUser.role)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateUser}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>
                  Sauvegarder
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}