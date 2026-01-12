import React, { useState, useMemo, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { invoicesDb } from '../../database/invoicesDb';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { notificationService } from '../../services/notificationService';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { useSelector } from 'react-redux';
import { selectAllCurrencies } from '../../store/slices/currenciesSlice';
import { Dropdown } from '../../components/Dropdown';
import { selectAllServices } from '../../store/slices/servicesSlice';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { rbacService } from '../../services/rbacService';
import { RootState } from '../../store';

export const AddInvoiceScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showModal } = useModal();
  const { setActiveTab } = useContext(WebNavigationContext);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const currencies = useSelector(selectAllCurrencies);
  const services = useSelector(selectAllServices);
  const companies = useSelector((state: RootState) =>
    selectAllCompanies(state),
  );
  const teams = useSelector((state: RootState) => selectAllTeams(state));
  const employees = useSelector((state: RootState) =>
    selectAllEmployees(state),
  );

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [photoUri, setPhotoUri] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [teamId, setTeamId] = useState<string | undefined>(undefined);
  const [employeeId, setEmployeeId] = useState<string | undefined>(
    user?.role === 'employee' && user?.id ? user.id : undefined,
  );

  useEffect(() => {
    if (user?.department) {
      setDepartment(user.department);
    }
  }, [user]);

  // Filtering Logic
  const filteredTeams = useMemo(() => {
    if (!companyId) return [];
    return teams.filter(t => t.companyId === companyId);
  }, [teams, companyId]);

  const filteredEmployees = useMemo(() => {
    if (!companyId && !teamId) return employees;
    return employees.filter(emp => {
      const matchesCompany = !companyId || emp.companyId === companyId;
      const matchesTeam = !teamId || emp.teamId === teamId;
      return matchesCompany && matchesTeam;
    });
  }, [employees, companyId, teamId]);

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      const input = (window as any).document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => setPhotoUri(event.target.result);
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    showModal({
      title: t('invoices.photoButton'),
      message: t('illnesses.chooseOption'),
      buttons: [
        {
          text: t('illnesses.takePhoto'),
          onPress: () => {
            launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
              if (response.assets?.[0]?.uri)
                setPhotoUri(response.assets[0].uri);
            });
          },
        },
        {
          text: t('illnesses.chooseFromLibrary'),
          onPress: () => {
            launchImageLibrary(
              { mediaType: 'photo', quality: 0.8 },
              response => {
                if (response.assets?.[0]?.uri)
                  setPhotoUri(response.assets[0].uri);
              },
            );
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    });
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!description.trim()) newErrors.description = t('common.required');
    if (!amount.trim() || isNaN(Number(amount)))
      newErrors.amount = t('common.required');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const selectedEmp = employees.find(e => e.id === employeeId);
      await invoicesDb.add({
        employeeId: employeeId || user?.employeeId || '',
        employeeName: selectedEmp?.name || user?.name,
        amount: Number(amount),
        currency,
        description: description.trim(),
        photoUri: photoUri || undefined,
        status: 'pending',
        companyId: selectedEmp?.companyId || user?.companyId,
        teamId: selectedEmp?.teamId || user?.teamId,
        department: selectedEmp?.department || department,
      });

      showModal({
        title: t('common.success'),
        message: t('invoices.saveSuccess') || t('common.saved'),
        buttons: [
          {
            text: t('common.ok'),
            onPress: () => {
              if (Platform.OS === 'web') {
                setActiveTab('Invoices', 'InvoiceList');
              } else {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Main', { screen: 'Invoices' });
                }
              }
            },
          },
        ],
      });
    } catch (error) {
      console.error('Error saving invoice:', error);
      notificationService.showAlert(t('common.error'), t('invoices.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {/* Admin/RH Selection Section */}
          {(rbacService.isAdmin(user) || rbacService.isRH(user)) && (
            <View style={{ marginBottom: theme.spacing.m }}>
              <Dropdown
                label={t('companies.selectCompany')}
                data={companies.map(c => ({
                  label: c.name,
                  value: String(c.id),
                }))}
                value={companyId ? String(companyId) : ''}
                onSelect={val => {
                  setCompanyId(val || undefined);
                  setTeamId(undefined);
                  setEmployeeId(undefined);
                }}
              />
              <View style={{ height: theme.spacing.m }} />
              <Dropdown
                label={t('teams.selectTeam')}
                data={filteredTeams.map(t => ({
                  label: t.name,
                  value: String(t.id),
                }))}
                value={teamId ? String(teamId) : ''}
                onSelect={val => {
                  setTeamId(val || undefined);
                  setEmployeeId(undefined);
                }}
              />
              <View style={{ height: theme.spacing.m }} />
              <Dropdown
                label={t('employees.name')}
                data={filteredEmployees.map(e => ({
                  label: e.name,
                  value: String(e.id),
                }))}
                value={employeeId ? String(employeeId) : ''}
                onSelect={val => setEmployeeId(val)}
              />
              <View style={{ height: theme.spacing.m }} />
            </View>
          )}

          <Text style={styles.label}>{t('invoices.description')} *</Text>
          <TextInput
            style={[styles.input, errors.description && styles.inputError]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('invoices.descriptionPlaceholder')}
            placeholderTextColor={theme.colors.subText}
            multiline
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}

          <View style={styles.row}>
            <View style={{ flex: 2, marginRight: 10 }}>
              <Text style={styles.label}>{t('invoices.amount')} *</Text>
              <TextInput
                style={[styles.input, errors.amount && styles.inputError]}
                value={amount}
                onChangeText={setAmount}
                placeholder={t('invoices.amountPlaceholder')}
                placeholderTextColor={theme.colors.subText}
                keyboardType="numeric"
              />
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Dropdown
                label={t('invoices.currency')}
                data={currencies.map(c => ({ label: c.code, value: c.code }))}
                value={currency}
                onSelect={setCurrency}
              />
            </View>
          </View>

          <Dropdown
            label={t('common.service')}
            data={services.map(s => ({ label: s.name, value: s.name }))}
            value={department}
            onSelect={setDepartment}
          />

          <TouchableOpacity
            style={styles.photoButton}
            onPress={handleTakePhoto}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {t('invoices.photoButton')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {t('invoices.saveButton')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: {
      padding: theme.spacing.m,
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: theme.spacing.m,
      ...theme.shadows.small,
    },
    label: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputError: { borderColor: theme.colors.error },
    errorText: { color: theme.colors.error, fontSize: 12, marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
    photoButton: {
      marginTop: 24,
      alignItems: 'center',
    },
    photo: { width: '100%', height: 200, borderRadius: 8 },
    photoPlaceholder: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    photoPlaceholderText: { color: theme.colors.primary, fontWeight: '600' },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 24,
    },
    saveButtonText: {
      color: theme.textVariants.button.color,
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
