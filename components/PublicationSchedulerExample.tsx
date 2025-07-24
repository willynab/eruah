import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Calendar, Clock, Eye, FileText } from 'lucide-react-native';
import PublicationScheduler, { PublicationSchedule, PublicationStatus } from './PublicationScheduler';

const PublicationSchedulerExample: React.FC = () => {
  const [showScheduler, setShowScheduler] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<PublicationSchedule>({
    status: 'draft'
  });

  const handleSaveSchedule = (schedule: PublicationSchedule) => {
    setCurrentSchedule(schedule);
    
    // Ici vous pouvez sauvegarder en base de données
    console.log('Planification sauvegardée:', schedule);
    
    Alert.alert(
      'Succès',
      `Publication ${getStatusLabel(schedule.status)} avec succès!`
    );
  };

  const getStatusLabel = (status: PublicationStatus) => {
    switch (status) {
      case 'draft':
        return 'sauvegardée en brouillon';
      case 'scheduled':
        return 'planifiée';
      case 'published':
        return 'publiée';
      default:
        return 'sauvegardée';
    }
  };

  const getStatusColor = (status: PublicationStatus) => {
    switch (status) {
      case 'draft':
        return '#6B7280';
      case 'scheduled':
        return '#F59E0B';
      case 'published':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: PublicationStatus) => {
    switch (status) {
      case 'draft':
        return <FileText size={16} color={getStatusColor(status)} />;
      case 'scheduled':
        return <Clock size={16} color={getStatusColor(status)} />;
      case 'published':
        return <Eye size={16} color={getStatusColor(status)} />;
      default:
        return <FileText size={16} color={getStatusColor(status)} />;
    }
  };

  const formatScheduledDateTime = (schedule: PublicationSchedule) => {
    if (schedule.status !== 'scheduled' || !schedule.publishDate || !schedule.publishTime) {
      return '';
    }

    const date = schedule.publishDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const time = schedule.publishTime.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${date} à ${time}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exemple d'utilisation du Planificateur</Text>
        <Text style={styles.subtitle}>
          Composant réutilisable pour la planification de publications
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.currentStatusCard}>
          <Text style={styles.cardTitle}>Statut actuel</Text>
          
          <View style={styles.statusRow}>
            {getStatusIcon(currentSchedule.status)}
            <Text style={[styles.statusText, { color: getStatusColor(currentSchedule.status) }]}>
              {getStatusLabel(currentSchedule.status).charAt(0).toUpperCase() + 
               getStatusLabel(currentSchedule.status).slice(1)}
            </Text>
          </View>

          {currentSchedule.status === 'scheduled' && (
            <View style={styles.scheduledInfo}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.scheduledText}>
                Programmé pour le {formatScheduledDateTime(currentSchedule)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.planButton}
          onPress={() => setShowScheduler(true)}
        >
          <Calendar size={20} color="white" />
          <Text style={styles.planButtonText}>
            {currentSchedule.status === 'draft' ? 'Planifier la publication' : 'Modifier la planification'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Fonctionnalités du composant :</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Trois statuts : Brouillon, Planifiée, Publiée</Text>
            <Text style={styles.featureItem}>• Sélection de date et heure pour publication planifiée</Text>
            <Text style={styles.featureItem}>• Validation des dates futures</Text>
            <Text style={styles.featureItem}>• Interface intuitive et responsive</Text>
            <Text style={styles.featureItem}>• Composant réutilisable dans toute l&apos;application</Text>
          </View>
        </View>

        <View style={styles.usageCard}>
          <Text style={styles.usageTitle}>Utilisation dans vos modules :</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
{`import PublicationScheduler from '@/components/PublicationScheduler';

const [showScheduler, setShowScheduler] = useState(false);
const [schedule, setSchedule] = useState({ status: 'draft' });

<PublicationScheduler
  visible={showScheduler}
  onClose={() => setShowScheduler(false)}
  onSave={(newSchedule) => {
    setSchedule(newSchedule);
    // Sauvegarder en base de données
  }}
  initialSchedule={schedule}
  title="Planifier l'enseignement"
/>`}
            </Text>
          </View>
        </View>
      </View>

      <PublicationScheduler
        visible={showScheduler}
        onClose={() => setShowScheduler(false)}
        onSave={handleSaveSchedule}
        initialSchedule={currentSchedule}
        title="Planifier la publication"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    padding: 20,
  },
  currentStatusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  scheduledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scheduledText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  featureList: {
    gap: 6,
  },
  featureItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  usageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  codeText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#374151',
    lineHeight: 18,
  },
});

export default PublicationSchedulerExample;