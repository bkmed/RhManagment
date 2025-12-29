import React, { useState, useCallback, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { employeesDb } from '../../database/employeesDb';
import { leavesDb } from '../../database/leavesDb';
import { notificationService } from '../../services/notificationService';
import { Employee, Leave } from '../../database/schema';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { LoadingScreen } from '../../components/LoadingScreen';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return '#4CAF50';
    case 'declined': return '#F44336';
    default: return '#FF9800';
  }
};

export const EmployeeDetailsScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { employeeId } = route.params;
  const { showModal } = useModal();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  const { setActiveTab } = useContext(WebNavigationContext);

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
        notificationService.showAlert(t('common.error'), t('employees.notFound'));
        navigationBack();
      }

      setLeaves(leavesData);
    } catch (error) {
      console.error('Error loading employee details:', error);
      notificationService.showAlert(t('common.error'), t('employees.loadError'));
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
    if (Platform.OS === 'web') {
      setActiveTab('Employees', 'AddEmployee', { id: employeeId });
    } else {
      navigation.navigate('AddEmployee', { employeeId });
    }
  };

  const handleDelete = () => {
    showModal({
      title: t('employees.deleteConfirmTitle'),
      message: t('employees.deleteConfirmMessage'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await employeesDb.delete(employeeId);
              showToast(t('employees.deletedSuccessfully'), 'success');
              navigationBack();
            } catch (error) {
              showToast(t('common.error'), 'info');
            }
          },
        },
      ],
    });
  };

  const renderLeave = ({ item }: { item: Leave }) => (
    <View style={styles.leaveCard}>
      <View style={styles.leaveHeader}>
        <Text style={styles.leaveTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {t(`leaveStatus.${item.status}`)}
          </Text>
        </View>
      </View>
      <Text style={styles.leaveDate}>
        {formatDate(item.dateTime)}
        {' '}
        {formatDateTime(item.dateTime)}
      </Text>
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
            {(user?.role === 'admin' || user?.role === 'rh') && (
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
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.detailLabel}>{t('employees.phone')}</Text>
                <Text style={styles.detailValue}>{employee.phone || '-'}</Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.detailLabel}>{t('employees.email')}</Text>
                <Text style={styles.detailValue}>{employee.email || '-'}</Text>
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.detailLabel}>{t('employees.age')}</Text>
                <Text style={styles.detailValue}>{employee.age || '-'}</Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.detailLabel}>{t('employees.gender')}</Text>
                <Text style={styles.detailValue}>{employee.gender ? t(`employees.gender${employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)}`) : '-'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('employees.address')}</Text>
              <Text style={styles.detailValue}>{employee.address || '-'}</Text>
            </View>

            <View style={styles.divider} />

            {/* Emergency Contact Section */}
            <Text style={styles.subSectionTitle}>{t('employees.emergencyContact')}</Text>
            {employee.emergencyContact ? (
              <View style={styles.infoBox}>
                <View style={styles.responsiveRow}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.detailLabel}>{t('employees.emergencyName')}</Text>
                    <Text style={styles.detailValue}>{employee.emergencyContact.name}</Text>
                  </View>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.detailLabel}>{t('employees.emergencyPhone')}</Text>
                    <Text style={styles.detailValue}>{employee.emergencyContact.phone}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('employees.emergencyRelationship')}</Text>
                  <Text style={styles.detailValue}>{employee.emergencyContact.relationship}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyTextSmall}>{t('common.noData')}</Text>
            )}

            <View style={styles.divider} />

            {/* Skills & History Section */}
            <Text style={styles.subSectionTitle}>{t('employees.linkedin')}</Text>
            {employee.socialLinks?.linkedin ? (
              <Text style={[styles.detailValue, { color: theme.colors.primary }]}>{employee.socialLinks.linkedin}</Text>
            ) : (
              <Text style={styles.emptyTextSmall}>{t('common.noData')}</Text>
            )}

            <View style={styles.divider} />

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.detailLabel}>{t('employees.hiringDate')}</Text>
                <Text style={styles.detailValue}>{employee.hiringDate ? formatDate(employee.hiringDate) : '-'}</Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.detailLabel}>{t('common.service')}</Text>
                <Text style={styles.detailValue}>{employee.department || '-'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('employees.skills')}</Text>
              {employee.skills && employee.skills.length > 0 ? (
                <View style={styles.skillsContainer}>
                  {employee.skills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailValue}>-</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.detailLabel}>{t('leavePolicy.perYear')}</Text>
                <Text style={styles.detailValue}>{employee.vacationDaysPerYear}</Text>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.detailLabel}>{t('leavePolicy.remaining')}</Text>
                <Text style={[styles.detailValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                  {employee.remainingVacationDays}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('leaves.title')}</Text>
          {(user?.role === 'admin' || user?.role === 'rh' || user?.role === 'chef_dequipe') && (
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
          )}
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
    responsiveRow: {
      flexDirection: 'row',
      gap: theme.spacing.m,
      marginBottom: theme.spacing.m,
    },
    fieldContainer: {
      flex: 1,
    },
    subSectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: theme.spacing.s,
    },
    infoBox: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyTextSmall: {
      fontSize: 12,
      color: theme.colors.subText,
      fontStyle: 'italic',
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.s,
      marginTop: theme.spacing.xs,
    },
    skillBadge: {
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 4,
      borderRadius: theme.spacing.s,
    },
    skillText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
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
      marginTop: 4,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
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
