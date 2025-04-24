"use client"

import React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Platform } from "react-native"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser } from "../../redux/slices/authSlice"
import { setLanguage, setTheme } from "../../redux/slices/uiSlice"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Globe, Bell, Camera, Moon, Info, LogOut, ChevronRight } from "lucide-react-native"
import type { AppDispatch, RootState } from "../../redux/store"
import { LanguageSelector } from "./language-selector"
import { request, PERMISSIONS, RESULTS, check } from "react-native-permissions"

interface SettingsScreenProps {
  onNavigate?: (screen: string) => void
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { theme, language } = useSelector((state: RootState) => state.ui)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  // Permission states
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [cameraAccess, setCameraAccess] = useState(true)
  const [calendarAccess, setCalendarAccess] = useState(true)
  const [storageAccess, setStorageAccess] = useState(true)
  const [darkMode, setDarkMode] = useState(theme === "dark")

  // Check permissions on component mount
  React.useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    if (Platform.OS === "web") return

    try {
      // Check camera permission
      if (Platform.OS === "ios") {
        const cameraStatus = await check(PERMISSIONS.IOS.CAMERA)
        setCameraAccess(cameraStatus === RESULTS.GRANTED)

        const calendarStatus = await check(PERMISSIONS.IOS.CALENDARS)
        setCalendarAccess(calendarStatus === RESULTS.GRANTED)
      } else if (Platform.OS === "android") {
        const cameraStatus = await check(PERMISSIONS.ANDROID.CAMERA)
        setCameraAccess(cameraStatus === RESULTS.GRANTED)

        const calendarStatus = await check(PERMISSIONS.ANDROID.CALENDAR)
        setCalendarAccess(calendarStatus === RESULTS.GRANTED)
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
    }
  }

  const handleRequestCameraPermission = async () => {
    if (Platform.OS === "web") {
      setCameraAccess(true)
      return
    }

    try {
      const result =
        Platform.OS === "ios" ? await request(PERMISSIONS.IOS.CAMERA) : await request(PERMISSIONS.ANDROID.CAMERA)

      setCameraAccess(result === RESULTS.GRANTED)
    } catch (error) {
      console.error("Error requesting camera permission:", error)
    }
  }

  const handleRequestCalendarPermission = async () => {
    if (Platform.OS === "web") {
      setCalendarAccess(true)
      return
    }

    try {
      const result =
        Platform.OS === "ios" ? await request(PERMISSIONS.IOS.CALENDARS) : await request(PERMISSIONS.ANDROID.CALENDAR)

      setCalendarAccess(result === RESULTS.GRANTED)
    } catch (error) {
      console.error("Error requesting calendar permission:", error)
    }
  }

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (confirm(t("settings.logoutConfirm"))) {
        dispatch(logoutUser())
      }
    } else {
      Alert.alert(
        t("settings.logout"),
        t("settings.logoutConfirm"),
        [
          { text: t("settings.no"), style: "cancel" },
          { text: t("settings.yes"), onPress: () => dispatch(logoutUser()) },
        ],
        { cancelable: true },
      )
    }
  }

  const handleLanguageChange = (lang: string) => {
    dispatch(setLanguage(lang))
    setShowLanguageSelector(false)
  }

  const handleThemeChange = (value: boolean) => {
    setDarkMode(value)
    dispatch(setTheme(value ? "dark" : "light"))
  }

  if (showLanguageSelector) {
    return (
      <LanguageSelector
        currentLanguage={language}
        onSelectLanguage={handleLanguageChange}
        onCancel={() => setShowLanguageSelector(false)}
      />
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("settings.settings")}</Text>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Globe size={20} color="#4a5568" />
          <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>{t("settings.language")}</Text>
          <Button
            title={t(`settings.${language}`)}
            variant="outline"
            rightIcon={<ChevronRight size={16} color="#718096" />}
            onPress={() => setShowLanguageSelector(true)}
            style={styles.settingButton}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#4a5568" />
          <Text style={styles.sectionTitle}>{t("settings.notifications")}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>{t("settings.pushNotifications")}</Text>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: "#cbd5e0", true: "#0070f3" }}
          />
        </View>
        <Separator style={styles.separator} />
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>{t("settings.emailNotifications")}</Text>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: "#cbd5e0", true: "#0070f3" }}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Camera size={20} color="#4a5568" />
          <Text style={styles.sectionTitle}>{t("settings.permissions")}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>{t("settings.cameraAccess")}</Text>
          <Switch
            value={cameraAccess}
            onValueChange={handleRequestCameraPermission}
            trackColor={{ false: "#cbd5e0", true: "#0070f3" }}
          />
        </View>
        <Separator style={styles.separator} />
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>{t("settings.calendarAccess")}</Text>
          <Switch
            value={calendarAccess}
            onValueChange={handleRequestCalendarPermission}
            trackColor={{ false: "#cbd5e0", true: "#0070f3" }}
          />
        </View>
        <Separator style={styles.separator} />
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>{t("settings.storageAccess")}</Text>
          <Switch
            value={storageAccess}
            onValueChange={setStorageAccess}
            trackColor={{ false: "#cbd5e0", true: "#0070f3" }}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Moon size={20} color="#4a5568" />
          <Text style={styles.sectionTitle}>{t("settings.darkMode")}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>{t("settings.darkMode")}</Text>
          <Switch
            value={darkMode}
            onValueChange={handleThemeChange}
            trackColor={{ false: "#cbd5e0", true: "#0070f3" }}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Info size={20} color="#4a5568" />
          <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>{t("settings.version")}</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </Card>

      <Button
        title={t("settings.logout")}
        leftIcon={<LogOut size={16} color="#fff" />}
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutButton}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3748",
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#2d3748",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: "#4a5568",
  },
  settingValue: {
    fontSize: 16,
    color: "#718096",
  },
  settingButton: {
    height: 36,
  },
  separator: {
    marginVertical: 8,
  },
  logoutButton: {
    marginVertical: 24,
  },
})
