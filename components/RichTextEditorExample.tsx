import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import RichTextEditor from './RichTextEditor';
import RichTextDisplay from './RichTextDisplay';
import WebViewModal from './WebViewModal';

export const RichTextEditorExample: React.FC = () => {
  const { colors } = useTheme();
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [showWebView, setShowWebView] = useState(false);

  const handleLinkPress = (url: string) => {
    setWebViewUrl(url);
    setShowWebView(true);
  };

  const sampleContent = `Voici un exemple de contenu riche avec formatage :

**Texte en gras** et *texte en italique*

Liste à puces :
• Premier élément
• Deuxième élément
• Troisième élément

Liste numérotée :
1. Première étape
2. Deuxième étape
3. Troisième étape

Lien externe : [Visitez notre site](https://example.com)

Autre lien : [Documentation](https://docs.example.com)`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Éditeur de Texte Riche
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Éditeur
          </Text>
          
          <RichTextEditor
            value={content}
            onChangeText={setContent}
            placeholder="Saisissez votre contenu ici..."
            height={300}
            maxLength={5000}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setContent(sampleContent)}
            >
              <Text style={styles.buttonText}>Charger exemple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary }]}
              onPress={() => setContent('')}
            >
              <Text style={styles.buttonText}>Effacer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.accent }]}
              onPress={() => setShowPreview(!showPreview)}
            >
              <Text style={styles.buttonText}>
                {showPreview ? 'Masquer' : 'Aperçu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showPreview && content && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Aperçu du rendu
            </Text>
            
            <View style={[styles.previewContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <RichTextDisplay
                content={content}
                onLinkPress={handleLinkPress}
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Fonctionnalités
          </Text>
          
          <View style={[styles.featureList, { backgroundColor: colors.surface }]}>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              ✅ Formatage : Gras, Italique, Souligné
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              ✅ Alignement : Gauche, Centre, Droite, Justifié
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              ✅ Listes : À puces et numérotées
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              ✅ Couleurs : Texte et arrière-plan
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              ✅ Liens : Insertion et validation d'URLs
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              ✅ Historique : Annuler/Refaire
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              ✅ Compteur de caractères
            </Text>
            <Text style={[styles.featureItem, { color: colors.text }]}>
              ✅ Navigateur intégré pour liens externes
            </Text>
          </View>
        </View>
      </View>

      <WebViewModal
        visible={showWebView}
        url={webViewUrl}
        onClose={() => setShowWebView(false)}
        title="Lien externe"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 100,
  },
  featureList: {
    padding: 16,
    borderRadius: 8,
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default RichTextEditorExample;