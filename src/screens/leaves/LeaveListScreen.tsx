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
import { leavesDb } from '../../database/leavesDb';
import { Leave } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';

import { useAuth } from '../../context/AuthContext';

export const LeaveListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLeaves = async () => {
    try {
      let data = await leavesDb.getUpcoming();

      // Role-based filtering
      if (user?.role === 'employee' && user?.employeeId) {
        data = data.filter(leave => leave.employeeId === user.employeeId);
      } else if (user?.role === 'chef_dequipe' && user?.department) {
        // Chef sees leaves for their department
        // Logic depends on data availability
      }

      setLeaves(data);
    } catch (error) {
      console.error('Error loading leaves:', error);
      Alert.alert(t('common.error'), t('leaves.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLeaves();
    }, []),
  );

  const filteredLeaves = useMemo(() => {
    if (!searchQuery) return leaves;
    const lowerQuery = searchQuery.toLowerCase();
    return leaves.filter(
      leave =>
        leave.title.toLowerCase().includes(lowerQuery) ||
        (leave.employeeName && leave.employeeName.toLowerCase().includes(lowerQuery)),
    );
  }, [leaves, searchQuery]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return { dateStr, timeStr };
  };

  const renderLeave = ({ item }: { item: Leave }) => {
    const { dateStr, timeStr } = formatDateTime(item.dateTime);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('LeaveDetails', { leaveId: item.id })
        }
      >
        <View style={styles.dateColumn}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>

        <View style={styles.detailsColumn}>
          <Text style={styles.title}>{item.title}</Text>
          {item.employeeName && (
            <Text style={styles.employee}>{item.employeeName}</Text>
          )}
          {item.location && (
            <Text style={styles.location}>📍 {item.location}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('leaves.noLeaves')}</Text>
      <Text style={styles.emptySubText}>{t('leaves.addFirst')}</Text>
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
        data={filteredLeaves}
        renderItem={renderLeave}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddLeave')}
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
    dateColumn: {
      width: 80,
      marginRight: theme.spacing.m,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    dateText: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      color: theme.colors.text,
    },
    timeText: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      fontWeight: 'bold',
      marginTop: 4,
    },
    detailsColumn: {
      flex: 1,
    },
    title: {
      ...theme.textVariants.subheader,
      marginBottom: 4,
      color: theme.colors.text,
    },
    employee: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    location: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
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
