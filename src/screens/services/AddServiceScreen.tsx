import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { useTheme } from '../../context/ThemeContext';
import { servicesDb } from '../../database/servicesDb';
import { Theme } from '../../theme';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { useSelector } from 'react-redux';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { Dropdown } from '../../components/Dropdown';

export const AddServiceScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { setActiveTab } = React.useContext(WebNavigationContext) as any;

  const serviceId = route?.params?.serviceId;
  const companyId = route?.params?.companyId;
  const isEdit = !!serviceId;

  const [name, setName] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<
    string | undefined
  >(companyId);
  const [error, setError] = useState('');

  const companies = useSelector(selectAllCompanies);
  const companyOptions = useMemo(
    () => [
      {
        label: t('common.allCompanies') || 'All Companies / Global',
        value: 'global',
      },
      ...companies.map(c => ({ label: c.name, value: c.id })),
    ],
    [companies, t],
  );

  useEffect(() => {
    if (isEdit) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    try {
      const services = companyId
        ? await servicesDb.getByCompany(companyId)
        : await servicesDb.getAll();
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setName(service.name);
        setSelectedCompanyId(service.companyId);
      }
    } catch (error) {
      showToast(t('common.error'), 'error');
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t('common.required'));
      return;
    }

    try {
      if (isEdit) {
        await servicesDb.update(serviceId, name.trim(), selectedCompanyId);
      } else {
        await servicesDb.add(name.trim(), selectedCompanyId);
      }

      showModal({
        title: t('common.success'),
        message: isEdit
          ? t('services.updateSuccess') || t('common.saved')
          : t('services.saveSuccess') || t('common.saved'),
        buttons: [
          {
            text: t('common.ok'),
            onPress: () => {
              if (Platform.OS === 'web') {
                setActiveTab?.('CompanySettings', 'Services', {
                  companyId: selectedCompanyId,
                });
              } else {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Main', { screen: 'Services' });
                }
              }
            },
          },
        ],
      });
    } catch (error) {
      showToast(t('common.saveError'), 'error');
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (Platform.OS === 'web') {
      setActiveTab?.('CompanySettings', 'Services');
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEdit ? t('common.edit') : t('services.add')}
          </Text>
        </View>

        <View style={styles.fieldContainer}>
          <Dropdown
            label={t('companies.select')}
            data={companyOptions}
            value={selectedCompanyId || 'global'}
            onSelect={val =>
              setSelectedCompanyId(val === 'global' ? undefined : val)
            }
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t('common.service')} *</Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={name}
            onChangeText={text => {
              setName(text);
              if (error) setError('');
            }}
            placeholder={t('services.namePlaceholder')}
            placeholderTextColor={theme.colors.subText}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      ...theme.shadows.medium,
    },
    title: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      fontSize: 24,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.m,
      marginBottom: theme.spacing.l,
    },
    backButton: {
      padding: theme.spacing.s,
    },
    backButtonText: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: '600',
    },
    fieldContainer: {
      marginBottom: theme.spacing.l,
    },
    label: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      fontSize: 16,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: theme.spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.m,
    },
    button: {
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.spacing.s,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.border,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontWeight: '600',
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  });
