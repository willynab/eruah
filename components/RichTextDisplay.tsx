import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface RichTextDisplayProps {
  content: string;
  style?: any;
  numberOfLines?: number;
  onLinkPress?: (url: string) => void;
}

interface ParsedContent {
  type: 'text' | 'link';
  content: string;
  url?: string;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  content,
  style,
  numberOfLines,
  onLinkPress,
}) => {
  const { colors } = useTheme();

  const parseContent = (text: string): ParsedContent[] => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: ParsedContent[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Ajouter le texte avant le lien
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push({ type: 'text', content: beforeText });
        }
      }

      // Ajouter le lien
      parts.push({
        type: 'link',
        content: match[1], // Texte du lien
        url: match[2], // URL du lien
      });

      lastIndex = match.index + match[0].length;
    }

    // Ajouter le texte restant après le dernier lien
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    // Si aucun lien n'a été trouvé, retourner tout le texte
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }

    return parts;
  };

  const handleLinkPress = (url: string) => {
    if (onLinkPress) {
      onLinkPress(url);
      return;
    }

    // Validation de l'URL
    const urlPattern = /^https?:\/\//;
    if (!urlPattern.test(url)) {
      Alert.alert('Erreur', 'URL invalide');
      return;
    }

    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
      });
    }
  };

  const formatText = (text: string): string => {
    // Traitement des listes à puces
    text = text.replace(/^• (.+)$/gm, '• $1');
    
    // Traitement des listes numérotées
    text = text.replace(/^(\d+)\. (.+)$/gm, '$1. $2');
    
    return text;
  };

  const renderContent = () => {
    const formattedContent = formatText(content);
    const parsedContent = parseContent(formattedContent);

    return (
      <Text
        style={[
          styles.baseText,
          { color: colors.text },
          style,
        ]}
        numberOfLines={numberOfLines}
      >
        {parsedContent.map((part, index) => {
          if (part.type === 'link') {
            return (
              <Text
                key={index}
                style={[styles.linkText, { color: colors.primary }]}
                onPress={() => part.url && handleLinkPress(part.url)}
              >
                {part.content}
              </Text>
            );
          } else {
            return (
              <Text key={index} style={{ color: colors.text }}>
                {part.content}
              </Text>
            );
          }
        })}
      </Text>
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  baseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default RichTextDisplay;