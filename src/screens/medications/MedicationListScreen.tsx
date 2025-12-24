import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { medicationsDb } from '../../database/medicationsDb';
import { Medication } from '../../database/schema';
import { MedicationCard } from '../../components/MedicationCard';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';

export const MedicationListScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMedications = async () => {
    try {
      const data = await medicationsDb.getAll();
      setMedications(data);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert(t('common.error'), t('medications.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, []),
  );

  const filteredMedications = useMemo(() => {
    if (!searchQuery) return medications;
    const lowerQuery = searchQuery.toLowerCase();
    return medications.filter(
      med =>
        med.name.toLowerCase().includes(lowerQuery) ||
        med.dosage.toLowerCase().includes(lowerQuery),
    ).sort((a, b) => {
      // Sort by urgency first
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      // Then by name
      return a.name.localeCompare(b.name);
    });
  }, [medications, searchQuery]);

  const handleMedicationPress = (medication: Medication) => {
    navigation.navigate('MedicationDetails', { medicationId: medication.id });
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('medications.empty')}</Text>
      <Text style={styles.emptySubText}>{t('medications.emptySubtitle')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.searchPlaceholder')}
        />
      </View>
      <FlatList
        data={filteredMedications}
        renderItem={({ item }) => (
          <MedicationCard
            medication={item}
            onPress={() => handleMedicationPress(item)}
          />
        )}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddMedication')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    listContent: {
      padding: theme.spacing.m,
      flexGrow: 1,
      paddingBottom: 80,
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
    },
    searchContainer: {
      padding: theme.spacing.m,
      paddingBottom: 0,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      ...theme.textVariants.subheader,
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
    },
    emptySubText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    fab: {
      position: 'absolute' as any,
      right: theme.spacing.l,
      bottom: theme.spacing.l,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
      zIndex: 999,
      elevation: 10,
    } as any,
    fabText: {
      fontSize: 32,
      color: theme.colors.surface,
      fontWeight: '300',
    },
  });
