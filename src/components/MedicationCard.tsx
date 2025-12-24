import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Medication } from '../database/schema';

interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onPress,
}) => {
  const { t } = useTranslation();
  const times = JSON.parse(medication.times) as string[];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{medication.name}</Text>
          {medication.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>{t('medications.urgent')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.dosage}>{medication.dosage}</Text>
      </View>

      <Text style={styles.frequency}>{medication.frequency}</Text>

      <View style={styles.timesContainer}>
        {times.map((time, index) => (
          <View key={index} style={styles.timeBadge}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        ))}
      </View>

      {medication.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {medication.notes}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentBadge: {
    backgroundColor: '#FF3B30', // Red
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgentText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  frequency: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  timeBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
