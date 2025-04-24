"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { View, Text } from "react-native"
import { Home, User, Calendar, DollarSign, Users, Bell, Settings } from "lucide-react-native"
import { useDispatch, useSelector } from "react-redux"

import { ReduxProvider } from "../../packages/core/src/redux/provider"
import { fetchCurrentUser } from "../../packages/core/src/redux/slices/authSlice"
import type { AppDispatch, RootState } from "../../packages/core/src/redux/store"

import { LoginScreen } from "../../packages/auth/src/components/login-screen"
import { RegisterScreen } from "../../packages/auth/src/components/register-screen"
import { ForgotPasswordScreen } from "../../packages/auth/src/components/forgot-password-screen"
import { DashboardRouter } from "../../packages/core/src/components/dashboards/dashboard-router"
import { EmployeeProfile } from "../../packages/employees/src/components/employee-profile"
import { PayslipList } from "../../packages/payroll/src/components/payslip-list"
import { NotificationCenter } from "../../packages/notifications/src/components/notification-center"
import { ErrorOffline } from "../../packages/core/src/components/error-pages/error-offline"
import { EmployeesList } from "../../packages/employees/src/components/employees-list"
import { OnboardingScreen } from "../../packages/core/src/components/onboarding/onboarding-screen"
import { SplashScreen } from "../../packages/core/src/components/splash-screen"
import { initAppServices, setUserData, trackScreen } from "../services/app-services"

// Stack navigators
const AuthStack = createStackNavigator()
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login">
      {(props) => (
        <LoginScreen
          onRegisterPress={() => props.navigation.navigate("Register")}
          onForgotPasswordPress={() => props.navigation.navigate("ForgotPassword")}
        />
      )}
    </AuthStack.Screen>
    <AuthStack.Screen name="Register">
      {(props) => <RegisterScreen onLoginPress={() => props.navigation.navigate("Login")} />}
    </AuthStack.Screen>
    <AuthStack.Screen name="ForgotPassword">
      {(props) => <ForgotPasswordScreen onBackToLogin={() => props.navigation.navigate("Login")} />}
    </AuthStack.Screen>
  </AuthStack.Navigator>
)

// Tab navigator
const Tab = createBottomTabNavigator()
const TabNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const { isConnected } = useSelector((state: RootState) => state.network)
  const { onboardingComplete } = useSelector((state: RootState) => state.ui)

  // Track screen views
  useEffect(() => {
    const unsubscribe = Tab.addListener("state", (e) => {
      const currentRouteName = e.data.state.routes[e.data.state.index].name
      trackScreen(currentRouteName)
    })

    return unsubscribe
  }, [])

  if (!isConnected) {
    return <ErrorOffline onRetry={() => {}} />
  }

  if (!user) {
    return <AuthNavigator />
  }

  if (!onboardingComplete) {
    return <OnboardingScreen onComplete={() => {}} />
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon

          if (route.name === "Dashboard") {
            icon = <Home size={size} color={color} />
          } else if (route.name === "Profile") {
            icon = <User size={size} color={color} />
          } else if (route.name === "Calendar") {
            icon = <Calendar size={size} color={color} />
          } else if (route.name === "Payroll") {
            icon = <DollarSign size={size} color={color} />
          } else if (route.name === "Employees") {
            icon = <Users size={size} color={color} />
          } else if (route.name === "Notifications") {
            icon = <Bell size={size} color={color} />
          } else if (route.name === "Settings") {
            icon = <Settings size={size} color={color} />
          }

          return icon
        },
      })}
    >
      <Tab.Screen name="Dashboard">
        {(props) => <DashboardRouter onNavigate={(screen, params) => props.navigation.navigate(screen, params)} />}
      </Tab.Screen>
      <Tab.Screen name="Profile" component={EmployeeProfile} />
      <Tab.Screen name="Calendar" component={Calendar} />
      <Tab.Screen name="Payroll">
        {() => <PayslipList user={user} onViewPayslip={(payslip) => console.log("View payslip", payslip)} />}
      </Tab.Screen>
      {(user.role === "admin" || user.role === "advisor") && <Tab.Screen name="Employees" component={EmployeesList} />}
      <Tab.Screen name="Notifications">{() => <NotificationCenter userId={user.uid} />}</Tab.Screen>
      {user.role === "admin" && <Tab.Screen name="Settings" component={Settings} />}
    </Tab.Navigator>
  )
}

// Main app navigator
const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth)
  const { isConnected } = useSelector((state: RootState) => state.network)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Initialize app services
    initAppServices()

    dispatch(fetchCurrentUser())
  }, [dispatch])

  // Set user data for analytics and error tracking
  useEffect(() => {
    setUserData(user)
  }, [user])

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer
      fallback={<Text>Loading...</Text>}
      onUnhandledAction={() => {}}
      onStateChange={(state) => {
        const currentRouteName = state?.routes[state.index]?.name
        if (currentRouteName) {
          trackScreen(currentRouteName)
        }
      }}
    >
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}

// Root component with Redux provider
const App = () => {
  return (
    <ReduxProvider>
      <AppNavigator />
    </ReduxProvider>
  )
}

export default App
