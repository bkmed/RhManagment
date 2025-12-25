import React, { useState, useMemo, createContext } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
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
import { PayrollHistoryScreen } from '../screens/payroll/PayrollHistoryScreen';
import { LeaveListScreen } from '../screens/leaves/LeaveListScreen';
import { AddLeaveScreen } from '../screens/leaves/AddLeaveScreen';
import { LeaveDetailsScreen } from '../screens/leaves/LeaveDetailsScreen';
import { IllnessListScreen } from '../screens/illnesses/IllnessListScreen';
import { AddIllnessScreen } from '../screens/illnesses/AddIllnessScreen';
import { IllnessDetailsScreen } from '../screens/illnesses/IllnessDetailsScreen';
import { IllnessHistoryScreen } from '../screens/illnesses/IllnessHistoryScreen';
import { EmployeeListScreen } from '../screens/employees/EmployeeListScreen';
import { AddEmployeeScreen } from '../screens/employees/AddEmployeeScreen';
import { EmployeeDetailsScreen } from '../screens/employees/EmployeeDetailsScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { GlobalHistoryScreen } from '../screens/history/GlobalHistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';

enableScreens();

// ======= Web Navigation Context (avec subScreen) =======
export const WebNavigationContext = createContext({
  activeTab: 'Home',
  subScreen: '',
  screenParams: {} as any,
  setActiveTab: (tab: string, subScreen?: string, params?: any) => { },
});

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
      <Stack.Screen
        name="PayrollHistory"
        component={PayrollHistoryScreen}
        options={{ title: t('history.payrollHistory') }}
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
        name="LeaveDetails"
        component={LeaveDetailsScreen}
        options={{ title: t('leaves.details') }}
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

const HistoryStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GlobalHistory"
        component={GlobalHistoryScreen}
        options={{ title: t('navigation.history') }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);

// ======= Tabs (Mobile) =======
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeTab" component={HomeStack} />
    <Tab.Screen name="PayrollTab" component={PayrollStack} />
    <Tab.Screen name="LeavesTab" component={LeavesStack} />
  </Tab.Navigator>
);

// ======= Drawer (Mobile) =======
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
  <Drawer.Navigator screenOptions={{ headerShown: false }}>
    <Drawer.Screen name="Main" component={TabNavigator} />
    <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
    <Drawer.Screen name="Illnesses" component={IllnessesStack} />
    <Drawer.Screen name="Employees" component={EmployeesStack} />
    <Drawer.Screen name="History" component={HistoryStack} />
    <Drawer.Screen name="Profile" component={ProfileStack} />
  </Drawer.Navigator>
);

// ======= Web Navigator avec subScreen =======
const WebNavigator = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 1024;

  const [activeTab, setActiveTab] = useState('Home');
  const [subScreen, setSubScreen] = useState('');
  const [screenParams, setScreenParams] = useState<any>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        if (subScreen === 'PayrollHistory')
          return <PayrollHistoryScreen route={mockRoute} />;
        return <PayrollStack />;
      case 'Leaves':
        if (subScreen === 'AddLeave')
          return <AddLeaveScreen route={mockRoute} />;
        if (subScreen === 'LeaveDetails')
          return <LeaveDetailsScreen route={mockRoute} />;
        return <LeavesStack />;
      case 'Analytics':
        return <AnalyticsScreen />;
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
      case 'History':
        return <HistoryStack />;
      case 'Profile':
        return <ProfileStack />;
      default:
        return <HomeStack />;
    }
  };

  const navItems = [
    ['Home', t('navigation.home')],
    ['Payroll', t('navigation.payroll')],
    ['Leaves', t('navigation.leaves')],
    ['Analytics', t('navigation.analytics')],
    ['Illnesses', t('navigation.illnesses')],
    ['Employees', t('navigation.employees')],
    ['History', t('navigation.history') || 'History'],
    ['Profile', t('navigation.profile')],
  ];

  return (
    <WebNavigationContext.Provider value={contextValue}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Navbar */}
        <View
          style={[
            webStyles.navbar,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
              borderBottomWidth: 1,
            },
          ]}
        >
          <View style={webStyles.leftContainer}>
            {/* Brand */}
            <TouchableOpacity
              style={webStyles.brandContainer}
              onPress={() => setActiveTab('Home')}
            >
              <Image
                source={require('../../public/logo.png')}
                style={webStyles.logo}
                resizeMode="contain"
              />
              <Text style={[webStyles.title, { color: theme.colors.text }]}>
                {t('home.appName')}
              </Text>
            </TouchableOpacity>

            {/* Back Button (Desktop: visible, Mobile: only if subScreen) */}
            {subScreen && (
              <TouchableOpacity
                style={webStyles.backButton}
                onPress={() => setSubScreen('')}
              >
                <Text style={webStyles.backButtonText}>
                  ← {t('common.back')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Desktop Navigation */}
          {!isMobile && (
            <View style={webStyles.navButtons}>
              {navItems.map(([key, label]) => (
                <TouchableOpacity
                  key={key as string}
                  onPress={() => setActiveTab(key as string)}
                  style={webStyles.navButton}
                >
                  <Text
                    style={[
                      webStyles.navButtonText,
                      {
                        color:
                          activeTab === key
                            ? theme.colors.primary
                            : theme.colors.subText,
                      },
                      activeTab === key && webStyles.activeNavButton,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <TouchableOpacity
              style={webStyles.hamburgerButton}
              onPress={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Text
                style={[webStyles.hamburgerText, { color: theme.colors.text }]}
              >
                ☰
              </Text>
            </TouchableOpacity>
          )}
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
              {navItems.map(([key, label]) => (
                <TouchableOpacity
                  key={key as string}
                  onPress={() => {
                    setActiveTab(key as string);
                    setIsMenuOpen(false);
                  }}
                  style={webStyles.mobileMenuItem}
                >
                  <Text
                    style={[
                      webStyles.mobileMenuItemText,
                      {
                        color:
                          activeTab === key
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setIsMenuOpen(false)}
            />
          </View>
        )}

        {/* Content */}
        <View style={{ flex: 1 }}>{getActiveComponent()}</View>
      </View>
    </WebNavigationContext.Provider>
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
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
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
    </>
  );
};

// ======= Web Styles =======
const webStyles = StyleSheet.create({
  navbar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 3,
    zIndex: 10,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  navButtons: { flexDirection: 'row', gap: 20 },
  navButton: { paddingVertical: 8, paddingHorizontal: 16 },
  navButtonText: { fontSize: 16 },
  activeNavButton: { fontWeight: '600' },
  backButton: {
    marginLeft: 20,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hamburgerButton: {
    padding: 8,
  },
  hamburgerText: {
    fontSize: 24,
  },
  mobileMenuOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    flexDirection: 'row',
  },
  mobileMenu: {
    width: 250,
    height: '100%',
    backgroundColor: '#FFFFFF', // Default light, overridden by theme
    padding: 20,
    zIndex: 1001, // Ensure it sits above everything
    ...Platform.select({
      web: {
        boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mobileMenuItem: {
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  mobileMenuItemText: {
    fontSize: 18,
  },
});
