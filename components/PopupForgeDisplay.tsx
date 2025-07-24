import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { PopupForge } from '@/types';
import { usePopupForge } from '@/contexts/PopupForgeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

interface PopupForgeDisplayProps {
  popup: PopupForge;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PopupForgeDisplay({ popup, onClose }: PopupForgeDisplayProps) {
  const { recordDisplay, recordDismissal, recordClick } = usePopupForge();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(popup.design.position === 'top' ? -200 : popup.design.position === 'bottom' ? 200 : 0));

  useEffect(() => {
    recordDisplay(popup.id);
    setVisible(true);
    
    // Animation d'entrée
    if (popup.design.animation === 'fade') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (popup.design.animation === 'slide') {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else if (popup.design.animation === 'bounce') {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: -10,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Auto-close
    if (popup.design.autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, popup.design.autoClose * 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    recordDismissal(popup.id);
    
    // Animation de sortie
    const exitAnimation = popup.design.animation === 'fade' 
      ? Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      : Animated.timing(slideAnim, {
          toValue: popup.design.position === 'top' ? -200 : popup.design.position === 'bottom' ? 200 : 0,
          duration: 200,
          useNativeDriver: true,
        });

    exitAnimation.start(() => {
      setVisible(false);
      onClose();
    });
  };

  const handleAction = async (action: any) => {
    recordClick(popup.id, action.action);

    switch (action.action) {
      case 'close':
        handleClose();
        break;
      case 'navigate':
        if (action.value) {
          router.push(action.value);
        }
        handleClose();
        break;
      case 'external_link':
        if (action.value) {
          await Linking.openURL(action.value);
        }
        handleClose();
        break;
      default:
        handleClose();
        break;
    }
  };

  const getPositionStyle = () => {
    switch (popup.design.position) {
      case 'top':
        return { top: Platform.OS === 'web' ? 20 : 60, left: 20, right: 20 };
      case 'bottom':
        return { bottom: Platform.OS === 'web' ? 20 : 60, left: 20, right: 20 };
      case 'center':
      default:
        return { 
          top: '50%', 
          left: 20, 
          right: 20,
          transform: [{ translateY: -100 }],
        };
    }
  };

  const getAnimationStyle = () => {
    if (popup.design.animation === 'fade') {
      return { opacity: fadeAnim };
    } else if (popup.design.animation === 'slide' || popup.design.animation === 'bounce') {
      return { transform: [{ translateY: slideAnim }] };
    }
    return {};
  };

  const getTypeIcon = () => {
    if (popup.design.icon) return popup.design.icon;
    
    switch (popup.type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'promotion': return '🎯';
      case 'announcement': return '📢';
      default: return 'ℹ️';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={popup.design.dismissible ? handleClose : undefined}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popup,
            {
              backgroundColor: popup.design.backgroundColor,
              borderColor: popup.design.borderColor || popup.design.backgroundColor,
            },
            getPositionStyle(),
            getAnimationStyle(),
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.icon}>{getTypeIcon()}</Text>
              <Text style={[styles.title, { color: popup.design.textColor }]}>
                {popup.title}
              </Text>
            </View>
            {popup.design.dismissible && (
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                testID="popup-close-button"
              >
                <X size={20} color={popup.design.textColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <Text style={[styles.content, { color: popup.design.textColor }]}>
            {popup.content}
          </Text>

          {/* Actions */}
          {popup.actions && popup.actions.length > 0 && (
            <View style={styles.actions}>
              {popup.actions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: action.style === 'primary' 
                        ? popup.design.textColor 
                        : 'transparent',
                      borderColor: popup.design.textColor,
                      borderWidth: action.style === 'secondary' ? 1 : 0,
                    },
                  ]}
                  onPress={() => handleAction(action)}
                  testID={`popup-action-${action.id}`}
                >
                  <Text
                    style={[
                      styles.actionText,
                      {
                        color: action.style === 'primary' 
                          ? popup.design.backgroundColor 
                          : popup.design.textColor,
                      },
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Priority indicator */}
          {popup.priority === 'urgent' && (
            <View style={[styles.priorityIndicator, { backgroundColor: '#ef4444' }]} />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    position: 'absolute',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});