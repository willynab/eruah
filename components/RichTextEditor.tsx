import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Palette,
  Type,
  Undo,
  Redo,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface RichTextEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  height?: number;
  showToolbar?: boolean;
  maxLength?: number;
}

interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  backgroundColor: string;
  fontSize: number;
}

interface LinkModalProps {
  visible: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string) => void;
  initialText?: string;
}

const LinkModal: React.FC<LinkModalProps> = ({ visible, onClose, onInsert, initialText = '' }) => {
  const { colors } = useTheme();
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState(initialText);

  const validateUrl = (url: string): boolean => {
    const urlPattern = /^(https?:\/\/)([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\/\\w \\.-]*)*\/?$/;
    return urlPattern.test(url);
  };

  const handleInsert = () => {
    if (!url.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une URL');
      return;
    }

    if (!validateUrl(url)) {
      Alert.alert('Erreur', 'Veuillez saisir une URL valide (ex: https://example.com)');
      return;
    }

    if (!linkText.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le texte du lien');
      return;
    }

    onInsert(url, linkText);
    setUrl('');
    setLinkText('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Insérer un lien</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>URL du lien</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={url}
              onChangeText={setUrl}
              placeholder="https://example.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Texte à afficher</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={linkText}
              onChangeText={setLinkText}
              placeholder="Texte du lien"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.insertButton, { backgroundColor: colors.primary }]}
              onPress={handleInsert}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Insérer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ColorPicker: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  title: string;
}> = ({ visible, onClose, onSelectColor, title }) => {
  const { colors } = useTheme();
  
  const colorOptions = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#FF0000', '#FF6600', '#FFCC00', '#00FF00', '#0066FF', '#6600FF',
    '#FF3366', '#FF9933', '#FFFF33', '#33FF33', '#3366FF', '#9933FF',
    '#990000', '#CC3300', '#FF6600', '#009900', '#003399', '#330099',
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.colorPickerContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          
          <View style={styles.colorGrid}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }]}
                onPress={() => {
                  onSelectColor(color);
                  onClose();
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.modalButtonText, { color: colors.text }]}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChangeText,
  placeholder = 'Saisissez votre texte...',
  height = 200,
  showToolbar = true,
  maxLength,
}) => {
  const { colors } = useTheme();
  const textInputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [currentStyle, setCurrentStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
    textColor: colors.text,
    backgroundColor: 'transparent',
    fontSize: 16,
  });

  const addToHistory = (text: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(text);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChangeText(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChangeText(history[newIndex]);
    }
  };

  const insertText = (textToInsert: string) => {
    const beforeText = value.substring(0, selection.start);
    const afterText = value.substring(selection.end);
    const newText = beforeText + textToInsert + afterText;
    
    onChangeText(newText);
    addToHistory(newText);
    
    // Mettre à jour la position du curseur
    const newCursorPosition = selection.start + textToInsert.length;
    setTimeout(() => {
      textInputRef.current?.setNativeProps({
        selection: { start: newCursorPosition, end: newCursorPosition }
      });
    }, 10);
  };

  const formatText = (format: keyof TextStyle) => {
    setCurrentStyle(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  const setAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    setCurrentStyle(prev => ({ ...prev, align }));
  };

  const insertList = (ordered: boolean = false) => {
    const listItem = ordered ? '1. ' : '• ';
    insertText(`\n${listItem}`);
  };

  const insertLink = (url: string, linkText: string) => {
    const linkMarkdown = `[${linkText}](${url})`;
    insertText(linkMarkdown);
  };

  const openLink = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
      });
    }
  };

  const renderToolbar = () => {
    if (!showToolbar) return null;

    return (
      <View style={[styles.toolbar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
          {/* Historique */}
          <TouchableOpacity
            style={[styles.toolbarButton, { opacity: historyIndex > 0 ? 1 : 0.5 }]}
            onPress={undo}
            disabled={historyIndex === 0}
          >
            <Undo size={18} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolbarButton, { opacity: historyIndex < history.length - 1 ? 1 : 0.5 }]}
            onPress={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo size={18} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Formatage */}
          <TouchableOpacity
            style={[styles.toolbarButton, currentStyle.bold && { backgroundColor: colors.primary + '20' }]}
            onPress={() => formatText('bold')}
          >
            <Bold size={18} color={currentStyle.bold ? colors.primary : colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolbarButton, currentStyle.italic && { backgroundColor: colors.primary + '20' }]}
            onPress={() => formatText('italic')}
          >
            <Italic size={18} color={currentStyle.italic ? colors.primary : colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolbarButton, currentStyle.underline && { backgroundColor: colors.primary + '20' }]}
            onPress={() => formatText('underline')}
          >
            <Underline size={18} color={currentStyle.underline ? colors.primary : colors.text} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Alignement */}
          <TouchableOpacity
            style={[styles.toolbarButton, currentStyle.align === 'left' && { backgroundColor: colors.primary + '20' }]}
            onPress={() => setAlignment('left')}
          >
            <AlignLeft size={18} color={currentStyle.align === 'left' ? colors.primary : colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolbarButton, currentStyle.align === 'center' && { backgroundColor: colors.primary + '20' }]}
            onPress={() => setAlignment('center')}
          >
            <AlignCenter size={18} color={currentStyle.align === 'center' ? colors.primary : colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolbarButton, currentStyle.align === 'right' && { backgroundColor: colors.primary + '20' }]}
            onPress={() => setAlignment('right')}
          >
            <AlignRight size={18} color={currentStyle.align === 'right' ? colors.primary : colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolbarButton, currentStyle.align === 'justify' && { backgroundColor: colors.primary + '20' }]}
            onPress={() => setAlignment('justify')}
          >
            <AlignJustify size={18} color={currentStyle.align === 'justify' ? colors.primary : colors.text} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Listes */}
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => insertList(false)}
          >
            <List size={18} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => insertList(true)}
          >
            <ListOrdered size={18} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Couleurs */}
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowTextColorPicker(true)}
          >
            <Type size={18} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowBackgroundColorPicker(true)}
          >
            <Palette size={18} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          {/* Lien */}
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowLinkModal(true)}
          >
            <Link size={18} color={colors.text} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const getTextAlign = (): 'left' | 'center' | 'right' | 'justify' => {
    return currentStyle.align;
  };

  return (
    <View style={styles.container}>
      {renderToolbar()}
      
      <TextInput
        ref={textInputRef}
        style={[
          styles.textInput,
          {
            height,
            backgroundColor: colors.background,
            color: currentStyle.textColor,
            textAlign: getTextAlign(),
            fontSize: currentStyle.fontSize,
            fontWeight: currentStyle.bold ? 'bold' : 'normal',
            fontStyle: currentStyle.italic ? 'italic' : 'normal',
            textDecorationLine: currentStyle.underline ? 'underline' : 'none',
            borderColor: colors.border,
          }
        ]}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          if (text !== history[historyIndex]) {
            addToHistory(text);
          }
        }}
        onSelectionChange={(event) => {
          setSelection(event.nativeEvent.selection);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline
        textAlignVertical="top"
        maxLength={maxLength}
      />

      {maxLength && (
        <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
          {value.length}/{maxLength}
        </Text>
      )}

      <LinkModal
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={insertLink}
        initialText={value.substring(selection.start, selection.end)}
      />

      <ColorPicker
        visible={showTextColorPicker}
        onClose={() => setShowTextColorPicker(false)}
        onSelectColor={(color) => setCurrentStyle(prev => ({ ...prev, textColor: color }))}
        title="Couleur du texte"
      />

      <ColorPicker
        visible={showBackgroundColorPicker}
        onClose={() => setShowBackgroundColorPicker(false)}
        onSelectColor={(color) => setCurrentStyle(prev => ({ ...prev, backgroundColor: color }))}
        title="Couleur d'arrière-plan"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  toolbar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  toolbarContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  toolbarButton: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    width: 1,
    height: 20,
    marginHorizontal: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  colorPickerContent: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
  },
  insertButton: {
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  colorOption: {
    width: 32,
    height: 32,
    margin: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default RichTextEditor;