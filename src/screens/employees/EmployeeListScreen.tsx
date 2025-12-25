import React, { useState, useCallback, useMemo } from 'react';
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
import { doctorsDb } from '../../database/doctorsDb';
import { Doctor } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';

export const DoctorListScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDoctors = async () => {
    try {
      const data = await doctorsDb.getAll();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert(t('common.error'), t('doctors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDoctors();
    }, []),
  );

  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctors;
    const lowerQuery = searchQuery.toLowerCase();
    return doctors.filter(doc => {
      const specialty = doc.specialty
        ? t(`specialties.${doc.specialty}`, { defaultValue: doc.specialty })
        : '';
      return (
        doc.name.toLowerCase().includes(lowerQuery) ||
        specialty.toLowerCase().includes(lowerQuery)
      );
    });
  }, [doctors, searchQuery, t]);

  const renderDoctor = ({ item }: { item: Doctor }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('DoctorDetails', { doctorId: item.id })
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.name}>
            {t('doctors.doctor')} {item.name}
          </Text>
          {item.specialty && (
            <View style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>
                {t(`specialties.${item.specialty}`, {
                  defaultValue: item.specialty,
                })}
              </Text>
            </View>
          )}
        </View>

        {item.phone && <Text style={styles.detail}>📞 {item.phone}</Text>}

        {item.email && <Text style={styles.detail}>✉️ {item.email}</Text>}

        {item.address && <Text style={styles.detail}>📍 {item.address}</Text>}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('doctors.empty')}</Text>
      <Text style={styles.emptySubText}>{t('doctors.emptySubtitle')}</Text>
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
        data={filteredDoctors}
        renderItem={renderDoctor}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddDoctor')}
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
      paddingBottom: 80, // Space for FAB
    },
    searchContainer: {
      padding: theme.spacing.m,
      paddingBottom: 0,
    },
    card: {
      backgroundColor: theme.colors.surface, // Use surface for card background
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },
    name: {
      ...theme.textVariants.subheader,
      flex: 1,
      color: theme.colors.text,
    },
    specialtyBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.l,
    },
    specialtyText: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: '600',
    },
    detail: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: theme.spacing.xs,
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
      marginTop: -2,
    },
  });
