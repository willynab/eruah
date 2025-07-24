import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Calendar, Clock, X, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export type PublicationStatus = 'draft' | 'scheduled' | 'published';

export interface PublicationSchedule {
  status: PublicationStatus;
  publishDate?: Date;
  publishTime?: Date;
}

interface PublicationSchedulerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (schedule: PublicationSchedule) => void;
  initialSchedule?: PublicationSchedule;
  title?: string;
}

const PublicationScheduler: React.FC<PublicationSchedulerProps> = ({
  visible,
  onClose,
  onSave,
  initialSchedule,
  title = 'Planifier la publication'
}) => {
  const [status, setStatus] = useState<PublicationStatus>('draft');
  const [publishDate, setPublishDate] = useState<Date>(new Date());
  const [publishTime, setPublishTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (initialSchedule) {
      setStatus(initialSchedule.status);
      if (initialSchedule.publishDate) {
        setPublishDate(new Date(initialSchedule.publishDate));
      }
      if (initialSchedule.publishTime) {
        setPublishTime(new Date(initialSchedule.publishTime));
      }
    }
  }, [initialSchedule]);

  const handleSave = () => {
    if (status === 'scheduled') {
      const now = new Date();
      const scheduledDateTime = new Date(
        publishDate.getFullYear(),
        publishDate.getMonth(),
        publishDate.getDate(),
        publishTime.getHours(),
        publishTime.getMinutes()
      );

      if (scheduledDateTime <= now) {
        Alert.alert(
          'Erreur',
          'La date et l\'heure de publication doivent être dans le futur.'
        );
        return;
      }
    }

    const schedule: PublicationSchedule = {
      status,
      publishDate: status === 'scheduled' ? publishDate : undefined,
      publishTime: status === 'scheduled' ? publishTime : undefined,
    };

    onSave(schedule);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (statusValue: PublicationStatus) => {
    switch (statusValue) {
      case 'draft':
        return 'Brouillon';
      case 'scheduled':
        return 'Planifiée';
      case 'published':
        return 'Publiée';
      default:
        return 'Brouillon';
    }
  };

  const getStatusColor = (statusValue: PublicationStatus) => {
    switch (statusValue) {
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Statut de publication</Text>
          
          <View style={styles.statusContainer}>
            {(['draft', 'scheduled', 'published'] as PublicationStatus[]).map((statusOption) => (
              <TouchableOpacity
                key={statusOption}
                style={[
                  styles.statusOption,
                  status === statusOption && styles.statusOptionActive
                ]}
                onPress={() => setStatus(statusOption)}
              >
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(statusOption) }
                ]} />
                <Text style={[
                  styles.statusLabel,
                  status === statusOption && styles.statusLabelActive
                ]}>
                  {getStatusLabel(statusOption)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {status === 'scheduled' && (
            <View style={styles.scheduleContainer}>
              <Text style={styles.sectionTitle}>Date et heure de publication</Text>
              
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color="#3B82F6" />
                  <Text style={styles.dateTimeText}>{formatDate(publishDate)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color="#3B82F6" />
                  <Text style={styles.dateTimeText}>{formatTime(publishTime)}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.scheduleNote}>
                La publication sera automatiquement rendue visible à la date et heure spécifiées.
              </Text>
            </View>
          )}

          {status === 'published' && (
            <View style={styles.publishedNote}>
              <Text style={styles.publishedNoteText}>
                Ce contenu sera immédiatement visible par tous les utilisateurs.
              </Text>
            </View>
          )}

          {status === 'draft' && (
            <View style={styles.draftNote}>
              <Text style={styles.draftNoteText}>
                Ce contenu restera en brouillon et ne sera pas visible par les utilisateurs.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Check size={20} color="white" />
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={publishDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event: any, selectedDate?: Date) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setPublishDate(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={publishTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event: any, selectedTime?: Date) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setPublishTime(selectedTime);
              }
            }}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusOptionActive: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  statusLabelActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  scheduleContainer: {
    marginTop: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  scheduleNote: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  publishedNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  publishedNoteText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  draftNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
  },
  draftNoteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});

export default PublicationScheduler;