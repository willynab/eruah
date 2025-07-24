import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import { X, ArrowLeft, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface WebViewModalProps {
  visible: boolean;
  url: string;
  onClose: () => void;
  title?: string;
}

export const WebViewModal: React.FC<WebViewModalProps> = ({
  visible,
  url,
  onClose,
  title,
}) => {
  const { colors } = useTheme();
  const [canGoBack] = React.useState(false);
  const [canGoForward] = React.useState(false);
  const [currentUrl, setCurrentUrl] = React.useState(url);
  const [loading] = React.useState(false);

  React.useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  const goBack = () => {
    console.log('Go back');
  };

  const goForward = () => {
    console.log('Go forward');
  };

  const reload = () => {
    console.log('Reload');
  };

  const openInBrowser = () => {
    if (Platform.OS === 'web') {
      window.open(currentUrl, '_blank');
    } else {
      Linking.openURL(currentUrl).catch(() => {
        console.log('Cannot open URL');
      });
    }
  };

  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {title || getDomain(currentUrl)}
            </Text>
            <Text style={[styles.headerUrl, { color: colors.textSecondary }]} numberOfLines={1}>
              {currentUrl}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.headerButton, styles.closeButton]}
            onPress={onClose}
          >
            <X size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Navigation Bar */}
        <View style={[styles.navigationBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.navButton, { opacity: canGoBack ? 1 : 0.5 }]}
            onPress={goBack}
            disabled={!canGoBack}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, { opacity: canGoForward ? 1 : 0.5 }]}
            onPress={goForward}
            disabled={!canGoForward}
          >
            <ArrowRight size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, { opacity: loading ? 0.5 : 1 }]}
            onPress={reload}
            disabled={loading}
          >
            <RotateCcw size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={openInBrowser}
          >
            <ExternalLink size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.webView}>
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholderTitle, { color: colors.text }]}>
              Navigateur intégré
            </Text>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Cette fonctionnalité ouvrira le lien dans un navigateur intégré sur mobile.
            </Text>
            <Text style={[styles.placeholderUrl, { color: colors.primary }]}>
              {currentUrl}
            </Text>
            
            <TouchableOpacity
              style={[styles.openButton, { backgroundColor: colors.primary }]}
              onPress={openInBrowser}
            >
              <ExternalLink size={20} color="#fff" />
              <Text style={styles.openButtonText}>
                Ouvrir dans le navigateur
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerUrl: {
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#ef4444',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: 8,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webView: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  placeholderUrl: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default WebViewModal;