import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { illnessesDb } from '../../database/illnessesDb';
import { notificationService } from '../../services/notificationService';
import { Illness } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const IllnessDetailsScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { illnessId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showModal } = useModal();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [illness, setIllness] = useState<Illness | null>(null);
  const [loading, setLoading] = useState(true);

  const { setActiveTab } = useContext(WebNavigationContext);

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Illnesses');
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadIllness();
  }, [illnessId]);

  const loadIllness = async () => {
    try {
      const data = await illnessesDb.getById(illnessId);
      setIllness(data);
    } catch (error) {
      notificationService.showAlert(t('common.errorTitle'), t('common.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showModal({
      title: t('common.deleteTitle'),
      message: t('common.deleteMessage'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await illnessesDb.delete(illnessId);
              await notificationService.cancelIllnessReminder(illnessId);
              navigateBack();
            } catch (error) {
              notificationService.showAlert(t('common.errorTitle'), t('common.deleteFailed'));
            }
          },
        },
      ],
    });
  };

  const handleEdit = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Illnesses', 'AddIllness', { illnessId });
    } else {
      navigation.navigate('AddIllness', { illnessId });
    }
  };

  const handleViewHistory = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Illnesses', 'IllnessHistory', { illnessId });
    } else {
      navigation.navigate('IllnessHistory', { illnessId });
    }
  };

  if (loading || !illness) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>{illness.payrollName}</Text>
          {illness.employeeName && (
            <Text style={styles.employee}>{illness.employeeName}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('illnesses.issueDateLabel')}</Text>
          <Text style={styles.value}>
            {new Date(illness.issueDate).toLocaleDateString()}
          </Text>
        </View>

        {illness.expiryDate && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('illnesses.expiryDateLabel')}</Text>
            <Text style={styles.value}>
              {new Date(illness.expiryDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {illness.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('illnesses.notesLabel')}</Text>
            <Text style={styles.value}>{illness.notes}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleViewHistory}>
          <Text style={styles.buttonText}>{t('common.viewHistory')}</Text>
        </TouchableOpacity>

        {(user?.role === 'admin' || user?.role === 'rh' || user?.role === 'chef_dequipe') && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={handleEdit}
            >
              <Text style={styles.buttonText}>{t('common.edit')}</Text>
            </TouchableOpacity>

            {(user?.role === 'admin' || user?.role === 'rh') && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            )}
          </>
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
    content: {
      padding: theme.spacing.m,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    title: {
      ...theme.textVariants.header,
      marginBottom: theme.spacing.s,
      color: theme.colors.text,
    },
    employee: {
      ...theme.textVariants.subheader,
      color: theme.colors.primary,
    },
    label: {
      ...theme.textVariants.caption,
      marginBottom: 4,
      color: theme.colors.subText,
    },
    value: {
      ...theme.textVariants.body,
      color: theme.colors.text,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.m,
    },
    editButton: {
      backgroundColor: theme.colors.secondary,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
    buttonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
  });
