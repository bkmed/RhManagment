'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Bell, Camera, Calendar } from 'lucide-react-native'
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'
// import PushNotificationIOS from "@react-native-community/push-notification-ios"
import messaging from '@react-native-firebase/messaging'
import { Card } from '../ui/card'
import { Button } from '../ui/button'

interface PermissionsScreenProps {
  onComplete: () => void
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation()
  const [notificationsGranted, setNotificationsGranted] = useState(false)
  const [cameraGranted, setCameraGranted] = useState(false)
  const [calendarGranted, setCalendarGranted] = useState(false)

  useEffect(() => {
    // Check initial permission status
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      // Web permissions are handled differently
      return
    }

    // Check camera permission
    if (Platform.OS === 'ios') {
      const cameraStatus = await request(PERMISSIONS.IOS.CAMERA)
      setCameraGranted(cameraStatus === RESULTS.GRANTED)

      const calendarStatus = await request(PERMISSIONS.IOS.CALENDARS)
      setCalendarGranted(calendarStatus === RESULTS.GRANTED)
    } else if (Platform.OS === 'android') {
      const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA)
      setCameraGranted(cameraStatus === RESULTS.GRANTED)

      const calendarStatus = await request(PERMISSIONS.ANDROID.CALENDAR)
      setCalendarGranted(calendarStatus === RESULTS.GRANTED)
    }
  }

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'web') {
      // Web doesn't need explicit permission for notifications
      setNotificationsGranted(true)
      return
    }

    try {
      if (Platform.OS === 'ios') {
        // iOS
        // const authStatus = await PushNotificationIOS.requestPermissions()
        setNotificationsGranted(/* authStatus.alert ===  */ true)
      } else {
        // Android
        const authStatus = await messaging().requestPermission()
        setNotificationsGranted(
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
        )
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  const requestCameraPermission = async () => {
    if (Platform.OS === 'web') {
      // For web, we'll assume it's granted and handle it when actually using the camera
      setCameraGranted(true)
      return
    }

    try {
      const result =
        Platform.OS === 'ios'
          ? await request(PERMISSIONS.IOS.CAMERA)
          : await request(PERMISSIONS.ANDROID.CAMERA)

      setCameraGranted(result === RESULTS.GRANTED)
    } catch (error) {
      console.error('Error requesting camera permission:', error)
    }
  }

  const requestCalendarPermission = async () => {
    if (Platform.OS === 'web') {
      // For web, we'll assume it's granted and handle it when actually using the calendar
      setCalendarGranted(true)
      return
    }

    try {
      const result =
        Platform.OS === 'ios'
          ? await request(PERMISSIONS.IOS.CALENDARS)
          : await request(PERMISSIONS.ANDROID.CALENDAR)

      setCalendarGranted(result === RESULTS.GRANTED)
    } catch (error) {
      console.error('Error requesting calendar permission:', error)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.slide4.title')}</Text>
      <Text style={styles.description}>{t('onboarding.slide4.description')}</Text>

      <Card style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Bell size={24} color="#0070f3" />
          <Text style={styles.permissionTitle}>{t('settings.notifications')}</Text>
        </View>
        <Text style={styles.permissionDescription}>{t('onboarding.slide4.notifications')}</Text>
        <Button
          title={notificationsGranted ? t('settings.enabled') : t('onboarding.allow')}
          variant={notificationsGranted ? 'outline' : 'primary'}
          onPress={requestNotificationPermission}
          disabled={notificationsGranted}
          style={styles.permissionButton}
        />
      </Card>

      <Card style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Camera size={24} color="#0070f3" />
          <Text style={styles.permissionTitle}>{t('settings.camera')}</Text>
        </View>
        <Text style={styles.permissionDescription}>{t('onboarding.slide4.camera')}</Text>
        <Button
          title={cameraGranted ? t('settings.enabled') : t('onboarding.allow')}
          variant={cameraGranted ? 'outline' : 'primary'}
          onPress={requestCameraPermission}
          disabled={cameraGranted}
          style={styles.permissionButton}
        />
      </Card>

      <Card style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Calendar size={24} color="#0070f3" />
          <Text style={styles.permissionTitle}>{t('settings.calendar')}</Text>
        </View>
        <Text style={styles.permissionDescription}>{t('onboarding.slide4.calendar')}</Text>
        <Button
          title={calendarGranted ? t('settings.enabled') : t('onboarding.allow')}
          variant={calendarGranted ? 'outline' : 'primary'}
          onPress={requestCalendarPermission}
          disabled={calendarGranted}
          style={styles.permissionButton}
        />
      </Card>

      <View style={styles.buttonContainer}>
        <Button title={t('onboarding.getStarted')} onPress={onComplete} fullWidth />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 40,
  },
  description: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionCard: {
    padding: 20,
    marginBottom: 20,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#2d3748',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 15,
  },
  permissionButton: {
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 50 : 20,
  },
})
