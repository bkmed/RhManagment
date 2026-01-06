import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../services/offlineService';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

export const OfflineIndicator = () => {
  const { isOffline } = useNetworkStatus();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
  useEffect(() => {
    if (isOffline) {
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: isNative,
      }).start();
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: isNative,
      }).start();
    }
  }, [isOffline, slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.warning || '#FF9500',
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{t('offline.noConnection')}</Text>
    </Animated.View>
  );
};

const createStyles = (theme: Theme, insets: any) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: insets.top,
      left: 0,
      right: 0,
      zIndex: 9999,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      ...theme.shadows.medium,
    },
    icon: {
      fontSize: 18,
      marginRight: 8,
    },
    text: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });
