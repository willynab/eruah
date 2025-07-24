export { RichTextEditor } from '../RichTextEditor';
export { RichTextDisplay } from '../RichTextDisplay';
export { WebViewModal } from '../WebViewModal';
export { RichTextEditorExample } from '../RichTextEditorExample';

// Types utilitaires pour l'éditeur riche
export interface RichTextEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  height?: number;
  showToolbar?: boolean;
  maxLength?: number;
}

export interface RichTextDisplayProps {
  content: string;
  style?: any;
  numberOfLines?: number;
  onLinkPress?: (url: string) => void;
}

export interface WebViewModalProps {
  visible: boolean;
  url: string;
  onClose: () => void;
  title?: string;
}

// Utilitaires pour le formatage de texte
export const RichTextUtils = {
  // Extraire les liens d'un texte
  extractLinks: (text: string): Array<{ text: string; url: string }> => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: Array<{ text: string; url: string }> = [];
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
      });
    }

    return links;
  },

  // Valider une URL
  isValidUrl: (url: string): boolean => {
    const urlPattern = /^(https?:\/\/)([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\/\\w \\.-]*)*\/?$/;
    return urlPattern.test(url);
  },

  // Nettoyer le texte des balises de formatage
  stripFormatting: (text: string): string => {
    return text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Supprimer les liens
      .replace(/\*\*(.*?)\*\*/g, '$1') // Supprimer le gras
      .replace(/\*(.*?)\*/g, '$1') // Supprimer l'italique
      .replace(/__(.*?)__/g, '$1') // Supprimer le souligné
      .replace(/^[•\-\*]\s+/gm, '') // Supprimer les puces
      .replace(/^\d+\.\s+/gm, '') // Supprimer la numérotation
      .trim();
  },

  // Compter les mots dans un texte
  countWords: (text: string): number => {
    const cleanText = RichTextUtils.stripFormatting(text);
    return cleanText.split(/\s+/).filter(word => word.length > 0).length;
  },

  // Estimer le temps de lecture (mots par minute)
  estimateReadingTime: (text: string, wordsPerMinute: number = 200): number => {
    const wordCount = RichTextUtils.countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
  },
};