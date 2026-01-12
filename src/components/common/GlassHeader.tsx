import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { NotificationBell } from './NotificationBell';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface GlassHeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  onProfilePress?: () => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: Platform.OS === 'ios' ? 100 : 70,
      paddingTop: Platform.OS === 'ios' ? 40 : 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      zIndex: 100,
      backgroundColor:
        Platform.OS === 'web'
          ? theme.colors.surface + 'B3' // 70% opacity using theme surface
          : theme.colors.surface + 'E6', // 90% opacity
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '4D', // 30% opacity
      // Web Glassmorphism
      ...(Platform.OS === 'web' && {
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
      }),
      ...theme.shadows.small,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: Platform.OS === 'web' ? 18 : 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginLeft: Platform.OS === 'web' ? 8 : 12,
    },
    iconButton: {
      padding: 8,
      borderRadius: 12,
    },
    profileButton: {
      marginLeft: 8,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '33',
    },
    avatarText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
  });

export const GlassHeader = ({
  title,
  onMenuPress,
  onSearchPress,
  showBack,
  onBackPress,
  onProfilePress,
}: GlassHeaderProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {onMenuPress && (
          <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
            <Text style={{ fontSize: 24 }}>☰</Text>
          </TouchableOpacity>
        )}
        {showBack && (
          <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title || t('home.appName')}</Text>
      </View>

      <View style={styles.rightSection}>
        {onSearchPress && (
          <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
            <Text style={{ fontSize: 20 }}>🔍</Text>
          </TouchableOpacity>
        )}
        <NotificationBell />
        <TouchableOpacity
          style={[styles.iconButton, styles.profileButton]}
          onPress={onProfilePress}
          disabled={!onProfilePress}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? getInitials(user.name) : '??'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
