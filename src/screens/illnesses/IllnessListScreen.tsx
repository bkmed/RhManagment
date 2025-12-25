import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { illnessesDb } from '../../database/illnessesDb';
import { Illness } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';

export const IllnessListScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [illnesses, setIllnesses] = useState<Illness[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadIllnesses = async () => {
    try {
      const data = await illnessesDb.getAll();
      setIllnesses(data);
    } catch (error) {
      console.error('Error loading illnesses:', error);
      Alert.alert(t('common.error'), t('illnesses.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIllnesses();
    }, []),
  );

  const filteredIllnesses = useMemo(() => {
    if (!searchQuery) return illnesses;
    const lowerQuery = searchQuery.toLowerCase();
    return illnesses.filter(
      illness =>
        illness.payrollName.toLowerCase().includes(lowerQuery) ||
        (illness.employeeName && illness.employeeName.toLowerCase().includes(lowerQuery)),
    );
  }, [illnesses, searchQuery]);

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.floor(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 30 && diffDays >= 0;
  };

  const renderIllness = ({ item }: { item: Illness }) => {
    const expiryWarning = item.expiryDate && isExpiringSoon(item.expiryDate);

    return (
      <TouchableOpacity
        style={[styles.card, expiryWarning && styles.cardWarning]}
        onPress={() =>
          navigation.navigate('IllnessDetails', {
            illnessId: item.id,
          })
        }
      >
        {item.photoUri && (
          <Image
            source={{ uri: item.photoUri }}
            style={styles.thumbnail as any}
          />
        )}

        <View style={styles.details}>
          <Text style={styles.payrollName}>{item.payrollName}</Text>

          {item.employeeName && (
            <Text style={styles.employee}>
              {t('illnesses.employee')} {item.employeeName}
            </Text>
          )}

          <Text style={styles.date}>
            {t('illnesses.issued')}:
            {new Date(item.issueDate).toLocaleDateString()}
          </Text>

          {item.expiryDate && (
            <Text
              style={[styles.expiry, expiryWarning && styles.expiryWarning]}
            >
              {t('illnesses.expires')}:
              {new Date(item.expiryDate).toLocaleDateString()}
              {expiryWarning && ' ⚠️'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('illnesses.empty')}</Text>
      <Text style={styles.emptySubText}>
        {t('illnesses.emptySubtitle')}
      </Text>
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
        data={filteredIllnesses}
        renderItem={renderIllness}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddIllness')}
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
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      flexDirection: 'row',
      ...theme.shadows.small,
    },
    cardWarning: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
    },
    thumbnail: {
      width: 80,
      height: 80,
      borderRadius: theme.spacing.s,
      marginRight: theme.spacing.m,
      backgroundColor: theme.colors.border,
    },
    details: {
      flex: 1,
    },
    payrollName: {
      ...theme.textVariants.subheader,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
    },
    employee: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: theme.spacing.xs,
    },
    date: {
      ...theme.textVariants.caption,
      marginBottom: 2,
      color: theme.colors.subText,
    },
    expiry: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    expiryWarning: {
      color: theme.colors.warning,
      fontWeight: '600',
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
