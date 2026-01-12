import React, { useState, useMemo, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { employeesDb } from '../../database';
import { notificationService } from '../../services/notificationService';
import { Theme } from '../../theme';
import { ROLES, UserRole } from '../../services/authService';
import { isValidEmail } from '../../utils/validation';
import { Dropdown } from '../../components/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { permissionsService } from '../../services/permissions';
import { DateTimePickerField } from '../../components/DateTimePickerField';
import { useSelector } from 'react-redux';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { RootState } from '../../store';
import { servicesDb } from '../../database/servicesDb';
import { Service } from '../../database/schema';
import { Permission, rbacService } from '../../services/rbacService';

export const AddEmployeeScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { showModal } = useModal();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { setActiveTab } = useContext(WebNavigationContext);

  const employeeId = route.params?.id || route.params?.employeeId;
  const isEdit = !!employeeId;

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<UserRole>('employee');
  const [loading, setLoading] = useState(false);
  const [vacationDays, setVacationDays] = useState('25');
  const [country, setCountry] = useState('France');
  const [hiringDate, setHiringDate] = useState<Date | null>(new Date());

  // Extended fields
  const [alias, setAlias] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // const [age, setAge] = useState(''); // Deprecated
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [jobTitle, setJobTitle] = useState(''); // Replaces location
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skype, setSkype] = useState('');
  const [website, setWebsite] = useState('');
  const [skills, setSkills] = useState('');

  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [teamId, setTeamId] = useState<number | undefined>(undefined);

  const companies = useSelector((state: RootState) =>
    selectAllCompanies(state),
  );
  const allTeams = useSelector((state: RootState) => selectAllTeams(state));
  const teams = useMemo(() => {
    if (!companyId) return [];
    return allTeams.filter(t => t.companyId === companyId);
  }, [allTeams, companyId]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // RBAC Check: Must have ADD or EDIT permission
    const requiredPermission = isEdit ? Permission.EDIT_EMPLOYEES : Permission.ADD_EMPLOYEES;
    if (!rbacService.hasPermission(currentUser, requiredPermission)) {
      showToast(t('common.unauthorized'), 'error');
      navigateBack();
    }

    const fetchData = async () => {
      if (employeeId) {
        await loadEmployee();
      }
      await loadServices();
      setLoading(false);
    };
    fetchData();
  }, [employeeId, currentUser, isEdit]);

  const loadServices = async () => {
    const allServices = await servicesDb.getAll();
    setServices(allServices);
  };

  const loadEmployee = async () => {
    try {
      const employee = await employeesDb.getById(employeeId);
      if (employee) {
        setName(employee.name);
        setPosition(employee.position || '');
        setPhone(employee.phone || '');
        setEmail(employee.email || '');
        setAddress(employee.address || '');
        setNotes(employee.notes || '');
        setPhotoUri(employee.photoUri || undefined);
        setRole((employee.role as UserRole) || 'employee');
        setDepartment(employee.department || '');
        setLocation(employee.location || '');
        setVacationDays(String(employee.vacationDaysPerYear || 25));
        setCountry(employee.country || 'France');
        if (employee.hiringDate) {
          setHiringDate(new Date(employee.hiringDate));
        }
        setCompanyId(employee.companyId || undefined);
        setTeamId(employee.teamId || undefined);

        // Load extended fields
        setAlias(employee.alias || '');
        setFirstName(employee.firstName || '');
        setLastName(employee.lastName || '');
        // setAge(employee.age ? String(employee.age) : '');
        if (employee.birthDate) {
          setBirthDate(new Date(employee.birthDate));
        }
        setJobTitle(employee.jobTitle || employee.location || ''); // Load jobTitle or fallback to location
        setGender(employee.gender || 'male');
        if (employee.emergencyContact) {
          setEmergencyName(employee.emergencyContact.name);
          setEmergencyPhone(employee.emergencyContact.phone);
          setEmergencyRelationship(employee.emergencyContact.relationship);
        }
        if (employee.socialLinks) {
          setLinkedin(employee.socialLinks.linkedin || '');
          setSkype(employee.socialLinks.skype || '');
          setWebsite(employee.socialLinks.website || '');
        }
        setSkills(employee.skills?.join(', ') || '');
      }
    } catch (error) {
      showToast(t('employees.loadError'));
      console.error(error);
    }
  };

  const validatePhone = (phone: string, country: string) => {
    // Simple regex patterns for demonstration
    const patterns: Record<string, RegExp> = {
      France: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      Tunisia: /^(?:(?:\+|00)216|0)?\s*[2459]\d{7}$/, // Starts with 216 optional, then 8 digits
      Germany: /^(?:(?:\+|00)49|0)\s*[1-9]\d{1,14}$/,
      Spain: /^(?:(?:\+|00)34|0)\s*[679]\d{8}$/,
    };

    // Default to a generous generic pattern if country not found or strictly empty
    const pattern = patterns[country] || /^\+?\d{8,15}$/;
    return pattern.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!name.trim()) newErrors.name = t('employees.nameRequired');

    // Email validation
    if (!email.trim()) {
      newErrors.email = t('signUp.errorEmptyEmail');
    } else if (!isValidEmail(email)) {
      newErrors.email = t('common.invalidEmail');
    }

    // Phone validation
    if (phone) {
      // Check if phone contains only allowed characters (digits, spaces, +, -)
      if (!/^[\d\s\-+]+$/.test(phone)) {
        newErrors.phone = t('common.invalidPhone'); // "Must be a number" implicitly
      } else if (!validatePhone(phone, country)) {
        newErrors.phone = t('common.invalidPhone');
      }
    }

    // Birth Date validation (optional but if set, should be reasonable?)
    /*
    if (age) {
      if (!/^\d+$/.test(age)) {
        newErrors.age = t('employees.ageInvalid');
      } else {
        const ageNum = parseInt(age, 10);
        if (ageNum < 18 || ageNum > 62) {
          newErrors.age = t('employees.ageInvalid');
        }
      }
    }
    */
    if (birthDate) {
      const year = birthDate.getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - year < 18) {
        newErrors.birthDate = t('employees.tooYoung') || 'Must be at least 18';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Employees');
    } else {
      navigation.goBack();
    }
  };

  const handleTakePhoto = async () => {
    const status = await permissionsService.requestCameraPermission();
    if (status !== 'granted') {
      notificationService.showAlert(
        t('profile.permissionDenied'),
        t('profile.permissionBlockedMessage'),
      );
      return;
    }
    showToast('Camera integration would go here', 'info');
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const employeeData = {
        name: name.trim(),
        position,
        phone,
        email,
        address,
        notes,
        photoUri,
        role,
        department,
        // location, // Removed to avoid duplicate key, handled below
        vacationDaysPerYear: parseInt(vacationDays) || 25,
        remainingVacationDays: parseInt(vacationDays) || 25,
        statePaidLeaves: 0,
        country,
        hiringDate: hiringDate ? hiringDate.toISOString() : undefined,
        companyId: companyId || undefined,
        teamId: teamId || undefined,

        // Extended fields
        alias,
        firstName,
        lastName,
        // age: parseInt(age) || undefined,
        birthDate: birthDate ? birthDate.toISOString() : undefined,
        jobTitle,
        location: jobTitle, // Keep location synced for backward compatibility if needed, or just replace usage
        gender,
        emergencyContact: emergencyName
          ? {
            name: emergencyName,
            phone: emergencyPhone,
            relationship: emergencyRelationship,
          }
          : undefined,
        socialLinks:
          linkedin || skype || website
            ? {
              linkedin,
              skype,
              website,
            }
            : undefined,
        skills: skills
          ? skills
            .split(',')
            .map(s => s.trim())
            .filter(s => s)
          : undefined,
      };

      if (employeeId) {
        await employeesDb.update(employeeId, employeeData);
      } else {
        const companyName = companies.find(c => c.id === companyId)?.name;
        await employeesDb.add(employeeData, companyName);
      }

      showModal({
        title: t('common.success'),
        message: employeeId ? t('employees.updated') : t('employees.added'),
        buttons: [
          {
            text: t('common.ok'),
            onPress: () => navigateBack(),
          },
        ],
      });
    } catch (error: any) {
      const errorMessage =
        error.message === 'Email already exists'
          ? t('employees.emailExists') || 'Email already exists'
          : t('employees.saveError');
      showToast(errorMessage, 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showModal({
      title: t('common.delete'),
      message: t('employees.deleteConfirm'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (employeeId) {
                await employeesDb.delete(employeeId);
                showToast(t('employees.deletedSuccessfully'), 'success');
                navigateBack();
              }
            } catch {
              showToast(t('common.error'), 'info');
            }
          },
        },
      ],
    });
  };

  const departmentOptions = [
    { label: t('roles.rh'), value: 'rh' },
    { label: t('roles.manager'), value: 'manager' },
    { label: t('roles.employee'), value: 'employee' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          {/* Section: Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('navigation.personalInfo')}
            </Text>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleTakePhoto}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>
                    {t('illnesses.photoButton')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('employees.name')} *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
                placeholder={t('employees.namePlaceholder')}
                placeholderTextColor={theme.colors.subText}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('employees.alias') || 'Alias'}</Text>
              <TextInput
                style={styles.input}
                value={alias}
                onChangeText={setAlias}
                placeholder={t('employees.aliasPlaceholder') || 'e.g. JB'}
                placeholderTextColor={theme.colors.subText}
              />
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.firstName')}</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={text => {
                    setFirstName(text);
                    if (!name && text && lastName)
                      setName(`${text} ${lastName}`);
                  }}
                  placeholder={t('employees.firstName')}
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.lastName')}</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={text => {
                    setLastName(text);
                    if (!name && firstName && text)
                      setName(`${firstName} ${text}`);
                  }}
                  placeholder={t('employees.lastName')}
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <DateTimePickerField
                  label={t('employees.birthDate') || 'Birth Date'}
                  value={birthDate}
                  onChange={setBirthDate}
                  mode="date"
                />
                {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
              </View>
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('employees.gender')}
                  data={[
                    { label: t('employees.genderMale'), value: 'male' },
                    { label: t('employees.genderFemale'), value: 'female' },
                    { label: t('employees.genderOther'), value: 'other' },
                  ]}
                  value={gender}
                  onSelect={val =>
                    setGender(val as 'male' | 'female' | 'other')
                  }
                />
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.email')}</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder={t('employees.emailPlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.phone')}</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={phone}
                  onChangeText={text => {
                    setPhone(text);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder={t('employees.phonePlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('employees.country')}
                  data={[
                    { label: 'France', value: 'France' },
                    { label: 'Tunisie', value: 'Tunisia' },
                    { label: 'Allemagne', value: 'Germany' },
                    { label: 'Espagne', value: 'Spain' },
                  ]}
                  value={country}
                  onSelect={setCountry}
                />
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.address')}</Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder={t('employees.addressPlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
              <View style={styles.fieldContainer}>
                <DateTimePickerField
                  label={t('employees.hiringDate')}
                  value={hiringDate}
                  onChange={setHiringDate}
                  mode="date"
                />
              </View>
            </View>
          </View>

          {/* Section: Employment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('navigation.employmentDetails')}
            </Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Dropdown
                      label={t('companies.title')}
                      data={companies.map(c => ({
                        label: c.name,
                        value: String(c.id),
                      }))}
                      value={companyId ? String(companyId) : ''}
                      onSelect={val => setCompanyId(Number(val))}
                      placeholder={t('companies.selectCompany')}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        setActiveTab('Companies');
                      } else {
                        navigation.navigate('AddCompany');
                      }
                    }}
                  >
                    <Text style={styles.addButtonText}>➕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Dropdown
                      label={t('teams.title')}
                      data={teams
                        .filter(t => !companyId || t.companyId === companyId)
                        .map(t => ({ label: t.name, value: String(t.id) }))}
                      value={teamId ? String(teamId) : ''}
                      onSelect={val => setTeamId(Number(val))}
                      placeholder={t('teams.selectTeam')}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        setActiveTab('Teams');
                      } else {
                        navigation.navigate('AddTeam');
                      }
                    }}
                  >
                    <Text style={styles.addButtonText}>➕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('employees.specialty')}
                  data={departmentOptions}
                  value={position}
                  onSelect={setPosition}
                  placeholder={t('employees.specialtyPlaceholder')}
                />
              </View>

              <View style={styles.fieldContainer}>
                {currentUser?.role === 'admin' && (
                  <Dropdown
                    label={t('signUp.roleLabel')}
                    data={ROLES.map((r: UserRole) => ({
                      label: t(`roles.${r}`),
                      value: r,
                    }))}
                    value={role}
                    onSelect={val => setRole(val as UserRole)}
                    placeholder={t('signUp.roleLabel')}
                  />
                )}
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('common.service')}
                  data={services.map(s => ({ label: s.name, value: s.name }))}
                  value={department}
                  onSelect={val => setDepartment(String(val))}
                  placeholder={t('common.service')}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.jobTitle') || 'Job Title'}</Text>
                <TextInput
                  style={styles.input}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  placeholder={t('employees.jobTitle') || 'e.g. Senior Developer'}
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
            </View>
          </View>

          {/* Section: Social & Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('employees.skills')}</Text>
            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.linkedin')}</Text>
                <TextInput
                  style={styles.input}
                  value={linkedin}
                  onChangeText={setLinkedin}
                  placeholder="https://linkedin.com/in/..."
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('employees.skills')}</Text>
              <TextInput
                style={styles.input}
                value={skills}
                onChangeText={setSkills}
                placeholder="React, Node.js, HR Management"
                placeholderTextColor={theme.colors.subText}
              />
            </View>
          </View>

          {/* Section: Emergency Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('employees.emergencyContact')}
            </Text>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('employees.emergencyName')}</Text>
              <TextInput
                style={styles.input}
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholder={t('employees.emergencyName')}
                placeholderTextColor={theme.colors.subText}
              />
            </View>
            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  {t('employees.emergencyPhone')}
                </Text>
                <TextInput
                  style={styles.input}
                  value={emergencyPhone}
                  onChangeText={setEmergencyPhone}
                  placeholder={t('employees.emergencyPhone')}
                  placeholderTextColor={theme.colors.subText}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  {t('employees.emergencyRelationship')}
                </Text>
                <TextInput
                  style={styles.input}
                  value={emergencyRelationship}
                  onChangeText={setEmergencyRelationship}
                  placeholder={t('employees.emergencyRelationship')}
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
            </View>
          </View>
          <Text style={styles.label}>{t('employees.notes')}</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('employees.notesPlaceholder')}
            placeholderTextColor={theme.colors.subText}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading
              ? t('common.loading')
              : employeeId
                ? t('common.save')
                : t('common.add')}
          </Text>
        </TouchableOpacity>

        {employeeId && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.m, paddingBottom: theme.spacing.xl },
    formContainer: {
      flex: 1,
      maxWidth: Platform.OS === 'web' ? 800 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.l,
      ...theme.shadows.small,
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.primary,
      marginBottom: theme.spacing.l,
      fontSize: 18,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: theme.spacing.s,
    },
    responsiveRow: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      gap: theme.spacing.m,
    },
    fieldContainer: {
      flex: 1,
      marginBottom: Platform.OS === 'web' ? 0 : theme.spacing.m,
    },
    photoButton: { alignItems: 'center', marginBottom: theme.spacing.l },
    photo: { width: 120, height: 120, borderRadius: 60 },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    photoPlaceholderText: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      textAlign: 'center',
      fontSize: 12,
      padding: 4,
    },
    label: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
      marginTop: theme.spacing.m,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    notesInput: { height: 100, textAlignVertical: 'top' },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
      maxWidth: Platform.OS === 'web' ? 800 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.m,
      marginBottom: theme.spacing.xl,
      maxWidth: Platform.OS === 'web' ? 800 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    deleteButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    inputError: { borderColor: theme.colors.error },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      width: 44,
      height: 44,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2, // Align with input
    },
    addButtonText: {
      fontSize: 20,
      color: theme.colors.surface,
    },
  });
