import React, { useState, useCallback, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { employeesDb } from '../../database/employeesDb';
import { leavesDb } from '../../database/leavesDb';
import { Employee, Leave } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { LoadingScreen } from '../../components/LoadingScreen';

export const EmployeeDetailsScreen = ({ navigation, route }: any) => {
  const { employeeId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext)
    : { setActiveTab: () => { } };

  const navigateToAddLeave = () => {
    if (Platform.OS === 'web') {
      if (setActiveTab) {
        setActiveTab('Leaves', 'AddLeave', {
          employeeName: employee?.name || '',
          employeeId: employeeId,
        });
      }
    } else {
      navigation.navigate('AddLeave', {
        employeeName: employee?.name || '',
        employeeId: employeeId,
      });
    }
  };

  const navigationBack = () => {
    if (Platform.OS === 'web') {
      if (setActiveTab) {
        setActiveTab('Employees');
      }
    } else {
      navigation.goBack();
    }
  };

  const navigateToAddIllness = (employee: Employee) => {
    if (Platform.OS === 'web') {
      if (setActiveTab) {
        setActiveTab('Illnesses', 'AddIllness', {
          employeeName: employee.name,
          employeeId: employee.id,
        });
      }
    } else {
      navigation.navigate('AddIllness', {
        employeeName: employee.name,
        employeeId: employee.id,
      });
    }
  };

  const loadData = async () => {
    try {
      const employeeData = await employeesDb.getById(employeeId);
      const leavesData = await leavesDb.getByEmployeeId(employeeId);

      if (employeeData) {
        setEmployee(employeeData);
      } else {
        Alert.alert(t('common.error'), t('employees.notFound'));
        navigationBack();
      }

      setLeaves(leavesData);
    } catch (error) {
      console.error('Error loading employee details:', error);
      Alert.alert(t('common.error'), t('employees.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [employeeId]),
  );

  const handleEdit = () => {
    navigation.navigate('AddEmployee', { employeeId });
  };

  const handleDelete = () => {
    Alert.alert(
      t('employees.deleteConfirmTitle'),
      t('employees.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await employeesDb.delete(employeeId);
              navigationBack();
            } catch (error) {
              console.error('Error deleting employee:', error);
              Alert.alert(t('common.error'), t('employees.deleteError'));
            }
          },
        },
      ],
    );
  };

  const renderLeave = ({ item }: { item: Leave }) => (
    <View style={styles.leaveCard}>
      <View style={styles.leaveHeader}>
        <Text style={styles.leaveTitle}>{item.title}</Text>
        <Text style={styles.leaveDate}>
          {new Date(item.dateTime).toLocaleDateString()}
          {' '}
          {new Date(item.dateTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      {item.location && (
        <Text style={styles.leaveDetail}>📍 {item.location}</Text>
      )}
      {item.notes && (
        <Text style={styles.leaveDetail}>📝 {item.notes}</Text>
      )}
    </View>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (!employee) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.employeeInfoContainer}>
              {employee.photoUri ? (
                <Image source={{ uri: employee.photoUri }} style={styles.employeePhoto} />
              ) : (
                <View style={[styles.employeePhoto, styles.employeePhotoPlaceholder]}>
                  <Text style={styles.employeePhotoPlaceholderText}>
                    {employee.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.name}>
                  {employee.name}
                </Text>
                {employee.position && (
                  <Text style={styles.position}>
                    {t(`departments.${employee.position}`, {
                      defaultValue: employee.position,
                    })}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleEdit}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>{t('common.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={[styles.actionText, styles.deleteText]}>
                  {t('common.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            {employee.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('employees.phone')}</Text>
                <Text style={styles.detailValue}>{employee.phone}</Text>
              </View>
            )}
            {employee.email && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('employees.email')}</Text>
                <Text style={styles.detailValue}>{employee.email}</Text>
              </View>
            )}
            {employee.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('employees.address')}</Text>
                <Text style={styles.detailValue}>{employee.address}</Text>
              </View>
            )}
            {employee.notes && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('employees.notes')}</Text>
                <Text style={styles.detailValue}>{employee.notes}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('leaves.title')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigateToAddIllness(employee)}
              style={[styles.addButton, styles.secondaryButton]}
            >
              <Text style={[styles.addButtonText, styles.secondaryButtonText]}>
                + {t('employees.addIllness')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={navigateToAddLeave}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>
                + {t('employees.addLeave')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {leaves.length > 0 ? (
          leaves.map(item => (
            <View key={item.id} style={styles.leaveWrapper}>
              {renderLeave({ item })}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('employees.noLeaves')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      ...theme.shadows.medium,
      marginBottom: theme.spacing.l,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.m,
    },
    employeeInfoContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.m,
    },
    employeePhoto: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    employeePhotoPlaceholder: {
      backgroundColor: theme.colors.primaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    employeePhotoPlaceholderText: {
      color: theme.colors.primary,
      fontSize: 24,
      fontWeight: 'bold',
    },
    name: {
      ...theme.textVariants.header,
      fontSize: 24,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
    },
    position: {
      ...theme.textVariants.subheader,
      color: theme.colors.primary,
      fontSize: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.s,
    },
    actionButton: {
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.s,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    deleteButton: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.error,
    },
    actionText: {
      ...theme.textVariants.body,
      fontSize: 14,
      color: theme.colors.primary,
    },
    deleteText: {
      color: theme.colors.error,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.m,
    },
    detailsSection: {
      gap: theme.spacing.m,
    },
    detailRow: {
      gap: theme.spacing.xs,
    },
    detailLabel: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      textTransform: 'uppercase',
      color: theme.colors.subText,
    },
    detailValue: {
      ...theme.textVariants.body,
      color: theme.colors.text,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
      flexWrap: 'wrap',
      gap: theme.spacing.s,
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.l,
    },
    addButtonText: {
      ...theme.textVariants.button,
      fontSize: 14,
      color: theme.colors.surface,
    },
    leaveWrapper: {
      marginBottom: theme.spacing.m,
    },
    leaveCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      ...theme.shadows.small,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.secondary,
    },
    leaveHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },
    leaveTitle: {
      ...theme.textVariants.body,
      fontWeight: '600',
      color: theme.colors.text,
    },
    leaveDate: {
      ...theme.textVariants.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    leaveDetail: {
      ...theme.textVariants.caption,
      marginTop: theme.spacing.xs,
      color: theme.colors.subText,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
    },
    emptyText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
    },
  });
