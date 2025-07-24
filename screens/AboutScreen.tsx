import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Heart, Mail, Globe, Book, Users, Star } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const { colors } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: colors.text,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.surface,
      margin: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sectionText: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: 16,
    },
    missionText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      fontStyle: 'italic' as const,
      textAlign: 'center',
      marginBottom: 16,
    },
    valuesList: {
      gap: 12,
    },
    valueItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    valueIcon: {
      marginTop: 2,
    },
    valueContent: {
      flex: 1,
    },
    valueTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    valueDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    featuresList: {
      gap: 8,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 4,
    },
    featureText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    contactButtons: {
      gap: 12,
    },
    contactButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    contactButtonText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500' as const,
    },
    versionInfo: {
      alignItems: 'center',
      gap: 8,
    },
    versionText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    appName: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colors.primary,
    },
    testimonialCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    testimonialText: {
      fontSize: 14,
      color: colors.text,
      fontStyle: 'italic' as const,
      lineHeight: 20,
      marginBottom: 8,
    },
    testimonialAuthor: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'right',
    },
  });

  const values = [
    {
      icon: <Heart size={20} color={colors.primary} />,
      title: 'Amour et Bienveillance',
      description: 'Nous cultivons un esprit d\'amour fraternel et d\'accueil pour tous.'
    },
    {
      icon: <Book size={20} color={colors.primary} />,
      title: 'Fidélité à l\'Évangile',
      description: 'Notre enseignement s\'enracine dans la Parole de Dieu et la tradition de l\'Église.'
    },
    {
      icon: <Users size={20} color={colors.primary} />,
      title: 'Communion Fraternelle',
      description: 'Nous formons une communauté unie dans la prière et le partage spirituel.'
    },
  ];

  const features = [
    '🎧 Bibliothèque d\'enseignements audio spirituels',
    '🙏 Recueil de prières organisé par catégories',
    '📖 Guide de Lectio Divina en 4 étapes',
    '💭 Partage d\'intentions de prières',
    '📰 Actualités et communications',
    '⚙️ Interface d\'administration',
  ];

  const testimonials = [
    {
      text: "Cette application m'accompagne chaque jour dans ma prière. Les enseignements sont profonds et nourrissants.",
      author: "Marie-Claire, utilisatrice depuis 6 mois"
    },
    {
      text: "La Lectio Divina guidée m'a aidé à approfondir ma relation avec la Parole de Dieu.",
      author: "Jean-Paul, membre de la communauté"
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>À Propos</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Heart size={24} color={colors.primary} />
            Notre Mission
          </Text>
          <Text style={styles.missionText}>
            "Accompagner chaque âme dans sa rencontre avec Dieu à travers la prière, 
            l'écoute de sa Parole et la communion fraternelle."
          </Text>
          <Text style={styles.sectionText}>
            Espace Ruah Formation est né du désir de rendre accessible à tous 
            un accompagnement spirituel de qualité. Notre communauté s'engage à 
            proposer des contenus authentiques, enracinés dans la tradition chrétienne 
            et adaptés aux défis de notre époque.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Star size={24} color={colors.primary} />
            Nos Valeurs
          </Text>
          <View style={styles.valuesList}>
            {values.map((value, index) => (
              <View key={index} style={styles.valueItem}>
                <View style={styles.valueIcon}>{value.icon}</View>
                <View style={styles.valueContent}>
                  <Text style={styles.valueTitle}>{value.title}</Text>
                  <Text style={styles.valueDescription}>{value.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Book size={24} color={colors.primary} />
            Fonctionnalités
          </Text>
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Users size={24} color={colors.primary} />
            Témoignages
          </Text>
          {testimonials.map((testimonial, index) => (
            <View key={index} style={styles.testimonialCard}>
              <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
              <Text style={styles.testimonialAuthor}>— {testimonial.author}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Mail size={24} color={colors.primary} />
            Contact & Support
          </Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => openLink('mailto:contact@espaceruah.fr')}
            >
              <Mail size={20} color={colors.primary} />
              <Text style={styles.contactButtonText}>contact@espaceruah.fr</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => openLink('https://espaceruah.fr')}
            >
              <Globe size={20} color={colors.primary} />
              <Text style={styles.contactButtonText}>espaceruah.fr</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.versionInfo}>
            <Text style={styles.appName}>Espace Ruah Formation</Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.versionText}>
              Développé avec ❤️ pour la communauté spirituelle
            </Text>
            <Text style={styles.versionText}>
              © 2024 Espace Ruah Formation. Tous droits réservés.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}