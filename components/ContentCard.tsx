import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Play, Heart, Clock, Star, Edit } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ContentCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  duration?: string;
  category?: string;
  level?: number;
  isFavorite?: boolean;
  progress?: number;
  onPress?: () => void;
  onFavoritePress?: () => void;
  onPlayPress?: () => void;
  isAdmin?: boolean;
  status?: { label: string; color: string };
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ContentCard({
  title,
  subtitle,
  description,
  imageUrl,
  duration,
  category,
  level,
  isFavorite = false,
  progress,
  onPress,
  onFavoritePress,
  onPlayPress,
  isAdmin = false,
  status,
  onEdit,
  onDelete,
}: ContentCardProps) {
  const { colors } = useTheme();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs}s`;
  };

  const renderStars = (level: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < level ? colors.accent : colors.border}
        fill={i < level ? colors.accent : 'transparent'}
      />
    ));
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 6,
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: colors.background,
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    badges: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 8,
    },
    categoryBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    categoryText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500' as const,
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    durationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    durationText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    leftActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    playButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 8,
    },
    favoriteButton: {
      padding: 4,
    },
    progressBar: {
      height: 3,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    // Admin styles
    adminActions: {
      flexDirection: 'row',
      position: 'absolute',
      top: 12,
      right: 12,
      gap: 8,
    },
    adminButton: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 20,
      padding: 8,
    },
    statusBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
  });

  return (
    <TouchableOpacity style={[styles.card, { position: 'relative' }]} onPress={onPress}>
      {isAdmin && status && (
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
      )}
      
      {isAdmin && (onEdit || onDelete) && (
        <View style={styles.adminActions}>
          {onEdit && (
            <TouchableOpacity style={styles.adminButton} onPress={onEdit}>
              <Edit size={16} color="white" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.adminButton} onPress={onDelete}>
              <Text style={{ color: 'white', fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.header}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.image} />
        )}
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.badges}>
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        )}
        
        {level && (
          <View style={styles.levelBadge}>
            {renderStars(level)}
          </View>
        )}
        
        {duration && (
          <View style={styles.durationBadge}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.leftActions}>
          {onPlayPress && (
            <TouchableOpacity style={styles.playButton} onPress={onPlayPress}>
              <Play size={16} color="white" fill="white" />
            </TouchableOpacity>
          )}
        </View>
        
        {onFavoritePress && (
          <TouchableOpacity style={styles.favoriteButton} onPress={onFavoritePress}>
            <Heart 
              size={20} 
              color={isFavorite ? colors.secondary : colors.textSecondary}
              fill={isFavorite ? colors.secondary : 'transparent'}
            />
          </TouchableOpacity>
        )}
      </View>

      {progress !== undefined && progress > 0 && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}
    </TouchableOpacity>
  );
}