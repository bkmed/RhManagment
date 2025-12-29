import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { claimsDb } from '../../database/claimsDb';
import { Claim } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateUtils';

export const ClaimsListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClaims = async () => {
    try {
      let data: Claim[] = [];
      if (user?.role === 'admin' || user?.role === 'rh') {
        data = await claimsDb.getAll();
      } else if (user?.employeeId) {
        data = await claimsDb.getByEmployeeId(user.employeeId);
      }
      // Sort by urgency and date
      data.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setClaims(data);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: 'processed' | 'rejected',
  ) => {
    try {
      await claimsDb.update(id, { status });
      loadClaims(); // Reload list
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadClaims();
    }, [user]),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const renderItem = ({ item }: { item: Claim }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ClaimDetails', { claimId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>
            {t(
              `claims.type${item.type.charAt(0).toUpperCase() + item.type.slice(1)
              }`,
            )}
          </Text>
        </View>
        <View
          style={[
            styles.statusTag,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {t(
              `claims.status${item.status.charAt(0).toUpperCase() + item.status.slice(1)
              }`,
            )}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {formatDate(item.createdAt)}
        </Text>
        {item.isUrgent && (
          <View style={styles.urgentTag}>
            <Text style={styles.urgentText}>
              {t('common.urgent').toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Admin Actions */}
      {(user?.role === 'admin' || user?.role === 'rh') &&
        item.status === 'pending' && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleUpdateStatus(item.id!, 'processed')}
            >
              <Text style={styles.actionBtnText}>{t('claims.process')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleUpdateStatus(item.id!, 'rejected')}
            >
              <Text style={styles.actionBtnText}>{t('claims.reject')}</Text>
            </TouchableOpacity>
          </View>
        )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={claims}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString() || ''}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('claims.empty')}</Text>
            </View>
          }
        />
      )}

      {/* Add Claim FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddClaim')}
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
      maxWidth: 800,
      width: '100%',
      alignSelf: 'center',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },
    typeTag: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    typeText: {
      ...theme.textVariants.caption,
      fontWeight: '700',
      color: theme.colors.text,
      fontSize: 11,
      textTransform: 'uppercase',
    },
    statusTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    description: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.m,
    },
    date: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      fontWeight: '500',
    },
    urgentTag: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    urgentText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#FFF',
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 40,
    },
    emptyText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    adminActions: {
      flexDirection: 'row',
      marginTop: theme.spacing.m,
      paddingTop: theme.spacing.s,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      justifyContent: 'flex-end',
      gap: theme.spacing.s,
    },
    actionBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
    },
    approveBtn: { backgroundColor: theme.colors.success },
    rejectBtn: { backgroundColor: theme.colors.error },
    actionBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFF',
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
      elevation: 6,
    },
    fabText: {
      fontSize: 32,
      color: '#FFF',
      marginTop: -2,
    },
  });
