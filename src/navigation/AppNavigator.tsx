import React, { useState, useMemo } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { enableScreens } from 'react-native-screens';
import {
  NavigationContainer,
  useNavigationContainerRef,
  DefaultTheme,
} from '@react-navigation/native';
import notifee, { EventType } from '@notifee/react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { sessionService } from '../services/sessionService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { rbacService, Permission } from '../services/rbacService';
import { HomeScreen } from '../screens/HomeScreen';
import { PayrollListScreen } from '../screens/payroll/PayrollListScreen';
import { AddPayrollScreen } from '../screens/payroll/AddPayrollScreen';
import { PayrollDetailsScreen } from '../screens/payroll/PayrollDetailsScreen';
import { LeaveListScreen } from '../screens/leaves/LeaveListScreen';
import { AddLeaveScreen } from '../screens/leaves/AddLeaveScreen';
import { LeaveDetailsScreen } from '../screens/leaves/LeaveDetailsScreen';
import { LeaveApprovalListScreen } from '../screens/leaves/LeaveApprovalListScreen';
import { TeamAbsencesScreen } from '../screens/leaves/TeamAbsencesScreen';
import { CompanyAbsencesScreen } from '../screens/leaves/CompanyAbsencesScreen';
import { IllnessListScreen } from '../screens/illnesses/IllnessListScreen';
import { AddIllnessScreen } from '../screens/illnesses/AddIllnessScreen';
import { IllnessDetailsScreen } from '../screens/illnesses/IllnessDetailsScreen';
import { IllnessHistoryScreen } from '../screens/illnesses/IllnessHistoryScreen';
import { EmployeeListScreen } from '../screens/employees/EmployeeListScreen';
import { AddEmployeeScreen } from '../screens/employees/AddEmployeeScreen';
import { EmployeeDetailsScreen } from '../screens/employees/EmployeeDetailsScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ManageCurrenciesScreen } from '../screens/profile/ManageCurrenciesScreen';
import { MyTeamScreen } from '../screens/teams/MyTeamScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { RemoteCalendarScreen } from '../screens/remote/RemoteCalendarScreen';
import { AddClaimScreen } from '../screens/claims/AddClaimScreen';
import { ClaimsListScreen } from '../screens/claims/ClaimsListScreen';
import { ClaimDetailsScreen } from '../screens/claims/ClaimDetailsScreen';
import { InvoiceListScreen } from '../screens/claims/InvoiceListScreen';
import { AddInvoiceScreen } from '../screens/claims/AddInvoiceScreen';
import { CompanyListScreen } from '../screens/companies/CompanyListScreen';
import { AddCompanyScreen } from '../screens/companies/AddCompanyScreen';
import { TeamListScreen } from '../screens/teams/TeamListScreen';
import { AddTeamScreen } from '../screens/teams/AddTeamScreen';
import { DepartmentListScreen } from '../screens/departments/DepartmentListScreen';
import { AddDepartmentScreen } from '../screens/departments/AddDepartmentScreen';
import { ServiceListScreen } from '../screens/services/ServiceListScreen';
import { AddServiceScreen } from '../screens/services/AddServiceScreen';
import { TeamVacationsScreen } from '../screens/teams/TeamVacationsScreen';
import { CareerHubScreen } from '../screens/profile/CareerHubScreen';
import { PerformanceReviewScreen } from '../screens/analytics/PerformanceReviewScreen';
import { ReviewPeriodScreen } from '../screens/performance/ReviewPeriodScreen';
import { ManageNotificationsScreen } from '../screens/notifications/ManageNotificationsScreen';
import { OrgChartScreen } from '../screens/companies/OrgChartScreen';
import { AnnouncementsScreen } from '../screens/home/AnnouncementsScreen';
import { PersonalSettingsScreen } from '../screens/settings/PersonalSettingsScreen';
import { CompanySettingsScreen } from '../screens/settings/CompanySettingsScreen';
import { CompanyChatScreen } from '../screens/chat/CompanyChatScreen';
import { LanguageSelectionScreen } from '../screens/settings/LanguageSelectionScreen';
import { MenuCustomizationScreen } from '../screens/settings/MenuCustomizationScreen';
import { CustomThemeColorsScreen } from '../screens/settings/CustomThemeColorsScreen';
import { ManageDevicesScreen } from '../screens/settings/ManageDevicesScreen';
import { MyDevicesScreen } from '../screens/settings/MyDevicesScreen';
import { NotificationBell } from '../components/common/NotificationBell';
import { SearchOverlay } from '../components/common/SearchOverlay';
import { ChatBot } from '../components/common/ChatBot';
import { useAuth } from '../context/AuthContext';
import { GlassHeader } from '../components/common/GlassHeader';

enableScreens();

import { WebNavigationContext } from './WebNavigationContext';

// ======= Stacks =======
const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const PayrollStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="PayrollList"
        component={PayrollListScreen}
        options={{ title: t('navigation.payroll') }}
      />
      <Stack.Screen
        name="AddPayroll"
        component={AddPayrollScreen}
        options={{ title: t('payroll.add') }}
      />
      <Stack.Screen
        name="PayrollDetails"
        component={PayrollDetailsScreen}
        options={{ title: t('payroll.details') }}
      />
    </Stack.Navigator>
  );
};

const LeavesStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="LeaveList"
        component={LeaveListScreen}
        options={{ title: t('navigation.leaves') }}
      />
      <Stack.Screen
        name="AddLeave"
        component={AddLeaveScreen}
        options={{ title: t('leaves.add') }}
      />
      <Stack.Screen
        name="LeaveApprovalList"
        component={LeaveApprovalListScreen}
        options={{ title: t('leaves.approvals') }}
      />
      <Stack.Screen
        name="LeaveDetails"
        component={LeaveDetailsScreen}
        options={{ title: t('leaves.details') }}
      />
      <Stack.Screen
        name="TeamVacations"
        component={TeamVacationsScreen}
        options={{ title: t('navigation.teams') }}
      />
      <Stack.Screen
        name="TeamAbsences"
        component={TeamAbsencesScreen}
        options={{ title: t('leaves.teamAbsences') || 'Team Absences' }}
      />
      <Stack.Screen
        name="CompanyAbsences"
        component={CompanyAbsencesScreen}
        options={{ title: t('leaves.companyAbsences') || 'Company Absences' }}
      />
    </Stack.Navigator>
  );
};

const IllnessesStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="IllnessList"
        component={IllnessListScreen}
        options={{ title: t('navigation.illnesses') }}
      />
      <Stack.Screen
        name="AddIllness"
        component={AddIllnessScreen}
        options={{ title: t('illnesses.add') }}
      />
      <Stack.Screen
        name="IllnessDetails"
        component={IllnessDetailsScreen}
        options={{ title: t('illnesses.details') }}
      />
      <Stack.Screen
        name="IllnessHistory"
        component={IllnessHistoryScreen}
        options={{ title: t('common.viewHistory') }}
      />
    </Stack.Navigator>
  );
};

const EmployeesStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="EmployeeList"
        component={EmployeeListScreen}
        options={{ title: t('navigation.employees') }}
      />
      <Stack.Screen
        name="AddEmployee"
        component={AddEmployeeScreen}
        options={{ title: t('employees.add') }}
      />
      <Stack.Screen
        name="EmployeeDetails"
        component={EmployeeDetailsScreen}
        options={{ title: t('employees.details') }}
      />
    </Stack.Navigator>
  );
};

const AnalyticsStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AnalyticsMain"
        component={AnalyticsScreen}
        options={{ title: t('navigation.analytics') }}
      />
      <Stack.Screen
        name="PerformanceReview"
        component={PerformanceReviewScreen}
        options={{ title: t('performance.title') || 'Évaluations' }}
      />
      <Stack.Screen
        name="ReviewPeriod"
        component={ReviewPeriodScreen}
        options={{ title: t('performance.periods') || 'Review Periods' }}
      />
    </Stack.Navigator>
  );
};

const ClaimsStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="ClaimsList"
        component={ClaimsListScreen}
        options={{ title: t('navigation.claims') }}
      />
      <Stack.Screen
        name="AddClaim"
        component={AddClaimScreen}
        options={{ title: t('claims.newClaim') }}
      />
      <Stack.Screen
        name="ClaimDetails"
        component={ClaimDetailsScreen}
        options={{ title: t('claims.details') }}
      />
    </Stack.Navigator>
  );
};

const InvoicesStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="InvoiceList"
        component={InvoiceListScreen}
        options={{ title: t('invoices.title') }}
      />
      <Stack.Screen
        name="AddInvoice"
        component={AddInvoiceScreen}
        options={{ title: t('invoices.add') }}
      />
    </Stack.Navigator>
  );
};

const CompanyStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="CompanyList"
        component={CompanyListScreen}
        options={{ title: t('navigation.companies') }}
      />
      <Stack.Screen
        name="AddCompany"
        component={AddCompanyScreen}
        options={{ title: t('common.add') + ' ' + t('companies.title') }}
      />
      <Stack.Screen
        name="OrgChart"
        component={OrgChartScreen}
        options={{ title: t('navigation.orgChart') }}
      />
    </Stack.Navigator>
  );
};

const TeamStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="TeamList"
        component={TeamListScreen}
        options={{ title: t('navigation.teams') }}
      />
      <Stack.Screen
        name="AddTeam"
        component={AddTeamScreen}
        options={{ title: t('common.add') + ' ' + t('teams.title') }}
      />
    </Stack.Navigator>
  );
};

const DepartmentStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="DepartmentList"
        component={DepartmentListScreen}
        options={{ title: t('navigation.departments') }}
      />
      <Stack.Screen
        name="AddDepartment"
        component={AddDepartmentScreen}
        options={{ title: t('departments.add') }}
      />
    </Stack.Navigator>
  );
};

const ServiceStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="ServiceList"
        component={ServiceListScreen}
        options={{ title: t('navigation.services') }}
      />
      <Stack.Screen
        name="AddService"
        component={AddServiceScreen}
        options={{ title: t('services.add') }}
      />
    </Stack.Navigator>
  );
};
const SettingsStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="PersonalSettings"
        component={PersonalSettingsScreen}
        options={{ title: t('settings.personal') }}
      />
      <Stack.Screen
        name="CompanySettings"
        component={CompanySettingsScreen}
        options={{ title: t('settings.company') }}
      />
      <Stack.Screen
        name="CustomThemeColors"
        component={CustomThemeColorsScreen}
        options={{ title: t('settings.customizeColors') || 'Customize Colors' }}
      />
      <Stack.Screen
        name="MenuCustomization"
        component={MenuCustomizationScreen}
        options={{ title: t('settings.customizeMenu') || 'Customize Menu' }}
      />
      <Stack.Screen
        name="ManageDevices"
        component={ManageDevicesScreen}
        options={{ title: t('navigation.manageDevices') || 'Manage Devices' }}
      />
      <Stack.Screen
        name="Departments"
        component={DepartmentListScreen}
        options={{ title: t('navigation.departments') }}
      />
      <Stack.Screen
        name="AddDepartment"
        component={AddDepartmentScreen}
        options={{ title: t('departments.add') }}
      />
      <Stack.Screen
        name="Services"
        component={ServiceListScreen}
        options={{ title: t('navigation.services') }}
      />
      <Stack.Screen
        name="AddService"
        component={AddServiceScreen}
        options={{ title: t('services.add') }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen
        name="CareerHub"
        component={CareerHubScreen}
        options={{ headerShown: true, title: t('navigation.careerHub') }}
      />
      <Stack.Screen
        name="ManageCurrencies"
        component={ManageCurrenciesScreen}
        options={{
          headerShown: true,
          title: t('payroll.currency') || 'Currencies',
        }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageSelectionScreen}
        options={{ title: t('profile.language') }}
      />
      <Stack.Screen
        name="MyTeam"
        component={MyTeamScreen}
        options={{ headerShown: true, title: t('teams.myTeam') || 'My Team' }}
      />
      <Stack.Screen
        name="MyDevices"
        component={MyDevicesScreen}
        options={{
          headerShown: true,
          title: t('devices.myMaterial') || 'My Material',
        }}
      />
    </Stack.Navigator>
  );
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen
      name="Announcements"
      component={AnnouncementsScreen}
      options={{ headerShown: true, title: 'News' }}
    />
    <Stack.Screen
      name="Chat"
      component={CompanyChatScreen}
      options={{ headerShown: false }} // Header is inside screen now
    />
    <Stack.Screen
      name="ManageNotifications"
      component={ManageNotificationsScreen}
      options={{ headerShown: true, title: 'Broadcast Notification' }}
    />
  </Stack.Navigator>
);

// ======= Tabs (Mobile) =======
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeTab" component={HomeStack} />
    <Tab.Screen name="PayrollTab" component={PayrollStack} />
    <Tab.Screen name="LeavesTab" component={LeavesStack} />
    <Tab.Screen
      name="ClaimsTab"
      component={ClaimsStack}
      options={{ title: 'Claims' }}
    />
    <Tab.Screen
      name="InvoicesTab"
      component={InvoicesStack}
      options={{ title: 'Invoices' }}
    />
    <Tab.Screen
      name="ChatTab"
      component={CompanyChatScreen}
      options={{ title: 'Chat' }}
    />
  </Tab.Navigator>
);

// ======= Drawer (Mobile) =======
const Drawer = createDrawerNavigator();

// ======= Custom Hook for Sectioned Navigation =======
const useNavigationSections = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return useMemo(() => {
    const sections = [
      {
        title: t('sections.general'),
        items: [
          { key: 'Home', label: t('navigation.home'), icon: '🏠' },
          ...(rbacService.hasPermission(user, Permission.VIEW_EMPLOYEES)
            ? [
                {
                  key: 'Analytics',
                  label: t('navigation.analytics'),
                  icon: '📊',
                },
              ]
            : []),
        ],
      },
      {
        title: t('sections.management'),
        items: [
          { key: 'Payroll', label: t('navigation.payroll'), icon: '💰' },
          { key: 'Leaves', label: t('navigation.leaves'), icon: '🏖️' },
          { key: 'Claims', label: t('navigation.claims'), icon: '📝' },
          ...(rbacService.hasPermission(user, Permission.MANAGE_INVOICES)
            ? [{ key: 'Invoices', label: t('invoices.title'), icon: '🧾' }]
            : []),
          { key: 'Remote', label: t('remote.title'), icon: '📅' },
        ],
      },
    ];

    const organizationItems = [];

    if (rbacService.hasPermission(user, Permission.VIEW_EMPLOYEES)) {
      organizationItems.push({
        key: 'Employees',
        label: t('navigation.employees'),
        icon: '👥',
      });
    }

    if (rbacService.hasPermission(user, Permission.MANAGE_COMPANY)) {
      organizationItems.push({
        key: 'Companies',
        label: t('navigation.companies'),
        icon: '🏢',
      });
    }

    if (rbacService.hasPermission(user, Permission.MANAGE_TEAMS)) {
      organizationItems.push({
        key: 'Teams',
        label: t('navigation.teams'),
        icon: '🤝',
      });
    }

    if (rbacService.hasPermission(user, Permission.MANAGE_SETTINGS)) {
      organizationItems.push({
        key: 'CompanySettings',
        label: t('settings.company'),
        icon: '🏢',
      });
    }

    if (organizationItems.length > 0) {
      sections.push({
        title: t('sections.organization'),
        items: organizationItems,
      });
    }

    sections.push({
      title: t('sections.communication'),
      items: [
        ...(user?.companyId
          ? [
              {
                key: 'Announcements',
                label: t('navigation.announcements'),
                icon: '📢',
              },
            ]
          : []),
        ...(rbacService.isAdmin(user) ||
        rbacService.isRH(user) ||
        rbacService.isManager(user)
          ? [
              {
                key: 'ManageNotifications',
                label: t('notifications.broadcast') || 'Broadcast',
                icon: '📡',
              },
            ]
          : []),
        ...(user?.companyId
          ? [{ key: 'Chat', label: t('navigation.chat'), icon: '💬' }]
          : []),
        {
          key: 'Assistant',
          label: t('common.assistant') || 'Assistant',
          icon: '🤖',
        },
      ],
    });

    sections.push({
      title: t('sections.personal'),
      items: [
        { key: 'Settings', label: t('navigation.settings'), icon: '⚙️' },
        { key: 'Language', label: t('profile.language'), icon: '🌐' },
        { key: 'Profile', label: t('navigation.profile'), icon: '👤' },
      ],
    });

    return sections;
  }, [t, user]);
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user } = useAuth();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const { state, navigation } = props;
  const sections = useNavigationSections();
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View
        style={{
          padding: '8%',
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          backgroundColor: theme.colors.primary,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          marginBottom: 12,
          minHeight: 180,
          justifyContent: 'center',
          ...theme.shadows.medium,
          ...(themeMode === 'premium' && {
            borderBottomWidth: 1,
            borderBottomColor: '#FFD700',
          }),
        }}
      >
        <Image
          source={require('../../public/logo.png')}
          style={{
            width: 60,
            height: 60,
            tintColor:
              themeMode === 'premium' ? theme.colors.background : '#FFF',
            marginBottom: 16,
          }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: themeMode === 'premium' ? theme.colors.background : '#FFF',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          {user?.name}
        </Text>
        <Text
          style={{
            color:
              themeMode === 'premium'
                ? 'rgba(11,13,23,0.8)'
                : 'rgba(255,255,255,0.8)',
            fontSize: 14,
          }}
        >
          {t(`roles.${user?.role || 'undefined'}`)}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {sections.map(section => (
          <View key={section.title} style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => toggleSection(section.title)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingRight: 16,
              }}
            >
              <Text
                style={{
                  marginLeft: 16,
                  marginTop: 8,
                  marginBottom: 4,
                  color: theme.colors.subText,
                  fontWeight: '600',
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                {section.title}
              </Text>
              <Text style={{ color: theme.colors.subText, fontSize: 12 }}>
                {collapsedSections[section.title] ? '▼' : '▲'}
              </Text>
            </TouchableOpacity>

            {!collapsedSections[section.title] &&
              section.items.map(item => {
                const isFocused = state.routes[state.index].name === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      marginHorizontal: 12,
                      marginVertical: 2,
                      borderRadius: 12,
                      backgroundColor: isFocused
                        ? `${theme.colors.primary}15`
                        : 'transparent',
                      ...(isFocused &&
                        themeMode === 'premium' && {
                          borderWidth: 1,
                          borderColor: theme.colors.primary,
                        }),
                    }}
                    onPress={() => navigation.navigate(item.key)}
                  >
                    <Text style={{ fontSize: 20, marginRight: 16 }}>
                      {item.icon}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isFocused ? '700' : '500',
                        color: isFocused
                          ? theme.colors.primary
                          : theme.colors.text,
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const DrawerNavigator = () => {
  const { user } = useAuth();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Main" component={TabNavigator} />

      {/* Analytics: VIEW_EMPLOYEES (Managers+) */}
      {rbacService.hasPermission(user, Permission.VIEW_EMPLOYEES) && (
        <Drawer.Screen name="Analytics" component={AnalyticsStack} />
      )}

      {/* Employees: VIEW_EMPLOYEES */}
      {rbacService.hasPermission(user, Permission.VIEW_EMPLOYEES) && (
        <Drawer.Screen name="Employees" component={EmployeesStack} />
      )}

      {/* Companies: MANAGE_COMPANY (Admin) */}
      {rbacService.hasPermission(user, Permission.MANAGE_COMPANY) && (
        <Drawer.Screen name="Companies" component={CompanyStack} />
      )}

      {/* Teams: MANAGE_TEAMS (Admin/RH) */}
      {rbacService.hasPermission(user, Permission.MANAGE_TEAMS) && (
        <Drawer.Screen name="Teams" component={TeamStack} />
      )}

      {/* Settings: MANAGE_SETTINGS (Admin) - technically Department/Service management is here too */}
      {/* But Departments/Services might needed by RH? */}
      {/* For now, linking to MANAGE_SETTINGS matching menu */}
      {rbacService.hasPermission(user, Permission.MANAGE_SETTINGS) && (
        <>
          <Drawer.Screen name="Departments" component={DepartmentStack} />
          <Drawer.Screen name="Services" component={ServiceStack} />
          <Drawer.Screen name="Settings" component={SettingsStack} />
          {/* Note: SettingsStack contains CompanySettings */}
        </>
      )}

      <Drawer.Screen name="Remote" component={RemoteCalendarScreen} />
      <Drawer.Screen name="Claims" component={ClaimsStack} />
      <Drawer.Screen name="Invoices" component={InvoicesStack} />
      <Drawer.Screen name="Profile" component={ProfileStack} />

      <Drawer.Screen name="Announcements" component={AnnouncementsScreen} />
      <Drawer.Screen name="Chat" component={CompanyChatScreen} />

      {/* Map other screens if needed, ensuring names match keys */}
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Payroll" component={PayrollStack} />
      <Drawer.Screen name="Leaves" component={LeavesStack} />
      <Drawer.Screen name="Assistant">{() => <ChatBot />}</Drawer.Screen>
    </Drawer.Navigator>
  );
};

// ======= Web Navigator avec subScreen =======
const WebNavigator = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 1045;

  const [activeTab, setActiveTab] = useState('Home');
  const [subScreen, setSubScreen] = useState('');
  const [screenParams, setScreenParams] = useState<Record<string, unknown>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const contextValue = useMemo(
    () => ({
      activeTab,
      subScreen,
      screenParams,
      setActiveTab: (
        tab: string,
        screen?: string,
        params?: Record<string, unknown>,
      ) => {
        setActiveTab(tab);
        setSubScreen(screen || '');
        setScreenParams(params || {});
        setIsMenuOpen(false); // Close menu on navigation
      },
    }),
    [activeTab, subScreen, screenParams],
  );

  const handleSearchSelect = (result: { type: string; id?: string }) => {
    setIsSearchVisible(false);
    if (result.type === 'employee') {
      contextValue.setActiveTab('Employees', 'EmployeeDetails', {
        id: Number(result.id),
      });
    } else if (result.type === 'team') {
      contextValue.setActiveTab('Teams', '', { teamId: Number(result.id) });
    } else if (result.type === 'announcement') {
      contextValue.setActiveTab('Announcements');
    } else if (result.type === 'company') {
      contextValue.setActiveTab('Companies', '', {
        companyId: Number(result.id),
      });
    } else if (result.type === 'department' || result.type === 'service') {
      contextValue.setActiveTab(
        'CompanySettings',
        result.type === 'department' ? 'Departments' : 'Services',
      );
    } else if (result.type === 'invoice') {
      contextValue.setActiveTab('Invoices', '', {
        invoiceId: Number(result.id),
      });
    } else if (result.type === 'payroll') {
      contextValue.setActiveTab('Payroll', 'PayrollDetails', {
        id: Number(result.id),
      });
    }
  };
  const getActiveComponent = () => {
    // Create a mock route object for web screens

    const mockRoute = {
      params: screenParams,
      key: 'mock-key',
      name: 'mock-name',
    } as any;
    const mockNavigation = {
      navigate: setActiveTab,
      goBack: () => setSubScreen(''),
    } as any;

    switch (activeTab) {
      case 'Home':
        if (subScreen === 'CareerHub') return <CareerHubScreen />;
        return <HomeStack />;
      case 'Payroll':
        if (subScreen === 'AddPayroll')
          return (
            <AddPayrollScreen route={mockRoute} navigation={mockNavigation} />
          );
        if (subScreen === 'PayrollDetails')
          return (
            <PayrollDetailsScreen
              route={mockRoute}
              navigation={mockNavigation}
            />
          );
        return <PayrollStack />;
      case 'Leaves':
        if (subScreen === 'AddLeave')
          return (
            <AddLeaveScreen route={mockRoute} navigation={mockNavigation} />
          );
        if (subScreen === 'LeaveList')
          return <LeaveListScreen navigation={mockNavigation} />;
        if (subScreen === 'LeaveDetails')
          return (
            <LeaveDetailsScreen route={mockRoute} navigation={mockNavigation} />
          );
        if (subScreen === 'LeaveApprovalList')
          return <LeaveApprovalListScreen />;
        if (subScreen === 'TeamVacations') return <TeamVacationsScreen />;
        return <LeavesStack />;
      case 'Illnesses':
        if (subScreen === 'IllnessList')
          return (
            <IllnessListScreen route={mockRoute} navigation={mockNavigation} />
          );
        if (subScreen === 'AddIllness')
          return (
            <AddIllnessScreen route={mockRoute} navigation={mockNavigation} />
          );
        if (subScreen === 'IllnessDetails')
          return (
            <IllnessDetailsScreen
              route={mockRoute}
              navigation={mockNavigation}
            />
          );
        if (subScreen === 'IllnessHistory') return <IllnessHistoryScreen />;
        return <IllnessesStack />;
      case 'Remote':
        return <RemoteCalendarScreen />;
      case 'Analytics':
        if (!rbacService.hasPermission(user, Permission.VIEW_EMPLOYEES))
          return <HomeStack />;
        if (subScreen === 'PerformanceReview')
          return <PerformanceReviewScreen />;
        return <AnalyticsStack />;
      case 'Employees':
        if (!rbacService.hasPermission(user, Permission.VIEW_EMPLOYEES))
          return <HomeStack />;
        if (subScreen === 'AddEmployee')
          return (
            <AddEmployeeScreen route={mockRoute} navigation={mockNavigation} />
          );
        if (subScreen === 'EmployeeDetails')
          return (
            <EmployeeDetailsScreen
              route={mockRoute}
              navigation={mockNavigation}
            />
          );
        return <EmployeesStack />;
      case 'Claims':
        if (subScreen === 'AddClaim')
          return (
            <AddClaimScreen route={mockRoute} navigation={mockNavigation} />
          );
        if (subScreen === 'ClaimsList')
          return (
            <ClaimsListScreen route={mockRoute} navigation={mockNavigation} />
          );
        if (subScreen === 'ClaimDetails')
          return (
            <ClaimDetailsScreen route={mockRoute} navigation={mockNavigation} />
          );
        return <ClaimsStack />;
      case 'Invoices':
        if (subScreen === 'AddInvoice')
          return (
            <AddInvoiceScreen route={mockRoute} navigation={mockNavigation} />
          );
        return <InvoicesStack />;
      case 'Companies':
        if (!rbacService.hasPermission(user, Permission.MANAGE_COMPANY))
          return <HomeStack />;
        if (subScreen === 'AddCompany')
          return (
            <AddCompanyScreen route={mockRoute} navigation={mockNavigation} />
          );
        if (subScreen === 'OrgChart') return <OrgChartScreen />;
        return <CompanyStack />;
      case 'Teams':
        if (!rbacService.hasPermission(user, Permission.MANAGE_TEAMS))
          return <HomeStack />;
        if (subScreen === 'AddTeam')
          return (
            <AddTeamScreen route={mockRoute} navigation={mockNavigation} />
          );
        return <TeamListScreen />;
      case 'Departments':
        if (!rbacService.hasPermission(user, Permission.MANAGE_SETTINGS))
          return <HomeStack />;
        if (subScreen === 'AddDepartment')
          return (
            <AddDepartmentScreen
              route={mockRoute}
              navigation={mockNavigation}
            />
          );
        return <DepartmentListScreen />;
      case 'Services':
        if (!rbacService.hasPermission(user, Permission.MANAGE_SETTINGS))
          return <HomeStack />;
        if (subScreen === 'AddService')
          return (
            <AddServiceScreen route={mockRoute} navigation={mockNavigation} />
          );
        return <ServiceListScreen />;
      case 'Announcements':
        return <AnnouncementsScreen />;
      case 'Chat':
        return <CompanyChatScreen />;
      case 'Assistant':
        return <ChatBot />;
      case 'Language':
        return <LanguageSelectionScreen />;
      case 'ManageNotifications':
        if (
          !rbacService.isAdmin(user) &&
          !rbacService.isRH(user) &&
          !rbacService.isManager(user)
        )
          return <HomeStack />;
        return (
          <ManageNotificationsScreen
            route={mockRoute}
            navigation={mockNavigation}
          />
        );
      case 'CustomThemeColors':
        return <CustomThemeColorsScreen />;
      case 'Settings':
        // Personal Settings are available to all
        return <PersonalSettingsScreen />;
      case 'CompanySettings':
        if (!rbacService.hasPermission(user, Permission.MANAGE_SETTINGS))
          return <HomeStack />;
        if (subScreen === 'ManageDevices') return <ManageDevicesScreen />;
        if (subScreen === 'CustomThemeColors')
          return <CustomThemeColorsScreen />;
        if (subScreen === 'Departments') return <DepartmentStack />;
        if (subScreen === 'Services') return <ServiceStack />;
        if (subScreen === 'ManageCurrencies') return <ManageCurrenciesScreen />;
        return <CompanySettingsScreen />;
      case 'MyTeam':
        return <MyTeamScreen />;
      case 'Profile':
        if (subScreen === 'CareerHub') return <CareerHubScreen />;
        if (subScreen === 'ManageCurrencies') return <ManageCurrenciesScreen />;
        if (subScreen === 'MyTeam') return <MyTeamScreen />;
        if (subScreen === 'MyDevices') return <MyDevicesScreen />;
        return <ProfileStack />;
      default:
        return <HomeStack />;
    }
  };

  const sections = useNavigationSections();

  return (
    <WebNavigationContext.Provider value={contextValue}>
      {}
      <View
        style={
          [
            {
              flex: 1,
              backgroundColor: theme.colors.background,
              minHeight: Platform.OS === 'web' ? '100vh' : '100%',
              width: '100%',
            },
            !isMobile ? { flexDirection: 'row' } : { flexDirection: 'column' },
          ] as any
        }
      >
        {}

        {/* Desktop Sidebar OR Mobile Header */}
        {!isMobile ? (
          <View
            style={[
              webStyles.sidebar,
              {
                backgroundColor: theme.colors.surface,
                borderRightColor: theme.colors.border,
                borderRightWidth: 1,
              },
            ]}
          >
            {/* Brand */}
            <TouchableOpacity
              style={webStyles.sidebarBrand}
              onPress={() => setActiveTab('Home')}
            >
              <Image
                source={require('../../public/logo.png')}
                style={webStyles.sidebarLogo as any}
                resizeMode="contain"
              />
              <Text
                style={[webStyles.sidebarTitle, { color: theme.colors.text }]}
              >
                {t('home.appName')}
              </Text>
            </TouchableOpacity>

            <View style={{ padding: 16, gap: 12 }}>
              <TouchableOpacity
                style={[
                  webStyles.sidebarNavItem,
                  { backgroundColor: `${theme.colors.primary}10` },
                ]}
                onPress={() => setIsSearchVisible(true)}
              >
                <Text style={webStyles.navIcon}>🔍</Text>
                <Text
                  style={[webStyles.navLabel, { color: theme.colors.primary }]}
                >
                  {t('common.search')}
                </Text>
              </TouchableOpacity>
              <NotificationBell />
            </View>

            {/* Profile Section */}
            <View style={webStyles.sidebarProfile}>
              <View
                style={[
                  webStyles.profileAvatar,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={webStyles.avatarText}>
                  {user?.name?.charAt(0)}
                </Text>
              </View>
              <View style={webStyles.profileInfo}>
                <Text
                  style={[webStyles.profileName, { color: theme.colors.text }]}
                >
                  {user?.name}
                </Text>
                <Text
                  style={[
                    webStyles.profileRole,
                    { color: theme.colors.subText },
                  ]}
                >
                  {t(`roles.${user?.role}`)}
                </Text>
              </View>
            </View>

            {/* Nav Items with Sections */}
            <ScrollView style={webStyles.sidebarNav}>
              {sections.map(section => (
                <View key={section.title} style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setCollapsedSections(prev => ({
                        ...prev,
                        [section.title]: !prev[section.title],
                      }));
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingRight: 24,
                    }}
                  >
                    <Text
                      style={{
                        paddingLeft: 24,
                        marginBottom: 8,
                        marginTop: 8,
                        color: theme.colors.subText,
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      {section.title}
                    </Text>
                    <Text style={{ color: theme.colors.subText, fontSize: 12 }}>
                      {collapsedSections[section.title] ? '▼' : '▲'}
                    </Text>
                  </TouchableOpacity>
                  {!collapsedSections[section.title] &&
                    section.items.map(item => (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => setActiveTab(item.key)}
                        style={[
                          webStyles.sidebarNavItem,
                          activeTab === item.key && {
                            backgroundColor: `${theme.colors.primary}10`,
                            borderRightWidth: 3,
                            borderRightColor: theme.colors.primary,
                          },
                        ]}
                      >
                        <Text style={webStyles.navIcon}>{item.icon}</Text>
                        <Text
                          style={[
                            webStyles.navLabel,
                            {
                              color:
                                activeTab === item.key
                                  ? theme.colors.primary
                                  : theme.colors.text,
                              fontWeight:
                                activeTab === item.key ? 'bold' : 'normal',
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          /* Mobile Header */
          <GlassHeader
            title={
              activeTab !== 'Home'
                ? t(`navigation.${activeTab.toLowerCase()}`)
                : undefined
            }
            onMenuPress={() => setIsMenuOpen(true)}
            onSearchPress={() => setIsSearchVisible(true)}
          />
        )}

        {/* Main Content Area */}
        <View style={{ flex: 1 }}>
          {/* Back button for sub-screens (Internal) */}
          {subScreen && (
            <View
              style={[
                webStyles.subHeader,
                {
                  backgroundColor: theme.colors.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={webStyles.backButton}
                onPress={() => setSubScreen('')}
              >
                <Text
                  style={[
                    webStyles.backButtonText,
                    { color: theme.colors.primary },
                  ]}
                >
                  ← {t('common.back')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flex: 1, padding: isMobile ? 12 : 32 }}>
            {getActiveComponent()}
          </View>
        </View>

        {/* Mobile Menu Overlay */}
        {isMobile && isMenuOpen && (
          <View
            style={[
              webStyles.mobileMenuOverlay,
              { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 },
            ]}
          >
            <View
              style={[
                webStyles.mobileMenu,
                {
                  backgroundColor: theme.colors.surface,
                  borderRightWidth: 1,
                  borderRightColor: theme.colors.border,
                  height: height,
                  width: width < 375 ? width * 0.8 : 280,
                },
              ]}
            >
              <TouchableOpacity
                style={webStyles.closeButton}
                onPress={() => setIsMenuOpen(false)}
              >
                <Text
                  style={[
                    webStyles.closeButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>

              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <Image
                  source={require('../../public/logo.png')}
                  style={{ width: 50, height: 50, marginBottom: 10 }}
                  resizeMode="contain"
                />
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
                  {user?.name}
                </Text>
              </View>

              <ScrollView style={{ flex: 1 }}>
                {sections.map(section => (
                  <View key={section.title} style={{ marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setCollapsedSections(prev => ({
                          ...prev,
                          [section.title]: !prev[section.title],
                        }));
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingRight: 10,
                      }}
                    >
                      <Text
                        style={{
                          paddingLeft: 10,
                          marginBottom: 8,
                          marginTop: 8,
                          color: theme.colors.subText,
                          fontSize: 12,
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        {section.title}
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.subText,
                          fontSize: 12,
                          marginRight: 10,
                        }}
                      >
                        {collapsedSections[section.title] ? '▼' : '▲'}
                      </Text>
                    </TouchableOpacity>
                    {!collapsedSections[section.title] &&
                      section.items.map(item => (
                        <TouchableOpacity
                          key={item.key}
                          onPress={() => {
                            setActiveTab(item.key);
                            setIsMenuOpen(false);
                          }}
                          style={[
                            webStyles.mobileMenuItem,
                            activeTab === item.key && {
                              backgroundColor: `${theme.colors.primary}10`,
                              borderRadius: 8,
                              paddingLeft: 10,
                            },
                          ]}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                            }}
                          >
                            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color:
                                  activeTab === item.key
                                    ? theme.colors.primary
                                    : theme.colors.text,
                                fontWeight:
                                  activeTab === item.key ? 'bold' : 'normal',
                              }}
                            >
                              {item.label}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
      <SearchOverlay
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onSelect={handleSearchSelect}
      />
    </WebNavigationContext.Provider>
  );
};

// ======= Root Export =======
export const AppNavigator = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      primary: theme.colors.primary,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };

  React.useEffect(() => {
    if (Platform.OS === 'web') return;

    // Handles foreground events
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        const data = detail.notification.data;
        if (data.type === 'leave' && data.leaveId) {
          (navigationRef.current as any)?.navigate('Main', {
            screen: 'LeavesTab',
            params: {
              screen: 'LeaveDetails',
              params: { leaveId: parseInt(data.leaveId as string) },
            },
          });
        }
      }
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (user && user.status && user.status !== 'active') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 24, marginBottom: 16 }}>🚫</Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {user.status === 'pending' ? 'Account Pending' : 'Account Rejected'}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {user.status === 'pending'
            ? 'Your account is currently under review by the HR department. Please check back later.'
            : 'Your account access has been restricted. Please contact your manager.'}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
          onPress={() => signOut()}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
            {t('common.logout')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onStateChange={() => {
        sessionService.updateLastActivity();
      }}
    >
      {user ? (
        Platform.OS === 'web' ? (
          <WebNavigator />
        ) : (
          <DrawerNavigator />
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

// ======= Web Styles =======
const webStyles = StyleSheet.create({
  sidebar: {
    width: 260,

    height: '100vh' as any,

    position: 'sticky' as any,
    top: 0,
    paddingVertical: 24,
    ...Platform.select({
      web: {
        boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
      },
    }),
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 12,
  },
  sidebarLogo: {
    width: 40,
    height: 40,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sidebarProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
  },
  profileRole: {
    fontSize: 12,
  },
  sidebarNav: {
    flex: 1,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 4,
    gap: 16,
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 15,
  },
  mobileHeader: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  subHeader: {
    height: 56,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
  },
  hamburgerButton: {
    padding: 8,
  },
  hamburgerText: {
    fontSize: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  mobileMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mobileMenu: {
    width: 280,
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mobileMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  mobileMenuItemText: {
    fontSize: 17,
  },
});
