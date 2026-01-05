import React, { useState, useMemo, createContext, useRef } from 'react';
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
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { PayrollListScreen } from '../screens/payroll/PayrollListScreen';
import { AddPayrollScreen } from '../screens/payroll/AddPayrollScreen';
import { PayrollDetailsScreen } from '../screens/payroll/PayrollDetailsScreen';
import { LeaveListScreen } from '../screens/leaves/LeaveListScreen';
import { AddLeaveScreen } from '../screens/leaves/AddLeaveScreen';
import { LeaveDetailsScreen } from '../screens/leaves/LeaveDetailsScreen';
import { LeaveApprovalListScreen } from '../screens/leaves/LeaveApprovalListScreen';
import { IllnessListScreen } from '../screens/illnesses/IllnessListScreen';
import { AddIllnessScreen } from '../screens/illnesses/AddIllnessScreen';
import { IllnessDetailsScreen } from '../screens/illnesses/IllnessDetailsScreen';
import { IllnessHistoryScreen } from '../screens/illnesses/IllnessHistoryScreen';
import { EmployeeListScreen } from '../screens/employees/EmployeeListScreen';
import { AddEmployeeScreen } from '../screens/employees/AddEmployeeScreen';
import { EmployeeDetailsScreen } from '../screens/employees/EmployeeDetailsScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ManageServicesScreen } from '../screens/profile/ManageServicesScreen';
import { ManageCurrenciesScreen } from '../screens/profile/ManageCurrenciesScreen';
import { ManageDepartmentsScreen } from '../screens/profile/ManageDepartmentsScreen';
import { MyTeamScreen } from '../screens/teams/MyTeamScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { RemoteCalendarScreen } from '../screens/remote/RemoteCalendarScreen';
import { AddClaimScreen } from '../screens/claims/AddClaimScreen';
import { ClaimsListScreen } from '../screens/claims/ClaimsListScreen';
import { ClaimDetailsScreen } from '../screens/claims/ClaimDetailsScreen';
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
import { OrgChartScreen } from '../screens/companies/OrgChartScreen';
import { AnnouncementsScreen } from '../screens/home/AnnouncementsScreen';
import { PersonalSettingsScreen } from '../screens/settings/PersonalSettingsScreen';
import { CompanySettingsScreen } from '../screens/settings/CompanySettingsScreen';
import { ChatScreen } from '../screens/home/ChatScreen';
import { CompanyChatScreen } from '../screens/chat/CompanyChatScreen';
import { NotificationBell } from '../components/common/NotificationBell';
import { SearchOverlay } from '../components/common/SearchOverlay';
import { ChatBot } from '../components/common/ChatBot';
import { AuthProvider, useAuth } from '../context/AuthContext';

enableScreens();

import { WebNavigationContext } from './WebNavigationContext';

// ======= Stacks =======
const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const { t } = useTranslation();
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
  return (
    <Stack.Navigator>
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
  return (
    <Stack.Navigator>
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
    </Stack.Navigator>
  );
};

const IllnessesStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
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
  return (
    <Stack.Navigator>
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
  return (
    <Stack.Navigator>
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
    </Stack.Navigator>
  );
};


const ClaimsStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
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

const CompanyStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
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
  return (
    <Stack.Navigator>
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
  return (
    <Stack.Navigator>
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
  return (
    <Stack.Navigator>
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


const ProfileStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen
        name="CareerHub"
        component={CareerHubScreen}
        options={{ headerShown: true, title: t('navigation.careerHub') }}
      />
      <Stack.Screen
        name="ManageCurrencies"
        component={ManageCurrenciesScreen}
        options={{ headerShown: true, title: t('payroll.currency') || 'Currencies' }}
      />
      <Stack.Screen
        name="MyTeam"
        component={MyTeamScreen}
        options={{ headerShown: true, title: t('teams.myTeam') || 'My Team' }}
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
  </Stack.Navigator>
);

// ======= Tabs (Mobile) =======
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeTab" component={HomeStack} />
    <Tab.Screen name="PayrollTab" component={PayrollStack} />
    <Tab.Screen name="LeavesTab" component={LeavesStack} />
    <Tab.Screen name="ClaimsTab" component={ClaimsStack} options={{ title: 'Claims' }} />
    <Tab.Screen name="ChatTab" component={CompanyChatScreen} options={{ title: 'Chat' }} />
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
        items: [{ key: 'Home', label: t('navigation.home'), icon: '🏠' }]
      },
      {
        title: t('sections.management'),
        items: [
          { key: 'Payroll', label: t('navigation.payroll'), icon: '💰' },
          { key: 'Leaves', label: t('navigation.leaves'), icon: '🏖️' },
          { key: 'Claims', label: t('navigation.claims'), icon: '📝' },
          { key: 'Remote', label: t('remote.title'), icon: '📅' }
        ]
      },
    ];

    const organizationItems = [];
    if (user?.role !== 'employee') {
      organizationItems.push({ key: 'Employees', label: t('navigation.employees'), icon: '👥' });
    }
    if (user?.role === 'admin') {
      organizationItems.push({ key: 'Companies', label: t('navigation.companies'), icon: '🏢' });
      organizationItems.push({ key: 'Teams', label: t('navigation.teams'), icon: '🤝' });
      organizationItems.push({ key: 'Departments', label: t('navigation.departments'), icon: '🏛️' });
      organizationItems.push({ key: 'Services', label: t('navigation.services'), icon: '⚙️' });
    }

    if (organizationItems.length > 0) {
      sections.push({
        title: t('sections.organization'),
        items: organizationItems
      });
    }

    if (user?.role !== 'employee') {
      sections.push({
        title: t('sections.analytics'),
        items: [
          { key: 'Analytics', label: t('navigation.analytics'), icon: '📊' },
          { key: 'Illnesses', label: t('navigation.illnesses'), icon: '🏥' }
        ]
      });
    }

    sections.push({
      title: t('sections.communication'),
      items: [
        { key: 'Announcements', label: t('navigation.announcements'), icon: '📢' },
        { key: 'Chat', label: t('navigation.chat'), icon: '💬' }
      ]
    });

    sections.push({
      title: t('sections.personal'),
      items: [
        { key: 'Profile', label: t('navigation.profile'), icon: '👤' },
        { key: 'Settings', label: t('navigation.settings'), icon: '⚙️' }
      ]
    });

    return sections;
  }, [t, user?.role]);
};

const CustomDrawerContent = (props: any) => {
  const { user } = useAuth();
  const { theme, themeMode } = useTheme();
  const { t } = useTranslation();
  const { state, navigation } = props;
  const sections = useNavigationSections();
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <View style={{
        padding: 24,
        paddingTop: 60,
        backgroundColor: theme.colors.primary,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 12,
        ...theme.shadows.medium,
        ...(themeMode === 'premium' && {
          borderBottomWidth: 1,
          borderBottomColor: '#FFD700',
        })
      }}>
        <Image
          source={require('../../public/logo.png')}
          style={{ width: 60, height: 60, tintColor: themeMode === 'premium' ? theme.colors.background : '#FFF', marginBottom: 16 }}
          resizeMode="contain"
        />
        <Text style={{ color: themeMode === 'premium' ? theme.colors.background : '#FFF', fontSize: 20, fontWeight: 'bold' }}>{user?.name}</Text>
        <Text style={{ color: themeMode === 'premium' ? 'rgba(11,13,23,0.8)' : 'rgba(255,255,255,0.8)', fontSize: 14 }}>{t(`roles.${user?.role}`)}</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {sections.map((section, index) => (
          <View key={section.title} style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => toggleSection(section.title)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 }}
            >
              <Text style={{
                marginLeft: 16,
                marginTop: 8,
                marginBottom: 4,
                color: theme.colors.subText,
                fontWeight: '600',
                fontSize: 12,
                textTransform: 'uppercase'
              }}>
                {section.title}
              </Text>
              <Text style={{ color: theme.colors.subText, fontSize: 12 }}>
                {collapsedSections[section.title] ? '▼' : '▲'}
              </Text>
            </TouchableOpacity>

            {!collapsedSections[section.title] && section.items.map((item) => {
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
                    backgroundColor: isFocused ? `${theme.colors.primary}15` : 'transparent',
                    ...(isFocused && themeMode === 'premium' && {
                      borderWidth: 1,
                      borderColor: theme.colors.primary,
                    })
                  }}
                  onPress={() => navigation.navigate(item.key)}
                >
                  <Text style={{ fontSize: 20, marginRight: 16 }}>{item.icon}</Text>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: isFocused ? '700' : '500',
                    color: isFocused ? theme.colors.primary : theme.colors.text
                  }}>
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
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Main" component={TabNavigator} />
      <Drawer.Screen name="Analytics" component={AnalyticsStack} />
      <Drawer.Screen name="Illnesses" component={IllnessesStack} />
      <Drawer.Screen name="Employees" component={EmployeesStack} />
      <Drawer.Screen name="Companies" component={CompanyStack} />
      <Drawer.Screen name="Teams" component={TeamStack} />
      <Drawer.Screen name="Departments" component={DepartmentStack} />
      <Drawer.Screen name="Services" component={ServiceStack} />
      <Drawer.Screen name="Remote" component={RemoteCalendarScreen} />
      <Drawer.Screen name="Claims" component={ClaimsStack} />
      <Drawer.Screen name="Profile" component={ProfileStack} />
      <Drawer.Screen name="Settings" component={SettingsStack} />
      <Drawer.Screen name="Announcements" component={AnnouncementsScreen} />
      <Drawer.Screen name="Chat" component={CompanyChatScreen} />
      {/* Map other screens if needed, ensuring names match keys */}
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Payroll" component={PayrollStack} />
      <Drawer.Screen name="Leaves" component={LeavesStack} />
    </Drawer.Navigator>
  );
};

// ======= Web Navigator avec subScreen =======
const WebNavigator = () => {
  const { t } = useTranslation();
  const { theme, themeMode } = useTheme();
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 1024;

  const [activeTab, setActiveTab] = useState('Home');
  const [subScreen, setSubScreen] = useState('');
  const [screenParams, setScreenParams] = useState<any>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({});
  const scrollViewRef = useRef<any>(null);

  const contextValue = useMemo(
    () => ({
      activeTab,
      subScreen,
      screenParams,
      setActiveTab: (tab: string, screen?: string, params?: any) => {
        setActiveTab(tab);
        setSubScreen(screen || '');
        setScreenParams(params || {});
        setIsMenuOpen(false); // Close menu on navigation
      },
    }),
    [activeTab, subScreen, screenParams],
  );

  const handleSearchSelect = (result: any) => {
    setIsSearchVisible(false);
    if (result.type === 'employee') {
      contextValue.setActiveTab('Employees', 'EmployeeDetails', { id: Number(result.id) });
    } else if (result.type === 'team') {
      contextValue.setActiveTab('Teams');
    } else if (result.type === 'announcement') {
      setActiveTab('Announcements');
    }
  };
  const getActiveComponent = () => {
    // Create a mock route object for web screens
    const mockRoute = { params: screenParams };

    switch (activeTab) {
      case 'Home':
        return <HomeStack />;
      case 'Payroll':
        if (subScreen === 'AddPayroll')
          return <AddPayrollScreen route={mockRoute} />;
        if (subScreen === 'PayrollDetails')
          return <PayrollDetailsScreen route={mockRoute} />;
        return <PayrollStack />;
      case 'Leaves':
        if (subScreen === 'AddLeave')
          return <AddLeaveScreen route={mockRoute} />;
        if (subScreen === 'LeaveDetails')
          return <LeaveDetailsScreen route={mockRoute} />;
        if (subScreen === 'LeaveApprovalList')
          return <LeaveApprovalListScreen />;
        if (subScreen === 'TeamVacations')
          return <TeamVacationsScreen />;
        return <LeavesStack />;
      case 'Remote':
        return <RemoteCalendarScreen />;
      case 'Analytics':
        if (subScreen === 'PerformanceReview')
          return <PerformanceReviewScreen />;
        return <AnalyticsStack />;
      case 'Illnesses':
        if (subScreen === 'AddIllness')
          return <AddIllnessScreen route={mockRoute} />;
        if (subScreen === 'IllnessDetails')
          return <IllnessDetailsScreen route={mockRoute} />;
        if (subScreen === 'IllnessHistory')
          return <IllnessHistoryScreen route={mockRoute} />;
        return <IllnessesStack />;
      case 'Employees':
        if (subScreen === 'AddEmployee')
          return <AddEmployeeScreen route={mockRoute} />;
        if (subScreen === 'EmployeeDetails')
          return <EmployeeDetailsScreen route={mockRoute} />;
        return <EmployeesStack />;
      case 'Claims':
        if (subScreen === 'AddClaim') return <AddClaimScreen route={mockRoute} />;
        if (subScreen === 'ClaimDetails') return <ClaimDetailsScreen route={mockRoute} />;
        return <ClaimsStack />;
      case 'Companies':
        if (subScreen === 'AddCompany')
          return <AddCompanyScreen route={mockRoute} />;
        if (subScreen === 'OrgChart')
          return <OrgChartScreen />;
        return <CompanyStack />;
      case 'Teams':
        if (subScreen === 'AddTeam')
          return <AddTeamScreen route={mockRoute} />;
        return <TeamListScreen />;
      case 'Departments':
        if (subScreen === 'AddDepartment')
          return <AddDepartmentScreen route={mockRoute} />;
        return <DepartmentListScreen />;
      case 'Services':
        if (subScreen === 'AddService')
          return <AddServiceScreen route={mockRoute} />;
        return <ServiceListScreen />;
      case 'Announcements':
        return <AnnouncementsScreen />;
      case 'Chat':
        return <CompanyChatScreen />;
      case 'Settings':
        if (subScreen === 'CompanySettings')
          return <CompanySettingsScreen />;
        return <PersonalSettingsScreen />;
      case 'Profile':
        if (subScreen === 'CareerHub')
          return <CareerHubScreen />;
        if (subScreen === 'ManageCurrencies')
          return <ManageCurrenciesScreen />;
        if (subScreen === 'MyTeam')
          return <MyTeamScreen />;
        return <ProfileStack />;
      default:
        return <HomeStack />;
    }
  };

  const sections = useNavigationSections();

  return (
    <WebNavigationContext.Provider value={contextValue}>
      <View style={[
        { flex: 1, backgroundColor: theme.colors.background },
        !isMobile && { flexDirection: 'row' }
      ] as any}>

        {/* Desktop Sidebar OR Mobile Header */}
        {!isMobile ? (
          <View style={[
            webStyles.sidebar,
            {
              backgroundColor: theme.colors.surface,
              borderRightColor: theme.colors.border,
              borderRightWidth: 1,
            }
          ]}>
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
              <Text style={[webStyles.sidebarTitle, { color: theme.colors.text }]}>
                {t('home.appName')}
              </Text>
            </TouchableOpacity>

            <View style={{ padding: 16, gap: 12 }}>
              <TouchableOpacity
                style={[webStyles.sidebarNavItem, { backgroundColor: `${theme.colors.primary}10` }]}
                onPress={() => setIsSearchVisible(true)}
              >
                <Text style={webStyles.navIcon}>🔍</Text>
                <Text style={[webStyles.navLabel, { color: theme.colors.primary }]}>{t('common.search')}</Text>
              </TouchableOpacity>
              <NotificationBell />
            </View>

            {/* Profile Section */}
            <View style={webStyles.sidebarProfile}>
              <View style={[webStyles.profileAvatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={webStyles.avatarText}>{user?.name?.charAt(0)}</Text>
              </View>
              <View style={webStyles.profileInfo}>
                <Text style={[webStyles.profileName, { color: theme.colors.text }]}>{user?.name}</Text>
                <Text style={[webStyles.profileRole, { color: theme.colors.subText }]}>{t(`roles.${user?.role}`)}</Text>
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
                        [section.title]: !prev[section.title]
                      }));
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}
                  >
                    <Text style={{
                      paddingLeft: 24,
                      marginBottom: 8,
                      marginTop: 8,
                      color: theme.colors.subText,
                      fontSize: 12,
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {section.title}
                    </Text>
                    <Text style={{ color: theme.colors.subText, fontSize: 12 }}>
                      {collapsedSections[section.title] ? '▼' : '▲'}
                    </Text>
                  </TouchableOpacity>
                  {!collapsedSections[section.title] && section.items.map((item) => (
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
                      <Text
                        style={[
                          webStyles.navIcon,
                          activeTab === item.key && { color: theme.colors.primary },
                        ]}
                      >
                        {item.icon}
                      </Text>
                      <Text
                        style={[
                          webStyles.navLabel,
                          {
                            color:
                              activeTab === item.key
                                ? theme.colors.primary
                                : theme.colors.text,
                            fontWeight: activeTab === item.key ? '700' : '500',
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
          <View
            style={[
              webStyles.mobileHeader,
              {
                backgroundColor: theme.colors.surface,
                borderBottomColor: theme.colors.border,
                borderBottomWidth: 1,
              },
            ]}
          >
            <TouchableOpacity
              style={webStyles.brandContainer}
              onPress={() => setActiveTab('Home')}
            >
              <Image
                source={require('../../public/logo.png')}
                style={webStyles.logo as any}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 16 }}>
              <TouchableOpacity onPress={() => setIsSearchVisible(true)}>
                <Text style={{ fontSize: 20 }}>🔍</Text>
              </TouchableOpacity>
              <NotificationBell />
              <TouchableOpacity
                style={webStyles.hamburgerButton}
                onPress={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Text style={[webStyles.hamburgerText, { color: theme.colors.text }]}>
                  ☰
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main Content Area */}
        <View style={{ flex: 1 }}>
          {/* Back button for sub-screens (Internal) */}
          {subScreen && (
            <View style={[webStyles.subHeader, { backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity
                style={webStyles.backButton}
                onPress={() => setSubScreen('')}
              >
                <Text style={[webStyles.backButtonText, { color: theme.colors.primary }]}>
                  ← {t('common.back')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: isMobile ? 12 : 32 }}
          >
            {getActiveComponent()}
          </ScrollView>
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
                  backgroundColor: theme.colors.surface, // Solid color from theme
                  borderRightWidth: 1,
                  borderRightColor: theme.colors.border,
                  height: height,
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
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{user?.name}</Text>
              </View>

              <ScrollView style={{ flex: 1 }}>
                {sections.map(section => (
                  <View key={section.title} style={{ marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setCollapsedSections(prev => ({
                          ...prev,
                          [section.title]: !prev[section.title]
                        }));
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 }}
                    >
                      <Text style={{
                        paddingLeft: 10,
                        marginBottom: 8,
                        marginTop: 8,
                        color: theme.colors.subText,
                        fontSize: 12,
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {section.title}
                      </Text>
                      <Text style={{ color: theme.colors.subText, fontSize: 12, marginRight: 10 }}>
                        {collapsedSections[section.title] ? '▼' : '▲'}
                      </Text>
                    </TouchableOpacity>
                    {!collapsedSections[section.title] && section.items.map((item) => (
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
                          }
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                          <Text style={{
                            fontSize: 16,
                            color: activeTab === item.key ? theme.colors.primary : theme.colors.text,
                            fontWeight: activeTab === item.key ? 'bold' : 'normal'
                          }}>
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

      </View >
      <SearchOverlay
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onSelect={handleSearchSelect}
      />
    </WebNavigationContext.Provider >
  );
};

// ======= Root Export =======
export const AppNavigator = () => {
  const linking: LinkingOptions<any> = {
    prefixes: [
      'http://localhost:8080',
      'rhmanagement://',
      'https://bkmed.github.io/RhManagement/',
    ],
    config: { screens: {} },
  };

  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <>
      {!user ? (
        <AuthStack />
      ) : Platform.OS === 'web' ? (
        <WebNavigator />
      ) : (
        <DrawerNavigator />
      )}
      <ChatBot />
    </>
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
      }
    })
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
