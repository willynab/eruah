import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordChangeRequest } from '@/types';
import { changePassword } from '@/data/mockUsers';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<PasswordChangeRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateForm = (): string | null => {
    if (!formData.currentPassword.trim()) {
      return 'Veuillez saisir votre mot de passe actuel.';
    }

    if (!formData.newPassword.trim()) {
      return 'Veuillez saisir un nouveau mot de passe.';
    }

    if (formData.newPassword.length < 6) {
      return 'Le nouveau mot de passe doit contenir au moins 6 caractères.';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return 'Les mots de passe ne correspondent pas.';
    }

    if (formData.currentPassword === formData.newPassword) {
      return 'Le nouveau mot de passe doit être différent de l\'ancien.';
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Erreur', validationError);
      return;
    }

    setIsLoading(true);

    try {
      const success = changePassword(currentUser.id, formData.currentPassword, formData.newPassword);
      
      if (success) {
        Alert.alert(
          'Succès',
          'Votre mot de passe a été modifié avec succès.',
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'Mot de passe actuel incorrect.');
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la modification du mot de passe.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  const styles = StyleSheet.create({
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
    modalHeader: {
      alignItems: 'center',
      marginBottom: 24,
    },
    modalIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      padding: 12,
    },
    passwordStrength: {
      marginTop: 8,
    },
    strengthBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    strengthFill: {
      height: '100%',
      borderRadius: 2,
    },
    strengthText: {
      fontSize: 12,
      marginTop: 4,
    },
    passwordRules: {
      marginTop: 8,
    },
    ruleText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    ruleValid: {
      color: '#10b981',
    },
    ruleInvalid: {
      color: '#ef4444',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
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
    disabledButton: {
      opacity: 0.5,
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
  });

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return '#ef4444';
    if (strength <= 2) return '#f59e0b';
    if (strength <= 3) return '#eab308';
    if (strength <= 4) return '#22c55e';
    return '#10b981';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 1) return 'Très faible';
    if (strength <= 2) return 'Faible';
    if (strength <= 3) return 'Moyen';
    if (strength <= 4) return 'Fort';
    return 'Très fort';
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIcon}>
              <Lock size={24} color={colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>
            <Text style={styles.modalSubtitle}>
              Saisissez votre mot de passe actuel et choisissez un nouveau mot de passe sécurisé
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mot de passe actuel</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.currentPassword}
                onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                placeholder="Saisissez votre mot de passe actuel"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.current}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              >
                {showPasswords.current ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.newPassword}
                onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                placeholder="Choisissez un nouveau mot de passe"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.new}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              >
                {showPasswords.new ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            {formData.newPassword.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getStrengthColor(passwordStrength),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    { color: getStrengthColor(passwordStrength) },
                  ]}
                >
                  Force: {getStrengthLabel(passwordStrength)}
                </Text>
              </View>
            )}

            <View style={styles.passwordRules}>
              <Text
                style={[
                  styles.ruleText,
                  formData.newPassword.length >= 6 ? styles.ruleValid : styles.ruleInvalid,
                ]}
              >
                • Au moins 6 caractères
              </Text>
              <Text
                style={[
                  styles.ruleText,
                  formData.newPassword.length >= 8 ? styles.ruleValid : styles.ruleInvalid,
                ]}
              >
                • Au moins 8 caractères (recommandé)
              </Text>
              <Text
                style={[
                  styles.ruleText,
                  /[A-Z]/.test(formData.newPassword) ? styles.ruleValid : styles.ruleInvalid,
                ]}
              >
                • Au moins une majuscule
              </Text>
              <Text
                style={[
                  styles.ruleText,
                  /[0-9]/.test(formData.newPassword) ? styles.ruleValid : styles.ruleInvalid,
                ]}
              >
                • Au moins un chiffre
              </Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="Confirmez votre nouveau mot de passe"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPasswords.confirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              >
                {showPasswords.confirm ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {formData.confirmPassword.length > 0 && formData.newPassword !== formData.confirmPassword && (
              <Text style={[styles.ruleText, styles.ruleInvalid, { marginTop: 4 }]}>
                Les mots de passe ne correspondent pas
              </Text>
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={[styles.modalButtonText, styles.confirmButtonText]}>
                {isLoading ? 'Modification...' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}